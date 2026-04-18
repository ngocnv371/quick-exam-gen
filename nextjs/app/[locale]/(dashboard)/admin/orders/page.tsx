import { Suspense } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrdersTable, type AdminOrderRow } from "./_components/orders-table";
import type { CoinOrderRow } from "@/lib/billing";

type StatusFilter = "pending" | "all" | "fulfilled" | "failed" | "cancelled";

async function OrdersContent({ status }: { status: StatusFilter }) {
  const admin = createAdminClient();

  const query = admin
    .from("coin_orders")
    .select("id, user_id, package_id, status, coins, price_cents, currency, gateway, gateway_order_id, transaction_id, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query.eq("status", status);
  }

  const { data: orders, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (orders ?? []) as CoinOrderRow[];

  // Batch-fetch display names for all unique users
  const userIds = [...new Set(rows.map((o) => o.user_id))];
  let profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    profileMap = Object.fromEntries(
      (profiles ?? []).map((p: { id: string; display_name: string | null }) => [
        p.id,
        p.display_name ?? p.id.slice(0, 8) + "…",
      ]),
    );
  }

  const enriched: AdminOrderRow[] = rows.map((o) => ({
    ...o,
    userDisplay: profileMap[o.user_id] ?? o.user_id.slice(0, 8) + "…",
  }));

  return <OrdersTable orders={enriched} />;
}

export default function AdminOrdersPage() {
  // We read searchParams inside the async OrdersContent so the shell stays sync.
  // For simplicity we default to pending and use tab links.
  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "fulfilled", label: "Fulfilled" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Management
        </h1>
        <p className="text-sm text-foreground/50 mt-1">
          Approve or reject pending coin purchase orders.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">{t.label} Orders</CardTitle>
                <CardDescription>Last 100 orders</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-8 text-foreground/40">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  }
                >
                  <OrdersContent status={t.value} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
