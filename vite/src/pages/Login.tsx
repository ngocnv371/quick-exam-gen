import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setSuccessMessage(
          'Sign up successful! Please check your email to verify your account.'
        )
        setEmail('')
        setPassword('')
        setIsSignUp(false)
      } else {
        await signIn(email, password)
        setSuccessMessage('Login successful! Redirecting...')
        setTimeout(() => navigate('/'), 1500)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <p className="auth-eyebrow">Quick Exam Gen</p>
        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-subhead">
          {isSignUp
            ? 'Start generating polished exams with your team in minutes.'
            : 'Sign in to continue building and shipping assessment projects.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="toggle-auth">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMessage('')
              setSuccessMessage('')
            }}
            disabled={isLoading}
            className="toggle-btn"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
