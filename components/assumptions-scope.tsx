import type { ProjectInput } from "@/lib/types";

type Props = {
  currentInput: ProjectInput;
};

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export default function AssumptionsScope({ currentInput }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Assumptions and scope
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        These settings define the reporting basis for the current calculation.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Project basis
          </h3>
          <div className="mt-3 space-y-2 text-sm text-slate-800">
            <div className="flex justify-between">
              <span>Project name</span>
              <span>{currentInput.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span>Reporting area</span>
              <span>{formatNumber(currentInput.reportingAreaM2, 2)} m²</span>
            </div>
            <div className="flex justify-between">
              <span>Reference study period</span>
              <span>{currentInput.referenceStudyPeriodYears} years</span>
            </div>
            <div className="flex justify-between">
              <span>Upfront carbon basis</span>
              <span>A1-A5</span>
            </div>
            <div className="flex justify-between">
  <span>Main embodied total basis</span>
  <span>A1-A5 + C1-C4</span>
</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Current assumptions
          </h3>
          <div className="mt-3">
            {currentInput.assumptions && currentInput.assumptions.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-800">
                {currentInput.assumptions.map((assumption, index) => (
                  <li
                    key={`${assumption}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    {assumption}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No assumptions listed.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}