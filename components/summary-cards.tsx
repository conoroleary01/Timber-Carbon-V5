import type { CalculationResult } from "@/lib/types";

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl border border-cygnum-border bg-[#f2f2f2] p-4 shadow-sm">
      <div className="text-sm text-cygnum-charcoal-2">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-cygnum-charcoal">
        {formatNumber(value)}
      </div>
    </div>
  );
}

type Props = {
  result: CalculationResult;
};

export function SummaryCards({ result }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricCard
        label="Finished product A1-A3"
        value={result.modules.finishedProductA1A3KgCO2e}
      />
      <MetricCard label="A4" value={result.modules.A4KgCO2e} />
      <MetricCard label="A5 fossil" value={result.modules.A5FossilKgCO2e} />
      <MetricCard
        label="A5 biogenic release"
        value={result.modules.A5BiogenicKgCO2e}
      />
      <MetricCard label="A5 total" value={result.modules.A5KgCO2e} />
      <MetricCard
        label="Stored biogenic in asset"
        value={result.modules.storedBiogenicCarbonKgCO2e}
      />
      <MetricCard
        label="Net stored biogenic after A5"
        value={result.modules.netStoredBiogenicCarbonKgCO2e}
      />
      <MetricCard
        label="Upfront carbon A1-A5"
        value={result.modules.upfrontCarbonKgCO2e}
      />
      <MetricCard
        label="C1-C4 total"
        value={
          result.modules.C1KgCO2e +
          result.modules.C2KgCO2e +
          result.modules.C3KgCO2e +
          result.modules.C4KgCO2e
        }
      />
      <MetricCard
        label="Embodied carbon total"
        value={result.modules.embodiedCarbonTotalKgCO2e}
      />
      <MetricCard
        label="Upfront kgCO2e/m²"
        value={result.modules.upfrontCarbonPerM2KgCO2e}
      />
      <MetricCard
        label="Total kgCO2e/m²"
        value={result.modules.embodiedCarbonPerM2KgCO2e}
      />
    </div>
  );
}

export default SummaryCards;