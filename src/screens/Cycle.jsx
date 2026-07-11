import { useState } from 'react'
import { cycleInfo, predictions, logPeriodPatch, PHASE_GUIDE, cycleLength } from '../lib/cycle.js'
import { getProfile, saveProfile, getDay, saveDay, todayKey } from '../lib/store.js'

const MOODS = ['😄', '😊', '😐', '😔', '😠', '😰', '🥱', '💪']
const SYMPTOMS = ['Cramps (mild)', 'Cramps (severe)', 'Headache', 'Bloating', 'Back pain',
  'Breast tenderness', 'Fatigue', 'Insomnia', 'Heavy flow', 'Light flow', 'Spotting',
  'Mood swings', 'Cravings', 'Acne breakout', 'Nausea']

export default function Cycle({ profile, onProfileUpdate }) {
  const [p, setP] = useState(profile)
  const [day, setDay] = useState(() => getDay())
  const [openPhase, setOpenPhase] = useState(null)
  const ci = cycleInfo(p)
  const pred = predictions(p)

  function updateDay(patch) {
    const next = { ...day, ...patch }
    setDay(next)
    saveDay(next, todayKey())
  }

  function periodToday() {
    const np = { ...getProfile(), ...logPeriodPatch(getProfile()) }
    saveProfile(np)
    setP(np)
    onProfileUpdate?.(np)
  }

  const history = (p.periodHistory || []).slice(-6).reverse()

  return (
    <div className="screen with-tabbar">
      <h1>🌸 Cycle</h1>

      <section className="card">
        {ci ? (
          <>
            <h2>Day {ci.day} · {PHASE_GUIDE[ci.phase].title}</h2>
            <p className="dim small" style={{ marginBottom: 10 }}>{ci.note}</p>
            {pred && (
              <div className="chips">
                <span className="chip">🗓 Next period ~ {pred.nextPeriod} ({pred.daysToNext}d)</span>
                <span className="chip">🌱 Fertile window ~ {pred.fertileWindow}</span>
                <span className="chip">↔️ Your cycle ≈ {ci.len} days</span>
              </div>
            )}
            {pred && <p className="dim" style={{ fontSize: 11.5, marginTop: 6 }}>{pred.note}</p>}
          </>
        ) : (
          <p className="dim small">Log your first period start and SAP adapts your workouts, diet and care to each phase — and starts predicting the next one.</p>
        )}
        <button className="ghost" type="button" style={{ marginTop: 12 }} onClick={periodToday}>
          🩸 My period started today
        </button>
      </section>

      <section className="card">
        <h2>How are you feeling today?</h2>
        <div className="chips">
          {MOODS.map((m) => (
            <button key={m} type="button" className={'chip chip-add' + (day.mood === m ? ' chip-on' : '')}
              onClick={() => updateDay({ mood: day.mood === m ? '' : m })}>{m}</button>
          ))}
        </div>
        <p className="small" style={{ margin: '10px 0 6px' }}><strong>Symptoms</strong></p>
        <div className="chips">
          {SYMPTOMS.map((sym) => {
            const on = (day.symptoms || []).includes(sym)
            return (
              <button key={sym} type="button" className={'chip chip-add' + (on ? ' chip-on' : '')}
                onClick={() => updateDay({ symptoms: on ? day.symptoms.filter((x) => x !== sym) : [...(day.symptoms || []), sym] })}>
                {sym}
              </button>
            )
          })}
        </div>
        {(day.symptoms || []).includes('Cramps (severe)') && (
          <p className="small no" style={{ marginTop: 10 }}>
            Severe cramps that stop your day aren’t something to just endure — heat + rest today, and it’s worth mentioning to a doctor.
          </p>
        )}
      </section>

      {ci && (
        <section className="card">
          <h2>This phase: {PHASE_GUIDE[ci.phase].title}</h2>
          <p className="small" style={{ marginTop: 6 }}><strong>🍽 Eat more of</strong></p>
          {PHASE_GUIDE[ci.phase].eat.map((x, i) => <p key={i} className="dim small">• {x}</p>)}
          <p className="small" style={{ marginTop: 8 }}><strong>🚫 Go easy on</strong></p>
          {PHASE_GUIDE[ci.phase].avoid.map((x, i) => <p key={i} className="dim small">• {x}</p>)}
          <p className="small" style={{ marginTop: 8 }}><strong>💪 Workout</strong></p>
          <p className="dim small">{PHASE_GUIDE[ci.phase].workout}</p>
          <p className="small" style={{ marginTop: 8 }}><strong>🤍 Relief & care</strong></p>
          {PHASE_GUIDE[ci.phase].relief.map((x, i) => <p key={i} className="dim small">• {x}</p>)}
        </section>
      )}

      <section className="card">
        <h2>All phases guide</h2>
        {Object.entries(PHASE_GUIDE).map(([key, g]) => (
          <div key={key} className="ex-card">
            <div className="ex-head" onClick={() => setOpenPhase(openPhase === key ? null : key)}>
              <div className="ex-name" style={{ flex: 1 }}>{g.title}</div>
              <span className="dim">{openPhase === key ? '▲' : '▼'}</span>
            </div>
            {openPhase === key && (
              <div className="ex-body">
                <p className="small"><strong>Eat:</strong> {g.eat.join(' · ')}</p>
                <p className="small" style={{ marginTop: 6 }}><strong>Avoid:</strong> {g.avoid.join(' · ')}</p>
                <p className="small" style={{ marginTop: 6 }}><strong>Workout:</strong> {g.workout}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {history.length > 0 && (
        <section className="card">
          <h2>Period history</h2>
          {history.map((d) => <p key={d} className="dim small">• Started {d}</p>)}
          <p className="dim small" style={{ marginTop: 6 }}>
            Average cycle from your logs: {cycleLength(p)} days — predictions use this, not a fixed 28.
          </p>
        </section>
      )}

      <p className="dim small" style={{ textAlign: 'center' }}>
        Cycle guidance is general wellness info, not medical advice. Irregular cycles,
        very heavy flow, or severe pain deserve a doctor’s attention.
      </p>
    </div>
  )
}
