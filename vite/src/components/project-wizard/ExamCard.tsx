import type { ExamVariant } from "../../context/ProjectContext";
import "./ExamCard.css";

export function ExamCard({ exam }: { exam: ExamVariant }) {
  return (
    <div className="exam-card">
      <div className="exam-header">
        <h2 className="exam-title">{exam.title}</h2>
        <p className="exam-subject">{exam.subject}</p>
      </div>

      <div className="exam-questions">
        {exam.questions.map((question) => (
          <div key={question.index} className="exam-question">
            <div className="question-number">Question {question.index}</div>
            <p className="question-text">{question.text}</p>

            {question.choices && (
              <div className="question-choices">
                {question.choices.map((choice, idx) => (
                  <div
                    key={idx}
                    className={`choice-option ${choice.isCorrect ? "correct" : "incorrect"}`}
                  >
                    <span
                      className={`choice-indicator ${choice.isCorrect ? "correct" : "incorrect"}`}
                    />
                    {choice.text}
                  </div>
                ))}
              </div>
            )}

            <div className="explanation-box">
              <div className="explanation-label">Explanation</div>
              <p className="explanation-text">{question.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
