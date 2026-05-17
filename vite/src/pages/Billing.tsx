export default function Billing() {
  return (
    <main className="w-full max-w-7xl mx-auto">
      <section className="flex flex-col items-center justify-center gap-lg py-section px-lg bg-canvas">
        <p className="text-eyebrow uppercase text-ink tracking-wide">Billing</p>
        <h1 className="text-display-lg font-light text-ink text-center">Simple plans. Explicit controls. No surprises.</h1>
        <p className="text-subhead font-light text-ink text-center max-w-2xl">
          Manage seats, review invoices, and understand usage from one place with clear boundaries
          between plan tiers.
        </p>
      </section>

      <section className="py-section px-lg bg-block-cream rounded-lg mx-lg">
        <h2 className="text-headline font-semibold text-ink mb-md">What billing gives your team</h2>
        <ul className="list-disc list-inside space-y-sm text-body">
          <li>Invoice history with downloadable records</li>
          <li>Seat allocation and utilization transparency</li>
          <li>Single place to update payment methods</li>
        </ul>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-lg py-section px-lg">
        <article className="p-lg bg-surface-soft rounded-lg flex flex-col gap-md">
          <h3 className="text-card-title font-bold text-ink">Invoices</h3>
          <p className="text-body-sm text-ink/70 flex-grow">Track all subscription charges and export accounting-ready receipts.</p>
          <button className="px-lg py-xs bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-ink/10 transition-colors self-start" type="button">View invoices</button>
        </article>
        <article className="p-lg bg-surface-soft rounded-lg flex flex-col gap-md">
          <h3 className="text-card-title font-bold text-ink">Payment Methods</h3>
          <p className="text-body-sm text-ink/70 flex-grow">Switch cards, update details, and keep renewal uninterrupted.</p>
          <button className="px-lg py-xs bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-ink/10 transition-colors self-start" type="button">Manage payments</button>
        </article>
        <article className="p-lg bg-surface-soft rounded-lg flex flex-col gap-md">
          <h3 className="text-card-title font-bold text-ink">Usage Analytics</h3>
          <p className="text-body-sm text-ink/70 flex-grow">See generation volume and active seat trends before each cycle closes.</p>
          <button className="px-lg py-xs bg-canvas border border-hairline text-ink rounded-pill text-button font-medium hover:bg-ink/10 transition-colors self-start" type="button">Open analytics</button>
        </article>
      </section>
    </main>
  )
}
