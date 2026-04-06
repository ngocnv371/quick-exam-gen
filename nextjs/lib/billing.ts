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
 * Returns the new transaction's id.
 * Runs as service-role to bypass RLS.
 */
export async function creditCoins(
  userId: string,
  amount: number,
  note?: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("coins_transactions")
    .insert({ user_id: userId, amount, type: "purchase", note: note ?? null })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to credit coins: ${error?.message}`);
  return (data as { id: string }).id;
}

// ============================================================
// Order lifecycle helpers
// ============================================================

export interface CoinOrderRow {
  id: string;
  user_id: string;
  package_id: string;
  status: "pending" | "paid" | "fulfilled" | "failed" | "cancelled";
  coins: number;
  price_cents: number;
  currency: string;
  gateway: string | null;
  gateway_order_id: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new pending order when the user initiates checkout.
 * Uses the user's own session (RLS insert policy allows status='pending').
 */
export async function createOrder(
  supabase: SupabaseClient,
  userId: string,
  packageId: string,
  coins: number,
  priceCents: number,
  currency = "USD",
): Promise<string> {
  const { data, error } = await supabase
    .from("coin_orders")
    .insert({
      user_id: userId,
      package_id: packageId,
      status: "pending",
      coins,
      price_cents: priceCents,
      currency,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create order: ${error?.message}`);
  return (data as { id: string }).id;
}

/**
 * Transition an order to 'paid' and then 'fulfilled', crediting coins atomically.
 * Called from the (simulated) payment webhook — uses service-role to bypass RLS.
 */
export async function fulfillOrder(
  orderId: string,
  gatewayPayload?: Record<string, unknown>,
): Promise<void> {
  const admin = createAdminClient();

  // Fetch the order
  const { data: order, error: fetchErr } = await admin
    .from("coin_orders")
    .select("id, user_id, package_id, coins, status, transaction_id")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) throw new Error(`Order not found: ${fetchErr?.message}`);
  const o = order as CoinOrderRow;

  if (o.status === "fulfilled") return; // idempotent
  if (o.status !== "pending" && o.status !== "paid") {
    throw new Error(`Cannot fulfil order in status '${o.status}'`);
  }

  let txId: string;
  if (o.status === "paid" && o.transaction_id) {
    // creditCoins was already called but the fulfilled update failed on a previous attempt.
    // Reuse the existing transaction id — do not credit again.
    txId = o.transaction_id;
  } else {
    // Mark paid
    await admin
      .from("coin_orders")
      .update({ status: "paid", paid_at: new Date().toISOString(), gateway_payload: gatewayPayload ?? null })
      .eq("id", orderId);

    // Credit coins and get transaction id
    txId = await creditCoins(o.user_id, o.coins, `Top-up: order ${orderId}`);
  }

  // Mark fulfilled
  await admin
    .from("coin_orders")
    .update({
      status: "fulfilled",
      fulfilled_at: new Date().toISOString(),
      transaction_id: txId,
    })
    .eq("id", orderId);
}

/**
 * Mark an order as failed or cancelled.
 * Uses service-role to bypass RLS.
 */
export async function failOrder(
  orderId: string,
  status: "failed" | "cancelled" = "failed",
): Promise<void> {
  const admin = createAdminClient();

  // Guard: fetch current status to prevent corrupting fulfilled orders
  const { data: order, error: fetchErr } = await admin
    .from("coin_orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) throw new Error(`Order not found: ${fetchErr?.message}`);
  const currentStatus = (order as Pick<CoinOrderRow, "id" | "status">).status;

  if (currentStatus === "fulfilled") {
    throw new Error(`Cannot ${status} a fulfilled order`);
  }
  if (currentStatus === status || currentStatus === "failed" || currentStatus === "cancelled") {
    return; // already in a terminal state — idempotent
  }

  const ts = new Date().toISOString();
  await admin
    .from("coin_orders")
    .update({
      status,
      ...(status === "failed" ? { failed_at: ts } : { cancelled_at: ts }),
    })
    .eq("id", orderId);
}
