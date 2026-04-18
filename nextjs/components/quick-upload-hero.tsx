"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { extractPdfContent, isPdfFile } from "@/app/[locale]/(dashboard)/projects/[id]/_components/pdf-file-preview-extractor";
import { extractDocxContent, isDocxFile } from "@/app/[locale]/(dashboard)/projects/[id]/_components/docx-file-preview-extractor";

export function QuickUploadHero() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setStatus("processing");
      setErrorMsg(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/auth/login?next=${encodeURIComponent("/")}`);
          setStatus("idle");
          return;
        }

        const title = file.name.replace(/\.[^/.]+$/, "").trim() || "Untitled Project";

        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({ title, user_id: user.id })
          .select("id")
          .single();

        if (projectError) throw projectError;

        let extractedText = "";
        let sourceFilePatch: Record<string, unknown> = { name: file.name, type: file.type };

        if (isPdfFile(file)) {
          extractedText = await extractPdfContent(file);
          sourceFilePatch = { ...sourceFilePatch, fileType: "pdf" };
        } else if (isDocxFile(file)) {
          const result = await extractDocxContent(file);
          extractedText = result.extractedText;
          sourceFilePatch = { ...sourceFilePatch, fileType: "docx" };
        } else {
          throw new Error("Unsupported file type. Please use a PDF or DOCX file.");
        }

        const metadata = {
          sourceFile: {
            ...sourceFilePatch,
            extractedText,
          },
        };

        await supabase.from("projects").update({ metadata }).eq("id", project.id);

        router.push(`/projects/${project.id}`);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStatus("error");
      }
    },
    [router],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be picked again after an error
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center gap-3 py-10 px-10 rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm w-full max-w-md">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
        <p className="text-sm text-foreground/60">Creating your project…</p>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a file to create a project"
      className={`relative flex flex-col items-center justify-center gap-3 py-10 px-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all w-full max-w-md outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-border/50 bg-background/30 hover:border-primary/50 hover:bg-background/50"
      } backdrop-blur-sm`}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={handleChange}
        tabIndex={-1}
      />
      <Upload className={`h-8 w-8 transition-colors ${isDragging ? "text-primary" : "text-foreground/40"}`} />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/80">
          {isDragging ? "Drop to create project" : "Drop a file or click to browse"}
        </p>
        <p className="text-xs text-foreground/40 mt-1">PDF or DOCX — a project is created for you instantly</p>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-xs text-destructive text-center mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
