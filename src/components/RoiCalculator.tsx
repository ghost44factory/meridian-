"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

export function RoiCalculator() {
  const [containers, setContainers] = useState(400);
  const [monthlyDnD, setMonthlyDnD] = useState(20000);

  // Model: ~35% of D&D billings carry disputable grounds; ~25% of contested value is recovered.
  const disputableShare = 0.35;
  const winRate = 0.25;
  const monthlyRecovery = monthlyDnD * disputableShare * winRate;
  const annualRecovery = monthlyRecovery * 12;
  // Prevention: alerts avoid ~1 day of charges on ~5% of boxes at ~£120/day
  const annualPrevention = containers * 0.05 * 120 * 12;

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm text-mist">Containers per month</label>
              <span className="font-mono text-sm text-cyan">{containers}</span>
            </div>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={containers}
              onChange={(e) => setContainers(Number(e.target.value))}
              className="w-full accent-[#4cd9e0]"
            />
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm text-mist">Monthly D&amp;D billings</label>
              <span className="font-mono text-sm text-cyan">{formatCurrency(monthlyDnD)}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={150000}
              step={1000}
              value={monthlyDnD}
              onChange={(e) => setMonthlyDnD(Number(e.target.value))}
              className="w-full accent-[#4cd9e0]"
            />
          </div>
          <p className="text-xs leading-relaxed text-mist/70">
            Model assumes ~35% of billings carry disputable grounds and ~25% of contested value is
            recovered — in line with published FMC dispute outcomes. Your retro-audit replaces
            these estimates with your real numbers.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-5 border-white/10 md:border-l md:pl-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
              Estimated recovery / year
            </div>
            <div className="mt-1 font-display text-4xl font-semibold text-cyan">
              {formatCurrency(annualRecovery)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
              Charges prevented / year
            </div>
            <div className="mt-1 font-display text-3xl font-semibold text-amber">
              {formatCurrency(annualPrevention)}
            </div>
          </div>
          <a
            href="mailto:hello@meridian.freight?subject=Free%20retro-audit"
            className="mt-2 inline-flex w-fit items-center rounded-full bg-cyan px-6 py-3 text-sm font-medium text-navy transition hover:brightness-110"
          >
            Claim your free audit →
          </a>
        </div>
      </div>
    </div>
  );
}
