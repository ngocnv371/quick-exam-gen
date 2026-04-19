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
import { useTranslations } from "next-intl";

enum StatusFilter {
  Pending = "pending",
  Fulfilled = "fulfilled",
  Failed = "failed",
  Cancelled = "cancelled",
  All = "all",
}

async function OrdersContent({ status }: { status: StatusFilter }) {
  const admin = createAdminClient();

  const query = admin
    .from("coin_orders")
    .select(
      "id, user_id, package_id, status, coins, price_cents, currency, gateway, gateway_order_id, transaction_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== StatusFilter.All) {
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
  const t = useTranslations("Admin");
  const tStatus = useTranslations("Billing.orderStatus");
  const tabs = Object.values(StatusFilter);

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t("title")}
        </h1>
        <p className="text-sm text-foreground/50 mt-1">{t("description")}</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {tStatus(t)}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">
                  {tStatus(tab)}
                </CardTitle>
                <CardDescription>{t("last100")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-8 text-foreground/40">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  }
                >
                  <OrdersContent status={tab} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
