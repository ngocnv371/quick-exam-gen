import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE, type ProjectStatus } from "../_lib/constants";

interface ProjectListItemProps {
  project: {
    id: string;
    title: string;
    status: string;
    updated_at: string;
  };
}

export function ProjectListItem({ project }: ProjectListItemProps) {
  return (
    <Link
      key={project.id}
      href={`/projects/${project.id}`}
      className="group flex items-center justify-between px-4 py-3.5 hover:bg-primary/5 hover:border-l-2 hover:border-l-primary transition-all duration-150"
    >
      <span className="font-medium truncate group-hover:text-primary transition-colors">
        {project.title}
      </span>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <Badge
          variant={STATUS_BADGE[project.status as ProjectStatus] ?? "secondary"}
        >
          {project.status}
        </Badge>
        <span className="text-xs text-foreground/40 tabular-nums">
          {new Date(project.updated_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
