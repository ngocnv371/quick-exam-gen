import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
    <div className="flex items-center justify-center min-h-screen bg-canvas">
      <div className="w-[min(100%,28rem)] p-lg rounded-lg border border-hairline shadow-md">
        <p className="text-eyebrow uppercase text-ink tracking-wide text-center mb-md">Quick Exam Gen</p>
        <h1 className="text-headline font-semibold text-ink text-center mb-xs">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-body-sm text-ink/60 text-center mb-lg">
          {isSignUp
            ? 'Start generating polished exams with your team in minutes.'
            : 'Sign in to continue building and shipping assessment projects.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="flex flex-col gap-xs">
            <label htmlFor="email" className="text-body-sm font-medium text-ink">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="px-md py-sm rounded-md border border-hairline bg-canvas text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="password" className="text-body-sm font-medium text-ink">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="px-md py-sm rounded-md border border-hairline bg-canvas text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {errorMessage && (
            <div className="py-sm px-md rounded-md bg-red-100 text-red-700 text-body-sm">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="py-sm px-md rounded-md bg-green-100 text-green-700 text-body-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-sm px-lg bg-primary text-on-primary rounded-pill text-button font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="text-body-sm text-ink/60 text-center mt-lg">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMessage('')
              setSuccessMessage('')
            }}
            disabled={isLoading}
            className="text-primary font-medium hover:underline disabled:opacity-50"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
