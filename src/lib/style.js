// Style engine — palettes, outfits, haircuts, beard & grooming. Pure rules.

export const BODY_SHAPES = ['Rectangle', 'Triangle (pear)', 'Inverted triangle', 'Oval (apple)', 'Hourglass']
export const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Oblong']
export const UNDERTONES = ['Warm', 'Cool', 'Neutral']

export const PALETTES = {
  warm: {
    best: [['Olive', '#708238'], ['Rust', '#b7410e'], ['Mustard', '#d4a017'], ['Cream', '#f5eedc'], ['Camel', '#c19a6b'], ['Coral', '#ff7f50'], ['Warm navy', '#27374d']],
    avoid: [['Icy pastels', '#cfe8ef'], ['Pure white', '#ffffff'], ['Fuchsia', '#d5006d']],
    tip: 'Gold jewelry and warm metals flatter you more than silver.',
  },
  cool: {
    best: [['Charcoal', '#36454f'], ['Emerald', '#2e8b57'], ['Sapphire', '#0f52ba'], ['Berry', '#8e4585'], ['True white', '#ffffff'], ['Lavender', '#b57edc'], ['Ruby', '#9b111e']],
    avoid: [['Orange', '#ff8c00'], ['Mustard', '#d4a017'], ['Warm beige', '#d9c7a7']],
    tip: 'Silver and platinum tones flatter you more than gold.',
  },
  neutral: {
    best: [['Teal', '#008080'], ['Soft white', '#f4f1ea'], ['Dusty rose', '#c08081'], ['Navy', '#202a44'], ['Sage', '#9caf88'], ['Burgundy', '#800020'], ['Stone grey', '#8d8d8d']],
    avoid: [['Neon anything', '#39ff14']],
    tip: 'Lucky you — both gold and silver work. Let the outfit decide.',
  },
}

export const OCCASIONS = ['Daily casual', 'Home lounge', 'Office', 'Friends hangout', 'Party night', 'Worship visit', 'Date night', 'Business formal', 'Ethnic / function', 'Gym']

const SHAPE_NOTES = {
  'Rectangle': ['Create a waist: belts, wrap styles, layering.', 'Structured shoulders and tapered bottoms add shape.'],
  'Triangle (pear)': ['Draw the eye up: detail, color and structure on top.', 'Darker, simpler bottoms; A-line and straight cuts over tight tapers.'],
  'Inverted triangle': ['Keep shoulders clean — no epaulettes or heavy shoulder detail.', 'Add volume below: straight or wide-leg bottoms, lighter colors down.'],
  'Oval (apple)': ['Open necklines (V/collar) lengthen the frame.', 'Skim, don’t cling, at the midsection; structure at the shoulders.'],
  'Hourglass': ['Follow the waist — fitted and wrap styles are your friends.', 'Avoid boxy cuts that hide the natural line.'],
}

