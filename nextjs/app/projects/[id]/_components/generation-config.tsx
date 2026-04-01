"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onGenerate: () => void;
}

export function GenerationConfig({
  targetLanguage,
  setTargetLanguage,
  variantCount,
  setVariantCount,
  isGenerating,
  hasExtractedContent,
  onGenerate,
}: GenerationConfigProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="target-language">Target language</Label>
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
          <Label htmlFor="variant-count">Number of variants</Label>
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
                  {n} variants
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasExtractedContent && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          No extracted content yet. Upload and extract a file above before generating.
        </p>
      )}

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !hasExtractedContent}
        className="w-full sm:w-auto"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate variants
          </>
        )}
      </Button>
    </div>
  );
}
