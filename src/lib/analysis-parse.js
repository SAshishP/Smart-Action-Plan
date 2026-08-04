// Pure parser for the structured photo-analysis reply (testable, no imports).
//
// Every field is optional by design: models drop lines, and half an analysis is
// far better than a thrown error. Anything missing simply comes back empty.

// Prefer a line that starts with the tag, but fall back to matching it anywhere
// — which is what this parser always did, and models do sometimes run a label
// on after other text.
const grab = (text, tag) => {
  const s = String(text)
  const m = s.match(new RegExp('^\\s*' + tag + ':\\s*([^\\n]+)', 'im')) || s.match(new RegExp(tag + ':\\s*([^\\n]+)', 'i'))
  return m ? m[1].trim() : ''
}

const list = (text, tag) =>
  grab(text, tag)
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && s !== 'none' && s !== 'n/a' && s !== '-')

const title = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

// "belly=2, lovehandles=3, thighs=1" → { belly: 2, lovehandles: 3, thighs: 1 }
// Tolerates "love handles = 2" and "belly: 2" as well, because models drift.
function parseFatMap(text) {
  const raw = grab(text, 'FAT_MAP')
  if (!raw) return null
  const out = {}
  for (const part of raw.split(/[,;]/)) {
    const m = part.match(/([a-z][a-z\s]*?)\s*[=:]\s*(\d)/i)
    if (!m) continue
    const key = m[1].trim().toLowerCase().replace(/\s+/g, '')
    const v = Number(m[2])
    if (key && v >= 0 && v <= 3) out[key] = v
  }
  return Object.keys(out).length ? out : null
}

// "new (red or purple) | thighs and hips"
function parseStretchMarks(text) {
  const raw = grab(text, 'STRETCH_MARKS')
  if (!raw) return null
  const [stageRaw, areaRaw] = raw.split('|')
  const s = String(stageRaw || '').toLowerCase()
  if (!s || s.includes('none')) return null
  const stage = s.includes('both')
    ? 'both'
    : s.includes('new') || s.includes('red') || s.includes('purple')
    ? 'new'
    : s.includes('mature') || s.includes('white') || s.includes('silver')
    ? 'mature'
    : 'unclear'
  const areas = String(areaRaw || '')
    .split(/[,;]|\sand\s/)
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x && x !== 'none')
  return { stage, areas }
}

export function parseAnalysis(reply) {
  const bodyShape = grab(reply, 'BODY_SHAPE')
  const faceShape = grab(reply, 'FACE_SHAPE')
  const undertone = grab(reply, 'UNDERTONE')
  const bfRaw = grab(reply, 'BF_ESTIMATE').match(/(\d{1,2}(?:\.\d)?)/)
  const bfEstimate = bfRaw ? Number(bfRaw[1]) : null

  const analysis = {
    posture: list(reply, 'POSTURE'),
    fatAreas: list(reply, 'FAT_AREAS'),
    skinConcerns: list(reply, 'SKIN'),
    concerns: list(reply, 'CONCERNS'),
    sagging: list(reply, 'SAGGING'),
    hairNotes: grab(reply, 'HAIR'),
    muscle: grab(reply, 'MUSCLE').toLowerCase(),
    summary: grab(reply, 'NOTES'),
    at: new Date().toISOString().slice(0, 10),
  }

  const fatMap = parseFatMap(reply)
  if (fatMap) analysis.fatMap = fatMap

  const marks = parseStretchMarks(reply)
  if (marks) {
    analysis.stretchMarks = marks
    if (!analysis.concerns.includes('stretchmarks')) analysis.concerns.push('stretchmarks')
  }

  // A sagging line the model filled in implies the matching concern, so the
  // Body screen shows a protocol instead of just naming the problem.
  if (analysis.sagging.length) {
    const map = [
      [/breast|chest|bust/, 'breastsag'],
      [/arm|tricep|underarm/, 'batwings'],
      [/belly|stomach|abdomen|tummy/, 'bellypooch'],
      [/chin|neck|jaw/, 'doublechin'],
      [/skin|thigh|glute|overall|body/, 'looseskin'],
    ]
    for (const area of analysis.sagging) {
      const hit = map.find(([re]) => re.test(area))
      if (hit && !analysis.concerns.includes(hit[1])) analysis.concerns.push(hit[1])
    }
  }

  if (bfEstimate != null && bfEstimate > 3 && bfEstimate < 70) analysis.bfEstimate = bfEstimate

  const patch = { analysis }
  if (bodyShape) patch.bodyShape = title(bodyShape)
  if (faceShape) patch.faceShape = title(faceShape)
  if (undertone) patch.undertone = title(undertone)
  return patch
}
