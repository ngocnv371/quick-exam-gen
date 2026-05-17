import { useContext, useState } from "react";
import { DocumentExtractor } from "../document-extractor";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "../../context/ProjectContext";
import { updateProjectMetadataField } from "../../lib/supabase";
import "./SelectDocumentStep.css";

export function SelectDocumentStep() {
  const [file, setFile] = useState<File | null>(null);
  const project = useContext(ProjectContext)!;
  const dispatch = useContext(ProjectDispatchContext)!;
  const projectId = project?.project?.id || null;
  const originalContent =
    (project?.project?.metadata?.content as string | null) || null;

  const [editedContent, setEditedContent] = useState<string | null>(
    originalContent
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedContent) return;

    setIsSaving(true);
    try {
      dispatch({ type: "SET_CONTENT", payload: editedContent });
      if (projectId) {
        await updateProjectMetadataField(projectId, "content", editedContent);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = editedContent !== originalContent;

  return (
    <div className="wizard-step-panel">
      <h2 className="headline">Step 1. Select document</h2>
      <p className="body-copy">
        Choose a PDF, DOC, or DOCX file. We extract raw text locally and use
        that text for the next step.
      </p>

      <div className="wizard-field">
        <label htmlFor="document-upload">Document file</label>
        <input
          id="document-upload"
          type="file"
          accept="application/pdf, .doc, .docx"
          onChange={(event) => {
            const file =
              event.target.files && event.target.files[0]
                ? event.target.files[0]
                : null;

            setFile(file);
          }}
        />
      </div>

      <DocumentExtractor
        selectedFile={file}
        onContentExtracted={setEditedContent}
      />

      {editedContent && (
        <div className="content-editor-section">
          <hr style={{ width: "100%" }} />
          <label htmlFor="content-textarea" className="editor-label">
            Document text
          </label>
          <textarea
            id="content-textarea"
            className="content-textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Extracted content will appear here..."
          />

          <div className="editor-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              title={
                !hasUnsavedChanges ? "No changes to save" : "Save changes"
              }
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            {hasUnsavedChanges && (
              <span className="unsaved-indicator">
                You have unsaved changes
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
