import { AuthButton } from "@/components/auth-button";
import { CoinsBadge } from "@/components/coins-badge";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense } from "react";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Menu");
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Subtle grid bg */}
      <div
        className="fixed inset-0 pointer-events-none grid-bg opacity-40"
        aria-hidden="true"
      />
      {/* Ambient glow */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, hsl(190 100% 50% / 0.04) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Nav */}
      <nav className="sticky top-0 z-30 w-full flex justify-center border-b border-primary/20 h-14 backdrop-blur-md bg-background/70">
        <div className="w-full max-w-5xl flex justify-between items-center px-5 text-sm">
          <div className="flex gap-6 items-center">
            <Link
              href="/"
              className="font-bold tracking-[0.2em] uppercase text-primary text-xs"
              style={{ fontFamily: "var(--font-orbitron, inherit)" }}
            >
              {t("title")}
            </Link>
            <Link
              href="/projects"
              className="text-foreground/50 hover:text-primary transition-colors tracking-wide text-xs uppercase"
            >
              {t("projects")}
            </Link>
            <Link
              href="/billing"
              className="text-foreground/50 hover:text-primary transition-colors tracking-wide text-xs uppercase"
            >
              {t("billing")}
            </Link>
            <Link
              href="/admin/orders"
              className="text-foreground/50 hover:text-primary transition-colors tracking-wide text-xs uppercase"
            >
              {t("admin")}
            </Link>
            <LocaleSwitcher />
          </div>
          <div className="flex items-center gap-3">
            <Suspense>
              <CoinsBadge />
            </Suspense>
            <ThemeSwitcher />
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
