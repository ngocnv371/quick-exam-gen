"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectStatus, VALID_STATUSES } from "../../_lib/constants";
import { useTranslations } from "next-intl";

export function ProjectTitleEditor({
  id,
  initialTitle,
}: {
  id: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  async function save() {
    if (!title.trim() || title.trim() === initialTitle) {
      setTitle(initialTitle);
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("projects")
      .update({ title: title.trim() })
      .eq("id", id);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      toast.error(t("Error.failedToSave"), { description: dbError.message });
      return;
    }
    setEditing(false);
    toast.success(t("Common.saved"));
    router.refresh();
  }

  if (!editing) {
    return (
      <button
          className="text-2xl font-bold text-left hover:text-foreground/70 transition-colors"
        onClick={() => setEditing(true)}
      >
        {title}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          disabled={saving}
          className="text-xl font-bold h-9"
        />
        <Button type="submit" size="sm" disabled={saving || !title.trim()}>
          {t("Common.save")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={() => {
            setTitle(initialTitle);
            setEditing(false);
            setError(null);
          }}
        >
          {t("Common.cancel")}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ProjectStatusEditor({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: ProjectStatus;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  async function handleChange(value: string) {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("projects")
      .update({ status: value })
      .eq("id", id);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      toast.error(t("Error.failedToSave"), { description: dbError.message });
      return;
    }
    toast.success(t("Common.saved"));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <Select defaultValue={initialStatus} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VALID_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`Projects.status.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ProjectDescriptionEditor({
  id,
  initialMetadata,
}: {
  id: string;
  initialMetadata: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const initialDescription =
    typeof initialMetadata?.description === "string" ? initialMetadata.description : "";
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("projects")
      .update({ metadata: { ...(initialMetadata ?? {}), description: description.trim() } })
      .eq("id", id);
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      toast.error(t("Error.failedToSave"), { description: dbError.message });
      return;
    }
    setSaved(true);
    toast.success(t("Common.saved"));
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{t("Projects.description")}</label>
      <Textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setSaved(false);
        }}
        placeholder={t("Projects.addDescription")}
        disabled={saving}
        rows={4}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={save}
          disabled={saving || description.trim() === initialDescription.trim()}
        >
          {saving ? t("Common.saving") : t("Projects.saveDescription")}
        </Button>
        {saved && <span className="text-xs text-foreground/50">{t("Common.saved")}</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("projects").delete().eq("id", id);
    if (dbError) {
      setError(dbError.message);
      setDeleting(false);
      return;
    }
    router.push("/projects");
  }

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        {t("Common.delete")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/70">{t("Common.areYouSure")}</span>
        <Button variant="destructive" size="sm" disabled={deleting} onClick={handleDelete}>
          {deleting ? t("Common.deleting") : t("Common.yesDelete")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={deleting}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          {t("Common.cancel")}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
