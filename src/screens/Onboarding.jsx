import { useState } from 'react'
import { ageFromDob } from '../lib/store.js'
import { compressImage } from '../lib/img.js'

const PHOTO_SLOTS = [
  { key: 'body_front', label: 'Body · Front' },
  { key: 'body_left', label: 'Body · Left' },
  { key: 'body_right', label: 'Body · Right' },
  { key: 'body_back', label: 'Body · Back' },
  { key: 'face_front', label: 'Face · Front' },
  { key: 'face_left', label: 'Face · Left' },
  { key: 'face_right', label: 'Face · Right' },
  { key: 'hair_front', label: 'Hair · Front' },
  { key: 'hair_left', label: 'Hair · Left' },
  { key: 'hair_right', label: 'Hair · Right' },
  { key: 'hair_back', label: 'Hair · Back' },
  { key: 'hair_top', label: 'Hair · Top' },
]

const STEPS = ['Consent', 'Basics', 'Body', 'Health', 'Lifestyle', 'Socials', 'Photos']

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({
    name: '', email: '', dob: '', gender: '',
    height: '', weight: '', chest: '', waist: '', hips: '',
    skinSensitivity: 'none', allergies: '', medications: '', foodsToAvoid: '',
    dietType: '', bodyType: '',
    goals: '', lifestyle: '', activityLevel: '', job: '',
    workStart: '09:00', workEnd: '18:00', wakeTime: '06:30', sleepTime: '22:30',
    ethnicity: '', location: '',
    instagram: '', whatsapp: '', snapchat: '', googleEmail: '',
    photos: {},
    createdAt: new Date().toISOString(),
  })

  const set = (key) => (e) => setF((old) => ({ ...old, [key]: e.target.value }))
  const age = ageFromDob(f.dob)

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Location is not available on this device — type it instead.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setF((old) => ({
          ...old,
          location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        })),
      () => setError('Location permission denied — type your city instead.')
    )
  }

  async function onPhoto(key, e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      setF((old) => ({ ...old, photos: { ...old.photos, [key]: dataUrl } }))
      setError('')
    } catch {
      setError('That photo could not be added — try another one.')
    }
  }

  function next() {
    setError('')
    if (step === 0 && !agreed) {
      setError('Please read and accept before continuing.')
      return
    }
    if (step === 1) {
      if (!f.name.trim()) return setError('Your name is needed.')
      if (!f.dob) return setError('Pick your date of birth.')
      if (!f.gender) return setError('Select a gender — the app adapts to it.')
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      onDone(f)
    }
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="screen">
      <h1>{STEPS[step]}</h1>
      <p className="dim small">Step {step + 1} of {STEPS.length}</p>
      <div className="progressbar"><i style={{ width: pct + '%' }} /></div>

      {step === 0 && (
        <>
          <div className="consent-box">
            <strong>Before you start — please read this.</strong>
            <p style={{ marginTop: 8 }}>
              SAP is a personal app run by one person (the owner). To give you
              plans and progress analysis, it stores your profile details,
              health info, daily logs, and the photos you add. <strong>The app
              owner can see all data you put in this app</strong>, including
              photos. Other users can never see your data.
            </p>
            <p style={{ marginTop: 8 }}>
              SAP gives lifestyle suggestions only. It is <strong>not medical
              advice</strong> — for allergies, medications, symptoms, or
              anything health-related, talk to a doctor.
            </p>
          </div>
          <div className="check-row">
            <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <label htmlFor="agree">I understand and agree to both points above.</label>
          </div>
        </>
      )}

      {step === 1 && (
        <div className="card">
          <label className="field"><span>Full name</span>
            <input value={f.name} onChange={set('name')} autoComplete="name" /></label>
          <label className="field"><span>Email</span>
            <input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <div className="row">
            <label className="field"><span>Date of birth</span>
              <input type="date" value={f.dob} onChange={set('dob')} max={new Date().toISOString().slice(0, 10)} /></label>
            <label className="field"><span>Age (auto)</span>
              <input value={age} readOnly /></label>
          </div>
          <label className="field"><span>Gender — the app adapts its look and modules</span>
            <select value={f.gender} onChange={set('gender')}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select></label>
          <label className="field"><span>Ethnicity (helps skin & hair care)</span>
            <input value={f.ethnicity} onChange={set('ethnicity')} /></label>
          <label className="field"><span>Location</span>
            <input value={f.location} onChange={set('location')} placeholder="City, or use the button" /></label>
          <button className="ghost" type="button" onClick={useMyLocation}>Use my current location</button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="row">
            <label className="field"><span>Height (cm)</span>
              <input type="number" inputMode="numeric" value={f.height} onChange={set('height')} /></label>
            <label className="field"><span>Weight (kg)</span>
              <input type="number" inputMode="numeric" value={f.weight} onChange={set('weight')} /></label>
          </div>
          <p className="dim small" style={{ margin: '4px 0 10px' }}>Measurements (cm, optional)</p>
          <div className="row">
            <label className="field"><span>Chest</span>
              <input type="number" inputMode="numeric" value={f.chest} onChange={set('chest')} /></label>
            <label className="field"><span>Waist</span>
              <input type="number" inputMode="numeric" value={f.waist} onChange={set('waist')} /></label>
            <label className="field"><span>Hips</span>
              <input type="number" inputMode="numeric" value={f.hips} onChange={set('hips')} /></label>
          </div>
          <label className="field"><span>Body type (if you know it)</span>
            <select value={f.bodyType} onChange={set('bodyType')}>
              <option value="">Not sure — analyze from photos</option>
              <option>Ectomorph (lean)</option>
              <option>Mesomorph (athletic)</option>
              <option>Endomorph (rounder)</option>
            </select></label>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <label className="field"><span>Skin sensitivity</span>
            <select value={f.skinSensitivity} onChange={set('skinSensitivity')}>
              <option value="none">Not sensitive</option>
              <option value="mild">Mildly sensitive</option>
              <option value="high">Very sensitive</option>
            </select></label>
          <label className="field"><span>Allergies</span>
            <textarea rows="2" value={f.allergies} onChange={set('allergies')} placeholder="e.g. peanuts, dust, fragrance" /></label>
          <label className="field"><span>Medications</span>
            <textarea rows="2" value={f.medications} onChange={set('medications')} /></label>
          <label className="field"><span>Foods to avoid</span>
            <textarea rows="2" value={f.foodsToAvoid} onChange={set('foodsToAvoid')} /></label>
          <label className="field"><span>Diet type</span>
            <select value={f.dietType} onChange={set('dietType')}>
              <option value="">Select…</option>
              <option>Vegetarian</option>
              <option>Non-vegetarian</option>
              <option>Eggetarian</option>
              <option>Vegan</option>
              <option>Keto</option>
              <option>No specific diet</option>
            </select></label>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <label className="field"><span>Your goals</span>
            <textarea rows="2" value={f.goals} onChange={set('goals')} placeholder="e.g. lose 6 kg, clear skin, better sleep" /></label>
          <label className="field"><span>Activity level</span>
            <select value={f.activityLevel} onChange={set('activityLevel')}>
              <option value="">Select…</option>
              <option>Sedentary (desk, little movement)</option>
              <option>Lightly active</option>
              <option>Active</option>
              <option>Very active / athlete</option>
            </select></label>
          <label className="field"><span>Lifestyle</span>
            <input value={f.lifestyle} onChange={set('lifestyle')} placeholder="e.g. student, 9–6 job, night shifts" /></label>
          <label className="field"><span>Job / work</span>
            <input value={f.job} onChange={set('job')} /></label>
          <div className="row">
            <label className="field"><span>Work starts</span>
              <input type="time" value={f.workStart} onChange={set('workStart')} /></label>
            <label className="field"><span>Work ends</span>
              <input type="time" value={f.workEnd} onChange={set('workEnd')} /></label>
          </div>
          <div className="row">
            <label className="field"><span>Wake-up time</span>
              <input type="time" value={f.wakeTime} onChange={set('wakeTime')} /></label>
            <label className="field"><span>Sleep time</span>
              <input type="time" value={f.sleepTime} onChange={set('sleepTime')} /></label>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <p className="dim small" style={{ marginBottom: 12 }}>
            These are used only for share buttons — so you can post your
            progress to your own accounts. SAP never reads anything from them.
          </p>
          <label className="field"><span>Instagram username</span>
            <input value={f.instagram} onChange={set('instagram')} placeholder="@username" /></label>
          <label className="field"><span>WhatsApp number</span>
            <input type="tel" value={f.whatsapp} onChange={set('whatsapp')} /></label>
          <label className="field"><span>Snapchat username</span>
            <input value={f.snapchat} onChange={set('snapchat')} /></label>
          <label className="field"><span>Google account email</span>
            <input type="email" value={f.googleEmail} onChange={set('googleEmail')} /></label>
        </div>
      )}

      {step === 6 && (
        <>
          <p className="dim small">
            These 12 photos are your starting point — every future progress
            comparison measures against them. Wear fitted clothes, stand in
            good light. You can skip any and add them later.
          </p>
          <div className="photo-grid">
            {PHOTO_SLOTS.map((slot) => (
              <div className="photo-slot" key={slot.key}>
                {f.photos[slot.key]
                  ? <img src={f.photos[slot.key]} alt={slot.label} />
                  : <span>{slot.label}<br />＋</span>}
                <input type="file" accept="image/*"
                  onChange={(e) => onPhoto(slot.key, e)} aria-label={slot.label} />
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p style={{ color: 'var(--danger)', margin: '12px 0' }}>{error}</p>}

      <div className="row" style={{ marginTop: 18 }}>
        {step > 0 && (
          <button className="ghost" type="button" onClick={() => setStep(step - 1)}>Back</button>
        )}
        <button type="button" onClick={next}>
          {step === STEPS.length - 1 ? 'Create my profile' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
