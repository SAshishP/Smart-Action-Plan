// The deep photo scan — every attribute SAP can honestly read from the photos
// the user already gave it.
//
// Two AI calls, not one, and the reason is boring but decisive: the edge
// function caps maxOutputTokens at 1024, and 60-odd rated lines plus notes plus
// summaries truncates mid-reply. Call A is face + eyes + hair + scalp; call B
// is body composition + body skin. Each sends at most three photos.
//
// Backward compatibility is a hard requirement here. Call A still writes
// profile.faceAnalysis and profile.hairAnalysis in the exact shape Care.jsx
// already renders, and both calls still write profile.analysis.fatMap and
// .stretchMarks in the exact shape Body.jsx and fatmap.js already read. The new
// detail lands in profile.deepScan, so screens opt in when they are ready and
// nothing that works today breaks.
//
// What this deliberately does NOT do: ask for, or analyse, any photo that is
// not normal clothed or fitness-wear framing. The prompt carries a refusal path
// for it, and intimate-area guidance is served as text from skinprotocols.js
// instead. That is a product decision, not a technical limit — storing intimate
// photos of other people is a line this app does not go near.

import { askAI, dataUrlToImage } from './ai.js'

// Shared vocabularies. "unclear" is valid everywhere and is a real answer, not
// a failure — a confident wrong rating about someone's skin is worse than none.
const CONCERN = ['none', 'mild', 'moderate', 'significant'] // higher = worse
const QUALITY = ['poor', 'fair', 'good', 'excellent']       // higher = better
const LEVEL = ['low', 'medium', 'high']                     // neutral
const UNCLEAR = 'unclear'

export const SCALES = { concern: CONCERN, quality: QUALITY, level: LEVEL }

const A = (key, label, type, o = {}) => ({ key, label, type, ...o })

// ---------------------------------------------------------------- call A ---

export const FACE_GROUP = [
  A('pores', 'Open pores', 'concern'),
  A('blackheads', 'Blackheads', 'concern'),
  A('whiteheads', 'Whiteheads', 'concern'),
  A('pimples', 'Pimples / acne', 'concern'),
  A('scars', 'Acne scars & marks', 'concern'),
  A('darkspots', 'Dark spots / pigmentation', 'concern'),
  A('redness', 'Redness / irritation', 'concern'),
  A('oiliness', 'Oiliness / shine', 'concern'),
  A('facedryness', 'Dryness / flaking', 'concern'),
  A('texture', 'Skin texture', 'quality'),
  A('evenness', 'Tone evenness', 'quality'),
  A('radiance', 'Radiance / complexion', 'quality'),
  A('jawline', 'Jawline definition', 'quality'),
  A('submental', 'Under-chin fullness', 'concern'),
  A('facialhair', 'Facial hair', 'text', { values: ['none', 'light', 'medium', 'heavy'] }),
]

export const EYE_GROUP = [
  A('darkcircles', 'Under-eye darkness', 'concern'),
  A('eyebags', 'Under-eye bags', 'concern'),
  A('puffiness', 'Puffiness', 'concern'),
  // Which kind matters more than how bad it is: pigment responds to brightening,
  // vascular to sleep and caffeine, hollow to filler or nothing at all. Treating
  // the wrong one is why most under-eye routines quietly fail.
  A('undereyetype', 'Type of darkness', 'text', { values: ['pigment', 'hollow', 'vascular', 'mixed', 'unclear'] }),
  A('eyeredness', 'Eye redness', 'concern'),
]

export const HAIR_GROUP = [
  A('density', 'Hair density', 'level'),
  A('thickness', 'Strand thickness', 'level'),
  A('volume', 'Volume', 'level'),
  A('curl', 'Curl pattern', 'text', { values: ['straight', 'wavy', 'curly', 'coily'] }),
  A('splitends', 'Split ends', 'concern'),
  A('frizz', 'Frizz', 'concern'),
  A('dryness', 'Dryness / damage', 'concern'),
  A('breakage', 'Breakage', 'concern'),
  A('shine', 'Shine', 'quality'),
  A('hairline', 'Hairline', 'quality'),
  A('partwidth', 'Part width', 'level'),
  A('thinningpattern', 'Thinning pattern', 'text', { values: ['none', 'temples', 'crown', 'diffuse', 'patchy', 'unclear'] }),
]

