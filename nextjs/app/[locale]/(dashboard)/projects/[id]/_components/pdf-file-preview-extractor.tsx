"use client";

import { useEffect, useState } from "react";

type PdfTextItem = { str?: string };

type PdfDocumentLike = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getTextContent: () => Promise<{ items: Array<PdfTextItem | Record<string, unknown>> }>;
  }>;
};

type PdfJsLike = {
  getDocument: (src: { data: Uint8Array }) => { promise: Promise<PdfDocumentLike> };
  GlobalWorkerOptions?: { workerSrc?: string };
};

export function isPdfFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return file.type === "application/pdf" || lowerName.endsWith(".pdf");
}

export async function extractPdfContent(file: File): Promise<string> {
  let pdfJs: PdfJsLike;

  try {
    pdfJs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as PdfJsLike;
  } catch {
    pdfJs = (await import("pdfjs-dist")) as unknown as PdfJsLike;
  }

  if (pdfJs.GlobalWorkerOptions) {
    pdfJs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
  }

  const bytes = await file.arrayBuffer();
  const loadingTask = pdfJs.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .trim();

    if (pageText) {
      pages.push(`--- Page ${pageNumber} ---\n${pageText}`);
    }
  }

  return pages.join("\n\n").trim();
}

export function PdfPreview({ selectedFile }: { selectedFile: File | null }) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile || !isPdfFile(selectedFile)) {
      setPdfPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPdfPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  if (!pdfPreviewUrl) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Preview</h3>
      <div className="rounded-lg border border-border/50 bg-background overflow-hidden h-[480px]">
        <iframe title="PDF preview" src={pdfPreviewUrl} className="h-full w-full" />
      </div>
    </div>
  );
}
