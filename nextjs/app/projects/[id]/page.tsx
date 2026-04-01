import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ProjectTitleEditor, DeleteProjectButton, ProjectStatusEditor, ProjectDescriptionEditor } from "./_components/project-actions";
import { FilePreviewExtractor } from "./_components/file-preview-extractor";
import { STATUS_BADGE, type ProjectStatus } from "@/app/projects/_lib/constants";

async function ProjectDetail({ id }: { id: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, status, metadata, created_at, updated_at")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const status = project.status as ProjectStatus;

  return (
    <div className="flex flex-col gap-6">
      {/* Title + status */}
      <div className="flex flex-col gap-2">
        <ProjectTitleEditor id={project.id} initialTitle={project.title} />
        <div className="flex items-center gap-3 flex-wrap">
          <ProjectStatusEditor id={project.id} initialStatus={status} />
          <Badge variant={STATUS_BADGE[status] ?? "secondary"}>{status}</Badge>
          <span className="text-xs text-foreground/50">
            Updated {new Date(project.updated_at).toLocaleString()}
          </span>
          <span className="text-xs text-foreground/50">
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Description */}
      <ProjectDescriptionEditor
        id={project.id}
        initialMetadata={project.metadata as Record<string, unknown> | null}
      />

      <FilePreviewExtractor />

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
  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="text-sm text-foreground/50 flex items-center gap-2">
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span className="text-foreground/30">/</span>
        <span className="text-foreground/40">Detail</span>
      </nav>

      <Suspense fallback={<div className="text-sm text-foreground/50">Loading…</div>}>
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
