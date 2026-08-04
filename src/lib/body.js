// Body composition engine — BMI, body-fat %, ratios, lean mass, and the
// forecast for "how many days until I hit my goal".
//
// Pure math over the profile + measurements. No AI, no network, no storage.
// Every number carries how it was derived and how much to trust it, because a
// confident-looking wrong number is worse than an honest range.
//
// Measurements live on the profile in cm: neck, chest, waist, hips, thigh, arm.
// measurementLog is an optional history: [{ date, waist, hips, … }].

import { ageFromDob } from './store.js'
import { calorieFactor, lossRateFactor, lossRateNote, deficitBlocked, activeConditions } from './conditions.js'

export const KCAL_PER_KG_FAT = 7700

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

// ---------------------------------------------------------------- BMI -----

// South Asian, Chinese and South-East Asian populations carry more visceral
// fat at the same BMI, so the WHO publishes lower action points for them.
// Using the wrong set on an Indian user calls a genuinely at-risk waist
// "normal" — so the ethnicity field actually changes the thresholds here.
const ASIAN = /(indian|south asian|asian|pakistan|banglades|sri lank|nepal|chinese|filipino|malay|indonesi|viet|thai|korean|japanese)/i

export function usesAsianCutoffs(profile = {}) {
  return ASIAN.test(String(profile.ethnicity || '') + ' ' + String(profile.location || ''))
}

const BANDS_STD = [
  [0, 18.5, 'Underweight', 'warn'],
  [18.5, 25, 'Healthy weight', 'good'],
  [25, 30, 'Overweight', 'warn'],
  [30, 35, 'Obese (class I)', 'bad'],
  [35, 40, 'Obese (class II)', 'bad'],
  [40, Infinity, 'Obese (class III)', 'bad'],
]

const BANDS_ASIAN = [
  [0, 18.5, 'Underweight', 'warn'],
  [18.5, 23, 'Healthy weight', 'good'],
  [23, 25, 'At risk', 'warn'],
  [25, 30, 'Obese (class I)', 'bad'],
  [30, Infinity, 'Obese (class II)', 'bad'],
]

export function bmi(profile = {}) {
  const w = num(profile.weight)
  const h = num(profile.height)
  if (!w || !h) {
    return { ready: false, why: 'Add your height and weight in Profile to see your BMI.' }
  }
  const m = h / 100
  const value = Math.round((w / (m * m)) * 10) / 10
  const asian = usesAsianCutoffs(profile)
  const bands = asian ? BANDS_ASIAN : BANDS_STD
  const band = bands.find(([lo, hi]) => value >= lo && value < hi) || bands[bands.length - 1]
  const top = asian ? 22.9 : 24.9
  const healthyLo = Math.round(18.5 * m * m * 10) / 10
  const healthyHi = Math.round(top * m * m * 10) / 10

  return {
    ready: true,
    value,
    category: band[2],
    tone: band[3],
    asian,
    healthyRange: [healthyLo, healthyHi],
    // Where the marker sits on a 15–40 gauge
    pct: Math.min(100, Math.max(0, ((value - 15) / 25) * 100)),
    kgToHealthy:
      value > top ? Math.round((w - healthyHi) * 10) / 10
        : value < 18.5 ? Math.round((healthyLo - w) * 10) / 10
        : 0,
    note: asian
      ? 'Using the WHO Asian cut-offs (healthy tops out at 23, not 25) — South Asian bodies carry more visceral fat at the same BMI.'
      : 'Using the standard WHO cut-offs.',
    caveat:
      'BMI knows your height and weight and nothing else. A muscular person reads "overweight" on it and is not. Treat it as one line on the page, not the verdict — body fat % and your waist below are the more useful numbers.',
  }
}

// ------------------------------------------------------- body fat % -------

