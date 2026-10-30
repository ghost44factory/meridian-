// Marevo guides library — long-tail SEO + AI-search content.
// Every figure here traces to a public source or is clearly marked typical/indicative.

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: "Fundamentals" | "Carrier disputes" | "Port free time" | "Laytime & tankers";
  updated: string;
  sections: { h: string; paras: string[] }[];
  faqs?: { q: string; a: string }[];
};

const DISPUTE_STEPS = [
  "Pull the evidence before you argue: the invoice, your carrier contract (or the quoted tariff), the bill of lading, and the terminal's own event data — discharge date, gate-out date, empty-return date. The dispute is won or lost on these four documents.",
  "Check the clock, not the charge. Most successful disputes aren't about whether a delay happened — they're about mechanics: demurrage billed from vessel arrival instead of container discharge, detention billed from discharge instead of gate-out, negotiated free time not applied, the wrong tariff tier, weekends or port closures counted against you, or demurrage and detention overlapping the same days.",
  "File inside the window. Invoice terms typically give a short dispute window — often 21–30 days from invoice date — and claims raised after it are routinely refused regardless of merit. Diarise it the day the invoice lands.",
  "Dispute through the carrier's own channel (portal or disputes inbox) in procedural language: cite the invoice number, the contract clause, and the terminal timestamps, and state the corrected calculation. Attach everything. Angry emails lose; documented recalculations win.",
  "Chase to a credit note. A dispute that is 'acknowledged' is not money. Track every case to an issued credit note or corrected invoice, and record the outcome — what worked against this carrier at this port will work again.",
];

function carrierGuide(opts: {
  slug: string; carrier: string; portalNote: string; extra?: string;
}): Guide {
  const { slug, carrier, portalNote, extra } = opts;
  return {
    slug,
    title: `How to dispute a ${carrier} demurrage or detention invoice`,
    description: `A practical, step-by-step process for disputing ${carrier} demurrage & detention (D&D) charges — what evidence to pull, the errors to look for, and how to file so the dispute actually gets paid.`,
    category: "Carrier disputes",
    updated: "2026-10-30",
    sections: [
      {
        h: `Can you actually win a dispute with ${carrier}?`,
        paras: [
          `Yes — when it's documented. Industry experience since the US Ocean Shipping Reform Act (OSRA 2022) is that roughly 20–30% of demurrage & detention charges are overturned when disputed with evidence. Most invoices are never checked at all, which is why billing errors persist: the sender rarely hears about them.`,
          `${carrier}, like every major carrier, processes disputes through a formal channel and responds to contract-cited, timestamp-backed recalculations far better than to general complaints. ${portalNote}`,
        ],
      },
      {
        h: "The five-step dispute process",
        paras: DISPUTE_STEPS,
      },
      {
        h: "The errors to look for first",
        paras: [
          "Wrong clock start (arrival vs discharge for demurrage; discharge vs gate-out for detention) · negotiated free time not applied — the invoice silently uses the standard tariff · wrong rate tier for the day count · charges across weekends, holidays or terminal closures your terms exclude · days when the box could not legally or physically be collected (carrier hold, no appointments) · demurrage and detention double-billed over the same days · invoices missing the OSRA-required fields or issued outside the contractual window — often voidable in full.",
          extra ?? "On US trades, OSRA requires the invoice to carry thirteen specific data points (dates, free days, rate basis, dispute contact). An invoice missing them is non-compliant — say so in the dispute.",
        ],
      },
      {
        h: "Or let the audit do it",
        paras: [
          `Marevo reads every ${carrier} invoice against your contract and the terminal timestamps automatically, drafts the dispute with the evidence attached, and tracks it to the credit note. The retro-audit of your last quarter's invoices is free — if your ${carrier} invoices are clean, you'll have proven it; if they're not, you'll have a number.`,
        ],
      },
    ],
    faqs: [
      { q: `How long do I have to dispute a ${carrier} D&D invoice?`, a: "Check the invoice terms and your contract — dispute windows are commonly 21–30 days from invoice date. Treat the window as a hard deadline: late disputes are routinely refused on timing alone." },
      { q: "What evidence wins a demurrage dispute?", a: "The carrier contract clause granting your free time, the terminal's own event timestamps (discharge, gate-out, empty return), and a corrected day-by-day calculation. Attach all three; cite them by name." },
      { q: "Is disputing worth it for small invoices?", a: "Individually, sometimes not — which is what carriers count on. Audited in bulk, error rates of even 10–20% across a year of invoices add up to real money, and automation removes the hour-per-invoice cost that made checking uneconomic." },
    ],
  };
}

