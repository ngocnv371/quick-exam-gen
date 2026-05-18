import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Save } from "lucide-react";
import type { ExamVariant } from "../../context/ProjectContext";

type EditableExamCardProps = {
  exam: ExamVariant;
  isSaving: boolean;
  onSave: (exam: ExamVariant) => void | Promise<void>;
};

export function EditableExamCard({ exam, isSaving, onSave }: EditableExamCardProps) {
  const [draft, setDraft] = useState<ExamVariant>(exam);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(exam);
  }, [exam]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(exam),
    [exam, draft],
  );

  const onQuestionChange = (
    questionIndex: number,
    field: "text" | "explanation" | "answer",
    value: string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.index !== questionIndex ? q : { ...q, [field]: value },
      ),
    }));
  };

  const onChoiceTextChange = (questionIndex: number, choiceIdx: number, value: string) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.index !== questionIndex || !q.choices) return q;
        return {
          ...q,
          choices: q.choices.map((c, i) => (i === choiceIdx ? { ...c, text: value } : c)),
        };
      }),
    }));
  };

  const onChoiceCorrectChange = (questionIndex: number, choiceIdx: number) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.index !== questionIndex || !q.choices) return q;
        return {
          ...q,
          choices: q.choices.map((c, i) => ({ ...c, isCorrect: i === choiceIdx })),
        };
      }),
    }));
  };

  return (
    <div className="space-y-lg p-lg border border-hairline rounded-lg bg-canvas">
      <div className="space-y-md pb-lg border-b border-hairline">
        <div>
          <label
            className="text-body-sm font-semibold text-ink block mb-xs"
            htmlFor="exam-title"
          >
            Exam title
          </label>
          <input
            id="exam-title"
            type="text"
            className="w-full px-md py-sm border border-hairline rounded-md bg-surface-soft text-ink"
            value={draft.title}
            onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label
            className="text-body-sm font-semibold text-ink block mb-xs"
            htmlFor="exam-subject"
          >
            Subject
          </label>
          <input
            id="exam-subject"
            type="text"
            className="w-full px-md py-sm border border-hairline rounded-md bg-surface-soft text-ink"
            value={draft.subject}
            onChange={(e) => setDraft((prev) => ({ ...prev, subject: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-md">
        <h4 className="text-card-title font-bold text-ink">
          Questions ({draft.questions.length})
        </h4>
        <div className="space-y-md">
          {draft.questions.map((question) => (
            <div
              key={question.index}
              className="p-md border border-hairline rounded-md bg-surface-soft space-y-md"
            >
              <div className="flex items-center gap-md">
                <span className="inline-block w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-sm">
                  Q{question.index}
                </span>
                <span className="text-body-sm text-ink/50">{question.questionType}</span>
              </div>

              <div>
                <label
                  className="text-body-sm font-semibold text-ink block mb-xs"
                  htmlFor={`q-${question.index}-text`}
                >
                  Question text
                </label>
                <textarea
                  id={`q-${question.index}-text`}
                  className="w-full min-h-20 px-md py-sm border border-hairline rounded-md bg-canvas text-ink"
                  value={question.text}
                  onChange={(e) => onQuestionChange(question.index, "text", e.target.value)}
                />
              </div>

              {question.choices && (
                <div>
                  <p className="text-body-sm font-semibold text-ink mb-xs">Choices</p>
                  <div className="space-y-sm">
                    {question.choices.map((choice, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <div key={idx} className="flex items-center gap-sm">
                          <input
                            type="radio"
                            name={`q-${question.index}-correct`}
                            checked={choice.isCorrect}
                            onChange={() => onChoiceCorrectChange(question.index, idx)}
                            className="flex-shrink-0 accent-primary"
                            title="Mark as correct"
                          />
                          <span className="text-body-sm font-semibold text-ink/50 w-4">{letter}</span>
                          <input
                            type="text"
                            className="flex-1 px-sm py-xs border border-hairline rounded-md bg-canvas text-ink text-body-sm"
                            value={choice.text}
                            onChange={(e) =>
                              onChoiceTextChange(question.index, idx, e.target.value)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label
                  className="text-body-sm font-semibold text-ink block mb-xs"
                  htmlFor={`q-${question.index}-answer`}
                >
                  Answer
                  {question.questionType === "multiple-choice" && (
                    <span className="ml-xs text-ink/40 font-normal">(A / B / C / D)</span>
                  )}
                </label>
                <input
                  id={`q-${question.index}-answer`}
                  type="text"
                  className="w-full px-md py-sm border border-hairline rounded-md bg-canvas text-ink"
                  value={question.answer ?? ""}
                  onChange={(e) => onQuestionChange(question.index, "answer", e.target.value)}
                />
              </div>

              <div>
                <label
                  className="text-body-sm font-semibold text-ink block mb-xs"
                  htmlFor={`q-${question.index}-explanation`}
                >
                  Explanation
                </label>
                <textarea
                  id={`q-${question.index}-explanation`}
                  className="w-full min-h-16 px-md py-sm border border-hairline rounded-md bg-canvas text-ink"
                  value={question.explanation}
                  onChange={(e) =>
                    onQuestionChange(question.index, "explanation", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-md pt-lg border-t border-hairline">
        <button
          type="button"
          className="px-lg py-sm bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-sm"
          disabled={isSaving || !isDirty}
          onClick={() => onSave(draft)}
        >
          {isSaving ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        {!isDirty && !isSaving && (
          <span className="text-body-sm text-ink/40">No unsaved changes</span>
        )}
      </div>
    </div>
  );
}
