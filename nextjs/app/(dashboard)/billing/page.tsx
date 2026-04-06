import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoinsBalance } from "@/lib/billing";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowDownCircle, ArrowUpCircle, Loader2, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TopUpPanel } from "./_components/top-up-panel";
import type { CoinPackage } from "@/lib/coin-packages";
import type { CoinOrderRow } from "@/lib/billing";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  ref_id: string | null;
  note: string | null;
  created_at: string;
}

async function BillingContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [balance, { data: transactions }, { data: packages }, { data: orders }] = await Promise.all([
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
      .select("id, package_id, status, coins, price_cents, currency, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (transactions ?? []) as Transaction[];
  const pkgs = (packages ?? []) as CoinPackage[];
  const orderRows = (orders ?? []) as CoinOrderRow[];

  return (
    <div className="flex flex-col gap-8">
      {/* Balance summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-3xl font-bold text-primary">
          <Coins className="h-8 w-8" />
          <span>{balance}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">Coin Balance</span>
          <span className="text-xs text-foreground/50">
            Each exam variant generation costs 1 coin
          </span>
        </div>
      </div>

      {/* Top-up */}
      <TopUpPanel packages={pkgs} />

      {/* Order history */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase Orders
          </CardTitle>
          <CardDescription>Last 50 top-up orders</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {orderRows.length === 0 ? (
            <p className="text-sm text-foreground/50 px-6 py-8 text-center">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {orderRows.map((o) => {
                const statusColor: Record<string, string> = {
                  pending:   "text-amber-500",
                  paid:      "text-blue-500",
                  fulfilled: "text-emerald-500",
                  failed:    "text-destructive",
                  cancelled: "text-foreground/40",
                };
                const badgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                  pending:   "outline",
                  paid:      "secondary",
                  fulfilled: "default",
                  failed:    "destructive",
                  cancelled: "secondary",
                };
                return (
                  <li key={o.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {o.coins} coins — {o.package_id}
                      </p>
                      <p className="text-xs text-foreground/40">
                        {new Date(o.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold tabular-nums ${statusColor[o.status] ?? ""}`}>
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: o.currency }).format(o.price_cents / 100)}
                      </span>
                      <Badge variant={badgeVariant[o.status] ?? "secondary"} className="capitalize text-xs">
                        {o.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <CardDescription>Last 100 transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="text-sm text-foreground/50 px-6 py-8 text-center">
              No transactions yet. Generate some exam variants to see your history here.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {rows.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-6 py-3">
                  {tx.amount > 0 ? (
                    <ArrowUpCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.note ?? (tx.type === "purchase" ? "Coins purchased" : "Coins deducted")}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={tx.type === "purchase" ? "default" : "secondary"}
                      className="capitalize text-xs"
                    >
                      {tx.type}
                    </Badge>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        tx.amount > 0 ? "text-emerald-500" : "text-destructive"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
