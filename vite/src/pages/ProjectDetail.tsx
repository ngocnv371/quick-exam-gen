import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { getProjectDetail } from "../lib/supabase";
import { SelectDocumentStep } from "../components/project-wizard/SelectDocumentStep";
import {
  ProjectContext,
  ProjectDispatchContext,
  projectReducer,
  selectFurthestStep,
  type ProjectDetailViewModel,
  type WizardStep,
} from "../context/ProjectContext";
import { AnalyzeTextStep } from "../components/project-wizard/AnalyzeTextStep";
import { ResultStep } from "../components/project-wizard/ResultStep";
import { ProjectTitle } from "../components/project-title";

type StepConfig = {
  id: WizardStep;
  label: string;
};

const WIZARD_STEPS: StepConfig[] = [
  { id: "select", label: "Upload" },
  { id: "analyze", label: "Analyze" },
  { id: "result", label: "Generate" },
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

  const furthestStep = selectFurthestStep(state);
  const furthestStepIndex = WIZARD_STEPS.findIndex(
    (step) => step.id === furthestStep,
  );
  const persistentWizardError = state?.error;

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>
        <main className="w-full max-w-7xl mx-auto">
          <section className="flex flex-col items-center justify-center gap-lg py-6 px-lg bg-canvas">
            {state.loading ? (
              <h1 className="text-display-lg font-light text-ink">
                Loading project...
              </h1>
            ) : null}
            {!state.loading && state.error ? (
              <h1 className="text-display-lg font-light text-ink">
                Project unavailable
              </h1>
            ) : null}
            {!state.loading && !state.error && state.project ? (
              <ProjectTitle />
            ) : null}
          </section>

          <section className="py-6 px-lg bg-block-cream rounded-lg mx-lg">
            {state.error ? (
              <p
                className="py-md px-lg bg-red-100 text-red-700 rounded-md mb-lg"
                role="alert"
              >
                {state.error}
              </p>
            ) : null}

            {!state.error && state.project ? (
              <section
                className="space-y-lg"
                aria-label="Exam generation wizard"
              >
                <div
                  className="flex w-full flex-wrap gap-sm rounded-pill border border-hairline bg-canvas p-xs"
                  role="tablist"
                  aria-label="Wizard steps"
                >
                  {WIZARD_STEPS.map((step, index) => {
                    const isActive = state.step === step.id;
                    const isCompleted = index <= furthestStepIndex;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        role="tab"
                        id={`wizard-tab-${step.id}`}
                        aria-controls={`wizard-panel-${step.id}`}
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        className={`relative flex min-w-[180px] flex-1 flex-col items-start gap-1 rounded-pill px-lg py-xs text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                          isActive
                            ? "bg-primary text-on-primary"
                            : isCompleted
                              ? "bg-canvas text-ink hover:bg-surface-soft"
                              : "bg-canvas text-ink opacity-45 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          dispatch({ type: "SET_STEP", payload: step.id });
                        }}
                        disabled={!isCompleted && !isActive}
                      >
                        <span className="text-caption uppercase tracking-[0.6px]">
                          {`Step ${index + 1}`}
                        </span>
                        <span className="text-button font-medium truncate">
                          {step.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {persistentWizardError ? (
                  <p
                    className="py-md px-lg bg-red-100 text-red-700 rounded-md"
                    role="alert"
                  >
                    {persistentWizardError}
                  </p>
                ) : null}

                <div
                  id="wizard-panel-select"
                  role="tabpanel"
                  aria-labelledby="wizard-tab-select"
                  hidden={state.step !== "select"}
                >
                  <SelectDocumentStep />
                </div>
                <div
                  id="wizard-panel-analyze"
                  role="tabpanel"
                  aria-labelledby="wizard-tab-analyze"
                  hidden={state.step !== "analyze"}
                >
                  <AnalyzeTextStep />
                </div>
                <div
                  id="wizard-panel-result"
                  role="tabpanel"
                  aria-labelledby="wizard-tab-result"
                  hidden={state.step !== "result"}
                >
                  <ResultStep />
                </div>
              </section>
            ) : null}
          </section>
        </main>
      </ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
}
