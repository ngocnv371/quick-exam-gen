"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function NewProjectForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Projects");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("projects")
        .insert({ title: title.trim(), user_id: userId, type: "exam" })
        .select("id")
        .single();

      if (error) throw error;

      router.push(`/projects/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("new.title")}</CardTitle>
          <CardDescription>{t("new.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">{t("new.projectName")}</Label>
              <Input
                id="title"
                placeholder={t("new.placeholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button asChild variant="outline" disabled={isLoading}>
                <Link href="/projects">{t("new.cancel")}</Link>
              </Button>
              <Button type="submit" disabled={isLoading || !title.trim()}>
                {isLoading ? t("new.creating") : t("new.create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
