// Skin & hair routine builder. Pure rules — personalized by skin type,
// sensitivity, hair type, porosity, damage, allergies, and today's weather.

export const SKIN_TYPES = ['Normal', 'Oily', 'Dry', 'Combination']
export const HAIR_TYPES = ['Straight', 'Wavy', 'Curly', 'Coily']
export const POROSITY = ["Don't know", 'Low', 'Normal', 'High']

function mentionsAllergen(p, keywords) {
  const text = (String(p.allergies || '') + ' ' + String(p.foodsToAvoid || '')).toLowerCase()
  return keywords.some((k) => text.includes(k))
}

export function buildSkinRoutine(p = {}, w = null) {
  const type = String(p.skinType || 'Normal').toLowerCase()
  const sens = p.skinSensitivity === 'high'
  const fragranceAllergy = mentionsAllergen(p, ['fragrance', 'perfume', 'scent'])
  const dryWeather = w && (w.humidity < 40 || w.temp < 12)
  const humid = w && w.humidity > 70
  const uvHigh = w && w.uv >= 6
  const uvMed = w && w.uv >= 3

  const am = [
    {
      key: 'cleanser', step: 'Cleanse',
      how: sens || fragranceAllergy ? 'Fragrance-free gentle cleanser, lukewarm water, 30–60 seconds. Pat dry — never rub.'
        : type === 'oily' ? 'Gel or foaming cleanser to clear overnight oil. Lukewarm water.'
        : type === 'dry' ? 'Cream/hydrating cleanser — or just water on very dry mornings.'
        : type === 'combination' ? 'Gentle gel cleanser, focus on the T-zone.'
        : 'Gentle cleanser, lukewarm water.',
    },
    ...(type === 'dry' || dryWeather ? [{
      key: 'serum', step: 'Hydrating serum',
      how: 'Hyaluronic acid on damp skin. Wait ~1 minute before the next layer.',
    }] : []),
    {
      key: 'moisturizer', step: 'Moisturize',
      how: type === 'oily'
        ? (humid ? `Light gel moisturizer — humidity is high today (${w.humidity}%).` : 'Oil-free gel moisturizer, thin layer.')
        : dryWeather ? `Richer cream today — the air is dry${w ? ` (${w.humidity}% humidity)` : ''}.`
        : 'Your regular lotion in a thin, even layer. Neck too.',
    },
    {
      key: 'sunscreen', step: 'Sunscreen — never skip',
      how: uvHigh ? `SPF 50, two-finger amount. UV is HIGH today (${w.uv}) — reapply at lunch if you're outdoors.`
        : uvMed ? `SPF 30–50, two-finger amount (UV ${w.uv} today).`
        : 'SPF 30 even on cloudy days and indoors near windows.',
    },
  ]

  const pm = [
    {
      key: 'cleanser', step: 'Cleanse the day off',
      how: 'Double cleanse if you wore sunscreen or makeup: oil/balm first, then your regular cleanser.',
    },
    sens
      ? { key: 'moisturizer', step: 'Soothe only', how: 'Fragrance-free moisturizer, nothing else. Skip actives entirely — your skin is marked very sensitive; calm beats treated.' }
      : {
          key: 'serum', step: 'Treat',
          how: type === 'oily' ? 'Salicylic acid (BHA) on breakout zones, 2–3 nights a week — not every night.'
            : type === 'dry' ? 'Hyaluronic serum, then a ceramide layer to lock it.'
            : 'Niacinamide serum, pea-sized amount for the whole face.',
        },
    !sens && { key: 'moisturizer', step: 'Moisturize', how: 'Slightly heavier than morning. Lips and under-eyes too.' },
  ].filter(Boolean)

  const weekly = [
    !sens && {
      step: `Exfoliate ${type === 'oily' ? '2×' : '1×'} / week`,
      how: 'Chemical exfoliant (AHA/BHA) at night. Never on the same night as other actives. Sunscreen next morning is non-negotiable.',
    },
    {
      step: 'Mask 1× / week',
      how: type === 'dry' ? 'Hydrating or overnight mask.'
        : type === 'oily' ? 'Clay mask on the T-zone, 10 minutes max.'
        : 'A soothing mask (aloe/centella style).',
    },
    sens && { step: 'Patch-test rule', how: 'Every NEW product goes on the inner arm for 24 hours before it touches your face.' },
  ].filter(Boolean)

  const precautions = [
    sens ? 'Patch test everything new — always, 24 hours.' : 'Patch test when trying any new active.',
    p.allergies ? `Read labels against your allergies: ${p.allergies}.` : null,
    'Mild tingle can be normal; burning, itching or lasting redness means wash it off and stop that product.',
    uvHigh ? 'Peak sun is ~11am–3pm today — shade and a cap protect more than any serum.' : null,
    'Persistent acne, patches, or sudden changes → a dermatologist is worth one visit; this app can’t diagnose skin conditions.',
  ].filter(Boolean)

  return { am, pm, weekly, precautions }
}

