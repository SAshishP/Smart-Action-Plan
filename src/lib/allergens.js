// ============ Allergen & concern intelligence ============
// The important idea: an allergy is to an INGREDIENT FAMILY, not a word.
// Someone allergic to soya must also avoid tofu, tempeh, edamame, miso and
// soy sauce — foods made FROM soya. Plain text matching misses all of those.

export const ALLERGEN_FAMILIES = {
  soy: {
    label: 'Soy / soya',
    triggers: ['soy', 'soya', 'soja', 'lecithin'],
    foods: ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce', 'soya chunks',
      'tvp', 'textured vegetable protein', 'bean curd', 'tamari', 'natto'],
  },
  dairy: {
    label: 'Dairy / milk',
    triggers: ['dairy', 'milk', 'lactose', 'casein', 'whey'],
    foods: ['dairy', 'milk', 'paneer', 'curd', 'yogurt', 'yoghurt', 'cheese', 'butter', 'ghee',
      'cream', 'whey', 'buttermilk', 'lassi', 'khoya', 'condensed milk', 'malai', 'kefir',
      'ice cream', 'casein'],
  },
  egg: {
    label: 'Egg',
    triggers: ['egg'],
    foods: ['egg', 'eggs', 'mayonnaise', 'mayo', 'omelette', 'meringue', 'albumin', 'egg white'],
  },
  peanut: {
    label: 'Peanut',
    triggers: ['peanut', 'groundnut'],
    foods: ['peanut', 'peanuts', 'groundnut', 'peanut butter', 'arachis'],
  },
  treenuts: {
    label: 'Tree nuts',
    triggers: ['nut', 'nuts', 'tree nut', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut'],
    foods: ['nut', 'nuts', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'pecan',
      'macadamia', 'brazil nut', 'nutella', 'marzipan', 'praline'],
  },
  gluten: {
    label: 'Gluten / wheat',
    triggers: ['gluten', 'wheat', 'celiac', 'coeliac', 'atta', 'maida'],
    foods: ['gluten', 'wheat', 'atta', 'maida', 'bread', 'roti', 'chapati', 'paratha', 'naan',
      'pasta', 'noodle', 'noodles', 'semolina', 'suji', 'rava', 'barley', 'rye', 'seitan',
      'couscous', 'toast', 'biscuit', 'cracker', 'upma', 'dalia'],
    caution: ['oats', 'poha'], // naturally GF but commonly cross-contaminated
    cautionNote: 'often cross-contaminated with wheat — use certified gluten-free',
  },
  fish: {
    label: 'Fish',
    triggers: ['fish', 'seafood'],
    foods: ['fish', 'tuna', 'salmon', 'sardine', 'anchovy', 'mackerel', 'cod', 'tilapia',
      'pomfret', 'rohu', 'surmai', 'fish oil'],
  },
  shellfish: {
    label: 'Shellfish',
    triggers: ['shellfish', 'crustacean', 'prawn', 'shrimp', 'crab'],
    foods: ['shellfish', 'prawn', 'shrimp', 'crab', 'lobster', 'squid', 'calamari', 'oyster',
      'mussel', 'clam', 'scallop'],
  },
  sesame: {
    label: 'Sesame',
    triggers: ['sesame', 'til', 'tahini'],
    foods: ['sesame', 'til', 'tahini', 'gingelly', 'hummus'],
  },
  mustard: {
    label: 'Mustard',
    triggers: ['mustard', 'sarson'],
    foods: ['mustard', 'sarson', 'kasundi'],
  },
  corn: {
    label: 'Corn / maize',
    triggers: ['corn', 'maize'],
    foods: ['corn', 'maize', 'cornflour', 'cornstarch', 'popcorn', 'makai', 'corn syrup'],
  },
  legumes: {
    label: 'Legumes / pulses',
    triggers: ['legume', 'pulse', 'lentil', 'bean'],
    foods: ['dal', 'lentil', 'bean', 'rajma', 'chickpea', 'chana', 'moong', 'masoor', 'toor',
      'sprouts', 'hummus', 'peas'],
  },
  allium: {
    label: 'Onion / garlic',
    triggers: ['onion', 'garlic', 'allium'],
    foods: ['onion', 'garlic', 'shallot', 'spring onion', 'leek', 'chive'],
  },
  nightshade: {
    label: 'Nightshades',
    triggers: ['nightshade', 'tomato', 'brinjal', 'eggplant'],
    foods: ['tomato', 'potato', 'brinjal', 'eggplant', 'capsicum', 'bell pepper', 'chili', 'paprika'],
  },
  caffeine: {
    label: 'Caffeine',
    triggers: ['caffeine', 'coffee'],
    foods: ['coffee', 'caffeine', 'green tea', 'black tea', 'cola', 'energy drink', 'dark chocolate'],
  },
}

