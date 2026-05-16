import { useContext } from "react";
import { ProjectContext, type ExamVariant } from "../../context/ProjectContext";
import { ExamVariantsCard } from "./ExamVariantsCard";

export function ResultStep() {
  const { project } = useContext(ProjectContext)!;
  const variantsResult = project?.metadata?.variants as ExamVariant[];

  return (
    <div className="wizard-step-panel">
      <h2 className="headline">Step 4. View result</h2>
      <p className="body-copy">Final generated variants are shown below.</p>
      {variantsResult?.length ? (
        <ExamVariantsCard variants={variantsResult} />
      ) : (
        <p>No generated variants yet.</p>
      )}
    </div>
  );
}
