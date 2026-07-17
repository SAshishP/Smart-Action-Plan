import { useMemo, useState } from 'react'
import { CATEGORY_GROUPS, allItems, statusOf, counts, setStatusPatch, addCustomPatch } from '../lib/inventory.js'
import { getProfile, saveProfile } from '../lib/store.js'
import { nearbyUrl, onlineUrl, storeTypeFor } from '../lib/shop.js'
import { findNearbyStores, directionsUrl } from '../lib/places.js'
import { askAI } from '../lib/ai.js'
import { todayKey } from '../lib/store.js'
import { useEffect } from 'react'

export default function Inventory({ profile, onBack }) {
  const [p, setP] = useState(profile)
  const [view, setView] = useState('all')     // all | have | need
  const [group, setGroup] = useState('all')
  const [search, setSearch] = useState('')
  const [customCat, setCustomCat] = useState('Oils & Spices')
  const [liveLoc, setLiveLoc] = useState('')      // fresh GPS just for store links
  const [locMsg, setLocMsg] = useState('')
  const linkLoc = liveLoc || p.location || ''
  const [storeMap, setStoreMap] = useState({})   // { [type]: list | {error} }
  const [findBusy, setFindBusy] = useState(false)
  const [compareText, setCompareText] = useState('')

  const shoppingTypes = [...new Set(
    allItems(p).filter((i) => statusOf(p, i.name) === 'need').map((i) => storeTypeFor(i.cat))
  )].slice(0, 3)

  // AUTOMATIC: on open (and when the list changes) — grab GPS, fetch real
  // stores for every store-type on the list, then one cached AI comparison.
  useEffect(() => {
    if (!shoppingTypes.length) return
    let alive = true
    const run = async (loc) => {
      setFindBusy(true)
      const next = {}
      for (const t of shoppingTypes) {
        try { next[t] = await findNearbyStores(loc, t) }
        catch (e) { next[t] = { error: e.message } }
        if (!alive) return
        setStoreMap({ ...next })
      }
      setFindBusy(false)
      aiCompare(next, loc)
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          setLiveLoc(loc)
          setLocMsg('Using your live location ✓')
          run(loc)
        },
        () => {
          setLocMsg(p.location ? `Location denied — using your profile location (${p.location}).` : 'Location denied and no profile location set — add a city in Profile.')
          if (p.location) run(p.location)
        },
        { timeout: 8000 }
      )
    } else if (p.location) {
      run(p.location)
    }
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingTypes.join('|')])

  async function aiCompare(map, loc) {
    const needList = allItems(p).filter((i) => statusOf(p, i.name) === 'need').map((i) => i.name)
    if (!needList.length) return
    const cacheKey = 'sap_storecmp_' + todayKey() + '_' + needList.join('|').length + '_' + Object.keys(map).length
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) { setCompareText(cached); return }
    } catch { /* ignore */ }
    const storesTxt = Object.entries(map)
      .map(([t, list]) => Array.isArray(list)
        ? `${t}: ${list.slice(0, 4).map((x) => `${x.name} (${x.km}km)`).join(', ') || 'none found'}`
        : `${t}: lookup failed`)
      .join(' | ')
    try {
      const reply = await askAI({
        profile: p,
        messages: [{
          role: 'user',
          text: `My shopping list: ${needList.join(', ')}. Real stores near me right now: ${storesTxt}. In under 120 words: recommend where to buy what — group items per best store, factor distance, typical price level and quality of these store types, and say which items are usually cheaper online. Do not invent exact prices.`,
        }],
      })
      setCompareText(reply)
      try { localStorage.setItem(cacheKey, reply) } catch { /* full */ }
    } catch { /* AI quota — the store list still shows */ }
  }

  function useLiveLocation() {
    if (!navigator.geolocation) { setLocMsg('GPS not available — links will use your profile location.'); return }
    setLocMsg('Getting your location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveLoc(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        setLocMsg('Store links now use your live location ✓')
      },
      () => setLocMsg('Location denied — links will use your profile location instead.')
    )
  }

  const { have, need } = counts(p)

  const items = useMemo(() => {
    const g = CATEGORY_GROUPS.find((x) => x.key === group)
    return allItems(p).filter((item) => {
      if (g?.match && !g.match.includes(item.cat)) return false
      const st = statusOf(p, item.name)
      if (view === 'have' && st !== 'have') return false
      if (view === 'need' && st !== 'need') return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
          !item.cat.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [p, view, group, search])

  function apply(patch) {
    const np = { ...getProfile(), ...patch }
    saveProfile(np)
    setP(np)
  }
  const setStatus = (name, status) => {
    const current = statusOf(p, name)
    apply(setStatusPatch(p, name, current === status ? '' : status))
  }
  function addCustom() {
    const n = search.trim()
    if (!n) return
    apply(addCustomPatch(p, n, customCat, view === 'need' ? 'need' : 'have'))
    setSearch('')
  }

  const shopping = allItems(p).filter((i) => statusOf(p, i.name) === 'need')

  return (
    <div className="screen with-tabbar">
      {onBack && <button className="mini ghost" type="button" onClick={onBack} style={{ marginBottom: 10 }}>← Back</button>}
      <h1>🎒 Inventory</h1>
      <p className="dim small" style={{ marginBottom: 12 }}>
        One list for everything you own or need — food, supplements, skin, hair,
        clothes. Diet, Care and Style all read from here.
      </p>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="mini ghost" type="button" onClick={useLiveLocation}>📍 Use my live location for store links</button>
      </div>
      {locMsg && <p className="dim small" style={{ margin: '-6px 0 10px' }}>{locMsg}</p>}

      <div className="seg">
        {[['all', `All`], ['have', `✅ Have (${have})`], ['need', `🛒 Need (${need})`]].map(([v, label]) => (
          <button key={v} type="button" className={view === v ? 'active' : ''} onClick={() => setView(v)}>{label}</button>
        ))}
      </div>

      <div className="chips">
        {CATEGORY_GROUPS.map((g) => (
          <button key={g.key} type="button" className={'chip chip-add' + (group === g.key ? ' chip-on' : '')}
            onClick={() => setGroup(g.key)}>{g.label}</button>
        ))}
      </div>

      <div className="todo-add" style={{ marginBottom: 6 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search… (or type a new item)" />
        {search.trim() && !items.some((i) => i.name.toLowerCase() === search.trim().toLowerCase()) && (
          <button type="button" onClick={addCustom}>＋ Add</button>
        )}
      </div>
      {search.trim() && !items.some((i) => i.name.toLowerCase() === search.trim().toLowerCase()) && (
        <label className="field"><span>Category for “{search.trim()}”</span>
          <select value={customCat} onChange={(e) => setCustomCat(e.target.value)}>
            {[...new Set(allItems(p).map((i) => i.cat))].map((c) => <option key={c}>{c}</option>)}
          </select></label>
      )}

      <section className="card">
        {items.length === 0 && <p className="dim small">Nothing here — switch view or add “{search.trim() || '…'}”.</p>}
        {items.map((item) => {
          const st = statusOf(p, item.name)
          return (
            <div className="inv-row" key={item.cat + item.name}>
              <div style={{ flex: 1 }}>
                <div className="ex-name small">{item.name}</div>
                <div className="dim" style={{ fontSize: 11.5 }}>{item.cat}{item.note ? ` · ${item.note}` : ''}</div>
              </div>
              <button type="button" className={'pill' + (st === 'have' ? ' on-have' : '')}
                onClick={() => setStatus(item.name, 'have')}>✅</button>
              <button type="button" className={'pill' + (st === 'need' ? ' on-need' : '')}
                onClick={() => setStatus(item.name, 'need')}>🛒</button>
            </div>
          )
        })}
      </section>

      {shopping.length > 0 && (
        <section className="card">
          <h2>🛒 Shopping list ({shopping.length})</h2>
          <p className="dim small" style={{ marginBottom: 8 }}>
            Tick when bought — it moves to “Have”. 🗺 opens real nearby stores on
            the map (live distance, hours, ratings); 🌐 opens live online
            listings with prices.
          </p>
          {findBusy && <p className="dim small" style={{ marginBottom: 8 }}>📡 Finding real stores around you…</p>}
          {shoppingTypes.map((t) => {
            const res = storeMap[t]
            if (!res) return null
            return (
              <div key={t} className="analysis" style={{ marginBottom: 10 }}>
                <p className="small" style={{ marginBottom: 6 }}><strong>📍 {t} near you</strong></p>
                {res.error && <p className="small dim">⚠️ {res.error}</p>}
                {Array.isArray(res) && res.length === 0 && (
                  <p className="small dim">None mapped within 3 km — try the 🗺 link on an item.</p>
                )}
                {Array.isArray(res) && res.map((st, idx) => (
                  <div className="todo-row" key={st.name + st.km}>
                    <div style={{ flex: 1 }}>
                      <span className="small"><strong>{st.name}</strong>{idx === 0 ? ' ⭐ closest' : ''}</span>
                      <div className="dim" style={{ fontSize: 11.5 }}>{st.km} km{st.kind ? ` · ${st.kind}` : ''}{st.addr ? ` · ${st.addr}` : ''}</div>
                    </div>
                    <a className="mini ghost" style={{ textDecoration: 'none', padding: '6px 10px' }}
                      href={directionsUrl(st)} target="_blank" rel="noreferrer">Go</a>
                  </div>
                ))}
              </div>
            )
          })}
          {compareText && (
            <div className="analysis" style={{ marginBottom: 12 }}>
              <p className="small" style={{ marginBottom: 6 }}><strong>🧠 Best-buy comparison</strong></p>
              <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{compareText}</p>
              <p className="dim" style={{ fontSize: 11, marginTop: 6 }}>
                Distances are live from your location; price/quality guidance is the AI's
                typical-range judgment — exact shelf prices aren't in any free data source.
              </p>
            </div>
          )}
          {shopping.map((i) => (
            <div className="todo-row" key={'s' + i.name}>
              <input type="checkbox" checked={false} onChange={() => setStatus(i.name, 'have')} aria-label={'bought ' + i.name} />
              <div style={{ flex: 1 }}>
                <span>{i.name}</span>
                <div className="shop-links">
                  <a href={nearbyUrl(i.name + ' ' + storeTypeFor(i.cat), linkLoc)} target="_blank" rel="noreferrer">🗺 Nearby</a>
                  <a href={onlineUrl(i.name)} target="_blank" rel="noreferrer">🌐 Online</a>
                </div>
              </div>
              <span className="dim small">{i.cat}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
