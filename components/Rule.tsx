/*
  Rule is a reusable row for displaying one risk rule.

  Example:
  Max contracts per symbol     5
*/

export function Rule({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}