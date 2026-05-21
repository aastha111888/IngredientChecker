import { useState } from 'react'
import { supabase } from '../supabaseClient.js'
import './Login.css'

function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const handleSignUp = async (event) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError('Account created. Check your email to confirm, then log in.')
      setSubmitting(false)
      switchMode('login')
      return
    }

    setSubmitting(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          Paw Check <span className="login-emoji" aria-hidden="true">🐾</span>
        </h1>

        {error && <p className="login-error">{error}</p>}

        {mode === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-field">
              <span className="login-label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="login-field">
              <span className="login-label">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button
              type="submit"
              className="login-btn login-btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSignUp}>
            <label className="login-field">
              <span className="login-label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="login-field">
              <span className="login-label">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="login-field">
              <span className="login-label">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <button
              type="submit"
              className="login-btn login-btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}

        <p className="login-switch">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="login-switch-link" onClick={() => switchMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="login-switch-link" onClick={() => switchMode('login')}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default Login
