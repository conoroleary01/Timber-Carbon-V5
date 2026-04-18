import type { CalculationResult, ProjectInput } from "@/lib/types";

type Props = {
  currentInput: ProjectInput;
  result: CalculationResult;
};

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export default function A5Trace({ currentInput, result }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        A5 formula trace
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        A5 is split into fossil and biogenic components. Fossil A5 uses GIA demolished,
        GIA, and 1% of A1-A4. Biogenic A5 represents the positive release from site waste
        of biogenic carbon that is not retained in the completed asset.
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">
          A5 fossil = (17.5 × GIA demolished) + (20 × GIA) + ((A1-A4) × 0.01)
        </p>

        <p className="mt-3 font-mono text-xs text-slate-600">
          (17.5 × {formatNumber(currentInput.giaDemolishedM2, 2)}) ={" "}
          {formatNumber(result.modules.A5DemolitionKgCO2e, 4)} kgCO2e
        </p>

        <p className="mt-2 font-mono text-xs text-slate-600">
          (20 × {formatNumber(currentInput.reportingAreaM2, 2)}) ={" "}
          {formatNumber(result.modules.A5ConstructionKgCO2e, 4)} kgCO2e
        </p>

        <p className="mt-2 font-mono text-xs text-slate-600">
          ({formatNumber(
            result.modules.finishedProductA1A3KgCO2e + result.modules.A4KgCO2e,
            4,
          )} × 0.01) ={" "}
          {formatNumber(result.modules.A5PercentOfA1A4KgCO2e, 4)} kgCO2e
        </p>

        <p className="mt-2 font-mono text-xs text-slate-600">
          A5 fossil total = {formatNumber(result.modules.A5FossilKgCO2e, 4)} kgCO2e
        </p>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="font-medium text-slate-900">
            A5 biogenic = abs(stored biogenic carbon) × site waste rate
          </p>

          <p className="mt-3 font-mono text-xs text-slate-600">
            abs({formatNumber(result.modules.storedBiogenicCarbonKgCO2e, 4)}) ×
            site waste rate by material ={" "}
            {formatNumber(result.modules.A5BiogenicKgCO2e, 4)} kgCO2e
          </p>

          <p className="mt-2 font-mono text-xs text-slate-600">
            Stored biogenic in asset ={" "}
            {formatNumber(result.modules.storedBiogenicCarbonKgCO2e, 4)} kgCO2e
          </p>

          <p className="mt-2 font-mono text-xs text-slate-600">
            Net stored biogenic after A5 ={" "}
            {formatNumber(result.modules.netStoredBiogenicCarbonKgCO2e, 4)} kgCO2e
          </p>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="font-medium text-slate-900">
            A5 total = A5 fossil + A5 biogenic
          </p>

          <p className="mt-2 font-mono text-xs text-slate-600">
            {formatNumber(result.modules.A5FossilKgCO2e, 4)} +{" "}
            {formatNumber(result.modules.A5BiogenicKgCO2e, 4)} ={" "}
            {formatNumber(result.modules.A5KgCO2e, 4)} kgCO2e
          </p>
        </div>
      </div>
    </section>
  );
}