// ACE reference bands.
const BF_BANDS = {
  male: [
    [0, 6, 'Essential fat', 'warn'],
    [6, 14, 'Athlete', 'good'],
    [14, 18, 'Fitness', 'good'],
    [18, 25, 'Average', 'warn'],
    [25, Infinity, 'High', 'bad'],
  ],
  female: [
    [0, 14, 'Essential fat', 'warn'],
    [14, 21, 'Athlete', 'good'],
    [21, 25, 'Fitness', 'good'],
    [25, 32, 'Average', 'warn'],
    [32, Infinity, 'High', 'bad'],
  ],
}

const sexOf = (profile) => (String(profile.gender).toLowerCase() === 'female' ? 'female' : 'male')

// US Navy circumference method — the most accurate thing you can do with a
// tape measure. Needs neck + waist (+ hips for women), all in cm.
function navyBodyFat(profile) {
  const h = num(profile.height)
  const neck = num(profile.neck)
  const waist = num(profile.waist)
  const hips = num(profile.hips)
  if (!h || !neck || !waist) return null
  const female = sexOf(profile) === 'female'
  if (female && !hips) return null

  const v = female
    ? 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.221 * Math.log10(h)) - 450
    : 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450

  if (!Number.isFinite(v) || v <= 3 || v >= 70) return null
  return Math.round(v * 10) / 10
}

// Deurenberg equation — a BMI-and-age estimate. Less accurate, but it works
// with data every user already gave us at onboarding.
function bmiBodyFat(profile, bmiValue) {
  const age = Number(ageFromDob(profile.dob))
  if (!bmiValue || !Number.isFinite(age)) return null
  const v = 1.2 * bmiValue + 0.23 * age - 10.8 * (sexOf(profile) === 'female' ? 0 : 1) - 5.4
  if (!Number.isFinite(v) || v <= 3 || v >= 70) return null
  return Math.round(v * 10) / 10
}

export function bodyFat(profile = {}, bmiResult = bmi(profile)) {
  const sex = sexOf(profile)
  const navy = navyBodyFat(profile)
  const est = bmiResult.ready ? bmiBodyFat(profile, bmiResult.value) : null
  const value = navy ?? est

  if (value == null) {
    return {
      ready: false,
      why: 'Add your date of birth, height and weight — and a neck + waist measurement for the accurate version.',
      missing: missingForNavy(profile),
    }
  }

  const bands = BF_BANDS[sex]
  const band = bands.find(([lo, hi]) => value >= lo && value < hi) || bands[bands.length - 1]
  const method = navy != null ? 'navy' : 'bmi'
  // Navy is ±3–4 points against DEXA; Deurenberg is closer to ±5–6.
  const margin = method === 'navy' ? 3.5 : 5.5
  const w = num(profile.weight)
  const fatMassKg = w ? Math.round(w * (value / 100) * 10) / 10 : null
  const leanMassKg = w && fatMassKg != null ? Math.round((w - fatMassKg) * 10) / 10 : null
  const fitnessTop = sex === 'female' ? 25 : 18

  return {
    ready: true,
    value,
    range: [Math.max(2, Math.round((value - margin) * 10) / 10), Math.round((value + margin) * 10) / 10],
    category: band[2],
    tone: band[3],
    method,
    sex,
    fatMassKg,
    leanMassKg,
    healthyRange: sex === 'female' ? [21, 32] : [14, 25],
    fitnessTarget: fitnessTop,
    pct: Math.min(100, Math.max(0, (value / (sex === 'female' ? 50 : 42)) * 100)),
    alsoEstimated: navy != null && est != null ? est : null,
    missing: method === 'navy' ? [] : missingForNavy(profile),
    note:
      method === 'navy'
        ? 'Measured with the US Navy tape method from your neck, waist' +
          (sex === 'female' ? ' and hips' : '') +
          ' — the most accurate result possible without a DEXA scan.'
        : 'Estimated from BMI and age, because some measurements are missing. Add the ones listed and this switches to the far more accurate tape method.',
    caveat: `Every method that isn't a DEXA scan has a margin — treat this as ±${margin} points. What matters is the direction it moves over months, not the decimal today.`,
  }
}

