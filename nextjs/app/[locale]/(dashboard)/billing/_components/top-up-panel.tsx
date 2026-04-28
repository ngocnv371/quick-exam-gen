"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type CoinPackage, formatPackagePrice } from "@/lib/coin-packages";

export function TopUpPanel({ packages }: { packages: CoinPackage[] }) {
  const t = useTranslations("Billing.TopUpPanel");
  const router = useRouter();
  const [selected, setSelected] = useState<string>(packages[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected }),
      });
      const data = (await res.json()) as { orderId?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? t("orderFailed"));
      const pkg = packages.find((p) => p.id === selected)!;
      toast.success(t("orderPlaced", { coins: pkg.coins }));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("unknownError");
      toast.error(t("topupFailed"), { description: message });
    } finally {
      setLoading(false);
    }
  }

  const selectedPkg = packages.find((p) => p.id === selected);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-4 w-4" />
          {t("title")}
        </CardTitle>
        <CardDescription>
          {t("desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Package grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {packages.map((pkg) => {
            const isSelected = pkg.id === selected;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                className={`relative flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground"
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-primary" />
                )}
                <span className="text-2xl font-bold">{pkg.coins}</span>
                <span className="text-xs text-foreground/60">{t("coins")}</span>
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="mt-1 text-xs"
                >
                  {formatPackagePrice(pkg)}
                </Badge>
                <span className="text-xs font-medium mt-0.5">{pkg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div className="flex items-center gap-4 pt-1">
          <Button onClick={handleConfirm} disabled={loading || !selectedPkg} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("placing")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t("buy", { coins: selectedPkg?.coins ?? 0, price: selectedPkg ? formatPackagePrice(selectedPkg) : "" })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
