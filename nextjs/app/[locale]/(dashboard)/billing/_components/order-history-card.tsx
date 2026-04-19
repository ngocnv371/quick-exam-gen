import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CoinOrderRow } from "@/lib/billing";
import { useTranslations } from "next-intl";

export function OrderHistoryCard({ orders }: { orders: CoinOrderRow[] }) {
  const t = useTranslations("Billing");
  const tStatus = useTranslations("Billing.orderStatus");

  const statusColor: Record<string, string> = {
    pending: "text-amber-500",
    paid: "text-blue-500",
    fulfilled: "text-emerald-500",
    failed: "text-destructive",
    cancelled: "text-foreground/40",
  };
  const badgeVariant: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "outline",
    paid: "secondary",
    fulfilled: "default",
    failed: "destructive",
    cancelled: "secondary",
  };
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          {t("ordersTitle")}
        </CardTitle>
        <CardDescription>{t("ordersDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="text-sm text-foreground/50 px-6 py-8 text-center">
            {t("ordersEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center gap-4 px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {o.coins} {t("coins")} — {o.package_id}
                  </p>
                  <p className="text-xs text-foreground/40">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold tabular-nums ${statusColor[o.status] ?? ""}`}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: o.currency,
                    }).format(o.price_cents / 100)}
                  </span>
                  <Badge
                    variant={badgeVariant[o.status] ?? "secondary"}
                    className="capitalize text-xs"
                  >
                    {tStatus(o.status)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
