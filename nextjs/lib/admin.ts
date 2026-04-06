import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Returns the role of the currently authenticated user, or null if not signed in. */
export async function getProfileRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (data as { role: string } | null)?.role ?? null;
}

/**
 * Throws a redirect if the current user is not an admin.
 * Use inside async server components / layouts that protect admin routes.
 */
export async function requireAdmin(): Promise<void> {
  const role = await getProfileRole();
  if (role !== "admin") redirect("/projects");
}
