// Objective measurements on a region of a photo the user marks themselves.
//
// The point of this module is that it never guesses what it is looking at. You
// draw a box; it measures those pixels. That sidesteps the thing no available
// model can do — locate anatomy — while still producing real numbers, because
// the numbers come from arithmetic on the pixels rather than from a grading
// scale someone invented.
//
// It will never print "grade 2". It prints lightness, redness, texture and hair
// coverage, and the change in each since last time. Those are measurable. A
// grade is not, and a confident-looking grade derived from nothing is worse
// than no feature at all.
//
// THE ONE THING THAT MATTERS MOST HERE:
// Absolute values are not comparable between two photos. Different light,
// different white balance, different exposure — a region can read four L* units
// darker purely because a cloud passed the window. So every measurement is
// taken against a REFERENCE region the user also marks on the same photo,
// somewhere with stable skin nearby. The difference between the two travels
// between sessions; the raw value does not. Every function here that returns an
// absolute number also returns the delta, and the UI should lead with the delta.

// ---------------------------------------------------------------- colour ---

// sRGB (0-255) → CIE L*a*b*, D65.
// Lab is used rather than raw RGB because it is perceptually uniform: a 5-unit
// change means roughly the same visible amount at any lightness, which RGB
// badly fails to do on darker skin.
function srgbToLab(r, g, b) {
  const f = (v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const R = f(r), G = f(g), B = f(b)

  // Linear RGB → XYZ (sRGB matrix, D65)
  let X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375
  let Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750
  let Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041

  // Normalise to the D65 white point
  X /= 0.95047; Y /= 1.00000; Z /= 1.08883

  const k = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = k(X), fy = k(Y), fz = k(Z)

  return {
    L: 116 * fy - 16,   // 0 (black) → 100 (white)
    a: 500 * (fx - fy), // green → red
    b: 200 * (fy - fz), // blue → yellow
  }
}

// Individual Typology Angle — the measure skin research actually uses to
// classify constitutive pigmentation, and the reason this module bothers with
// Lab at all. Higher = lighter. The bands below are the standard ones.
function ita(L, b) {
  if (!b) return null
  return (Math.atan((L - 50) / b) * 180) / Math.PI
}

export function itaBand(v) {
  if (v == null) return null
  if (v > 55) return 'very light'
  if (v > 41) return 'light'
  if (v > 28) return 'intermediate'
  if (v > 10) return 'tan'
  if (v > -30) return 'brown'
  return 'dark'
}

// ------------------------------------------------------------ extraction ---

// region: { x, y, w, h } in NORMALISED coords (0-1), so a marked box survives
// the photo being re-encoded at a different size.
function pixelsOf(imageData, region) {
  const { width, height, data } = imageData
  const x0 = Math.max(0, Math.round(region.x * width))
  const y0 = Math.max(0, Math.round(region.y * height))
  const x1 = Math.min(width, Math.round((region.x + region.w) * width))
  const y1 = Math.min(height, Math.round((region.y + region.h) * height))
  return { x0, y0, x1, y1, width, height, data, count: Math.max(0, (x1 - x0) * (y1 - y0)) }
}

// Trimmed mean: the middle 80% by lightness. A stray highlight, a mole, a hair
// or the edge of the box catching background would otherwise drag the average
// somewhere it should not go. This is the difference between a number that
// tracks the skin and a number that tracks the noise.
function trimmedStats(values, trim = 0.1) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const lo = Math.floor(sorted.length * trim)
  const hi = Math.ceil(sorted.length * (1 - trim))
  const kept = sorted.slice(lo, Math.max(lo + 1, hi))
  const mean = kept.reduce((s, v) => s + v, 0) / kept.length
  const sd = Math.sqrt(kept.reduce((s, v) => s + (v - mean) * (v - mean), 0) / kept.length)
  return { mean, sd, n: kept.length }
}

// ------------------------------------------------------------- measuring ---

