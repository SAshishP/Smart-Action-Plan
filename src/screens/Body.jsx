import { useEffect, useMemo, useState } from 'react'
import { bodyMetrics, forecast, completeness, withMeasurementSnapshot, measurementTrend } from '../lib/body.js'
import { fatMap, regionProtocol } from '../lib/fatmap.js'
import { activeConcerns, otherConcerns } from '../lib/concerns.js'
import {
  activeConditions, suggestedConditions, pickableConditions,
  dietGuidance, workoutGuidance,
} from '../lib/conditions.js'
import { byId as EX_BY_ID, blockedExercises } from '../lib/exercises.js'
import { calorieTarget, proteinTarget, targetExplained } from '../lib/nutrition.js'
import { getProfile, saveProfile } from '../lib/store.js'
import { getHistory } from '../lib/history.js'
import { runBodyScan } from '../lib/analysis.js'
import { runDeepScan, GROUPS, findingsOf, scanConfidence, UnsuitableImage } from '../lib/deepscan.js'
import { protocolsFor, getSkinProtocol, TEXT_ONLY_PROTOCOLS } from '../lib/skinprotocols.js'

const TONE = { good: '#7ee2b8', warn: '#ffb454', bad: '#ff6b81', neutral: 'var(--text-dim)' }

// A labelled meter. Used for BMI, body fat, every ratio and every fat region,
// so the whole report reads as one instrument rather than six.
function Meter({ label, value, pct, tone = 'neutral', note }) {
  return (
    <div>
      <div className="attr-head">
        <span className="attr-label">{label}</span>
        <span className="attr-val" style={{ color: TONE[tone] }}>{value}</span>
      </div>
      <div className="progressbar attr-bar">
        <i style={{ width: Math.min(100, Math.max(2, pct || 0)) + '%', background: TONE[tone] }} />
      </div>
      {note && <p className="dim small attr-note">{note}</p>}
    </div>
  )
}

function Collapse({ title, sub, children, open, onToggle }) {
  return (
    <div className="ex-card">
      <div className="ex-head" onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <div className="ex-name">{title}</div>
          {sub && <div className="dim small">{sub}</div>}
        </div>
        <span className="dim">{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="ex-body">{children}</div>}
    </div>
  )
}

