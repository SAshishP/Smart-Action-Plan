// Automatic deep analysis of the initial photos — runs in the background
// right after onboarding (and on demand from the Profile screen).

import { askAI, dataUrlToImage } from './ai.js'
import { parseAnalysis } from './analysis-parse.js'

const PROMPT = `Analyze these photos of me thoroughly (front/side views give you depth cues — use silhouette, shadows and proportions). Be honest but kind. Reply ONLY in this exact format, one line each. Use ONLY the allowed words; write "none" if nothing applies.

BODY_SHAPE: <one of: pear / apple / rectangle / hourglass / inverted triangle / slim / athletic / broad / heavyset>
FACE_SHAPE: <one of: oval / round / square / heart / oblong>
UNDERTONE: <one of: warm / cool / neutral>
POSTURE: <comma list from: forward head, rounded shoulders, anterior pelvic tilt, uneven shoulders, none>
FAT_AREAS: <comma list from: belly, love handles, thighs, arms, chest, back, face, none>
SKIN: <comma list from: blackheads, whiteheads, open pores, acne, scars, dark circles, pigmentation, none>
HAIR: <one short phrase: apparent type, density, visible damage>
NOTES: <2 short sentences: most important observation + encouragement>`

export async function runInitialAnalysis(profile) {
  const ph = profile?.photos || {}
  const picks = [ph.body_front, ph.body_left || ph.body_right, ph.face_front, ph.hair_front || ph.hair_top]
    .filter(Boolean).slice(0, 4)
  if (!picks.length) throw new Error('No initial photos to analyze.')
  const reply = await askAI({
    profile,
    images: picks.map(dataUrlToImage),
    messages: [{ role: 'user', text: PROMPT }],
  })
  return parseAnalysis(reply)
}
