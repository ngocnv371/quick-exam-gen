import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { QuickUploadHero } from "@/components/quick-upload-hero";
import Link from "next/link";
import { Suspense, use } from "react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Zap,
  Star,
  Users,
  Building2,
  FlaskConical,
} from "lucide-react";
import {useTranslations} from 'next-intl';
import { setRequestLocale } from "next-intl/server";

const CURRENT_YEAR = new Date().getFullYear();

function IconFactory({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ElementType> = {
    "book-open": BookOpen,
    "graduation-cap": GraduationCap,
    "layers": Layers,
    "zap": Zap,
    "star": Star,
    "users": Users,
    "building-2": Building2,
    "flask-conical": FlaskConical,
  };

  const IconComponent = icons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found. Please check the icon name.`);
    return null;
  }

  return <IconComponent className={className} size={18} />;
}

export default function Home({params}: PageProps<'/[locale]'>) {
  const {locale} = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations('HomePage');
  const useCases: Record<string, string>[] = t.raw('useCases');
  const testimonials: Record<string, string>[] = t.raw('testimonials');
  const howItWorks: Record<string, string>[] = t.raw('howItWorks');
  
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

      <div className="w-full flex flex-col items-center relative z-10">
        {/* Nav */}
        <nav className="w-full flex justify-center glass-nav h-16 sticky top-0 z-50">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-6 items-center font-semibold">
              <Link href="/" className="text-foreground">{t('title')}</Link>
              <Link href="/projects" className="text-foreground/50 hover:text-foreground transition-colors text-sm font-normal">
                {t('projects')}
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
        <section className="w-full flex flex-col items-center justify-center gap-6 max-w-2xl px-5 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            {t('aiHero')}
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
            {t('heroTitle')}
          </h1>
          <p className="text-foreground/55 text-lg max-w-lg leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <QuickUploadHero />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="sm" variant="ghost" className="text-foreground/50">
              <Link href="/projects/new">{t('createProject')}</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-foreground/50">
              <Link href="/projects">{t('viewProjects')}</Link>
            </Button>
          </div>
          {/* Social proof strip */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-foreground/40">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t('socialEducators')}</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {t('socialRating')}</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {t('socialSpeed')}</span>
          </div>
        </section>

        {/* Use-cases */}
        <section className="w-full max-w-5xl px-5 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{t('useCasesTitle')}</h2>
            <p className="mt-3 text-foreground/50 max-w-md mx-auto">
              {t('useCasesSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  {
                    IconFactory({ name: icon, className: "h-4.5 w-4.5 text-primary" })
                  }
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="w-full bg-muted/40 border-y border-border py-20">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-12">{t('howItWorksTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {howItWorks.map(({ step, title, body }) => (
                <div key={step} className="flex flex-col items-center gap-3 text-center">
                  <div className="text-4xl font-black text-primary/20 leading-none">{step}</div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-foreground/50 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full max-w-5xl px-5 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{t('testimonialsTitle')}</h2>
            <p className="mt-3 text-foreground/50 max-w-md mx-auto">
              {t('testimonialsSubtitle')}
            </p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map(({ name, role, avatar, quote, stars }) => (
              <div
                key={name}
                className="break-inside-avoid rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: +stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{name}</div>
                    <div className="text-xs text-foreground/45">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-3xl px-5 pb-24 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t('finalCtaTitle')}
          </h2>
          <p className="text-foreground/50 max-w-md leading-relaxed">
            {t('finalCtaSubtitle')}
          </p>
          <Button asChild size="lg" className="px-8 font-semibold">
            <Link href="/auth/sign-up">{t('getStarted')}</Link>
          </Button>
          <p className="text-xs text-foreground/35">{t('noCreditCard')}</p>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-border py-8">
          <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/35">
            <span>{t('footerCopyright', { year: CURRENT_YEAR })}</span>
            <div className="flex gap-5">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">{t('footerLogin')}</Link>
              <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">{t('footerSignup')}</Link>
              <Link href="/projects" className="hover:text-foreground transition-colors">{t('footerProjects')}</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