function missingForNavy(profile) {
  const need = [
    ['neck', 'neck (measure just below the Adam’s apple, tape level)'],
    ['waist', 'waist (at the belly button, relaxed — do not suck in)'],
  ]
  if (sexOf(profile) === 'female') need.push(['hips', 'hips (widest point of the seat)'])
  if (!num(profile.height)) need.unshift(['height', 'height'])
  return need.filter(([k]) => !num(profile[k])).map(([, label]) => label)
}

// ------------------------------------------------------------ ratios ------

// Waist-to-height is the best single-tape predictor of visceral fat risk there
// is — better than BMI, and the threshold is the same for everyone: keep your
// waist under half your height.
export function ratios(profile = {}) {
  const h = num(profile.height)
  const waist = num(profile.waist)
  const hips = num(profile.hips)
  const female = sexOf(profile) === 'female'
  const out = []

  if (h && waist) {
    const v = Math.round((waist / h) * 100) / 100
    out.push({
      key: 'whtr',
      label: 'Waist-to-height',
      value: v.toFixed(2),
      tone: v < 0.4 ? 'warn' : v < 0.5 ? 'good' : v < 0.6 ? 'warn' : 'bad',
      verdict: v < 0.4 ? 'Below the usual range' : v < 0.5 ? 'Healthy' : v < 0.6 ? 'Increased risk' : 'High risk',
      pct: Math.min(100, (v / 0.75) * 100),
      note: `Keep your waist under half your height — that is ${Math.round(h / 2)} cm for you. This one predicts visceral fat risk better than BMI does.`,
    })
  }

  if (waist && hips) {
    const v = Math.round((waist / hips) * 100) / 100
    const bands = female ? [0.8, 0.85] : [0.9, 1.0]
    out.push({
      key: 'whr',
      label: 'Waist-to-hip',
      value: v.toFixed(2),
      tone: v < bands[0] ? 'good' : v < bands[1] ? 'warn' : 'bad',
      verdict: v < bands[0] ? 'Low risk' : v < bands[1] ? 'Moderate risk' : 'High risk',
      pct: Math.min(100, (v / 1.2) * 100),
      shape: v >= bands[0] ? 'apple' : 'pear',
      note:
        v >= bands[0]
          ? 'You store fat around the middle (an "apple" pattern). That fat is more metabolically active — the good news is it is also the first to go when a deficit starts.'
          : 'You store fat around the hips and thighs (a "pear" pattern). Metabolically safer, but stubborn — it is usually the last area to change.',
    })
  }

  if (waist) {
    const limit = female ? 80 : 90
    const high = female ? 88 : 102
    out.push({
      key: 'waist',
      label: 'Waist circumference',
      value: `${waist} cm`,
      tone: waist < limit ? 'good' : waist < high ? 'warn' : 'bad',
      verdict: waist < limit ? 'Healthy' : waist < high ? 'Raised' : 'High',
      pct: Math.min(100, (waist / (high * 1.4)) * 100),
      note: `Health bodies flag ${limit} cm and ${high} cm for ${female ? 'women' : 'men'}. Waist is the number worth re-measuring monthly — it moves before the scale does.`,
    })
  }

  return out
}

// ------------------------------------------------------- ideal weight -----

export function idealWeight(profile = {}, bf = null) {
  const b = bmi(profile)
  if (!b.ready) return null
  const out = { bmiRange: b.healthyRange }
  // Lean mass is fixed in the short term, so "goal weight at X% body fat" is a
  // far more meaningful target than a BMI band — it is the number that says
  // what you'd weigh if you kept all your muscle and only lost fat.
  if (bf?.ready && bf.leanMassKg) {
    const target = bf.sex === 'female' ? 0.25 : 0.18
    const w = Math.round((bf.leanMassKg / (1 - target)) * 10) / 10
    out.atFitnessBF = { bodyFat: Math.round(target * 100), weight: w, leanMass: bf.leanMassKg }
  }
  return out
}

