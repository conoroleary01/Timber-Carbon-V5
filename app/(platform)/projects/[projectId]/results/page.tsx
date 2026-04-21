import Link from "next/link";
import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
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

export default async function ResultsPage({
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
          title="Results"
          description="No saved calculation result was found for this project yet."
        >
          <div className="rounded-xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              No results yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#667085]">
              Complete mapping and run the project calculation to generate results.
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

  const total = result.modules.embodiedCarbonTotalKgCO2e;
  const upfront = result.modules.upfrontCarbonKgCO2e;
  const reportingArea = input.reportingAreaM2 || 0;
  const intensity = result.modules.embodiedCarbonPerM2KgCO2e ?? 0;
  const materialsCount = result.materials.length;

  const moduleRows = [
    {
      label: "A1-A3",
      description: "Materials, inbound transport, manufacturing",
      value: result.modules.finishedProductA1A3KgCO2e,
    },
    {
      label: "A4",
      description: "Delivery to site",
      value: result.modules.A4KgCO2e,
    },
    {
      label: "A5",
      description: "Construction and site stage",
      value: result.modules.A5KgCO2e,
    },
    {
      label: "B2",
      description: "Maintenance",
      value: result.modules.B2KgCO2e,
    },
    {
      label: "B3",
      description: "Repair",
      value: result.modules.B3KgCO2e,
    },
    {
      label: "C1",
      description: "Deconstruction / demolition",
      value: result.modules.C1KgCO2e,
    },
    {
      label: "C2",
      description: "Transport at end of life",
      value: result.modules.C2KgCO2e,
    },
    {
      label: "C3-C4",
      description: "Processing and disposal",
      value: result.modules.C3C4KgCO2e,
    },
  ];

  const highestModule =
    moduleRows.slice().sort((a, b) => b.value - a.value)[0] ?? null;

  const materialInputById = new Map(
    (input.materials ?? []).map((material) => [material.id, material]),
  );

  const topContributors = result.materials
    .map((material) => {
      const source = materialInputById.get(material.id);

      const a4Factor =
        input.moduleDefaults?.a4TransportFactorKgCO2ePerTkm ?? 0;
      const a4Distance = input.factory?.a4DistanceKm ?? 0;

      const a4 =
        material.deliveredToSiteMassTonnes * a4Distance * a4Factor;

      const c2 =
        material.installedMassKg * (source?.c2KgCO2ePerKg ?? 0);

      const c3c4 =
        material.installedMassKg * (source?.c3c4KgCO2ePerKg ?? 0);

      const subtotal =
        material.supplierA1A3GrossKgCO2e +
        material.inboundTransportKgCO2e +
        material.factoryWasteTransportKgCO2e +
        material.factoryWasteTreatmentKgCO2e +
        a4 +
        material.a5BiogenicKgCO2e +
        c2 +
        c3c4;

      return {
        id: material.id,
        name: material.name,
        category: source?.materialFamily ?? "—",
        subtotal,
        intensity: reportingArea > 0 ? subtotal / reportingArea : 0,
      };
    })
    .sort((a, b) => b.subtotal - a.subtotal)
    .slice(0, 5);

  const biogenicMaterials = result.materials
    .map((material) => {
      const source = materialInputById.get(material.id);

      const timberLike =
        (source?.materialFamily ?? "").toLowerCase().includes("timber") ||
        (source?.materialFamily ?? "").toLowerCase().includes("wood") ||
        (source?.materialFamily ?? "").toLowerCase().includes("osb") ||
        (source?.materialFamily ?? "").toLowerCase().includes("clt") ||
        (source?.biogenicMethod ?? "none") !== "none";

      return {
        id: material.id,
        name: material.name,
        category: source?.materialFamily ?? "—",
        timberLike,
        stored: material.storedBiogenicCarbonKgCO2e,
        released: material.a5BiogenicKgCO2e,
        net: material.netStoredBiogenicCarbonKgCO2e,
      };
    })
    .filter((item) => item.timberLike)
    .sort((a, b) => Math.abs(b.stored) - Math.abs(a.stored))
    .slice(0, 5);

  const timberStoredTotal = biogenicMaterials.reduce(
    (sum, item) => sum + item.stored,
    0,
  );

  const timberLinesCount = biogenicMaterials.length;
  const upfrontShare = total > 0 ? (upfront / total) * 100 : 0;

  return (
    <div className="space-y-8">
      <SectionCard
        title="Results overview"
        description={`Saved calculation result for ${project.project_name}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#667085]">
              Project result
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
              href={`/projects/${projectId}/mapping`}
              className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937]"
            >
              Back to Mapping
            </Link>
            <Link
              href={`/projects/${projectId}/breakdown`}
              className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
            >
              View Breakdown
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_0.9fr]">
          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-6">
            <p className="text-sm font-medium text-[#667085]">
              Total embodied carbon
            </p>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(total)}
            </p>
            <div className="mt-4 h-1.5 w-28 rounded-full bg-cygnum-green" />
            <p className="mt-3 text-sm text-[#667085]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-6">
            <p className="text-sm font-medium text-[#667085]">
              Carbon intensity
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(intensity)}
            </p>
            <p className="mt-3 text-sm text-[#667085]">kgCO₂e/m²</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-6">
            <p className="text-sm font-medium text-[#667085]">
              Upfront carbon A1-A5
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(upfront)}
            </p>
            <p className="mt-3 text-sm text-[#667085]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-6">
            <p className="text-sm font-medium text-[#667085]">
              Material lines assessed
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {materialsCount}
            </p>
            <p className="mt-3 text-sm text-[#667085]">mapped lines</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-8 xl:grid-cols-[1.55fr_0.85fr]">
        <SectionCard
          title="Lifecycle module breakdown"
          description="Headline module contributions to total embodied carbon."
        >
          <div className="space-y-4">
            {moduleRows.map((row) => {
              const percent = total > 0 ? (row.value / total) * 100 : 0;

              return (
                <div
                  key={row.label}
                  className="rounded-2xl border border-[#E3E8EC] bg-white px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-base font-semibold text-[#1F2937]">
                          {row.label}
                        </p>
                        <span className="rounded-full bg-[#F3F6F8] px-2.5 py-1 text-xs font-medium text-[#667085]">
                          {formatPercent(percent)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#667085]">
                        {row.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#1F2937]">
                        {formatNumber(row.value)}
                      </p>
                      <p className="text-xs text-[#667085]">kgCO₂e</p>
                    </div>
                  </div>

                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#E8EEF2]">
                    <div
                      className="h-full rounded-full bg-cygnum-green"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-8">
          <SectionCard
            title="Biogenic carbon"
            description="Timber-related storage visible at project level."
          >
            <div className="rounded-2xl border border-[#CFE7D9] bg-[#E8F5EE] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4D6B59]">
                Stored biogenic total
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
                {formatNumber(timberStoredTotal)}
              </p>
              <p className="mt-2 text-sm text-[#567164]">kgCO₂e in asset</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#D7E9DE] bg-white/70 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                    Timber / biogenic lines
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#1F2937]">
                    {timberLinesCount}
                  </p>
                </div>

                <div className="rounded-xl border border-[#D7E9DE] bg-white/70 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                    Project area
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#1F2937]">
                    {formatNumber(reportingArea)}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Key observations"
            description="A quick read of the saved result."
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-[#D9E1E7] bg-[#F7F9FA] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                  Highest module
                </p>
                <p className="mt-2 text-lg font-semibold text-[#1F2937]">
                  {highestModule ? highestModule.label : "—"}
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  {highestModule
                    ? `${formatNumber(highestModule.value)} kgCO₂e`
                    : "No data"}
                </p>
              </div>

              <div className="rounded-xl border border-[#D9E1E7] bg-[#F7F9FA] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                  Upfront share
                </p>
                <p className="mt-2 text-lg font-semibold text-[#1F2937]">
                  {formatPercent(upfrontShare)}
                </p>
                <p className="mt-1 text-sm text-[#667085]">
                  Portion of total from A1-A5
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Top material contributors"
        description="Highest material-linked contributions. Project-level A5 fossil, B2, B3, and C1 are not allocated to individual materials here."
      >
        <div className="overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
          <table className="min-w-full divide-y divide-[#D9E1E7]">
            <thead className="bg-[#F7F9FA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Material
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  kgCO₂e
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  % of total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  kgCO₂e/m²
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#D9E1E7] bg-white">
              {topContributors.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#667085]">
                    {item.category}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {total > 0 ? formatPercent((item.subtotal / total) * 100) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.intensity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Timber and biogenic contributors"
        description="Materials with timber-like or biogenic behaviour, ranked by stored biogenic carbon magnitude."
      >
        <div className="overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
          <table className="min-w-full divide-y divide-[#D9E1E7]">
            <thead className="bg-[#F7F9FA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Material
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Stored in asset
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  A5 release
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Net after A5
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#D9E1E7] bg-white">
              {biogenicMaterials.length > 0 ? (
                biogenicMaterials.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#667085]">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                      {formatNumber(item.stored)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                      {formatNumber(item.released)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                      {formatNumber(item.net)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#667085]"
                  >
                    No timber or biogenic material results were found in this saved result.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}