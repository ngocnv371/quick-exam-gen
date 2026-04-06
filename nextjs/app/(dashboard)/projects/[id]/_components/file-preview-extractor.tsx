"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { FileText, Loader2, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DocxPreview, extractDocxContent, isDocxFile } from "./docx-file-preview-extractor";
import { extractPdfContent, isPdfFile, PdfPreview } from "./pdf-file-preview-extractor";

type SupportedFileType = "pdf" | "docx";
type ProjectMetadata = Record<string, unknown>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown processing error";
}

function detectFileType(file: File): SupportedFileType | null {
  if (isPdfFile(file)) return "pdf";
  if (isDocxFile(file)) return "docx";
  return null;
}

function asProjectMetadata(value: unknown): ProjectMetadata {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as ProjectMetadata;
  }

  return {};
}

function getInitialExtractedText(metadata: ProjectMetadata | null): string {
  const safeMetadata = asProjectMetadata(metadata);
  const sourceFile = asProjectMetadata(safeMetadata.sourceFile);

  if (typeof sourceFile.extractedText === "string") {
    return sourceFile.extractedText;
  }

  // Backward-compatible fallback if an earlier shape stored text at top level.
  if (typeof safeMetadata.extractedText === "string") {
    return safeMetadata.extractedText;
  }

  return "";
}

export function FilePreviewExtractor({
  projectId,
  initialMetadata,
}: {
  projectId: string;
  initialMetadata: ProjectMetadata | null;
}) {
  const initialExtractedText = getInitialExtractedText(initialMetadata);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipNextAutoSaveRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<SupportedFileType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState(initialExtractedText);
  const [lastSavedText, setLastSavedText] = useState(initialExtractedText);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [docxPreviewHtml, setDocxPreviewHtml] = useState<string | null>(null);

  const saveExtractedContentToMetadata = useCallback(async (
    text: string,
    options?: {
      sourceFilePatch?: ProjectMetadata;
      showSuccessToast?: boolean;
    },
  ) => {
    setIsSavingMetadata(true);
    const supabase = createClient();

    try {
      const { data: currentProject, error: fetchError } = await supabase
        .from("projects")
        .select("metadata")
        .eq("id", projectId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const latestMetadata = asProjectMetadata(currentProject?.metadata);
      const fallbackMetadata = asProjectMetadata(initialMetadata);
      const existingSourceFile = asProjectMetadata(
        latestMetadata.sourceFile ?? fallbackMetadata.sourceFile,
      );
      const mergedMetadata: ProjectMetadata = {
        ...fallbackMetadata,
        ...latestMetadata,
        sourceFile: {
          ...existingSourceFile,
          ...(options?.sourceFilePatch ?? {}),
          extractedText: text,
        },
      };

      const { error: updateError } = await supabase
        .from("projects")
        .update({ metadata: mergedMetadata })
        .eq("id", projectId);

      if (updateError) {
        throw updateError;
      }

      setLastSavedText(text);

      if (options?.showSuccessToast) {
        toast.success("Extracted content saved");
      }

      return true;
    } catch (saveError) {
      const message = getErrorMessage(saveError);
      if (options?.showSuccessToast) {
        toast.error("Could not save extracted content", {
          description: message,
        });
      }
      return message;
    } finally {
      setIsSavingMetadata(false);
    }
  }, [initialMetadata, projectId]);

  useEffect(() => {
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    if (isProcessing || extractedText === lastSavedText) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsAutoSaving(true);
      setAutoSaved(false);
      setAutoSaveError(null);

      const saveResult = await saveExtractedContentToMetadata(extractedText);

      setIsAutoSaving(false);
      if (saveResult === true) {
        setAutoSaved(true);
        window.setTimeout(() => setAutoSaved(false), 1800);
        return;
      }

      setAutoSaveError(typeof saveResult === "string" ? saveResult : "Auto-save failed.");
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [extractedText, isProcessing, lastSavedText, saveExtractedContentToMetadata]);

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
        const extracted = text || "No readable text was extracted from this PDF.";
        setExtractedText(extracted);
        await saveExtractedContentToMetadata(extracted, {
          sourceFilePatch: {
            name: file.name,
            type: file.type,
            size: file.size,
            extractedAt: new Date().toISOString(),
          },
          showSuccessToast: true,
        });
        return;
      }

      const docxResult = await extractDocxContent(file);
      const extracted =
        docxResult.extractedText || "No readable text was extracted from this DOCX file.";
      setExtractedText(extracted);
      setDocxPreviewHtml(docxResult.previewHtml || null);
      await saveExtractedContentToMetadata(extracted, {
        sourceFilePatch: {
          name: file.name,
          type: file.type,
          size: file.size,
          extractedAt: new Date().toISOString(),
        },
        showSuccessToast: true,
      });
    } catch (parseError) {
      console.error("File processing failed", parseError);
      setError(`Could not process this file: ${getErrorMessage(parseError)}`);
    } finally {
      setIsProcessing(false);
    }
  }

  function resetSelection() {
    skipNextAutoSaveRef.current = true;
    setSelectedFile(null);
    setSelectedType(null);
    setIsProcessing(false);
    setError(null);
    setExtractedText("");
    setAutoSaved(false);
    setAutoSaveError(null);
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

        {!isProcessing && !error && selectedType === "pdf" ? <PdfPreview selectedFile={selectedFile} /> : null}
        {!isProcessing && !error && selectedType === "docx" ? <DocxPreview previewHtml={docxPreviewHtml} /> : null}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Extracted content</h3>
          <Textarea
            value={extractedText}
            onChange={(e) => {
              setExtractedText(e.target.value);
              setAutoSaved(false);
              setAutoSaveError(null);
            }}
            placeholder="Extracted text from the file will appear here..."
            className="min-h-[220px] bg-background"
          />
        </div>

        <div className="text-xs">
          {isAutoSaving ? <span className="text-foreground/60">Auto-saving...</span> : null}
          {!isAutoSaving && autoSaved ? <span className="text-foreground/60">Auto-saved</span> : null}
          {!isAutoSaving && autoSaveError ? <span className="text-destructive">{autoSaveError}</span> : null}
        </div>

        {isSavingMetadata ? (
          <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground/70 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving extracted content to metadata...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
