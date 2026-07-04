import { useEffect, useState } from 'react'
import Splash from './screens/Splash.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Dashboard from './screens/Dashboard.jsx'
import { getProfile, saveProfile } from './lib/store.js'

export default function App() {
  const [profile, setProfile] = useState(() => getProfile())
  const [splashDone, setSplashDone] = useState(false)

  // Gender-adaptive theme: swaps the accent palette app-wide
  useEffect(() => {
    const g = profile?.gender
    document.documentElement.setAttribute(
      'data-theme',
      g === 'female' ? 'female' : g === 'other' ? 'other' : 'male'
    )
  }, [profile])

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />

  if (!profile) {
    return (
      <Onboarding
        onDone={(p) => {
          if (saveProfile(p)) setProfile(p)
        }}
      />
    )
  }

  return <Dashboard profile={profile} />
}
