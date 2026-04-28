import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ProjectsPaginationProps {
  page: number;
  totalPages: number;
  status: string | null;
  buildUrl: (params: Record<string, string | undefined>) => string;
}

export function ProjectsPagination({
  page,
  totalPages,
  status,
  buildUrl,
}: ProjectsPaginationProps) {
  const t = useTranslations("Common");
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <Button asChild variant="outline" size="sm" disabled={page <= 1}>
        <Link
          href={buildUrl({
            page: String(page - 1),
            status: status ?? undefined,
          })}
        >
          {t("previous")}
        </Link>
      </Button>
      <span className="text-sm text-foreground/60">
        {t("pageInfo", { page, totalPages })}
      </span>
      <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
        <Link
          href={buildUrl({
            page: String(page + 1),
            status: status ?? undefined,
          })}
        >
          {t("next")}
        </Link>
      </Button>
    </div>
  );
}
