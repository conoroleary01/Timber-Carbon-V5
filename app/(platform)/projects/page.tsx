import Link from "next/link";
import PageHeader from "@/components/ui/page-header";
import SectionCard from "@/components/ui/section-card";
import EmptyState from "@/components/ui/empty-state";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = createServerSupabaseClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, project_name, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const hasProjects = !!projects && projects.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Manage your embodied carbon assessments and continue active project workflows."
        actions={
          <Link
            href="/projects/new"
            className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
          >
            New Project
          </Link>
        }
      />

      <SectionCard
        title="All projects"
        description="Saved projects in the current workspace."
      >
        {hasProjects ? (
          <div className="overflow-hidden rounded-lg border border-[#D9E1E7]">
            <table className="min-w-full divide-y divide-[#D9E1E7]">
              <thead className="bg-[#F7F9FA]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    Project Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#D9E1E7] bg-white">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">
                      <Link
                        href={`/projects/${project.id}/setup`}
                        className="hover:text-cygnum-green"
                      >
                        {project.project_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#667085]">
                      {project.updated_at
                        ? new Date(project.updated_at).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#667085]">Draft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Create your first project to begin the upload, validation, mapping, and calculation workflow."
            actionLabel="Create Project"
            actionHref="/projects/new"
          />
        )}
      </SectionCard>
    </div>
  );
}