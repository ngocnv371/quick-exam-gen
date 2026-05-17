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
      <div className="flex flex-col gap-2 w-full mx-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          autoFocus
          className="text-2xl font-bold px-4 py-2 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-black text-white rounded-full px-6 py-2 font-medium transition-colors duration-150 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="bg-white text-black border border-black rounded-full px-6 py-2 font-medium transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className="text-4xl font-bold tracking-tight cursor-pointer px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors duration-150"
    >
      {project.title}
    </h1>
  );
}
