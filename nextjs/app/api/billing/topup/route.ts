import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { creditCoins } from "@/lib/billing";
import type { CoinPackage } from "@/lib/coin-packages";

/**
 * POST /api/billing/topup
 *
 * Simulates a "payment confirmed" webhook from a payment processor.
 * When a real gateway is integrated replace this handler with a proper
 * signature-verified webhook endpoint and remove the auth check (webhooks
 * are server-to-server). Until then this is protected by the user's session.
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

  // Validate against the DB — uses the anon key but RLS allows public reads on active packages
  const { data: pkg, error } = await supabase
    .from("coin_packages")
    .select("id, label, coins, price_cents, currency")
    .eq("id", packageId)
    .eq("active", true)
    .single();

  if (error || !pkg) {
    return NextResponse.json({ error: "Unknown or inactive package" }, { status: 400 });
  }

  const p = pkg as CoinPackage;
  await creditCoins(user.id, p.coins, `Top-up: ${p.label}`);

  return NextResponse.json({ credited: p.coins });
}
