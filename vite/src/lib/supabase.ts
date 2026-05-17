import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function createProject(userId: string) {
  return supabase
    .from("projects")
    .insert({
      user_id: userId,
      title: "Untitled Exam",
      type: "exam",
    })
    .select("id")
    .single();
}

export type ProjectStatus =
  | "all"
  | "draft"
  | "pending"
  | "ready"
  | "processing"
  | "failed"
  | "done"
  | "archived";
export async function getProjects(
  query?: string,
  status?: ProjectStatus,
  skip: number = 0,
  limit: number = 10,
) {
  let st = supabase
    .from("projects")
    .select("id, title, status, created_at, updated_at", { count: "exact" })
    .eq("type", "exam");
  if (status && status !== "all") {
    st = st.eq("status", status);
  }
  if (query) {
    st = st.ilike("title", `%${query}%`);
  }
  return st
    .order("created_at", { ascending: false })
    .range(skip, skip + limit - 1);
}

export async function getProjectDetail(projectId: string) {
  return supabase
    .from("projects")
    .select("id, title, status, type, metadata, created_at, updated_at")
    .eq("id", projectId)
    .eq("type", "exam")
    .maybeSingle();
}

export async function updateProjectMetadataField(
  projectId: string,
  fieldName: string,
  value: unknown,
) {
  return supabase
    .from("projects")
    .update({ [`metadata->${fieldName}`]: value })
    .eq("id", projectId);
}
