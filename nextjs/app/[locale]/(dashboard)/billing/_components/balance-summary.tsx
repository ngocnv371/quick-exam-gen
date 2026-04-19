import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";

function BalanceSummary({ balance }: { balance: number }) {
  const t = useTranslations("Billing");
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-3xl font-bold text-primary">
        <Coins className="h-8 w-8" />
        <span>{balance}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">
          {t("balanceLabel")}
        </span>
        <span className="text-xs text-foreground/50">{t("balanceHint")}</span>
      </div>
    </div>
  );
}

export default BalanceSummary;