function portGuide(opts: {
  slug: string; port: string; country: string; context: string[]; faqs?: { q: string; a: string }[];
}): Guide {
  const { slug, port, country, context, faqs } = opts;
  return {
    slug,
    title: `${port} demurrage & detention: free time, the clock, and how charges build`,
    description: `How demurrage and detention work at ${port} (${country}) — when the clock starts, typical free-time ranges, the local factors that eat your free days, and how to avoid or dispute the charges.`,
    category: "Port free time",
    updated: "2026-10-30",
    sections: [
      {
        h: `How the clock works at ${port}`,
        paras: [
          "The mechanics are the same everywhere: demurrage runs while your container sits inside the terminal after free time expires (clock starts at container discharge from the vessel, stops at gate-out), and detention runs while you hold the carrier's container outside the terminal (gate-out until empty return). The free time is set by your carrier contract — or, if you haven't negotiated one, by the carrier's standard tariff, which is always worse.",
          "Free time is typically in the range of 3–7 calendar days for demurrage and a similar band for detention, but it is carrier- and contract-specific — the single most common billing error worldwide is the negotiated free time simply not being applied to the invoice.",
        ],
      },
      {
        h: `What eats free time at ${port}`,
        paras: context,
      },
      {
        h: "Avoiding and disputing charges",
        paras: [
          "Book trucking before the vessel arrives, pre-clear customs where the regime allows it, and return empties to the depot the carrier actually nominates (a wrong-depot return can keep the detention clock running). When a charge lands anyway: pull the terminal timestamps, check them against the invoice's clock start, check your contractual free time was applied, and dispute inside the invoice's dispute window with the corrected calculation.",
          `Marevo does this automatically for every invoice — including ${port} calls — and the retro-audit of your last quarter is free.`,
        ],
      },
    ],
    faqs,
  };
}

