"use client";

import { Sparkles, Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getGenerationCost,
  getCoinsPerVariant,
  CONTENT_TIERS,
} from "@/lib/billing";
import { useTranslations } from "next-intl";
import NavigationLink from "@/components/NavigationLink";

const VARIANT_COUNT_OPTIONS = [2, 4, 6] as const;

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "French", label: "French" },
  { value: "Spanish", label: "Spanish" },
  { value: "German", label: "German" },
  { value: "Chinese (Simplified)", label: "Chinese (Simplified)" },
  { value: "Japanese", label: "Japanese" },
];

interface GenerationConfigProps {
  targetLanguage: string;
  setTargetLanguage: (v: string) => void;
  variantCount: 2 | 4 | 6;
  setVariantCount: (v: 2 | 4 | 6) => void;
  isGenerating: boolean;
  hasExtractedContent: boolean;
  balance: number | null;
  contentLength: number;
  onGenerate: () => void;
}

export function GenerationConfig({
  targetLanguage,
  setTargetLanguage,
  variantCount,
  setVariantCount,
  isGenerating,
  hasExtractedContent,
  balance,
  contentLength,
  onGenerate,
}: GenerationConfigProps) {
  const t = useTranslations("Projects");
  const coinsPerVariant = getCoinsPerVariant(contentLength);
  const cost = getGenerationCost(variantCount, contentLength);
  const tier =
    CONTENT_TIERS.find((t) => contentLength <= t.maxChars) ??
    CONTENT_TIERS[CONTENT_TIERS.length - 1];
  const hasEnoughCoins = balance === null || balance >= cost;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="target-language">{t("targetLanguage")}</Label>
          <Select
            value={targetLanguage}
            onValueChange={setTargetLanguage}
            disabled={isGenerating}
          >
            <SelectTrigger id="target-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="variant-count">{t("numberOfVariants")}</Label>
          <Select
            value={String(variantCount)}
            onValueChange={(v) => setVariantCount(Number(v) as 2 | 4 | 6)}
            disabled={isGenerating}
          >
            <SelectTrigger id="variant-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VARIANT_COUNT_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {t("variantCount", { count: n })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasExtractedContent && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {t("noExtractedContent")}
        </p>
      )}

      {!hasEnoughCoins && (
        <>
          <p className="text-sm text-destructive">
            {t("insufficientCoins", { cost, balance: balance ?? 0 })}
          </p>
          <NavigationLink href="/billing" className="ml-1 underline">
            {t("topUp")}
          </NavigationLink>
        </>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !hasExtractedContent || !hasEnoughCoins}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("generateVariants")}
            </>
          )}
        </Button>
        <span className="flex items-center gap-1 text-xs text-foreground/50">
          <Coins className="h-3.5 w-3.5" />
          {t("cost", { cost, coin: cost !== 1 ? "coins" : "coin" })}
          {contentLength > 0 && (
            <span className="text-foreground/40">
              &nbsp;&middot;&nbsp;
              {t("costExplain", { coins: coinsPerVariant, tier: tier.label })}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
