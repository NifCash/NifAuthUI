import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/authApi'
import { useAuth } from '../auth/AuthContext'

export function RegisterPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const name = fullName.trim()
    const mail = email.trim()
    if (password.length < 8) {
      setError('Parol ən azı 8 simvol olmalıdır.')
      return
    }
    if (password !== confirmPassword) {
      setError('Parollar eyni deyil.')
      return
    }

    setSubmitting(true)
    try {
      await registerApi(mail, password, name)
      await login(mail, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Qeydiyyat uğursuz oldu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-stage">
      <div className="auth-atmosphere" aria-hidden="true" />
      <main className="auth-panel">
        <p className="brand">NifCash</p>
        <h1>Qeydiyyat</h1>
        <p className="lede">Hesab yaradın. Rol təyin olunmur — org request sonra göndərə bilərsiniz.</p>

        <form className="stack-form" onSubmit={onSubmit}>
          <label>
            Ad, soyad
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Parol
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label>
            Parolu təkrarlayın
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Yaradılır…' : 'Qeydiyyatdan keç'}
          </button>
        </form>

        <p className="auth-switch">
          Artıq hesabınız var? <Link to="/login">Daxil olun</Link>
        </p>
      </main>
    </div>
  )
}