export const SCALP_GROUP = [
  A('scalp', 'Scalp health', 'quality'),
  A('dandruff', 'Dandruff / flakes', 'concern'),
  // Oily and dry scalp are opposite problems with opposite treatments, and the
  // old single "scalp" rating collapsed them into one number that could not
  // tell you which routine you needed.
  A('scalpoil', 'Oily scalp', 'concern'),
  A('scalpdry', 'Dry scalp', 'concern'),
  A('scalpredness', 'Scalp redness', 'concern'),
  A('flaketype', 'Flake type', 'text', { values: ['none', 'dry white', 'oily yellow', 'thick patches', 'unclear'] }),
]

// ---------------------------------------------------------------- call B ---

export const BODY_GROUP = [
  A('definition', 'Muscle definition', 'quality'),
  A('firmness', 'Skin firmness', 'quality'),
  A('bfband', 'Visual body fat range', 'text', {
    values: ['under 15', '15-19', '20-24', '25-29', '30-34', '35-39', '40 plus', 'unclear'],
  }),
  A('sagchest', 'Chest line', 'concern'),
  A('sagarms', 'Upper-arm laxity', 'concern'),
  A('sagabdomen', 'Abdominal laxity', 'concern'),
]

export const BODYSKIN_GROUP = [
  A('bodytexture', 'Body skin texture', 'quality'),
  A('bodyacne', 'Body acne', 'concern'),
  A('kp', 'Strawberry skin (KP)', 'concern'),
  A('ingrownbody', 'Ingrown hairs', 'concern'),
  A('underarmdark', 'Underarm darkness', 'concern'),
  A('tanlines', 'Tan lines', 'concern'),
  A('discoloration', 'Uneven tone / dark areas', 'concern'),
  A('rash', 'Rash / irritation', 'concern'),
  A('hives', 'Hives / welts', 'concern'),
  A('bodyscars', 'Marks & scars', 'concern'),
  A('cellulite', 'Cellulite', 'concern'),
  A('bodydryness', 'Dry skin', 'concern'),
  // Neutral information. The app rates it and never suggests removing it.
  A('bodyhair', 'Body hair', 'level'),
]

export const ALL_ATTRS = [
  ...FACE_GROUP, ...EYE_GROUP, ...HAIR_GROUP, ...SCALP_GROUP,
  ...BODY_GROUP, ...BODYSKIN_GROUP,
]

export const GROUPS = [
  { key: 'faceskin', label: 'Face skin', icon: '🧴', attrs: FACE_GROUP, call: 'a' },
  { key: 'eyes', label: 'Eyes', icon: '👁️', attrs: EYE_GROUP, call: 'a' },
  { key: 'hair', label: 'Hair', icon: '💇', attrs: HAIR_GROUP, call: 'a' },
  { key: 'scalp', label: 'Scalp', icon: '🌿', attrs: SCALP_GROUP, call: 'a' },
  { key: 'bodycomp', label: 'Body composition', icon: '📐', attrs: BODY_GROUP, call: 'b' },
  { key: 'bodyskin', label: 'Body skin', icon: '✨', attrs: BODYSKIN_GROUP, call: 'b' },
]

const attrByKey = Object.fromEntries(ALL_ATTRS.map((a) => [a.key, a]))

// --------------------------------------------------------------- prompts ---

// Declared once at the top rather than repeated on every line — that alone
// roughly halves the prompt against the old one-legend-per-line format.
const HEADER = `Before anything else, check the images. If any image shows nudity, exposed genitals, a bare chest, underwear-only framing, or a person who may be under 18, reply with EXACTLY one line and nothing else:
UNSUITABLE: <short neutral reason>
Do not describe the image, do not rate anything, do not explain, do not apologise at length. One line, then stop.

Otherwise you are a kind, plain-spoken skin, hair and body assistant helping me build my own health plan. This is not a diagnosis and you must not name a medical condition.

Rate ONLY what you can genuinely see. A confident wrong rating about my skin is worse than no rating at all. If something is out of frame, covered by clothing, blurred, badly lit, or too far away to judge, write the single word "unclear" as the value and say why in the note. "unclear" is the correct answer in that situation, not a failure — I would rather have ten honest lines than thirty confident guesses.

Value sets — use these exact words and nothing else:
C = none | mild | moderate | significant
Q = poor | fair | good | excellent
L = low | medium | high
N = 0 | 1 | 2 | 3
Any line may instead be "unclear".

Format: one line per key, exactly "key: value | note". The note is 8 words maximum. No markdown, no bold, no bullets, no headings of your own, no introduction, no closing paragraph. Give every key a line, in the order listed. Do not repeat the key list back to me.`

