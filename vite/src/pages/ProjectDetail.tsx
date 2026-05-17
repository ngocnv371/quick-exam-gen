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
  { id: "select", label: "Select document" },
  { id: "analyze", label: "Analyze text" },
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
  const progressPercent = (furthestStepIndex / (WIZARD_STEPS.length - 1)) * 100;
  const persistentWizardError = state?.error;

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>
        <main className="w-full max-w-7xl mx-auto">
          <section className="flex flex-col items-center justify-center gap-lg py-section px-lg bg-canvas">
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

          <section className="py-section px-lg bg-block-cream rounded-lg mx-lg">
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
                  className="flex gap-md flex-wrap"
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
                        aria-selected={isActive}
                        className={`flex items-center gap-xs px-lg py-sm rounded-md font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-on-primary"
                            : isCompleted
                              ? "bg-surface-soft text-ink hover:bg-ink/10"
                              : "bg-surface-soft text-ink/40 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          dispatch({ type: "SET_STEP", payload: step.id });
                        }}
                        disabled={!isCompleted && !isActive}
                      >
                        <span className="font-bold text-sm">{index + 1}</span>
                        <span className="text-body-sm">{step.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="w-full h-1 bg-hairline rounded-full overflow-hidden"
                  aria-hidden
                >
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {persistentWizardError ? (
                  <p
                    className="py-md px-lg bg-red-100 text-red-700 rounded-md"
                    role="alert"
                  >
                    {persistentWizardError}
                  </p>
                ) : null}

                <div hidden={state.step !== "select"}>
                  <SelectDocumentStep />
                </div>
                <div hidden={state.step !== "analyze"}>
                  <AnalyzeTextStep />
                </div>
                <div hidden={state.step !== "result"}>
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
