import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/">Quick Exam Gen</Link>
              <Link href="/projects" className="text-foreground/70 hover:text-foreground">
                Projects
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-5xl p-5">
          <h1 className="text-4xl font-bold">Quick Exam Gen</h1>
          <p className="text-foreground/70 text-center max-w-md">
            Create and manage your exam projects with ease.
          </p>
          <Button asChild size="lg">
            <Link href="/projects/new">Create New Project</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
