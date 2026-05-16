import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type ProjectStatus = 'all' | 'draft' | 'pending' | 'ready' | 'processing' | 'failed' | 'done' | 'archived'

type ProjectRow = {
  id: string
  title: string
  status: Exclude<ProjectStatus, 'all'>
  created_at: string
  updated_at: string
}

const PAGE_SIZE = 10

const STATUS_OPTIONS: Array<{ label: string; value: ProjectStatus }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Ready', value: 'ready' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
  { label: 'Done', value: 'done' },
  { label: 'Archived', value: 'archived' },
]

export default function Projects() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ProjectStatus>('all')
  const [nameFilter, setNameFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const loadProjects = useCallback(async () => {
    setLoading(true)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('projects')
      .select('id, title, status, created_at, updated_at', { count: 'exact' })
      .eq('type', 'exam')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const normalizedName = nameFilter.trim()
    if (normalizedName) {
      query = query.ilike('title', `%${normalizedName}%`)
    }

    const { data, count, error: fetchError } = await query

    if (fetchError) {
      setRows([])
      setTotal(0)
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setRows((data ?? []) as ProjectRow[])
    setTotal(count ?? 0)
    setError(null)
    setLoading(false)
  }, [nameFilter, page, status])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProjects()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadProjects])

  const pageLabel = useMemo(() => {
    if (total === 0) return 'Page 1 of 1'
    return `Page ${page} of ${totalPages}`
  }, [page, total, totalPages])

  const handleStartNewProject = async () => {
    if (!user?.id) {
      setError('You need to be signed in to create a project.')
      return
    }

    setIsCreating(true)

    const { data, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: 'Untitled Exam',
        type: 'exam',
      })
      .select('id')
      .single()

    if (createError) {
      setError(`Could not create project: ${createError.message}`)
      setIsCreating(false)
      return
    }

    setIsCreating(false)
    navigate(`/projects/${data.id}`)
  }

  return (
    <main className="page">
      <section className="color-block block-coral">
        <h2 className="headline">Projects</h2>
        <p className="body-copy">
          Filter by status, search by name, and open a project to view its full details.
        </p>

        <div className="actions-row">
          <button
            className="pill-btn primary"
            type="button"
            onClick={() => {
              void handleStartNewProject()
            }}
            disabled={isCreating}
          >
            {isCreating ? 'Starting project...' : 'Start new project'}
          </button>
        </div>

        <div className="projects-filters" role="search" aria-label="Project filters">
          <label className="projects-filter-item" htmlFor="projects-name-filter">
            Name
            <input
              id="projects-name-filter"
              className="projects-input"
              value={nameFilter}
              onChange={(event) => {
                setLoading(true)
                setPage(1)
                setNameFilter(event.target.value)
              }}
              placeholder="Search project name"
              type="search"
            />
          </label>

          <label className="projects-filter-item" htmlFor="projects-status-filter">
            Status
            <select
              id="projects-status-filter"
              className="projects-select"
              value={status}
              onChange={(event) => {
                setLoading(true)
                setPage(1)
                setStatus(event.target.value as ProjectStatus)
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="projects-error" role="alert">
            Could not load projects: {error}
          </p>
        ) : null}

        {loading ? <p className="projects-loading">Loading projects...</p> : null}

        {!loading && rows.length === 0 ? (
          <p className="projects-empty">No projects match the current filters.</p>
        ) : null}

        {!loading && rows.length > 0 ? (
          <div className="projects-table-wrap">
            <table className="projects-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((project) => (
                  <tr
                    key={project.id}
                    className="projects-row"
                    tabIndex={0}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/projects/${project.id}`)
                      }
                    }}
                  >
                    <td>{project.title}</td>
                    <td>
                      <span className="projects-status-chip">{project.status}</span>
                    </td>
                    <td>{new Date(project.created_at).toLocaleString()}</td>
                    <td>{new Date(project.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="projects-pagination">
          <span className="caption-line">{pageLabel}</span>
          <div className="projects-pagination-actions">
            <button
              className="pill-btn secondary"
              type="button"
              onClick={() => {
                setLoading(true)
                setPage((current) => Math.max(1, current - 1))
              }}
              disabled={loading || page <= 1}
            >
              Previous
            </button>
            <button
              className="pill-btn secondary"
              type="button"
              onClick={() => {
                setLoading(true)
                setPage((current) => Math.min(totalPages, current + 1))
              }}
              disabled={loading || page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