export const GUIDES: Guide[] = [
  {
    slug: "demurrage-vs-detention",
    title: "Demurrage vs detention: the two clocks, explained properly",
    description: "The difference between demurrage and detention in container shipping — when each clock starts and stops, typical rates, why the two get confused, and why that confusion appears on invoices.",
    category: "Fundamentals",
    updated: "2026-10-30",
    sections: [
      {
        h: "Two charges, two clocks",
        paras: [
          "Demurrage is the charge for your container sitting inside the terminal after your free days run out. The clock starts when the container is discharged from the vessel and stops when it gates out of the terminal. Typical triggers: customs holds, congestion, late paperwork, no trucking capacity.",
          "Detention (sometimes 'per diem') is the charge for keeping the carrier's container outside the terminal beyond its free days — you're renting their box. The clock starts at gate-out and stops when the empty is returned. Typical triggers: warehouse backlogs, chassis shortages, slow unloading.",
          "A single shipment can incur both, sequentially — and one of the classic billing errors is incurring both simultaneously, with the two charges overlapping the same calendar days. That overlap is disputable.",
        ],
      },
      {
        h: "What it costs",
        paras: [
          "Rates escalate in tiers. As an indicative shape: £75–£150 per container per day for the first few days over, doubling in later tiers to £300+ per day. A container stuck two weeks through a customs examination quietly becomes a £2,000–£4,000 invoice — per box.",
          "Industry-wide, demurrage & detention leakage is measured in the tens of billions of dollars annually, and 20–30% of charges are overturned when disputed with evidence (a figure that emerged from US FMC-era data after OSRA 2022 forced carriers to justify charges on standardised invoices).",
        ],
      },
      {
        h: "Why the confusion matters",
        paras: [
          "Because the two clocks have different start events, mislabelling one as the other changes the day count. Demurrage billed from vessel arrival rather than container discharge, or detention billed from discharge rather than gate-out, each silently add days you never owed. Checking the invoice's clock start against the terminal's own timestamps is the first move of any audit — it's mechanical, which is why software does it better than a busy ops team.",
        ],
      },
    ],
    faqs: [
      { q: "Can I be charged demurrage and detention at the same time?", a: "Not for the same days, under most contracts — demurrage covers the box inside the terminal and detention outside it. Overlapping charges on the same calendar days are one of the most commonly won disputes." },
      { q: "Who pays demurrage — the forwarder or the importer?", a: "Commercially it lands on whoever controls the cargo at that stage, usually the importer/consignee; forwarders typically pass carrier charges through. Either way, the party paying has the right to dispute an incorrect invoice." },
      { q: "Is storage the same as demurrage?", a: "No — terminals may charge their own storage/quay rent separately from the carrier's demurrage. Check you're not paying twice for the same days under two labels." },
    ],
  },
  {
    slug: "how-to-dispute-demurrage-invoice",
    title: "How to dispute a demurrage or detention invoice (step by step)",
    description: "The exact process for disputing a container demurrage or detention invoice with any carrier: evidence to pull, the eight billing errors to check, dispute-window discipline, and template language.",
    category: "Fundamentals",
    updated: "2026-10-30",
    sections: [
      { h: "The five steps", paras: DISPUTE_STEPS },
      {
        h: "The eight errors that pay for the effort",
        paras: [
          "1) Wrong clock start — demurrage from vessel arrival instead of container discharge. 2) Wrong detention start — from discharge instead of gate-out. 3) Negotiated free time not applied. 4) Wrong tariff tier or port tariff. 5) Weekends, holidays and closures counted when your terms exclude them. 6) Days you couldn't collect the box — carrier hold, terminal appointment shortage. 7) Demurrage and detention overlapping the same days. 8) Non-compliant or late invoices — on US trades OSRA requires thirteen specific invoice fields, and contracts usually set an invoicing window; failures can void the charge entirely.",
        ],
      },
      {
        h: "Template language that works",
        paras: [
          '"Re invoice [number]: the invoice charges [X] days of demurrage calculated from [date]. Per clause [Y] of our service contract, free time is [N] days commencing at container discharge, which terminal records show occurred on [date]. The correct charge is [Z]. Please reissue the invoice or credit the difference. Supporting documents attached: contract extract, terminal event report, original invoice." Procedural, cited, attached — that is the whole art.',
        ],
      },
      {
        h: "The economics of checking",
        paras: [
          "Checking one invoice properly takes an experienced person half an hour to an hour, which is why most invoices are paid unchecked. That is the entire reason Marevo exists: the AI reads the invoice against your contract and the terminal data in seconds, drafts the dispute, and only earns when money actually comes back. The retro-audit of your last 90 days of invoices is free.",
        ],
      },
    ],
    faqs: [
      { q: "What's the success rate of demurrage disputes?", a: "Roughly 20–30% of charges are overturned when disputed with documentary evidence — and higher on portfolios that have never been audited, because systematic errors (like unapplied contract free time) repeat across every invoice." },
      { q: "Will disputing damage my relationship with the carrier?", a: "No. Carriers run dispute desks precisely for this; a documented recalculation through the official channel is routine commerce. Paying wrong invoices silently is not a relationship strategy — it's a subsidy." },
    ],
  },
  {
    slug: "osra-demurrage-invoice-rules",
    title: "OSRA 2022: your rights on US demurrage & detention invoices",
    description: "What the US Ocean Shipping Reform Act (OSRA 2022) and the FMC's billing rules require on every D&D invoice — the thirteen required fields, the incentive principle, and how to use non-compliance in a dispute.",
    category: "Fundamentals",
    updated: "2026-10-30",
    sections: [
      {
        h: "What OSRA changed",
        paras: [
          "The Ocean Shipping Reform Act of 2022 rebalanced US demurrage & detention billing. The FMC's rules under it require carriers to issue D&D invoices containing specific minimum information — including the billed party's identity, container and BL numbers, the billing dates and rate basis, the free time start and end, and who to contact to dispute — and set timing rules for issuing invoices and resolving disputes.",
          "Underlying it is the FMC's 'incentive principle' from its 2020 interpretive rule: demurrage and detention are only reasonable when they can actually incentivise cargo movement. Charging for days when the box could not be collected — a government hold the importer didn't cause, a terminal with no appointments — fails that test.",
        ],
      },
      {
        h: "How to use it",
        paras: [
          "On US trades, check every D&D invoice for the required fields before you check the maths. A materially non-compliant invoice is challengeable as issued; cite the FMC billing requirements in the dispute. Then check the days themselves against the incentive principle — document the hold or the appointment shortage and dispute those days specifically.",
          "Outside the US there is no OSRA, but the same logic wins commercially: contracts and reasonableness arguments carry disputes everywhere, and carriers apply their US-grade invoice discipline unevenly across other trades — which is where errors live.",
        ],
      },
      {
        h: "Audit it automatically",
        paras: [
          "Marevo checks invoice compliance, clock starts, contract free time and tariff tiers on every invoice automatically, and drafts the dispute with the right citations for the trade. The first audit is free.",
        ],
      },
    ],
    faqs: [
      { q: "Does OSRA apply to detention as well as demurrage?", a: "Yes — the FMC's billing requirements cover both demurrage and detention invoices on US trades." },
      { q: "What if the carrier's invoice is missing required information?", a: "Raise it in the dispute: a non-compliant invoice undermines the charge as billed. Carriers frequently reissue or credit rather than defend a defective invoice." },
    ],
  },
  {
    slug: "demurrage-time-bars",
    title: "Time bars: how demurrage claims and disputes die on the calendar",
    description: "Dispute windows on container invoices and 90-day time bars on tanker demurrage claims — the deadlines that void otherwise-winning cases, and the discipline that protects them.",
    category: "Fundamentals",
    updated: "2026-10-30",
    sections: [
      {
        h: "Two kinds of deadline",
        paras: [
          "On the container side, the deadline runs against the payer: invoice terms commonly give 21–30 days to dispute a D&D charge, after which carriers refuse on timing alone. On the tanker side it runs against the claimant: charter parties typically require the owner's demurrage claim to be submitted with full supporting documents within 90 days of discharge — one day late, or one document short, and a six-figure claim can be void.",
          "These are not soft deadlines. Documented cases exist of portfolios losing hundreds of thousands of dollars in a single year purely to missed time bars — claims that would have won, submitted late.",
        ],
      },
      {
        h: "The protection is procedural",
        paras: [
          "Diarise the window the day the invoice or the discharge happens, not when someone gets around to the file. Submit complete — a claim 'to follow with documents' usually doesn't stop the clock. And track every open case against its bar date in one place that someone actually looks at.",
          "Marevo puts a countdown on every dispute and every claim automatically — the one failure mode the system makes impossible is silent lateness.",
        ],
      },
    ],
    faqs: [
      { q: "Can a time bar be extended?", a: "Only by agreement (or specific contract language). Ask early, in writing, before the bar — counterparties sometimes grant extensions for genuine document delays, never retroactively." },
    ],
  },

  carrierGuide({
    slug: "msc-demurrage-detention-dispute",
    carrier: "MSC",
    portalNote: "MSC handles import charges and disputes through its local agencies and the myMSC portal — file through the channel named on your invoice, and keep the reference number.",
  }),
  carrierGuide({
    slug: "maersk-demurrage-detention-dispute",
    carrier: "Maersk",
    portalNote: "Maersk runs disputes through maersk.com's case system — invoices carry the dispute route, and cases get reference numbers you can chase. Maersk also publishes its D&D tariffs per country on its site, which makes tier-checking straightforward.",
  }),
  carrierGuide({
    slug: "cma-cgm-demurrage-detention-dispute",
    carrier: "CMA CGM",
    portalNote: "CMA CGM takes disputes via its eBusiness portal and local agency invoicing desks; its D&D tariffs and free-time defaults are published per trade on its website — always compare the invoice against both the published tariff and your negotiated terms.",
  }),
  carrierGuide({
    slug: "hapag-lloyd-demurrage-detention-dispute",
    carrier: "Hapag-Lloyd",
    portalNote: "Hapag-Lloyd publishes detention & demurrage tariffs per country and handles disputes through its web channels and local offices. Its 'Quick Quotes' style standard terms differ from negotiated contracts — invoices frequently default to standard free time.",
  }),
  carrierGuide({
    slug: "cosco-demurrage-detention-dispute",
    carrier: "COSCO",
    portalNote: "COSCO Shipping Lines handles D&D through local agencies with tariffs published per region; dispute through the contact on the invoice and insist on a written reference for the case.",
  }),

  portGuide({
    slug: "jebel-ali-port-free-time-demurrage",
    port: "Jebel Ali",
    country: "UAE",
    context: [
      "Jebel Ali (DP World) is the Gulf's transhipment giant, and its scale cuts both ways: vast capacity, but customs inspection queues, peak-season yard congestion and documentation holds (attestation and duty queries are common on Gulf imports) all run the clock. Ramadan and Eid scheduling changes catch shippers out annually — confirm what your contract says about holiday exclusions.",
      "During the 2026 Hormuz disruption, vessels stacked off the UAE coast and berthing windows slipped — exactly the conditions where demurrage accrues through no fault of the consignee, and where day-by-day evidence of what was actually collectable wins disputes.",
    ],
    faqs: [
      { q: "How many free days do I get at Jebel Ali?", a: "Whatever your carrier contract says — typically in the 3–7 day band for demurrage, with the carrier's standard tariff applying if you've negotiated nothing. Terminal storage from DP World can apply separately from carrier demurrage; check you're not double-paying the same days." },
    ],
  }),
  portGuide({
    slug: "felixstowe-port-free-time-demurrage",
    port: "Felixstowe",
    country: "UK",
    context: [
      "The UK's biggest container port concentrates UK import risk in one place: haulage capacity is the binding constraint, and vehicle booking system (VBS) slot shortages in peak weeks mean a cleared box can still sit — those are precisely the days to document, because charging for days when no collection slot existed is challengeable.",
      "UK customs examinations (including Border Force holds) stop everything while the clock runs; the examination notice and release timestamps are your dispute evidence. Industrial action at UK ports has historically produced closure days that many contracts exclude from the count — check yours.",
    ],
    faqs: [
      { q: "Can I get demurrage back for days Felixstowe had no haulage slots?", a: "If you can evidence that collection was impossible — VBS screenshots, booking refusals — days are disputable on reasonableness and, in many contracts, on the exclusions clause. Document in real time; reconstructing it later is much harder." },
    ],
  }),
  portGuide({
    slug: "rotterdam-port-free-time-demurrage",
    port: "Rotterdam",
    country: "Netherlands",
    context: [
      "Europe's largest port is highly automated and usually fluid, but inland-leg friction — barge slot congestion at the deepsea terminals, rail disruption on the Rhine corridor — regularly strands import boxes at the terminal past free time. Low-water periods on the Rhine push cargo from barge to truck and create exactly the collection crunches that eat free days.",
      "Rotterdam's scale also means carrier and terminal systems disagree surprisingly often on event timestamps; pull the terminal's own data (not the carrier's summary) before paying any disputed day count.",
    ],
  }),

  {
    slug: "laytime-calculation-worked-example",
    title: "Laytime calculation: a worked VLCC demurrage example",
    description: "How tanker laytime and demurrage are actually calculated — NOR, laytime commencement, exclusions, and a complete worked example of a $190,000 VLCC claim, step by step.",
    category: "Laytime & tankers",
    updated: "2026-10-30",
    sections: [
      {
        h: "The pieces",
        paras: [
          "The charter party (CP) grants the charterer an allowance of laytime — commonly 72 hours total for loading plus discharge in crude trades — and sets a demurrage rate per day, pro rata (PDPR). The master tenders Notice of Readiness (NOR) on arrival; after any contractual turn time, laytime starts counting. Every port event is recorded in the Statement of Facts (SOF). When laytime is used up, the vessel is 'on demurrage' and every further hour is owed at the CP rate.",
          "Exclusions are where the arguments live: many CPs stop the clock for weather interruptions, shifting between berths, or time before NOR was validly tendered. The SOF's timestamps decide each one.",
        ],
      },
      {
        h: "Worked example",
        paras: [
          "Fixture: a VLCC loading 2.0M barrels at Ras Tanura for discharge at Ningbo. CP terms: 84 hours total laytime; demurrage $52,500/day PDPR; claims to be submitted with full documents within 90 days of discharge.",
          "From the SOFs: laytime consumed across load and discharge ports totals 171 hours (terminal congestion at the discharge port). Calculation: 171 − 84 = 87 hours on demurrage. 87 ÷ 24 = 3.625 days. 3.625 × $52,500 = $190,313 owed by the charterer to the owner.",
          "Before the claim goes out, each of the 87 hours is checked against the CP's exclusions — if, say, 6 hours were a weather stop the CP excludes, the claim drops to $177,188 and survives scrutiny, instead of inviting a blanket challenge. Then: laytime statement, SOF and NOR attached, submitted well inside the 90-day bar.",
        ],
      },
      {
        h: "Why this is an automation problem",
        paras: [
          "An estimated ~99% of SOFs are still processed manually, each claim taking hours of analyst time — and a VLCC's demurrage rate was $45,000–$52,500/day in a normal 2025 market (Argus) and multiples of that during the 2026 Gulf disruption. Marevo's engine reads the CP and SOF, computes the statement, drafts the claim pack and counts down the time bar. The owner portal is live in demo at marevoapp.com.",
        ],
      },
    ],
    faqs: [
      { q: "What does PDPR mean?", a: "'Per day pro rata' — the demurrage rate is quoted per day but accrues by the hour (and minute). 87 hours at $52,500/day is 87/24 × 52,500." },
      { q: "What is despatch?", a: "The mirror image of demurrage in some (mostly dry-bulk) charters: if the charterer finishes early, the owner pays despatch, customarily at half the demurrage rate. Tanker charters usually don't pay despatch — check the CP." },
    ],
  },
  {
    slug: "statement-of-facts-sof-guide",
    title: "The Statement of Facts (SOF): the document every demurrage claim lives on",
    description: "What a Statement of Facts contains, who signs it, why ~99% are still processed by hand, and how SOF quality decides tanker and bulker demurrage claims.",
    category: "Laytime & tankers",
    updated: "2026-10-30",
    sections: [
      {
        h: "What it is",
        paras: [
          "The SOF is the port call's timestamped diary: arrival, NOR tendered, pilot on board, all fast, hoses connected, cargo commenced, stoppages and their causes, cargo completed, hoses off, departure. It is prepared by the agent and signed by ship, agent and terminal — which is exactly why it carries evidentiary weight: it's the version of events everyone signed at the time.",
          "Every laytime calculation is just the SOF's events run against the charter party's rules. Which events count, which are excluded, and when the clock started — all of it traces to SOF lines.",
        ],
      },
      {
        h: "Why it's still a bottleneck",
        paras: [
          "SOFs arrive as scans, faxes-of-scans and port-specific templates in a dozen formats; industry estimates put ~99% of them through manual processing, at hours per claim, with disputes then argued line-by-line over email for months. Claims under roughly $100k often get horse-traded rather than fought, because the processing cost rivals the claim.",
          "That is a document-extraction problem — the same one AI now solves for invoices. Marevo's engine extracts SOF events, maps them to CP clauses, and produces the laytime statement with each line traceable back to its source timestamp.",
        ],
      },
      {
        h: "Practical SOF discipline",
        paras: [
          "Get remarks on at the time (a disputed stoppage noted on the signed SOF is worth ten later emails) · reconcile ship's log against the agent's SOF before anyone signs · never let a claim go out with an unexplained gap between NOR and laytime commencement — it's the first thing the charterer's analyst attacks.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export const GUIDE_CATEGORIES: Guide["category"][] = [
  "Fundamentals",
  "Carrier disputes",
  "Port free time",
  "Laytime & tankers",
];
