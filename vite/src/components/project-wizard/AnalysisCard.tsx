import type { ExamAnalysis } from "../../context/ProjectContext";

export function AnalysisCard({ analysis }: { analysis: ExamAnalysis }) {
  if (!analysis) {
    return null;
  }
  
  return (
    <div className="space-y-lg p-lg border border-hairline rounded-lg bg-canvas">
      <div className="pb-lg border-b border-hairline">
        <h3 className="text-headline font-semibold text-ink mb-sm">{analysis.title}</h3>
        <p className="inline-block px-sm py-xs bg-block-lime text-ink rounded-pill text-body-sm font-medium">{analysis.subject}</p>
      </div>

      <div className="space-y-md">
        <h4 className="text-card-title font-bold text-ink">Overall Intent</h4>
        <p className="text-body text-ink/80">{analysis.overallIntent}</p>
      </div>

      <div className="space-y-md">
        <h4 className="text-card-title font-bold text-ink">Questions ({analysis.questions.length})</h4>
        <div className="space-y-md">
          {analysis.questions.map((question) => (
            <div key={question.index} className="p-md border border-hairline rounded-md bg-surface-soft space-y-md">
              <div className="flex items-center gap-md">
                <span className="inline-block w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-sm">Q{question.index}</span>
                <span className="inline-block px-sm py-xs bg-ink text-on-primary rounded-sm text-body-sm font-medium">
                  {question.questionType}
                </span>
              </div>

              <p className="text-body font-medium text-ink">{question.text}</p>

              <div className="space-y-sm">
                <div>
                  <label className="text-body-sm font-semibold text-ink block mb-xs">Intended Purpose:</label>
                  <p className="text-body-sm text-ink/70">{question.intendedPurpose}</p>
                </div>

                {question.testedSkills.length > 0 && (
                  <div>
                    <label className="text-body-sm font-semibold text-ink block mb-xs">Tested Skills:</label>
                    <ul className="list-disc list-inside space-y-xs">
                      {question.testedSkills.map((skill, idx) => (
                        <li key={idx} className="text-body-sm text-ink/70">{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
