import { useState } from "react";
import { Edit, X } from "lucide-react";
import type { ExamVariant } from "../../context/ProjectContext";
import { ExamCard } from "./ExamCard";
import { EditableExamCard } from "./EditableExamCard";

type ExamVariantsCardProps = {
  variants: ExamVariant[];
  isSaving: boolean;
  onSaveVariant: (index: number, variant: ExamVariant) => void | Promise<void>;
};

export function ExamVariantsCard({ variants, isSaving, onSaveVariant }: ExamVariantsCardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const selectedVariant = variants[selectedIndex];

  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    setIsEditing(false);
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center gap-md flex-wrap border-b border-hairline pb-lg">
        <div className="flex gap-md flex-wrap flex-1">
          {variants.map((variant, index) => (
            <button
              key={variant.title}
              onClick={() => handleTabChange(index)}
              className={`px-lg py-sm rounded-pill text-button font-medium transition-colors ${
                selectedIndex === index
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-soft text-ink hover:bg-ink/10'
              }`}
            >
              {variant.title}
            </button>
          ))}
        </div>

        {selectedVariant && !isEditing && (
          <button
            type="button"
            className="px-lg py-sm bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft transition-colors flex items-center gap-sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
        {isEditing && (
          <button
            type="button"
            className="px-lg py-sm bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft transition-colors flex items-center gap-sm"
            onClick={() => setIsEditing(false)}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {selectedVariant && !isEditing && <ExamCard exam={selectedVariant} />}
      {selectedVariant && isEditing && (
        <EditableExamCard
          exam={selectedVariant}
          isSaving={isSaving}
          onSave={async (updated) => {
            await onSaveVariant(selectedIndex, updated);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
}
