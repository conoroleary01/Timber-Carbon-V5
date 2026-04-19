import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
import ValidationSummary from "@/components/validation/validation-summary";
import ValidationTable from "@/components/validation/validation-table";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ValidationPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", Number(projectId))
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: rows, error: rowsError } = await supabase
    .from("project_boq_lines")
    .select(
      "source_row_number, raw_description, boq_qty, boq_unit, review_status, validation_issue",
    )
    .eq("project_id", Number(projectId))
    .order("source_row_number", { ascending: true });

  if (rowsError) {
    throw new Error(rowsError.message);
  }

  const mappedRows =
    rows?.map((row) => ({
      row: row.source_row_number ?? 0,
      material: row.raw_description ?? "",
      quantity: row.boq_qty != null ? String(row.boq_qty) : "—",
      unit: row.boq_unit ?? "—",
      status: (row.review_status as "Valid" | "Warning" | "Error") ?? "Valid",
      issue: row.validation_issue ?? "—",
    })) ?? [];

  const totalRows = mappedRows.length;
  const errors = mappedRows.filter((row) => row.status === "Error").length;
  const warnings = mappedRows.filter((row) => row.status === "Warning").length;

  return (
    <div className="space-y-8">
      <ValidationSummary
        totalRows={totalRows}
        errors={errors}
        warnings={warnings}
      />

      <SectionCard
        title="Validation results"
        description="Rows with missing data or invalid values should be corrected before mapping."
      >
        <ValidationTable rows={mappedRows} />
      </SectionCard>
    </div>
  );
}