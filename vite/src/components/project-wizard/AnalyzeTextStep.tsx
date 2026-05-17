import { useContext, useState } from "react";
import {
  ProjectContext,
  ProjectDispatchContext,
  type ExamAnalysis,
} from "../../context/ProjectContext";
import { Edit, Zap, RefreshCcw} from "lucide-react";
import { updateProjectMetadataField } from "../../lib/supabase";
import { AnalysisCard } from "./AnalysisCard";
import { EditableAnalysisCard } from "./EditableAnalysisCard";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const extractedText = project?.metadata?.content as string;
  const analysis = project?.metadata?.analysis as ExamAnalysis;

  const onAnalyze = async () => {
    if (!extractedText) {
      return;
    }

    setSaveSuccess(false);
    setSaveError(null);
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

  const onSaveAnalysis = async (updatedAnalysis: ExamAnalysis) => {
    if (!project) {
      return;
    }

    setSaveError(null);
    setSaveSuccess(false);
    setIsSavingAnalysis(true);

    try {
      const { error } = await updateProjectMetadataField(
        project.id,
        "analysis",
        updatedAnalysis,
      );

      if (error) {
        throw error;
      }

      dispatch({ type: "SET_ANALYSIS", payload: updatedAnalysis });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setIsSavingAnalysis(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div>
        <p className="text-body font-light text-ink">
          Analyze the extracted text to identify key components like questions,
          answers, and formatting. You can edit the analysis results if needed
          before proceeding to generate variants.
        </p>
      </div>

      <div className="flex gap-md">
        <button
          type="button"
          className="px-lg py-sm bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          disabled={isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing ? <RefreshCcw className="inline mr-2 animate-spin" /> : <Zap className="inline mr-2" />}
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </button>
        {analysis && !isEditing ? (
          <button
            type="button"
            className="px-lg py-sm bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft transition-colors"
            onClick={() => {
              setIsEditing(true);
              setSaveSuccess(false);
              setSaveError(null);
            }}
          >
            <Edit className="inline mr-2" />
            Edit
          </button>
        ) : null}
      </div>

      {analysis && isEditing ? (
        <EditableAnalysisCard
          analysis={analysis}
          isSaving={isSavingAnalysis}
          onSave={onSaveAnalysis}
        />
      ) : (
        <AnalysisCard analysis={analysis} />
      )}

      {saveError ? (
        <p
          className="py-md px-lg bg-red-100 text-red-700 rounded-md"
          role="alert"
        >
          {saveError}
        </p>
      ) : null}

      {saveSuccess ? (
        <p
          className="py-md px-lg bg-green-100 text-green-700 rounded-md"
          role="status"
        >
          Analysis saved.
        </p>
      ) : null}
    </div>
  );
}
