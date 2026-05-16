export default function About() {
  return (
    <main className="page">
      <section className="hero-section">
        <p className="eyebrow">About</p>
        <h1 className="display-title">A technical tool with a human pulse.</h1>
        <p className="subhead-copy">
          Quick Exam Gen is built around clear writing, reliable automation, and transparent
          collaboration between academic and product teams.
        </p>
      </section>

      <section className="color-block block-lilac">
        <h2 className="headline">Editorial clarity first.</h2>
        <p className="body-copy">
          We intentionally keep navigation, forms, and controls monochrome so attention goes to
          content quality, not decorative noise.
        </p>
      </section>

      <section className="panel-grid">
        <article className="panel-card">
          <h3>Built with React + Vite</h3>
          <p>Fast local feedback and clean component composition for product iteration.</p>
        </article>
        <article className="panel-card">
          <h3>Routed for flow</h3>
          <p>Client-side navigation keeps momentum while moving across projects and billing.</p>
        </article>
        <article className="panel-card">
          <h3>Supabase backend</h3>
          <p>Authentication and API-backed generation enable secure, scalable use.</p>
        </article>
      </section>
    </main>
  )
}
