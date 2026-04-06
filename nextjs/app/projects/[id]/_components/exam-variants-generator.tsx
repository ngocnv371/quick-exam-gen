"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ExamVariant } from "@/lib/gemini";
import { GenerationConfig } from "./generation-config";
import { ExamVariantsDisplay } from "./exam-variants-display";

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

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  async function handleGenerate() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

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
    <>
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to generate variants</DialogTitle>
            <DialogDescription>
              Create a free account (or sign in) to generate exam variants and save your work permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
            <Button variant="outline" asChild>
              <a href={`/auth/login`}>Sign in</a>
            </Button>
            <Button asChild>
              <a href={`/auth/sign-up`}>Create account</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <GenerationConfig
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          variantCount={variantCount}
          setVariantCount={setVariantCount}
          isGenerating={isGenerating}
          hasExtractedContent={hasExtractedContent}
          onGenerate={handleGenerate}
        />

        {variants.length > 0 && (
          <ExamVariantsDisplay
            variants={variants}
            generatedAt={initialExamVariants?.generatedAt}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showAnswers={showAnswers}
            setShowAnswers={setShowAnswers}
            showExplanations={showExplanations}
            setShowExplanations={setShowExplanations}
            onVariantsChange={setVariants}
          />
        )}
      </CardContent>
    </Card>
    </>
  );
}
