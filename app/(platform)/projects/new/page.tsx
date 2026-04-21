import Link from "next/link";
import PageHeader from "@/components/ui/page-header";
import SectionCard from "@/components/ui/section-card";
import UploadDropzone from "@/components/ui/upload-dropzone";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="New Project"
        description="Set up a new embodied carbon assessment, then upload a quantity file to begin validation and mapping."
        actions={
          <Link
            href="/projects"
            className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937]"
          >
            Back to Projects
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Project setup"
          description="Enter the minimum project information required to start the assessment."
        >
          <form action={createProject} className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
                Project name
              </span>
              <input
                name="project_name"
                type="text"
                placeholder="Enter project name"
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
                placeholder="Enter project location"
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
                placeholder="0"
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
                placeholder="0"
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
    placeholder="0"
    className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
  />
</label>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
              >
                Create Project
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Upload quantities"
          description="Upload will be connected after project creation."
        >
          <UploadDropzone />

          <div className="mt-6 flex items-center justify-between rounded-lg border border-[#D9E1E7] bg-white px-4 py-3">
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
        </SectionCard>
      </div>
    </div>
  );
}