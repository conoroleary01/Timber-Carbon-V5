type Props = {
  title?: string;
  status?: "Draft" | "Needs Mapping" | "Calculated";
};

function getStatusClasses(status: Props["status"]) {
  switch (status) {
    case "Calculated":
      return "bg-[#E8F5EF] text-cygnum-green";
    case "Needs Mapping":
      return "bg-amber-50 text-amber-700";
    case "Draft":
    default:
      return "bg-[#F7F9FA] text-[#667085]";
  }
}

export default function AppTopbar({
  title = "No project selected",
  status = "Draft",
}: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#D9E1E7] bg-white px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
          Cygnum Carbon
        </p>
        <h1 className="text-sm font-semibold text-[#1F2937]">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
            status,
          )}`}
        >
          {status}
        </span>

        <span className="text-xs text-[#667085]">Saved</span>

        <button
          type="button"
          className="rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm font-medium text-[#1F2937]"
        >
          Save
        </button>

        <button
          type="button"
          className="rounded-lg bg-cygnum-green px-3 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
        >
          Run Calculation
        </button>
      </div>
    </header>
  );
}