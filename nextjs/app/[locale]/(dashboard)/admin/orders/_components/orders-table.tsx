"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoinOrderRow } from "@/lib/billing";

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
          ? "Order approved — coins credited."
          : "Order rejected.",
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
        No orders found.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/40">
      {orders.map((o) => {
        const isPending = o.status === "pending";
        const isLoading = loadingId === o.id;
        return (
          <li
            key={o.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4"
          >
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{o.userDisplay}</span>
                <Badge
                  variant={STATUS_BADGE[o.status] ?? "secondary"}
                  className={`capitalize text-xs ${STATUS_COLOR[o.status] ?? ""}`}
                >
                  {o.status}
                </Badge>
              </div>
              <p className="text-xs text-foreground/50">
                {o.package_id} &middot; {o.coins} coins &middot;{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: o.currency,
                }).format(o.price_cents / 100)}
              </p>
              <p className="text-xs text-foreground/30">
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>
            {isPending && (
              <div className="flex gap-2 shrink-0">
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
                  Approve
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
                  Reject
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
