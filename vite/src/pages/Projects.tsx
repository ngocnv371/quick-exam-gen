import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProject,
  getProjects,
  type ProjectStatus,
} from "../lib/supabase";
import { UserContext } from "../context/UserContext";

type ProjectRow = {
  id: string;
  title: string;
  status: Exclude<ProjectStatus, "all">;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS: Array<{ label: string; value: ProjectStatus }> = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Ready", value: "ready" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived" },
];

const STATUS_BADGE_STYLES: Record<Exclude<ProjectStatus, "all">, string> = {
  draft: "bg-surface-soft text-ink border border-hairline",
  pending: "bg-block-cream text-ink border border-hairline",
  ready: "bg-block-lime text-ink border border-ink/10",
  processing: "bg-block-lilac text-ink border border-ink/10",
  failed: "bg-block-pink text-ink border border-ink/10",
  done: "bg-block-mint text-ink border border-ink/10",
  archived: "bg-ink/10 text-ink border border-hairline",
};

export default function Projects() {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProjectStatus>("all");
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const query = getProjects(nameFilter, status, from, to);

    const { data, count, error: fetchError } = await query;

    if (fetchError) {
      setRows([]);
      setTotal(0);
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as ProjectRow[]);
    setTotal(count ?? 0);
    setError(null);
    setLoading(false);
  }, [nameFilter, page, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProjects();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProjects]);

  const pageLabel = useMemo(() => {
    if (total === 0) return "Page 1 of 1";
    return `Page ${page} of ${totalPages}`;
  }, [page, total, totalPages]);

  const handleStartNewProject = async () => {
    if (!user?.id) {
      setError("You need to be signed in to create a project.");
      return;
    }

    setIsCreating(true);

    const { data, error: createError } = await createProject(user.id);

    if (createError) {
      setError(`Could not create project: ${createError.message}`);
      setIsCreating(false);
      return;
    }

    setIsCreating(false);
    navigate(`/projects/${data.id}`);
  };

  const formatDate = (value: string) => dateFormatter.format(new Date(value));

  return (
    <main className="w-full max-w-7xl mt-2 mx-auto px-md sm:px-lg pb-section">
      <section className="relative overflow-hidden py-xxl sm:py-6 px-lg sm:px-xxl bg-block-coral rounded-lg">
        <div
          className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-canvas/45"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-10 w-72 h-72 rounded-[36px] bg-block-cream/70 rotate-6"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mb-xl">
          <p className="text-caption uppercase tracking-[0.6px] text-ink/70 mb-sm">
            Workspace
          </p>
          <h1 className="text-headline sm:text-subhead font-semibold text-ink mb-md">
            Projects
          </h1>
          <p className="text-body font-light text-ink max-w-3xl">
            Filter by status, search by name, and jump directly into any project
            workspace.
          </p>
        </div>

        <div className="relative z-10 flex gap-md flex-wrap items-center mb-lg sm:mb-xl">
          <button
            className="px-lg py-xs bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-70 transition-opacity"
            type="button"
            onClick={() => {
              void handleStartNewProject();
            }}
            disabled={isCreating}
          >
            {isCreating ? "Starting project..." : "Start new project"}
          </button>

          <p className="px-md py-xs rounded-pill border border-ink/15 bg-canvas/70 text-body-sm text-ink/80">
            {total} {total === 1 ? "project" : "projects"}
          </p>
        </div>

        <div className="relative z-10 rounded-lg border border-ink/10 bg-canvas/75 backdrop-blur-sm p-md sm:p-lg mb-lg sm:mb-xl">
          <div
            className="grid grid-cols-1 sm:grid-cols-[minmax(240px,1fr)_220px] gap-md sm:gap-lg"
            role="search"
            aria-label="Project filters"
          >
            <label
              className="flex flex-col gap-xs"
              htmlFor="projects-name-filter"
            >
              <span className="text-body-sm font-medium text-ink">Name</span>
              <input
                id="projects-name-filter"
                className="px-md py-sm rounded-md border border-hairline bg-canvas text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-primary"
                value={nameFilter}
                onChange={(event) => {
                  setLoading(true);
                  setPage(1);
                  setNameFilter(event.target.value);
                }}
                placeholder="Search project name"
                type="search"
              />
            </label>

            <label
              className="flex flex-col gap-xs"
              htmlFor="projects-status-filter"
            >
              <span className="text-body-sm font-medium text-ink">Status</span>
              <select
                id="projects-status-filter"
                className="px-md py-sm rounded-md border border-hairline bg-canvas text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                value={status}
                onChange={(event) => {
                  setLoading(true);
                  setPage(1);
                  setStatus(event.target.value as ProjectStatus);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <p
            className="relative z-10 py-md px-lg rounded-md border border-red-200 bg-red-50 text-red-700 mb-lg"
            role="alert"
          >
            Could not load projects: {error}
          </p>
        ) : null}

        {loading ? (
          <p className="relative z-10 text-body-sm text-ink/65 mb-lg">
            Loading projects...
          </p>
        ) : null}

        {!loading && rows.length === 0 ? (
          <p className="relative z-10 text-body-sm text-ink/65 mb-lg">
            No projects match the current filters.
          </p>
        ) : null}

        {!loading && rows.length > 0 ? (
          <div className="relative z-10 rounded-lg border border-ink/10 bg-canvas overflow-hidden mb-lg sm:mb-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm border-collapse">
                <thead className="bg-canvas">
                  <tr className="border-b border-hairline">
                    <th
                      scope="col"
                      className="text-left py-md px-lg font-semibold text-ink"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="text-left py-md px-lg font-semibold text-ink"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-left py-md px-lg font-semibold text-ink"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="text-left py-md px-lg font-semibold text-ink"
                    >
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-hairline last:border-0 hover:bg-surface-soft/80 cursor-pointer transition-colors focus-within:bg-surface-soft/80"
                      tabIndex={0}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/projects/${project.id}`);
                        }
                      }}
                    >
                      <td className="py-md px-lg text-ink font-medium">
                        {project.title}
                      </td>
                      <td className="py-md px-lg">
                        <span
                          className={`inline-block px-sm py-xxs rounded-pill text-caption uppercase ${STATUS_BADGE_STYLES[project.status]}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-md px-lg text-ink/80">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="py-md px-lg text-ink/80">
                        {formatDate(project.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-md pt-lg border-t border-ink/15">
          <span className="text-caption uppercase text-ink/65">
            {pageLabel}
          </span>
          <div className="flex gap-sm sm:gap-md">
            <button
              className="px-lg py-xs bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft disabled:opacity-50 transition-colors"
              type="button"
              onClick={() => {
                setLoading(true);
                setPage((current) => Math.max(1, current - 1));
              }}
              disabled={loading || page <= 1}
            >
              Previous
            </button>
            <button
              className="px-lg py-xs bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft disabled:opacity-50 transition-colors"
              type="button"
              onClick={() => {
                setLoading(true);
                setPage((current) => Math.min(totalPages, current + 1));
              }}
              disabled={loading || page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
