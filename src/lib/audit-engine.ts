/**
 * Marevo audit rules engine.
 *
 * Deterministic auditing of demurrage & detention charges against contract
 * terms, terminal timestamps, and regulatory requirements. All date and rate
 * arithmetic lives HERE, in plain TypeScript — never in an LLM. The LLM's
 * only roles elsewhere in the pipeline are document field extraction and
 * phrasing the dispute letter from these findings.
 */

export type RateTier = { days: string; rate: number }; // days e.g. "1-3", "4-7", "8+"

export type ContractTerms = {
  carrier: string;
  freeTimeDays: number;
  rateTiers: RateTier[];
  excludeWeekends: boolean;
  holidayDates: string[]; // ISO dates excluded by contract/tariff
};

export type ShipmentFacts = {
  containerNo: string;
  dischargedAt: string | null; // when the clock could earliest start
  availableAt: string | null; // terminal availability (authoritative clock start)
  gateOutAt: string | null;
  emptyReturnedAt: string | null;
};

export type InvoiceFacts = {
  invoiceNo: string;
  carrier: string;
  issuedAt: string | null;
  chargesStoppedAt: string | null; // when charges stopped accruing (for FMC 30-day rule)
  billedDays: number;
  billedFrom: string | null;
  billedAmount: number;
  lineItems: { desc: string; amount: number }[];
};

export type Finding = {
  code: string;
  severity: "disputable" | "formal" | "info";
  explanation: string;
  overchargeEstimate: number;
};

export type AuditResult = {
  status: "clean" | "disputable" | "needs_review";
  findings: Finding[];
  disputableAmount: number;
  narrative: string;
};

const DAY_MS = 86400000;

function parseDate(d: string | null): Date | null {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

function isHoliday(d: Date, holidays: string[]): boolean {
  const iso = d.toISOString().slice(0, 10);
  return holidays.includes(iso);
}

/** Count chargeable days between start (exclusive of free time) and end. */
export function chargeableDays(
  clockStart: Date,
  clockEnd: Date,
  freeTimeDays: number,
  terms: Pick<ContractTerms, "excludeWeekends" | "holidayDates">
): { total: number; excludedWeekend: number; excludedHoliday: number } {
  let total = 0;
  let excludedWeekend = 0;
  let excludedHoliday = 0;
  let freeRemaining = freeTimeDays;

  for (let t = clockStart.getTime(); t < clockEnd.getTime(); t += DAY_MS) {
    const d = new Date(t);
    const weekend = terms.excludeWeekends && isWeekend(d);
    const holiday = isHoliday(d, terms.holidayDates);
    if (weekend) {
      excludedWeekend++;
      continue;
    }
    if (holiday) {
      excludedHoliday++;
      continue;
    }
    if (freeRemaining > 0) {
      freeRemaining--;
      continue;
    }
    total++;
  }
  return { total, excludedWeekend, excludedHoliday };
}

/** Expected charge for n chargeable days under tiered rates. */
export function expectedCharge(nDays: number, tiers: RateTier[]): number {
  let total = 0;
  let day = 1;
  const parsed = tiers.map((t) => {
    const m = t.days.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) return { from: Number(m[1]), to: Number(m[2]), rate: t.rate };
    const p = t.days.match(/^(\d+)\+$/);
    if (p) return { from: Number(p[1]), to: Infinity, rate: t.rate };
    return { from: 1, to: Infinity, rate: t.rate };
  });
  while (day <= nDays) {
    const tier = parsed.find((t) => day >= t.from && day <= t.to);
    total += tier ? tier.rate : (parsed[parsed.length - 1]?.rate ?? 0);
    day++;
  }
  return total;
}

