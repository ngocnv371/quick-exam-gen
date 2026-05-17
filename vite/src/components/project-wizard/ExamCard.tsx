import type { ExamVariant } from "../../context/ProjectContext";

export function ExamCard({ exam }: { exam: ExamVariant }) {
  return (
    <div className="space-y-lg">
      <div className="pb-lg border-b border-hairline">
        <h2 className="text-headline font-semibold text-ink mb-sm">{exam.title}</h2>
        <p className="text-body-sm text-ink/60">{exam.subject}</p>
      </div>

      <div className="space-y-lg">
        {exam.questions.map((question) => (
          <div key={question.index} className="p-lg border border-hairline rounded-md bg-canvas">
            <div className="mb-md">
              <div className="text-body-sm font-semibold text-ink/50 mb-xs">Question {question.index}</div>
              <p className="text-body font-medium text-ink">{question.text}</p>
            </div>

            {question.choices && (
              <div className="space-y-sm mb-lg">
                {question.choices.map((choice, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-sm p-sm rounded-md border ${
                      choice.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-surface-soft border-hairline'
                    }`}
                  >
                    <span className={`inline-block w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                      choice.isCorrect
                        ? 'bg-semantic-success text-on-primary'
                        : 'bg-hairline text-ink/40'
                    }`}>
                      {choice.isCorrect ? '✓' : '✗'}
                    </span>
                    <span className={choice.isCorrect ? 'text-green-700 font-medium' : 'text-ink/70'}>
                      {choice.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-md rounded-md bg-block-cream border border-hairline">
              <div className="text-body-sm font-semibold text-ink mb-xs">Explanation</div>
              <p className="text-body-sm text-ink/70">{question.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
