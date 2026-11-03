import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ERROR_MESSAGES, toUserMessage } from '../api/errors'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Guards against a second tap before React re-renders the disabled button.
  const inFlight = useRef(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError(ERROR_MESSAGES.emptyCredentials)
      return
    }

    inFlight.current = true
    setError(null)
    setSubmitting(true)
    try {
      await login(trimmedEmail, password)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('[login] failed', err)
      setError(toUserMessage(err))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-stage">
      <div className="auth-atmosphere" aria-hidden="true" />
      <main className="auth-panel">
        <p className="brand">NifCash</p>
        <h1>Auth Gateway</h1>
        <p className="lede">Hesabınıza daxil olun və token əsaslı API-yə qoşulun.</p>

        <form className="stack-form login-form" onSubmit={onSubmit} noValidate>
          {error ? (
            <p className="form-error form-error-box" role="alert">
              {error}
            </p>
          ) : null}
          <label>
            Email
            <input
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Parol
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Daxil olunur…' : 'Daxil ol'}
          </button>
        </form>

        <p className="auth-switch">
          Hesabınız yoxdur? <Link to="/register">Qeydiyyat</Link>
        </p>
      </main>
    </div>
  )
}
