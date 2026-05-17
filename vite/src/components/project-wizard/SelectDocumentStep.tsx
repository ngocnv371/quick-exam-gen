import { useContext, useState } from "react";
import { DocumentExtractor } from "../document-extractor";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "../../context/ProjectContext";
import { Save, RefreshCcw } from "lucide-react";
import { updateProjectMetadataField } from "../../lib/supabase";

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
    <div className="space-y-lg">
      <div>
        <p className="text-body font-light text-ink">
          Choose a PDF, DOC, or DOCX file. We extract raw text locally and use
          that text for the next step.
        </p>
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="document-upload" className="text-body-sm font-medium text-ink">Document file</label>
        <input
          id="document-upload"
          type="file"
          accept="application/pdf, .doc, .docx"
          className="block text-body-sm text-ink file:mr-md file:py-sm file:px-md file:rounded-md file:border-0 file:text-body-sm file:font-medium file:bg-surface-soft file:text-ink hover:file:bg-ink/10"
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
        <div className="space-y-lg pt-lg border-t border-hairline">
          <div>
            <label htmlFor="content-textarea" className="text-body-sm font-medium text-ink block mb-xs">
              Document text
            </label>
            <textarea
              id="content-textarea"
              className="w-full min-h-[300px] px-md py-sm rounded-md border border-hairline bg-canvas text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Extracted content will appear here..."
            />
          </div>

          <div className="flex items-center gap-md">
            <button
              className="px-lg py-sm bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              title={
                !hasUnsavedChanges ? "No changes to save" : "Save changes"
              }
            >
              {isSaving ? <RefreshCcw className="inline mr-2 animate-spin" /> : <Save className="inline mr-2" />}
              {isSaving ? "Saving..." : "Save"}
            </button>
            {hasUnsavedChanges && (
              <span className="text-body-sm text-amber-600">
                You have unsaved changes
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
