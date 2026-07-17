import { useState } from 'react'
import { getProfile, saveProfile, ageFromDob } from '../lib/store.js'
import { compressImage } from '../lib/img.js'
import { uploadProgressPhoto } from '../lib/cloud.js'
import { runInitialAnalysis } from '../lib/analysis.js'

const PHOTO_SLOTS = [
  ['body_front', 'Body F'], ['body_left', 'Body L'], ['body_right', 'Body R'], ['body_back', 'Body B'],
  ['face_front', 'Face F'], ['face_left', 'Face L'], ['face_right', 'Face R'],
  ['hair_front', 'Hair F'], ['hair_left', 'Hair L'], ['hair_right', 'Hair R'], ['hair_back', 'Hair B'], ['hair_top', 'Hair T'],
]

export default function Profile({ profile, onBack, onSignOut, onProfileUpdate }) {
  const [p, setP] = useState(profile)
  const [f, setF] = useState({ ...profile })
  const [msg, setMsg] = useState('')
  const [aiBusy, setAiBusy] = useState(false)

  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e.target.value }))

  function apply(patch, note) {
    const np = { ...getProfile(), ...patch }
    saveProfile(np)
    setP(np)
    setF({ ...np })
    onProfileUpdate?.(np)
    if (note) setMsg(note)
  }

  function save() {
    const { photos, analysis, ...fields } = f
    apply(fields, 'Profile saved ✓ — plans update instantly.')
  }

  async function replacePhoto(slot, e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImage(file, 720, 0.6)
      apply({ photos: { ...(getProfile().photos || {}), [slot]: dataUrl } }, `${slot.replace('_', ' ')} updated ✓`)
      uploadProgressPhoto(dataUrl, slot + '_initial', new Date().toISOString().slice(0, 10))
    } catch {
      setMsg('That photo could not be read — try another one.')
    }
  }

  async function rerunAnalysis() {
    setAiBusy(true)
    setMsg('')
    try {
      const patch = await runInitialAnalysis(getProfile())
      apply(patch, 'Photo analysis updated ✓ — Fit, Care and Style now use it.')
    } catch (err) {
      setMsg('⚠️ ' + err.message)
    } finally {
      setAiBusy(false)
    }
  }

  const a = p.analysis

  return (
    <div className="screen with-tabbar">
      {onBack && <button className="mini ghost" type="button" onClick={onBack} style={{ marginBottom: 10 }}>← Back</button>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {p.photos?.face_front
          ? <img src={p.photos.face_front} alt="me" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
          : <span style={{ fontSize: 40 }}>👤</span>}
        <div>
          <h1 style={{ fontSize: 22 }}>{p.name || 'Your profile'}</h1>
          <p className="dim small">{p.email} · {ageFromDob(p.dob) || '—'} yrs · {p.gender}</p>
        </div>
      </div>

      <section className="card">
        <h2>🧠 Photo analysis</h2>
        {a ? (
          <>
            <div className="chips">
              {p.bodyShape && <span className="chip">🧍 {p.bodyShape}</span>}
              {p.faceShape && <span className="chip">🙂 {p.faceShape} face</span>}
              {p.undertone && <span className="chip">🎨 {p.undertone} undertone</span>}
            </div>
            {a.posture?.length > 0 && <p className="small" style={{ marginTop: 8 }}><strong>Posture:</strong> {a.posture.join(', ')} <span className="dim">(fixes in 💪 Fit)</span></p>}
            {a.fatAreas?.length > 0 && <p className="small" style={{ marginTop: 4 }}><strong>Focus areas:</strong> {a.fatAreas.join(', ')} <span className="dim">(built into your plans)</span></p>}
            {a.skinConcerns?.length > 0 && <p className="small" style={{ marginTop: 4 }}><strong>Skin:</strong> {a.skinConcerns.join(', ')} <span className="dim">(fixes in 🧴 Care)</span></p>}
            {a.hairNotes && <p className="small" style={{ marginTop: 4 }}><strong>Hair:</strong> {a.hairNotes}</p>}
            {a.summary && <p className="dim small" style={{ marginTop: 8 }}>{a.summary}</p>}
            <p className="dim" style={{ fontSize: 11, marginTop: 6 }}>Analyzed {a.at} · AI estimate from photos, not a medical assessment.</p>
          </>
        ) : (
          <p className="dim small">Not analyzed yet — add initial photos below, then run it.</p>
        )}
        <button className="ghost" type="button" style={{ marginTop: 10 }} onClick={rerunAnalysis} disabled={aiBusy}>
          {aiBusy ? 'Analyzing your photos…' : a ? '🔁 Re-run photo analysis' : '✨ Analyze my photos'}
        </button>
      </section>

      <section className="card">
        <h2>📸 Initial photos <span className="dim small">tap to retake / replace</span></h2>
        <div className="photo-grid">
          {PHOTO_SLOTS.map(([slot, label]) => (
            <div className="photo-slot" key={slot}>
              {p.photos?.[slot] ? <img src={p.photos[slot]} alt={label} /> : <span>{label}<br />＋</span>}
              <input type="file" accept="image/*" onChange={(e) => replacePhoto(slot, e)} aria-label={label} />
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>✏️ Details</h2>
        <label className="field"><span>Name</span><input value={f.name || ''} onChange={set('name')} /></label>
        <div className="row">
          <label className="field"><span>Height (cm)</span><input type="number" inputMode="numeric" value={f.height || ''} onChange={set('height')} /></label>
          <label className="field"><span>Weight (kg)</span><input type="number" inputMode="numeric" value={f.weight || ''} onChange={set('weight')} /></label>
        </div>
        <label className="field"><span>Goals</span><textarea rows="2" value={f.goals || ''} onChange={set('goals')} /></label>
        <label className="field"><span>Diet type</span>
          <select value={f.dietType || ''} onChange={set('dietType')}>
            {['', 'Vegetarian', 'Non-vegetarian', 'Eggetarian', 'Vegan', 'Keto', 'No specific diet'].map((d) => <option key={d} value={d}>{d || 'Select…'}</option>)}
          </select></label>
        <label className="field"><span>Allergies</span><textarea rows="2" value={f.allergies || ''} onChange={set('allergies')} /></label>
        <label className="field"><span>Medications</span><textarea rows="2" value={f.medications || ''} onChange={set('medications')} /></label>
        <label className="field"><span>Foods to avoid</span><textarea rows="2" value={f.foodsToAvoid || ''} onChange={set('foodsToAvoid')} /></label>
        <label className="field"><span>Activity level</span>
          <select value={f.activityLevel || ''} onChange={set('activityLevel')}>
            {['', 'Sedentary (desk, little movement)', 'Lightly active', 'Active', 'Very active / athlete'].map((d) => <option key={d} value={d}>{d || 'Select…'}</option>)}
          </select></label>
        <div className="row">
          <label className="field"><span>Work starts</span><input type="time" value={f.workStart || ''} onChange={set('workStart')} /></label>
          <label className="field"><span>Work ends</span><input type="time" value={f.workEnd || ''} onChange={set('workEnd')} /></label>
        </div>
        <div className="row">
          <label className="field"><span>Wake time</span><input type="time" value={f.wakeTime || ''} onChange={set('wakeTime')} /></label>
          <label className="field"><span>Sleep time</span><input type="time" value={f.sleepTime || ''} onChange={set('sleepTime')} /></label>
        </div>
        <label className="field"><span>Location</span><input value={f.location || ''} onChange={set('location')} /></label>
        <label className="field"><span>Instagram</span><input value={f.instagram || ''} onChange={set('instagram')} /></label>
        <label className="field"><span>WhatsApp</span><input value={f.whatsapp || ''} onChange={set('whatsapp')} /></label>
        <button type="button" onClick={save}>Save changes</button>
      </section>

      {msg && <p className="dim small" style={{ textAlign: 'center', marginBottom: 10 }}>{msg}</p>}
      {onSignOut && <button className="ghost" type="button" onClick={onSignOut}>Sign out</button>}
    </div>
  )
}
