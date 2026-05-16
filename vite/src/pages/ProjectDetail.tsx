import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { DocumentExtractor } from "../components/document-extractor";

type WizardStep = "select" | "analyze" | "review" | "result";

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

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function callAnalyzeTextApi(rawText: string) {
  if (rawText.trim().length < 20) {
    throw new Error("Extracted text is too short to analyze.");
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: rawText }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string; details?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error ?? payload?.details ?? "Unable to analyze extracted text.",
    );
  }

  return JSON.stringify(payload, null, 2);
}

async function callGenerateVariantsApi(analyzedText: string) {
  // TODO: Replace this stub with a real API call.
  await wait(1500);
  return `Variant generation completed at ${new Date().toLocaleString()}\n\n${analyzedText}`;
}

type ProjectDetailRow = {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
};

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState<WizardStep>("select");
  const [extractedText, setExtractedText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [variantsResult, setVariantsResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [variantsError, setVariantsError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const loadProject = async () => {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("id, title, status, type, created_at, updated_at")
        .eq("id", projectId)
        .eq("type", "exam")
        .maybeSingle();

      if (fetchError) {
        setProject(null);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setProject(null);
        setError("Project not found.");
        setLoading(false);
        return;
      }

      setProject(data as ProjectDetailRow);
      setError(null);
      setLoading(false);
    };

    void loadProject();
  }, [projectId]);

  if (!projectId) {
    return;
  }

  const furthestStep = variantsResult
    ? 3
    : analysisResult
      ? 2
      : extractedText
        ? 1
        : 0;
  const progressPercent = (furthestStep / (WIZARD_STEPS.length - 1)) * 100;
  const persistentWizardError = variantsError ?? analysisError;

  const handleAnalyze = async () => {
    if (!extractedText.trim()) {
      setAnalysisError("Please select a supported document and wait for text extraction.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await callAnalyzeTextApi(extractedText);
      setAnalysisResult(result);
      setVariantsResult(null);
      setVariantsError(null);
      setActiveStep("review");
    } catch (analyzeError) {
      setAnalysisError(
        analyzeError instanceof Error
          ? analyzeError.message
          : "Unable to analyze extracted text.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateVariants = async () => {
    if (!analysisResult?.trim()) {
      setVariantsError("Run analyze first before generating variants.");
      return;
    }

    setIsGeneratingVariants(true);
    setVariantsError(null);

    try {
      const result = await callGenerateVariantsApi(analysisResult);
      setVariantsResult(result);
      setActiveStep("result");
    } catch (generateError) {
      setVariantsError(
        generateError instanceof Error
          ? generateError.message
          : "Unable to generate variants.",
      );
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  return (
    <main className="page">
      <section className="hero-section">
        <p className="eyebrow">Project detail</p>
        {loading ? <h1 className="display-title">Loading project...</h1> : null}
        {!loading && error ? (
          <h1 className="display-title">Project unavailable</h1>
        ) : null}
        {!loading && !error && project ? (
          <h1 className="display-title">{project.title}</h1>
        ) : null}
      </section>

      <section className="color-block block-cream">
        {error ? (
          <p className="projects-error" role="alert">
            {error}
          </p>
        ) : null}

        {!error && project ? (
          <div className="panel-grid">
            <article className="panel-card block-surface">
              <h3>Status</h3>
              <p>{project.status}</p>
            </article>
            <article className="panel-card block-surface">
              <h3>Updated</h3>
              <p>{new Date(project.updated_at).toLocaleString()}</p>
            </article>
          </div>
        ) : null}

        {!error && project ? (
          <section className="exam-wizard" aria-label="Exam generation wizard">
            <div className="wizard-tabs" role="tablist" aria-label="Wizard steps">
              {WIZARD_STEPS.map((step, index) => {
                const isActive = activeStep === step.id;
                const isCompleted = index <= furthestStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`wizard-tab${isActive ? " is-active" : ""}${isCompleted ? " is-completed" : ""}`}
                    onClick={() => {
                      setActiveStep(step.id);
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

            {activeStep === "select" ? (
              <div className="wizard-step-panel">
                <h2 className="headline">Step 1. Select document</h2>
                <p className="body-copy">
                  Choose a PDF, DOC, or DOCX file. We extract raw text locally and
                  use that text for the next step.
                </p>

                <div className="wizard-field">
                  <label htmlFor="document-upload">Document file</label>
                  <input
                    id="document-upload"
                    type="file"
                    accept="application/pdf, .doc, .docx"
                    onChange={(e) => {
                      const file =
                        e.target.files && e.target.files[0] ? e.target.files[0] : null;

                      setSelectedFile(file);
                      setExtractedText("");
                      setAnalysisResult(null);
                      setVariantsResult(null);
                      setAnalysisError(null);
                      setVariantsError(null);
                      setActiveStep("select");
                    }}
                  />
                </div>

                <DocumentExtractor
                  selectedFile={selectedFile}
                  onContentExtracted={(content) => {
                    setExtractedText(content);
                    setAnalysisResult(null);
                    setVariantsResult(null);
                  }}
                />

                <p className="wizard-helper">
                  {selectedFile && !extractedText
                    ? "Extracting text from your document..."
                    : extractedText
                      ? "Text extraction complete. You can move to Analyze text."
                      : "No document selected yet."}
                </p>
              </div>
            ) : null}

            {activeStep === "analyze" ? (
              <div className="wizard-step-panel">
                <h2 className="headline">Step 2. Analyze extracted text</h2>
                <p className="body-copy">
                  This step sends only extracted raw text to an API. Original files are
                  not uploaded.
                </p>

                <textarea
                  className="wizard-textarea"
                  value={extractedText}
                  readOnly
                  placeholder="Extracted text will appear here after selecting a document."
                />

                <div className="actions-row">
                  <button
                    type="button"
                    className="pill-btn primary"
                    disabled={isAnalyzing}
                    onClick={() => {
                      void handleAnalyze();
                    }}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze text"}
                  </button>
                  {isAnalyzing ? (
                    <p className="projects-loading" role="status">
                      Calling analysis API...
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeStep === "review" ? (
              <div className="wizard-step-panel">
                <h2 className="headline">Step 3. Review and generate variants</h2>
                <p className="body-copy">
                  Review analyzed content, then generate variants.
                </p>

                <pre className="wizard-pre">{analysisResult ?? "No analysis result yet."}</pre>

                <div className="actions-row">
                  <button
                    type="button"
                    className="pill-btn primary wizard-big-cta"
                    disabled={isGeneratingVariants}
                    onClick={() => {
                      void handleGenerateVariants();
                    }}
                  >
                    {isGeneratingVariants
                      ? "Generating variants..."
                      : "Generate variants"}
                  </button>
                  {isGeneratingVariants ? (
                    <p className="projects-loading" role="status">
                      Calling variant generation API...
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeStep === "result" ? (
              <div className="wizard-step-panel">
                <h2 className="headline">Step 4. View result</h2>
                <p className="body-copy">
                  Final generated variants are shown below.
                </p>
                <pre className="wizard-pre">{variantsResult ?? "No generated variants yet."}</pre>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="actions-row">
          <Link className="pill-btn secondary" to="/projects">
            Back to projects
          </Link>
        </div>
      </section>
    </main>
  );
}
