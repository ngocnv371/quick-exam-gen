import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "./_components/new-project-form";
import { Suspense } from "react";

async function ProjectDetail()
{
const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return <NewProjectForm userId={user.id} />;
}

export default async function NewProjectPage() {
  return <Suspense>
    <ProjectDetail />
  </Suspense>
}
