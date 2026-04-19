import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoinsBalance } from "@/lib/billing";
import { Loader2 } from "lucide-react";
import { TopUpPanel } from "./_components/top-up-panel";
import type { CoinPackage } from "@/lib/coin-packages";
import type { CoinOrderRow } from "@/lib/billing";
import BalanceSummary from "./_components/balance-summary";
import {
  Transaction,
  TransactionHistoryCard,
} from "./_components/transaction-history-card";
import { OrderHistoryCard } from "./_components/order-history-card";

async function BillingContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [
    balance,
    { data: transactions },
    { data: packages },
    { data: orders },
  ] = await Promise.all([
    getCoinsBalance(supabase),
    supabase
      .from("coins_transactions")
      .select("id, amount, type, ref_id, note, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("coin_packages")
      .select("id, label, coins, price_cents, currency, sort_order")
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("coin_orders")
      .select(
        "id, package_id, status, coins, price_cents, currency, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (transactions ?? []) as Transaction[];
  const pkgs = (packages ?? []) as CoinPackage[];
  const orderRows = (orders ?? []) as CoinOrderRow[];

  return (
    <div className="flex flex-col gap-8">
      {/* Balance summary */}
      <BalanceSummary balance={balance} />

      {/* Top-up */}
      <TopUpPanel packages={pkgs} />

      {/* Order history */}
      <OrderHistoryCard orders={orderRows} />

      {/* Transaction history */}
      <TransactionHistoryCard transactions={rows} />
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-foreground/40">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        }
      >
        <BillingContent />
      </Suspense>
    </div>
  );
}