export function auditInvoice(
  invoice: InvoiceFacts,
  shipment: ShipmentFacts,
  contract: ContractTerms
): AuditResult {
  const findings: Finding[] = [];

  const availableAt = parseDate(shipment.availableAt) ?? parseDate(shipment.dischargedAt);
  const gateOut = parseDate(shipment.gateOutAt);
  const billedFrom = parseDate(invoice.billedFrom);
  const issuedAt = parseDate(invoice.issuedAt);
  const chargesStopped = parseDate(invoice.chargesStoppedAt) ?? gateOut;

  // Rule 1 — FMC 30-day issuance (46 CFR Part 541)
  if (issuedAt && chargesStopped) {
    const gap = Math.floor((issuedAt.getTime() - chargesStopped.getTime()) / DAY_MS);
    if (gap > 30) {
      findings.push({
        code: "FMC_LATE_ISSUANCE",
        severity: "formal",
        explanation: `Invoice issued ${gap} days after charges stopped accruing — exceeds the 30-day issuance requirement under 46 CFR Part 541. Charge contestable in full on formal grounds.`,
        overchargeEstimate: invoice.billedAmount,
      });
    }
  }

  // Rule 2 — clock started before container availability
  if (billedFrom && availableAt && billedFrom.getTime() < availableAt.getTime()) {
    const early = Math.round((availableAt.getTime() - billedFrom.getTime()) / DAY_MS);
    if (early >= 1) {
      const est = expectedCharge(early, contract.rateTiers);
      findings.push({
        code: "CLOCK_BEFORE_AVAILABILITY",
        severity: "disputable",
        explanation: `Billing clock starts ${invoice.billedFrom}, but terminal records show the container available ${shipment.availableAt ?? shipment.dischargedAt}. ${early} billed day(s) precede availability.`,
        overchargeEstimate: est,
      });
    }
  }

  // Rule 3 — recompute chargeable days with free time + exclusions
  if (availableAt && gateOut) {
    const { total, excludedWeekend, excludedHoliday } = chargeableDays(
      availableAt,
      gateOut,
      contract.freeTimeDays,
      contract
    );
    if (invoice.billedDays > total) {
      const over = invoice.billedDays - total;
      const est = expectedCharge(over, contract.rateTiers);
      const parts: string[] = [];
      if (excludedWeekend > 0) parts.push(`${excludedWeekend} excluded weekend day(s)`);
      if (excludedHoliday > 0) parts.push(`${excludedHoliday} excluded holiday(s)`);
      findings.push({
        code: "DAYS_OVERBILLED",
        severity: "disputable",
        explanation: `Invoice bills ${invoice.billedDays} days; contract grants ${contract.freeTimeDays} free days${
          parts.length ? ` and ${parts.join(" and ")} apply` : ""
        }. Correct chargeable days: ${total}. Overbilled by ${over} day(s).`,
        overchargeEstimate: est,
      });
    }

    // Rule 4 — rate-tier variance
    const correctCharge = expectedCharge(Math.min(invoice.billedDays, total || invoice.billedDays), contract.rateTiers);
    if (invoice.billedAmount > correctCharge * 1.02 && findings.every((f) => f.code !== "DAYS_OVERBILLED")) {
      findings.push({
        code: "RATE_VARIANCE",
        severity: "disputable",
        explanation: `Billed amount ${invoice.billedAmount.toFixed(2)} exceeds the contract-tier calculation ${correctCharge.toFixed(2)} for ${invoice.billedDays} day(s). Check applied tier rates against contract.`,
        overchargeEstimate: Math.round(invoice.billedAmount - correctCharge),
      });
    }
  }

  // Missing data → needs review rather than a false "clean"
  const missingCore = !availableAt || (!gateOut && invoice.billedDays > 0);

  const disputableAmount = Math.min(
    invoice.billedAmount,
    findings.reduce((a, f) => a + f.overchargeEstimate, 0)
  );

  const status: AuditResult["status"] =
    findings.length > 0 ? "disputable" : missingCore ? "needs_review" : "clean";

  const narrative =
    findings.length > 0
      ? findings.map((f) => f.explanation).join("\n")
      : missingCore
      ? "Terminal timestamps incomplete — audit requires gate events before a clean verdict."
      : "All charges reconcile with contract free time, exclusions, and terminal timestamps.";

  return { status, findings, disputableAmount, narrative };
}
