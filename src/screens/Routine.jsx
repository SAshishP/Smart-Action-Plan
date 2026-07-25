import { useState } from 'react'
import { generatePlan, baseTitles, DOW } from '../lib/plan.js'
import { getProfile, saveProfile } from '../lib/store.js'

const SUGGESTIONS = [
  { title: 'Prayer', detail: '', time: '05:45' },
  { title: 'Meditation', detail: '10 quiet minutes', time: '06:15' },
  { title: 'Medication', detail: 'With food, as prescribed', time: '09:00' },
  { title: 'Commute', detail: '', time: '08:15' },
  { title: 'Class / study', detail: '', time: '19:30' },
  { title: 'Call family', detail: '', time: '20:30' },
  { title: 'Journal', detail: 'Three lines is enough', time: '22:00' },
  { title: 'Pet walk', detail: '', time: '07:00' },
]

const blank = { id: '', title: '', time: '07:00', detail: '', days: [] }

export default function Routine({ profile, onBack, onProfileUpdate }) {
  const [p, setP] = useState(profile)
  const [form, setForm] = useState(blank)
  const [msg, setMsg] = useState('')

  const custom = p.customRoutine || []
  const hidden = p.hiddenPlanTitles || []
  const plan = generatePlan(p)
  const defaults = [...new Set(baseTitles(p))]

  function apply(patch, note) {
    const np = { ...getProfile(), ...patch }
    saveProfile(np)
    setP(np)
    onProfileUpdate?.(np)
    if (note) setMsg(note)
  }

  function saveItem() {
    const title = form.title.trim()
    if (!title) { setMsg('Give it a name (e.g. Prayer).'); return }
    if (!/^\d{1,2}:\d{2}$/.test(form.time)) { setMsg('Pick a time.'); return }
    const item = { ...form, title, id: form.id || 'c' + Date.now() }
    const next = form.id
      ? custom.map((c) => (c.id === form.id ? item : c))
      : [...custom, item]
    apply({ customRoutine: next }, form.id ? 'Updated ✓' : `“${title}” added to your day ✓`)
    setForm(blank)
  }

  const remove = (id) => apply({ customRoutine: custom.filter((c) => c.id !== id) }, 'Removed ✓')
  const toggleHide = (title) =>
    apply({ hiddenPlanTitles: hidden.includes(title) ? hidden.filter((t) => t !== title) : [...hidden, title] })
  const toggleDay = (d) =>
    setForm((f) => ({ ...f, days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] }))

  return (
    <div className="screen with-tabbar">
      {onBack && <button className="mini ghost" type="button" onClick={onBack} style={{ marginBottom: 10 }}>← Back</button>}
      <h1>✏️ My routine</h1>
      <p className="dim small" style={{ marginBottom: 14 }}>
        Add anything the app can’t guess — prayer, class, medication, commute —
        and hide anything you don’t do. Your dashboard and reminders follow this.
      </p>

      <section className="card">
        <h2>{form.id ? 'Edit item' : '➕ Add to my day'}</h2>
        <div className="chips" style={{ marginBottom: 10 }}>
          {SUGGESTIONS.filter((s) => !custom.some((c) => c.title.toLowerCase() === s.title.toLowerCase()))
            .map((s) => (
              <button key={s.title} type="button" className="chip chip-add"
                onClick={() => setForm({ ...blank, ...s })}>＋ {s.title}</button>
            ))}
        </div>
        <label className="field"><span>What is it?</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Fajr prayer" /></label>
        <div className="row">
          <label className="field"><span>Time</span>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label className="field"><span>Note (optional)</span>
            <input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })}
              placeholder="e.g. Wudu first" /></label>
        </div>
        <p className="dim small" style={{ marginBottom: 6 }}>Which days? (none selected = every day)</p>
        <div className="chips">
          {DOW.map((d, i) => (
            <button key={d} type="button" className={'chip chip-add' + (form.days.includes(i) ? ' chip-on' : '')}
              onClick={() => toggleDay(i)}>{d}</button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {form.id && <button className="ghost" type="button" onClick={() => setForm(blank)}>Cancel</button>}
          <button type="button" onClick={saveItem}>{form.id ? 'Save changes' : 'Add to my day'}</button>
        </div>
        {msg && <p className="dim small" style={{ marginTop: 8, textAlign: 'center' }}>{msg}</p>}
      </section>

      {custom.length > 0 && (
        <section className="card">
          <h2>My own items ({custom.length})</h2>
          {custom.slice().sort((a, b) => a.time.localeCompare(b.time)).map((c) => (
            <div className="inv-row" key={c.id}>
              <div style={{ flex: 1 }}>
                <div className="ex-name small">{c.time} · {c.title}</div>
                <div className="dim" style={{ fontSize: 11.5 }}>
                  {c.detail || 'no note'}
                  {c.days?.length ? ` · ${c.days.map((d) => DOW[d]).join(' ')}` : ' · every day'}
                </div>
              </div>
              <button type="button" className="pill" onClick={() => setForm({ ...blank, ...c, days: c.days || [] })}>✏️</button>
              <button type="button" className="pill" onClick={() => remove(c.id)}>🗑</button>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>Default items</h2>
        <p className="dim small" style={{ marginBottom: 8 }}>
          Tap to hide anything that isn’t part of your life — it disappears from
          your dashboard and reminders.
        </p>
        <div className="chips">
          {defaults.map((t) => (
            <button key={t} type="button"
              className={'chip chip-add' + (hidden.includes(t) ? '' : ' chip-on')}
              onClick={() => toggleHide(t)}>
              {hidden.includes(t) ? `🚫 ${t}` : t}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Preview — your day now ({plan.length} items)</h2>
        <div className="arc">
          {plan.map((i) => (
            <div key={i.id} className="arc-item" style={{ cursor: 'default' }}>
              <span className="arc-time">{i.time}</span>
              <span>
                <span className="arc-title">{i.title}</span>
                {i.custom && <span className="badge" style={{ marginLeft: 6, fontSize: 10, padding: '1px 8px' }}>yours</span>}
                {i.detail && <div className="arc-detail">{i.detail}</div>}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