const CODE = { concern: 'C', quality: 'Q', level: 'L' }

const lines = (attrs) =>
  attrs.map((a) => `${a.key}: ${a.type === 'text' ? (a.values || []).join(' | ') : CODE[a.type]}`).join('\n')

function promptA() {
  return `${HEADER}

FACE
${lines(FACE_GROUP)}

EYES
${lines(EYE_GROUP)}

HAIR
${lines(HAIR_GROUP)}

SCALP
${lines(SCALP_GROUP)}

FAT_MAP: face=N

Three rules for this reply:
- scalpoil and scalpdry are opposite problems. At most ONE of them may be above mild. If you cannot tell which, put mild on both and say so in the notes.
- undereyetype: pigment means the darkness is in the skin itself, vascular means blue or purple showing through thin skin, hollow means a shadow cast by the groove under the eye. If the light makes this impossible to call, say unclear.
- Do not comment on my weight, attractiveness, age or anything I did not ask about.

FACE_SUMMARY: <two short kind sentences — the one thing worth working on first, then something genuinely true and encouraging>
HAIR_SUMMARY: <two short kind sentences — same shape>`
}

function promptB() {
  return `${HEADER}

Judge my shape from the clothed silhouette, posture and shadow only. Never describe or speculate about anything under my clothing. Rate skin only on the areas my clothing actually leaves visible — arms, forearms, lower legs, neck, knees, elbows, and shoulders or midsection if they are uncovered. Skin you cannot see is "unclear", never a guess. Flat overhead lighting hides muscle definition: if the light is flat, say unclear rather than rating me lower.

BODY
${lines(BODY_GROUP)}
FAT_MAP: belly=N, lovehandles=N, thighs=N, hips=N, arms=N, chest=N, back=N, calves=N

BODY SKIN
${lines(BODYSKIN_GROUP)}
STRETCH_MARKS: none | new (red or purple) | mature (white or silver) | both | unclear | <where, or none>

Four rules for this reply:
- bfband: estimate my body fat range from the silhouette using cues appropriate to my sex, which is in my profile. It is an estimate from a photograph — if you are not confident to within one band, say unclear.
- sagchest: judge the line of the chest from the clothed side view and shoulder posture only. Say nothing about breast tissue.
- underarmdark: only rate this if an underarm is actually visible in the photo. With arms down it is not. Say unclear.
- bodyhair is neutral information, not a problem. Rate it flatly and never suggest removing it.

BODY_SUMMARY: <two short kind sentences — the one thing worth working on first, then something genuinely true and encouraging>`
}

// --------------------------------------------------------------- parsing ---

// Refusal comes back as a single line. Detected before anything else so a
// refused scan never half-populates the report with garbage.
export function unsuitableReason(reply) {
  const m = String(reply).match(/^\s*UNSUITABLE:\s*(.+)$/im)
  return m ? m[1].trim().slice(0, 200) : null
}

