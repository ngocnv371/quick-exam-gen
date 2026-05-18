import { createContext } from "react";

export type ExamAnalysis = {
  title: string;
  subject: string;
  overallIntent: string;
  questions: {
    index: number;
    text: string;
    questionType: "multiple-choice" | "open-ended" | "unknown";
    intendedPurpose: string;
    testedSkills: string[];
  }[];
};

export type ExamVariant = {
  title: string;
  subject: string;
  questions: {
    index: number;
    text: string;
    explanation: string;
    questionType: "multiple-choice" | "open-ended";
    answer: string;
    choices?: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
};

export type ProjectDetailViewModel = {
  id: string;
  title: string;
  status: string;
  type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type WizardStep = "select" | "analyze" | "result";
export type ProjectState = {
  project: ProjectDetailViewModel | null;
  step: WizardStep;
  loading: boolean;
  isAnalyzing: boolean;
  isGenerating: boolean;
  error: string | null;
};

export function projectReducer(
  state: ProjectState,
  action: { type: string; payload: unknown },
): ProjectState {
  switch (action.type) {
    case "SET_PROJECT":
      return {
        ...state,
        project: action.payload as ProjectDetailViewModel,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload as boolean };
    case "SET_IS_ANALYZING":
      return { ...state, isAnalyzing: action.payload as boolean };
    case "SET_IS_GENERATING":
      return { ...state, isGenerating: action.payload as boolean };
    case "SET_ERROR":
      return {
        ...state,
        loading: false,
        isAnalyzing: false,
        isGenerating: false,
        error: action.payload as string,
      };
    case "SET_STEP":
      return { ...state, step: action.payload as WizardStep };
    case "SET_CONTENT":
      if (state.project) {
        const metadata = {
          ...state.project.metadata,
          content: action.payload,
          analysis: null,
          variants: null,
        };
        return {
          ...state,
          project: { ...state.project, metadata },
          error: null,
          step: "analyze",
        };
      }
      return state;
    case "SET_ANALYSIS":
      if (state.project) {
        const metadata = {
          ...state.project.metadata,
          analysis: action.payload,
          variants: null,
        };
        return {
          ...state,
          project: { ...state.project, metadata },
          error: null,
          step: "analyze",
        };
      }
      return state;
    case "SET_VARIANTS":
      if (state.project) {
        const metadata = {
          ...state.project.metadata,
          variants: action.payload,
        };
        return {
          ...state,
          project: { ...state.project, metadata },
          error: null,
          step: "result",
        };
      }
      return state;
    case "UPDATE_VARIANT":
      if (state.project) {
        const { index, variant } = action.payload as { index: number; variant: ExamVariant };
        const variants = (state.project.metadata.variants as ExamVariant[]).map(
          (v, i) => (i === index ? variant : v),
        );
        return {
          ...state,
          project: { ...state.project, metadata: { ...state.project.metadata, variants } },
          error: null,
        };
      }
      return state;
    case "UPDATE_TITLE":
      if (state.project) {
        return {
          ...state,
          project: { ...state.project, title: action.payload as string },
          error: null,
        };
      }
      return state;
    default:
      return state;
  }
}

export function selectFurthestStep(state: ProjectState): WizardStep {
  const project = state.project;
  const metadata = project?.metadata || {};

  if (!metadata.content) {
    return "select";
  }
  if (!metadata.analysis) {
    return "analyze";
  }
  return "result";
}

export const ProjectContext = createContext<ProjectState | null>(null);

export const ProjectDispatchContext = createContext<React.Dispatch<{
  type: string;
  payload: unknown;
}> | null>(null);
