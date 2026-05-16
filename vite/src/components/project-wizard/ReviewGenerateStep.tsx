import { useContext } from "react";
import { ProjectContext, ProjectDispatchContext, type ExamVariant } from "../../context/ProjectContext";

async function callGenerateApi(rawText: string, quantity: number) {
  const body = JSON.stringify({ exam: rawText, quantity })
  if (body.length < 20) {
    throw new Error("Content is too short to process.");
  }

  const response = await fetch("/api/generate-variants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    details?: string;
    variants?: ExamVariant[];
  } | null;

  if (!response.ok) {
    throw new Error(
      payload?.error ?? payload?.details ?? "Unable to generate variants.",
    );
  }

  return payload!.variants
}

export function ReviewGenerateStep() {
  const { project, loading } = useContext(ProjectContext)!;
  const dispatch = useContext(ProjectDispatchContext)!;
  const isGeneratingVariants = loading;
  const analyzedContent = project?.metadata?.analysis as string;

  async function onGenerateVariants() {
    if (!analyzedContent) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const variants = await callGenerateApi(analyzedContent, 2);
      dispatch({ type: "SET_VARIANTS", payload: variants });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  return (
    <div className="wizard-step-panel">
      <h2 className="headline">Step 3. Review and generate variants</h2>
      <p className="body-copy">Review analyzed content, then generate variants.</p>


      <div className="actions-row">
        <button
          type="button"
          className="pill-btn primary wizard-big-cta"
          disabled={isGeneratingVariants}
          onClick={onGenerateVariants}
        >
          {isGeneratingVariants ? "Generating variants..." : "Generate variants"}
        </button>
      </div>
    </div>
  );
}