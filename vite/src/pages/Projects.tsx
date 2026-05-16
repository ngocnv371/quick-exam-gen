export default function Projects() {
  return (
    <main className="page">
      <section className="hero-section">
        <p className="eyebrow">Projects</p>
        <h1 className="display-title">Organize every exam stream in one editorial grid.</h1>
        <p className="subhead-copy">
          Create initiatives by term, assign collaborators, and keep draft quality visible from
          first prompt to published exam.
        </p>
      </section>

      <section className="color-block block-coral">
        <h2 className="headline">Production pipeline at a glance</h2>
        <p className="body-copy">
          Map generation work to milestones and delivery dates while preserving review history and
          rubric consistency.
        </p>
      </section>

      <section className="panel-grid">
        <article className="panel-card block-surface">
          <h3>Midterm Generator</h3>
          <p>32 questions · 4 sections · active collaboration</p>
          <button className="pill-btn primary" type="button">Open project</button>
        </article>
        <article className="panel-card block-surface">
          <h3>Placement Diagnostic</h3>
          <p>Adaptive branching · rubric linked · awaiting approval</p>
          <button className="pill-btn secondary" type="button">Review details</button>
        </article>
        <article className="panel-card block-surface">
          <h3>Final Exam Suite</h3>
          <p>Multi-version output · anti-cheat variants · scheduled publish</p>
          <button className="pill-btn secondary" type="button">Manage release</button>
        </article>
      </section>
    </main>
  )
}
