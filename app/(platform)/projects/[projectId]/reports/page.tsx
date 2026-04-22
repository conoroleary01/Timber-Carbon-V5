import Link from "next/link";
import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
import PrintReportButton from "@/components/reports/print-report-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CalculationResult, ProjectInput } from "@/lib/types";

type ReportInput = ProjectInput & {
  assumptions?: string[];
  moduleDefaults?: Record<string, unknown>;
  projectLocation?: string;
};

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\bkgco2e\b/gi, "kgCO₂e")
    .replace(/\bm2\b/gi, "m²")
    .replace(/\ba1\b/gi, "A1")
    .replace(/\ba4\b/gi, "A4")
    .replace(/\ba5\b/gi, "A5")
    .replace(/\bb2\b/gi, "B2")
    .replace(/\bb3\b/gi, "B3")
    .replace(/\bc1\b/gi, "C1")
    .replace(/\bc2\b/gi, "C2")
    .replace(/\bc3\b/gi, "C3")
    .replace(/\bc4\b/gi, "C4")
    .replace(/\bc3 c4\b/gi, "C3-C4")
    .replace(/\bgia\b/gi, "GIA")
    .replace(/\bepd\b/gi, "EPD")
    .replace(/\bco2e\b/gi, "CO₂e")
    .replace(/\s+/g, " ")
    .trim();
}

function getModuleValue(modules: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = modules[key];
    if (typeof value === "number") return value;
  }
  return 0;
}

function getIntensityBand(intensity: number) {
  if (intensity <= 50) return "A++";
  if (intensity <= 100) return "A+";
  if (intensity <= 150) return "A";
  if (intensity <= 200) return "B";
  if (intensity <= 250) return "C";
  if (intensity <= 300) return "D";
  if (intensity <= 350) return "E";
  if (intensity <= 400) return "F";
  return "G";
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[#E7ECEF] py-2 last:border-b-0">
      <span className="text-sm text-[#667085]">{label}</span>
      <span className="text-right text-sm font-medium text-[#1F2937]">
        {value}
      </span>
    </div>
  );
}

