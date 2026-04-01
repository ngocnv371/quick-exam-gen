import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { QuickUploadHero } from "@/components/quick-upload-hero";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* Ambient background blobs */}
      <div
        className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-30 dark:opacity-20 blur-3xl"
        style={{ background: "hsl(250 70% 60%)" }}
        aria-hidden="true"
      />
      <div
        className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 dark:opacity-15 blur-3xl"
        style={{ background: "hsl(200 60% 56%)" }}
        aria-hidden="true"
      />

      <div className="flex-1 w-full flex flex-col gap-20 items-center relative z-10">
        {/* Nav */}
        <nav className="w-full flex justify-center glass-nav h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-6 items-center font-semibold">
              <Link href="/" className="text-foreground">Quick Exam Gen</Link>
              <Link href="/projects" className="text-foreground/50 hover:text-foreground transition-colors text-sm font-normal">
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

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-2xl p-5 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Quick Exam Gen
          </h1>
          <p className="text-foreground/50 text-base max-w-md leading-relaxed">
            Create and manage your exam projects with ease.
          </p>
          <QuickUploadHero />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="sm" variant="ghost" className="text-foreground/50">
              <Link href="/projects/new">Create project manually</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-foreground/50">
              <Link href="/projects">View projects</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
