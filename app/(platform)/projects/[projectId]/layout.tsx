import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, project_name, project_location, reporting_area_m2, gia_demolished_m2")
    .eq("id", Number(projectId))
    .single();

  if (error || !project) {
    notFound();
  }

  const navItems = [
    { href: `/projects/${projectId}/setup`, label: "Setup" },
    { href: `/projects/${projectId}/validation`, label: "Validation" },
    { href: `/projects/${projectId}/mapping`, label: "Mapping" },
    { href: `/projects/${projectId}/results`, label: "Results" },
    { href: `/projects/${projectId}/breakdown`, label: "Breakdown" },
    { href: `/projects/${projectId}/reports`, label: "Reports" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[#D9E1E7] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
              Active Project
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#1F2937]">
              {project.project_name}
            </h1>
            <p className="mt-2 text-sm text-[#667085]">
              {project.project_location || "No location set"} ·{" "}
              {project.reporting_area_m2 ?? 0} m²
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex rounded-lg border border-[#D9E1E7] bg-white px-4 py-2 text-sm font-medium text-[#1F2937]"
          >
            Back to Projects
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg bg-[#F7F9FA] px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#E8F5EF] hover:text-cygnum-green"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}