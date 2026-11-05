import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'
import { fetchProfile, updateProfile } from '../api/authApi'

const NAME_MAX = 50
const PHONE_RE = /^\+[1-9]\d{7,14}$/

export function ProfilePage() {
  const { accessToken, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    setLoading(true)
    setLoadFailed(false)

    fetchProfile(accessToken)
      .then((profile) => {
        if (cancelled) return
        setEmail(profile.email)
        setFirstName(profile.firstName ?? '')
        setLastName(profile.lastName ?? '')
        setPhone(profile.phone ?? '')
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        // Profil yüklənməyibsə forma göstərilmir, ona görə boş telefon heç vaxt göndərilmir
        setLoadFailed(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, reloadKey])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!accessToken) return

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedPhone = phone.trim()

    if (trimmedFirst.length < 1 || trimmedFirst.length > NAME_MAX) {
      setError(`Ad 1-${NAME_MAX} simvol olmalıdır.`)
      return
    }

    if (trimmedLast.length < 1 || trimmedLast.length > NAME_MAX) {
      setError(`Soyad 1-${NAME_MAX} simvol olmalıdır.`)
      return
    }

    if (trimmedPhone && !PHONE_RE.test(trimmedPhone)) {
      setError('Telefon E.164 formatında olmalıdır, məsələn +994501234567.')
      return
    }

    setSubmitting(true)
    try {
      await updateProfile(accessToken, {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        phone: trimmedPhone || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil yadda saxlanılmadı')
      setSubmitting(false)
      return
    }

    // Məlumat artıq yazılıb; refresh xətası ayrıca mesajla göstərilir
    try {
      await refreshUser()
      setSuccess('Profil yadda saxlanıldı.')
    } catch {
      setError('Profil yadda saxlandı, amma səhifə yenilənmədi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell title="Profil" lede="Şəxsi məlumatlarınızı buradan yeniləyə bilərsiniz.">
      {loading ? <p>Yüklənir…</p> : null}
      {!loading && loadFailed ? (
        <div className="stack-form panel narrow-form">
          <p className="form-error" role="alert">Profil yüklənmədi.</p>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
            Yenidən cəhd et
          </button>
        </div>
      ) : null}
      {!loading && !loadFailed ? (
        <form className="stack-form panel narrow-form" onSubmit={onSubmit} noValidate>
          <fieldset disabled={submitting} style={{ display: 'grid', gap: '1rem', border: 0, margin: 0, padding: 0 }}>
            <label>
              E-poçt (dəyişdirilə bilməz)
              <input type="email" value={email} readOnly autoComplete="email" />
            </label>
            <label>
              Ad
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                maxLength={NAME_MAX}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label>
              Soyad
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                maxLength={NAME_MAX}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label>
              Telefon (ixtiyari)
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+994501234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {success ? <p className="form-success" role="status">{success}</p> : null}
            <button type="submit">{submitting ? 'Saxlanılır…' : 'Yadda saxla'}</button>
          </fieldset>
        </form>
      ) : null}
    </AppShell>
  )
}
