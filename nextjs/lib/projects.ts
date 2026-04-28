import { SupabaseClient } from "@supabase/supabase-js";

export async function getProjectDetail(
  supabase: SupabaseClient,
  projectId: string,
) {
  const result = await supabase
    .from("projects")
    .select("id, title, status, metadata, created_at, updated_at")
    .eq("id", projectId)
    .single();
  return result;
}
