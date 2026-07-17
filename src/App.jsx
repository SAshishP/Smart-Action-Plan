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
import Inventory from './screens/Inventory.jsx'
import Cycle from './screens/Cycle.jsx'
import Profile from './screens/Profile.jsx'
import { runInitialAnalysis } from './lib/analysis.js'
import Chat from './screens/Chat.jsx'
import { getProfile, saveProfile } from './lib/store.js'
import { supabase, cloudReady } from './lib/supabase.js'
import { pullProfile, uploadInitialPhotos, signOutEverywhere } from './lib/cloud.js'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [session, setSession] = useState(cloudReady ? undefined : null)
  const [profile, setProfile] = useState(() => getProfile())
  const [tab, setTab] = useState('home')
  const [prevTab, setPrevTab] = useState('home')
  const openInventory = () => { setPrevTab(tab); setTab('inv') }
  const openProfile = () => { setPrevTab(tab); setTab('profile') }
  const openCycle = () => setTab('cycle')

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
            uploadInitialPhotos(p)
            autoAnalyze(p)   // deep photo analysis starts immediately, no button
          }
        }}
      />
    )
  }

  return (
    <>
      {tab === 'home' && <Dashboard profile={profile} onOpenProfile={openProfile} onOpenCycle={openCycle} />}
      {tab === 'workout' && <Workout profile={profile} />}
      {tab === 'diet' && <Diet profile={profile} onOpenInventory={openInventory} />}
      {tab === 'care' && <Care profile={profile} onOpenInventory={openInventory} />}
      {tab === 'style' && <Style profile={profile} />}
      {tab === 'stats' && <Analysis profile={profile} />}
      {tab === 'inv' && <Inventory profile={profile} />}
      {tab === 'cycle' && <Cycle profile={profile} onProfileUpdate={setProfile} />}
      {tab === 'profile' && <Profile profile={profile} onBack={() => setTab(prevTab)} onSignOut={cloudReady ? handleSignOut : null} onProfileUpdate={setProfile} />}
      {tab === 'ai' && <Chat profile={profile} />}
      <nav className="tabbar">
        {[
          ['home', '🏠', 'Home'],
          ['workout', '💪', 'Fit'],
          ['diet', '🍽️', 'Diet'],
          ['care', '🧴', 'Care'],
          ...(profile.gender === 'female' ? [['cycle', '🌸', 'Cycle']] : []),
          ['style', '👔', 'Style'],
          ['inv', '🎒', 'Items'],
          ['stats', '📊', 'Stats'],
          ...(cloudReady ? [['ai', '✨', 'AI']] : []),
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
