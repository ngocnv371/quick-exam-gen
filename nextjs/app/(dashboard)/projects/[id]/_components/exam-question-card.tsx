"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamQuestion, MultipleChoiceQuestion, OpenEndedQuestion } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExamQuestionCardProps {
  question: ExamQuestion;
  showAnswers: boolean;
  showExplanations: boolean;
  onQuestionChange?: (q: ExamQuestion) => void;
}

export function ExamQuestionCard({
  question: q,
  showAnswers,
  showExplanations,
  onQuestionChange,
}: ExamQuestionCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ExamQuestion>(q);

  function startEdit() {
    setDraft(q);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function saveEdit() {
    onQuestionChange?.(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-md border p-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Question text</Label>
          <Textarea
            className="text-sm"
            rows={3}
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          />
        </div>

        {draft.type === "multiple-choice" ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Choices</Label>
              {(draft as MultipleChoiceQuestion).choices.map((c, i) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="font-mono text-sm w-5 shrink-0">{c.label}.</span>
                  <Input
                    className="text-sm h-8"
                    value={c.text}
                    onChange={(e) => {
                      const choices = [...(draft as MultipleChoiceQuestion).choices];
                      choices[i] = { ...c, text: e.target.value };
                      setDraft({ ...(draft as MultipleChoiceQuestion), choices });
                    }}
                  />
                  <input
                    type="radio"
                    name={`correct-${q.number}`}
                    checked={(draft as MultipleChoiceQuestion).correctAnswer === c.label}
                    onChange={() =>
                      setDraft({ ...(draft as MultipleChoiceQuestion), correctAnswer: c.label })
                    }
                    title={`Mark ${c.label} as correct`}
                    className="accent-green-600 shrink-0"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Select radio button to change correct answer (currently:{" "}
                <span className="font-medium">
                  {(draft as MultipleChoiceQuestion).correctAnswer}
                </span>
                )
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Model answer</Label>
            <Textarea
              className="text-sm"
              rows={4}
              value={(draft as OpenEndedQuestion).answer}
              onChange={(e) =>
                setDraft({ ...(draft as OpenEndedQuestion), answer: e.target.value })
              }
            />
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Explanation</Label>
          <Textarea
            className="text-sm"
            rows={2}
            value={draft.explanation}
            onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button size="sm" variant="ghost" onClick={cancelEdit}>
            <X className="h-3 w-3 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={saveEdit}>
            <Check className="h-3 w-3 mr-1" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4 space-y-3 group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">
          {q.number}. {q.text}
        </p>
        {onQuestionChange && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={startEdit}
            title="Edit question"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </div>

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
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Model answer
            </p>
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
  );
}
