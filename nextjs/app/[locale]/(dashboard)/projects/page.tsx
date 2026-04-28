import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ProjectsFilter } from "./_components/projects-filter";
import { Suspense } from "react";
import { VALID_STATUSES, type ProjectStatus } from "./_lib/constants";
import { ProjectListItem } from "./_components/project-list-item";
import { ProjectsPagination } from "./_components/projects-pagination";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 10;

import { buildUrl } from "./_lib/build-url";

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
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectsPagination page={page} totalPages={totalPages} status={status} buildUrl={buildUrl} />
    </>
  );
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const t = useTranslations("Projects");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex flex-col gap-6 p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/projects/new">{t("createProject")}</Link>
        </Button>
      </div>

      <Suspense fallback={null}>
        <ProjectsFilterWrapper searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<p className="text-foreground/60 text-sm">{tCommon("loading")}</p>}>
        <ProjectsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
