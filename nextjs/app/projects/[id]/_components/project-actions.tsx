"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectTitleEditor({
  id,
  initialTitle,
}: {
  id: string;
  initialTitle: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim() || title.trim() === initialTitle) {
      setTitle(initialTitle);
      setEditing(false);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    await supabase.from("projects").update({ title: title.trim() }).eq("id", id);
    setSaving(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        className="text-2xl font-bold text-left hover:underline decoration-dotted"
        onClick={() => setEditing(true)}
      >
        {title}
      </button>
    );
  }

  return (
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
        Save
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={saving}
        onClick={() => {
          setTitle(initialTitle);
          setEditing(false);
        }}
      >
        Cancel
      </Button>
    </form>
  );
}

export function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    router.push("/projects");
  }

  if (!confirming) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
        Delete Project
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-foreground/70">Are you sure?</span>
      <Button variant="destructive" size="sm" disabled={deleting} onClick={handleDelete}>
        {deleting ? "Deleting..." : "Yes, delete"}
      </Button>
      <Button variant="outline" size="sm" disabled={deleting} onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
