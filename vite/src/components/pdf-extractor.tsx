import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { useEffect, useState } from "react";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

async function extractPdfContent(file: File) {
  const bytes = await file.arrayBuffer();
  const loadingTask = getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) =>
        "str" in item && typeof item.str === "string" ? item.str : "",
      )
      .join(" ")
      .trim();

    if (pageText) {
      pages.push(`--- Page ${pageNumber} ---\n${pageText}`);
    }
  }

  return pages.join("\n\n").trim();
}

export function PdfExtractor({
  selectedFile,
  onContentExtracted,
}: {
  selectedFile: File | null;
  onContentExtracted?: (content: string) => void;
}) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPdfPreviewUrl(null);
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      console.warn("Selected file is not a PDF:", selectedFile);
      setPdfPreviewUrl(null);
      return;
    }

    extractPdfContent(selectedFile).then((content) => {
      if (onContentExtracted) {
        onContentExtracted(content);
      }
    });
    
    const url = URL.createObjectURL(selectedFile);
    setPdfPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [onContentExtracted, selectedFile]);

  if (!pdfPreviewUrl) return null;

  return (
    <iframe
      title="PDF preview"
      src={pdfPreviewUrl}
      width="100%"
      height="600px"
      className="border-none"
    />
  );
}
