"use client";

import { useTranslations } from "next-intl";

type MammothLike = {
  extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

export function isDocxFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  );
}

export async function extractDocxContent(file: File): Promise<{ extractedText: string; previewHtml: string }> {
  let mammoth: MammothLike;

  try {
    const browserEntry = "mammoth/mammoth.browser";
    mammoth = (await import(browserEntry)) as MammothLike;
  } catch {
    mammoth = (await import("mammoth")) as MammothLike;
  }

  const bytes = await file.arrayBuffer();

  const [rawTextResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ arrayBuffer: bytes }),
    mammoth.convertToHtml({ arrayBuffer: bytes }),
  ]);

  return {
    extractedText: rawTextResult.value.trim(),
    previewHtml: htmlResult.value,
  };
}

export function DocxPreview({ previewHtml }: { previewHtml: string | null }) {
  const t = useTranslations('Preview');
  if (!previewHtml) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t("title")}</h3>
        <div className="rounded-lg border border-border/50 bg-background p-4 max-h-[480px] overflow-auto">
          <p className="text-sm text-foreground/60">{t("noVisualPreview")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{t("title")}</h3>
      <div className="rounded-lg border border-border/50 bg-background p-4 max-h-[480px] overflow-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  );
}
