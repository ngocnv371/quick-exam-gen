export default function About() {
  return (
    <main className="w-full max-w-7xl mx-auto">
      <section className="flex flex-col items-center justify-center gap-lg py-section px-lg bg-canvas">
        <p className="text-eyebrow uppercase text-ink tracking-wide">About</p>
        <h1 className="text-display-lg font-light text-ink text-center max-w-5xl">
          We help teachers create equivalent exam variants, not random rewrites.
        </h1>
        <p className="text-subhead font-light text-ink text-center max-w-2xl">
          Quick Exam Gen uses LLM-assisted rewriting to generate fresh question versions while
          preserving the same learning outcomes, assessment skills, and intended level of challenge.
        </p>
      </section>

      <section className="py-section px-lg bg-block-lilac rounded-lg mx-lg">
        <h2 className="text-headline font-semibold text-ink mb-md">Our principle: variation without drift.</h2>
        <p className="text-body font-light text-ink mb-md">
          A good exam variant should read differently but measure the same thing. The platform is
          designed to protect the original purpose of each question before generating alternatives.
        </p>
        <ul className="list-disc list-inside space-y-sm text-body text-ink">
          <li>Preserve the assessed skill and cognitive level</li>
          <li>Rephrase language for novelty and test security</li>
          <li>Support teacher review before release</li>
        </ul>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-lg py-section px-lg">
        <article className="p-lg bg-surface-soft rounded-lg">
          <h3 className="text-card-title font-bold text-ink mb-sm">For Real Classrooms</h3>
          <p className="text-body-sm text-ink/70">
            Built for teachers handling parallel classes, make-up tests, and academic integrity.
          </p>
        </article>
        <article className="p-lg bg-surface-soft rounded-lg">
          <h3 className="text-card-title font-bold text-ink mb-sm">Human in the Loop</h3>
          <p className="text-body-sm text-ink/70">
            AI drafts variants quickly, while teachers stay in control of acceptance and edits.
          </p>
        </article>
        <article className="p-lg bg-surface-soft rounded-lg">
          <h3 className="text-card-title font-bold text-ink mb-sm">Assessment Aligned</h3>
          <p className="text-body-sm text-ink/70">
            Every workflow step is aimed at protecting learning objectives and scoring consistency.
          </p>
        </article>
      </section>

      <section className="py-section px-lg bg-block-cream rounded-lg mx-lg mb-section">
        <h2 className="text-headline font-semibold text-ink mb-md">Who this is for</h2>
        <p className="text-body font-light text-ink max-w-3xl">
          Individual teachers, department leads, and schools that need multiple exam versions
          without sacrificing fairness. If you need equivalent forms fast and still want
          pedagogical control, this platform is built for your workflow.
        </p>
      </section>
    </main>
  )
}
