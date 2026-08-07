import { useState } from 'react'
import { getProfile, saveProfile, ageFromDob } from '../lib/store.js'
import { compressImage, compressFor } from '../lib/img.js'
import { checkPhoto } from '../lib/photo-quality.js'
import { guideFor, GLOBAL_RULES } from '../lib/photoguide.js'
import { uploadProgressPhoto } from '../lib/cloud.js'
import { runInitialAnalysis } from '../lib/analysis.js'
import { pickableConditions } from '../lib/conditions.js'
import { withMeasurementSnapshot } from '../lib/body.js'
import { getMode, setMode, resolveMode, MODES, MODE_LABELS } from '../lib/mode.js'

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
  const [quality, setQuality] = useState({})
  const [openGuide, setOpenGuide] = useState(null)
  const [showRules, setShowRules] = useState(false)
  const [mode, setModeState] = useState(getMode)

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
    // Measurements saved here count towards the trend in 📐 Body exactly like
    // ones saved there — same helper, so the two can never drift apart.
    apply(withMeasurementSnapshot(getProfile(), fields), 'Profile saved ✓ — plans update instantly.')
  }

  function toggleCondition(key) {
    const cur = new Set(getProfile().conditions || [])
    cur.has(key) ? cur.delete(key) : cur.add(key)
    const next = [...cur]
    setF((o) => ({ ...o, conditions: next }))
    apply({ conditions: next }, 'Conditions updated ✓ — targets, meals and workouts just adapted.')
  }

  async function replacePhoto(slot, e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      // Measure the original before we compress it — a warning about a blurry
      // or badly lit photo is worth far more than the analysis it would
      // otherwise produce. This never blocks the upload.
      const q = await checkPhoto(file, slot)
      const c = compressFor(slot)
      const dataUrl = await compressImage(file, c.maxSide, c.quality)
      apply({
        photos: { ...(getProfile().photos || {}), [slot]: dataUrl },
        photoQuality: { ...(getProfile().photoQuality || {}), [slot]: { level: q.level, flags: q.flags, at: new Date().toISOString().slice(0, 10) } },
      }, `${slot.replace('_', ' ')} updated ✓`)
      setQuality((old) => ({ ...old, [slot]: q }))
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
            {a.concerns?.length > 0 && <p className="small" style={{ marginTop: 4 }}><strong>Also noted:</strong> {a.concerns.join(', ')} <span className="dim">(full protocols in 📐 Body)</span></p>}
            {a.stretchMarks && <p className="small" style={{ marginTop: 4 }}><strong>Stretch marks:</strong> {a.stretchMarks.stage}{a.stretchMarks.areas.length ? ` — ${a.stretchMarks.areas.join(', ')}` : ''}</p>}
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
        <h2>🎨 Appearance</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Your choice, saved on this device — so your phone and your laptop can
          differ if you want them to.
        </p>
        <div className="seg">
          {MODES.map((m) => {
            const meta = MODE_LABELS[m]
            return (
              <button key={m} type="button"
                className={mode === m ? 'active' : ''}
                onClick={() => { setMode(m); setModeState(m) }}>
                <span style={{ display: 'block', fontSize: 18, lineHeight: 1.4 }}>{meta.icon}</span>
                {meta.label}
              </button>
            )
          })}
        </div>
        <p className="dim" style={{ fontSize: 11.5 }}>
          {MODE_LABELS[mode].hint}
          {mode === 'system' && ` — currently ${resolveMode('system')}.`}
        </p>
      </section>

      <section className="card">
        <h2>🩺 Health conditions</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Tap any that apply. These change your calorie and protein targets, filter unsafe
          exercises out of your plans, and keep your goal timeline honest.
        </p>
        <div>
          {pickableConditions(p).map((c) => {
            const on = (p.conditions || []).includes(c.key)
            return (
              <button key={c.key} type="button"
                className={'chip chip-add' + (on ? ' chip-on' : '')}
                style={on ? undefined : { background: 'var(--card)', color: 'var(--text-dim)', borderColor: 'var(--line)' }}
                onClick={() => toggleCondition(c.key)}>
                {on ? '✓' : '＋'} {c.icon} {c.name}
              </button>
            )
          })}
        </div>
        <p className="dim" style={{ fontSize: 11.5, marginTop: 10 }}>
          Full guidance for each one — food, training, what to expect, when to see a doctor — is in 📐 Body.
        </p>
      </section>

      <section className="card">
        <h2>📸 Initial photos <span className="dim small">tap to retake / replace</span></h2>
        <p className="dim small" style={{ marginBottom: 8 }}>
          The photo decides how good the analysis can be. Overhead light alone reads as under-eye
          shadows and a slack jawline that are not there — daylight from a window in front of you
          fixes almost everything.
        </p>
        <button className="ghost" type="button" style={{ marginBottom: 10 }}
          onClick={() => setShowRules(!showRules)}>
          {showRules ? 'Close' : '📖 How to take these properly'}
        </button>
        {showRules && (
          <div style={{ marginBottom: 12 }}>
            {GLOBAL_RULES.map((r, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <p className="small" style={{ marginBottom: 2 }}>• {r.rule}</p>
                <p className="dim" style={{ fontSize: 11.5, marginLeft: 10 }}>{r.why}</p>
              </div>
            ))}
          </div>
        )}

        <div className="photo-grid">
          {PHOTO_SLOTS.map(([slot, label]) => {
            const q = quality[slot] || p.photoQuality?.[slot]
            const dot = q?.level === 'poor' ? 'var(--bad)' : q?.level === 'soft' ? 'var(--warn)' : q?.level === 'good' ? 'var(--good)' : null
            return (
              <div className="photo-slot" key={slot}>
                {p.photos?.[slot] ? <img src={p.photos[slot]} alt={label} /> : <span>{label}<br />＋</span>}
                {dot && <i className="photo-quality-dot" style={{ background: dot }} title={q.level} />}
                <div className="photo-slot-actions">
                  <label className="photo-slot-btn" aria-label={`Take photo — ${label}`}>
                    📷
                    <input type="file" accept="image/*" capture={slot.startsWith('face') ? 'user' : 'environment'}
                      onChange={(e) => replacePhoto(slot, e)} />
                  </label>
                  <label className="photo-slot-btn" aria-label={`Choose from gallery — ${label}`}>
                    🖼
                    <input type="file" accept="image/*" onChange={(e) => replacePhoto(slot, e)} />
                  </label>
                  <button type="button" className="photo-slot-btn" aria-label={`How to shoot ${label}`}
                    onClick={() => setOpenGuide(openGuide === slot ? null : slot)}>ⓘ</button>
                </div>
              </div>
            )
          })}
        </div>

        {openGuide && guideFor(openGuide) && (() => {
          const g = guideFor(openGuide)
          return (
            <div className="consent-box" style={{ marginTop: 12 }}>
              <p className="small" style={{ marginBottom: 6 }}><strong>{g.icon} {g.label}</strong></p>
              <p className="small" style={{ marginBottom: 4 }}><strong>Framing.</strong> {g.framing}</p>
              <p className="small" style={{ marginBottom: 4 }}><strong>Distance.</strong> {g.distance}</p>
              <p className="small" style={{ marginBottom: 4 }}><strong>Angle.</strong> {g.angle}</p>
              <p className="small" style={{ marginBottom: 6 }}><strong>Wear.</strong> {g.clothing}</p>
              {g.tips.map((t, i) => <p key={i} className="dim small" style={{ marginBottom: 3 }}>• {t}</p>)}
              <p className="small no" style={{ marginTop: 6 }}>✗ <strong>Most common mistake.</strong> {g.commonMistake}</p>
            </div>
          )
        })()}

        {/* Whatever the check found on the photo just taken. Advice, never a
            block — the user can always keep the photo they have. */}
        {Object.entries(quality).filter(([, q]) => q?.issues?.length).map(([slot, q]) => (
          <div key={slot} className="consent-box" style={{ marginTop: 10 }}>
            <p className="small" style={{ marginBottom: 4 }}>
              <strong>{slot.replace('_', ' ')}</strong> — {q.level === 'poor' ? 'worth retaking' : 'usable, could be better'}
            </p>
            {q.issues.map((it, i) => (
              <p key={i} className="small" style={{ marginBottom: 4 }}>
                • {it.title} <span className="dim">{it.fix}</span>
              </p>
            ))}
            <button className="mini ghost" type="button"
              onClick={() => setQuality((old) => { const n = { ...old }; delete n[slot]; return n })}>
              Keep this photo
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>✏️ Details</h2>
        <label className="field"><span>Name</span><input value={f.name || ''} onChange={set('name')} /></label>
        <div className="row">
          <label className="field"><span>Height (cm)</span><input type="number" inputMode="numeric" value={f.height || ''} onChange={set('height')} /></label>
          <label className="field"><span>Weight (kg)</span><input type="number" inputMode="numeric" value={f.weight || ''} onChange={set('weight')} /></label>
        </div>
        <label className="field"><span>Target weight (kg) — powers your goal timeline</span>
          <input type="number" inputMode="decimal" step="0.5" value={f.targetWeight || ''} onChange={set('targetWeight')} /></label>
        <p className="dim small" style={{ margin: '4px 0 8px' }}>
          Measurements (cm) — neck + waist{p.gender === 'female' ? ' + hips' : ''} unlock the accurate
          body fat % in 📐 Body.
        </p>
        <div className="row">
          <label className="field"><span>Neck</span>
            <input type="number" inputMode="decimal" value={f.neck || ''} onChange={set('neck')} /></label>
          <label className="field"><span>Chest</span>
            <input type="number" inputMode="decimal" value={f.chest || ''} onChange={set('chest')} /></label>
        </div>
        <div className="row">
          <label className="field"><span>Waist</span>
            <input type="number" inputMode="decimal" value={f.waist || ''} onChange={set('waist')} /></label>
          <label className="field"><span>Hips</span>
            <input type="number" inputMode="decimal" value={f.hips || ''} onChange={set('hips')} /></label>
        </div>
        <div className="row">
          <label className="field"><span>Thigh</span>
            <input type="number" inputMode="decimal" value={f.thigh || ''} onChange={set('thigh')} /></label>
          <label className="field"><span>Arm</span>
            <input type="number" inputMode="decimal" value={f.arm || ''} onChange={set('arm')} /></label>
        </div>
        <label className="field"><span>Goals</span><textarea rows="2" value={f.goals || ''} onChange={set('goals')} /></label>
        <label className="field"><span>Diet type</span>
          <select value={f.dietType || ''} onChange={set('dietType')}>
            {['', 'Vegetarian', 'Non-vegetarian', 'Eggetarian', 'Vegan', 'Keto', 'No specific diet'].map((d) => <option key={d} value={d}>{d || 'Select…'}</option>)}
          </select></label>
        <label className="field"><span>Allergies</span><textarea rows="2" value={f.allergies || ''} onChange={set('allergies')} /></label>
        <label className="field"><span>Other health conditions, in your own words</span>
          <textarea rows="2" value={f.medicalConditions || ''} onChange={set('medicalConditions')} /></label>
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