function scoreFor(type, value) {
  if (value === UNCLEAR || !value) return { score: 0, tone: 'neutral' }
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

// One "key: value | note" line, from anywhere in the reply. Models drift on
// spacing and punctuation, so the match is deliberately loose — but the value
// must still be one of the allowed words, or it is treated as unrated.
function parseLine(reply, attr) {
  const m = String(reply).match(new RegExp('^\\s*' + attr.key + '\\s*[:\\-]\\s*(.+)$', 'im'))
  let raw = '', note = ''
  if (m) {
    const parts = m[1].split('|')
    raw = (parts[0] || '').trim()
    note = parts.slice(1).join('|').trim()
  }
  const low = raw.toLowerCase()
  if (!raw) return { key: attr.key, label: attr.label, type: attr.type, value: '', note: '', score: 0, tone: 'neutral', rated: false }
  if (low.includes(UNCLEAR)) {
    return { key: attr.key, label: attr.label, type: attr.type, value: UNCLEAR, note, score: 0, tone: 'neutral', rated: false }
  }
  if (attr.type === 'text') {
    // Longest match first, so "dry white" beats a stray "dry".
    const found = [...(attr.values || [])].sort((a, b) => b.length - a.length).find((v) => low.includes(v))
    return { key: attr.key, label: attr.label, type: attr.type, value: found || raw, note, score: 0, tone: 'neutral', rated: Boolean(found) }
  }
  const found = (SCALES[attr.type] || []).find((v) => low.includes(v)) || ''
  const { score, tone } = scoreFor(attr.type, found)
  return { key: attr.key, label: attr.label, type: attr.type, value: found || UNCLEAR, note, score, tone, rated: Boolean(found) }
}

const parseGroup = (reply, attrs) => attrs.map((a) => parseLine(reply, a))

const summaryOf = (reply, tag) => {
  const m = String(reply).match(new RegExp('^\\s*' + tag + '\\s*[:\\-]\\s*(.+)$', 'im'))
  return m ? m[1].trim() : ''
}

// "belly=2, lovehandles=3" → { belly: 2, lovehandles: 3 }. Same shape the
// existing fatmap.js already consumes.
function parseFatMap(reply) {
  const m = String(reply).match(/FAT_MAP\s*[:\-]\s*([^\n]+)/i)
  if (!m) return null
  const out = {}
  for (const part of m[1].split(/[,;]/)) {
    const hit = part.match(/([a-z][a-z\s]*?)\s*[=:]\s*(\d)/i)
    if (!hit) continue
    const key = hit[1].trim().toLowerCase().replace(/\s+/g, '')
    const v = Number(hit[2])
    if (key && v >= 0 && v <= 3) out[key] = v
  }
  return Object.keys(out).length ? out : null
}

function parseStretchMarks(reply) {
  const m = String(reply).match(/STRETCH_MARKS\s*[:\-]\s*([^\n]+)/i)
  if (!m) return null
  const [stageRaw, areaRaw] = m[1].split('|')
  const s = String(stageRaw || '').toLowerCase()
  if (!s || s.includes('none') || s.includes(UNCLEAR)) return null
  const stage = s.includes('both') ? 'both'
    : /new|red|purple/.test(s) ? 'new'
    : /mature|white|silver/.test(s) ? 'mature'
    : 'unclear'
  const areas = String(areaRaw || '')
    .split(/[,;]|\sand\s/)
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x && x !== 'none' && x !== UNCLEAR)
  return { stage, areas }
}

// Flatten every parsed item into { key: {value, note} } for protocolsFor().
export function findingsOf(deepScan = {}) {
  const out = {}
  for (const g of GROUPS) {
    for (const item of deepScan[g.key] || []) out[item.key] = item
  }
  return out
}

// How much of the scan the model could actually rate. A low number is the
// honest signal that the photos need retaking, not that the body is unreadable.
export function scanConfidence(deepScan = {}) {
  const items = GROUPS.flatMap((g) => deepScan[g.key] || [])
  if (!items.length) return { pct: 0, rated: 0, total: 0 }
  const rated = items.filter((i) => i.rated).length
  return { pct: Math.round((rated / items.length) * 100), rated, total: items.length }
}

// ----------------------------------------------------------------- calls ---

const pick = (photos, ...keys) => keys.map((k) => photos?.[k]).filter(Boolean)

export class UnsuitableImage extends Error {
  constructor(reason) {
    super(reason)
    this.name = 'UnsuitableImage'
    this.unsuitable = true
  }
}