// base pieces per occasion per gender; {top, bottom, layer, footwear, extra}
const BASE = {
  male: {
    'Daily casual': { top: 'Well-fitted plain tee or polo', bottom: 'Dark slim-straight jeans or chinos', layer: 'Light overshirt if cool', footwear: 'Clean white sneakers', extra: 'Simple watch' },
    'Home lounge': { top: 'Soft cotton tee', bottom: 'Joggers or lounge shorts', layer: 'Zip hoodie', footwear: 'Slides', extra: '' },
    'Office': { top: 'Oxford shirt (palette color), tucked', bottom: 'Tailored chinos or trousers', layer: 'Knit or blazer if formal office', footwear: 'Loafers or derbies', extra: 'Leather belt matching shoes' },
    'Friends hangout': { top: 'Henley or printed shirt (one statement max)', bottom: 'Jeans', layer: 'Denim/bomber jacket', footwear: 'Sneakers', extra: 'Cap if sunny' },
    'Party night': { top: 'Dark fitted shirt or knit polo', bottom: 'Black or dark trousers', layer: 'Bomber or unstructured blazer', footwear: 'Chelsea boots or minimal sneakers', extra: 'One accent: watch or chain, not both' },
    'Worship visit': { top: 'Modest kurta or plain collared shirt, sleeves preferred', bottom: 'Trousers or pyjama/churidar', layer: 'Light shawl if custom asks', footwear: 'Easy to remove — loafers/sandals', extra: 'Head cover where required (gurudwara/mosque)' },
    'Date night': { top: 'Fitted knit or crisp shirt in your best palette color', bottom: 'Dark tailored trousers or best jeans', layer: 'Blazer or suede jacket', footwear: 'Boots or loafers', extra: 'Light fragrance, groomed beard/neckline' },
    'Business formal': { top: 'White or light-blue dress shirt', bottom: 'Charcoal/navy suit trousers', layer: 'Matching suit jacket', footwear: 'Black oxfords', extra: 'Tie in a palette color; matching belt' },
    'Ethnic / function': { top: 'Kurta (palette color) — knee length', bottom: 'Churidar or straight pyjama', layer: 'Nehru jacket for weddings', footwear: 'Mojaris or leather sandals', extra: 'Pocket square if jacketed' },
    'Gym': { top: 'Breathable training tee', bottom: 'Shorts or joggers', layer: '', footwear: 'Training shoes (not running shoes for lifting)', extra: 'Towel; fitted socks' },
  },
  female: {
    'Daily casual': { top: 'Fitted tee or casual top in a palette color', bottom: 'High-waist jeans or comfortable trousers', layer: 'Cardigan or light jacket', footwear: 'Sneakers or flats', extra: 'Small earrings' },
    'Home lounge': { top: 'Soft tee or lounge top', bottom: 'Lounge pants / shorts', layer: 'Oversized hoodie', footwear: 'Slippers', extra: '' },
    'Office': { top: 'Blouse or fine-knit top', bottom: 'Tailored trousers, pencil or A-line skirt', layer: 'Blazer', footwear: 'Block heels, loafers or clean flats', extra: 'Minimal jewelry; structured bag' },
    'Friends hangout': { top: 'Cute top or casual shirt', bottom: 'Jeans or a casual skirt/dress', layer: 'Denim jacket', footwear: 'Sneakers or sandals', extra: 'Crossbody bag' },
    'Party night': { top: 'Statement top or a dress in your best shade', bottom: '(if not a dress) sleek trousers or skirt', layer: 'Shrug or smart jacket', footwear: 'Heels you can actually stand in', extra: 'One hero accessory' },
    'Worship visit': { top: 'Modest kurti or top with sleeves', bottom: 'Leggings/palazzo or saree/suit per custom', layer: 'Dupatta/scarf (doubles as head cover where required)', footwear: 'Easy to remove', extra: 'Light jewelry' },
    'Date night': { top: 'A dress or a silk-feel top in your palette', bottom: '(if not a dress) fitted trousers or skirt', layer: 'Elegant jacket or shawl', footwear: 'Heels or dressy flats', extra: 'Fragrance; one statement piece' },
    'Business formal': { top: 'Crisp shirt or shell top', bottom: 'Suit trousers or knee-length skirt', layer: 'Structured blazer', footwear: 'Closed pumps or smart flats', extra: 'Watch; neat hair' },
    'Ethnic / function': { top: 'Kurti / blouse in a palette color', bottom: 'Saree, lehenga or palazzo suit', layer: 'Dupatta draped to flatter the frame', footwear: 'Juttis or heels', extra: 'Jhumkas or a statement necklace — not both' },
    'Gym': { top: 'Supportive sports bra + breathable tee/tank', bottom: 'High-waist leggings or shorts', layer: 'Light zip-up', footwear: 'Training shoes', extra: 'Hair tie; towel' },
  },
}

const INNERS = {
  male: 'Under whites/light shirts: a grey or skin-tone undershirt shows least. No visible lines: fitted, not loose.',
  female: 'Under lights/whites: seamless, skin-tone innerwear disappears best. Match the bra to the cut — strapless for off-shoulder, T-shirt bra under fitted knits, proper sports bra for gym. Shapewear is an option for bodycon, never a requirement.',
}

export function buildOutfit(profile = {}, occasion = 'Daily casual') {
  const gender = profile.gender === 'female' ? 'female' : 'male'
  const base = BASE[gender][occasion] || BASE[gender]['Daily casual']
  const shape = profile.bodyShape && SHAPE_NOTES[profile.bodyShape] ? profile.bodyShape : null
  const pieces = [
    ['Top', base.top, 'top'],
    ['Bottom', base.bottom, 'bottom'],
    base.layer && ['Layer', base.layer, 'layer'],
    ['Footwear', base.footwear, 'footwear'],
    base.extra && ['Finish', base.extra, 'accessory'],
  ].filter(Boolean).map(([part, idea, key]) => ({ part, idea, key }))
  return {
    pieces,
    shapeNotes: shape ? SHAPE_NOTES[shape] : ['Set your body shape above to get fit-specific tweaks.'],
    innersNote: INNERS[gender],
  }
}

// ---- haircut / hairstyle ----
const CUTS = {
  male: {
    'Oval': ['Classic taper', 'Textured crop', 'Side part — almost anything works'],
    'Round': ['High fade + volume on top', 'Pompadour or quiff (height slims the face)', 'Avoid: buzz-all-over and heavy fringes'],
    'Square': ['Textured crop with soft edges', 'Short sides + light length on top', 'Avoid: hard boxy lines that over-sharpen the jaw'],
    'Heart': ['Medium length with fuller sides', 'Side-swept fringe balances a wider forehead', 'Avoid: extra height with tight sides'],
    'Oblong': ['Medium sides, moderate top — no extra height', 'Fringe shortens the face nicely', 'Avoid: tall pompadours'],
  },
  female: {
    'Oval': ['Long layers', 'Curtain bangs', 'Blunt lob — most cuts flatter you'],
    'Round': ['Long layers past the chin', 'Side part with face-framing pieces', 'Avoid: chin-length blunt bobs'],
    'Square': ['Soft layered waves', 'Side-swept bangs', 'Avoid: straight blunt lines at the jaw'],
    'Heart': ['Chin-to-shoulder cuts adding width at the jaw', 'Curtain bangs', 'Avoid: heavy crown volume'],
    'Oblong': ['Waves/curls for side volume', 'Full or curtain bangs', 'Avoid: long dead-straight with center part'],
  },
}

