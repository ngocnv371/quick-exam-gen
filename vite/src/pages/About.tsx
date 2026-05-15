export default function About() {
  return (
    <div>
      <section id="center">
        <div>
          <h1>About Us</h1>
          <p>
            This is a sample SPA built with React, Vite, and React Router.
          </p>
          <p>
            React Router enables client-side routing, allowing us to navigate between pages
            without full page reloads, creating a smooth single-page application experience.
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Learn More</h2>
          <p>Discover more about our tech stack</p>
          <ul>
            <li>
              <a href="https://reactrouter.com/" target="_blank">
                React Router Documentation
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                React Documentation
              </a>
            </li>
            <li>
              <a href="https://vite.dev/" target="_blank">
                Vite Documentation
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
