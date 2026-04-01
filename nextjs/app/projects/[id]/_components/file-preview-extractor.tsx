"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileText, Loader2, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DocxPreview, extractDocxContent, isDocxFile } from "./docx-file-preview-extractor";
import { extractPdfContent, isPdfFile, PdfPreview } from "./pdf-file-preview-extractor";

type SupportedFileType = "pdf" | "docx";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown processing error";
}

function detectFileType(file: File): SupportedFileType | null {
  if (isPdfFile(file)) return "pdf";
  if (isDocxFile(file)) return "docx";
  return null;
}

export function FilePreviewExtractor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<SupportedFileType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setExtractedText("");
    setDocxPreviewHtml(null);
    setError(null);

    if (!file) {
      setSelectedType(null);
      return;
    }

    const fileType = detectFileType(file);
    if (!fileType) {
      setSelectedType(null);
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    setSelectedType(fileType);
    setIsProcessing(true);

    try {
      if (fileType === "pdf") {
        const text = await extractPdfContent(file);
        setExtractedText(text || "No readable text was extracted from this PDF.");
        return;
      }

      const docxResult = await extractDocxContent(file);
      setExtractedText(docxResult.extractedText || "No readable text was extracted from this DOCX file.");
      setDocxPreviewHtml(docxResult.previewHtml || null);
    } catch (parseError) {
      console.error("File processing failed", parseError);
      setError(`Could not process this file: ${getErrorMessage(parseError)}`);
    } finally {
      setIsProcessing(false);
    }
  }

  function resetSelection() {
    setSelectedFile(null);
    setSelectedType(null);
    setIsProcessing(false);
    setError(null);
    setExtractedText("");
    setDocxPreviewHtml(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Source File
        </CardTitle>
        <CardDescription>Upload a PDF or DOCX and review preview + extracted content.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="block w-full cursor-pointer text-sm text-foreground/80 file:mr-3 file:rounded-md file:border file:border-border/60 file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/40"
          />

          <Button
            type="button"
            variant="outline"
            onClick={resetSelection}
            disabled={!selectedFile && !extractedText && !error}
            className="shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {selectedFile ? (
          <div className="text-sm text-foreground/70 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>
              {selectedFile.name} ({Math.ceil(selectedFile.size / 1024)} KB)
            </span>
          </div>
        ) : null}

        {isProcessing ? (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-6 text-sm text-foreground/70 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting content from file...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!isProcessing && !error && selectedType === "pdf" ? <PdfPreview selectedFile={selectedFile} /> : null}
        {!isProcessing && !error && selectedType === "docx" ? <DocxPreview previewHtml={docxPreviewHtml} /> : null}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Extracted content</h3>
          <Textarea
            value={extractedText}
            readOnly
            placeholder="Extracted text from the file will appear here..."
            className="min-h-[220px] bg-background"
          />
        </div>
      </CardContent>
    </Card>
  );
}