// ------------------------------------------------- everything, composed ---

export function bodyMetrics(profile = {}) {
  const b = bmi(profile)
  const bf = bodyFat(profile, b)
  return {
    bmi: b,
    bodyFat: bf,
    ratios: ratios(profile),
    ideal: idealWeight(profile, bf),
    age: ageFromDob(profile.dob),
    hasMeasurements: Boolean(num(profile.waist)),
    completeness: completeness(profile),
  }
}

// What the user still owes us, and what unlocks when they give it. Drives the
// "make this more accurate" prompt on the Body screen.
export function completeness(profile = {}) {
  const items = [
    { key: 'height', label: 'Height', unlocks: 'BMI', have: Boolean(num(profile.height)) },
    { key: 'weight', label: 'Weight', unlocks: 'BMI and calorie target', have: Boolean(num(profile.weight)) },
    { key: 'dob', label: 'Date of birth', unlocks: 'age-adjusted estimates', have: Boolean(profile.dob) },
    { key: 'neck', label: 'Neck', unlocks: 'accurate body fat %', have: Boolean(num(profile.neck)) },
    { key: 'waist', label: 'Waist', unlocks: 'body fat %, waist ratios, visceral risk', have: Boolean(num(profile.waist)) },
    ...(sexOf(profile) === 'female'
      ? [{ key: 'hips', label: 'Hips', unlocks: 'body fat % and waist-to-hip', have: Boolean(num(profile.hips)) }]
      : [{ key: 'hips', label: 'Hips', unlocks: 'waist-to-hip ratio', have: Boolean(num(profile.hips)) }]),
    { key: 'targetWeight', label: 'Target weight', unlocks: 'your timeline', have: Boolean(num(profile.targetWeight)) },
  ]
  const have = items.filter((i) => i.have).length
  return { items, have, total: items.length, pct: Math.round((have / items.length) * 100), missing: items.filter((i) => !i.have) }
}

// ----------------------------------------------------- measurement log ----

export const MEASUREMENT_KEYS = [
  ['neck', 'Neck'], ['chest', 'Chest'], ['waist', 'Waist'],
  ['hips', 'Hips'], ['thigh', 'Thigh'], ['arm', 'Arm'],
]

// Fold today's measurements into the dated history. Called from every screen
// that can save a tape measurement, so a save from Profile counts towards the
// trend exactly like a save from the Body report. Same-day saves overwrite
// rather than stack, and the log keeps two years of monthly entries.
export function withMeasurementSnapshot(profile = {}, patch = {}) {
  const today = new Date().toISOString().slice(0, 10)
  const entry = { date: today }
  for (const [k] of MEASUREMENT_KEYS) {
    const n = num(patch[k] ?? profile[k])
    if (n) entry[k] = n
  }
  // Weight rides along — it is the line people actually want beside the tape.
  const w = num(patch.weight ?? profile.weight)
  if (w) entry.weight = w

  if (Object.keys(entry).length === 1) return patch // nothing measured yet
  const log = (profile.measurementLog || []).filter((r) => r && r.date !== today)
  return { ...patch, measurementLog: [...log, entry].slice(-24) }
}

