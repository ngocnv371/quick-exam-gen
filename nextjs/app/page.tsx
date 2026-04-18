import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { QuickUploadHero } from "@/components/quick-upload-hero";
import Link from "next/link";
import { Suspense } from "react";
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

const CURRENT_YEAR = new Date().getFullYear();

const USE_CASES = [
  {
    icon: GraduationCap,
    title: "Teachers & Educators",
    description:
      "Turn your lecture notes or textbook chapters into polished, ready-to-print exams in seconds. Stop spending evenings writing questions by hand.",
  },
  {
    icon: Building2,
    title: "Schools & Institutions",
    description:
      "Standardize exam quality across departments. Generate multiple variants of the same test to prevent cheating without extra effort.",
  },
  {
    icon: FlaskConical,
    title: "Tutoring Centers",
    description:
      "Create personalized practice sets for every student from a single source document. More practice, less prep time.",
  },
  {
    icon: BookOpen,
    title: "Self-Learners",
    description:
      "Upload your study material and instantly get quiz questions to test yourself. Active recall made effortless.",
  },
  {
    icon: Layers,
    title: "Corporate Trainers",
    description:
      "Convert training manuals and SOPs into assessment quizzes. Verify employee knowledge without hiring a content team.",
  },
  {
    icon: Zap,
    title: "Hackathon & Event Hosts",
    description:
      "Need a trivia round or knowledge check in 5 minutes? Drop in any document and get a full question set instantly.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nguyen Thi Lan",
    role: "High School Biology Teacher",
    avatar: "NL",
    quote:
      "I used to spend 3–4 hours writing each exam. Now I upload my chapter notes and have a full question bank in under a minute. The quality genuinely surprised me.",
    stars: 5,
  },
  {
    name: "Marcus Webb",
    role: "Corporate L&D Manager",
    avatar: "MW",
    quote:
      "We rolled out 12 compliance quizzes last quarter using Quick Exam Gen. Our team saved roughly 40 hours of content work. I don't know why we didn't find this sooner.",
    stars: 5,
  },
  {
    name: "Dr. Priya Sharma",
    role: "University Lecturer, Computer Science",
    avatar: "PS",
    quote:
      "Generating exam variants is a game-changer for large cohorts. Each student gets a slightly different paper but the same learning objectives. Zero extra effort on my end.",
    stars: 5,
  },
  {
    name: "Tomás Reyes",
    role: "Founder, TutorHive",
    avatar: "TR",
    quote:
      "Our tutors use it daily to build practice sets for students. The drag-and-drop upload is fast, the questions are accurate, and the export is clean. Solid product.",
    stars: 5,
  },
  {
    name: "Aiko Tanaka",
    role: "Competitive Exam Coach",
    avatar: "AT",
    quote:
      "I coach students for national entrance exams. Being able to generate hundreds of practice questions from past papers in minutes is absolutely invaluable.",
    stars: 5,
  },
  {
    name: "Emily Chen",
    role: "Self-Learner & Med Student",
    avatar: "EC",
    quote:
      "I upload my lecture slides and get a self-quiz instantly. It helped me actually retain information instead of just re-reading the same slides over and over.",
    stars: 5,
  },
];

export default function Home() {
  const t = useTranslations('HomePage');
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
            AI-powered exam generation
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
            Turn any document into{" "}
            <span className="text-primary">exam-ready questions</span>
          </h1>
          <p className="text-foreground/55 text-lg max-w-lg leading-relaxed">
            Upload a PDF or Word file, let AI extract the key concepts, and get
            a full question bank with multiple variants — in under 60 seconds.
          </p>
          <QuickUploadHero />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="sm" variant="ghost" className="text-foreground/50">
              <Link href="/projects/new">Create project manually</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-foreground/50">
              <Link href="/projects">View all projects</Link>
            </Button>
          </div>
          {/* Social proof strip */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-foreground/40">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 2,400+ educators</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> 4.9 average rating</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Avg. 47 seconds per exam</span>
          </div>
        </section>

        {/* Use-cases */}
        <section className="w-full max-w-5xl px-5 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Who uses Quick Exam Gen?</h2>
            <p className="mt-3 text-foreground/50 max-w-md mx-auto">
              Whether you teach a class of 30 or train a team of 3,000, we&apos;ve got you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" size={18} />
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
            <h2 className="text-3xl font-bold tracking-tight mb-12">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Upload your document", body: "Drag-and-drop a PDF or Word file — lecture notes, textbooks, training manuals, anything." },
                { step: "02", title: "AI extracts the knowledge", body: "Our AI reads the content, identifies key concepts, and generates high-quality questions automatically." },
                { step: "03", title: "Export & share instantly", body: "Download a print-ready exam with multiple variants, or share a link with your students right away." },
              ].map(({ step, title, body }) => (
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
            <h2 className="text-3xl font-bold tracking-tight">Loved by educators worldwide</h2>
            <p className="mt-3 text-foreground/50 max-w-md mx-auto">
              Thousands of teachers, trainers, and learners save hours every week with Quick Exam Gen.
            </p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {TESTIMONIALS.map(({ name, role, avatar, quote, stars }) => (
              <div
                key={name}
                className="break-inside-avoid rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
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
            Ready to save hours every week?
          </h2>
          <p className="text-foreground/50 max-w-md leading-relaxed">
            Join thousands of educators who&apos;ve ditched manual exam writing.
            Your first exam is free — no credit card required.
          </p>
          <Button asChild size="lg" className="px-8 font-semibold">
            <Link href="/auth/sign-up">Get started for free</Link>
          </Button>
          <p className="text-xs text-foreground/35">No credit card required · Cancel anytime</p>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-border py-8">
          <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/35">
            <span>© {CURRENT_YEAR} Quick Exam Gen. All rights reserved.</span>
            <div className="flex gap-5">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Log in</Link>
              <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Sign up</Link>
              <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
