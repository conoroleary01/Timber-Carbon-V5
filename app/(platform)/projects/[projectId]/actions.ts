"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseBoqWorkbook } from "@/lib/boq/parse-boq";
import { buildProjectInputFromSupabase } from "@/lib/calc/build-project-input";
import { calculateProject } from "@/lib/calc";

export async function updateProjectDetails(
  projectId: number,
  formData: FormData,
) {
  const supabase = createServerSupabaseClient();

  const project_name = String(formData.get("project_name") ?? "").trim();
  const project_location = String(formData.get("project_location") ?? "").trim();
  const reporting_area_m2 = Number(formData.get("reporting_area_m2") ?? 0);
  const gia_demolished_m2 = Number(formData.get("gia_demolished_m2") ?? 0);
  const a4_distance_km = Number(formData.get("a4_distance_km") ?? 0);

  if (!project_name) {
    throw new Error("Project name is required");
  }

  const { error } = await supabase
    .from("projects")
    .update({
      project_name,
      project_location,
      reporting_area_m2,
      gia_demolished_m2,
      a4_distance_km,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/setup`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function uploadProjectBoqFile(
  projectId: number,
  formData: FormData,
) {
  const adminSupabase = createAdminSupabaseClient();

  const file = formData.get("boq_file");

  if (!(file instanceof File)) {
    throw new Error("No file selected");
  }

  if (file.size === 0) {
    throw new Error("Uploaded file is empty");
  }

  const originalName = file.name.replace(/\s+/g, "_");
  const filePath = `${projectId}/${Date.now()}-${originalName}`;

  const { error: uploadError } = await adminSupabase.storage
    .from("boq-uploads")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: updateError } = await adminSupabase
    .from("projects")
    .update({
      boq_file_url: filePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/projects/${projectId}/setup`);
  revalidatePath(`/projects/${projectId}/validation`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function processProjectBoqFile(projectId: number) {
  const supabase = createServerSupabaseClient();
  const adminSupabase = createAdminSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, boq_file_url")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error("Project not found");
  }

  if (!project.boq_file_url) {
    throw new Error("No uploaded BOQ file found for this project");
  }

  const { data: fileData, error: downloadError } = await adminSupabase.storage
    .from("boq-uploads")
    .download(project.boq_file_url);

  if (downloadError || !fileData) {
    throw new Error(downloadError?.message || "Failed to download uploaded BOQ file");
  }

  const arrayBuffer = await fileData.arrayBuffer();
  const parsedRows = parseBoqWorkbook(arrayBuffer);

  await adminSupabase
    .from("project_boq_lines")
    .delete()
    .eq("project_id", projectId);

  if (parsedRows.length > 0) {
    const rowsToInsert = parsedRows.map((row) => ({
      project_id: projectId,
      raw_description: row.raw_description,
      boq_qty: row.boq_qty,
      boq_unit: row.boq_unit,
      matched_product_id: null,
      match_confidence: null,
      review_status: row.review_status,
      source_row_number: row.source_row_number,
      validation_issue: row.validation_issue,
    }));

    const { error: insertError } = await adminSupabase
      .from("project_boq_lines")
      .insert(rowsToInsert);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidatePath(`/projects/${projectId}/setup`);
  revalidatePath(`/projects/${projectId}/validation`);
  redirect(`/projects/${projectId}/validation`);
}

export async function updateProjectBoqLineMapping(
  projectId: number,
  boqLineId: number,
  formData: FormData,
) {
  const supabase = createServerSupabaseClient();

  const matched_product_id_raw = String(formData.get("matched_product_id") ?? "").trim();

  const matched_product_id = matched_product_id_raw
    ? Number(matched_product_id_raw)
    : null;

  const { error } = await supabase
    .from("project_boq_lines")
    .update({
      matched_product_id,
      match_confidence: matched_product_id ? 1 : null,
    })
    .eq("id", boqLineId)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/mapping`);
  revalidatePath(`/projects/${projectId}/validation`);
}

export async function runProjectCalculation(projectId: number) {
  const supabase = createServerSupabaseClient();

  const { projectInput } = await buildProjectInputFromSupabase(projectId);
  const result = calculateProject(projectInput);

  const { error } = await supabase.from("project_results").upsert(
    {
      project_id: projectId,
      input_json: projectInput,
      result_json: result,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "project_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/mapping`);
  revalidatePath(`/projects/${projectId}/results`);
  revalidatePath(`/projects/${projectId}/breakdown`);
  revalidatePath("/projects");

  redirect(`/projects/${projectId}/results`);
}