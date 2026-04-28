"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoinOrderRow } from "@/lib/billing";
import { useTranslations } from "next-intl";

export interface AdminOrderRow extends CoinOrderRow {
  userDisplay: string;
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending:   "outline",
  paid:      "secondary",
  fulfilled: "default",
  failed:    "destructive",
  cancelled: "secondary",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "text-amber-500",
  paid:      "text-blue-500",
  fulfilled: "text-emerald-500",
  failed:    "text-destructive",
  cancelled: "text-foreground/40",
};

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const tCommon = useTranslations("Common");
  const tOrders = useTranslations("Orders");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(orderId: string, action: "approve" | "reject") {
    setLoadingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      toast.success(
        action === "approve"
          ? tOrders("approvedToast")
          : tOrders("rejectedToast"),
      );
      router.refresh();
    } catch (err) {
      toast.error("Failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoadingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-foreground/50 px-6 py-8 text-center">
        {tCommon("noData")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border/40">
        <thead>
          <tr className="bg-muted">
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("table.user")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("status.label")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("table.package")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("table.coins")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("table.price")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("table.createdAt")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase">{tOrders("table.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {orders.map((o) => {
            const isPending = o.status === "pending";
            const isLoading = loadingId === o.id;
            return (
              <tr key={o.id} className="bg-background">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{o.userDisplay}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={STATUS_BADGE[o.status] ?? "secondary"}
                    className={`capitalize text-xs ${STATUS_COLOR[o.status] ?? ""}`}
                  >
                    {tOrders(`status.${o.status}`)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground/50">{o.package_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground/50">{o.coins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground/50">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: o.currency,
                  }).format(o.price_cents / 100)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-foreground/30">{new Date(o.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isPending && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1.5"
                        disabled={isLoading}
                        onClick={() => handleAction(o.id, "approve")}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {tCommon("approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        disabled={isLoading}
                        onClick={() => handleAction(o.id, "reject")}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {tCommon("reject")}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
