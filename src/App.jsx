import { useEffect, useRef, useState } from 'react'
import Splash from './screens/Splash.jsx'
import Auth from './screens/Auth.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Workout from './screens/Workout.jsx'
import Diet from './screens/Diet.jsx'
import Care from './screens/Care.jsx'
import Style from './screens/Style.jsx'
import Analysis from './screens/Analysis.jsx'
import Body from './screens/Body.jsx'
import Inventory from './screens/Inventory.jsx'
import Cycle from './screens/Cycle.jsx'
import Profile from './screens/Profile.jsx'
import Routine from './screens/Routine.jsx'
import { runInitialAnalysis } from './lib/analysis.js'
import Chat from './screens/Chat.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { getProfile, saveProfile } from './lib/store.js'
import { withMeasurementSnapshot } from './lib/body.js'
import Lab from './screens/Lab.jsx'
import { isOwner } from './lib/owner.js'
import { applyMode, watchSystem } from './lib/mode.js'
import { applyAppearance } from './lib/appearance.js'
import { supabase, cloudReady } from './lib/supabase.js'
import { pullProfile, uploadInitialPhotos, signOutEverywhere, backfillLocalData, trackEvent } from './lib/cloud.js'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [session, setSession] = useState(cloudReady ? undefined : null)
  const [profile, setProfile] = useState(() => getProfile())
  const [tab, setTab] = useState('home')
  const [prevTab, setPrevTab] = useState('home')
  const openInventory = () => { setPrevTab(tab); setTab('inv') }
  const openProfile = () => { setPrevTab(tab); setTab('profile') }
  const openRoutine = () => { setPrevTab(tab); setTab('routine') }
  const openCycle = () => setTab('cycle')
  const openBody = () => { setPrevTab(tab); setTab('body') }

  function autoAnalyze(prof) {
    runInitialAnalysis(prof)
      .then((patch) => {
        const np = { ...getProfile(), ...patch }
        saveProfile(np)
        setProfile(np)
      })
      .catch((e) => console.error('auto-analysis:', e.message))
  }

  // owner/back-fill: analyze existing accounts that have photos but no analysis yet
  const analyzedOnce = useRef(false)
  useEffect(() => {
    if (analyzedOnce.current || !cloudReady || !session || !profile) return
    if ((profile.photos?.body_front || profile.photos?.face_front) && !profile.analysis) {
      analyzedOnce.current = true
      autoAnalyze(profile)
    }
  }, [session, profile])

  useEffect(() => {
    if (!cloudReady) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
      if (!s) setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!cloudReady || !session) return
    pullProfile().then((p) => {
      if (p) {
        saveProfile(p, { localOnly: true })
        setProfile(p)
      }
    })
  }, [session])

  // One-time recovery of data that only ever lived on this device.
  // Keyed on the user id, not the session object, so a token refresh
  // doesn't re-trigger it.
  const userId = session?.user?.id || null
  useEffect(() => {
    if (!cloudReady || !userId) return
    backfillLocalData().catch(() => {})
  }, [userId])

  // Activity trail: which screen, when
  const hasProfile = Boolean(profile)
  useEffect(() => {
    if (!cloudReady || !userId || !hasProfile) return
    trackEvent('screen_view', { screen: tab }).catch(() => {})
  }, [tab, userId, hasProfile])

  useEffect(() => {
    const g = profile?.gender
    document.documentElement.setAttribute(
      'data-theme',
      g === 'female' ? 'female' : g === 'other' ? 'other' : 'male'
    )
  }, [profile])

  // Light/dark belongs to the device; the accent and backdrop belong to the
  // profile. They have to be applied together and in this order, because both
  // hold a different value per mode and only one of them applies at a time —
  // so the backdrop has to be re-written every time the mode flips, including
  // when the OS flips it on its own at sunset.
  useEffect(() => {
    const resolved = applyMode()
    applyAppearance(profile || {}, resolved)
    return watchSystem((m) => applyAppearance(profile || {}, m))
  }, [profile])

  async function handleSignOut() {
    await signOutEverywhere()
    setProfile(null)
    setTab('home')
  }

  // Owner-only surfaces. A UI switch, not a security boundary — see owner.js.
  const owner = isOwner(profile, session)

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />

  if (cloudReady) {
    if (session === undefined) return <Splash onDone={() => {}} />
    if (!session) return <Auth />
  }

  if (!profile) {
    return (
      <Onboarding
        onDone={(raw) => {
          // Onboarding measurements become the first dated snapshot, so the
          // trend in 📐 Body is anchored from day one rather than from
          // whenever the user first opens that tab.
          const p = { ...raw, ...withMeasurementSnapshot(raw, {}) }
          if (saveProfile(p)) {
            setProfile(p)
            uploadInitialPhotos(p)
            autoAnalyze(p)   // deep photo analysis starts immediately, no button
          }
        }}
      />
    )
  }

  return (
    <>
      <ErrorBoundary inline key={tab}>
      {tab === 'home' && <Dashboard profile={profile} onOpenProfile={openProfile} onOpenCycle={openCycle} onOpenRoutine={openRoutine} />}
      {tab === 'workout' && <Workout profile={profile} onOpenBody={openBody} />}
      {tab === 'diet' && <Diet profile={profile} onOpenInventory={openInventory} onOpenBody={openBody} />}
      {tab === 'care' && <Care profile={profile} onOpenInventory={openInventory} onProfileUpdate={setProfile} />}
      {tab === 'style' && <Style profile={profile} />}
      {tab === 'stats' && <Analysis profile={profile} onOpenBody={openBody} />}
      {tab === 'body' && <Body profile={profile} onBack={() => setTab(prevTab)} onOpenProfile={openProfile} onProfileUpdate={setProfile} />}
      {tab === 'inv' && <Inventory profile={profile} />}
      {tab === 'cycle' && <Cycle profile={profile} onProfileUpdate={setProfile} />}
      {tab === 'routine' && <Routine profile={profile} onBack={() => setTab(prevTab)} onProfileUpdate={setProfile} />}
      {tab === 'profile' && <Profile profile={profile} onBack={() => setTab(prevTab)} onSignOut={cloudReady ? handleSignOut : null} onProfileUpdate={setProfile} />}
      {tab === 'lab' && owner && <Lab profile={profile} onBack={() => setTab(prevTab)} onProfileUpdate={setProfile} />}
      {tab === 'ai' && <Chat profile={profile} />}
      </ErrorBoundary>
      <nav className="tabbar">
        {[
          ['home', '🏠', 'Home'],
          ['workout', '💪', 'Fit'],
          ['diet', '🍽️', 'Diet'],
          ['care', '🧴', 'Care'],
          ...(profile.gender === 'female' ? [['cycle', '🌸', 'Cycle']] : []),
          ['style', '👔', 'Style'],
          ['inv', '🎒', 'Items'],
          ['body', '📐', 'Body'],
          ['stats', '📊', 'Stats'],
          ...(cloudReady ? [['ai', '✨', 'AI']] : []),
          // Owner-only measurement tool. Kept out of the user-facing app while
          // it is being evaluated. See owner.js — this hides the tab, it does
          // not secure it, and it is only safe to gate this way because the
          // screen touches nothing but the current user's own on-device photos.
          ...(owner ? [['lab', '🧪', 'Lab']] : []),
        ].map(([id, ic, lbl]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''}
            aria-label={lbl} onClick={() => setTab(id)}>
            <span className="ic">{ic}</span>
            <span className="lbl">{lbl}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
