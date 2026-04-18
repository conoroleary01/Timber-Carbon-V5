import type { ProjectInput } from "@/lib/types";

type Props = {
  currentInput: ProjectInput;
  updateProjectField: (
    section: "root" | "factory",
    field: string,
    value: string | number,
  ) => void;
};

export default function ProjectControls({
  currentInput,
  updateProjectField,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Project controls
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Edit the project basis and factory inputs here, then click Recalculate.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Project basis</h3>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Project name
              </span>
              <input
                type="text"
                value={currentInput.projectName}
                onChange={(e) =>
                  updateProjectField("root", "projectName", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Reporting area m²
              </span>
              <input
                type="number"
                step="any"
                value={currentInput.reportingAreaM2}
                onChange={(e) =>
                  updateProjectField("root", "reportingAreaM2", Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                GIA demolished m²
              </span>
              <input
                type="number"
                step="any"
                value={currentInput.giaDemolishedM2}
                onChange={(e) =>
                  updateProjectField("root", "giaDemolishedM2", Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Reference study period years
              </span>
              <input
                type="number"
                step="1"
                value={currentInput.referenceStudyPeriodYears}
                onChange={(e) =>
                  updateProjectField(
                    "root",
                    "referenceStudyPeriodYears",
                    Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Factory</h3>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Allocated manufacturing kgCO2e
              </span>
              <input
                type="number"
                step="any"
                value={currentInput.factory.allocatedManufacturingKgCO2e}
                onChange={(e) =>
                  updateProjectField(
                    "factory",
                    "allocatedManufacturingKgCO2e",
                    Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            A4 distance km
          </span>
          <input
            type="number"
            step="any"
            value={currentInput.factory.a4DistanceKm}
            onChange={(e) =>
              updateProjectField("factory", "a4DistanceKm", Number(e.target.value))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
    </section>
  );
}