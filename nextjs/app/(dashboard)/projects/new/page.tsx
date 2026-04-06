import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "./_components/new-project-form";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return <NewProjectForm userId={user.id} />;
}
