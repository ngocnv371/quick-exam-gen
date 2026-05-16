import { useContext } from "react";
import { ProjectContext, ProjectDispatchContext, type ExamAnalysis } from "../../context/ProjectContext";
import { AnalysisCard } from "./AnalysisCard";


async function callAnalyzeTextApi(rawText: string) {
  const body = JSON.stringify({ content: rawText });
  if (body.length < 20) {
    throw new Error("Extracted text is too short to analyze.");
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    details?: string;
  } | null;

  if (!response.ok) {
    throw new Error(
      payload?.error ?? payload?.details ?? "Unable to analyze extracted text.",
    );
  }

  return payload;
}

export function AnalyzeTextStep() {
  const { project, isAnalyzing } = useContext(ProjectContext)!;
  const dispatch = useContext(ProjectDispatchContext)!;
  const extractedText = project?.metadata?.content as string;
  const analysis = project?.metadata?.analysis as ExamAnalysis;
  
  const onAnalyze = async () => {
    if (!extractedText) {
      return;
    }

    dispatch({ type: "SET_IS_ANALYZING", payload: true });

    try {
      const analyzedText = await callAnalyzeTextApi(extractedText);
      dispatch({ type: "SET_ANALYSIS", payload: analyzedText });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_IS_ANALYZING", payload: false });
    }
  };

  return (
    <div className="wizard-step-panel">
      <h2 className="headline">Step 2. Analyze extracted text</h2>
      <p className="body-copy">
        This step sends only extracted raw text to an API. Original files are not
        uploaded.
      </p>

      <div className="actions-row">
        <button
          type="button"
          className="pill-btn primary"
          disabled={isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze text"}
        </button>
      </div>

      {analysis ? <AnalysisCard analysis={analysis} /> : null}
    </div>
  );
}