// Call A — face, eyes, hair, scalp. Returns a patch that keeps faceAnalysis and
// hairAnalysis in the shape Care.jsx already renders.
export async function runFaceScan(profile) {
  const ph = profile?.photos || {}
  const imgs = [...pick(ph, 'face_front', 'face_left'), ...pick(ph, 'hair_top', 'hair_front')].slice(0, 3)
  if (!imgs.length) throw new Error('Add a face or hair photo first — Profile → Initial photos.')

  const reply = await askAI({
    profile,
    source: 'deepscan-face',
    images: imgs.map(dataUrlToImage),
    messages: [{ role: 'user', text: `Photo 1 is my face; the later photos are my hair and scalp.\n\n${promptA()}` }],
  })

  const bad = unsuitableReason(reply)
  if (bad) throw new UnsuitableImage(bad)

  const at = new Date().toISOString().slice(0, 10)
  const faceskin = parseGroup(reply, FACE_GROUP)
  const eyes = parseGroup(reply, EYE_GROUP)
  const hair = parseGroup(reply, HAIR_GROUP)
  const scalp = parseGroup(reply, SCALP_GROUP)

  return {
    at,
    faceskin, eyes, hair, scalp,
    faceSummary: summaryOf(reply, 'FACE_SUMMARY'),
    hairSummary: summaryOf(reply, 'HAIR_SUMMARY'),
    faceFatMap: parseFatMap(reply),
    // The old shape, untouched, so Care.jsx keeps working with no edit at all.
    legacy: {
      faceAnalysis: { at, items: [...faceskin, ...eyes], summary: summaryOf(reply, 'FACE_SUMMARY') },
      hairAnalysis: { at, items: [...hair, ...scalp], summary: summaryOf(reply, 'HAIR_SUMMARY') },
    },
  }
}

// Call B — body composition and body skin.
export async function runBodySkinScan(profile) {
  const ph = profile?.photos || {}
  const imgs = [ph.body_front, ph.body_left || ph.body_right, ph.body_back].filter(Boolean).slice(0, 3)
  if (!imgs.length) throw new Error('Add a body photo first — Profile → Initial photos.')

  const reply = await askAI({
    profile,
    source: 'deepscan-body',
    images: imgs.map(dataUrlToImage),
    messages: [{ role: 'user', text: `These are photos of me in normal fitness clothing.\n\n${promptB()}` }],
  })

  const bad = unsuitableReason(reply)
  if (bad) throw new UnsuitableImage(bad)

  return {
    at: new Date().toISOString().slice(0, 10),
    bodycomp: parseGroup(reply, BODY_GROUP),
    bodyskin: parseGroup(reply, BODYSKIN_GROUP),
    bodySummary: summaryOf(reply, 'BODY_SUMMARY'),
    fatMap: parseFatMap(reply),
    stretchMarks: parseStretchMarks(reply),
  }
}

// Both calls, merged into one profile patch. Runs them in sequence rather than
// in parallel on purpose: the free Gemini tier rate-limits bursts, and two
// sequential calls that both succeed beat two parallel ones where the second
// gets a 429.
export async function runDeepScan(profile) {
  const ph = profile?.photos || {}
  const hasFace = Boolean(ph.face_front || ph.face_left || ph.hair_top || ph.hair_front)
  const hasBody = Boolean(ph.body_front || ph.body_left || ph.body_right || ph.body_back)
  if (!hasFace && !hasBody) throw new Error('Add at least one photo first — Profile → Initial photos.')

  const face = hasFace ? await runFaceScan(profile) : null
  const body = hasBody ? await runBodySkinScan(profile) : null
  const at = new Date().toISOString().slice(0, 10)

  const deepScan = {
    at,
    faceskin: face?.faceskin || [],
    eyes: face?.eyes || [],
    hair: face?.hair || [],
    scalp: face?.scalp || [],
    bodycomp: body?.bodycomp || [],
    bodyskin: body?.bodyskin || [],
    faceSummary: face?.faceSummary || '',
    hairSummary: face?.hairSummary || '',
    bodySummary: body?.bodySummary || '',
  }
  deepScan.confidence = scanConfidence(deepScan)

  const patch = { deepScan }
  if (face?.legacy) Object.assign(patch, face.legacy)

  // Keep feeding the existing body report the two fields it already reads.
  const fatMap = { ...(body?.fatMap || {}), ...(face?.faceFatMap || {}) }
  const analysis = { ...(profile.analysis || {}) }
  if (Object.keys(fatMap).length) analysis.fatMap = fatMap
  if (body?.stretchMarks) analysis.stretchMarks = body.stretchMarks
  if (body?.bodySummary) analysis.read = body.bodySummary
  analysis.scanAt = at
  patch.analysis = analysis

  return patch
}

export { attrByKey }
