import Link from "next/link";
import { Coins } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCoinsBalance } from "@/lib/billing";

/**
 * Server component — shows the authenticated user's current coin balance.
 * Clicking navigates to /projects/billing.
 * Renders nothing if the user is not signed in.
 */
export async function CoinsBadge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const balance = await getCoinsBalance(supabase);

  return (
    <Link
      href="/billing"
      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      title="View coin transactions"
    >
      <Coins className="h-3.5 w-3.5" />
      <span>{balance}</span>
    </Link>
  );
}
