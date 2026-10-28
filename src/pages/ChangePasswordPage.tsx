import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'

export function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 8) {
      setError('Yeni parol ən azı 8 simvol olmalıdır.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni parol və təsdiq uyğun gəlmir.')
      return
    }

    if (currentPassword === newPassword) {
      setError('Yeni parol mövcud paroldan fərqli olmalıdır.')
      return
    }

    setSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess('Parol uğurla dəyişdirildi.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parol dəyişmə uğursuz oldu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title="Parolu dəyiş" lede="Mövcud parolunuzu təsdiqləyin və yeni parol təyin edin.">
      <form className="stack-form panel narrow-form" onSubmit={onSubmit}>
        <label>
          Mövcud parol
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Yeni parol
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Yeni parolu təsdiqlə
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {success ? <p className="form-success" role="status">{success}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saxlanılır…' : 'Parolu yenilə'}
        </button>
      </form>
    </AppShell>
  )
}
