import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { DocumentExtractor } from "../components/document-extractor";

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

        <div style={{ margin: "2rem 0" }}>
          <label htmlFor="pdf-upload" style={{ fontWeight: 500 }}>
            Select a PDF to preview:
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf, .doc, .docx"
            style={{ display: "block", marginTop: 8 }}
            onChange={(e) => {
              const file =
                e.target.files && e.target.files[0] ? e.target.files[0] : null;
              setSelectedFile(file);
              console.log("Selected file:", file);
            }}
          />
        </div>

        <div style={{ margin: "2rem 0" }}>
          <DocumentExtractor selectedFile={selectedFile} />
        </div>

        <div className="actions-row">
          <Link className="pill-btn secondary" to="/projects">
            Back to projects
          </Link>
        </div>
      </section>
    </main>
  );
}
