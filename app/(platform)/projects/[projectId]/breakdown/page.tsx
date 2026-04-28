import Link from "next/link";
import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
import MaterialBreakdownList, {
  type MaterialBreakdownListItem,
} from "@/components/breakdown/material-breakdown-list";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CalculationResult, ProjectInput } from "@/lib/types";

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

export default async function BreakdownPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, project_name")
    .eq("id", Number(projectId))
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: projectResult, error: resultError } = await supabase
    .from("project_results")
    .select("result_json, input_json, updated_at")
    .eq("project_id", Number(projectId))
    .single();

  if (resultError || !projectResult) {
    return (
      <div className="space-y-8">
        <SectionCard
          title="Breakdown"
          description="No saved calculation result was found for this project yet."
        >
          <div className="rounded-xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              No breakdown available
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#667085]">
              Run the project calculation first to generate a saved breakdown.
            </p>

            <div className="mt-6">
              <Link
                href={`/projects/${projectId}/mapping`}
                className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
              >
                Go to Mapping
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  const result = projectResult.result_json as CalculationResult;
  const input = projectResult.input_json as ProjectInput;

  const materialInputById = new Map(
    (input.materials ?? []).map((material) => [material.id, material]),
  );

  const moduleRows = [
    {
      label: "A1-A3",
      value: result.modules.finishedProductA1A3KgCO2e,
      color: "#008A5A",
    },
    {
      label: "A4",
      value: result.modules.A4KgCO2e,
      color: "#36A873",
    },
    {
      label: "A5",
      value: result.modules.A5KgCO2e,
      color: "#7CC9A8",
    },
    {
      label: "B2",
      value: result.modules.B2KgCO2e,
      color: "#5C8FBE",
    },
    {
      label: "B3",
      value: result.modules.B3KgCO2e,
      color: "#8AAAD3",
    },
    {
      label: "C1",
      value: result.modules.C1KgCO2e,
      color: "#C9B458",
    },
    {
      label: "C2",
      value: result.modules.C2KgCO2e,
      color: "#D69A4D",
    },
    {
      label: "C3-C4",
      value: result.modules.C3C4KgCO2e,
      color: "#C97862",
    },
  ];

  const total = result.modules.embodiedCarbonTotalKgCO2e;
  const reportingArea = input.reportingAreaM2 || 0;
  const intensity = result.modules.upfrontCarbonPerM2KgCO2e ?? 0;
  const upfront = result.modules.upfrontCarbonKgCO2e;

  const materialBreakdown: MaterialBreakdownListItem[] = result.materials
    .map((material) => {
      const source = materialInputById.get(material.id);

      const a4Factor = input.moduleDefaults?.a4TransportFactorKgCO2ePerTkm ?? 0;
      const a4Distance = input.factory?.a4DistanceKm ?? 0;

      const a4KgCO2e =
        material.deliveredToSiteMassTonnes * a4Distance * a4Factor;

      const c2Factor = source?.c2KgCO2ePerKg ?? 0;
      const c2KgCO2e = material.installedMassKg * c2Factor;

      const c3c4Factor = source?.c3c4KgCO2ePerKg ?? 0;
      const c3c4KgCO2e = material.installedMassKg * c3c4Factor;

      const subtotal =
        material.supplierA1A3GrossKgCO2e +
        material.inboundTransportKgCO2e +
        material.factoryWasteTransportKgCO2e +
        material.factoryWasteTreatmentKgCO2e +
        a4KgCO2e +
        material.a5BiogenicKgCO2e +
        c2KgCO2e +
        c3c4KgCO2e;

      const biogenicFormula =
        source?.biogenicMethod === "fallback_1_64"
          ? `${formatNumber(material.installedMassKg, 4)} × ${formatNumber(
              source?.woodMassFraction ?? 1,
              4,
            )} × (-1.64) = ${formatNumber(
              material.storedBiogenicCarbonKgCO2e,
              4,
            )} kgCO₂e`
          : source?.biogenicMethod === "epd"
            ? `${formatNumber(material.declaredInstalledQty, 4)} × ${formatNumber(
                source?.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit ?? 0,
                4,
              )} = ${formatNumber(
                material.storedBiogenicCarbonKgCO2e,
                4,
              )} kgCO₂e`
            : "No biogenic method applied";

      return {
        id: material.id,
        name: material.name,
        materialFamily: source?.materialFamily ?? "—",
        installedMassKg: material.installedMassKg,
        declaredInstalledQty: material.declaredInstalledQty,
        declaredUnit: material.declaredUnit,
        subtotal,
        share: total > 0 ? (subtotal / total) * 100 : 0,

        sourceBoqQty: source?.boqQty ?? material.boqQty,
        sourceBoqUnit: source?.boqUnit ?? material.boqUnit,
        factoryWasteRate: source?.factoryWasteRate ?? 0,
        siteWasteRate: source?.siteWasteRate ?? 0,
        epdA1A3Factor: source?.epdA1A3KgCO2ePerDeclaredUnit ?? 0,
        inboundDistanceKm: source?.inboundDistanceKm ?? 0,
        inboundTransportFactor: source?.inboundTransportKgCO2ePerTkm ?? 0,
        a4DistanceKm: input.factory?.a4DistanceKm ?? 0,
        c2Factor,
        c3c4Factor,

        supplierA1A3NetKgCO2e: material.supplierA1A3NetKgCO2e,
        factoryWasteUpstreamKgCO2e: material.factoryWasteUpstreamKgCO2e,
        supplierA1A3GrossKgCO2e: material.supplierA1A3GrossKgCO2e,
        inboundTransportKgCO2e: material.inboundTransportKgCO2e,
        factoryWasteTransportKgCO2e: material.factoryWasteTransportKgCO2e,
        factoryWasteTreatmentKgCO2e: material.factoryWasteTreatmentKgCO2e,
        a4KgCO2e,
        c2KgCO2e,
        c3c4KgCO2e,

        grossFactoryInputQty: material.grossFactoryInputQty,
        factoryWasteQty: material.factoryWasteQty,
        siteInputQty: material.siteInputQty,
        siteWasteQty: material.siteWasteQty,
        grossInputMassTonnes: material.grossInputMassTonnes,
        deliveredToSiteMassTonnes: material.deliveredToSiteMassTonnes,

        storedBiogenicCarbonKgCO2e: material.storedBiogenicCarbonKgCO2e,
        biogenicFormula,
      };
    })
    .sort((a, b) => b.subtotal - a.subtotal);

  const topMaterial = materialBreakdown[0] ?? null;

  return (
    <div className="space-y-8">
      <SectionCard
        title="Material breakdown"
        description={`Saved engineering breakdown for ${project.project_name}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#667085]">
              Project breakdown
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
              {project.project_name}
            </h2>
            <p className="mt-3 text-sm text-[#667085]">
              Last calculated:{" "}
              {projectResult.updated_at
                ? new Date(projectResult.updated_at).toLocaleString("en-GB")
                : "—"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/projects/${projectId}/results`}
              className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937]"
            >
              Back to Results
            </Link>
            <Link
              href={`/projects/${projectId}/reports`}
              className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
            >
              View Reports
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">
              Total embodied carbon
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(total)}
            </p>
            <div className="mt-3 h-1.5 w-20 rounded-full bg-cygnum-green" />
            <p className="mt-3 text-sm text-[#667085]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">
              Carbon intensity (A1-A5)
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(intensity)}
            </p>
            <p className="mt-3 text-sm text-[#667085]">kgCO₂e/m²</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">
              Upfront carbon
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(upfront)}
            </p>
            <p className="mt-3 text-sm text-[#667085]">kgCO₂e A1-A5</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">
              Top material
            </p>
            <p className="mt-3 truncate text-xl font-semibold tracking-tight text-[#1F2937]">
              {topMaterial ? topMaterial.name : "—"}
            </p>
            <p className="mt-3 text-sm text-[#667085]">
              {topMaterial ? `${formatNumber(topMaterial.subtotal)} kgCO₂e` : "No data"}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Module summary"
        description="Compact overview of lifecycle module contributions."
      >
        <div className="rounded-2xl border border-[#E3E8EC] bg-white p-5">
          <div className="h-5 overflow-hidden rounded-full bg-[#E8EEF2]">
            <div className="flex h-full w-full overflow-hidden rounded-full">
              {moduleRows.map((row) => {
                const percent = total > 0 ? (row.value / total) * 100 : 0;
                return (
                  <div
                    key={row.label}
                    className="h-full"
                    style={{
                      width: `${Math.max(percent, 0)}%`,
                      backgroundColor: row.color,
                    }}
                    title={`${row.label}: ${formatNumber(row.value)} kgCO₂e`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {moduleRows.map((row) => {
              const percent = total > 0 ? (row.value / total) * 100 : 0;
              return (
                <div
                  key={row.label}
                  className="rounded-xl border border-[#EEF2F4] bg-[#FAFCFC] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {row.label}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#667085]">
                      {formatPercent(percent)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    {formatNumber(row.value)} kgCO₂e
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Material calculation sections"
        description="Expand a material to inspect the full quantity flow and calculation basis."
      >
        <MaterialBreakdownList items={materialBreakdown} />
      </SectionCard>
    </div>
  );
}