import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/billing";
import type { CoinPackage } from "@/lib/coin-packages";

/**
 * POST /api/billing/topup
 *
 * Creates a pending coin order. Fulfillment happens manually via the admin
 * order management panel (/projects/admin/orders).
 *
 * When a real payment gateway is integrated:
 *  1. This route creates the order (status=pending) and returns a checkout URL.
 *  2. A separate /api/billing/webhook route handles the signed gateway callback
 *     and calls fulfillOrder() — no user auth required there.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { packageId } = body as Record<string, unknown>;
  if (typeof packageId !== "string" || !packageId.trim()) {
    return NextResponse.json({ error: "packageId is required" }, { status: 400 });
  }

  // Validate package against the DB
  const { data: pkg, error: pkgErr } = await supabase
    .from("coin_packages")
    .select("id, label, coins, price_cents, currency")
    .eq("id", packageId)
    .eq("active", true)
    .single();

  if (pkgErr || !pkg) {
    return NextResponse.json({ error: "Unknown or inactive package" }, { status: 400 });
  }

  const p = pkg as CoinPackage;

  // Create pending order — fulfilled manually by an admin
  const orderId = await createOrder(supabase, user.id, p.id, p.coins, p.price_cents, p.currency);

  return NextResponse.json({ orderId });
}
