"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ExamVariant, ExamQuestion } from "@/lib/gemini";

interface ExamVariantsMetadata {
  generatedAt: string;
  targetLanguage: string;
  variantCount: number;
  variants: ExamVariant[];
}

type ProjectMetadata = Record<string, unknown>;

function asExamVariantsMeta(value: unknown): ExamVariantsMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.variants)) return null;
  // Require new structured format (questions array per variant)
  const first = v.variants[0] as Record<string, unknown> | undefined;
  if (first && !Array.isArray(first.questions)) return null;
  return v as unknown as ExamVariantsMetadata;
}

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

export function ExamVariantsGenerator({
  projectId,
  initialMetadata,
}: {
  projectId: string;
  initialMetadata: ProjectMetadata | null;
}) {
  const router = useRouter();

  const initialExamVariants = asExamVariantsMeta(
    (initialMetadata ?? {}).examVariants,
  );

  const [targetLanguage, setTargetLanguage] = useState(
    initialExamVariants?.targetLanguage ?? "English",
  );
  const [variantCount, setVariantCount] = useState<2 | 4 | 6>(
    (initialExamVariants?.variantCount as 2 | 4 | 6) ?? 2,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<ExamVariant[]>(
    initialExamVariants?.variants ?? [],
  );
  const [activeTab, setActiveTab] = useState<string>(
    initialExamVariants?.variants?.[0]?.title ?? "",
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate-variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguage, variantCount }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Generation failed");
      }

      const data = (await res.json()) as { variants: ExamVariant[] };
      setVariants(data.variants);
      setActiveTab(data.variants[0]?.title ?? "");
      toast.success(`${data.variants.length} exam variants generated`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Could not generate variants", { description: message });
    } finally {
      setIsGenerating(false);
    }
  }

  const hasExtractedContent = !!(
    (initialMetadata?.sourceFile as Record<string, unknown> | undefined)?.extractedText ??
    initialMetadata?.extractedText
  );

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Exam Variants Generator
        </CardTitle>
        <CardDescription>
          Configure and generate multiple exam variants from the extracted content using AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Configuration */}
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
          onClick={handleGenerate}
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

        {/* Generated variants tabs */}
        {variants.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Generated variants</h3>
              {initialExamVariants?.generatedAt && (
                <span className="text-xs text-foreground/50">
                  Generated {new Date(initialExamVariants.generatedAt).toLocaleString()}
                </span>
              )}
            </div>

            {/* Display options */}
            <div className="flex flex-wrap gap-5">
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <Checkbox
                  checked={showAnswers}
                  onCheckedChange={(v) => setShowAnswers(v === true)}
                />
                Show answer key
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer font-normal">
                <Checkbox
                  checked={showExplanations}
                  onCheckedChange={(v) => setShowExplanations(v === true)}
                />
                Show explanations
              </Label>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1">
                {variants.map((v) => (
                  <TabsTrigger key={v.title} value={v.title} className="text-xs">
                    {v.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {variants.map((v) => (
                <TabsContent key={v.title} value={v.title} className="space-y-3 mt-3">
                  {!v.questions || v.questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No questions found.</p>
                  ) : (
                    v.questions.map((q: ExamQuestion) => (
                      <div key={q.number} className="rounded-md border p-4 space-y-3">
                        <p className="text-sm font-medium">
                          {q.number}. {q.text}
                        </p>

                        {q.type === "multiple-choice" ? (
                          <>
                            <ul className="space-y-1.5">
                              {q.choices.map((c) => (
                                <li
                                  key={c.label}
                                  className={cn(
                                    "text-sm px-2 py-1 rounded",
                                    showAnswers && c.label === q.correctAnswer
                                      ? "bg-green-100 dark:bg-green-900/30 font-medium text-green-800 dark:text-green-300"
                                      : "text-foreground/80",
                                  )}
                                >
                                  <span className="font-mono">{c.label}.</span> {c.text}
                                </li>
                              ))}
                            </ul>
                            {showAnswers && (
                              <p className="text-xs font-medium">
                                Correct answer: {q.correctAnswer}
                              </p>
                            )}
                          </>
                        ) : (
                          showAnswers && (
                            <div className="rounded bg-muted/50 px-3 py-2 space-y-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Model answer</p>
                              <p className="text-sm whitespace-pre-wrap">{q.answer}</p>
                            </div>
                          )
                        )}

                        {showExplanations && (
                          <p className="text-xs text-muted-foreground italic border-t pt-2">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
