import { useMemo, useState } from 'react'
import { CATEGORY_GROUPS, allItems, statusOf, counts, setStatusPatch, addCustomPatch } from '../lib/inventory.js'
import { getProfile, saveProfile } from '../lib/store.js'
import { nearbyUrl, onlineUrl, storeTypeFor } from '../lib/shop.js'
import { findNearbyStores, directionsUrl } from '../lib/places.js'

export default function Inventory({ profile, onBack }) {
  const [p, setP] = useState(profile)
  const [view, setView] = useState('all')     // all | have | need
  const [group, setGroup] = useState('all')
  const [search, setSearch] = useState('')
  const [customCat, setCustomCat] = useState('Oils & Spices')
  const [liveLoc, setLiveLoc] = useState('')      // fresh GPS just for store links
  const [locMsg, setLocMsg] = useState('')
  const linkLoc = liveLoc || p.location || ''
  const [stores, setStores] = useState(null)     // {type, list} | {type, error}
  const [findBusy, setFindBusy] = useState('')

  async function findStores(type) {
    setFindBusy(type)
    setStores(null)
    try {
      const list = await findNearbyStores(linkLoc, type)
      setStores({ type, list })
    } catch (e) {
      setStores({ type, error: e.message })
    } finally {
      setFindBusy('')
    }
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
        One list for everything you own or need — food, supplements, skin, hair.
        Diet and Care read from here. (Style keeps its own photographed wardrobe.)
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
          <div className="chips">
            {[...new Set(shopping.map((i) => storeTypeFor(i.cat)))].map((t) => (
              <button key={t} type="button" className="chip chip-add" disabled={findBusy === t}
                onClick={() => findStores(t)}>
                {findBusy === t ? '📡 finding…' : `📍 ${t} near you`}
              </button>
            ))}
          </div>
          {stores && (
            <div className="analysis" style={{ marginBottom: 12 }}>
              {stores.error && <p className="small">⚠️ {stores.error}</p>}
              {stores.list && stores.list.length === 0 && (
                <p className="small dim">No mapped {stores.type} found within 3 km — try the 🗺 map link on an item instead.</p>
              )}
              {stores.list && stores.list.map((st) => (
                <div className="todo-row" key={st.name + st.km}>
                  <div style={{ flex: 1 }}>
                    <span className="small"><strong>{st.name}</strong></span>
                    <div className="dim" style={{ fontSize: 11.5 }}>{st.km} km{st.kind ? ` · ${st.kind}` : ''}{st.addr ? ` · ${st.addr}` : ''}</div>
                  </div>
                  <a className="mini ghost" style={{ textDecoration: 'none', padding: '6px 10px' }}
                    href={directionsUrl(st)} target="_blank" rel="noreferrer">Directions</a>
                </div>
              ))}
              {stores.list && stores.list.length > 0 && (
                <p className="dim" style={{ fontSize: 11, marginTop: 6 }}>
                  Real stores from OpenStreetMap with live distance from you. Shelf prices &
                  ratings aren’t in free data — the Directions link opens Maps, which shows
                  hours and ratings; the Assistant can give typical price ranges.
                </p>
              )}
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
