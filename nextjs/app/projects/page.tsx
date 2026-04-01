import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { ProjectsFilter } from "./_components/projects-filter";
import { Suspense } from "react";
import { VALID_STATUSES, STATUS_BADGE, type ProjectStatus } from "./_lib/constants";

const PAGE_SIZE = 10;

function buildUrl(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v);
  }
  const qs = p.toString();
  return `/projects${qs ? `?${qs}` : ""}`;
}

async function ProjectsFilterWrapper({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const currentStatus = VALID_STATUSES.includes(statusParam as ProjectStatus)
    ? statusParam!
    : "all";
  return <ProjectsFilter currentStatus={currentStatus} />;
}

async function ProjectsList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status: statusParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const status =
    VALID_STATUSES.includes(statusParam as ProjectStatus)
      ? (statusParam as ProjectStatus)
      : null;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("projects")
    .select("id, title, status, created_at, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .eq('type', 'exam')
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data: projects, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <>
      {!projects || projects.length === 0 ? (
        <p className="text-foreground/60 text-sm">No projects found.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border/40 border border-border/50 rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex items-center justify-between px-4 py-3.5 hover:bg-primary/5 hover:border-l-2 hover:border-l-primary transition-all duration-150"
            >
              <span className="font-medium truncate group-hover:text-primary transition-colors">{project.title}</span>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Badge variant={STATUS_BADGE[project.status as ProjectStatus] ?? "secondary"}>
                  {project.status}
                </Badge>
                <span className="text-xs text-foreground/40 tabular-nums">
                  {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link href={buildUrl({ page: String(page - 1), status: status ?? undefined })}>
              Previous
            </Link>
          </Button>
          <span className="text-sm text-foreground/60">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link href={buildUrl({ page: String(page + 1), status: status ?? undefined })}>
              Next
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button asChild>
          <Link href="/projects/new">New Project</Link>
        </Button>
      </div>

      <Suspense fallback={null}>
        <ProjectsFilterWrapper searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<p className="text-foreground/60 text-sm">Loading...</p>}>
        <ProjectsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