function FormulaBlock({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="report-formula rounded-xl border border-[#E5EAEE] bg-[#FBFCFD] p-4">
      <p className="text-sm font-semibold text-[#1F2937]">{title}</p>
      <div className="mt-3 space-y-2 font-mono text-xs leading-6 text-[#52606D]">
        {lines.map((line, index) => (
          <p key={`${title}-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function IntensityScoreCard({ intensity }: { intensity: number }) {
  const bands = [
    { label: "A++", min: 0, max: 50, color: "#0A8F4E" },
    { label: "A+", min: 50, max: 100, color: "#4FBA5B" },
    { label: "A", min: 100, max: 150, color: "#A7C93A" },
    { label: "B", min: 150, max: 200, color: "#E6DF31" },
    { label: "C", min: 200, max: 250, color: "#F3C53E" },
    { label: "D", min: 250, max: 300, color: "#F68A1E" },
    { label: "E", min: 300, max: 350, color: "#F3312C" },
    { label: "F", min: 350, max: 400, color: "#D91E2E" },
    { label: "G", min: 400, max: 450, color: "#9E1B22" },
  ];

  const clamped = Math.max(0, Math.min(449, intensity));
  const arrowTop = `${(clamped / 450) * 100}%`;
  const band = getIntensityBand(intensity);

  return (
    <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
      <div className="border-b border-[#E7ECEF] pb-3">
        <h3 className="text-lg font-semibold text-[#1F2937]">Carbon intensity score</h3>
        <p className="mt-1 text-sm text-[#667085]">
          Structural embodied carbon intensity benchmark card.
        </p>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[0.95fr_0.75fr]">
        <div className="relative rounded-xl border border-[#E7ECEF] bg-[#FCFDFC] p-4">
          <div className="mb-3 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">
              Structural embodied carbon
            </p>
            <p className="text-xs text-[#667085]">Modules A1-A5 · kgCO₂e / m² GIA</p>
          </div>

          <div className="relative pr-28">
            <div className="space-y-2">
              {bands.map((item) => (
                <div
                  key={item.label}
                  className="relative h-10 overflow-hidden rounded-r-full"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="flex h-full items-center justify-between px-4 text-white">
                    <span className="font-bold">{item.label}</span>
                    <span className="text-xs">
                      {item.min === 400 ? ">400" : `${item.min}-${item.max}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="pointer-events-none absolute right-0 flex -translate-y-1/2 items-center gap-2"
              style={{ top: arrowTop }}
            >
              <div className="h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-black" />
              <div className="rounded-md bg-black px-3 py-2 text-center text-white shadow-sm">
                <div className="text-base font-bold">{band}</div>
                <div className="text-xs">{formatNumber(intensity)} kgCO₂e/m²</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#D9E1E7] bg-[#F7F9FA] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
            Rating interpretation
          </p>
          <p className="mt-2 text-xl font-semibold text-[#1F2937]">{band}</p>
          <p className="mt-3 text-sm text-[#667085]">
            This score is positioned using the project carbon intensity value on the
            0 to 400+ scale shown on the left.
          </p>
          <div className="mt-5 space-y-2">
            <DataRow label="Project intensity" value={`${formatNumber(intensity)} kgCO₂e/m²`} />
            <DataRow label="Score band" value={band} />
            <DataRow label="Assessment basis" value="Structural embodied carbon · A1-A5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, project_name, project_location")
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
          title="Engineering report"
          description="No saved calculation result was found for this project yet."
        >
          <div className="rounded-xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-[#1F2937]">
              No report available
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#667085]">
              Run the project calculation first to generate a saved report.
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

  const input = projectResult.input_json as ReportInput;
  const result = projectResult.result_json as CalculationResult;
  const modules = result.modules as unknown as Record<string, unknown>;

  const total = getModuleValue(modules, ["embodiedCarbonTotalKgCO2e"]);
  const upfront = getModuleValue(modules, ["upfrontCarbonKgCO2e"]);
  const intensity = getModuleValue(modules, ["upfrontCarbonPerM2KgCO2e"]);
  const upfrontIntensity = getModuleValue(modules, ["upfrontCarbonPerM2KgCO2e"]);
  const storedBiogenic = getModuleValue(modules, ["storedBiogenicCarbonKgCO2e"]);
  const a5Biogenic = getModuleValue(modules, ["A5BiogenicKgCO2e"]);
  const netStoredBiogenic = getModuleValue(modules, ["netStoredBiogenicCarbonKgCO2e"]);
  const a1a3 = getModuleValue(modules, ["finishedProductA1A3KgCO2e"]);
  const a4 = getModuleValue(modules, ["A4KgCO2e"]);
  const a5 = getModuleValue(modules, ["A5KgCO2e"]);
  const b2 = getModuleValue(modules, ["B2KgCO2e"]);
  const b3 = getModuleValue(modules, ["B3KgCO2e"]);
  const c1 = getModuleValue(modules, ["C1KgCO2e"]);
  const c2 = getModuleValue(modules, ["C2KgCO2e"]);
  const c3c4 = getModuleValue(modules, ["C3C4KgCO2e"]) || (
    getModuleValue(modules, ["C3KgCO2e"]) + getModuleValue(modules, ["C4KgCO2e"])
  );

  const moduleRows = [
    { label: "A1-A3", description: "Materials, inbound transport, manufacturing", value: a1a3, color: "#008A5A" },
    { label: "A4", description: "Delivery to site", value: a4, color: "#36A873" },
    { label: "A5", description: "Construction and site stage", value: a5, color: "#7CC9A8" },
    { label: "B2", description: "Maintenance", value: b2, color: "#5C8FBE" },
    { label: "B3", description: "Repair", value: b3, color: "#8AAAD3" },
    { label: "C1", description: "Deconstruction / demolition", value: c1, color: "#C9B458" },
    { label: "C2", description: "Transport at end of life", value: c2, color: "#D69A4D" },
    { label: "C3-C4", description: "Processing and disposal", value: c3c4, color: "#C97862" },
  ];

  const materialInputById = new Map(
    (input.materials ?? []).map((material) => [material.id, material]),
  );

  const a4Factor =
    typeof input.moduleDefaults?.a4TransportFactorKgCO2ePerTkm === "number"
      ? input.moduleDefaults.a4TransportFactorKgCO2ePerTkm
      : 0.1211;

  const materialRows = result.materials
    .map((material) => {
      const source = materialInputById.get(material.id);

      const materialA4 =
        material.deliveredToSiteMassTonnes *
        (input.factory?.a4DistanceKm ?? 0) *
        a4Factor;

      const c2Factor = typeof source?.c2KgCO2ePerKg === "number" ? source.c2KgCO2ePerKg : 0;
      const c3c4Factor =
        typeof source?.c3c4KgCO2ePerKg === "number" ? source.c3c4KgCO2ePerKg : 0;

      const materialC2 = material.installedMassKg * c2Factor;
      const materialC3C4 = material.installedMassKg * c3c4Factor;

      const subtotal =
        material.supplierA1A3GrossKgCO2e +
        material.inboundTransportKgCO2e +
        material.factoryWasteTransportKgCO2e +
        material.factoryWasteTreatmentKgCO2e +
        materialA4 +
        material.a5BiogenicKgCO2e +
        materialC2 +
        materialC3C4;

      return {
        source,
        material,
        materialA4,
        materialC2,
        materialC3C4,
        subtotal,
        share: total > 0 ? (subtotal / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.subtotal - a.subtotal);

  const topHotspots = materialRows.slice(0, 10);
  const topMaterial = topHotspots[0] ?? null;
  const highestModule =
    moduleRows.slice().sort((a, b) => b.value - a.value)[0] ?? null;

  const assumptions = input.assumptions ?? [];
  const moduleDefaultsEntries = Object.entries(input.moduleDefaults ?? {});

  return (
    <div className="report-print-root report-document space-y-8">
      <section className="report-section report-cover rounded-2xl border border-[#D9E1E7] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 border-b border-[#E7ECEF] pb-5 print:border-b print:pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#667085]">
              Engineering carbon report
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
              {project.project_name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
              Embodied carbon assessment report for project review, engineering audit,
              and print issue. This report is based on the saved project input and
              result snapshot at the calculation timestamp shown below.
            </p>
          </div>

          <div className="print-hidden flex flex-wrap gap-3">
            <Link
              href={`/projects/${projectId}/results`}
              className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937]"
            >
              Back to Results
            </Link>
            <PrintReportButton />
            <Link
  href={`/projects/${projectId}/reports/pdf`}
  target="_blank"
  className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937]"
>
  Export PDF
</Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">Total embodied carbon</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(total)}
            </p>
            <p className="mt-2 text-sm text-[#667085]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">Carbon intensity</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(intensity)}
            </p>
            <p className="mt-2 text-sm text-[#667085]">kgCO₂e/m²</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">Upfront carbon A1-A5</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(upfront)}
            </p>
            <p className="mt-2 text-sm text-[#667085]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#CFE7D9] bg-[#E8F5EE] p-5">
            <p className="text-sm font-medium text-[#567164]">Stored biogenic in asset</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[#1F2937]">
              {formatNumber(storedBiogenic)}
            </p>
            <p className="mt-2 text-sm text-[#567164]">kgCO₂e</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-[#667085] md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#E7ECEF] bg-[#FAFCFC] px-4 py-3">
            <span className="font-medium text-[#1F2937]">Project location:</span>{" "}
            {project.project_location ?? "—"}
          </div>
          <div className="rounded-xl border border-[#E7ECEF] bg-[#FAFCFC] px-4 py-3">
            <span className="font-medium text-[#1F2937]">Reporting area:</span>{" "}
            {formatNumber(input.reportingAreaM2)} m²
          </div>
          <div className="rounded-xl border border-[#E7ECEF] bg-[#FAFCFC] px-4 py-3">
            <span className="font-medium text-[#1F2937]">Reference study period:</span>{" "}
            {input.referenceStudyPeriodYears} years
          </div>
          <div className="rounded-xl border border-[#E7ECEF] bg-[#FAFCFC] px-4 py-3">
            <span className="font-medium text-[#1F2937]">Last calculated:</span>{" "}
            {projectResult.updated_at
              ? new Date(projectResult.updated_at).toLocaleString("en-GB")
              : "—"}
          </div>
        </div>
      </section>

      <section className="report-section grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Executive summary"
          description="Headline project results for rapid engineering review."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#D9E1E7] bg-[#FAFCFC] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Highest lifecycle module
              </p>
              <p className="mt-2 text-lg font-semibold text-[#1F2937]">
                {highestModule ? highestModule.label : "—"}
              </p>
              <p className="mt-1 text-sm text-[#667085]">
                {highestModule ? `${formatNumber(highestModule.value)} kgCO₂e` : "No data"}
              </p>
            </div>

            <div className="rounded-xl border border-[#D9E1E7] bg-[#FAFCFC] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Top material hotspot
              </p>
              <p className="mt-2 text-lg font-semibold text-[#1F2937]">
                {topMaterial ? topMaterial.material.name : "—"}
              </p>
              <p className="mt-1 text-sm text-[#667085]">
                {topMaterial ? `${formatNumber(topMaterial.subtotal)} kgCO₂e` : "No data"}
              </p>
            </div>

            <div className="rounded-xl border border-[#D9E1E7] bg-[#FAFCFC] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Upfront share of total
              </p>
              <p className="mt-2 text-lg font-semibold text-[#1F2937]">
                {total > 0 ? formatPercent((upfront / total) * 100) : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[#D9E1E7] bg-[#FAFCFC] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                Net stored biogenic after A5
              </p>
              <p className="mt-2 text-lg font-semibold text-[#1F2937]">
                {formatNumber(netStoredBiogenic)}
              </p>
              <p className="mt-1 text-sm text-[#667085]">kgCO₂e</p>
            </div>
          </div>
        </SectionCard>

        <IntensityScoreCard intensity={intensity} />
      </section>

      <section className="report-section report-break-before grid gap-8 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Project definition and scope"
          description="Report basis and project-level inputs."
        >
          <div className="space-y-2">
            <DataRow label="Project name" value={input.projectName} />
            <DataRow label="Project location" value={project.project_location ?? "—"} />
            <DataRow label="Reporting area" value={`${formatNumber(input.reportingAreaM2)} m²`} />
            <DataRow label="GIA demolished" value={`${formatNumber(input.giaDemolishedM2)} m²`} />
            <DataRow
              label="Reference study period"
              value={`${input.referenceStudyPeriodYears} years`}
            />
            <DataRow label="Upfront carbon basis" value="A1-A5" />
            <DataRow label="Embodied total basis" value="A1-A5 + B2 + B3 + C1 + C2 + C3-C4" />
            <DataRow label="Factory allocated manufacturing" value={`${formatNumber(input.factory.allocatedManufacturingKgCO2e)} kgCO₂e`} />
            <DataRow label="A4 site distance" value={`${formatNumber(input.factory.a4DistanceKm)} km`} />
          </div>
        </SectionCard>

        <SectionCard
          title="Assumptions and defaults"
          description="Saved assumptions and active module defaults used in this report."
        >
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-[#1F2937]">Assumptions</p>
              {assumptions.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {assumptions.map((assumption, index) => (
                    <li
                      key={`${assumption}-${index}`}
                      className="rounded-lg border border-[#E7ECEF] bg-[#FAFCFC] px-3 py-2 text-sm text-[#52606D]"
                    >
                      {assumption}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#667085]">No explicit assumptions listed.</p>
              )}
            </div>

            <div className="border-t border-[#E7ECEF] pt-5">
              <p className="text-sm font-semibold text-[#1F2937]">Module defaults</p>
              {moduleDefaultsEntries.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {moduleDefaultsEntries.map(([key, value]) => (
                    <DataRow
                      key={key}
                      label={formatLabel(key)}
                      value={typeof value === "number" ? formatNumber(value, 4) : String(value)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#667085]">No module defaults snapshot found.</p>
              )}
            </div>
          </div>
        </SectionCard>
      </section>

    <div className="report-section">
      <SectionCard
        title="Lifecycle results overview"
        description="Project-level lifecycle module totals and relative share of total embodied carbon."
      >
        <div className="rounded-2xl border border-[#E3E8EC] bg-white p-5">
          <div className="h-6 overflow-hidden rounded-full bg-[#E8EEF2]">
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

          <div className="report-table overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
            <table className="min-w-full divide-y divide-[#D9E1E7]">
              <thead className="bg-[#F7F9FA]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    kgCO₂e
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    % of total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1E7] bg-white">
                {moduleRows.map((row) => {
                  const percent = total > 0 ? (row.value / total) * 100 : 0;

                  return (
                    <tr key={row.label}>
                      <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                          {row.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#667085]">{row.description}</td>
                      <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                        {formatNumber(row.value)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                        {formatPercent(percent)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-[#FAFCFC]">
                  <td className="px-4 py-3 text-sm font-semibold text-[#1F2937]" colSpan={2}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-[#1F2937]">
                    {formatNumber(total)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-[#1F2937]">
                    100.0%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
     </div>

     <div className="report-section">
      <SectionCard
        title="Biogenic carbon summary"
        description="Project-level timber and biogenic carbon position."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#CFE7D9] bg-[#E8F5EE] p-5">
            <p className="text-sm font-medium text-[#567164]">Stored in asset</p>
            <p className="mt-3 text-3xl font-semibold text-[#1F2937]">
              {formatNumber(storedBiogenic)}
            </p>
            <p className="mt-2 text-sm text-[#567164]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">A5 biogenic release</p>
            <p className="mt-3 text-3xl font-semibold text-[#1F2937]">
              {formatNumber(a5Biogenic)}
            </p>
            <p className="mt-2 text-sm text-[#667085]">kgCO₂e</p>
          </div>

          <div className="rounded-2xl border border-[#D9E1E7] bg-white p-5">
            <p className="text-sm font-medium text-[#667085]">Net stored after A5</p>
            <p className="mt-3 text-3xl font-semibold text-[#1F2937]">
              {formatNumber(netStoredBiogenic)}
            </p>
            <p className="mt-2 text-sm text-[#667085]">kgCO₂e</p>
          </div>
        </div>
      </SectionCard>
    </div>

     <div className="report-section">
      <SectionCard
        title="Material hotspot summary"
        description="Highest material-linked contributors from the saved result."
      >
        <div className="report-table overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
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
                  Subtotal kgCO₂e
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  % of total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Installed mass kg
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E1E7] bg-white">
              {topHotspots.map((item) => (
                <tr key={item.material.id}>
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">
                    {item.material.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#667085]">
                    {item.source?.materialFamily ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatPercent(item.share)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.material.installedMassKg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      </div>
     <div className="report-section">
      <SectionCard
        title="Full material schedule"
        description="Saved material schedule with quantities, masses, carbon outputs, and biogenic values."
      >
        <div className="report-table overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
          <table className="min-w-full divide-y divide-[#D9E1E7]">
            <thead className="bg-[#F7F9FA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Material
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Declared qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Installed mass kg
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Supplier A1-A3 gross
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Inbound
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Stored biogenic
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E1E7] bg-white">
              {materialRows.map((item) => (
                <tr key={item.material.id}>
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">
                    {item.material.name}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.material.declaredInstalledQty, 4)} {item.material.declaredUnit}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.material.installedMassKg, 4)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.material.supplierA1A3GrossKgCO2e, 4)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.material.inboundTransportKgCO2e, 4)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(item.material.storedBiogenicCarbonKgCO2e, 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      </div>

     <div className="report-section report-break-before">
      <SectionCard
        title="Detailed calculation appendix"
        description="Engineer-readable calculation sheets for each saved material line."
      >
        <div className="space-y-6">
          {materialRows.map((item, index) => {
            const source = item.source;
            const material = item.material;
            const biogenicLines =
              source?.biogenicMethod === "fallback_1_64"
                ? [
                    `Installed mass × wood mass fraction × (-1.64)`,
                    `${formatNumber(material.installedMassKg, 4)} × ${formatNumber(source?.woodMassFraction ?? 1, 4)} × (-1.64) = ${formatNumber(material.storedBiogenicCarbonKgCO2e, 4)} kgCO₂e`,
                  ]
                : source?.biogenicMethod === "epd"
                  ? [
                      `Declared installed quantity × EPD stored biogenic factor`,
                      `${formatNumber(material.declaredInstalledQty, 4)} × ${formatNumber(source?.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit ?? 0, 4)} = ${formatNumber(material.storedBiogenicCarbonKgCO2e, 4)} kgCO₂e`,
                    ]
                  : ["No biogenic storage method applied"];

            return (
              <div
                key={material.id}
                className="report-avoid-break rounded-2xl border border-[#D9E1E7] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#E7ECEF] pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#667085]">
                      Material sheet {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#1F2937]">
                      {material.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#667085]">
                      Category: {source?.materialFamily ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-[#667085]">
                      Material subtotal
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#1F2937]">
                      {formatNumber(item.subtotal)} kgCO₂e
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-xl border border-[#E5EAEE] bg-[#FBFCFD] p-4">
                    <p className="text-sm font-semibold text-[#1F2937]">Source inputs</p>
                    <div className="mt-3 space-y-1">
                      <DataRow label="BoQ quantity" value={`${formatNumber(source?.boqQty ?? material.boqQty, 4)} ${source?.boqUnit ?? material.boqUnit}`} />
                      <DataRow label="Declared unit" value={material.declaredUnit} />
                      <DataRow label="Factory waste rate" value={`${formatNumber((source?.factoryWasteRate ?? 0) * 100, 2)}%`} />
                      <DataRow label="Site waste rate" value={`${formatNumber((source?.siteWasteRate ?? 0) * 100, 2)}%`} />
                      <DataRow label="EPD A1-A3 factor" value={`${formatNumber(source?.epdA1A3KgCO2ePerDeclaredUnit ?? 0, 4)} kgCO₂e/${material.declaredUnit}`} />
                      <DataRow label="Inbound distance" value={`${formatNumber(source?.inboundDistanceKm ?? 0, 2)} km`} />
                      <DataRow label="Inbound transport factor" value={`${formatNumber(source?.inboundTransportKgCO2ePerTkm ?? 0, 4)} kgCO₂e/tkm`} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E5EAEE] bg-[#FBFCFD] p-4">
                    <p className="text-sm font-semibold text-[#1F2937]">Resolved quantities and results</p>
                    <div className="mt-3 space-y-1">
                      <DataRow label="Declared installed quantity" value={`${formatNumber(material.declaredInstalledQty, 4)} ${material.declaredUnit}`} />
                      <DataRow label="Gross factory input quantity" value={`${formatNumber(material.grossFactoryInputQty, 4)} ${material.declaredUnit}`} />
                      <DataRow label="Installed mass" value={`${formatNumber(material.installedMassKg, 4)} kg`} />
                      <DataRow label="Supplier A1-A3 gross" value={`${formatNumber(material.supplierA1A3GrossKgCO2e, 4)} kgCO₂e`} />
                      <DataRow label="Inbound transport" value={`${formatNumber(material.inboundTransportKgCO2e, 4)} kgCO₂e`} />
                      <DataRow label="Stored biogenic carbon" value={`${formatNumber(material.storedBiogenicCarbonKgCO2e, 4)} kgCO₂e`} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  <FormulaBlock
                    title="Declared installed quantity"
                    lines={[
                      "BoQ quantity × active conversion factor",
                      `${formatNumber(source?.boqQty ?? material.boqQty, 4)} × conversion factor = ${formatNumber(material.declaredInstalledQty, 4)} ${material.declaredUnit}`,
                    ]}
                  />

                  <FormulaBlock
                    title="Gross factory input quantity"
                    lines={[
                      "Declared installed quantity ÷ (1 - factory waste rate)",
                      `${formatNumber(material.declaredInstalledQty, 4)} ÷ (1 - ${formatNumber(source?.factoryWasteRate ?? 0, 4)}) = ${formatNumber(material.grossFactoryInputQty, 4)} ${material.declaredUnit}`,
                    ]}
                  />

                  <FormulaBlock
                    title="Supplier A1-A3 gross"
                    lines={[
                      "Gross factory input quantity × EPD A1-A3 factor",
                      `${formatNumber(material.grossFactoryInputQty, 4)} × ${formatNumber(source?.epdA1A3KgCO2ePerDeclaredUnit ?? 0, 4)} = ${formatNumber(material.supplierA1A3GrossKgCO2e, 4)} kgCO₂e`,
                    ]}
                  />

                  <FormulaBlock
                    title="Inbound transport"
                    lines={[
                      "Gross input mass × distance × transport factor",
                      `${formatNumber(material.grossInputMassTonnes, 6)} × ${formatNumber(source?.inboundDistanceKm ?? 0, 2)} × ${formatNumber(source?.inboundTransportKgCO2ePerTkm ?? 0, 4)} = ${formatNumber(material.inboundTransportKgCO2e, 4)} kgCO₂e`,
                    ]}
                  />

                  <FormulaBlock
                    title="Installed mass"
                    lines={[
                      "Declared installed quantity × active mass factor × 1000",
                      `${formatNumber(material.declaredInstalledQty, 4)} × active mass factor × 1000 = ${formatNumber(material.installedMassKg, 4)} kg`,
                    ]}
                  />

                  <FormulaBlock
                    title="Stored biogenic carbon"
                    lines={biogenicLines}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
      </div>

     <div className="report-section">
      <SectionCard
        title="Calculation checks and audit notes"
        description="Internal checks carried with the saved result snapshot."
      >
        <div className="report-table overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
          <table className="min-w-full divide-y divide-[#D9E1E7]">
            <thead className="bg-[#F7F9FA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Check
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E1E7] bg-white">
              {result.checks.map((check, index) => (
                <tr key={`${check.name}-${index}`}>
                  <td className="px-4 py-3 text-sm text-[#1F2937]">{check.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        check.pass
                          ? "bg-[#E8F5EF] text-cygnum-green"
                          : "bg-[#FFF5F7] text-[#B21E4B]"
                      }`}
                    >
                      {check.pass ? "Pass" : "Check"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                    {formatNumber(check.difference, 8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      </div>
    </div>
  );
}