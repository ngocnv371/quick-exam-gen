import { useEffect, useMemo, useState } from "react";
import type { ExamAnalysis } from "../../context/ProjectContext";

type EditableAnalysisCardProps = {
  analysis: ExamAnalysis;
  isSaving: boolean;
  onSave: (analysis: ExamAnalysis) => void | Promise<void>;
};

function parseSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function EditableAnalysisCard({
  analysis,
  isSaving,
  onSave,
}: EditableAnalysisCardProps) {
  const [draft, setDraft] = useState<ExamAnalysis>(analysis);

  useEffect(() => {
    setDraft(analysis);
  }, [analysis]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(analysis),
    [analysis, draft],
  );

  const onQuestionChange = (
    questionIndex: number,
    field: "text" | "questionType" | "intendedPurpose" | "testedSkills",
    value: string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => {
        if (question.index !== questionIndex) {
          return question;
        }

        if (field === "testedSkills") {
          return {
            ...question,
            testedSkills: parseSkills(value),
          };
        }

        if (field === "questionType") {
          return {
            ...question,
            questionType: value as "multiple-choice" | "open-ended" | "unknown",
          };
        }

        return {
          ...question,
          [field]: value,
        };
      }),
    }));
  };

  return (
    <div className="space-y-lg p-lg border border-hairline rounded-lg bg-canvas">
      <div className="space-y-md pb-lg border-b border-hairline">
        <div>
          <label className="text-body-sm font-semibold text-ink block mb-xs" htmlFor="analysis-title">
            Exam title
          </label>
          <input
            id="analysis-title"
            type="text"
            className="w-full px-md py-sm border border-hairline rounded-md bg-surface-soft text-ink"
            value={draft.title}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, title: event.target.value }));
            }}
          />
        </div>

        <div>
          <label className="text-body-sm font-semibold text-ink block mb-xs" htmlFor="analysis-subject">
            Subject
          </label>
          <input
            id="analysis-subject"
            type="text"
            className="w-full px-md py-sm border border-hairline rounded-md bg-surface-soft text-ink"
            value={draft.subject}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, subject: event.target.value }));
            }}
          />
        </div>

        <div>
          <label className="text-body-sm font-semibold text-ink block mb-xs" htmlFor="analysis-intent">
            Overall intent
          </label>
          <textarea
            id="analysis-intent"
            className="w-full min-h-24 px-md py-sm border border-hairline rounded-md bg-surface-soft text-ink"
            value={draft.overallIntent}
            onChange={(event) => {
              setDraft((prev) => ({ ...prev, overallIntent: event.target.value }));
            }}
          />
        </div>
      </div>

      <div className="space-y-md">
        <h4 className="text-card-title font-bold text-ink">Questions ({draft.questions.length})</h4>
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

                <select
                  className="px-sm py-xs border border-hairline rounded-md bg-canvas text-body-sm"
                  value={question.questionType}
                  onChange={(event) => {
                    onQuestionChange(
                      question.index,
                      "questionType",
                      event.target.value,
                    );
                  }}
                >
                  <option value="multiple-choice">multiple-choice</option>
                  <option value="open-ended">open-ended</option>
                  <option value="unknown">unknown</option>
                </select>
              </div>

              <div>
                <label className="text-body-sm font-semibold text-ink block mb-xs" htmlFor={`q-${question.index}-text`}>
                  Question text
                </label>
                <textarea
                  id={`q-${question.index}-text`}
                  className="w-full min-h-20 px-md py-sm border border-hairline rounded-md bg-canvas text-ink"
                  value={question.text}
                  onChange={(event) => {
                    onQuestionChange(question.index, "text", event.target.value);
                  }}
                />
              </div>

              <div>
                <label className="text-body-sm font-semibold text-ink block mb-xs" htmlFor={`q-${question.index}-purpose`}>
                  Intended purpose
                </label>
                <textarea
                  id={`q-${question.index}-purpose`}
                  className="w-full min-h-20 px-md py-sm border border-hairline rounded-md bg-canvas text-ink"
                  value={question.intendedPurpose}
                  onChange={(event) => {
                    onQuestionChange(
                      question.index,
                      "intendedPurpose",
                      event.target.value,
                    );
                  }}
                />
              </div>

              <div>
                <label className="text-body-sm font-semibold text-ink block mb-xs" htmlFor={`q-${question.index}-skills`}>
                  Tested skills (comma separated)
                </label>
                <input
                  id={`q-${question.index}-skills`}
                  type="text"
                  className="w-full px-md py-sm border border-hairline rounded-md bg-canvas text-ink"
                  value={question.testedSkills.join(", ")}
                  onChange={(event) => {
                    onQuestionChange(
                      question.index,
                      "testedSkills",
                      event.target.value,
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-md">
        <button
          type="button"
          className="px-lg py-sm bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          disabled={isSaving || !isDirty}
          onClick={() => {
            void onSave(draft);
          }}
        >
          {isSaving ? "Saving analysis..." : "Save analysis"}
        </button>

        <button
          type="button"
          className="px-lg py-sm bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft disabled:opacity-50 transition-colors"
          disabled={isSaving || !isDirty}
          onClick={() => {
            setDraft(analysis);
          }}
        >
          Reset changes
        </button>
      </div>
    </div>
  );
}
