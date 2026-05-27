import { useEffect, useState } from 'react'

export default function BouncerScript(): JSX.Element | null {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash || ''
    if (!hash.includes('access_token=')) {
      if (hash.includes('error')) {
        setError(decodeURIComponent(hash.replace(/^#/, '')))
      } else {
        setError('No session was returned by the sign-in provider.')
      }
      return
    }
    // Hand the fragment off to the desktop app. Browser prompts
    // "Open Super Flow?" the first time and remembers the choice.
    window.location.href = 'super-flow://auth/callback' + hash
  }, [])

  if (error) {
    return (
      <p style={{ color: 'var(--danger)', marginTop: 16, fontSize: '0.9rem' }}>
        {error}
      </p>
    )
  }
  return null
}
