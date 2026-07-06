import { useState } from 'react'
import {
  BODY_SHAPES, FACE_SHAPES, UNDERTONES, PALETTES, OCCASIONS,
  buildOutfit, haircutGuide, beardGuide, groomingGuide, parseTag,
} from '../lib/style.js'
import { getProfile, saveProfile, todayKey } from '../lib/store.js'
import { askAI, dataUrlToImage } from '../lib/ai.js'
import { compressImage } from '../lib/img.js'
import { uploadProgressPhoto } from '../lib/cloud.js'

// A dress or an ethnic piece (kurta/saree/etc) covers both the Top and
// Bottom slots, so it should satisfy either without a direct type match.
function wardrobeHas(pieceKey, wardrobe = []) {
  const direct = wardrobe.find((w) => String(w.type || '').toLowerCase() === pieceKey)
  if (direct) return direct
  if (pieceKey === 'top' || pieceKey === 'bottom') {
    return wardrobe.find((w) => ['dress', 'ethnic'].includes(String(w.type || '').toLowerCase())) || null
  }
  return null
}

export default function Style({ profile }) {
  const [p, setP] = useState(profile)
  const [occasion, setOccasion] = useState('Daily casual')
  const [detecting, setDetecting] = useState(false)
  const [detectMsg, setDetectMsg] = useState('')
  const [wBusy, setWBusy] = useState(false)
  const [wMsg, setWMsg] = useState('')
  const [outfitHelp, setOutfitHelp] = useState('')
  const [helpBusy, setHelpBusy] = useState(false)

  const gender = p.gender === 'female' ? 'female' : 'male'
  const tone = String(p.undertone || '').toLowerCase()
  const palette = PALETTES[tone] || null
  const outfit = buildOutfit(p, occasion)
  const hair = haircutGuide(p)
  const wardrobe = p.wardrobe || []

  function save(patch) {
    const np = { ...getProfile(), ...patch }
    saveProfile(np)
    setP(np)
  }

  async function detectFromPhotos() {
    const body = p.photos?.body_front
    const face = p.photos?.face_front
    if (!body && !face) { setDetectMsg('No onboarding photos found — pick manually below.'); return }
    setDetecting(true); setDetectMsg('')
    try {
      const images = []
      if (body) images.push(dataUrlToImage(body))
      if (face) images.push(dataUrlToImage(face))
      const reply = await askAI({
        profile: p, images,
        messages: [{
          role: 'user',
          text: `${body ? 'Photo 1 is my full body (front).' : ''} ${face ? 'The last photo is my face (front).' : ''} Classify for styling purposes. Reply with exactly these lines and nothing else:
BODY_SHAPE: one of ${BODY_SHAPES.join(' / ')}
FACE_SHAPE: one of ${FACE_SHAPES.join(' / ')}
UNDERTONE: one of ${UNDERTONES.join(' / ')}`,
        }],
      })
      const bs = BODY_SHAPES.find((x) => x.toLowerCase().startsWith(String(parseTag(reply, 'BODY_SHAPE') || '').toLowerCase().slice(0, 4)))
      const fs = FACE_SHAPES.find((x) => x.toLowerCase() === String(parseTag(reply, 'FACE_SHAPE') || '').toLowerCase())
      const ut = UNDERTONES.find((x) => x.toLowerCase() === String(parseTag(reply, 'UNDERTONE') || '').toLowerCase())
      const patch = {}
      if (bs && body) patch.bodyShape = bs
      if (fs && face) patch.faceShape = fs
      if (ut && face) patch.undertone = ut
      if (Object.keys(patch).length) {
        save(patch)
        setDetectMsg('Detected ✓ — you can still override below if it feels wrong.')
      } else {
        setDetectMsg('Could not classify confidently — pick manually below.')
      }
    } catch (e) {
      setDetectMsg('⚠️ ' + e.message)
    } finally {
      setDetecting(false)
    }
  }

  async function addWardrobe(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setWBusy(true); setWMsg('')
    try {
      const dataUrl = await compressImage(file, 560, 0.6)
      let type = 'top', name = 'Clothing item', color = ''
      try {
        const reply = await askAI({
          profile: p, images: [dataUrlToImage(dataUrl)],
          messages: [{ role: 'user', text: 'Identify this clothing item for a wardrobe app. Reply exactly one line: ITEM: <short name> | TYPE: <top/bottom/dress/layer/footwear/accessory/ethnic> | COLOR: <main color>' }],
        })
        name = parseTag(reply, 'ITEM') || name
        type = (parseTag(reply, 'TYPE') || type).toLowerCase()
        color = parseTag(reply, 'COLOR') || ''
      } catch { /* AI offline → save as unlabeled; user can still see it */ }
      const item = { id: Date.now(), date: todayKey(), name, type, color, dataUrl }
      const next = [...wardrobe, item].slice(-12) // keep the 12 most recent on-device
      save({ wardrobe: next })
      uploadProgressPhoto(dataUrl, 'wardrobe_' + item.id, item.date)
      setWMsg(`Added: ${name}${color ? ' (' + color + ')' : ''}`)
    } catch {
      setWMsg('That photo could not be read — try another one.')
    } finally {
      setWBusy(false)
    }
  }

  async function completeOutfit(item) {
    setHelpBusy(true); setOutfitHelp('')
    try {
      const others = wardrobe.filter((w) => w.id !== item.id).map((w) => `${w.name} (${w.type}${w.color ? ', ' + w.color : ''})`).join('; ') || 'nothing else yet'
      const reply = await askAI({
        profile: p, images: [dataUrlToImage(item.dataUrl)],
        messages: [{
          role: 'user',
          text: `This is my "${item.name}". Build a complete ${occasion} outfit around it for my body shape (${p.bodyShape || 'unknown'}) and ${p.undertone || 'unknown'} undertone. My wardrobe also has: ${others}. Prefer what I own; only then suggest 1–2 things to buy. Keep it short.`,
        }],
      })
      setOutfitHelp(reply)
    } catch (e) {
      setOutfitHelp('⚠️ ' + e.message)
    } finally {
      setHelpBusy(false)
    }
  }

  return (
    <div className="screen with-tabbar">
      <h1>Style</h1>

      <section className="card">
        <h2>Your analysis</h2>
        <button type="button" onClick={detectFromPhotos} disabled={detecting}>
          {detecting ? 'Analyzing your photos…' : '✨ Detect from my photos'}
        </button>
        {detectMsg && <p className="dim small" style={{ marginTop: 8 }}>{detectMsg}</p>}
        <div className="row" style={{ marginTop: 12 }}>
          <label className="field"><span>Body shape</span>
            <select value={p.bodyShape || ''} onChange={(e) => save({ bodyShape: e.target.value })}>
              <option value="">Select…</option>
              {BODY_SHAPES.map((s) => <option key={s}>{s}</option>)}
            </select></label>
          <label className="field"><span>Face shape</span>
            <select value={p.faceShape || ''} onChange={(e) => save({ faceShape: e.target.value })}>
              <option value="">Select…</option>
              {FACE_SHAPES.map((s) => <option key={s}>{s}</option>)}
            </select></label>
        </div>
        <label className="field"><span>Skin undertone</span>
          <select value={p.undertone || ''} onChange={(e) => save({ undertone: e.target.value })}>
            <option value="">Select…</option>
            {UNDERTONES.map((s) => <option key={s}>{s}</option>)}
          </select></label>
      </section>

      {palette && (
        <section className="card">
          <h2>🎨 Your colors ({p.undertone})</h2>
          <p className="dim small">Wear more of:</p>
          <div className="swatches">
            {palette.best.map(([name, hex]) => (
              <span key={name} className="swatch"><i style={{ background: hex }} />{name}</span>
            ))}
          </div>
          <p className="dim small" style={{ marginTop: 10 }}>Go easy on:</p>
          <div className="swatches">
            {palette.avoid.map(([name, hex]) => (
              <span key={name} className="swatch off"><i style={{ background: hex }} />{name}</span>
            ))}
          </div>
          <p className="small" style={{ marginTop: 10 }}>💡 {palette.tip}</p>
        </section>
      )}

      <section className="card">
        <h2>👔 Dress for the occasion</h2>
        <div className="chips">
          {OCCASIONS.map((o) => (
            <button key={o} type="button" className={'chip chip-add' + (occasion === o ? ' chip-on' : '')}
              onClick={() => { setOccasion(o); setOutfitHelp('') }}>{o}</button>
          ))}
        </div>
        {outfit.pieces.map((pc) => {
          const owned = wardrobeHas(pc.key, wardrobe)
          return (
            <div key={pc.part} style={{ padding: '7px 0' }}>
              <div className="ex-name small">{pc.part}</div>
              <div className="dim small">{pc.idea}</div>
              {owned && <div className="small" style={{ color: '#7ee2b8' }}>✓ From your wardrobe: {owned.name}</div>}
            </div>
          )
        })}
        <p className="small" style={{ marginTop: 8 }}><strong>Fit tweaks for you</strong></p>
        {outfit.shapeNotes.map((n, i) => <p key={i} className="dim small">• {n}</p>)}
        <p className="small" style={{ marginTop: 8 }}><strong>Underneath it all</strong></p>
        <p className="dim small">{outfit.innersNote}</p>
      </section>

      <section className="card">
        <h2>💇 Haircut for your {hair.face} face</h2>
        {hair.cuts.map((c, i) => <p key={i} className="small" style={{ marginBottom: 4 }}>• {c}</p>)}
        <p className="small" style={{ marginTop: 10 }}><strong>Tell the barber/stylist exactly this</strong></p>
        {hair.barberSpec.map((c, i) => <p key={i} className="dim small">• {c}</p>)}
        <p className="small" style={{ marginTop: 10 }}><strong>Style it yourself</strong></p>
        <ol className="small" style={{ margin: '4px 0 8px 18px' }}>
          {hair.styleSteps.map((c, i) => <li key={i}>{c}</li>)}
        </ol>
        <a className="small" style={{ color: 'var(--accent)' }} target="_blank" rel="noreferrer"
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent((hair.cuts[0] || 'haircut') + ' ' + gender + ' tutorial')}`}>
          ▶ Watch the top recommendation
        </a>
      </section>

      {gender === 'male' ? (
        <section className="card">
          <h2>🧔 Beard guide ({beardGuide(p).face} face)</h2>
          {beardGuide(p).shapes.map((s, i) => <p key={i} className="small" style={{ marginBottom: 4 }}>• {s}</p>)}
          <p className="small" style={{ marginTop: 10 }}><strong>Trim & maintain</strong></p>
          <ol className="small" style={{ margin: '4px 0 0 18px' }}>
            {beardGuide(p).steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      ) : (
        <section className="card">
          <h2>💅 Grooming & makeup</h2>
          <p className="small"><strong>Hair removal</strong></p>
          {groomingGuide(p).hairRemoval.map((s, i) => <p key={i} className="dim small">• {s}</p>)}
          <p className="small" style={{ marginTop: 10 }}><strong>Mani-pedi at home</strong></p>
          <ol className="small" style={{ margin: '4px 0 0 18px' }}>
            {groomingGuide(p).nails.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <p className="small" style={{ marginTop: 10 }}><strong>Makeup that matches your undertone</strong></p>
          <ol className="small" style={{ margin: '4px 0 0 18px' }}>
            {groomingGuide(p).makeup.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      )}

      <section className="card">
        <h2>👗 My wardrobe ({wardrobe.length})</h2>
        <p className="dim small" style={{ marginBottom: 10 }}>
          Snap your clothes — the AI names them, and outfit suggestions start
          using what you actually own.
        </p>
        <label className="photo-add">
          {wBusy ? 'Adding to wardrobe…' : '📸 Add a clothing photo'}
          <input type="file" accept="image/*" onChange={addWardrobe} disabled={wBusy} />
        </label>
        {wMsg && <p className="dim small" style={{ marginBottom: 8 }}>{wMsg}</p>}
        <div className="wardrobe-grid">
          {wardrobe.map((w) => (
            <div key={w.id} className="wardrobe-item">
              <img src={w.dataUrl} alt={w.name} />
              <div className="small wname">{w.name}</div>
              <div className="row">
                <button className="mini" type="button" onClick={() => completeOutfit(w)} disabled={helpBusy}>
                  {helpBusy ? '…' : 'Complete outfit'}
                </button>
                <button className="mini ghost" type="button"
                  onClick={() => save({ wardrobe: wardrobe.filter((x) => x.id !== w.id) })}>✕</button>
              </div>
            </div>
          ))}
        </div>
        {outfitHelp && <div className="analysis small">{outfitHelp}</div>}
      </section>
    </div>
  )
}
