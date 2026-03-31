import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import { ProjectTitleEditor, DeleteProjectButton } from "./_components/project-actions";

type ProjectStatus = "draft" | "extracting" | "ready" | "generating" | "done";
type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const STATUS_BADGE: Record<ProjectStatus, BadgeVariant> = {
  draft: "secondary",
  extracting: "outline",
  ready: "default",
  generating: "outline",
  done: "default",
};

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
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_BADGE[status]}>{status}</Badge>
          <span className="text-xs text-foreground/50">
            Updated {new Date(project.updated_at).toLocaleString()}
          </span>
          <span className="text-xs text-foreground/50">
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Placeholder content area */}
      <div className="border rounded-lg p-6 text-foreground/50 text-sm min-h-40 flex items-center justify-center">
        Project content will go here.
      </div>

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
      <nav className="text-sm text-foreground/60">
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span>Detail</span>
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
