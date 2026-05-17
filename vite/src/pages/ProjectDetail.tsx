import { useEffect, useReducer } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectDetail } from "../lib/supabase";
import { SelectDocumentStep } from "../components/project-wizard/SelectDocumentStep";
import {
  ProjectContext,
  ProjectDispatchContext,
  projectReducer,
  type ProjectDetailViewModel,
  type WizardStep,
} from "../context/ProjectContext";
import { AnalyzeTextStep } from "../components/project-wizard/AnalyzeTextStep";
import { ReviewGenerateStep } from "../components/project-wizard/ReviewGenerateStep";
import { ResultStep } from "../components/project-wizard/ResultStep";

type StepConfig = {
  id: WizardStep;
  label: string;
};

const WIZARD_STEPS: StepConfig[] = [
  { id: "select", label: "Select document" },
  { id: "analyze", label: "Analyze text" },
  { id: "review", label: "Review & generate" },
  { id: "result", label: "View result" },
];

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [state, dispatch] = useReducer(projectReducer, {
    project: null,
    step: "select",
    loading: false,
    isAnalyzing: false,
    isGenerating: false,
    error: null,
  });

  // Load project details on mount
  useEffect(() => {
    if (!projectId) {
      return;
    }

    const loadProject = async () => {
      console.log("Loading project with ID:", projectId);
      dispatch({ type: "SET_LOADING", payload: true });

      const { data, error: fetchError } = await getProjectDetail(projectId);

      if (fetchError) {
        dispatch({ type: "SET_ERROR", payload: fetchError.message });
        return;
      }

      if (!data) {
        dispatch({ type: "SET_ERROR", payload: "Project not found." });
        return;
      }

      console.log("Project data loaded:", data);
      dispatch({
        type: "SET_PROJECT",
        payload: data as ProjectDetailViewModel,
      });
    };

    void loadProject();
  }, [projectId]);

  if (!projectId) {
    return;
  }

  const furthestStep =
    state.step === "result"
      ? 3
      : state.step === "review"
        ? 2
        : state.step === "analyze"
          ? 1
          : 0;
  const progressPercent = (furthestStep / (WIZARD_STEPS.length - 1)) * 100;
  const persistentWizardError = state?.error;

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>
        <main className="page">
          <section className="hero-section">
            {state.loading ? (
              <h1 className="display-title">Loading project...</h1>
            ) : null}
            {!state.loading && state.error ? (
              <h1 className="display-title">Project unavailable</h1>
            ) : null}
            {!state.loading && !state.error && state.project ? (
              <h1 className="display-title">{state.project.title}</h1>
            ) : null}
          </section>

          <section className="color-block block-cream">
            {state.error ? (
              <p className="projects-error" role="alert">
                {state.error}
              </p>
            ) : null}

            {!state.error && state.project ? (
              <section
                className="exam-wizard"
                aria-label="Exam generation wizard"
              >
                <div
                  className="wizard-tabs"
                  role="tablist"
                  aria-label="Wizard steps"
                >
                  {WIZARD_STEPS.map((step, index) => {
                    const isActive = state.step === step.id;
                    const isCompleted = index <= furthestStep;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`wizard-tab${isActive ? " is-active" : ""}${isCompleted ? " is-completed" : ""}`}
                        onClick={() => {
                          dispatch({ type: "SET_STEP", payload: step.id });
                        }}
                      >
                        <span className="wizard-tab-index">{index + 1}</span>
                        <span>{step.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="wizard-progress" aria-hidden>
                  <div
                    className="wizard-progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {persistentWizardError ? (
                  <p className="projects-error" role="alert">
                    {persistentWizardError}
                  </p>
                ) : null}

                <div hidden={state.step !== "select"}>
                  <SelectDocumentStep />
                </div>
                <div hidden={state.step !== "analyze"}>
                  <AnalyzeTextStep />
                </div>
                <div hidden={state.step !== "review"}>
                  <ReviewGenerateStep />
                </div>
                <div hidden={state.step !== "result"}>
                  <ResultStep />
                </div>
              </section>
            ) : null}

            <div className="actions-row">
              <Link className="pill-btn secondary" to="/projects">
                Back to projects
              </Link>
            </div>
          </section>
        </main>
      </ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
}
