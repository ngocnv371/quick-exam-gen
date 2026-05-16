import { DocxExtractor } from "./docx-extractor";
import { PdfExtractor } from "./pdf-extractor";

export function DocumentExtractor({
  selectedFile,
  onContentExtracted,
}: {
  selectedFile: File | null;
  onContentExtracted?: (content: string) => void;
}) {
  const isPdf =
    selectedFile?.type === "application/pdf" ||
    selectedFile?.name.toLowerCase().endsWith(".pdf");
  const isDocx =
    selectedFile?.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    selectedFile?.name.toLowerCase().endsWith(".docx") ||
    selectedFile?.name.toLowerCase().endsWith(".doc");

  if (!selectedFile) {
    return null;
  }

  if (isPdf) {
    return <PdfExtractor selectedFile={selectedFile} onContentExtracted={onContentExtracted} />;
  }

  if (isDocx) {
    return <DocxExtractor selectedFile={selectedFile} onContentExtracted={onContentExtracted} />;
  }

  return null;
}
