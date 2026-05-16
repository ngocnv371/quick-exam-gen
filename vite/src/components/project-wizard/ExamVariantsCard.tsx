import { useState } from "react";
import type { ExamVariant } from "../../context/ProjectContext";
import { ExamCard } from "./ExamCard";
import "./ExamCard.css";

export function ExamVariantsCard({ variants }: { variants: ExamVariant[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedVariant = variants[selectedIndex];

  return (
    <div className="exam-tabs-container">
      <div className="exam-tabs">
        {variants.map((variant, index) => (
          <button
            key={variant.title}
            onClick={() => setSelectedIndex(index)}
            className={`exam-tab ${selectedIndex === index ? "active" : ""}`}
          >
            {variant.title}
          </button>
        ))}
      </div>

      {selectedVariant && <ExamCard exam={selectedVariant} />}
    </div>
  );
}
