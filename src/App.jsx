import { useEffect, useState } from 'react'
import Splash from './screens/Splash.jsx'
import Auth from './screens/Auth.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Chat from './screens/Chat.jsx'
import InstallGuide, { isStandalone } from './screens/InstallGuide.jsx'
import { getProfile, saveProfile } from './lib/store.js'
import { supabase, cloudReady } from './lib/supabase.js'
import { pullProfile, uploadInitialPhotos, signOutEverywhere } from './lib/cloud.js'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [installSkipped, setInstallSkipped] = useState(false)
  // undefined = still checking, null = signed out, object = signed in
  const [session, setSession] = useState(cloudReady ? undefined : null)
  const [profile, setProfile] = useState(() => getProfile())
  const [tab, setTab] = useState('home')

  // Watch login state (cloud mode only)
  useEffect(() => {
    if (!cloudReady) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
      if (!s) setProfile(null) // signed out → clear the in-memory profile
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // After login, pull this user's profile from the cloud
  useEffect(() => {
    if (!cloudReady || !session) return
    pullProfile().then((p) => {
      if (p) {
        saveProfile(p, { localOnly: true })
        setProfile(p)
      }
    })
  }, [session])

  // Gender-adaptive theme: swaps the accent palette app-wide
  useEffect(() => {
    const g = profile?.gender
    document.documentElement.setAttribute(
      'data-theme',
      g === 'female' ? 'female' : g === 'other' ? 'other' : 'male'
    )
  }, [profile])

  async function handleSignOut() {
    await signOutEverywhere()
    setProfile(null)
    setTab('home')
  }

  if (!isStandalone() && !installSkipped) {
    return <InstallGuide onSkip={() => setInstallSkipped(true)} />
  }

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />

  if (cloudReady) {
    if (session === undefined) return <Splash onDone={() => {}} />
    if (!session) return <Auth />
  }

  if (!profile) {
    return (
      <Onboarding
        onDone={(p) => {
          if (saveProfile(p)) {
            setProfile(p)
            uploadInitialPhotos(p) // background upload; never blocks the app
          }
        }}
      />
    )
  }

  return (
    <>
      {tab === 'home'
        ? <Dashboard profile={profile} onSignOut={cloudReady ? handleSignOut : null} />
        : <Chat profile={profile} />}
      {cloudReady && (
        <nav className="tabbar">
          <button type="button" className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>
            🏠 Home
          </button>
          <button type="button" className={tab === 'ai' ? 'active' : ''} onClick={() => setTab('ai')}>
            ✨ Assistant
          </button>
        </nav>
      )}
    </>
  )
}
