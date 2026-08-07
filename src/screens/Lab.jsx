// 🧪 Region Lab — owner-only, not in the user-facing app.
//
// You mark two boxes on one of your own photos: the area you care about, and a
// reference patch of ordinary skin nearby. The app measures both and reports
// the difference. It never guesses what body part it is looking at, and it
// never prints a grade.
//
// Everything here happens on the device against a photo already in the profile.
// Nothing is uploaded and no model is called, which is exactly why it works on
// regions a hosted model would refuse.

import { useEffect, useMemo, useRef, useState } from 'react'
import { measureRegion, compareToReference, describe, trend, LIMITS } from '../lib/regionmetrics.js'
import { getProfile, saveProfile } from '../lib/store.js'

const SLOT_LABELS = {
  body_front: 'Body · Front', body_left: 'Body · Left', body_right: 'Body · Right', body_back: 'Body · Back',
  face_front: 'Face · Front', face_left: 'Face · Left', face_right: 'Face · Right',
  hair_front: 'Hair · Front', hair_left: 'Hair · Left', hair_right: 'Hair · Right',
  hair_back: 'Hair · Back', hair_top: 'Hair · Top',
}

const MODE = { target: 'Area of interest', reference: 'Reference skin' }

export default function Lab({ profile, onBack, onProfileUpdate }) {
  const [p, setP] = useState(profile)
  const [slot, setSlot] = useState(() => Object.keys(profile.photos || {})[0] || '')
  const [mode, setMode] = useState('target')
  const [boxes, setBoxes] = useState({ target: null, reference: null })
  const [drag, setDrag] = useState(null)
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')
  const [label, setLabel] = useState('')
  const [showLimits, setShowLimits] = useState(false)

  const imgRef = useRef(null)
  const wrapRef = useRef(null)
  const dataRef = useRef(null) // cached ImageData for the loaded photo

  const photos = p.photos || {}
  const slots = Object.keys(photos)
  const src = photos[slot] || ''

  // Decode the chosen photo once into an offscreen canvas. Every measurement
  // reads from this, so dragging a box costs nothing.
  useEffect(() => {
    dataRef.current = null
    setResult(null)
    setBoxes({ target: null, reference: null })
    if (!src) return
    let alive = true
    const im = new Image()
    im.onload = () => {
      if (!alive) return
      const c = document.createElement('canvas')
      c.width = im.naturalWidth
      c.height = im.naturalHeight
      const ctx = c.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(im, 0, 0)
      try {
        dataRef.current = ctx.getImageData(0, 0, c.width, c.height)
        setMsg('')
      } catch {
        setMsg('That photo could not be read for measurement.')
      }
    }
    im.onerror = () => alive && setMsg('That photo could not be loaded.')
    im.src = src
    return () => { alive = false }
  }, [src])

  // Pointer position → normalised 0-1 coords inside the displayed image.
  function normFrom(e) {
    const el = imgRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top
    return {
      x: Math.min(1, Math.max(0, cx / r.width)),
      y: Math.min(1, Math.max(0, cy / r.height)),
    }
  }

  const startDrag = (e) => {
    const pt = normFrom(e)
    if (!pt) return
    setDrag({ x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y })
  }
  const moveDrag = (e) => {
    if (!drag) return
    const pt = normFrom(e)
    if (!pt) return
    e.preventDefault?.()
    setDrag((d) => ({ ...d, x1: pt.x, y1: pt.y }))
  }
  const endDrag = () => {
    if (!drag) return
    const box = {
      x: Math.min(drag.x0, drag.x1),
      y: Math.min(drag.y0, drag.y1),
      w: Math.abs(drag.x1 - drag.x0),
      h: Math.abs(drag.y1 - drag.y0),
    }
    setDrag(null)
    if (box.w < 0.02 || box.h < 0.02) { setMsg('That box is too small — drag a bigger one.'); return }
    setBoxes((b) => ({ ...b, [mode]: box }))
    setMsg('')
    // Nudge towards marking the other box, since a target without a reference
    // produces nothing comparable between sessions.
    setMode(mode === 'target' ? 'reference' : 'target')
  }

  function measure() {
    const data = dataRef.current
    if (!data) { setMsg('Photo not ready yet.'); return }
    if (!boxes.target || !boxes.reference) {
      setMsg('Mark both boxes — the area of interest and a reference patch of ordinary skin on the same photo.')
      return
    }
    const target = measureRegion(data, boxes.target)
    const reference = measureRegion(data, boxes.reference)
    if (!target.ready) { setMsg(target.why); return }
    if (!reference.ready) { setMsg(reference.why); return }
    setResult({ target, reference, cmp: compareToReference(target, reference) })
    setMsg('')
  }

  function saveReading() {
    if (!result) return
    const name = label.trim() || `${SLOT_LABELS[slot] || slot}`
    const cur = getProfile()
    const log = cur.regionLog || {}
    const entry = {
      at: new Date().toISOString().slice(0, 10),
      slot,
      boxes,
      target: result.target,
      reference: result.reference,
    }
    const next = { ...log, [name]: [...(log[name] || []), entry].slice(-40) }
    const np = { ...cur, regionLog: next }
    saveProfile(np)
    setP(np)
    onProfileUpdate?.(np)
    setMsg(`Saved under "${name}" ✓`)
  }

  const logNames = Object.keys(p.regionLog || {})
  const activeName = label.trim() || `${SLOT_LABELS[slot] || slot}`
  const activeTrend = useMemo(
    () => trend((p.regionLog || {})[activeName] || []),
    [p.regionLog, activeName]
  )

  const liveBox = drag && {
    x: Math.min(drag.x0, drag.x1), y: Math.min(drag.y0, drag.y1),
    w: Math.abs(drag.x1 - drag.x0), h: Math.abs(drag.y1 - drag.y0),
  }
  const pctBox = (b) => ({
    left: b.x * 100 + '%', top: b.y * 100 + '%',
    width: b.w * 100 + '%', height: b.h * 100 + '%',
  })

  return (
    <div className="screen with-tabbar">
      {onBack && <button className="mini ghost" type="button" onClick={onBack} style={{ marginBottom: 10 }}>← Back</button>}
      <h1>🧪 Region Lab</h1>
      <div className="consent-box" style={{ marginTop: 8 }}>
        <strong>Owner tool — not visible to users.</strong> Measures pixels you box on your own
        photos. It has no idea what body part it is looking at and will never print a grade,
        because a grade from these pixels would be invented. Everything stays on this device.
      </div>

      {slots.length === 0 && (
        <section className="card"><p className="dim small">No photos on this profile yet.</p></section>
      )}

      {slots.length > 0 && (
        <>
          <section className="card">
            <h2>1 · Photo</h2>
            <div className="chips">
              {slots.map((s) => (
                <button key={s} type="button"
                  className={'chip chip-add' + (slot === s ? ' chip-on' : '')}
                  style={slot === s ? undefined : { background: 'var(--card)', color: 'var(--text-dim)', borderColor: 'var(--line)' }}
                  onClick={() => setSlot(s)}>
                  {SLOT_LABELS[s] || s}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>2 · Mark two boxes</h2>
            <p className="dim small" style={{ marginBottom: 8 }}>
              Drag on the photo. Mark the area you care about, then a patch of ordinary skin
              nearby as reference. The reference is what makes readings comparable between
              sessions — without it, a passing cloud looks like progress.
            </p>
            <div className="chips" style={{ marginBottom: 10 }}>
              {Object.entries(MODE).map(([k, lbl]) => (
                <button key={k} type="button"
                  className={'chip chip-add' + (mode === k ? ' chip-on' : '')}
                  style={mode === k ? undefined : { background: 'var(--card)', color: 'var(--text-dim)', borderColor: 'var(--line)' }}
                  onClick={() => setMode(k)}>
                  {boxes[k] ? '✓ ' : ''}{lbl}
                </button>
              ))}
            </div>

            <div ref={wrapRef} className="lab-stage"
              onMouseDown={startDrag} onMouseMove={moveDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
              onTouchStart={startDrag} onTouchMove={moveDrag} onTouchEnd={endDrag}>
              <img ref={imgRef} src={src} alt="" draggable="false" />
              {boxes.target && <i className="lab-box lab-target" style={pctBox(boxes.target)} />}
              {boxes.reference && <i className="lab-box lab-ref" style={pctBox(boxes.reference)} />}
              {liveBox && <i className="lab-box lab-live" style={pctBox(liveBox)} />}
            </div>

            <div className="row" style={{ marginTop: 10 }}>
              <button type="button" onClick={measure}>Measure</button>
              <button className="ghost" type="button" style={{ width: 'auto' }}
                onClick={() => { setBoxes({ target: null, reference: null }); setResult(null); setMode('target') }}>
                Clear
              </button>
            </div>
          </section>
        </>
      )}

      {result && (
        <section className="card">
          <h2>3 · What the pixels say</h2>
          {describe(result.cmp).map((line, i) => (
            <p key={i} className="small" style={{ marginBottom: 6 }}>{line}</p>
          ))}

          <table className="lab-table">
            <thead>
              <tr><th>Measure</th><th>Area</th><th>Reference</th><th>Δ</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Lightness L*</td>
                <td>{result.target.lightness}</td>
                <td>{result.reference.lightness}</td>
                <td>{result.cmp.dL > 0 ? '+' : ''}{result.cmp.dL}</td>
              </tr>
              <tr>
                <td>Redness a*</td>
                <td>{result.target.redness}</td>
                <td>{result.reference.redness}</td>
                <td>{result.cmp.dRedness > 0 ? '+' : ''}{result.cmp.dRedness}</td>
              </tr>
              <tr>
                <td>Texture</td>
                <td>{result.target.texture ?? '—'}</td>
                <td>{result.reference.texture ?? '—'}</td>
                <td>{result.cmp.dTexture == null ? '—' : (result.cmp.dTexture > 0 ? '+' : '') + result.cmp.dTexture}</td>
              </tr>
              <tr>
                <td>Hair coverage %</td>
                <td>{result.target.hairCoverage ?? '—'}</td>
                <td>{result.reference.hairCoverage ?? '—'}</td>
                <td>{result.cmp.dHair == null ? '—' : (result.cmp.dHair > 0 ? '+' : '') + result.cmp.dHair}</td>
              </tr>
              <tr>
                <td>Unevenness (sd)</td>
                <td>{result.target.unevenness}</td>
                <td>{result.reference.unevenness}</td>
                <td>—</td>
              </tr>
              <tr>
                <td>ITA° / band</td>
                <td>{result.target.ita ?? '—'} {result.target.itaBand || ''}</td>
                <td>{result.reference.ita ?? '—'} {result.reference.itaBand || ''}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          <p className="dim" style={{ fontSize: 11.5, marginTop: 8 }}>
            Measured over {result.target.n.toLocaleString()} pixels in the area and{' '}
            {result.reference.n.toLocaleString()} in the reference, middle 80% by lightness only —
            highlights, hairs and box edges are trimmed out before averaging.
          </p>

          <div className="row" style={{ marginTop: 12 }}>
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder={`Name this reading (default: ${SLOT_LABELS[slot] || slot})`} />
            <button className="ghost" type="button" style={{ width: 'auto' }} onClick={saveReading}>Save</button>
          </div>
        </section>
      )}

      {activeTrend.ready && (
        <section className="card">
          <h2>📉 {activeName}</h2>
          <p className="small">{activeTrend.note}</p>
          <div className="chips" style={{ marginTop: 8 }}>
            <span className="chip">{activeTrend.points} readings</span>
            <span className="chip">{activeTrend.from} → {activeTrend.to}</span>
            <span className="chip">{activeTrend.direction}</span>
          </div>
          {activeTrend.rows.map((r, i) => (
            <div className="todo-row" key={i}>
              <span className="small" style={{ flex: 1 }}>{r.at}</span>
              <span className="dim small">ΔL* {r.cmp.dL > 0 ? '+' : ''}{r.cmp.dL}</span>
            </div>
          ))}
        </section>
      )}

      {logNames.length > 0 && (
        <section className="card">
          <h2>Saved series</h2>
          <div className="chips">
            {logNames.map((n) => (
              <button key={n} type="button" className="chip chip-add"
                onClick={() => setLabel(n)}>
                {n} ({(p.regionLog[n] || []).length})
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <button className="ghost" type="button" onClick={() => setShowLimits(!showLimits)}>
          {showLimits ? 'Close' : 'What this cannot do ›'}
        </button>
        {showLimits && (
          <div style={{ marginTop: 10 }}>
            {LIMITS.map((l, i) => <p key={i} className="small no" style={{ marginBottom: 6 }}>✗ {l}</p>)}
          </div>
        )}
      </section>

      {msg && <p className="dim small" style={{ textAlign: 'center', marginBottom: 10 }}>{msg}</p>}
    </div>
  )
}
