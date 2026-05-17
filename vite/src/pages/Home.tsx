import { Link } from 'react-router-dom'

const statCards = [
  { value: '1 source', label: 'original exam blueprint' },
  { value: 'N variants', label: 'parallel versions per assessment' },
  { value: 'Stable intent', label: 'skills and outcomes remain aligned' },
]

const integrityPoints = [
  'Preserves the original question purpose before rewriting wording',
  'Maintains consistent skill coverage across all generated forms',
  'Supports side-by-side review before publishing to students',
]

const workflowCards = [
  {
    title: 'Upload and Analyze',
    body: 'Start from PDF, DOCX, or plain text and let the app identify structure and intent.',
    surface: 'bg-block-cream',
  },
  {
    title: 'Generate Variants',
    body: 'Produce multiple reworded versions tuned for fairness and equivalent difficulty.',
    surface: 'bg-block-lilac',
  },
  {
    title: 'Review with Confidence',
    body: 'Check each version, compare wording changes, and export the final set.',
    surface: 'bg-block-mint',
  },
]

export default function Home() {
  return (
    <main className="w-full max-w-7xl mx-auto px-md sm:px-lg pb-section space-y-xl sm:space-y-xxl">
      <section className="home-reveal relative overflow-hidden mt-lg sm:mt-xl rounded-xl border border-hairline bg-canvas px-lg py-xxl sm:px-xxl sm:py-section">
        <div className="home-shape hidden sm:block absolute -top-20 -right-16 w-64 h-64 rounded-full bg-block-pink/65" />
        <div className="home-shape hidden sm:block absolute bottom-8 -left-12 w-40 h-40 rounded-[28px] bg-block-cream/80" />

        <div className="relative z-10 flex flex-col gap-lg items-start">
          <p className="text-eyebrow uppercase text-ink tracking-wide">Quick Exam Gen</p>
          <h1 className="text-[42px] leading-[0.98] tracking-[-1px] sm:text-display-lg font-light text-ink max-w-5xl">
            Create multiple exam variants in minutes, while keeping the same assessment intent.
          </h1>
          <p className="text-body-lg sm:text-subhead font-light text-ink max-w-3xl">
            Designed for teachers who need fresh question versions without changing what is being
            assessed. Generate safe rephrasings that preserve outcomes, difficulty, and rubric
            alignment.
          </p>
        </div>

        <div className="relative z-10 flex gap-md flex-wrap mt-lg">
          <Link
            to="/projects"
            className="px-lg py-xs bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 transition-opacity inline-block"
          >
            Start a Project
          </Link>
          <Link
            to="/about"
            className="px-lg py-xs bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-surface-soft transition-colors inline-block"
          >
            How It Works
          </Link>
        </div>
      </section>

      <section className="home-reveal home-reveal-delay-2 relative overflow-hidden py-xxl px-lg sm:px-xxl bg-block-lime rounded-lg">
        <div className="home-shape absolute -top-14 -left-10 w-40 h-40 rounded-full bg-canvas/45" />
        <div className="home-shape absolute -bottom-16 right-8 w-56 h-56 rounded-[30px] bg-block-cream/65" />

        <div className="relative z-10 max-w-5xl">
          <h2 className="text-headline font-semibold text-ink mb-md">
            Keep what matters, vary what students see.
          </h2>
          <p className="text-body font-light text-ink mb-lg sm:mb-xl max-w-4xl">
            Quick Exam Gen rephrases prompts and answer options while preserving the exact skills
            you are measuring. Build fair variants for different classes, sessions, or retakes
            without rewriting from scratch.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-md sm:gap-lg">
          {statCards.map((stat, index) => (
            <article
              key={`lime-${stat.value}`}
              className={`home-reveal home-reveal-delay-${index + 1} rounded-md bg-canvas/70 border border-ink/10 px-md py-lg text-center`}
            >
              <p className="text-3xl sm:text-4xl font-bold text-ink">{stat.value}</p>
              <p className="text-body-sm text-ink/80 mt-xs">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-reveal home-reveal-delay-3 relative py-xxl px-lg sm:px-xxl bg-block-navy rounded-lg text-inverse-ink overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.22),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(255,61,139,0.16),transparent_30%)]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-xl items-start">
          <div>
            <h2 className="text-headline font-semibold mb-md">Built for assessment integrity.</h2>
            <p className="text-body font-light mb-lg max-w-3xl">
              Each generated variant is designed to remain equivalent in learning objective,
              cognitive demand, and expected evidence of mastery.
            </p>
            <ul className="space-y-md text-body">
              {integrityPoints.map((item) => (
                <li key={item} className="flex items-start gap-sm">
                  <span className="mt-[10px] w-2 h-2 rounded-full bg-block-lime shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="grid grid-cols-1 gap-md">
            <article className="rounded-md border border-white/25 bg-white/10 p-md">
              <p className="text-caption uppercase tracking-[0.6px] text-inverse-ink/85">Validation Layer</p>
              <p className="text-body-sm mt-xs">Checks each draft against learning targets before finalizing.</p>
            </article>
            <article className="rounded-md border border-white/25 bg-white/10 p-md">
              <p className="text-caption uppercase tracking-[0.6px] text-inverse-ink/85">Coverage Guardrail</p>
              <p className="text-body-sm mt-xs">Keeps topic balance steady across generated versions.</p>
            </article>
            <article className="rounded-md border border-white/25 bg-white/10 p-md">
              <p className="text-caption uppercase tracking-[0.6px] text-inverse-ink/85">Review Ready</p>
              <p className="text-body-sm mt-xs">Makes side-by-side edits easy before students ever see it.</p>
            </article>
          </aside>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-lg py-sm">
        {workflowCards.map((card, index) => (
          <article
            key={card.title}
            className={`home-reveal home-reveal-delay-${index + 1} relative overflow-hidden p-lg rounded-lg border border-hairline ${card.surface} ${index === 1 ? 'sm:-translate-y-4' : ''}`}
          >
            <p className="text-caption uppercase text-ink/70 tracking-[0.6px] mb-sm">Step 0{index + 1}</p>
            <h3 className="text-card-title font-bold text-ink mb-sm">{card.title}</h3>
            <p className="text-body-sm text-ink/80">{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
