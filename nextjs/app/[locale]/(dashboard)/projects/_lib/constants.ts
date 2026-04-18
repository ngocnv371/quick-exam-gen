import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

export const VALID_STATUSES = ["draft", "extracting", "ready", "generating", "done"] as const;
export type ProjectStatus = (typeof VALID_STATUSES)[number];

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const STATUS_BADGE: Record<ProjectStatus, BadgeVariant> = {
  draft: "secondary",
  extracting: "outline",
  ready: "default",
  generating: "outline",
  done: "default",
};

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "extracting", label: "Extracting" },
  { value: "ready", label: "Ready" },
  { value: "generating", label: "Generating" },
  { value: "done", label: "Done" },
];
