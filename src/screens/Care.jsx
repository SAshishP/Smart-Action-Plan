import { useEffect, useState } from 'react'
import { buildSkinRoutine, buildHairRoutine, shelfMatch, SKIN_TYPES, HAIR_TYPES, POROSITY } from '../lib/care.js'
import { getWeather } from '../lib/weather.js'
import { searchBeautyProducts } from '../lib/foods.js'
import { getProfile, saveProfile, todayKey } from '../lib/store.js'
import { askAI, dataUrlToImage } from '../lib/ai.js'
import { compressImage } from '../lib/img.js'
import { uploadProgressPhoto } from '../lib/cloud.js'

const FIND_QUERY = {
  cleanser: 'gentle face cleanser', serum: 'face serum', sunscreen: 'sunscreen SPF 50',
  moisturizer: 'face moisturizer', shampoo: 'shampoo', conditioner: 'hair conditioner',
  oil: 'hair oil', 'leave-in': 'leave-in conditioner curl cream',
}

function nearbyUrl(q, location) {
  const loc = String(location || '').trim()
  const m = loc.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/)
  if (m) return `https://www.google.com/maps/search/${encodeURIComponent(q + ' store')}/@${m[1]},${m[2]},14z`
  return `https://www.google.com/maps/search/${encodeURIComponent(q + ' store near ' + (loc || 'me'))}`
}
const onlineUrl = (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`

function StepRow({ s, shelf, location, dandruff }) {
  let q = FIND_QUERY[s.key] || s.key
  if (s.key === 'shampoo' && dandruff) q = 'anti dandruff shampoo'
  const have = shelfMatch(s.key, shelf)
  return (
    <div className="ex-card">
      <div className="ex-head" style={{ cursor: 'default' }}>
        <div style={{ flex: 1 }}>
          <div className="ex-name">{s.step}</div>
          <div className="dim small" style={{ marginTop: 2 }}>{s.how}</div>
          {have ? (
            <div className="small" style={{ color: '#7ee2b8', marginTop: 4 }}>✓ Use what you have: {have}</div>
          ) : (
            <div className="find-links small">
              <a href={nearbyUrl(q, location)} target="_blank" rel="noreferrer">🗺 Nearby stores</a>
              <a href={onlineUrl(q)} target="_blank" rel="noreferrer">🛒 Online</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressBlock({ p, setP, title, initialKey, listKey, slot, prompt }) {
  const [busy, setBusy] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [msg, setMsg] = useState('')
  const initial = p.photos?.[initialKey]
  const list = p[listKey] || []
  const latest = list[list.length - 1]

  async function addPhoto(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImage(file, 640, 0.6)
      const entry = { date: todayKey(), dataUrl }
      const next = [...list.filter((x) => x.date !== entry.date), entry].slice(-8)
      const np = { ...getProfile(), [listKey]: next }
      saveProfile(np)
      setP(np)
      uploadProgressPhoto(dataUrl, slot, entry.date)
      setAnalysis('')
      setMsg('')
    } catch {
      setMsg('That photo could not be read — try another one.')
    }
  }

  async function analyze() {
    if (!latest) { setMsg('Add this week’s photo first.'); return }
    setBusy(true); setAnalysis(''); setMsg('')
    try {
      const images = []
      if (initial) images.push(dataUrlToImage(initial))
      images.push(dataUrlToImage(latest.dataUrl))
      const reply = await askAI({
        profile: p, images,
        messages: [{ role: 'user', text: initial ? `Photo 1 is my starting ${title.toLowerCase()} photo; photo 2 is this week. ${prompt}` : `This is my current ${title.toLowerCase()} photo. ${prompt}` }],
      })
      setAnalysis(reply)
    } catch (err) {
      setAnalysis('⚠️ ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2>{title} progress</h2>
      <div className="compare">
        <div className="compare-slot">
          {initial ? <img src={initial} alt="start" /> : <span className="dim small">No starting photo</span>}
          <span className="dim small">Start</span>
        </div>
        <div className="compare-slot">
          {latest ? <img src={latest.dataUrl} alt="latest" /> : <span className="dim small">Add this week's</span>}
          <span className="dim small">{latest ? latest.date : 'Latest'}</span>
        </div>
      </div>
      <label className="photo-add">
        📸 Add this week's photo (same light & angle)
        <input type="file" accept="image/*" onChange={addPhoto} />
      </label>
      <button className="ghost" type="button" onClick={analyze} disabled={busy}>
        {busy ? 'Analyzing…' : '✨ Compare & advise'}
      </button>
      {msg && <p className="dim small" style={{ marginTop: 8 }}>{msg}</p>}
      {analysis && <div className="analysis small">{analysis}</div>}
    </section>
  )
}

export default function Care({ profile }) {
  const [p, setP] = useState(profile)
  const [weather, setWeather] = useState(null)
  const [wxLoading, setWxLoading] = useState(true)
  const [shelfQuery, setShelfQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [setup, setSetup] = useState({
    skinType: profile.skinType || '',
    hairType: profile.hairType || '',
    hairPorosity: profile.hairPorosity || "Don't know",
    dandruff: Boolean(profile.dandruff),
    hairDamage: Boolean(profile.hairDamage),
  })

  const needsSetup = !p.skinType || !p.hairType
  const shelf = p.careShelf || []

  useEffect(() => {
    let alive = true
    setWxLoading(true)
    getWeather(p.location).then((w) => {
      if (alive) { setWeather(w); setWxLoading(false) }
    })
    return () => { alive = false }
  }, [p.location])

  function saveSetup() {
    if (!setup.skinType || !setup.hairType) return
    const np = { ...getProfile(), ...setup }
    saveProfile(np)
    setP(np)
  }

  function saveShelf(next) {
    const np = { ...getProfile(), careShelf: next }
    saveProfile(np)
    setP(np)
  }
  const addShelf = (name) => {
    const n = String(name).trim()
    if (n && !shelf.some((x) => x.toLowerCase() === n.toLowerCase())) saveShelf([...shelf, n])
  }

  async function runSearch() {
    const q = shelfQuery.trim()
    if (!q) return
    setSearching(true); setResults(null)
    try {
      setResults(await searchBeautyProducts(q))
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const skin = buildSkinRoutine(p, weather)
  const hair = buildHairRoutine(p, weather)

  return (
    <div className="screen with-tabbar">
      <h1>Skin & Hair</h1>
      <p className="dim small" style={{ marginBottom: 14 }}>Personal care suggestions, not medical advice.</p>

      {needsSetup ? (
        <section className="card">
          <h2>One-minute care setup</h2>
          <label className="field"><span>Skin type</span>
            <select value={setup.skinType} onChange={(e) => setSetup({ ...setup, skinType: e.target.value })}>
              <option value="">Select…</option>
              {SKIN_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select></label>
          <label className="field"><span>Hair type</span>
            <select value={setup.hairType} onChange={(e) => setSetup({ ...setup, hairType: e.target.value })}>
              <option value="">Select…</option>
              {HAIR_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select></label>
          <label className="field"><span>Hair porosity (does your hair absorb water fast?)</span>
            <select value={setup.hairPorosity} onChange={(e) => setSetup({ ...setup, hairPorosity: e.target.value })}>
              {POROSITY.map((s) => <option key={s}>{s}</option>)}
            </select></label>
          <div className="check-row">
            <input id="dnd" type="checkbox" checked={setup.dandruff}
              onChange={(e) => setSetup({ ...setup, dandruff: e.target.checked })} />
            <label htmlFor="dnd">I have dandruff / flaky scalp</label>
          </div>
          <div className="check-row" style={{ marginBottom: 14 }}>
            <input id="dmg" type="checkbox" checked={setup.hairDamage}
              onChange={(e) => setSetup({ ...setup, hairDamage: e.target.checked })} />
            <label htmlFor="dmg">My hair is damaged (bleach / heat / breakage)</label>
          </div>
          <button type="button" onClick={saveSetup} disabled={!setup.skinType || !setup.hairType}>
            Build my routines
          </button>
        </section>
      ) : (
        <>
          <div className="chips">
            {wxLoading ? <span className="chip">⛅ checking today's weather…</span>
              : weather ? (
                <>
                  <span className="chip">🌡 {weather.temp}°C</span>
                  <span className="chip">💧 {weather.humidity}% humidity</span>
                  <span className="chip">☀️ UV {weather.uv}</span>
                  <span className="chip dim">{weather.place}</span>
                </>
              ) : <span className="chip dim">Add a city in your profile location to weather-tune routines</span>}
          </div>
          {weather && (
            <p className="dim small" style={{ margin: '-6px 0 14px' }}>
              Today's routine is adjusted to this weather automatically.
            </p>
          )}

          <section className="card">
            <h2>🌅 Morning skin routine</h2>
            <p className="dim small" style={{ marginBottom: 6 }}>In this order, ~1 min between layers:</p>
            {skin.am.map((s, i) => <StepRow key={'am' + i} s={s} shelf={shelf} location={p.location} dandruff={p.dandruff} />)}
          </section>

          <section className="card">
            <h2>🌙 Night skin routine</h2>
            {skin.pm.map((s, i) => <StepRow key={'pm' + i} s={s} shelf={shelf} location={p.location} dandruff={p.dandruff} />)}
          </section>

          <section className="card">
            <h2>📅 Weekly</h2>
            {skin.weekly.map((s, i) => (
              <div key={i} style={{ padding: '8px 0' }}>
                <div className="ex-name small">{s.step}</div>
                <div className="dim small">{s.how}</div>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>💇 Hair routine</h2>
            {hair.routine.map((s, i) => <StepRow key={'h' + i} s={s} shelf={shelf} location={p.location} dandruff={p.dandruff} />)}
            <p className="small" style={{ marginTop: 10 }}><strong>Don'ts</strong></p>
            {hair.donts.map((d, i) => <p key={i} className="small no">✗ {d}</p>)}
          </section>

          <section className="card">
            <h2>⚠️ Precautions</h2>
            {[...skin.precautions, ...hair.precautions].map((d, i) => <p key={i} className="dim small" style={{ marginBottom: 6 }}>• {d}</p>)}
          </section>

          <section className="card">
            <h2>My care shelf ({shelf.length})</h2>
            <p className="dim small" style={{ marginBottom: 10 }}>
              Add the products you own — routine steps switch to “use what you have.”
              Missing steps get store links. (Live shelf prices aren’t public data —
              compare in the links, or ask the Assistant for typical price ranges.)
            </p>
            <div className="chips">
              {shelf.map((x) => (
                <button key={x} type="button" className="chip chip-x"
                  onClick={() => saveShelf(shelf.filter((s) => s !== x))}>{x} ×</button>
              ))}
            </div>
            <div className="todo-add">
              <input value={shelfQuery} onChange={(e) => setShelfQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (addShelf(shelfQuery), setShelfQuery(''))}
                placeholder="Type a product… (Enter to add)" />
              <button type="button" onClick={runSearch} disabled={searching}>{searching ? '…' : '🔍'}</button>
            </div>
            {results && (
              <div style={{ marginTop: 10 }}>
                <p className="dim small">World beauty database — tap to add:</p>
                {results.length === 0 && <p className="dim small">No matches found.</p>}
                {results.map((r, i) => (
                  <button key={i} type="button" className="chip chip-add"
                    onClick={() => { addShelf(r.name); setResults(null); setShelfQuery('') }}>＋ {r.name}</button>
                ))}
              </div>
            )}
          </section>

          <ProgressBlock
            p={p} setP={setP} title="Face & skin" initialKey="face_front"
            listKey="facePhotos" slot="face_front"
            prompt="Compare skin texture, tone evenness, breakouts and dark spots kindly and honestly, then tell me what to adjust in my routine (I follow the routine in my profile context)."
          />
          <ProgressBlock
            p={p} setP={setP} title="Hair" initialKey="hair_front"
            listKey="hairPhotos" slot="hair_front"
            prompt="Compare hair volume, shine, frizz, scalp visibility and hairline kindly and honestly, then tell me what to adjust in my hair routine."
          />
        </>
      )}
    </div>
  )
}
