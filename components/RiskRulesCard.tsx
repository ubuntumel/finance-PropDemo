/*
  RiskRulesCard displays the prop firm's account rules.

  This is separated from page.tsx so the page stays focused on state and logic,
  while this component focuses only on displaying rules.
*/

import { Rule } from "@/components/Rule";
import { RiskRules } from "@/lib/types";

export function RiskRulesCard({ rules }: { rules: RiskRules }) {
  return (
    <div className="rounded-xl bg-slate-900 p-5">
      <h2 className="mb-4 text-xl font-semibold">Risk Rules</h2>

      <div className="space-y-3 text-sm">
        <Rule label="Max contracts per symbol" value={rules.maxContractQty} />
        <Rule label="Daily Loss Limit" value={`$${rules.dailyLossLimit}`} />
        <Rule label="Trailing Drawdown" value={`$${rules.trailingDrawdown}`} />
        <Rule label="Profit Target" value={`$${rules.profitTarget}`} />
      </div>

      <div className="mt-6 rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Talking point:</p>
        <p className="mt-2">
          These rules represent firm-defined account limits. In production,
          they would live in a backend risk service or database.
        </p>
      </div>
    </div>
  );
}