// Checks a photo before we compress and upload it — resolution, blur, exposure,
// contrast and colour cast.
//
// This is a WARNING, never a block. `ok` is always true. Someone who cannot
// retake — no daylight, no help, or a body they do not want to photograph twice
// — must still be able to finish. The UI shows "Retake" as the primary button
// and "Use this photo anyway" beside it, and the second one is never disabled.
//
// Why it matters more than it sounds: overhead lighting drops hard shadows into
// the eye sockets and under the jaw, and the scan reads those shadows as
// under-eye darkness and a slackening jawline. Left unchecked, the app hands
// someone a plan for a problem they do not have. Catching a bad photo before it
// is analysed is the cheapest accuracy win in the whole pipeline.

// Long edge of the working copy. Variance-of-Laplacian is scale-dependent — the
// same scene at 12 MP and at 1 MP gives wildly different numbers — so every
// image is normalised to this size first, which is what makes one set of
// thresholds portable across phones. Changing this invalidates every blur
// threshold below.
const WORK = 256

// Face and hair need fine texture (pores, flakes, split ends, a scalp at the
// parting). Body needs a clean outline and nothing more, so it can pass on
// photos the detail slots would fail.
export const TIER = {
  body_front: 'shape', body_left: 'shape', body_right: 'shape', body_back: 'shape',
  face_front: 'detail', face_left: 'detail', face_right: 'detail',
  hair_front: 'detail', hair_left: 'detail', hair_right: 'detail',
  hair_back: 'detail', hair_top: 'detail',
}

const LIMITS = {
  detail: { minSide: 1000, softSide: 640, blurBad: 12, blurSoft: 30 },
  shape: { minSide: 720, softSide: 480, blurBad: 8, blurSoft: 20 },
}

// ---------------------------------------------------------------- decode ---

// createImageBitmap is faster and needs no DOM node, but it ignores EXIF
// orientation unless asked. Getting that wrong rotates every side photo 90° and
// quietly ruins the analysis, so the explicit option is worth it.
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* fall through to the <img> path */
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      // On an iPhone the overwhelmingly likely cause is HEIC, which browsers
      // cannot decode. Say that, and say the fix.
      reject(new Error('HEIC_OR_UNREADABLE'))
    }
    img.src = url
  })
}

function workingCopy(img) {
  const iw = img.width || img.naturalWidth
  const ih = img.height || img.naturalHeight
  const scale = Math.min(1, WORK / Math.max(iw, ih))
  const w = Math.max(8, Math.round(iw * scale))
  const h = Math.max(8, Math.round(ih * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  // Never getImageData on the full-size canvas: a 48 MP decode is ~190 MB of
  // RGBA and will crash an older phone outright.
  return { w, h, iw, ih, rgba: ctx.getImageData(0, 0, w, h).data }
}

// ---------------------------------------------------------- measurements ---

function toGray(rgba, w, h) {
  const g = new Float32Array(w * h)
  for (let i = 0, p = 0; i < g.length; i++, p += 4) {
    g[i] = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2]
  }
  return g
}

// The middle 50% of the frame. The subject is there; a bright window or a dark
// corner is not. Judging exposure on the whole frame is how a well-lit face in
// front of a window gets reported as "too bright".
const centerBox = (w, h) => ({
  x0: Math.round(w * 0.25), x1: Math.round(w * 0.75),
  y0: Math.round(h * 0.25), y1: Math.round(h * 0.75),
})
const fullBox = (w, h) => ({ x0: 0, x1: w, y0: 0, y1: h })

function stats(gray, w, box) {
  let sum = 0, sum2 = 0, n = 0, crushed = 0, blown = 0
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0; x < box.x1; x++) {
      const v = gray[y * w + x]
      sum += v; sum2 += v * v; n++
      if (v <= 4) crushed++
      if (v >= 251) blown++
    }
  }
  const mean = sum / n
  return {
    mean,
    sd: Math.sqrt(Math.max(0, sum2 / n - mean * mean)),
    crushedFrac: crushed / n,
    blownFrac: blown / n,
  }
}

