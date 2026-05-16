import type { ExamAnalysis } from "../../context/ProjectContext";

export function AnalysisCard({ analysis }: { analysis: ExamAnalysis }) {
  return (
    <div className="analysis-result">
      <div className="analysis-header">
        <h3>{analysis.title}</h3>
        <p className="subject-badge">{analysis.subject}</p>
      </div>

      <div className="analysis-intent">
        <h4>Overall Intent</h4>
        <p>{analysis.overallIntent}</p>
      </div>

      <div className="analysis-questions">
        <h4>Questions ({analysis.questions.length})</h4>
        {analysis.questions.map((question) => (
          <div key={question.index} className="question-card">
            <div className="question-header">
              <span className="question-number">Q{question.index}</span>
              <span className={`question-type ${question.questionType}`}>
                {question.questionType}
              </span>
            </div>

            <p className="question-text">{question.text}</p>

            <div className="question-details">
              <div className="detail-section">
                <label>Intended Purpose:</label>
                <p>{question.intendedPurpose}</p>
              </div>

              {question.testedSkills.length > 0 && (
                <div className="detail-section">
                  <label>Tested Skills:</label>
                  <ul className="skills-list">
                    {question.testedSkills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
