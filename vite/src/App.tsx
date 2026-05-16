import { Routes, Route, Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import About from './pages/About'
import Billing from './pages/Billing'
import Projects from './pages/Projects'
import Login from './pages/Login'
import { useAuth } from './hooks/useAuth'
import './App.css'

function ProtectedRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function App() {
  const { user, loading, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <section className="hero-section">
          <p className="eyebrow">Loading</p>
          <h1 className="display-title">Preparing your workspace...</h1>
        </section>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="top-nav-left">
          <span className="brand">QEG</span>
          <div className="nav-links">
            <Link to="/" className="nav-link">
            Home
          </Link>
            <Link to="/projects" className="nav-link">
            Projects
          </Link>
            <Link to="/billing" className="nav-link">
            Billing
          </Link>
            <Link to="/about" className="nav-link">
            About
          </Link>
          </div>
        </div>
        <div className="top-nav-right">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="pill-btn primary"
              >
                {isSigningOut ? 'Signing out...' : 'Logout'}
              </button>
            </>
          ) : (
            <Link to="/login" className="pill-btn primary">
              Login
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route element={<ProtectedRoute isAuthenticated={!!user} />}>
          <Route path="/projects" element={<Projects />} />
          <Route path="/billing" element={<Billing />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
