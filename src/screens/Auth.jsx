import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const FRIENDLY = {
  'Invalid login credentials': 'Wrong email or password.',
  'User already registered': 'That email already has an account — sign in instead.',
}

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError('')
    if (!email.trim() || password.length < 6) {
      setError('Enter your email and a password of at least 6 characters.')
      return
    }
    setBusy(true)
    const creds = { email: email.trim(), password }
    const { error: err } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword(creds)
        : await supabase.auth.signUp(creds)
    setBusy(false)
    if (err) setError(FRIENDLY[err.message] || err.message)
    // On success, App.jsx reacts to the auth state change automatically.
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <img src="/pwa-192.png" alt="SAP" style={{ width: 72, borderRadius: 20, marginBottom: 16 }} />
      <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="dim" style={{ margin: '6px 0 20px' }}>
        {mode === 'signin'
          ? 'Sign in to load your plan and progress.'
          : 'One account keeps your data safe across phones.'}
      </p>
      <div className="card">
        <label className="field"><span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" inputMode="email" /></label>
        <label className="field"><span>Password (6+ characters)</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => e.key === 'Enter' && submit()} /></label>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}
        <button type="button" onClick={submit} disabled={busy}>
          {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </div>
      <button className="ghost" type="button"
        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
        {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
