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

export async function updateProjectTitle(projectId: string, title: string) {
  return supabase
    .from("projects")
    .update({ title })
    .eq("id", projectId)
    .eq("type", "exam");
}

/**
 * Update a single metadata field for a project. This function first retrieves the current metadata,
 * updates the specified field, and then saves the updated metadata back to the database. This approach
 * helps to prevent overwriting other metadata fields that may have been updated concurrently.
 * @param projectId The ID of the project to update
 * @param fieldName The name of the metadata field to update
 * @param value The new value for the metadata field
 * @returns The result of the update operation
 */
export async function updateProjectMetadataField(
  projectId: string,
  fieldName: string,
  value: unknown,
) {
  const recentData = await supabase
    .from("projects")
    .select("metadata")
    .eq("id", projectId)
    .eq("type", "exam")
    .maybeSingle();

  if (!recentData || !recentData.data) {
    throw new Error("Project not found");
  }

  const updatedMetadata = {
    ...recentData.data.metadata,
    [fieldName]: value,
  };

  return supabase
    .from("projects")
    .update({ metadata: updatedMetadata })
    .eq("id", projectId)
    .eq("type", "exam");
}

// ============================================================
// Billing functions
// ============================================================

export interface CoinPackage {
  id: string;
  label: string;
  coins: number;
  price_cents: number;
  currency: string;
  active: boolean;
  sort_order: number;
}

export interface CoinOrder {
  id: string;
  user_id: string;
  package_id: string;
  status: "pending" | "paid" | "fulfilled" | "failed" | "cancelled";
  coins: number;
  price_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
}

export interface CoinsBalance {
  user_id: string;
  balance: number;
  updated_at: string;
}

export async function getCoinPackages() {
  return supabase
    .from("coin_packages")
    .select("*")
    .order("sort_order", { ascending: true });
}

export async function getUserCoinBalance(userId: string) {
  return supabase
    .from("coins_balance")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
}

export async function getUserCoinOrders(userId: string) {
  return supabase
    .from("coin_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createCoinOrder(packageId: string) {
  const { data: pkg, error: pkgError } = await supabase
    .from("coin_packages")
    .select("coins, price_cents, currency")
    .eq("id", packageId)
    .single();

  if (pkgError) {
    throw new Error(`Failed to fetch package: ${pkgError.message}`);
  }

  const { data } = await supabase.auth.getSession();
  if (!data?.session?.user?.id) {
    throw new Error("User not authenticated");
  }

  return supabase
    .from("coin_orders")
    .insert({
      user_id: data.session.user.id,
      package_id: packageId,
      coins: pkg.coins,
      price_cents: pkg.price_cents,
      currency: pkg.currency,
      status: "pending",
    })
    .select("*")
    .single();
}
