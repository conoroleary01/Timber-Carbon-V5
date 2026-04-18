import type { CalculationResult, ProjectInput } from "@/lib/types";
import MaterialTraceCard from "@/components/material-trace-card";

type ConversionTrace = {
  mode: string;
  basis: string;
  equation: string;
  preview: number | null;
};

type Props = {
  currentInput: ProjectInput;
  result: CalculationResult;
  getConversionTrace: (
    material: ProjectInput["materials"][number],
  ) => ConversionTrace | null;
  getConversionPathLabel: (
    sourceLine: ProjectInput["materials"][number] | undefined,
    conversionTrace: ConversionTrace | null,
  ) => string;
  getActiveMassFactorPreview: (
    material: ProjectInput["materials"][number],
  ) => number | null;
};

export default function MaterialTraceSection({
  currentInput,
  result,
  getConversionTrace,
  getConversionPathLabel,
  getActiveMassFactorPreview,
}: Props) {
  return (
    <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Calculation trace by material
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        This section shows the main inputs, quantities, factors and outputs used for
        each material line so the calculation can be checked step by step.
      </p>

      <div className="mt-6 space-y-6">
        {result.materials.map((material) => {
          const sourceLine = currentInput.materials.find(
            (item) => item.id === material.id,
          );

          const conversionTrace = sourceLine
            ? getConversionTrace(sourceLine)
            : null;

          const massFactorPreview = sourceLine
            ? getActiveMassFactorPreview(sourceLine)
            : null;

          const a4DistanceKm = currentInput.factory.a4DistanceKm ?? 0;

          return (
            <MaterialTraceCard
              key={material.id}
              material={material}
              sourceLine={sourceLine}
              conversionTrace={conversionTrace}
              conversionPathLabel={getConversionPathLabel(
                sourceLine,
                conversionTrace,
              )}
              massFactorPreview={massFactorPreview}
              a4DistanceKm={a4DistanceKm}
            />
          );
        })}
      </div>
    </section>
  );
}