import { useMemo, useState } from 'react'
import Body3D from '../components/Body3D.jsx'
import { buildWorkout, setsRepsFor, estimateCalories, MUSCLE_NAMES } from '../lib/exercises.js'
import { getDay, saveDay, todayKey, getProfile, saveProfile } from '../lib/store.js'
import { askAI, dataUrlToImage } from '../lib/ai.js'
import { compressImage } from '../lib/img.js'
import { uploadProgressPhoto } from '../lib/cloud.js'

export default function Workout({ profile }) {
  const [equip, setEquip] = useState(profile.equipPref || 'home')
  const [openId, setOpenId] = useState(null)
  const [doneIds, setDoneIds] = useState(() => getDay().workoutDone || [])
  const [picked, setPicked] = useState(null)
  const [finishedMsg, setFinishedMsg] = useState('')
  const [progress, setProgress] = useState(profile.progressPhotos || [])
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const plan = useMemo(() => buildWorkout(profile, equip), [profile, equip])
  const openEx = plan.exercises.find((e) => e.id === openId) || null

  function chooseEquip(v) {
    setEquip(v)
    setOpenId(null)
    const p = { ...getProfile(), equipPref: v }
    saveProfile(p)
  }

  function toggleDone(id) {
    const next = doneIds.includes(id) ? doneIds.filter((x) => x !== id) : [...doneIds, id]
    setDoneIds(next)
    const day = getDay()
    saveDay({ ...day, workoutDone: next }, todayKey())
  }

  function finishWorkout() {
    const kcal = estimateCalories(plan.exercises, doneIds, profile.weight)
    if (!kcal) { setFinishedMsg('Check off at least one exercise first 🙂'); return }
    const day = getDay()
    saveDay({ ...day, calsOut: (Number(day.calsOut) || 0) + kcal, workoutDone: [] }, todayKey())
    setDoneIds([])
    setFinishedMsg(`Logged ✅ ~${kcal} kcal added to today's burn (see Home).`)
  }

  async function addProgressPhoto(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImage(file, 640, 0.6)
      const entry = { date: todayKey(), dataUrl }
      const next = [...progress.filter((p) => p.date !== entry.date), entry].slice(-8) // keep last 8
      setProgress(next)
      const p = { ...getProfile(), progressPhotos: next }
      saveProfile(p)
      uploadProgressPhoto(dataUrl, 'body_front', entry.date) // background cloud copy
      setAnalysis('')
    } catch {
      setFinishedMsg('That photo could not be read — try another one.')
    }
  }

  async function analyzeProgress() {
    const initial = profile.photos?.body_front
    const latest = progress[progress.length - 1]?.dataUrl
    if (!latest) { setAnalysis('Add this week’s photo first.'); return }
    setAnalyzing(true)
    setAnalysis('')
    try {
      const images = []
      if (initial) images.push(dataUrlToImage(initial))
      images.push(dataUrlToImage(latest))
      const reply = await askAI({
        profile,
        images,
        messages: [{
          role: 'user',
          text: initial
            ? 'Photo 1 is my starting body photo; photo 2 is this week. Compare them honestly and kindly: visible changes, posture notes, and what my workouts should focus on next based on my goal.'
            : 'This is my current body photo. Give kind, practical observations and what my workouts should focus on next based on my goal.',
        }],
      })
      setAnalysis(reply)
    } catch (err) {
      setAnalysis('⚠️ ' + err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const initialThumb = profile.photos?.body_front
  const latestThumb = progress[progress.length - 1]

  return (
    <div className="screen with-tabbar">
      <h1>Workout</h1>
      <div className="chips">
        {profile.goals && <span className="chip">🎯 {profile.goals}</span>}
        {profile.weight && <span className="chip">⚖️ {profile.weight} kg</span>}
        {profile.bodyType && <span className="chip">🧍 {profile.bodyType}</span>}
      </div>

      {plan.cycle && (
        <div className="consent-box" style={{ marginBottom: 14 }}>
          Day {plan.cycle.day} of your cycle · {plan.cycle.note}
        </div>
      )}

      <div className="seg">
        {[['home', '🏠 Home'], ['db', '🏋️ Dumbbells'], ['gym', '💪 Gym']].map(([v, label]) => (
          <button key={v} type="button" className={equip === v ? 'active' : ''} onClick={() => chooseEquip(v)}>
            {label}
          </button>
        ))}
      </div>

      <section className="card">
        <h2>{plan.title}</h2>
        <p className="small"><strong style={{ color: 'var(--accent)' }}>Focus:</strong> {plan.focus}</p>
        <p className="small dim" style={{ marginTop: 4 }}><strong>Avoid:</strong> {plan.avoid}</p>
      </section>

      <section className="card">
        <h2>Target muscles</h2>
        <Body3D
          primary={openEx ? openEx.primary : []}
          secondary={openEx ? openEx.secondary : []}
          onPick={(id) => setPicked(id)}
        />
        <div className="legend">
          <span><i style={{ background: '#ff6b81' }} /> Primary</span>
          <span><i style={{ background: '#ffd166' }} /> Secondary</span>
          <span className="dim">{openEx ? openEx.name : picked ? MUSCLE_NAMES[picked] : 'Tap an exercise below'}</span>
        </div>
      </section>

      <section className="card">
        <h2>Today's exercises</h2>
        {plan.exercises.map((ex) => (
          <div key={ex.id} className="ex-card">
            <div className="ex-head" onClick={() => setOpenId(openId === ex.id ? null : ex.id)}>
              <input
                type="checkbox"
                checked={doneIds.includes(ex.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleDone(ex.id)}
                aria-label={'done ' + ex.name}
              />
              <div style={{ flex: 1 }}>
                <div className="ex-name">{ex.name}</div>
                <div className="dim small">{setsRepsFor(plan.goal, ex.primary[0] === 'cardio')} · {ex.primary.map((m) => MUSCLE_NAMES[m]).join(', ')}</div>
              </div>
              <span className="dim">{openId === ex.id ? '▲' : '▼'}</span>
            </div>
            {openId === ex.id && (
              <div className="ex-body">
                <p className="small"><strong>How to do it</strong></p>
                <ol className="small">{ex.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                {ex.dos.length > 0 && <p className="small ok">✓ {ex.dos.join(' ')}</p>}
                {ex.donts.length > 0 && <p className="small no">✗ {ex.donts.join(' ')}</p>}
                <a
                  className="small" style={{ color: 'var(--accent)' }}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' proper form short')}`}
                  target="_blank" rel="noreferrer"
                >▶ Watch a form video</a>
              </div>
            )}
          </div>
        ))}
        <button type="button" style={{ marginTop: 12 }} onClick={finishWorkout}>Finish workout & log calories</button>
        {finishedMsg && <p className="dim small" style={{ marginTop: 8, textAlign: 'center' }}>{finishedMsg}</p>}
      </section>

      <section className="card">
        <h2>Progress photos</h2>
        <div className="compare">
          <div className="compare-slot">
            {initialThumb ? <img src={initialThumb} alt="start" /> : <span className="dim small">No starting photo</span>}
            <span className="dim small">Start</span>
          </div>
          <div className="compare-slot">
            {latestThumb ? <img src={latestThumb.dataUrl} alt="latest" /> : <span className="dim small">Add this week's</span>}
            <span className="dim small">{latestThumb ? latestThumb.date : 'Latest'}</span>
          </div>
        </div>
        <label className="photo-add">
          📸 Add this week's photo (front, same pose & light)
          <input type="file" accept="image/*" onChange={addProgressPhoto} />
        </label>
        <button className="ghost" type="button" onClick={analyzeProgress} disabled={analyzing}>
          {analyzing ? 'Analyzing…' : '✨ Analyze my progress'}
        </button>
        {analysis && <div className="analysis small">{analysis}</div>}
      </section>
    </div>
  )
}
