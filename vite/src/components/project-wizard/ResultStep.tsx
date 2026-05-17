import { useContext } from "react";
import { ProjectContext, ProjectDispatchContext, type ExamAnalysis, type ExamVariant } from "../../context/ProjectContext";
import { ExamVariantsCard } from "./ExamVariantsCard";

async function callGenerateApi(analysis: ExamAnalysis, quantity: number) {
  const body = JSON.stringify({ exam: analysis, quantity });
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

  return payload!.variants;
}

export function ResultStep() {
  const { project, isGenerating } = useContext(ProjectContext)!;
  const dispatch = useContext(ProjectDispatchContext)!;
  const analysis = project?.metadata?.analysis as ExamAnalysis;
  const variantsResult = project?.metadata?.variants as ExamVariant[];

  async function onGenerateVariants() {
    if (!analysis) {
      return;
    }

    dispatch({ type: "SET_IS_GENERATING", payload: true });

    try {
      const variants = await callGenerateApi(analysis, 2);
      dispatch({ type: "SET_VARIANTS", payload: variants });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message });
    } finally {
      dispatch({ type: "SET_IS_GENERATING", payload: false });
    }
  }

  return (
    <div className="space-y-lg">
      <div>
        <p className="text-body font-light text-ink">Generate exam variants from the analyzed content, then review results below.</p>
      </div>

      <div className="flex gap-md">
        <button
          type="button"
          className="px-lg py-sm bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          disabled={isGenerating || !analysis}
          onClick={onGenerateVariants}
        >
          {isGenerating ? "Generating variants..." : "Generate variants"}
        </button>
      </div>

      {variantsResult?.length ? (
        <ExamVariantsCard variants={variantsResult} />
      ) : (
        <p className="text-body-sm text-ink/60">No generated variants yet.</p>
      )}
    </div>
  );
}
