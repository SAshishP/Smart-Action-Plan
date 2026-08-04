// Deep analysis of the initial photos — runs in the background right after
// onboarding, and on demand from the Profile and Body screens.
//
// Two calls live here:
//   runInitialAnalysis  — the original lightweight read every screen depends on
//   runBodyScan         — the full body-composition read behind 📐 Body, which
//                         also feeds the AI the real numbers from body.js so it
//                         is reasoning from a measured BMI and body fat %
//                         rather than guessing them off a photo.
//
// Both write into profile.analysis. The keys the old version produced are still
// produced, so nothing that already reads profile.analysis breaks.

import { askAI, dataUrlToImage } from './ai.js'
import { parseAnalysis } from './analysis-parse.js'
import { bodyMetrics, metricsSummary } from './body.js'
import { activeConditions } from './conditions.js'

const FAT_KEYS = 'belly, lovehandles, thighs, hips, arms, chest, back, face, calves'
const CONCERN_KEYS = 'lovehandles, stretchmarks, cellulite, looseskin, doublechin, bellypooch, posture'

function prompt(profile) {
  const female = String(profile?.gender).toLowerCase() === 'female'
  const concerns = female ? `${CONCERN_KEYS}, breastsag, batwings` : CONCERN_KEYS
  return `Analyze these photos of me thoroughly. Front and side views give you depth cues — use silhouette, shadows and proportions. Be honest but kind: this is for my own health plan, so a soft answer that hides something is not useful to me. Never body-shame.

Reply ONLY in this exact format, one line each. Use ONLY the allowed words. Write "none" where nothing applies.

BODY_SHAPE: <one of: pear / apple / rectangle / hourglass / inverted triangle / slim / athletic / broad / heavyset>
FACE_SHAPE: <one of: oval / round / square / heart / oblong>
UNDERTONE: <one of: warm / cool / neutral>
POSTURE: <comma list from: forward head, rounded shoulders, anterior pelvic tilt, uneven shoulders, none>
FAT_AREAS: <comma list of the areas carrying the most fat, from: belly, love handles, thighs, arms, chest, back, face, none>
FAT_MAP: <rate EVERY area 0–3 where 0=lean, 1=light, 2=moderate, 3=high. Exactly this format: ${FAT_KEYS
    .split(', ')
    .map((k) => k + '=<0-3>')
    .join(', ')}>
BF_ESTIMATE: <your visual estimate of my body fat percentage, a number only>
MUSCLE: <one of: minimal / some definition / clearly defined / athletic>
CONCERNS: <comma list from: ${concerns}, none>
STRETCH_MARKS: <one of: none / new (red or purple) / mature (white or silver) / both> | <where, or "none">
SAGGING: <comma list of areas showing skin laxity or sagging, or none>
SKIN: <comma list from: blackheads, whiteheads, open pores, acne, scars, dark circles, pigmentation, none>
HAIR: <one short phrase: apparent type, density, visible damage>
NOTES: <2 short sentences: the single most important observation, then genuine encouragement>`
}

function pickPhotos(profile) {
  const ph = profile?.photos || {}
  return [ph.body_front, ph.body_left || ph.body_right, ph.body_back, ph.face_front, ph.hair_front || ph.hair_top]
    .filter(Boolean)
    .slice(0, 4)
}

export async function runInitialAnalysis(profile) {
  const picks = pickPhotos(profile)
  if (!picks.length) throw new Error('No initial photos to analyze.')
  const reply = await askAI({
    profile,
    source: 'onboarding-analysis',
    images: picks.map(dataUrlToImage),
    messages: [{ role: 'user', text: prompt(profile) }],
  })
  return parseAnalysis(reply)
}

// The full read behind the Body report. Same structured block as above, plus a
// written breakdown — and crucially, the numbers we already calculated are
// handed to the model up front so it interprets them instead of inventing them.
export async function runBodyScan(profile, extraPhotoUrl) {
  const picks = pickPhotos(profile)
  const images = [...picks]
  if (extraPhotoUrl) images.unshift(extraPhotoUrl)
  if (!images.length) throw new Error('Add at least one body photo first — Profile → Initial photos.')

  const metrics = bodyMetrics(profile)
  const conds = activeConditions(profile)
  const facts = metricsSummary(profile, metrics)

  const context = [
    `Here are my measured numbers, already calculated — use these as fact, do not re-estimate them: ${facts || 'not enough measurements yet'}.`,
    conds.length
      ? `My health conditions: ${conds.map((c) => c.name).join(', ')}. Every suggestion must respect them.`
      : '',
    profile.targetWeight ? `My target weight is ${profile.targetWeight} kg.` : '',
    profile.goals ? `My goal in my own words: "${profile.goals}".` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const reply = await askAI({
    profile,
    source: 'body-scan',
    images: images.slice(0, 4).map(dataUrlToImage),
    messages: [
      {
        role: 'user',
        text: `${context}\n\n${prompt(profile)}\n\nAfter the structured lines above, add a blank line and then a section headed READ: — 4 to 6 short sentences interpreting what you see against those numbers. Say what my photos show that the numbers alone miss, which single area to prioritise first and why, and what realistically changes in the next 8 weeks. Talk to me directly, plainly, no lists.`,
      },
    ],
  })

  const patch = parseAnalysis(reply)
  const read = String(reply).match(/READ:\s*([\s\S]+)$/i)
  if (read) patch.analysis.read = read[1].trim()
  patch.analysis.scanAt = new Date().toISOString().slice(0, 10)
  return patch
}
