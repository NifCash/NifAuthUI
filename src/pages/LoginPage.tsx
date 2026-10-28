import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş uğursuz oldu')
    } finally {
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

        <form className="stack-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
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
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Giriş…' : 'Daxil ol'}
          </button>
        </form>

        <p className="auth-switch">
          Hesabınız yoxdur? <Link to="/register">Qeydiyyat</Link>
        </p>
      </main>
    </div>
  )
}
