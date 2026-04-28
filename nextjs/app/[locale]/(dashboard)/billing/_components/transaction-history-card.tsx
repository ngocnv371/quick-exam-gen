import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  ref_id: string | null;
  note: string | null;
  created_at: string;
}

export function TransactionHistoryCard({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const t = useTranslations("Billing");
  const tType = useTranslations("Transactions.type");
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("txTitle")}</CardTitle>
        <CardDescription>{t("txDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <p className="text-sm text-foreground/50 px-6 py-8 text-center">
            {t("txEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-6 py-3">
                {tx.amount > 0 ? (
                  <ArrowUpCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.note ??
                      (tx.type === "purchase"
                        ? t("txPurchase")
                        : t("txDeducted"))}
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
                    {tType(tx.type)}
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
  );
}
