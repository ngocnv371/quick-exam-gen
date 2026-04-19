import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  ProjectTitleEditor,
  DeleteProjectButton,
  ProjectStatusEditor,
  ProjectDescriptionEditor,
} from "./_components/project-actions";
import { FilePreviewExtractor } from "./_components/file-preview-extractor";
import { ExamVariantsGenerator } from "./_components/exam-variants-generator";
import { ProjectStatus, STATUS_BADGE } from "../_lib/constants";
import { useTranslations } from "next-intl";
import { getProjectDetail } from "@/lib/projects";

function ProjectHeader({
  projectId,
  title,
  status,
  updated_at,
  created_at,
}: {
  projectId: string;
  title: string;
  status: ProjectStatus;
  updated_at: string;
  created_at: string;
}) {
  const t = useTranslations("Common");
  return (
    <div className="flex flex-col gap-2">
      <ProjectTitleEditor id={projectId} initialTitle={title} />
      <div className="flex items-center gap-3 flex-wrap">
        <ProjectStatusEditor id={projectId} initialStatus={status} />
        <Badge variant={STATUS_BADGE[status] ?? "secondary"}>{status}</Badge>
        <span className="text-xs text-foreground/50">
          {t("updatedAt", { date: new Date(updated_at).toLocaleDateString() })}
        </span>
        <span className="text-xs text-foreground/50">
          {t("createdAt", { date: new Date(created_at).toLocaleDateString() })}
        </span>
      </div>
    </div>
  );
}

async function ProjectDetail({ id }: { id: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await getProjectDetail(supabase, id);

  if (!project) notFound();

  const status = project.status as ProjectStatus;

  return (
    <div className="flex flex-col gap-6">
      {/* Title + status */}
      <ProjectHeader
        projectId={project.id}
        title={project.title}
        status={status}
        updated_at={project.updated_at}
        created_at={project.created_at}
      />

      {/* Description */}
      <ProjectDescriptionEditor
        id={project.id}
        initialMetadata={project.metadata as Record<string, unknown> | null}
      />

      <FilePreviewExtractor
        projectId={project.id}
        initialMetadata={project.metadata as Record<string, unknown> | null}
      />

      <ExamVariantsGenerator
        projectId={project.id}
        initialMetadata={project.metadata as Record<string, unknown> | null}
      />

      {/* Danger zone */}
      <div className="flex justify-end pt-4 border-t">
        <DeleteProjectButton id={project.id} />
      </div>
    </div>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("Projects");
  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="text-sm text-foreground/50 flex items-center gap-2">
        <Link
          href="/projects"
          className="hover:text-foreground transition-colors"
        >
          {t("title")}
        </Link>
        <span className="text-foreground/30">/</span>
        <span className="text-foreground/40">{t("detail")}</span>
      </nav>

      <Suspense>
        <AsyncProjectDetail paramsPromise={params} />
      </Suspense>
    </div>
  );
}

async function AsyncProjectDetail({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  return <ProjectDetail id={id} />;
}