// Variance of the 3×3 Laplacian [0 1 0; 1 -4 1; 0 1 0], border skipped.
// High variance = lots of sharp edges = in focus.
function laplacianVariance(gray, w, h, box) {
  const x0 = Math.max(1, box.x0), x1 = Math.min(w - 1, box.x1)
  const y0 = Math.max(1, box.y0), y1 = Math.min(h - 1, box.y1)
  let sum = 0, sum2 = 0, n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * w + x
      const L = gray[i - w] + gray[i - 1] - 4 * gray[i] + gray[i + 1] + gray[i + w]
      sum += L; sum2 += L * L; n++
    }
  }
  if (n < 64) return 0
  const m = sum / n
  return sum2 / n - m * m
}

// Mean R/G/B over the centre box — this is what catches yellow room light.
function colourCast(rgba, w, box) {
  let r = 0, g = 0, b = 0, n = 0
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0; x < box.x1; x++) {
      const p = (y * w + x) * 4
      r += rgba[p]; g += rgba[p + 1]; b += rgba[p + 2]; n++
    }
  }
  return { r: r / n, g: g / n, b: b / n }
}

// ------------------------------------------------------------- the check ---

const pass = (flags, issues) => ({
  ok: true, level: issues.length ? 'soft' : 'good', flags, issues, metrics: {},
})

