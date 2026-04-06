import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./supabase/admin";

/**
 * Tiered pricing based on extracted content length.
 * Short docs cost 1 coin/variant; longer docs cost proportionally more.
 */
export const CONTENT_TIERS = [
  { maxChars: 15_000, coinsPerVariant: 1, label: "Short" },
  { maxChars: 35_000, coinsPerVariant: 2, label: "Medium" },
  { maxChars: 60_000, coinsPerVariant: 3, label: "Long" },
] as const;

export type ContentTier = (typeof CONTENT_TIERS)[number];

/** Returns the coins-per-variant for the given content length. */
export function getCoinsPerVariant(contentLength: number): number {
  for (const tier of CONTENT_TIERS) {
    if (contentLength <= tier.maxChars) return tier.coinsPerVariant;
  }
  return CONTENT_TIERS[CONTENT_TIERS.length - 1].coinsPerVariant;
}

/** Total coin cost for a generation job. */
export function getGenerationCost(variantCount: number, contentLength: number): number {
  return variantCount * getCoinsPerVariant(contentLength);
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
 * Deduct coins by calling the billing_deduct_coins RPC.
 * Runs as service-role to bypass RLS.
 */
export async function deductCoins(
  userId: string,
  amount: number,
  refId?: string,
  note?: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("billing_deduct_coins", {
    p_user_id: userId,
    p_amount: amount,
    p_ref_id: refId ?? null,
    p_note: note ?? null,
  });
  if (error) throw new Error(`Failed to deduct coins: ${error.message}`);
}

/**
 * Credit coins by calling the billing_credit_coins RPC.
 * Returns the new transaction's id.
 * Runs as service-role to bypass RLS.
 */
export async function creditCoins(
  userId: string,
  amount: number,
  note?: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("billing_credit_coins", {
    p_user_id: userId,
    p_amount: amount,
    p_note: note ?? null,
  });
  if (error || !data) throw new Error(`Failed to credit coins: ${error?.message}`);
  return data as string;
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
 * Atomically transition an order through pending → paid → fulfilled and
 * credit the user's coins via a single billing_fulfill_order RPC call.
 * Idempotent — safe to retry on network failures.
 * Runs as service-role to bypass RLS.
 */
export async function fulfillOrder(
  orderId: string,
  gatewayPayload?: Record<string, unknown>,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("billing_fulfill_order", {
    p_order_id: orderId,
    p_gateway_payload: gatewayPayload ?? null,
  });
  if (error) throw new Error(`Failed to fulfill order: ${error.message}`);
}

/**
 * Mark an order as failed or cancelled via the billing_fail_order RPC.
 * Guards against corrupting fulfilled orders; idempotent on terminal states.
 * Runs as service-role to bypass RLS.
 */
export async function failOrder(
  orderId: string,
  status: "failed" | "cancelled" = "failed",
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("billing_fail_order", {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) throw new Error(`Failed to ${status} order: ${error.message}`);
}
