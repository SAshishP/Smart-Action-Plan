// Pure parser for the structured photo-analysis reply (testable, no imports)

const grab = (text, tag) => {
  const m = String(text).match(new RegExp(tag + ':\\s*([^\\n]+)', 'i'))
  return m ? m[1].trim() : ''
}
const list = (text, tag) =>
  grab(text, tag).split(/[,;]/).map((s) => s.trim().toLowerCase())
    .filter((s) => s && s !== 'none' && s !== 'n/a')

export function parseAnalysis(reply) {
  const bodyShape = grab(reply, 'BODY_SHAPE')
  const faceShape = grab(reply, 'FACE_SHAPE')
  const undertone = grab(reply, 'UNDERTONE')
  const analysis = {
    posture: list(reply, 'POSTURE'),
    fatAreas: list(reply, 'FAT_AREAS'),
    skinConcerns: list(reply, 'SKIN'),
    hairNotes: grab(reply, 'HAIR'),
    summary: grab(reply, 'NOTES'),
    at: new Date().toISOString().slice(0, 10),
  }
  const patch = { analysis }
  if (bodyShape) patch.bodyShape = bodyShape.replace(/\b\w/g, (c) => c.toUpperCase())
  if (faceShape) patch.faceShape = faceShape.replace(/\b\w/g, (c) => c.toUpperCase())
  if (undertone) patch.undertone = undertone.replace(/\b\w/g, (c) => c.toUpperCase())
  return patch
}
