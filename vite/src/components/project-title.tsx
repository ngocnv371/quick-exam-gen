import { useContext, useState } from "react";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "../context/ProjectContext";
import { updateProjectTitle } from "../lib/supabase";

export function ProjectTitle() {
  const project = useContext(ProjectContext)?.project;
  const dispatch = useContext(ProjectDispatchContext);

  const [title, setTitle] = useState(project?.title || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!project) {
    return null;
  }

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await updateProjectTitle(project.id, title);
      dispatch?.({ type: "UPDATE_TITLE", payload: title });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update project title:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(project.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="project-title-edit-container">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel}
          disabled={isSaving}
          autoFocus
          className="project-title-input"
        />
        <div className="project-title-button-group">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="project-title-button save"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="project-title-button cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <h1 onClick={() => setIsEditing(true)} className="project-title">
      {project.title}
    </h1>
  );
}