function splitTerms(str) {
  return String(str || '')
    .toLowerCase()
    .split(/[,;\n/]|\band\b|&/)
    .map((s) => s.replace(/[().]/g, ' ').trim())
    .filter((s) => s.length > 1)
}

// What the user typed → every food term that must be avoided, plus which
// family caused it (so the UI can explain WHY something was excluded).
// A few conditions are absolute food rules, not preferences — coeliac disease
// means gluten causes intestinal damage, so it belongs in the same hard filter
// as an allergy rather than in a list of tips the user has to remember.
const CONDITION_AVOID = { celiac: ['gluten'] }

export function buildAvoidance(profile = {}) {
  const fromConditions = (profile.conditions || []).flatMap((k) => CONDITION_AVOID[k] || [])
  const raw = [...splitTerms(profile.allergies), ...splitTerms(profile.foodsToAvoid), ...fromConditions]
  const terms = new Map()   // food term -> reason label
  const cautions = new Map()
  const families = []

  for (const entry of raw) {
    let matchedFamily = false
    for (const [key, fam] of Object.entries(ALLERGEN_FAMILIES)) {
      const hit = fam.triggers.some((t) => entry === t || entry.includes(t)) ||
        fam.foods.some((f) => entry === f)
      if (hit) {
        matchedFamily = true
        if (!families.includes(key)) families.push(key)
        for (const food of fam.foods) terms.set(food, fam.label)
        for (const c of fam.caution || []) cautions.set(c, `${fam.label}: ${fam.cautionNote}`)
      }
    }
    // always honor the literal word too (covers foods we don't have a family for)
    if (!matchedFamily || entry.length > 2) terms.set(entry, 'your list')
  }
  return { terms, cautions, families, raw }
}

// Does this text (recipe name + ingredients + tags) hit anything avoided?
// Returns { blocked: bool, reasons: [{term, why}], cautions: [...] }
export function checkText(text, avoidance) {
  const t = ' ' + String(text).toLowerCase() + ' '
  const reasons = []
  for (const [term, why] of avoidance.terms) {
    if (t.includes(term)) reasons.push({ term, why })
  }
  const cautions = []
  for (const [term, note] of avoidance.cautions) {
    if (t.includes(term)) cautions.push({ term, note })
  }
  return { blocked: reasons.length > 0, reasons, cautions }
}

export function recipeText(r) {
  return [r.name, (r.allergens || []).join(' '), (r.ingredients || []).map((i) => i[0]).join(' ')].join(' ')
}

// ============ Medication ↔ food interactions ============
// Informational only: these are well-documented interaction CATEGORIES.
// SAP never says "stop taking" anything — it says "worth asking your
// doctor or pharmacist about", which is the correct, safe action.