export async function checkPhoto(file, slot = 'body_front') {
  // A broken check must never stop someone uploading. Every failure path in
  // here returns a clean pass with a flag, and the upload continues.
  try {
    if (!file || !/^image\//.test(file.type || '')) {
      return pass(['not-an-image'], [{
        code: 'not-an-image',
        title: 'That file is not a photo.',
        fix: 'Pick a JPEG or PNG from your camera roll.',
      }])
    }
    if (file.size > 25 * 1024 * 1024) {
      return pass(['huge-file'], [{
        code: 'huge-file',
        title: 'That photo is very large and may be slow to process.',
        fix: 'It will still work — it just takes a few seconds longer.',
      }])
    }

    const img = await decode(file)
    const { w, h, iw, ih, rgba } = workingCopy(img)
    if (img.close) img.close()

    const gray = toGray(rgba, w, h)
    const cbox = centerBox(w, h)
    const lim = LIMITS[TIER[slot] || 'shape']

    const s = stats(gray, w, cbox)
    const volCenter = laplacianVariance(gray, w, h, cbox)
    const volFrame = laplacianVariance(gray, w, h, fullBox(w, h))
    const rgb = colourCast(rgba, w, cbox)
    const warm = rgb.b > 0 ? rgb.r / rgb.b : 1
    const minSide = Math.min(iw, ih)

    const issues = []
    const flags = []
    const add = (code, title, fix) => { flags.push(code); issues.push({ code, title, fix }) }

    // 1. Resolution
    if (minSide < lim.softSide) {
      add('very-low-res',
        `This photo is only ${iw}×${ih}. That is too small to read detail from.`,
        'Take it with your normal camera app rather than sending it through a messaging app — most apps shrink photos on the way.')
    } else if (minSide < lim.minSide) {
      add('low-res',
        `This photo is ${iw}×${ih}. Fine for shape, but too small for skin or hair detail.`,
        'Retake it with the camera app at its normal photo setting.')
    }

    // 2. Exposure — centre box only
    if (s.mean < 55) {
      add('too-dark', 'This photo is too dark to analyse reliably.',
        'Move to within 1–2 m of a window, with the window in front of you.')
    } else if (s.mean < 75) {
      add('a-bit-dark', 'This is a little dark — some detail will be lost.',
        'Turn towards the window, or take it earlier in the day.')
    } else if (s.mean > 205) {
      add('too-bright', 'This photo is overexposed — the bright areas have no detail left.',
        'Step out of direct sun, turn the flash off, and use indirect daylight.')
    }
    if (s.blownFrac > 0.12) {
      add('backlit', 'The background is much brighter than you are — you are backlit.',
        'Turn around so the window is in front of you, not behind you.')
    }
    if (s.crushedFrac > 0.30) {
      add('crushed-shadows', 'Large parts of this photo are pure black.',
        'Add soft daylight from the front. Overhead light alone creates exactly this.')
    }

    // 3. Contrast
    if (s.sd < 18) {
      add('very-flat', 'This photo has almost no contrast — shape and texture are both unreadable.',
        'Indirect daylight from a window in front of you fixes this.')
    } else if (s.sd < 28) {
      add('flat', 'The light here is quite flat.',
        'Move closer to a window. Flat light hides texture and softens the outline.')
    }

    // 4. Blur — but only where there is enough light to judge it. A dark, noisy
    //    photo scores high on the Laplacian purely from sensor noise, so below
    //    this brightness we decline to give a verdict rather than a wrong one.
    if (s.mean < 40) {
      flags.push('blur-unknown')
    } else if (volCenter < lim.blurBad) {
      add('blurry', 'This photo is out of focus.',
        'Prop the phone, tap the screen on yourself to focus, and use the 10-second timer.')
    } else if (volCenter < lim.blurSoft) {
      add('soft', 'This is a little soft — fine detail will be missed.',
        'Wipe the lens, brace the phone against something, and take three shots.')
    }

    // 5. Focus locked onto the background instead of you. Very common with a
    //    timer: the camera focuses on the empty room before you walk into frame.
    if (volFrame > 40 && volCenter < 0.55 * volFrame) {
      add('focused-on-background', 'Your camera focused on the background, not on you.',
        'Tap the screen where you will stand to lock focus before starting the timer.')
    }

    // 6. Colour cast — only where we report complexion or undertone.
    if (slot.startsWith('face') || slot.startsWith('hair')) {
      if (warm > 1.45) {
        add('warm-cast', 'The light here is strongly yellow — normal indoor bulb light.',
          'Use daylight from a window. Under a yellow bulb your undertone cannot be read honestly, so the app skips that rather than guessing.')
      } else if (warm > 1.35) {
        add('slight-warm-cast', 'There is a yellow tint in this light.',
          'Move nearer a window if you can — undertone and complexion depend on it.')
      } else if (warm < 0.78) {
        add('cool-cast', 'The light here is strongly blue — usually shade, or a cool white LED.',
          'Indirect daylight from a window gives a truer reading.')
      }
    }

    const HARD = ['very-low-res', 'too-dark', 'too-bright', 'blurry', 'backlit', 'very-flat', 'warm-cast', 'focused-on-background']
    const level = issues.some((i) => HARD.includes(i.code)) ? 'poor' : issues.length ? 'soft' : 'good'

    return {
      ok: true, // always. This is advice, not a gate.
      level,
      flags,
      issues,
      metrics: {
        w: iw, h: ih,
        mean: +s.mean.toFixed(1), sd: +s.sd.toFixed(1),
        vol: +volCenter.toFixed(1), volFrame: +volFrame.toFixed(1),
        warm: +warm.toFixed(2),
        blownFrac: +s.blownFrac.toFixed(3), crushedFrac: +s.crushedFrac.toFixed(3),
      },
    }
  } catch (e) {
    if (String(e.message) === 'HEIC_OR_UNREADABLE') {
      return pass(['undecodable'], [{
        code: 'undecodable',
        title: 'This browser could not open that photo.',
        fix: 'On an iPhone: Settings → Camera → Formats → Most Compatible, then retake it. Your phone is saving in HEIC, which browsers cannot read.',
      }])
    }
    return pass(['check-failed'], [])
  }
}

// One line the scan prompt can carry, so the model is told which photos it
// should not trust rather than silently over-reading a bad one.
export function qualityNote(photoQuality = {}, slots = []) {
  const bad = slots
    .map((s) => [s, photoQuality[s]])
    .filter(([, q]) => q && q.level === 'poor')
    .map(([s, q]) => `${s} (${(q.flags || []).slice(0, 2).join(', ')})`)
  if (!bad.length) return ''
  return `Photo quality note: ${bad.join('; ')}. Where a reading depends on detail you cannot clearly see in those photos, answer "unclear" rather than estimating.`
}
