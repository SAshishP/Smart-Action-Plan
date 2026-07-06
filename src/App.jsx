import { useEffect, useState } from 'react'
import Splash from './screens/Splash.jsx'
import Auth from './screens/Auth.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Chat from './screens/Chat.jsx'
import Workout from './screens/Workout.jsx'
import Diet from './screens/Diet.jsx'
import Care from './screens/Care.jsx'
import Style from './screens/Style.jsx'
import Analysis from './screens/Analysis.jsx'
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

  // Workout/Diet/Care/Style/Analysis each save profile edits (setup fields,
  // wardrobe, "why", etc.) straight to storage without lifting state up —
  // re-read on every tab switch so those edits show up elsewhere immediately
  // instead of only after a full reload.
  function goTo(id) {
    setProfile(getProfile())
    setTab(id)
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
      {tab === 'home' && <Dashboard profile={profile} onSignOut={cloudReady ? handleSignOut : null} />}
      {tab === 'workout' && <Workout profile={profile} />}
      {tab === 'diet' && <Diet profile={profile} />}
      {tab === 'care' && <Care profile={profile} />}
      {tab === 'style' && <Style profile={profile} />}
      {tab === 'stats' && <Analysis profile={profile} />}
      {tab === 'ai' && <Chat profile={profile} />}
      <nav className="tabbar">
        {[
          ['home', '🏠', 'Home'],
          ['workout', '💪', 'Workout'],
          ['diet', '🍽️', 'Diet'],
          ['care', '🧴', 'Care'],
          ['style', '👔', 'Style'],
          ['stats', '📊', 'Stats'],
          ...(cloudReady ? [['ai', '✨', 'Assistant']] : []),
        ].map(([id, ic, lbl]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''}
            aria-label={lbl} onClick={() => goTo(id)}>
            <span className="ic">{ic}</span>
            <span className="lbl">{lbl}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
