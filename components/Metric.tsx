/*
  Metric is a reusable card for top-level dashboard numbers.

  Examples:
  - Account Balance
  - Daily PnL
  - Drawdown Remaining
  - Profit Target
*/

export function Metric({
  title,
  value,
  danger,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p
        className={`text-2xl font-bold ${
          danger ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}