import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildProjectInputFromSupabase } from "@/lib/calc/build-project-input";
import { calculateProject } from "@/lib/calc";

export default async function DebugInputPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, project_name")
    .eq("id", Number(projectId))
    .single();

  if (error || !project) {
    notFound();
  }

  const { projectInput } = await buildProjectInputFromSupabase(project.id);

  let calculationResult: ReturnType<typeof calculateProject> | null = null;
  let calculationError: string | null = null;

  try {
    calculationResult = calculateProject(projectInput);
  } catch (error) {
    calculationError =
      error instanceof Error ? error.message : "Unknown calculation error";
  }

  return (
    <div className="space-y-8">
      <SectionCard
        title="Debug calculation input"
        description="Temporary page to inspect the ProjectInput being built from Supabase before fully wiring project calculations."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
              Project
            </div>
            <div className="mt-2 text-sm font-semibold text-[#1F2937]">
              {projectInput.projectName}
            </div>
          </div>

          <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
              Reporting area
            </div>
            <div className="mt-2 text-sm font-semibold text-[#1F2937]">
              {projectInput.reportingAreaM2} m²
            </div>
          </div>

          <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
              A4 distance
            </div>
            <div className="mt-2 text-sm font-semibold text-[#1F2937]">
              {projectInput.factory.a4DistanceKm} km
            </div>
          </div>

          <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
              Material lines
            </div>
            <div className="mt-2 text-sm font-semibold text-[#1F2937]">
              {projectInput.materials.length}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#D9E1E7] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#1F2937]">
            ProjectInput JSON
          </h3>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-[#F7F9FA] p-4 text-xs text-[#1F2937]">
            {JSON.stringify(projectInput, null, 2)}
          </pre>
        </div>
      </SectionCard>

      <SectionCard
        title="Debug calculation run"
        description="This uses the existing calculation engine against the Supabase-built ProjectInput."
      >
        {calculationError ? (
          <div className="rounded-lg border border-[#f1c7d4] bg-[#fff5f7] p-4 text-sm text-[#B21E4B]">
            <div className="font-semibold">Calculation failed</div>
            <div className="mt-2">{calculationError}</div>
          </div>
        ) : calculationResult ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      A1-A3
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.finishedProductA1A3KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      A4
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.A4KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      A5
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.A5KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      Upfront A1-A5
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.upfrontCarbonKgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      B2
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.B2KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      B3
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.B3KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      C1
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.C1KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      C2
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.C2KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      C3-C4
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.C3C4KgCO2e.toFixed(2)}
    </div>
  </div>

  <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] p-4">
    <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">
      Total
    </div>
    <div className="mt-2 text-sm font-semibold text-[#1F2937]">
      {calculationResult.modules.embodiedCarbonTotalKgCO2e.toFixed(2)}
    </div>
  </div>
</div>

            <div className="rounded-xl border border-[#D9E1E7] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#1F2937]">
                Checks
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[#1F2937]">
                {calculationResult.checks.map((check) => (
                  <li key={check.name} className="rounded-lg bg-[#F7F9FA] px-3 py-2">
                    <span className="font-medium">{check.pass ? "PASS" : "FAIL"}</span>
                    {" — "}
                    {check.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}