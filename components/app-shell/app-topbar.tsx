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
    <header className="border-b border-cygnum-border bg-white">
  <div className="flex min-h-[72px] items-center justify-between px-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cygnum-charcoal-2">
        Cygnum Carbon
      </p>
      <h1 className="text-2xl font-semibold text-cygnum-charcoal">
        Embodied carbon platform
      </h1>
    </div>

  
    <div className="rounded-full border border-cygnum-border bg-cygnum-surface px-4 py-2 text-sm text-cygnum-charcoal-2">
      Conor O'Leary
    </div>
  </div>
</header>
  );
}