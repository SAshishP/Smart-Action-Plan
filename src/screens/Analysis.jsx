import { useEffect, useState } from 'react'
import MiniChart from '../components/MiniChart.jsx'
import { getHistory } from '../lib/history.js'
import { computeStats, insights, affirmationOfTheDay } from '../lib/analytics.js'
import { waterGoal, getProfile, saveProfile } from '../lib/store.js'
import { calorieTarget } from '../lib/nutrition.js'
import { askAI } from '../lib/ai.js'
import { getDay, saveDay, todayKey } from '../lib/store.js'
import { computeGame, earnedBadges } from '../lib/game.js'

export default function Analysis({ profile }) {
  const [p, setP] = useState(profile)
  const [range, setRange] = useState(7)
  const [history, setHistory] = useState(null) // last 30, oldest first
  const [why, setWhy] = useState(profile.why || '')
  const [whySaved, setWhySaved] = useState(false)
  const [review, setReview] = useState('')
  const [reviewBusy, setReviewBusy] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightMsg, setWeightMsg] = useState('')

  function logWeight() {
    const kg = parseFloat(weightInput)
    if (!kg || kg < 20 || kg > 400) { setWeightMsg('Enter a weight in kg (e.g. 72.4).'); return }
    const d = getDay()
    saveDay({ ...d, weightKg: kg }, todayKey())
    setWeightMsg(`Logged ${kg} kg for today ✓`)
    setWeightInput('')
    getHistory(30).then(setHistory)
  }

  useEffect(() => {
    let alive = true
    getHistory(30).then((h) => { if (alive) setHistory(h) })
    return () => { alive = false }
  }, [])

  const wGoal = waterGoal(p)
  const calTarget = calorieTarget(p)
  const series = history ? history.slice(-range) : []
  const stats = history ? computeStats(history.slice(-range)) : null
  const tips = history ? insights(history.slice(-range), { waterGoal: wGoal, calTarget }) : []

  function saveWhy() {
    const np = { ...getProfile(), why: why.trim() }
    saveProfile(np)
    setP(np)
    setWhySaved(true)
    setTimeout(() => setWhySaved(false), 2000)
  }

  async function aiReview() {
    if (!history) return
    setReviewBusy(true); setReview('')
    try {
      const s = computeStats(history)
      const summary =
        `Last 30 days: logged ${s.daysLogged} days, current streak ${s.streak}. ` +
        `Averages — water ${s.avgWater}/${wGoal} glasses, sleep ${s.avgSleep}h, steps ${s.avgSteps}. ` +
        `Total burned ${s.totalBurn} kcal. Calorie target ${calTarget}. My why: "${p.why || 'not written yet'}".`
      const reply = await askAI({
        profile: p,
        messages: [{
          role: 'user',
          text: `Here is my last-30-days summary from my tracking app: ${summary} Give me an honest, encouraging monthly review: what's working, the one thing to fix first, and a concrete focus for next week. Short paragraphs.`,
        }],
      })
      setReview(reply)
    } catch (e) {
      setReview('⚠️ ' + e.message)
    } finally {
      setReviewBusy(false)
    }
  }

  const chart = (key, key2) => series.map((d) => ({ label: d.label, value: d[key], value2: key2 ? d[key2] : undefined }))
  const bodyStrip = [
    ...(p.photos?.body_front ? [{ date: 'Start', dataUrl: p.photos.body_front }] : []),
    ...(p.progressPhotos || []),
  ]
  const faceStrip = [
    ...(p.photos?.face_front ? [{ date: 'Start', dataUrl: p.photos.face_front }] : []),
    ...(p.facePhotos || []),
  ]
  const hairStrip = [
    ...(p.photos?.hair_front ? [{ date: 'Start', dataUrl: p.photos.hair_front }] : []),
    ...(p.hairPhotos || []),
  ]
  const Strip = ({ label, items }) => items.length === 0 ? null : (
    <div>
      <p className="dim small" style={{ marginTop: 10 }}>{label} — {items.length} photo{items.length > 1 ? 's' : ''}</p>
      <div className="strip">
        {items.map((x, i) => (
          <figure key={label + i}><img src={x.dataUrl} alt={x.date} /><figcaption className="dim small">{x.date}</figcaption></figure>
        ))}
      </div>
    </div>
  )

  return (
    <div className="screen with-tabbar">
      <h1>Analysis</h1>

      <section className="card">
        <h2>🎯 Why are you doing this?</h2>
        <p className="dim small" style={{ marginBottom: 8 }}>
          Write it once. On the hard days, this is what the app will remind you of.
        </p>
        <textarea rows="2" value={why} onChange={(e) => setWhy(e.target.value)}
          placeholder="e.g. To feel strong at my sister's wedding. To fix my sleep. For me." />
        <button className="mini" type="button" style={{ marginTop: 8 }} onClick={saveWhy}>
          {whySaved ? 'Saved ✓' : 'Save my why'}
        </button>
        <div className="analysis small" style={{ marginTop: 12 }}>
          {affirmationOfTheDay(p.name)}
        </div>
      </section>

      {!history ? (
        <section className="card"><p className="dim small">Loading your data…</p></section>
      ) : (
        <>
          <div className="seg">
            {[[7, 'Last 7 days'], [30, 'Last 30 days']].map(([v, label]) => (
              <button key={v} type="button" className={range === v ? 'active' : ''} onClick={() => setRange(v)}>
                {label}
              </button>
            ))}
          </div>

          <div className="chips">
            <span className="chip">🔥 {stats.streak}-day streak</span>
            <span className="chip">📅 {stats.daysLogged}/{range} logged</span>
            {stats.avgSleep > 0 && <span className="chip">😴 {stats.avgSleep}h avg</span>}
          </div>

          <section className="card">
            <h2>💧 Water <span className="dim small">avg {stats.avgWater} glasses</span></h2>
            <MiniChart data={chart('water')} goal={wGoal} />
          </section>

          <section className="card">
            <h2>👣 Steps <span className="dim small">avg {stats.avgSteps.toLocaleString()}</span></h2>
            <MiniChart data={chart('steps')} />
          </section>

          <section className="card">
            <h2>😴 Sleep</h2>
            <MiniChart data={chart('sleep')} goal={8} unit="h" />
          </section>

          <section className="card">
            <h2>🔥 Calories in vs burned</h2>
            <MiniChart data={chart('calsIn', 'calsOut')} goal={calTarget} label2="Burned" />
          </section>

          <section className="card">
            <h2>✅ Daily-plan items done</h2>
            <MiniChart data={chart('planDone')} />
          </section>

          <section className="card">
            <h2>⚖️ Weight {stats.lastWeight ? <span className="dim small">now {stats.lastWeight} kg</span> : null}</h2>
            {series.some((d) => d.weightKg > 0) && (
              <MiniChart data={series.filter((d) => d.weightKg > 0).map((d) => ({ label: d.label, value: d.weightKg }))} unit="kg" />
            )}
            <div className="todo-add">
              <input type="number" inputMode="decimal" step="0.1" value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && logWeight()}
                placeholder="Today's weight (kg)" />
              <button type="button" onClick={logWeight}>Log</button>
            </div>
            {weightMsg && <p className="dim small" style={{ marginTop: 8 }}>{weightMsg}</p>}
            <p className="dim small" style={{ marginTop: 8 }}>Weigh in 1–2× a week, same time of day. Trends beat daily noise.</p>
          </section>

          <section className="card">
            <h2>🏅 Badges</h2>
            <div className="badge-grid">
              {earnedBadges(history.slice(-30), p, { waterGoal: wGoal }, stats).map((b) => (
                <div key={b.id} className={'badge-tile' + (b.earned ? ' earned' : '')} title={b.how}>
                  <span className="be">{b.emoji}</span>
                  <span className="bn">{b.name}</span>
                  <span className="bh dim">{b.how}</span>
                </div>
              ))}
            </div>
            {(() => { const g = computeGame(history, { waterGoal: wGoal }); return (
              <p className="small" style={{ marginTop: 10 }}>
                Total <strong>{g.xp.toLocaleString()} XP</strong> · Level {g.level} <strong>{g.title}</strong> — {g.toNext} XP to {g.nextTitle}.
              </p>
            ) })()}
          </section>

          <section className="card">
            <h2>🔍 Cross-module insights</h2>
            {tips.map((t, i) => <p key={i} className="dim small" style={{ marginBottom: 8 }}>• {t}</p>)}
            <button className="ghost" type="button" onClick={aiReview} disabled={reviewBusy}>
              {reviewBusy ? 'Reviewing your month…' : '✨ AI review of my month'}
            </button>
            {review && <div className="analysis small">{review}</div>}
          </section>

          <section className="card">
            <h2>📸 Photo comparison</h2>
            <p className="dim small" style={{ marginBottom: 10 }}>
              Your photos stay tucked away — reveal them only when you want to compare.
              Start photo first, then every weekly photo in order.
            </p>
            <button type="button" onClick={() => setShowPhotos(!showPhotos)}>
              {showPhotos ? 'Hide the photos' : '📸 Compare my photos'}
            </button>
            {showPhotos && (
              <div style={{ marginTop: 6 }}>
                <Strip label="💪 Body" items={bodyStrip} />
                <Strip label="🙂 Face & skin" items={faceStrip} />
                <Strip label="💇 Hair" items={hairStrip} />
                {bodyStrip.length + faceStrip.length + hairStrip.length === 0 && (
                  <p className="dim small" style={{ marginTop: 10 }}>
                    No photos yet — add weekly photos in 💪 Fit and 🧴 Care and they collect here.
                  </p>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
