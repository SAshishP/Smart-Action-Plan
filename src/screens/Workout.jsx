import { useMemo, useState } from 'react'
import Body3D from '../components/Body3D.jsx'
import { buildWorkout, withAnalysisFocus, generateWeek, setsRepsFor, estimateCalories, MUSCLE_NAMES, WARMUP, COOLDOWN } from '../lib/exercises.js'
import { PRE_WORKOUT, POST_WORKOUT, filterSafe } from '../lib/recipes.js'
import { POSTURE_FIXES, matchKeys } from '../lib/corrections.js'
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

  const plan = useMemo(() => withAnalysisFocus(buildWorkout(profile, equip), profile), [profile, equip])
  const week = useMemo(() => generateWeek(profile, equip), [profile, equip])
  const [openDay, setOpenDay] = useState(null)
  const [openFix, setOpenFix] = useState(null)
  const postureKeys = matchKeys(profile.analysis?.posture, POSTURE_FIXES)
  const dayIdxRot = Math.floor(Date.now() / 86400000)
  const pick2 = (list) => { const safe = filterSafe(list, profile); return safe.length ? [safe[dayIdxRot % safe.length], safe[(dayIdxRot + 1) % safe.length]].filter((x, i, a) => a.indexOf(x) === i) : [] }
  const preMeals = pick2(PRE_WORKOUT)
  const postMeals = pick2(POST_WORKOUT)

  function logSnack(sn) {
    const d = getDay()
    saveDay({ ...d, meals: [...(d.meals || []), { id: Date.now(), name: sn.name, kcal: sn.kcal }], calsIn: (Number(d.calsIn) || 0) + sn.kcal }, todayKey())
    setFinishedMsg(`Logged ${sn.name} ✓ (+${sn.kcal} kcal on Home)`)
  }
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
      doAnalyze(dataUrl) // auto-analysis on every new progress photo
    } catch {
      setFinishedMsg('That photo could not be read — try another one.')
    }
  }

  const analyzeProgress = () => doAnalyze(progress[progress.length - 1]?.dataUrl)

  async function doAnalyze(latest) {
    const initial = profile.photos?.body_front
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
          gender={profile.gender}
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
        <h2>🔥 Warm-up first (5 min)</h2>
        {WARMUP.map((w, i) => (
          <p key={i} className="small" style={{ marginBottom: 6 }}><strong>{w.name}:</strong> <span className="dim">{w.how}</span></p>
        ))}
      </section>

      {postureKeys.length > 0 && (
        <section className="card">
          <h2>🧍 Posture corrections <span className="dim small">from your photo analysis</span></h2>
          {postureKeys.map((k) => {
            const fx = POSTURE_FIXES[k]
            const open = openFix === k
            return (
              <div key={k} className="ex-card">
                <div className="ex-head" onClick={() => setOpenFix(open ? null : k)}>
                  <div style={{ flex: 1 }}>
                    <div className="ex-name">{fx.icon} {fx.name}</div>
                    <div className="dim small">{fx.why}</div>
                  </div>
                  <span className="dim">{open ? '▲' : '▼'}</span>
                </div>
                {open && (
                  <div className="ex-body">
                    <ol className="small">{fx.steps.map((st, i) => <li key={i}>{st}</li>)}</ol>
                    <p className="small no">✗ {fx.avoid}</p>
                    <p className="dim" style={{ fontSize: 11.5 }}>Do these daily — posture changes in weeks, not days. Pain (not effort) means stop and see a physio.</p>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      )}

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
        <h2>🧊 Cool-down after (5 min)</h2>
        {COOLDOWN.map((w, i) => (
          <p key={i} className="small" style={{ marginBottom: 6 }}><strong>{w.name}:</strong> <span className="dim">{w.how}</span></p>
        ))}
      </section>

      <section className="card">
        <h2>🍌 Fuel: pre & post workout</h2>
        <p className="small" style={{ marginBottom: 6 }}><strong>Before</strong></p>
        {preMeals.map((sn) => (
          <div key={'pre' + sn.name} className="todo-row">
            <div style={{ flex: 1 }}>
              <span>{sn.name}</span>
              <div className="dim small">{sn.when} · {sn.why}</div>
            </div>
            <button className="mini" type="button" onClick={() => logSnack(sn)}>+{sn.kcal}</button>
          </div>
        ))}
        <p className="small" style={{ margin: '10px 0 6px' }}><strong>After</strong></p>
        {postMeals.map((sn) => (
          <div key={'post' + sn.name} className="todo-row">
            <div style={{ flex: 1 }}>
              <span>{sn.name}</span>
              <div className="dim small">{sn.when} · {sn.why}</div>
            </div>
            <button className="mini" type="button" onClick={() => logSnack(sn)}>+{sn.kcal}</button>
          </div>
        ))}
        <p className="dim" style={{ fontSize: 11.5, marginTop: 8 }}>Filtered for your diet type and allergies automatically.</p>
      </section>

      <section className="card">
        <h2>📅 Your week</h2>
        {week.map((d) => (
          <div key={d.offset} className="ex-card">
            <div className="ex-head" onClick={() => setOpenDay(openDay === d.offset ? null : d.offset)}>
              <div style={{ flex: 1 }}>
                <div className="ex-name">{d.isToday ? '➡️ ' : ''}{d.dayName} {d.dateLabel} — {d.plan.title}</div>
                {d.plan.cycle && <div className="dim small">Cycle day {d.plan.cycle.day} · {d.plan.cycle.phase}</div>}
              </div>
              <span className="dim">{openDay === d.offset ? '▲' : '▼'}</span>
            </div>
            {openDay === d.offset && (
              <div className="ex-body">
                <p className="small dim">{d.plan.focus}</p>
                <p className="small" style={{ marginTop: 6 }}>
                  {d.plan.exercises.map((ex) => ex.name).join(' · ')}
                </p>
              </div>
            )}
          </div>
        ))}
        <p className="dim" style={{ fontSize: 11.5, marginTop: 8 }}>Built from your goal, equipment{profile.gender === 'female' ? ', cycle phase per day' : ''} and photo analysis. Open any day to preview it.</p>
      </section>

      <section className="card">
        <h2>📸 Weekly progress photo</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Add one photo a week (same pose, same light). It’s analyzed against your
          starting point automatically — view all photos side-by-side anytime in
          📊 Stats → Compare my photos.
        </p>
        <label className="photo-add">
          📷 Add this week's photo
          <input type="file" accept="image/*" onChange={addProgressPhoto} />
        </label>
        {latestThumb && <p className="dim small">Last added: {latestThumb.date} · {progress.length} photo{progress.length > 1 ? 's' : ''} tracked</p>}
        {progress.length > 0 && !analyzing && (
          <button className="mini ghost" type="button" onClick={analyzeProgress}>🔁 Re-run analysis</button>
        )}
        {analyzing && <p className="dim small">✨ Analyzing your progress…</p>}
        {analysis && <div className="analysis small">{analysis}</div>}
      </section>
    </div>
  )
}
