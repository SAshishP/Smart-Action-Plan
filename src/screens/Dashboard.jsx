import { useEffect, useMemo, useState } from 'react'
import { getDay, saveDay, todayKey, waterGoal, getProfile, saveProfile } from '../lib/store.js'
import { pullDay } from '../lib/cloud.js'
import { enablePush } from '../lib/push.js'
import { generatePlan, quoteOfTheDay } from '../lib/plan.js'
import { getHistory } from '../lib/history.js'
import { computeGame } from '../lib/game.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function cyclePhase(dayOfCycle) {
  if (dayOfCycle <= 5) return 'Menstrual phase — rest more, iron-rich food.'
  if (dayOfCycle <= 13) return 'Follicular phase — energy rising, good for harder workouts.'
  if (dayOfCycle <= 16) return 'Ovulation — peak energy days.'
  return 'Luteal phase — go gentler, expect cravings, magnesium helps.'
}

export default function Dashboard({ profile, onOpenProfile, onOpenCycle }) {
  const [day, setDay] = useState(() => getDay())
  const [todoText, setTodoText] = useState('')
  const [lastPeriod, setLastPeriod] = useState(profile.lastPeriodStart || '')

  // If today's data already exists in the cloud (e.g. from another phone), merge it in
  useEffect(() => {
    let alive = true
    pullDay(todayKey()).then((cloudDay) => {
      if (alive && cloudDay) {
        setDay((local) => {
          const merged = { ...local, ...cloudDay }
          saveDay(merged, todayKey(), { localOnly: true })
          return merged
        })
      }
    })
    return () => { alive = false }
  }, [])

  const plan = useMemo(() => generatePlan(profile), [profile])
  const goal = waterGoal(profile)
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  function update(patch) {
    const next = { ...day, ...patch }
    setDay(next)
    saveDay(next, todayKey())
  }

  function togglePlan(id) {
    update({ planDone: { ...day.planDone, [id]: !day.planDone[id] } })
  }

  function addTodo() {
    const text = todoText.trim()
    if (!text) return
    update({ todos: [...day.todos, { id: Date.now(), text, done: false }] })
    setTodoText('')
  }

  const cycleDay = lastPeriod
    ? Math.floor((Date.now() - new Date(lastPeriod).getTime()) / 86400000) % 28 + 1
    : null

  const doneCount = plan.filter((p) => day.planDone[p.id]).length
  const num = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0 }

  const [pushMsg, setPushMsg] = useState('')
  const [pushBusy, setPushBusy] = useState(false)
  const [game, setGame] = useState(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    let alive = true
    getHistory(30).then((h) => {
      if (!alive) return
      setGame(computeGame(h, { waterGoal: goal }))
      let st = 0
      for (let i = h.length - 1; i >= 0; i--) {
        if (h[i].logged) st++
        else if (i === h.length - 1) continue
        else break
      }
      setStreak(st)
    })
    return () => { alive = false }
  }, [day])

  async function enableReminders() {
    setPushBusy(true)
    const result = await enablePush()
    setPushMsg(result.message)
    setPushBusy(false)
  }

  return (
    <div className="screen with-tabbar">
      <header className="dash-head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="date">{dateLabel}</div>
          {onOpenProfile && (
            <button type="button" onClick={onOpenProfile} aria-label="Profile"
              style={{ width: 40, height: 40, borderRadius: '50%', padding: 0, overflow: 'hidden', background: 'var(--bg-2)', border: '1.5px solid var(--accent)' }}>
              {profile.photos?.face_front
                ? <img src={profile.photos.face_front} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '👤'}
            </button>
          )}
        </div>
        <h1>{greeting()}, {String(profile.name || '').split(' ')[0]}</h1>
        <span className="badge">{doneCount}/{plan.length} plan items done</span>
        {game && (
          <div className="gamebar">
            <span className="lvl">LV {game.level} · {game.title}</span>
            <div className="xpbar"><i style={{ width: Math.round(game.progress * 100) + '%' }} /></div>
            <span className="dim" style={{ fontSize: 11 }}>{game.toNext} XP → {game.nextTitle}</span>
            {streak > 1 && <span className="chip flame">🔥 {streak}-day streak</span>}
          </div>
        )}
      </header>

      {(profile.photos?.face_front || profile.photos?.body_front) && !profile.analysis && (
        <div className="consent-box" style={{ marginBottom: 14 }}>
          ✨ Analyzing your initial photos — body shape, posture, skin and hair results
          will appear automatically in Fit, Care, Style and your Profile.
        </div>
      )}

      <section className="card">
        <h2>Motivation for today</h2>
        <p className="quote">“{quoteOfTheDay()}”</p>
        {profile.why && <p className="dim small" style={{ marginTop: 8 }}>Your why: {profile.why}</p>}
      </section>

      <section className="card">
        <h2>Your day, morning to night</h2>
        <div className="arc">
          {plan.map((item) => (
            <div
              key={item.id}
              className={'arc-item' + (day.planDone[item.id] ? ' done' : '')}
              onClick={() => togglePlan(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && togglePlan(item.id)}
            >
              <span className="arc-time">{item.time}</span>
              <span>
                <span className="arc-title">{item.title}</span>
                {item.detail && <div className="arc-detail">{item.detail}</div>}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="tracker-grid">
        <div className="tracker">
          <div className="t-label">Water</div>
          <div className="t-value">{day.water}<small> / {goal} glasses</small></div>
          <div className="stepper">
            <button type="button" onClick={() => update({ water: Math.max(0, day.water - 1) })}>−</button>
            <button type="button" onClick={() => update({ water: day.water + 1 })}>＋</button>
          </div>
        </div>

        <div className="tracker">
          <div className="t-label">Steps</div>
          <div className="t-value">{day.steps.toLocaleString()}</div>
          <div className="stepper">
            <button type="button" onClick={() => update({ steps: Math.max(0, day.steps - 500) })}>−500</button>
            <button type="button" onClick={() => update({ steps: day.steps + 500 })}>+500</button>
          </div>
        </div>

        <div className="tracker">
          <div className="t-label">Sleep last night</div>
          <div className="t-value">{day.sleepHours || '—'}<small> hrs</small></div>
          <input
            type="number" inputMode="decimal" min="0" max="24" step="0.5"
            value={day.sleepHours}
            onChange={(e) => update({ sleepHours: e.target.value })}
            placeholder="e.g. 7.5"
          />
        </div>

        <div className="tracker">
          <div className="t-label">Calories in / burned</div>
          <div className="t-value">{day.calsIn}<small> / {day.calsOut} kcal</small></div>
          <div className="row">
            <input type="number" inputMode="numeric" min="0" value={day.calsIn || ''}
              onChange={(e) => update({ calsIn: num(e.target.value) })} placeholder="in" />
            <input type="number" inputMode="numeric" min="0" value={day.calsOut || ''}
              onChange={(e) => update({ calsOut: num(e.target.value) })} placeholder="burn" />
          </div>
        </div>
      </div>

      {profile.gender === 'female' && (
        <section className="card" style={{ marginTop: 14 }}>
          <h2>🌸 Menstrual cycle</h2>
          {cycleDay ? (
            <>
              <p><strong>Day {cycleDay}</strong> of your cycle</p>
              <p className="dim small" style={{ margin: '6px 0 12px' }}>{cyclePhase(cycleDay)}</p>
            </>
          ) : (
            <p className="dim small" style={{ marginBottom: 12 }}>
              Log your period and SAP adapts workouts, diet and care to each phase.
            </p>
          )}
          {onOpenCycle && (
            <button className="ghost" type="button" onClick={onOpenCycle}>
              Open Cycle — log, predictions & phase guide ›
            </button>
          )}
        </section>
      )}

      <section className="card" style={{ marginTop: 14 }}>
        <h2>To-do & reminders</h2>
        {day.todos.length === 0 && (
          <p className="dim small">Nothing here yet — add anything you don’t want to forget.</p>
        )}
        {day.todos.map((t) => (
          <div className="todo-row" key={t.id}>
            <input
              type="checkbox" checked={t.done}
              onChange={() =>
                update({ todos: day.todos.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) })
              }
            />
            <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            <button className="del" type="button" aria-label="Delete"
              onClick={() => update({ todos: day.todos.filter((x) => x.id !== t.id) })}>×</button>
          </div>
        ))}
        <div className="todo-add">
          <input value={todoText} onChange={(e) => setTodoText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()} placeholder="Add a task…" />
          <button type="button" onClick={addTodo}>Add</button>
        </div>
      </section>

      <button className="ghost" type="button" onClick={enableReminders} disabled={pushBusy}>
        {pushBusy ? 'Setting up…' : '🔔 Enable reminders on this phone'}
      </button>
      {pushMsg && (
        <p className="dim small" style={{ marginTop: 8, textAlign: 'center' }}>{pushMsg}</p>
      )}
      <p className="dim small" style={{ marginTop: 10, textAlign: 'center' }}>
        Workout · Diet · Skin & Hair · Style modules unlock in the next update.
      </p>
    </div>
  )
}
