export function formatCurrency(n: number | string | null | undefined, currency = "GBP") {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysLeft(clockStart: string | null, freeTimeDays: number, endAt?: string | null): number | null {
  if (!clockStart) return null;
  const start = new Date(clockStart).getTime();
  const end = endAt ? new Date(endAt).getTime() : Date.now();
  const used = Math.floor((end - start) / 86400000);
  return freeTimeDays - used;
}

export function riskColor(days: number | null): string {
  if (days === null) return "var(--color-mist)";
  if (days < 0) return "var(--color-coral)";
  if (days <= 3) return "var(--color-amber)";
  return "var(--color-cyan)";
}

export const STATUS_LABELS: Record<string, string> = {
  in_transit: "In transit",
  at_port: "At port",
  at_risk: "At risk",
  in_demurrage: "In demurrage",
  closed: "Closed",
  draft: "Draft",
  sent: "Sent",
  acknowledged: "Acknowledged",
  offer: "Offer",
  resolved_won: "Won",
  resolved_lost: "Lost",
  clean: "Clean",
  disputable: "Disputable",
  needs_review: "Needs review",
  approved: "Approved",
};
