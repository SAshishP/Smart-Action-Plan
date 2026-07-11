// Pure parser for the structured photo-analysis reply (testable, no imports).
// Must stay in sync with the vocabulary lib/analysis.js's PROMPT advertises.

const BODY_SHAPE_WORDS = ['pear', 'apple', 'rectangle', 'hourglass', 'inverted triangle', 'slim', 'athletic', 'broad', 'heavyset']
const FACE_SHAPE_WORDS = ['oval', 'round', 'square', 'heart', 'oblong']
const UNDERTONE_WORDS = ['warm', 'cool', 'neutral']

// Captures everything up to the next "TAG:" line or end of string, not just
// the first newline — otherwise a multi-line reply (e.g. NOTES spanning two
// sentences) silently loses everything after its first line.
const grab = (text, tag) => {
  const m = String(text).match(new RegExp(tag + ':\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)', 'i'))
  return m ? m[1].trim() : ''
}
const list = (text, tag) =>
  grab(text, tag).split(/[,;]/).map((s) => s.trim().toLowerCase())
    .filter((s) => s && s !== 'none' && s !== 'n/a')

// Strips stray formatting (markdown, punctuation) the model sometimes wraps
// around a tag value, then only accepts it if it's one of the words the
// prompt actually advertised — otherwise a reply like "**BODY_SHAPE:**
// athletic" would store "** Athletic" verbatim with no validation at all.
function matchWord(raw, words) {
  const v = String(raw || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!v) return null
  const hit = words.find((w) => v === w || v.includes(w))
  return hit ? hit.replace(/\b\w/g, (c) => c.toUpperCase()) : null
}

export function parseAnalysis(reply) {
  const bodyShape = matchWord(grab(reply, 'BODY_SHAPE'), BODY_SHAPE_WORDS)
  const faceShape = matchWord(grab(reply, 'FACE_SHAPE'), FACE_SHAPE_WORDS)
  const undertone = matchWord(grab(reply, 'UNDERTONE'), UNDERTONE_WORDS)
  const analysis = {
    posture: list(reply, 'POSTURE'),
    fatAreas: list(reply, 'FAT_AREAS'),
    skinConcerns: list(reply, 'SKIN'),
    hairNotes: grab(reply, 'HAIR'),
    summary: grab(reply, 'NOTES'),
    at: new Date().toISOString().slice(0, 10),
  }
  const patch = { analysis }
  if (bodyShape) patch.bodyShape = bodyShape
  if (faceShape) patch.faceShape = faceShape
  if (undertone) patch.undertone = undertone
  return patch
}
