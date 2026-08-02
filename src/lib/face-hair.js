// Detailed, per-attribute face & hair analysis from photos.
// This is separate from the lightweight initial `analysis` (analysis.js) —
// it powers the full breakdown shown separately on the Care screen and is
// stored under profile.faceAnalysis / profile.hairAnalysis so the small
// `analysis` object other screens depend on stays untouched.

import { askAI, dataUrlToImage } from './ai.js'

const CONCERN = ['none', 'mild', 'moderate', 'significant'] // higher = worse
const QUALITY = ['poor', 'fair', 'good', 'excellent']       // higher = better
const LEVEL = ['low', 'medium', 'high']                      // neutral

// key must match the line label the AI replies with, and be unique across
// BOTH lists (the parser scans the whole reply per key).
export const FACE_ATTRS = [
  { key: 'pores', label: 'Pores', type: 'concern' },
  { key: 'blackheads', label: 'Blackheads', type: 'concern' },
  { key: 'whiteheads', label: 'Whiteheads', type: 'concern' },
  { key: 'pimples', label: 'Pimples / acne', type: 'concern' },
  { key: 'scars', label: 'Scars & marks', type: 'concern' },
  { key: 'darkspots', label: 'Dark spots / pigmentation', type: 'concern' },
  { key: 'darkcircles', label: 'Under-eye darkness', type: 'concern' },
  { key: 'eyebags', label: 'Under-eye bags', type: 'concern' },
  { key: 'puffiness', label: 'Facial puffiness', type: 'concern' },
  { key: 'redness', label: 'Redness / irritation', type: 'concern' },
  { key: 'oiliness', label: 'Oiliness / shine', type: 'concern' },
  { key: 'evenness', label: 'Skin-tone evenness', type: 'quality' },
  { key: 'jawline', label: 'Jawline definition', type: 'quality' },
  { key: 'facialhair', label: 'Facial hair', type: 'text', values: ['none', 'light', 'medium', 'heavy'] },
]

export const HAIR_ATTRS = [
  { key: 'density', label: 'Hair density', type: 'level' },
  { key: 'thickness', label: 'Strand thickness', type: 'level' },
  { key: 'volume', label: 'Volume', type: 'level' },
  { key: 'curl', label: 'Curl pattern', type: 'text', values: ['straight', 'wavy', 'curly', 'coily'] },
  { key: 'scalp', label: 'Scalp health', type: 'quality' },
  { key: 'dandruff', label: 'Dandruff / flakes', type: 'concern' },
  { key: 'splitends', label: 'Split ends', type: 'concern' },
  { key: 'frizz', label: 'Frizz', type: 'concern' },
  { key: 'dryness', label: 'Dryness / damage', type: 'concern' },
  { key: 'breakage', label: 'Breakage / thinning', type: 'concern' },
  { key: 'shine', label: 'Shine', type: 'quality' },
  { key: 'hairline', label: 'Hairline', type: 'quality' },
]

const ALLOWED = { concern: CONCERN, quality: QUALITY, level: LEVEL }

// Map an allowed word to a 0–100 meter score + a display tone.
// An unrecognized/omitted value (index -1) is "not rated" → neutral, never a
// confident green/red.
function scaleFor(type, value) {
  if (type === 'concern') {
    const i = CONCERN.indexOf(value)
    if (i < 0) return { score: 0, tone: 'neutral' }
    return { score: (i / (CONCERN.length - 1)) * 100, tone: i === 0 ? 'good' : i === 1 ? 'ok' : 'bad' }
  }
  if (type === 'quality') {
    const i = QUALITY.indexOf(value)
    if (i < 0) return { score: 0, tone: 'neutral' }
    return { score: ((i + 1) / QUALITY.length) * 100, tone: i >= 2 ? 'good' : i === 1 ? 'ok' : 'bad' }
  }
  if (type === 'level') {
    const i = LEVEL.indexOf(value)
    if (i < 0) return { score: 0, tone: 'neutral' }
    return { score: ((i + 1) / LEVEL.length) * 100, tone: 'neutral' }
  }
  return { score: 0, tone: 'neutral' }
}

// Pull one attribute line "key: value | note" from anywhere in the reply.
function parseBlock(reply, attrs) {
  const text = String(reply)
  return attrs.map((a) => {
    const m = text.match(new RegExp('^\\s*' + a.key + '\\s*[:\\-]\\s*(.+)$', 'im'))
    let raw = '', note = ''
    if (m) {
      const parts = m[1].split('|')
      raw = (parts[0] || '').trim()
      note = parts.slice(1).join('|').trim()
    }
    const low = raw.toLowerCase()
    if (a.type === 'text') {
      const found = (a.values || []).find((v) => low.includes(v))
      return { key: a.key, label: a.label, type: a.type, value: found || raw || '—', note }
    }
    const found = (ALLOWED[a.type] || []).find((v) => low.includes(v)) || ''
    const { score, tone } = scaleFor(a.type, found)
    return { key: a.key, label: a.label, type: a.type, value: found || '—', note, score, tone }
  })
}

const summaryOf = (reply, tag) => {
  const m = String(reply).match(new RegExp(tag + '\\s*[:\\-]\\s*(.+)', 'i'))
  return m ? m[1].trim() : ''
}

function promptLines(attrs) {
  return attrs
    .map((a) => `${a.key}: <${a.type === 'text' ? (a.values || []).join('|') : ALLOWED[a.type].join('|')}> | short note`)
    .join('\n')
}

const PROMPT = `You are a kind skincare & haircare assistant. Describe ONLY what is visibly present in my photos — honest but encouraging, never a medical diagnosis.
Reply in EXACTLY this format, one attribute per line as "key: value | short note". Use ONLY the allowed values shown in <>. If something is not clearly visible, use the mildest/lowest value and write "not clearly visible" in the note.

FACE:
${promptLines(FACE_ATTRS)}

HAIR:
${promptLines(HAIR_ATTRS)}

FACE_SUMMARY: <2 short kind sentences: the one thing to work on first + encouragement>
HAIR_SUMMARY: <2 short kind sentences: the one thing to work on first + encouragement>`

// Runs one AI call over whatever photos we have and returns both breakdowns.
// Callers store only the halves they have a photo for.
export async function runFaceHairAnalysis(profile, faceUrl, hairUrl) {
  const images = []
  const labels = []
  if (faceUrl) { images.push(dataUrlToImage(faceUrl)); labels.push('face') }
  if (hairUrl) { images.push(dataUrlToImage(hairUrl)); labels.push('hair/scalp') }
  if (!images.length) throw new Error('Add a face or hair photo first.')
  const intro = labels.length === 2
    ? 'Photo 1 is my face; photo 2 is my hair/scalp. '
    : `This photo is my ${labels[0]}. `
  const reply = await askAI({ profile, images, source: 'face-hair', messages: [{ role: 'user', text: intro + PROMPT }] })
  const at = new Date().toISOString().slice(0, 10)
  return {
    faceAnalysis: { at, items: parseBlock(reply, FACE_ATTRS), summary: summaryOf(reply, 'FACE_SUMMARY') },
    hairAnalysis: { at, items: parseBlock(reply, HAIR_ATTRS), summary: summaryOf(reply, 'HAIR_SUMMARY') },
  }
}