export function measureRegion(imageData, region) {
  const px = pixelsOf(imageData, region)
  if (px.count < 64) {
    return { ready: false, why: 'That box is too small to measure — drag a bigger one.' }
  }

  const Ls = [], as = [], bs = []
  for (let y = px.y0; y < px.y1; y++) {
    for (let x = px.x0; x < px.x1; x++) {
      const i = (y * px.width + x) * 4
      // Skip fully transparent pixels; a PNG with alpha would otherwise read black.
      if (px.data[i + 3] < 250) continue
      const lab = srgbToLab(px.data[i], px.data[i + 1], px.data[i + 2])
      Ls.push(lab.L); as.push(lab.a); bs.push(lab.b)
    }
  }
  if (Ls.length < 64) return { ready: false, why: 'Not enough usable pixels in that box.' }

  const L = trimmedStats(Ls)
  const a = trimmedStats(as)
  const b = trimmedStats(bs)
  const itaVal = ita(L.mean, b.mean)

  return {
    ready: true,
    n: L.n,
    // Pigmentation
    lightness: +L.mean.toFixed(2),
    lightnessSd: +L.sd.toFixed(2),
    ita: itaVal == null ? null : +itaVal.toFixed(1),
    itaBand: itaBand(itaVal),
    // Redness. a* IS the green-to-red axis, so it is a direct erythema proxy —
    // no separate index needed.
    redness: +a.mean.toFixed(2),
    yellowness: +b.mean.toFixed(2),
    // Evenness: how much the lightness varies inside the box. High sd means
    // mottling, blotchiness, or that the box caught two different things.
    unevenness: +L.sd.toFixed(2),
    texture: textureOf(px),
    hairCoverage: hairCoverageOf(px),
  }
}

// Local surface irregularity: mean absolute Laplacian over the region, on the
// lightness channel. Bumps, ingrowns and roughness raise it; smooth skin does
// not. Normalised by the region's own contrast so a darker photo does not read
// as smoother than a bright one.
function textureOf(px) {
  const w = px.x1 - px.x0, h = px.y1 - px.y0
  if (w < 3 || h < 3) return null
  const gray = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((y + px.y0) * px.width + (x + px.x0)) * 4
      gray[y * w + x] = 0.299 * px.data[i] + 0.587 * px.data[i + 1] + 0.114 * px.data[i + 2]
    }
  }
  let sum = 0, n = 0, mean = 0
  for (let i = 0; i < gray.length; i++) mean += gray[i]
  mean /= gray.length
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const lap = gray[i - w] + gray[i - 1] - 4 * gray[i] + gray[i + 1] + gray[i + w]
      sum += Math.abs(lap); n++
    }
  }
  if (!n || mean <= 1) return null
  // Relative to mean brightness, so exposure does not dominate.
  return +((sum / n / mean) * 100).toFixed(2)
}

// Rough hair-coverage estimate: the fraction of pixels significantly darker
// than their own neighbourhood. Subtracting a blurred copy removes the slow
// lighting gradient across the region, so what is left is fine dark detail —
// hair, mostly. It cannot tell hair from a dark freckle, which is why it is
// reported as an estimate and never as a count.
function hairCoverageOf(px) {
  const w = px.x1 - px.x0, h = px.y1 - px.y0
  if (w < 9 || h < 9) return null
  const gray = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = ((y + px.y0) * px.width + (x + px.x0)) * 4
      gray[y * w + x] = 0.299 * px.data[i] + 0.587 * px.data[i + 1] + 0.114 * px.data[i + 2]
    }
  }
  // Cheap 9x9 box blur via two passes.
  const blur = boxBlur(boxBlur(gray, w, h, 4), w, h, 4)
  let dark = 0, n = 0
  for (let i = 0; i < gray.length; i++) {
    const d = blur[i] - gray[i]
    if (d > 10) dark++ // 10 L-units darker than local surround
    n++
  }
  return n ? +((dark / n) * 100).toFixed(2) : null
}

function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, c = 0
      for (let k = -r; k <= r; k++) {
        const xx = x + k
        if (xx < 0 || xx >= w) continue
        s += src[y * w + xx]; c++
      }
      tmp[y * w + x] = s / c
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, c = 0
      for (let k = -r; k <= r; k++) {
        const yy = y + k
        if (yy < 0 || yy >= h) continue
        s += tmp[yy * w + x]; c++
      }
      out[y * w + x] = s / c
    }
  }
  return out
}

// ------------------------------------------------------------ comparison ---

