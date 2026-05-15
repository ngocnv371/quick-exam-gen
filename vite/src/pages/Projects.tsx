export default function Projects() {
  return (
    <div>
      <section id="center">
        <div>
          <h1>Projects</h1>
          <p>
            View and manage all your projects in one place.
          </p>
          <p>
            Create new projects, collaborate with team members, and track project progress.
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Project Management</h2>
          <p>Organize your work</p>
          <ul>
            <li>
              <a href="#" target="_blank">
                Create New Project
              </a>
            </li>
            <li>
              <a href="#" target="_blank">
                View All Projects
              </a>
            </li>
            <li>
              <a href="#" target="_blank">
                Project Settings
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