export default function Body({ profile, onBack, onOpenProfile, onProfileUpdate }) {
  const [p, setP] = useState(profile)
  const [history, setHistory] = useState(null)
  const [msg, setMsg] = useState('')
  const [openRegion, setOpenRegion] = useState(null)
  const [openConcern, setOpenConcern] = useState(null)
  const [openCondition, setOpenCondition] = useState(null)
  const [scanBusy, setScanBusy] = useState(false)
  const [deepBusy, setDeepBusy] = useState(false)
  const [openGroup, setOpenGroup] = useState(null)
  const [openProto, setOpenProto] = useState(null)
  const [showTextOnly, setShowTextOnly] = useState(false)
  const [showAddConcern, setShowAddConcern] = useState(false)
  const [m, setM] = useState({
    neck: profile.neck || '', chest: profile.chest || '', waist: profile.waist || '',
    hips: profile.hips || '', thigh: profile.thigh || '', arm: profile.arm || '',
  })
  const [targetInput, setTargetInput] = useState(profile.targetWeight || '')

  useEffect(() => {
    let alive = true
    getHistory(30).then((h) => { if (alive) setHistory(h) })
    return () => { alive = false }
  }, [])

  const metrics = useMemo(() => bodyMetrics(p), [p])
  const map = useMemo(() => fatMap(p, metrics), [p, metrics])
  const fc = useMemo(() => forecast(p, history || [], metrics), [p, history, metrics])
  const concerns = useMemo(() => activeConcerns(p), [p])
  const conditions = useMemo(() => activeConditions(p), [p])
  const suggested = useMemo(() => suggestedConditions(p), [p])
  const diet = useMemo(() => dietGuidance(p), [p])
  const work = useMemo(() => workoutGuidance(p), [p])
  const blocked = useMemo(() => blockedExercises(p), [p])
  const trend = useMemo(() => measurementTrend(p), [p])
  const deep = p.deepScan || null
  const deepConf = useMemo(() => (deep ? scanConfidence(deep) : { pct: 0, rated: 0, total: 0 }), [deep])
  const deepProtocols = useMemo(() => (deep ? protocolsFor(findingsOf(deep)) : []), [deep])
  const comp = completeness(p)

  function apply(patch, note) {
    const np = { ...getProfile(), ...patch }
    saveProfile(np)
    setP(np)
    onProfileUpdate?.(np)
    if (note) setMsg(note)
  }

  function saveMeasurements() {
    const patch = {}
    for (const [k, v] of Object.entries(m)) {
      const n = parseFloat(v)
      patch[k] = Number.isFinite(n) && n > 0 ? n : ''
    }
    // Keep a dated snapshot so the tape becomes a trend, not just a number.
    // The snapshot logic lives in body.js so Profile saves the same way.
    apply(withMeasurementSnapshot(getProfile(), patch),
      'Measurements saved ✓ — your body fat % just got more accurate.')
  }

  function saveTarget() {
    const kg = parseFloat(targetInput)
    if (!kg || kg < 25 || kg > 350) { setMsg('Enter a target weight in kg.'); return }
    apply({ targetWeight: kg }, `Target set to ${kg} kg ✓`)
  }

  function toggleCondition(key) {
    const cur = new Set(getProfile().conditions || [])
    cur.has(key) ? cur.delete(key) : cur.add(key)
    apply({ conditions: [...cur] }, 'Updated ✓ — your diet, workouts and targets just adapted.')
  }

  function addConcern(key) {
    const cur = new Set(getProfile().concerns || [])
    cur.add(key)
    apply({ concerns: [...cur] }, 'Added ✓')
    setShowAddConcern(false)
    setOpenConcern(key)
  }

  async function runScan() {
    setScanBusy(true)
    setMsg('')
    try {
      const patch = await runBodyScan(getProfile())
      apply(patch, 'Body scan complete ✓')
    } catch (e) {
      setMsg('⚠️ ' + e.message)
    } finally {
      setScanBusy(false)
    }
  }

  async function runDeep() {
    setDeepBusy(true)
    setMsg('')
    try {
      const patch = await runDeepScan(getProfile())
      apply(patch, 'Deep scan complete ✓')
    } catch (e) {
      // A refusal is not an error the user did something wrong for. Say what
      // the app needs and move on — no lecture, no repeated warning.
      setMsg(e instanceof UnsuitableImage
        ? 'That photo could not be analysed. SAP reads open body photos only — retake it and it will work.'
        : '⚠️ ' + e.message)
    } finally {
      setDeepBusy(false)
    }
  }

  const a = p.analysis || {}
  const bmi = metrics.bmi
  const bf = metrics.bodyFat
  const cals = calorieTarget(p)
  const prot = proteinTarget(p)
  const why = targetExplained(p)

  return (
    <div className="screen with-tabbar">
      {onBack && <button className="mini ghost" type="button" onClick={onBack} style={{ marginBottom: 10 }}>← Back</button>}
      <h1>Body report</h1>
      <p className="dim small" style={{ marginTop: 4 }}>
        Everything your numbers and photos say, in one place — and what to actually do about it.
      </p>

      {/* ---------------------------------------------------------- BMI --- */}
      <section className="card">
        <h2>⚖️ BMI</h2>
        {bmi.ready ? (
          <>
            <div className="cal-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 12 }}>
              <div><span className="cs-num" style={{ color: TONE[bmi.tone] }}>{bmi.value}</span><span className="dim small">BMI</span></div>
              <div><span className="cs-num" style={{ fontSize: 15 }}>{bmi.category}</span><span className="dim small">category</span></div>
              <div><span className="cs-num" style={{ fontSize: 15 }}>{bmi.healthyRange[0]}–{bmi.healthyRange[1]}</span><span className="dim small">healthy kg</span></div>
            </div>
            <Meter label="Where you sit" value={bmi.value} pct={bmi.pct} tone={bmi.tone} note={bmi.note} />
            {bmi.kgToHealthy > 0 && (
              <p className="small" style={{ marginTop: 10 }}>
                <strong>{bmi.kgToHealthy} kg</strong> from the healthy range for your height.
              </p>
            )}
            <p className="dim small" style={{ marginTop: 10 }}>{bmi.caveat}</p>
          </>
        ) : (
          <p className="dim small">{bmi.why}</p>
        )}
      </section>

      {/* ----------------------------------------------------- body fat --- */}
      <section className="card">
        <h2>🔬 Body fat</h2>
        {bf.ready ? (
          <>
            <div className="cal-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 12 }}>
              <div><span className="cs-num" style={{ color: TONE[bf.tone] }}>{bf.value}%</span><span className="dim small">body fat</span></div>
              <div><span className="cs-num" style={{ fontSize: 15 }}>{bf.fatMassKg ?? '—'} kg</span><span className="dim small">fat mass</span></div>
              <div><span className="cs-num" style={{ fontSize: 15 }}>{bf.leanMassKg ?? '—'} kg</span><span className="dim small">lean mass</span></div>
            </div>
            <Meter
              label={bf.category}
              value={`${bf.range[0]}–${bf.range[1]}%`}
              pct={bf.pct}
              tone={bf.tone}
              note={bf.note}
            />
            {a.bfEstimate != null && (
              <p className="dim small" style={{ marginTop: 8 }}>
                Your photos read as roughly {a.bfEstimate}% — {Math.abs(a.bfEstimate - bf.value) <= 4
                  ? 'which lines up with the measurement above. Good sign for both.'
                  : 'which differs from the tape. Trust the tape; the eye is easily fooled by lighting and posture.'}
              </p>
            )}
            {bf.missing.length > 0 && (
              <div className="consent-box" style={{ marginTop: 12 }}>
                <strong>Make this accurate.</strong> Right now it is a BMI estimate (±5.5 points). Add your{' '}
                {bf.missing.join(', ')} below and it switches to the tape method (±3.5).
              </div>
            )}
            <p className="dim small" style={{ marginTop: 10 }}>{bf.caveat}</p>
          </>
        ) : (
          <p className="dim small">{bf.why}</p>
        )}
      </section>

      {/* -------------------------------------------------- measurements -- */}
      <section className="card">
        <h2>📏 Measurements <span className="dim small">cm</span></h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Measure relaxed, first thing in the morning, tape snug but not tight. Waist at the belly
          button — do not suck in. Re-measure monthly: this moves before the scale does.
        </p>
        <div className="row">
          <label className="field"><span>Neck</span>
            <input type="number" inputMode="decimal" value={m.neck} onChange={(e) => setM({ ...m, neck: e.target.value })} /></label>
          <label className="field"><span>Chest</span>
            <input type="number" inputMode="decimal" value={m.chest} onChange={(e) => setM({ ...m, chest: e.target.value })} /></label>
        </div>
        <div className="row">
          <label className="field"><span>Waist</span>
            <input type="number" inputMode="decimal" value={m.waist} onChange={(e) => setM({ ...m, waist: e.target.value })} /></label>
          <label className="field"><span>Hips</span>
            <input type="number" inputMode="decimal" value={m.hips} onChange={(e) => setM({ ...m, hips: e.target.value })} /></label>
        </div>
        <div className="row">
          <label className="field"><span>Thigh</span>
            <input type="number" inputMode="decimal" value={m.thigh} onChange={(e) => setM({ ...m, thigh: e.target.value })} /></label>
          <label className="field"><span>Arm</span>
            <input type="number" inputMode="decimal" value={m.arm} onChange={(e) => setM({ ...m, arm: e.target.value })} /></label>
        </div>
        <button type="button" onClick={saveMeasurements}>Save measurements</button>

        {metrics.ratios.length > 0 && (
          <div className="attr-list" style={{ marginTop: 16 }}>
            {metrics.ratios.map((r) => (
              <Meter key={r.key} label={r.label} value={`${r.value} · ${r.verdict}`} pct={r.pct} tone={r.tone} note={r.note} />
            ))}
          </div>
        )}

        {trend.ready && (
          <div style={{ marginTop: 16 }}>
            <p className="small" style={{ marginBottom: 6 }}>
              <strong>📉 Since you started measuring</strong>{' '}
              <span className="dim">({trend.entries} saves, from {trend.first})</span>
            </p>
            {trend.rows.map((r) => (
              <div className="todo-row" key={r.key}>
                <span className="small" style={{ flex: 1 }}>{r.label} {r.from} → {r.to} cm</span>
                <span className="small" style={{ color: r.dir === 'down' ? TONE.good : TONE.warn }}>{r.text}</span>
              </div>
            ))}
            <p className="dim small" style={{ marginTop: 8 }}>
              The tape moves before the scale does — a waist that dropped while the scale sat still
              means you lost fat and held muscle. That is the good version of a plateau.
            </p>
          </div>
        )}
        {!trend.ready && trend.entries === 1 && (
          <p className="dim small" style={{ marginTop: 12 }}>
            First measurements saved. Re-measure in about a month and this turns into a trend.
          </p>
        )}

        {comp.missing.length > 0 && (
          <p className="dim small" style={{ marginTop: 12 }}>
            Report {comp.pct}% complete — still missing: {comp.missing.map((x) => x.label.toLowerCase()).join(', ')}.
          </p>
        )}
      </section>

      {/* ------------------------------------------------------ fat map --- */}
      <section className="card">
        <h2>🗺️ Where your fat sits</h2>
        <p className="small" style={{ marginBottom: 8 }}>{map.headline}</p>
        {map.pattern && (
          <div className="chips" style={{ marginBottom: 10 }}>
            <span className="chip">{map.pattern === 'apple' ? '🍎 Apple pattern' : '🍐 Pear pattern'}</span>
            {a.muscle && <span className="chip">💪 {a.muscle}</span>}
          </div>
        )}
        <div className="attr-list">
          {map.regions.map((r) => (
            <Meter
              key={r.key}
              label={`${r.icon} ${r.name}`}
              value={r.source ? r.levelLabel : 'not rated'}
              pct={r.source ? r.pct : 0}
              tone={r.level >= 3 ? 'bad' : r.level === 2 ? 'warn' : r.source ? 'good' : 'neutral'}
              note={r.source === 'measurements' ? 'From your tape measurements' : null}
            />
          ))}
        </div>
        <div className="consent-box" style={{ marginTop: 14 }}>{map.truth}</div>

        <h2 style={{ marginTop: 18 }}>What to do, area by area</h2>
        {(map.focus.length ? map.focus : map.regions.slice(0, 3)).map((r) => {
          const proto = regionProtocol(r.key, EX_BY_ID, blocked)
          if (!proto) return null
          return (
            <Collapse
              key={r.key}
              title={`${r.icon} ${r.name}`}
              sub={r.source ? `${r.levelLabel} · ${proto.timeline}` : proto.timeline}
              open={openRegion === r.key}
              onToggle={() => setOpenRegion(openRegion === r.key ? null : r.key)}
            >
              <p className="small"><strong>Why it stores here.</strong> {proto.stores}</p>
              <p className="small ok" style={{ marginTop: 6 }}>✓ {proto.good}</p>

              <p className="small" style={{ marginTop: 10 }}><strong>Exercises from your library</strong></p>
              {proto.moves.map((ex) => (
                <p key={ex.id} className="small" style={{ marginBottom: 4 }}>
                  • <strong>{ex.name}</strong> <span className="dim">— {ex.steps[0]}</span>
                </p>
              ))}
              {proto.removed.length > 0 && (
                <p className="small" style={{ color: 'var(--accent)', marginTop: 4 }}>
                  Removed for your health conditions: {proto.removed.join(', ')}.
                </p>
              )}

              <p className="small" style={{ marginTop: 10 }}><strong>Add these</strong></p>
              {proto.extra.map((x, i) => (
                <p key={i} className="small" style={{ marginBottom: 4 }}>
                  • <strong>{x.name}:</strong> <span className="dim">{x.how}</span>
                </p>
              ))}

              <p className="small" style={{ marginTop: 10 }}><strong>Habits that matter here</strong></p>
              {proto.habits.map((h, i) => <p key={i} className="dim small" style={{ marginBottom: 3 }}>• {h}</p>)}

              <p className="small no" style={{ marginTop: 10 }}>✗ <strong>The myth:</strong> {proto.myth}</p>
              <p className="dim small" style={{ marginTop: 6 }}>⏳ {proto.timeline}</p>
            </Collapse>
          )
        })}
      </section>

      {/* ----------------------------------------------------- timeline --- */}
      <section className="card">
        <h2>⏳ Days to your goal</h2>
        {!history && <p className="dim small">Loading your weigh-ins…</p>}
        {history && fc.blocked && <div className="consent-box">{fc.why}</div>}
        {history && !fc.ready && !fc.blocked && (
          <>
            <p className="dim small" style={{ marginBottom: 10 }}>{fc.why}</p>
            {fc.suggestedWhy && <p className="small" style={{ marginBottom: 10 }}>💡 {fc.suggestedWhy}</p>}
            <div className="row">
              <input type="number" inputMode="decimal" step="0.5" value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder={fc.suggested ? `Target (kg) — try ${fc.suggested}` : 'Target weight (kg)'} />
              <button type="button" onClick={saveTarget} style={{ width: 'auto' }}>Set</button>
            </div>
          </>
        )}
        {history && fc.ready && fc.done && (
          <>
            <p className="quote">{fc.headline}</p>
            <p className="dim small" style={{ marginTop: 6 }}>{fc.note}</p>
          </>
        )}
        {history && fc.ready && !fc.done && (
          <>
            <div className="cal-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 12 }}>
              <div><span className="cs-num" style={{ color: 'var(--accent)' }}>{fc.days}</span><span className="dim small">days to go</span></div>
              <div><span className="cs-num" style={{ fontSize: 15 }}>{fc.etaDate}</span><span className="dim small">arrival</span></div>
              <div><span className="cs-num" style={{ fontSize: 15 }}>{fc.kgToGo} kg</span><span className="dim small">to {fc.dir}</span></div>
            </div>
            <div className="chips">
              <span className="chip">📍 now {fc.current} kg</span>
              <span className="chip">🎯 target {fc.target} kg</span>
              <span className="chip">📈 {fc.ratePerWeek} kg/week</span>
              {fc.dailyDeficit ? <span className="chip">🔥 ~{fc.dailyDeficit} kcal/day gap</span> : null}
              {fc.months ? <span className="chip">🗓 {fc.months} months</span> : null}
            </div>
            {fc.projectedBF != null && bf.ready && (
              <p className="small" style={{ marginTop: 10 }}>
                Getting there should put you near <strong>{fc.projectedBF}% body fat</strong>, down from {bf.value}% —
                assuming you keep lifting and hit your protein. Without those, more of that {fc.kgToGo} kg comes
                off as muscle and the number barely moves.
              </p>
            )}
            <p className="dim small" style={{ marginTop: 8 }}>{fc.note}</p>
            {fc.conditionNote && <p className="small" style={{ color: 'var(--accent)', marginTop: 6 }}>ℹ️ {fc.conditionNote}</p>}
            {fc.warn && <p className="small no" style={{ marginTop: 6 }}>⚠️ {fc.warn}</p>}
            {fc.milestones?.length > 0 && (
              <>
                <p className="small" style={{ margin: '14px 0 4px' }}><strong>Milestones</strong></p>
                {fc.milestones.map((ms, i) => (
                  <div className="todo-row" key={i}>
                    <span style={{ flex: 1 }} className="small">{ms.label} → {ms.weight} kg</span>
                    <span className="dim small">{ms.when}</span>
                  </div>
                ))}
              </>
            )}
            <div className="row" style={{ marginTop: 12 }}>
              <input type="number" inputMode="decimal" step="0.5" value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)} placeholder="Change target (kg)" />
              <button className="ghost" type="button" onClick={saveTarget} style={{ width: 'auto' }}>Update</button>
            </div>
          </>
        )}
      </section>

      {/* ----------------------------------------------------- concerns --- */}
      <section className="card">
        <h2>✨ Sagging, marks & shape</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Straight answers, including where the honest answer is "this does not fully reverse".
          Nothing here is a miracle claim.
        </p>
        {concerns.length === 0 && (
          <p className="dim small">Nothing flagged from your photos. Add anything you want help with below.</p>
        )}
        {concerns.map((c) => (
          <Collapse
            key={c.key}
            title={`${c.icon} ${c.name}`}
            sub={c.why}
            open={openConcern === c.key}
            onToggle={() => setOpenConcern(openConcern === c.key ? null : c.key)}
          >
            <p className="small"><strong>What it actually is.</strong> {c.what}</p>
            <div className="consent-box" style={{ marginTop: 10 }}>{c.honest}</div>

            <p className="small" style={{ marginTop: 12 }}><strong>What genuinely helps</strong></p>
            {c.helps.map((h, i) => <p key={i} className="small ok" style={{ marginBottom: 4 }}>✓ {h}</p>)}

            <p className="small" style={{ marginTop: 12 }}><strong>Exercises</strong></p>
            {c.exercises.map((x, i) => (
              <p key={i} className="small" style={{ marginBottom: 5 }}>
                • <strong>{x.name}:</strong> <span className="dim">{x.how}</span>
              </p>
            ))}

            <p className="small" style={{ marginTop: 12 }}><strong>What does nothing</strong></p>
            {c.doesNothing.map((x, i) => <p key={i} className="small no" style={{ marginBottom: 4 }}>✗ {x}</p>)}

            <p className="small" style={{ marginTop: 12 }}>⏳ <strong>Timeline.</strong> {c.timeline}</p>
            <p className="small" style={{ marginTop: 6, color: 'var(--accent)' }}>🩺 <strong>Doctor.</strong> {c.doctor}</p>
          </Collapse>
        ))}

        <button className="ghost" type="button" style={{ marginTop: 10 }}
          onClick={() => setShowAddConcern(!showAddConcern)}>
          {showAddConcern ? 'Close' : '＋ Something else you want help with'}
        </button>
        {showAddConcern && (
          <div style={{ marginTop: 10 }}>
            {otherConcerns(p).map((c) => (
              <button key={c.key} type="button" className="chip chip-add" onClick={() => addConcern(c.key)}>
                ＋ {c.icon} {c.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* --------------------------------------------------- conditions --- */}
      <section className="card">
        <h2>🩺 Your health conditions</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          These change your calorie target, your protein target, which exercises you are given, and
          what your timeline promises. Tick anything that applies.
        </p>

        {suggested.length > 0 && (
          <div className="consent-box" style={{ marginBottom: 12 }}>
            <strong>Spotted in what you typed:</strong>{' '}
            {suggested.map((c) => c.name).join(', ')}. These are already being applied — tap below to
            confirm them so they stay if you edit your notes.
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
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

        {conditions.map((c) => (
          <Collapse
            key={c.key}
            title={`${c.icon} ${c.name}`}
            sub={c.expect}
            open={openCondition === c.key}
            onToggle={() => setOpenCondition(openCondition === c.key ? null : c.key)}
          >
            <p className="small">{c.summary}</p>

            <p className="small" style={{ marginTop: 12 }}><strong>Eat</strong></p>
            {(c.eat || []).map((x, i) => <p key={i} className="small ok" style={{ marginBottom: 4 }}>✓ {x}</p>)}

            {(c.limit || []).length > 0 && (
              <>
                <p className="small" style={{ marginTop: 12 }}><strong>Limit</strong></p>
                {c.limit.map((x, i) => <p key={i} className="small no" style={{ marginBottom: 4 }}>✗ {x}</p>)}
              </>
            )}

            {(c.prefer || []).length > 0 && (
              <>
                <p className="small" style={{ marginTop: 12 }}><strong>Train like this</strong></p>
                {c.prefer.map((x, i) => <p key={i} className="small ok" style={{ marginBottom: 4 }}>✓ {x}</p>)}
              </>
            )}

            {(c.avoid || []).length > 0 && (
              <>
                <p className="small" style={{ marginTop: 12 }}><strong>Avoid</strong></p>
                {c.avoid.map((x, i) => <p key={i} className="small no" style={{ marginBottom: 4 }}>✗ {x}</p>)}
              </>
            )}

            <p className="small" style={{ marginTop: 12 }}>⏳ <strong>What to expect.</strong> {c.expect}</p>

            <div className="consent-box" style={{ marginTop: 12 }}>
              <strong>🚩 See a doctor for:</strong>
              {(c.redFlags || []).map((x, i) => <p key={i} className="small" style={{ marginTop: 4 }}>• {x}</p>)}
            </div>
          </Collapse>
        ))}
      </section>

      {/* ------------------------------------------- adjusted targets ----- */}
      <section className="card">
        <h2>🎯 Your adjusted targets</h2>
        <div className="cal-summary" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div><span className="cs-num">{cals}</span><span className="dim small">kcal/day</span></div>
          <div><span className="cs-num">{prot == null ? '—' : prot + ' g'}</span><span className="dim small">protein/day</span></div>
        </div>
        {why.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {why.map((w, i) => <p key={i} className="small" style={{ color: 'var(--accent)', marginBottom: 6 }}>ℹ️ {w}</p>)}
          </div>
        )}
        {diet.carbNotes.map((n, i) => <p key={i} className="dim small" style={{ marginTop: 6 }}>{n}</p>)}
        {conditions.length === 0 && (
          <p className="dim small" style={{ marginTop: 10 }}>
            No conditions logged, so these are the standard formula. Tick anything above and they adapt.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------- what to do -- */}
      {(diet.eat.length > 0 || work.prefer.length > 0) && (
        <section className="card">
          <h2>📋 Your combined rules</h2>
          <p className="dim small" style={{ marginBottom: 10 }}>
            Everything your conditions call for, merged and de-duplicated. Each line says which
            condition it came from.
          </p>
          {diet.eat.length > 0 && (
            <>
              <p className="small" style={{ marginBottom: 6 }}><strong>🍽️ Eat</strong></p>
              {diet.eat.map((r, i) => (
                <p key={i} className="small" style={{ marginBottom: 5 }}>✓ {r.text} <span className="dim">({r.from})</span></p>
              ))}
            </>
          )}
          {diet.limit.length > 0 && (
            <>
              <p className="small" style={{ margin: '12px 0 6px' }}><strong>🚫 Limit</strong></p>
              {diet.limit.map((r, i) => (
                <p key={i} className="small" style={{ marginBottom: 5 }}>✗ {r.text} <span className="dim">({r.from})</span></p>
              ))}
            </>
          )}
          {work.prefer.length > 0 && (
            <>
              <p className="small" style={{ margin: '12px 0 6px' }}><strong>💪 Train</strong></p>
              {work.prefer.map((r, i) => (
                <p key={i} className="small" style={{ marginBottom: 5 }}>✓ {r.text} <span className="dim">({r.from})</span></p>
              ))}
            </>
          )}
          {work.avoid.length > 0 && (
            <>
              <p className="small" style={{ margin: '12px 0 6px' }}><strong>⛔ Do not</strong></p>
              {work.avoid.map((r, i) => (
                <p key={i} className="small" style={{ marginBottom: 5 }}>✗ {r.text} <span className="dim">({r.from})</span></p>
              ))}
            </>
          )}
        </section>
      )}

      {/* --------------------------------------------------- deep scan ---- */}
      <section className="card">
        <h2>🔬 Deep scan</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Reads every photo you have given SAP and rates {' '}
          {GROUPS.reduce((n, g) => n + g.attrs.length, 0)} things across your skin, body,
          eyes, hair and scalp — then tells you what to do about each one it finds.
          Anything it cannot genuinely see it marks <em>unclear</em> rather than guessing.
        </p>

        <button className="ghost" type="button" onClick={runDeep} disabled={deepBusy}>
          {deepBusy ? 'Reading your photos… (about a minute)' : deep ? '🔁 Re-run deep scan' : '🔬 Run my deep scan'}
        </button>

        {deep && (
          <>
            <div className="chips" style={{ marginTop: 12 }}>
              <span className="chip">📅 {deep.at}</span>
              <span className="chip">
                {deepConf.pct}% readable ({deepConf.rated}/{deepConf.total})
              </span>
            </div>
            {deepConf.pct < 60 && (
              <div className="consent-box" style={{ marginTop: 10 }}>
                <strong>Only {deepConf.pct}% of this could be read.</strong> That is almost always the
                photos, not your body — usually overhead light, a phone held too close, or beauty mode
                left on. Retake them near a window with the rear camera and this fills in.
              </div>
            )}

            {[deep.faceSummary, deep.hairSummary, deep.bodySummary].filter(Boolean).map((s, i) => (
              <div key={i} className="analysis small" style={{ marginTop: 10 }}>{s}</div>
            ))}

            {GROUPS.map((g) => {
              const items = (deep[g.key] || []).filter((it) => it.rated)
              if (!items.length) return null
              const worst = items.filter((it) => it.tone === 'bad').length
              return (
                <Collapse
                  key={g.key}
                  title={`${g.icon} ${g.label}`}
                  sub={worst ? `${items.length} rated · ${worst} worth attention` : `${items.length} rated · nothing flagged`}
                  open={openGroup === g.key}
                  onToggle={() => setOpenGroup(openGroup === g.key ? null : g.key)}
                >
                  <div className="attr-list">
                    {items.map((it) => (
                      <Meter
                        key={it.key}
                        label={it.label}
                        value={it.value}
                        pct={it.score}
                        tone={it.tone}
                        note={it.note || null}
                      />
                    ))}
                  </div>
                  {(deep[g.key] || []).some((it) => !it.rated) && (
                    <p className="dim small" style={{ marginTop: 10 }}>
                      Not readable from your photos:{' '}
                      {(deep[g.key] || []).filter((it) => !it.rated).map((it) => it.label.toLowerCase()).join(', ')}.
                    </p>
                  )}
                </Collapse>
              )
            })}

            {deepProtocols.length > 0 && (
              <>
                <h2 style={{ marginTop: 18 }}>What to do about it</h2>
                <p className="dim small" style={{ marginBottom: 8 }}>
                  Only what the scan rated moderate or worse. Anything milder is left alone on
                  purpose — treating "mild" is how an app turns a non-problem into a worry.
                </p>
                {deepProtocols.map((p) => (
                  <Collapse
                    key={p.key}
                    title={`${p.icon} ${p.name}`}
                    sub={p.timeline}
                    open={openProto === p.key}
                    onToggle={() => setOpenProto(openProto === p.key ? null : p.key)}
                  >
                    <p className="small"><strong>What it actually is.</strong> {p.what}</p>

                    <p className="small" style={{ marginTop: 12 }}><strong>What genuinely helps</strong></p>
                    {p.helps.map((h, i) => <p key={i} className="small ok" style={{ marginBottom: 4 }}>✓ {h}</p>)}

                    <p className="small" style={{ marginTop: 12 }}><strong>What does nothing</strong></p>
                    {p.doesNothing.map((h, i) => <p key={i} className="small no" style={{ marginBottom: 4 }}>✗ {h}</p>)}

                    <p className="small" style={{ marginTop: 12 }}>⏳ <strong>Timeline.</strong> {p.timeline}</p>
                    <p className="small" style={{ marginTop: 6, color: 'var(--accent)' }}>🩺 <strong>Doctor.</strong> {p.doctor}</p>
                  </Collapse>
                ))}
              </>
            )}
          </>
        )}

        {/* Guidance SAP will never ask for a photo of. Opt-in, never surfaced
            by a scan finding, and never shown unprompted. */}
        <button className="ghost" type="button" style={{ marginTop: 12 }}
          onClick={() => setShowTextOnly(!showTextOnly)}>
          {showTextOnly ? 'Close' : 'Other concerns — no photo involved ›'}
        </button>
        {showTextOnly && (
          <div style={{ marginTop: 10 }}>
            <p className="dim small" style={{ marginBottom: 8 }}>
              These are common and SAP has guidance for them, but it will never ask you to
              photograph the area and cannot analyse it. The advice below is the whole feature.
            </p>
            {TEXT_ONLY_PROTOCOLS.map((k) => getSkinProtocol(k)).filter(Boolean).map((p) => (
              <Collapse
                key={p.key}
                title={`${p.icon} ${p.name}`}
                sub={p.timeline}
                open={openProto === p.key}
                onToggle={() => setOpenProto(openProto === p.key ? null : p.key)}
              >
                <p className="small"><strong>What it actually is.</strong> {p.what}</p>
                <p className="small" style={{ marginTop: 12 }}><strong>What genuinely helps</strong></p>
                {p.helps.map((h, i) => <p key={i} className="small ok" style={{ marginBottom: 4 }}>✓ {h}</p>)}
                <p className="small" style={{ marginTop: 12 }}><strong>What does nothing</strong></p>
                {p.doesNothing.map((h, i) => <p key={i} className="small no" style={{ marginBottom: 4 }}>✗ {h}</p>)}
                <p className="small" style={{ marginTop: 12 }}>⏳ {p.timeline}</p>
                <p className="small" style={{ marginTop: 6, color: 'var(--accent)' }}>🩺 {p.doctor}</p>
              </Collapse>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- scan ---- */}
      <section className="card">
        <h2>✨ AI body scan</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Reads your photos against the measured numbers above — so it interprets a real BMI and
          body fat % instead of guessing them from a picture. Updates the fat map, sagging and
          stretch-mark findings on this page.
        </p>
        {a.read && (
          <div className="analysis small" style={{ marginBottom: 10 }}>{a.read}</div>
        )}
        {a.summary && !a.read && <div className="analysis small" style={{ marginBottom: 10 }}>{a.summary}</div>}
        <button className="ghost" type="button" onClick={runScan} disabled={scanBusy}>
          {scanBusy ? 'Reading your photos…' : a.scanAt ? '🔁 Re-run body scan' : '✨ Run my body scan'}
        </button>
        {a.scanAt && <p className="dim" style={{ fontSize: 11, marginTop: 8 }}>Last scan {a.scanAt}</p>}
        {onOpenProfile && (
          <button className="ghost" type="button" style={{ marginTop: 10 }} onClick={onOpenProfile}>
            Update my photos & details ›
          </button>
        )}
      </section>

      {msg && <p className="dim small" style={{ textAlign: 'center', marginBottom: 10 }}>{msg}</p>}

      <p className="dim" style={{ fontSize: 11.5, textAlign: 'center', marginBottom: 10 }}>
        Estimates from measurements and photos — informative, not a medical assessment. For symptoms,
        medication or anything health-critical, talk to a doctor.
      </p>
    </div>
  )
}