const MED_INTERACTIONS = [
  { meds: ['warfarin', 'coumadin', 'acitrom', 'blood thinner', 'anticoagulant'],
    foods: ['spinach', 'kale', 'broccoli', 'cabbage', 'green leafy'],
    note: 'Vitamin-K-rich greens affect how blood thinners work. The usual advice is to keep your intake STEADY rather than to stop eating greens — sudden changes are the problem. Confirm your target with your doctor.' },
  { meds: ['statin', 'atorvastatin', 'simvastatin', 'rosuvastatin', 'amlodipine', 'nifedipine'],
    foods: ['grapefruit'],
    note: 'Grapefruit can raise blood levels of several statins and BP medicines. Ask your pharmacist whether yours is affected.' },
  { meds: ['levothyroxine', 'thyronorm', 'eltroxin', 'thyroid'],
    foods: ['soy', 'soya', 'tofu', 'calcium', 'milk', 'iron', 'coffee'],
    note: 'Soy, calcium, iron and coffee can reduce absorption of thyroid medicine. Usual guidance: take the tablet on an empty stomach and keep these ~4 hours apart. Confirm timing with your doctor.' },
  { meds: ['metformin', 'glycomet', 'glucophage'],
    foods: ['alcohol'],
    note: 'Alcohol with metformin raises the risk of low blood sugar and lactic acidosis. Long-term use can also lower B12 — worth asking about a check.' },
  { meds: ['tetracycline', 'doxycycline', 'ciprofloxacin', 'levofloxacin', 'norflox'],
    foods: ['milk', 'curd', 'yogurt', 'cheese', 'calcium', 'iron'],
    note: 'Dairy, calcium and iron bind these antibiotics and reduce absorption. Usually taken 2 hours apart from them — check the leaflet or your pharmacist.' },
  { meds: ['maoi', 'phenelzine', 'tranylcypromine', 'selegiline', 'isocarboxazid'],
    foods: ['aged cheese', 'cheese', 'fermented', 'soy sauce', 'salami', 'tofu'],
    note: 'Tyramine-rich foods (aged cheese, fermented foods, soy sauce) can cause dangerous blood-pressure spikes with MAOIs. This is a strict, doctor-guided list.' },
  { meds: ['lithium'],
    foods: ['salt', 'caffeine', 'coffee'],
    note: 'Big swings in salt, caffeine or hydration change lithium levels. Keep intake steady and stay hydrated; your doctor monitors this with blood tests.' },
  { meds: ['iron', 'ferrous', 'orofer', 'fefol'],
    foods: ['tea', 'coffee', 'milk', 'calcium'],
    note: 'Tea, coffee, milk and calcium block iron absorption. Take iron with vitamin C (lemon, citrus) instead, and keep dairy/tea ~2 hours apart.' },
  { meds: ['isotretinoin', 'accutane', 'sotret'],
    foods: ['vitamin a', 'alcohol', 'liver'],
    note: 'Extra vitamin A supplements and alcohol are usually avoided on isotretinoin. Also needs strict medical supervision — follow your dermatologist exactly.' },
  { meds: ['prednisone', 'prednisolone', 'steroid'],
    foods: ['salt', 'sugar'],
    note: 'Steroids can raise blood sugar and cause fluid retention — lower salt and refined sugar usually helps. Your doctor may also advise calcium/vitamin D.' },
  { meds: ['mao', 'ssri', 'sertraline', 'fluoxetine', 'escitalopram'],
    foods: ['alcohol', "st john's wort"],
    note: 'Alcohol and St John’s Wort interact with antidepressants. Worth a quick word with your prescriber before adding either.' },
]

export function medicationFlags(medications = '') {
  const m = String(medications || '').toLowerCase()
  if (!m.trim()) return []
  return MED_INTERACTIONS
    .filter((x) => x.meds.some((name) => m.includes(name)))
    .map((x) => ({ foods: x.foods, note: x.note }))
}

// Foods to show a caution on because of medication (not blocked, just flagged)
export function medicationCautionTerms(medications = '') {
  const set = new Map()
  for (const f of medicationFlags(medications)) {
    for (const food of f.foods) set.set(food, f.note)
  }
  return set
}
