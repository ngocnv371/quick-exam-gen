import { useState } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'

export default function Home() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('unknown')

  return (
    <main className="page">
      <section className="hero-section">
        <p className="eyebrow">Quick Exam Gen</p>
        <h1 className="display-title">Build high-quality exams with a crisp editorial flow.</h1>
        <p className="subhead-copy">
          Monochrome controls keep the product predictable, while large color panels create
          storytelling rhythm for teams, templates, and delivery.
        </p>
        <div className="actions-row">
          <Link to="/projects" className="pill-btn primary">
            Open Projects
          </Link>
          <button className="pill-btn primary" onClick={() => setCount((value) => value + 1)}>
            Draft counter: {count}
          </button>
          <button
            className="pill-btn secondary"
            onClick={() => {
              fetch('/api/')
                .then((res) => res.json())
                .then((data) => setName(data.name))
            }}
            aria-label="Fetch API workspace name"
          >
            Ping API
          </button>
        </div>
        <p className="caption-line">API identity: {name}</p>
        <img className="hero-art" src={heroImg} alt="Workspace preview" />
      </section>

      <section className="color-block block-lime">
        <h2 className="headline">Authoring system, not just a form.</h2>
        <p className="body-copy">
          Start from reusable blocks for difficulty, outcomes, and rubrics. Every exam stays
          legible to educators and predictable for grading pipelines.
        </p>
        <div className="stat-grid">
          <div className="stat-box">
            <p className="stat-value">12s</p>
            <p className="stat-label">to draft first version</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">4</p>
            <p className="stat-label">difficulty bands mapped</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">100%</p>
            <p className="stat-label">machine-readable output</p>
          </div>
        </div>
      </section>

      <section className="color-block block-navy">
        <h2 className="headline">Ship assessments confidently.</h2>
        <p className="body-copy">
          Track revisions, compare generated variants, and publish polished exams with one primary
          action and clear fallback paths.
        </p>
        <ul className="feature-list">
          <li>Versioned drafts for every release cycle</li>
          <li>Template governance for multi-campus teams</li>
          <li>Instant export to exam-ready formats</li>
        </ul>
      </section>

      <section className="panel-grid">
        <article className="panel-card block-surface">
          <h3>Template Library</h3>
          <p>Browse pre-built structures for quizzes, finals, and oral assessments.</p>
        </article>
        <article className="panel-card block-surface">
          <h3>Rubric Sync</h3>
          <p>Keep question objectives tied to grading criteria from the first draft.</p>
        </article>
        <article className="panel-card block-surface">
          <h3>Audit Trail</h3>
          <p>Know who edited what, when, and why before publication.</p>
        </article>
      </section>
    </main>
  )
}
