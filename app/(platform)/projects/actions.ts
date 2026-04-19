"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = createServerSupabaseClient();

  const project_name = String(formData.get("project_name") ?? "").trim();
  const project_location = String(formData.get("project_location") ?? "").trim();
  const reporting_area_m2 = Number(formData.get("reporting_area_m2") ?? 0);
  const gia_demolished_m2 = Number(formData.get("gia_demolished_m2") ?? 0);

  if (!project_name) {
    throw new Error("Project name is required");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      project_name,
      project_location,
      reporting_area_m2,
      gia_demolished_m2,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/projects/${data.id}/setup`);
}