export function haircutGuide(profile = {}) {
  const gender = profile.gender === 'female' ? 'female' : 'male'
  const face = FACE_SHAPES.includes(profile.faceShape) ? profile.faceShape : 'Oval'
  const cuts = CUTS[gender][face]
  const barberSpec = gender === 'male'
    ? ['Sides: fade or #2–#3 guard (say which you prefer).', 'Top: keep 2.5–4 inches (6–10 cm) for styling.', 'Ask for “texture on top, blended sides.”', 'Neckline: natural/tapered, not a hard straight line.']
    : ['Bring a photo of the target cut — words lie, photos don’t.', 'Ask for layers cut to collarbone/shoulder (be specific in cm).', 'Face-framing pieces from cheekbone length.', 'Trim = 1–2 cm unless you say otherwise. Say it clearly.']
  const styleSteps = gender === 'male'
    ? ['Towel-dry to damp.', 'Pea-size product (clay = matte, pomade = shine) rubbed in palms.', 'Work back-to-front, then shape front last.', 'Optional: 10s of blow-dryer for volume before product.']
    : ['On damp hair: heat protectant if using heat.', 'Rough-dry to 80%, then round-brush or straighten sections.', 'Curls: diffuse with a leave-in, scrunch, don’t touch till dry.', 'Finish: 1–2 drops of serum/oil on ends only.']
  return { face, cuts, barberSpec, styleSteps }
}

const BEARD = {
  'Oval': ['Almost anything: stubble to full beard.', 'Keep the neckline clean — that alone is 80% of looking sharp.'],
  'Round': ['Go longer at the chin, shorter on the cheeks (adds length).', 'Goatee or ducktail shapes work; avoid full round beards.'],
  'Square': ['Soften the jaw: rounded full beard or circle beard.', 'Avoid sharp squared-off lines.'],
  'Heart': ['Fuller beard adds jaw presence.', 'Avoid narrow goatees that pinch the chin.'],
  'Oblong': ['Fuller on the cheeks, shorter at the chin — adds width.', 'Avoid long pointed beards.'],
}

export function beardGuide(profile = {}) {
  const face = FACE_SHAPES.includes(profile.faceShape) ? profile.faceShape : 'Oval'
  return {
    face,
    shapes: BEARD[face],
    steps: [
      'Neckline rule: two fingers above the Adam’s apple — everything below goes.',
      'Cheek line: follow the natural line; clean strays, don’t carve it too low.',
      'Trim with a guard, always downward on cheeks, upward under jaw.',
      'Wash 2–3× a week; 2–3 drops of beard oil on damp beard daily; comb to train.',
    ],
  }
}

export function groomingGuide(profile = {}) {
  const tone = String(profile.undertone || 'neutral').toLowerCase()
  const lip = tone === 'warm' ? 'peach, coral, brick and warm reds'
    : tone === 'cool' ? 'berry, mauve, rose and blue-reds'
    : 'rose, soft red and mauve — most shades behave for you'
  return {
    hairRemoval: [
      'Waxing lasts ~3–4 weeks; shaving 2–4 days; pick per body area and pain budget.',
      'Wax when hair is ~5 mm (2–3 weeks growth). Exfoliate the day before, never the day of.',
      'Post-wax: no sun, gym or hot showers for 24h; moisturize.',
      'Face: threading is precise for brows/upper lip (every 2–3 weeks).',
    ],
    nails: [
      'Remove old polish; soak hands/feet 5 min in warm soapy water.',
      'Push cuticles back gently — don’t cut them.',
      'File in one direction to shape; buff lightly.',
      'Feet: pumice heels while damp.',
      'Oil or cream massage; polish after skin is fully dry (base → color → top coat).',
      'Repeat every 2–3 weeks.',
    ],
    makeup: [
      `Foundation: match your ${tone} undertone at the JAWLINE in daylight — not on the hand.`,
      'Base order: moisturizer → sunscreen → primer (optional) → foundation/BB → concealer only where needed.',
      'Cream blush on smile points; blend up toward temples.',
      `Lips that suit your undertone: ${lip}.`,
      'Set the T-zone only if oily; mist for a natural finish.',
      'Check your allergy list against ingredients — and remove everything before sleep, every night.',
    ],
  }
}

// Parse "KEY: value" lines out of an AI reply
export function parseTag(reply, key) {
  const m = String(reply).match(new RegExp(key + ':\\s*([^\\n|]+)', 'i'))
  return m ? m[1].trim() : null
}