export function buildHairRoutine(p = {}, w = null) {
  const t = String(p.hairType || 'Straight').toLowerCase()
  const por = String(p.hairPorosity || '').toLowerCase()
  const nutAllergy = mentionsAllergen(p, ['coconut', 'nut', 'argan'])
  const humid = w && w.humidity > 70
  const dryAir = w && w.humidity < 35
  const washes = t === 'coily' ? '1× / week'
    : t === 'curly' ? '1–2× / week'
    : t === 'wavy' ? '2–3× / week'
    : '2–3× / week (daily only if your scalp gets very oily)'

  const routine = [
    {
      key: 'shampoo', step: `Wash ${washes}`,
      how: p.dandruff
        ? 'Anti-dandruff shampoo (zinc pyrithione or ketoconazole): massage into the SCALP, leave 3–5 min, at each wash for the first 2 weeks, then alternate with your regular gentle shampoo.'
        : 'Shampoo the SCALP, not the lengths — the foam rinsing through cleans the rest. Lukewarm water.',
    },
    {
      key: 'conditioner', step: 'Condition every wash',
      how: 'Mid-length to ends only, leave 2–3 min. ' +
        (por === 'high' ? 'High porosity: add a deep-conditioning mask weekly — your hair drinks and loses moisture fast.'
          : por === 'low' ? 'Low porosity: lighter conditioner; the shower’s warmth helps it absorb.'
          : ''),
    },
    {
      key: 'oil', step: 'Oil 1–2× / week',
      how: (t === 'curly' || t === 'coily')
        ? (nutAllergy
            ? 'Seal damp hair with a few drops of a nut-free oil (e.g. sunflower or grapeseed — your allergy list flags nut/coconut oils), focusing on ends.'
            : 'Seal damp hair with a few drops (argan/coconut), focusing on ends.')
        : 'Pre-wash oiling: scalp + ends, 30–60 min before shampoo.',
    },
    (t === 'curly' || t === 'coily') && {
      key: 'leave-in', step: 'Style while damp',
      how: humid
        ? `Humidity is high today (${w.humidity}%) — gel over cream to fight frizz. Scrunch; never brush dry curls.`
        : 'Leave-in + curl cream, scrunch with a cotton tee or microfiber towel.',
    },
    dryAir && {
      key: 'leave-in', step: 'Extra moisture today',
      how: `The air is dry (${w.humidity}%) — a light leave-in or 2 drops of oil on the ends before heading out.`,
    },
  ].filter(Boolean)

  const donts = [
    'No hot water on hair — lukewarm to cool.',
    'No rough towel rubbing; press water out with a tee.',
    t !== 'straight' ? 'Never brush curls when dry — detangle damp with conditioner in.' : 'Don’t over-brush; 100 strokes is a myth.',
    'Heat tools: heat protectant always, keep it ≤ 180 °C, not daily.',
    p.hairDamage ? 'Damage marked: pause bleach and hot tools for 4–6 weeks and trim the ends — hair heals by growing, not by products.' : null,
    'Tight hairstyles every day pull the hairline — vary it.',
  ].filter(Boolean)

  const precautions = [
    (p.allergies || p.foodsToAvoid) ? `Read ingredient labels against your allergies: ${[p.allergies, p.foodsToAvoid].filter(Boolean).join(', ')}.` : null,
    nutAllergy ? 'Nut/coconut oils are common in hair products beyond what this routine suggests — check labels before trying something new.' : null,
  ].filter(Boolean)

  return { routine, donts, precautions }
}

// Best-effort match: does the user's shelf contain something for this step?
export function shelfMatch(stepKey, shelf = []) {
  const key = stepKey.toLowerCase()
  const alt = { shampoo: ['shampoo'], conditioner: ['conditioner'],
    cleanser: ['cleanser', 'face wash', 'facewash'], moisturizer: ['moistur', 'cream', 'lotion'],
    sunscreen: ['sunscreen', 'spf', 'sunblock'], serum: ['serum', 'acid', 'niacinamide'],
    oil: ['oil'], 'leave-in': ['leave', 'curl', 'gel'] }[key] || [key]
  return shelf.find((item) => alt.some((a) => item.toLowerCase().includes(a))) || null
}
