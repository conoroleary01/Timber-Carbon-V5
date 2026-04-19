type Props = {
  totalRows: number;
  errors: number;
  warnings: number;
};

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "error" | "warning";
}) {
  const toneClasses =
    tone === "error"
      ? "border-[#f1c7d4] bg-[#fff5f7] text-[#B21E4B]"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-[#D9E1E7] bg-white text-[#1F2937]";

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function ValidationSummary({
  totalRows,
  errors,
  warnings,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard label="Total Rows" value={totalRows} />
      <SummaryCard label="Errors" value={errors} tone="error" />
      <SummaryCard label="Warnings" value={warnings} tone="warning" />
    </div>
  );
}