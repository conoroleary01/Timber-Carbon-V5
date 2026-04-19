type ValidationRow = {
  row: number;
  material: string;
  quantity: string;
  unit: string;
  status: "Valid" | "Warning" | "Error";
  issue: string;
};

function getStatusClasses(status: ValidationRow["status"]) {
  switch (status) {
    case "Error":
      return "bg-[#fff5f7] text-[#B21E4B]";
    case "Warning":
      return "bg-amber-50 text-amber-700";
    case "Valid":
    default:
      return "bg-[#E8F5EF] text-cygnum-green";
  }
}

export default function ValidationTable({
  rows,
}: {
  rows: ValidationRow[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
      <table className="min-w-full divide-y divide-[#D9E1E7]">
        <thead className="bg-[#F7F9FA]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Row #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Material
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Unit
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Issue
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#D9E1E7]">
          {rows.map((row) => (
            <tr key={row.row} className="bg-white">
              <td className="px-4 py-3 text-sm text-[#1F2937]">{row.row}</td>
              <td className="px-4 py-3 text-sm text-[#1F2937]">{row.material}</td>
              <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                {row.quantity}
              </td>
              <td className="px-4 py-3 text-sm text-[#667085]">{row.unit}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                    row.status,
                  )}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[#667085]">{row.issue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}