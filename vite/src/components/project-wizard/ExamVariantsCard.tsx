import { useState } from "react";
import type { ExamVariant } from "../../context/ProjectContext";
import { ExamCard } from "./ExamCard";

export function ExamVariantsCard({ variants }: { variants: ExamVariant[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedVariant = variants[selectedIndex];

  return (
    <div className="space-y-lg">
      <div className="flex gap-md flex-wrap border-b border-hairline pb-lg">
        {variants.map((variant, index) => (
          <button
            key={variant.title}
            onClick={() => setSelectedIndex(index)}
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

      {selectedVariant && <ExamCard exam={selectedVariant} />}
    </div>
  );
}
