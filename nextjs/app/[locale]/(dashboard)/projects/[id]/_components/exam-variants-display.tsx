"use client";

import type { ExamVariant, ExamQuestion } from "@/lib/gemini";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamQuestionCard } from "./exam-question-card";

interface ExamVariantsDisplayProps {
  variants: ExamVariant[];
  generatedAt?: string;
  activeTab: string;
  setActiveTab: (v: string) => void;
  showAnswers: boolean;
  setShowAnswers: (v: boolean) => void;
  showExplanations: boolean;
  setShowExplanations: (v: boolean) => void;
  onVariantsChange?: (variants: ExamVariant[]) => void;
}

export function ExamVariantsDisplay({
  variants,
  generatedAt,
  activeTab,
  setActiveTab,
  showAnswers,
  setShowAnswers,
  showExplanations,
  setShowExplanations,
  onVariantsChange,
}: ExamVariantsDisplayProps) {
  function handleQuestionChange(variantTitle: string, updated: ExamQuestion) {
    if (!onVariantsChange) return;
    const next = variants.map((v) =>
      v.title === variantTitle
        ? { ...v, questions: v.questions.map((q) => (q.number === updated.number ? updated : q)) }
        : v,
    );
    onVariantsChange(next);
  }
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Generated variants</h3>
        {generatedAt && (
          <span className="text-xs text-foreground/50" suppressHydrationWarning>
            Generated {new Date(generatedAt).toLocaleString()}
          </span>
        )}
      </div>

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
                <ExamQuestionCard
                  key={q.number}
                  question={q}
                  showAnswers={showAnswers}
                  showExplanations={showExplanations}
                  onQuestionChange={
                    onVariantsChange
                      ? (updated) => handleQuestionChange(v.title, updated)
                      : undefined
                  }
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
