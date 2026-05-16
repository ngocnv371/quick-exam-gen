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

export type WizardStep = "select" | "analyze" | "review" | "result";
export type ProjectState = {
  project: ProjectDetailViewModel | null;
  step: WizardStep;
  loading: boolean;
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
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload as string };
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
          step: "review",
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
    default:
      return state;
  }
}

export const ProjectContext = createContext<ProjectState | null>(null);

export const ProjectDispatchContext = createContext<React.Dispatch<{
  type: string;
  payload: unknown;
}> | null>(null);
