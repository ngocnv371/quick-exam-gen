import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";

/** Coins charged per variant generated (e.g. 4 variants = 4 coins). */
export const COIN_COST_PER_VARIANT = 1;

export function getGenerationCost(variantCount: number): number {
  return variantCount * COIN_COST_PER_VARIANT;
}

/** Fetch the current user's coin balance. Returns 0 if no row exists yet. */
export async function getCoinsBalance(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from("coins_balance")
    .select("balance")
    .single();

  if (error || !data) return 0;
  return (data as { balance: number }).balance;
}

/**
 * Deduct coins by inserting a negative 'export' transaction.
 * Runs as service-role to bypass RLS (writes are service-role only per migration).
 */
export async function deductCoins(
  userId: string,
  amount: number,
  refId?: string,
  note?: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("coins_transactions").insert({
    user_id: userId,
    amount: -amount,
    type: "export",
    ref_id: refId ?? null,
    note: note ?? null,
  });
  if (error) throw new Error(`Failed to deduct coins: ${error.message}`);
}

/**
 * Credit coins by inserting a positive 'purchase' transaction.
 * Runs as service-role to bypass RLS.
 */
export async function creditCoins(
  userId: string,
  amount: number,
  note?: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("coins_transactions").insert({
    user_id: userId,
    amount,
    type: "purchase",
    note: note ?? null,
  });
  if (error) throw new Error(`Failed to credit coins: ${error.message}`);
}
