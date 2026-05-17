import mammoth from "mammoth/mammoth.browser";
import { useEffect, useState } from "react";

async function extractDocxContent(file: File) {
  const bytes = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: bytes });
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer: bytes });
  return { html: htmlResult.value.trim(), rawText: rawTextResult.value.trim() };
}

export function DocxExtractor({
  selectedFile,
  onContentExtracted,
}: {
  selectedFile: File | null;
  onContentExtracted?: (content: string) => void;
}) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedFile) return;

    const isDocx =
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      selectedFile.name.toLowerCase().endsWith(".docx");

    if (!isDocx) return;

    extractDocxContent(selectedFile).then((result) => {
      setHtml(result.html);
      if (onContentExtracted) {
        onContentExtracted(result.rawText);
      }
    });
  }, [onContentExtracted, selectedFile]);

  if (!html) {
    return null;
  }

  return <>
  <hr className="w-full my-4" />
  <div dangerouslySetInnerHTML={{ __html: html || "" }} /></>;
}