// What has actually changed since the first snapshot that recorded each field.
// Per-field, because people add the tape gradually — a waist logged for six
// months should not be reduced to "no data" by a neck logged yesterday.
export function measurementTrend(profile = {}) {
  const log = (profile.measurementLog || [])
    .filter((r) => r && r.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
  if (log.length < 2) return { ready: false, entries: log.length }

  const rows = []
  for (const [key, label] of MEASUREMENT_KEYS) {
    const seen = log.filter((r) => num(r[key]))
    if (seen.length < 2) continue
    const first = seen[0]
    const last = seen[seen.length - 1]
    const delta = Math.round((num(last[key]) - num(first[key])) * 10) / 10
    if (delta === 0) continue
    const days = Math.max(1, Math.round((new Date(last.date) - new Date(first.date)) / 86400000))
    rows.push({
      key, label, delta, days,
      from: num(first[key]),
      to: num(last[key]),
      since: first.date,
      // Down is the wanted direction everywhere except arms and chest, where
      // people are usually building. Never call a change good or bad outright —
      // just say which way it went and let the report's context carry it.
      dir: delta > 0 ? 'up' : 'down',
      text: `${delta > 0 ? '+' : ''}${delta} cm in ${days} day${days === 1 ? '' : 's'}`,
    })
  }

  return {
    ready: rows.length > 0,
    entries: log.length,
    first: log[0].date,
    last: log[log.length - 1].date,
    rows,
  }
}

// --------------------------------------------------------- the forecast ---

// Safe, sustainable rates. Faster than the top of these ranges and you are
// mostly losing muscle and water, and it comes back.
const SAFE = { lose: [0.25, 1.0], gain: [0.1, 0.5] }

// series: the history rows from history.js (oldest first), each may hold weightKg.
// Returns everything the "how many days" card needs.
export function forecast(profile = {}, series = [], metrics = bodyMetrics(profile)) {
  const blocked = deficitBlocked(profile)
  const weighIns = (series || []).filter((d) => Number(d.weightKg) > 0)
  const current = weighIns.length ? Number(weighIns[weighIns.length - 1].weightKg) : num(profile.weight)
  const target = num(profile.targetWeight)

  if (!current) return { ready: false, why: 'Add your weight in Profile and this fills in.' }
  if (blocked) {
    return {
      ready: false,
      blocked: true,
      why: `While you have ${blocked.name} logged, SAP does not set a fat-loss timeline — a deficit is not the goal right now. Strength, nutrition and comfort are.`,
    }
  }
  if (!target) {
    const suggested = metrics.ideal?.atFitnessBF?.weight || (metrics.bmi.ready ? metrics.bmi.healthyRange[1] : null)
    return {
      ready: false,
      why: 'Set a target weight and SAP will tell you the date — down to the day.',
      suggested: suggested ? Math.round(suggested * 10) / 10 : null,
      suggestedWhy: metrics.ideal?.atFitnessBF
        ? `${Math.round(metrics.ideal.atFitnessBF.weight * 10) / 10} kg would put you at ${metrics.ideal.atFitnessBF.bodyFat}% body fat while keeping every kg of the muscle you already have.`
        : null,
    }
  }

  const delta = Math.round((current - target) * 10) / 10
  const dir = delta > 0 ? 'lose' : delta < 0 ? 'gain' : 'maintain'
  if (dir === 'maintain' || Math.abs(delta) < 0.3) {
    return {
      ready: true, done: true, current, target,
      headline: 'You are at your target 🎉',
      note: 'Now the goal is holding it — which is the harder and more valuable skill. Keep logging; maintenance is a phase, not the absence of one.',
    }
  }

  // Measured rate beats any formula — but it needs two weigh-ins at least 10
  // days apart before it means anything.
  let ratePerWeek = 0
  let source = 'estimated'
  if (weighIns.length >= 2) {
    const first = weighIns[0]
    const last = weighIns[weighIns.length - 1]
    const days = (new Date(last.date) - new Date(first.date)) / 86400000
    if (days >= 10) {
      const perWeek = ((Number(first.weightKg) - Number(last.weightKg)) / days) * 7
      if ((dir === 'lose' && perWeek > 0.05) || (dir === 'gain' && perWeek < -0.05)) {
        ratePerWeek = Math.abs(perWeek)
        source = 'measured'
      }
    }
  }

  const rawRate = ratePerWeek
  if (!ratePerWeek) {
    // Project from the planned calorie gap, then apply the condition slowdown.
    const gap = dir === 'lose' ? 400 : 300
    ratePerWeek = ((gap * 7) / KCAL_PER_KG_FAT) * lossRateFactor(profile)
  }

  const [lo, hi] = SAFE[dir]
  const rate = Math.min(Math.max(ratePerWeek, lo * lossRateFactor(profile), 0.08), hi)
  const weeks = Math.abs(delta) / rate
  const days = Math.max(1, Math.ceil(weeks * 7))
  const eta = new Date(Date.now() + days * 86400000)
  const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

  // Fat vs. weight: in a proper deficit with enough protein and lifting, most
  // of the loss is fat. Without those, a big chunk is muscle.
  const bf = metrics.bodyFat
  const projectedBF =
    bf?.ready && bf.leanMassKg && dir === 'lose'
      ? Math.max(
          bf.sex === 'female' ? 14 : 7,
          Math.round(((bf.fatMassKg - Math.abs(delta) * 0.8) / target) * 1000) / 10
        )
      : null

  return {
    ready: true,
    done: false,
    dir,
    current,
    target,
    kgToGo: Math.abs(delta),
    ratePerWeek: Math.round(rate * 100) / 100,
    days,
    weeks: Math.ceil(weeks),
    months: Math.round((days / 30.4) * 10) / 10,
    etaDate: fmt(eta),
    etaShort: eta.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    source,
    projectedBF,
    dailyDeficit: Math.round((rate * KCAL_PER_KG_FAT) / 7 / 10) * 10,
    headline: `${Math.abs(delta)} kg to ${dir} · ${days} days · ${fmt(eta)}`,
    note:
      source === 'measured'
        ? `Based on your own weigh-ins (${Math.round(rate * 100) / 100} kg a week), not a formula. Real progress is never a straight line — plateaus and water-weight swings are part of it.`
        : `Projected from a ${Math.round((rate * KCAL_PER_KG_FAT) / 7 / 10) * 10} kcal daily gap. Log your weight weekly and this switches to your real measured rate.`,
    conditionNote: lossRateNote(profile),
    warn:
      rawRate > hi
        ? `Your current pace is faster than ${hi} kg a week. Loss that fast is mostly muscle and water, and it reliably rebounds — the date above uses a sustainable pace instead.`
        : null,
    milestones: buildMilestones(current, target, rate, dir),
  }
}

function buildMilestones(current, target, ratePerWeek, dir) {
  const total = Math.abs(current - target)
  const out = []
  const step = total / 4
  for (let i = 1; i <= 4; i++) {
    const kg = Math.round(step * i * 10) / 10
    const days = Math.ceil((kg / ratePerWeek) * 7)
    const d = new Date(Date.now() + days * 86400000)
    out.push({
      label: `${kg} kg ${dir === 'lose' ? 'down' : 'up'}`,
      weight: Math.round((dir === 'lose' ? current - kg : current + kg) * 10) / 10,
      when: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      days,
      pct: Math.round((i / 4) * 100),
    })
  }
  return out
}

// A one-paragraph plain-English read of the whole picture — used at the top of
// the Body report and fed to the AI so its deep scan starts from real numbers
// instead of guessing them from a photo.
export function metricsSummary(profile = {}, metrics = bodyMetrics(profile)) {
  const bits = []
  if (metrics.bmi.ready) bits.push(`BMI ${metrics.bmi.value} (${metrics.bmi.category})`)
  if (metrics.bodyFat.ready) bits.push(`body fat ~${metrics.bodyFat.value}% (${metrics.bodyFat.category}, ${metrics.bodyFat.method} method)`)
  if (metrics.bodyFat.ready && metrics.bodyFat.leanMassKg) bits.push(`lean mass ${metrics.bodyFat.leanMassKg} kg`)
  for (const r of metrics.ratios) bits.push(`${r.label} ${r.value} (${r.verdict})`)
  const cond = activeConditions(profile)
  if (cond.length) bits.push(`conditions: ${cond.map((c) => c.name).join(', ')}`)
  if (metrics.age) bits.push(`age ${metrics.age}`)
  return bits.join(' · ')
}

// Re-exported so screens don't need to import conditions.js just for this.
export { calorieFactor }
