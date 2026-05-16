export default function Billing() {
  return (
    <main className="page">
      <section className="hero-section">
        <p className="eyebrow">Billing</p>
        <h1 className="display-title">Simple plans. Explicit controls. No surprises.</h1>
        <p className="subhead-copy">
          Manage seats, review invoices, and understand usage from one place with clear boundaries
          between plan tiers.
        </p>
      </section>

      <section className="color-block block-cream">
        <h2 className="headline">What billing gives your team</h2>
        <ul className="feature-list">
          <li>Invoice history with downloadable records</li>
          <li>Seat allocation and utilization transparency</li>
          <li>Single place to update payment methods</li>
        </ul>
      </section>

      <section className="panel-grid">
        <article className="panel-card">
          <h3>Invoices</h3>
          <p>Track all subscription charges and export accounting-ready receipts.</p>
          <button className="pill-btn secondary" type="button">View invoices</button>
        </article>
        <article className="panel-card">
          <h3>Payment Methods</h3>
          <p>Switch cards, update details, and keep renewal uninterrupted.</p>
          <button className="pill-btn secondary" type="button">Manage payments</button>
        </article>
        <article className="panel-card">
          <h3>Usage Analytics</h3>
          <p>See generation volume and active seat trends before each cycle closes.</p>
          <button className="pill-btn secondary" type="button">Open analytics</button>
        </article>
      </section>
    </main>
  )
}
