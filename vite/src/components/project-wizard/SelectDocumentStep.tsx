import { useContext, useEffect, useState } from "react";
import { DocumentExtractor } from "../document-extractor";
import { ProjectDispatchContext } from "../../context/ProjectContext";

export function SelectDocumentStep() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const dispatch = useContext(ProjectDispatchContext)!;

  useEffect(() => {
    if (content) {
      dispatch({ type: "SET_CONTENT", payload: content });
    }
  }, [content, dispatch]);

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

      <DocumentExtractor selectedFile={file} onContentExtracted={setContent} />
    </div>
  );
}
