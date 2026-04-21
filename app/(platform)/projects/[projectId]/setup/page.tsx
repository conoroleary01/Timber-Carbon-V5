import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  updateProjectDetails,
  uploadProjectBoqFile,
  processProjectBoqFile,
} from "../actions";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
  "id, project_name, project_location, reporting_area_m2, gia_demolished_m2, a4_distance_km, boq_file_url",
    )
    .eq("id", Number(projectId))
    .single();

  if (error || !project) {
    notFound();
  }

  const updateProjectDetailsWithId = updateProjectDetails.bind(null, project.id);
  const uploadProjectBoqFileWithId = uploadProjectBoqFile.bind(null, project.id);
  const processProjectBoqFileWithId = processProjectBoqFile.bind(
    null,
    project.id,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <SectionCard
        title="Project setup"
        description="Update the core project fields used by the assessment."
      >
        <form action={updateProjectDetailsWithId} className="grid gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
              Project name
            </span>
            <input
              name="project_name"
              type="text"
              defaultValue={project.project_name ?? ""}
              className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
              Location
            </span>
            <input
              name="project_location"
              type="text"
              defaultValue={project.project_location ?? ""}
              className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
              Reporting area m²
            </span>
            <input
              name="reporting_area_m2"
              type="number"
              step="any"
              defaultValue={project.reporting_area_m2 ?? 0}
              className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
              GIA demolished m²
            </span>
            <input
              name="gia_demolished_m2"
              type="number"
              step="any"
              defaultValue={project.gia_demolished_m2 ?? 0}
              className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
            />
          </label>

          <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
          A4 distance km
        </span>
        <input
    name="a4_distance_km"
    type="number"
    step="any"
    defaultValue={project.a4_distance_km ?? 0}
    className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
  />
</label>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
            >
              Save Project Details
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Upload quantities"
        description="Upload and process the BOQ file for this project."
      >
        <div className="space-y-6">
          <form action={uploadProjectBoqFileWithId} className="space-y-4">
            <div className="rounded-xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] p-8 text-center">
              <div className="mx-auto max-w-md">
                <h3 className="text-lg font-semibold text-[#1F2937]">
                  Upload Excel file
                </h3>
                <p className="mt-2 text-sm text-[#667085]">
                  Select the project quantity file to attach to this project.
                </p>

                <div className="mt-6">
                  <input
                    name="boq_file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="block w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937]"
                    required
                  />
                </div>

                <p className="mt-4 text-xs text-[#667085]">
                  Accepted formats: .xlsx, .xls, .csv
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#D9E1E7] bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1F2937]">
                  Excel template
                </p>
                <p className="text-xs text-[#667085]">
                  Use the template format for smoother validation.
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm font-medium text-[#1F2937]"
              >
                Download Template
              </button>
            </div>

            <div className="rounded-lg border border-[#D9E1E7] bg-[#F7F9FA] px-4 py-3">
              <p className="text-sm font-medium text-[#1F2937]">Current file</p>
              <p className="mt-1 text-sm text-[#667085]">
                {project.boq_file_url
                  ? project.boq_file_url
                  : "No file uploaded yet"}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
              >
                Upload BOQ File
              </button>
            </div>
          </form>

          <form action={processProjectBoqFileWithId}>
            <button
              type="submit"
              disabled={!project.boq_file_url}
              className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Process Uploaded File
            </button>
          </form>
        </div>
      </SectionCard>
    </div>
  );
}