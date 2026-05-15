export default function Billing() {
  return (
    <div>
      <section id="center">
        <div>
          <h1>Billing</h1>
          <p>
            Manage your subscription and billing information here.
          </p>
          <p>
            Track your usage, invoices, and payment methods all in one place.
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Billing Features</h2>
          <p>Available billing options</p>
          <ul>
            <li>
              <a href="#" target="_blank">
                View Invoices
              </a>
            </li>
            <li>
              <a href="#" target="_blank">
                Payment Methods
              </a>
            </li>
            <li>
              <a href="#" target="_blank">
                Usage Analytics
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
