import { useMemo, useState } from 'react'
import { calorieTarget, proteinTarget } from '../lib/nutrition.js'
import { planMeals, pantryMatch, RECIPES } from '../lib/recipes.js'
import { searchWorldFoods } from '../lib/foods.js'
import { haveFoodNames, addCustomPatch, setStatusPatch, allItems, statusOf } from '../lib/inventory.js'
import { cycleInfo } from '../lib/exercises.js'
import { getDay, saveDay, todayKey, getProfile, saveProfile } from '../lib/store.js'
import { askAI, dataUrlToImage } from '../lib/ai.js'
import { compressImage } from '../lib/img.js'

const MEAL_LABEL = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', snack: '🥜 Snack', dinner: '🌙 Dinner' }

export default function Diet({ profile, onOpenInventory }) {
  const [p, setP] = useState(profile)
  const pantry = haveFoodNames(p)
  const [swaps, setSwaps] = useState({})
  const [openMeal, setOpenMeal] = useState(null)
  const [day, setDay] = useState(() => getDay())
  const [msg, setMsg] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [foodPhotoBusy, setFoodPhotoBusy] = useState(false)
  const [photoResult, setPhotoResult] = useState(null) // {text, kcal}

  const ci = cycleInfo(p)
  const plan = useMemo(
    () => planMeals(p, pantry, swaps, ci?.phase || null),
    [p, pantry, swaps, ci?.phase]
  )
  const target = calorieTarget(p)
  const protein = proteinTarget(p)
  const planKcal = Object.values(plan).reduce((s, r) => s + r.kcal, 0)

  function apply(patch) {
    const np = { ...getProfile(), ...patch }
    saveProfile(np)
    setP(np)
  }
  const addPantry = (name) => {
    const n = String(name).trim()
    if (n) apply(addCustomPatch(getProfile(), n, 'Oils & Spices', 'have'))
  }
  function addMissingToList(missing) {
    let prof = getProfile()
    for (const name of missing) {
      const exists = allItems(prof).some((i) => i.name.toLowerCase() === name.toLowerCase())
      const patch = exists && statusOf(prof, name) === 'have'
        ? null
        : (exists ? setStatusPatch(prof, name, 'need') : addCustomPatch(prof, name, 'Oils & Spices', 'need'))
      if (patch) prof = { ...prof, ...patch }
    }
    saveProfile(prof)
    setP(prof)
    setMsg('Added to your 🛒 shopping list — see Inventory.')
  }

  function updateDay(patch) {
    const next = { ...day, ...patch }
    setDay(next)
    saveDay(next, todayKey())
  }

  function logMeal(name, kcal) {
    updateDay({
      meals: [...(day.meals || []), { id: Date.now(), name, kcal }],
      calsIn: (Number(day.calsIn) || 0) + kcal,
    })
    setMsg(`Logged ✅ ${name} — ${kcal} kcal added to today.`)
  }

  function removeMeal(m) {
    updateDay({
      meals: (day.meals || []).filter((x) => x.id !== m.id),
      calsIn: Math.max(0, (Number(day.calsIn) || 0) - m.kcal),
    })
  }

  async function runSearch() {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setResults(null)
    try {
      setResults(await searchWorldFoods(q))
    } catch (e) {
      setResults([])
      setMsg('⚠️ ' + e.message)
    } finally {
      setSearching(false)
    }
  }

  async function foodPhoto(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setFoodPhotoBusy(true)
    setPhotoResult(null)
    try {
      const dataUrl = await compressImage(file, 640, 0.6)
      const reply = await askAI({
        profile,
        images: [dataUrlToImage(dataUrl)],
        messages: [{
          role: 'user',
          text: 'This is my meal. Identify the dish and portion size, estimate total calories, and note protein roughly. Keep it short. End with exactly one line: TOTAL_KCAL: <number>',
        }],
      })
      const m = reply.match(/TOTAL_KCAL:\s*(\d{2,5})/i)
      setPhotoResult({ text: reply.replace(/TOTAL_KCAL:.*/i, '').trim(), kcal: m ? Number(m[1]) : null })
    } catch (err) {
      setPhotoResult({ text: '⚠️ ' + err.message, kcal: null })
    } finally {
      setFoodPhotoBusy(false)
    }
  }

  return (
    <div className="screen with-tabbar">
      <h1>Diet</h1>
      <div className="chips">
        <span className="chip">🎯 {target} kcal/day</span>
        <span className="chip">🥚 {protein} g protein</span>
        {profile.dietType && <span className="chip">🍽️ {profile.dietType}</span>}
      </div>

      {ci && (
        <div className="consent-box" style={{ marginBottom: 14 }}>
          Day {ci.day} · {ci.phase === 'menstrual'
            ? 'Menstrual phase: today’s plan leans iron-rich and comforting. Cravings are chemistry, not weakness — the snack has you covered.'
            : ci.phase === 'luteal'
            ? 'Luteal phase: cravings and hunger can rise — that’s normal. Magnesium-rich foods (dark chocolate, nuts, greens) genuinely help.'
            : ci.note}
        </div>
      )}

      <section className="card">
        <h2>Today's meal plan <span className="dim small">~{planKcal} kcal</span></h2>
        {(String(profile.allergies || '').trim() || String(profile.foodsToAvoid || '').trim()) && (
          <p className="dim small" style={{ marginBottom: 8 }}>
            Filtered for your allergies & avoid-list automatically.
          </p>
        )}
        {Object.entries(plan).map(([meal, r]) => {
          const pm = pantryMatch(r, pantry)
          const open = openMeal === meal
          return (
            <div key={meal} className="ex-card">
              <div className="ex-head" onClick={() => setOpenMeal(open ? null : meal)}>
                <div style={{ flex: 1 }}>
                  <div className="dim small">{MEAL_LABEL[meal]}</div>
                  <div className="ex-name">{r.name}</div>
                  <div className="dim small">
                    {r.kcal} kcal · {r.protein} g protein · ⏱ {r.time} min ·{' '}
                    <span style={{ color: pm.have === pm.total ? '#7ee2b8' : 'var(--accent)' }}>
                      you have {pm.have}/{pm.total}
                    </span>
                  </div>
                </div>
                <span className="dim">{open ? '▲' : '▼'}</span>
              </div>
              {open && (
                <div className="ex-body">
                  <p className="small"><strong>Ingredients</strong></p>
                  <ul className="small ing-list">
                    {r.ingredients.map(([name, qty], i) => {
                      const missing = pm.missing.includes(name)
                      return (
                        <li key={i} className={missing ? 'missing' : ''}>
                          {name} — {qty} {missing && <em>(need to get)</em>}
                        </li>
                      )
                    })}
                  </ul>
                  <p className="small"><strong>Steps</strong></p>
                  <ol className="small">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                  {r.temp && <p className="small dim">🌡 {r.temp}</p>}
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="mini" type="button" onClick={() => logMeal(r.name, r.kcal)}>I ate this (+{r.kcal})</button>
                    <button className="mini ghost" type="button"
                      onClick={() => setSwaps({ ...swaps, [meal]: (swaps[meal] || 0) + 1 })}>
                      Swap
                    </button>
                  </div>
                  {pm.missing.length > 0 && (
                    <button className="mini ghost" type="button" style={{ marginTop: 8 }}
                      onClick={() => addMissingToList(pm.missing)}>
                      🛒 Add {pm.missing.length} missing to shopping list
                    </button>
                  )}
                  <a
                    className="small" style={{ color: 'var(--accent)', display: 'inline-block', marginTop: 8 }}
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r.name + ' recipe')}`}
                    target="_blank" rel="noreferrer"
                  >▶ Watch it being made</a>
                </div>
              )}
            </div>
          )
        })}
        {msg && <p className="dim small" style={{ marginTop: 10, textAlign: 'center' }}>{msg}</p>}
      </section>

      <section className="card">
        <h2>📷 Calorie counter by photo</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Snap your plate — the AI identifies it and estimates the calories.
        </p>
        <label className="photo-add">
          {foodPhotoBusy ? 'Analyzing your plate…' : 'Take / choose a food photo'}
          <input type="file" accept="image/*" onChange={foodPhoto} disabled={foodPhotoBusy} />
        </label>
        {photoResult && (
          <div className="analysis small">
            {photoResult.text}
            {photoResult.kcal != null && (
              <button className="mini" type="button" style={{ marginTop: 10 }}
                onClick={() => { logMeal('Photo meal', photoResult.kcal); setPhotoResult(null) }}>
                Add {photoResult.kcal} kcal to today
              </button>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Eaten today <span className="dim small">{day.calsIn || 0} / {target} kcal</span></h2>
        {(day.meals || []).length === 0 && <p className="dim small">Nothing logged yet.</p>}
        {(day.meals || []).map((m) => (
          <div className="todo-row" key={m.id}>
            <span style={{ flex: 1 }}>{m.name}</span>
            <span className="dim small">{m.kcal} kcal</span>
            <button className="del" type="button" aria-label="Remove" onClick={() => removeMeal(m)}>×</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>🎒 My kitchen ({pantry.length} items)</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Meal plans prefer recipes you can cook right now. Manage everything —
          groceries, supplements and more — in your Inventory.
        </p>
        <div className="todo-add" style={{ marginBottom: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (addPantry(query), setQuery(''))}
            placeholder="Quick add to kitchen… (Enter)"
          />
          <button type="button" onClick={runSearch} disabled={searching}>
            {searching ? '…' : '🔍'}
          </button>
        </div>
        {results && (
          <div style={{ marginBottom: 10 }}>
            <p className="dim small">World food database results — tap to add:</p>
            {results.length === 0 && <p className="dim small">No matches found.</p>}
            {results.map((r, i) => (
              <button key={i} type="button" className="chip chip-add"
                onClick={() => { addPantry(r.name); setResults(null); setQuery('') }}>
                ＋ {r.name}{r.kcal100 ? ` · ${r.kcal100} kcal/100g` : ''}
              </button>
            ))}
          </div>
        )}
        {onOpenInventory && (
          <button className="ghost" type="button" onClick={onOpenInventory}>
            Open Inventory & Shopping list ›
          </button>
        )}
      </section>
    </div>
  )
}