// The number that actually travels between sessions. Target minus reference,
// both measured on the SAME photo under the SAME light.
export function compareToReference(target, reference) {
  if (!target?.ready || !reference?.ready) return null
  return {
    dL: +(target.lightness - reference.lightness).toFixed(2),
    dRedness: +(target.redness - reference.redness).toFixed(2),
    dTexture: target.texture != null && reference.texture != null
      ? +(target.texture - reference.texture).toFixed(2) : null,
    dHair: target.hairCoverage != null && reference.hairCoverage != null
      ? +(target.hairCoverage - reference.hairCoverage).toFixed(2) : null,
    // Below about 2 L* units, the difference is within the noise of JPEG
    // compression and ordinary skin variation. Saying "1.3 darker" would be
    // reading meaning into rounding.
    meaningful: Math.abs(target.lightness - reference.lightness) >= 2,
  }
}

// Plain-language read of a target-vs-reference comparison. No grades, no
// severity scale — just what the arithmetic says.
export function describe(cmp) {
  if (!cmp) return []
  const out = []
  if (!cmp.meaningful) {
    out.push('This area measures the same as your reference patch, within the margin that JPEG compression and normal skin variation introduce. There is no measurable difference to track yet.')
  } else if (cmp.dL < 0) {
    out.push(`This area is ${Math.abs(cmp.dL)} L* units darker than your reference patch. L* runs 0–100, so roughly ${Math.abs(cmp.dL) < 5 ? 'a slight' : Math.abs(cmp.dL) < 12 ? 'a clear but moderate' : 'a pronounced'} difference.`)
  } else {
    out.push(`This area is ${cmp.dL} L* units lighter than your reference patch.`)
  }
  if (cmp.dRedness >= 3) out.push(`It is also measurably redder (a* +${cmp.dRedness}), which usually means active irritation rather than settled pigment.`)
  if (cmp.dTexture != null && cmp.dTexture >= 1.5) out.push(`Surface texture reads rougher here than the reference (+${cmp.dTexture}).`)
  if (cmp.dHair != null && Math.abs(cmp.dHair) >= 2) {
    out.push(`Estimated hair coverage differs by ${cmp.dHair > 0 ? '+' : ''}${cmp.dHair} percentage points. This estimate cannot tell a hair from a dark freckle, so treat it as a trend, not a count.`)
  }
  return out
}

// ---------------------------------------------------------------- trends ---

// series: [{ at, target, reference }] oldest first.
export function trend(series = []) {
  const rows = series
    .map((s) => ({ at: s.at, cmp: compareToReference(s.target, s.reference) }))
    .filter((r) => r.cmp)
  if (rows.length < 2) return { ready: false, points: rows.length }

  const first = rows[0], last = rows[rows.length - 1]
  const change = +(last.cmp.dL - first.cmp.dL).toFixed(2)
  const days = Math.max(1, Math.round((new Date(last.at) - new Date(first.at)) / 86400000))

  return {
    ready: true,
    points: rows.length,
    from: first.at,
    to: last.at,
    days,
    change,
    // Positive change = the gap to the reference narrowed = the area evened out.
    direction: Math.abs(change) < 1.5 ? 'flat' : change > 0 ? 'evening out' : 'darkening',
    note: Math.abs(change) < 1.5
      ? `Across ${days} days the difference has not moved beyond measurement noise. For pigmentation that is normal — it changes over months, not weeks.`
      : change > 0
        ? `The gap to your reference patch has closed by ${change} L* units over ${days} days.`
        : `The gap to your reference patch has widened by ${Math.abs(change)} L* units over ${days} days.`,
    rows,
  }
}

// What this tool cannot do, stated where the code lives rather than only in
// the UI, so it does not drift away from the truth as the UI changes.
export const LIMITS = [
  'It measures the pixels you box. It does not know what body part it is looking at, and it never will without a model that can locate anatomy.',
  'Absolute values are not comparable between photos taken in different light. Only the difference against a reference patch on the same photo is.',
  'It cannot grade anything — no severity scale, no stage, no clinical classification. Those require a reference standard this has no access to.',
  'Hair coverage counts dark fine detail. A freckle, a mole or a shadow in a skin crease all register as hair.',
  'A measured difference is not a diagnosis. Something new, changing, itching, bleeding or asymmetric is a doctor question regardless of what any number here says.',
]
