// Unified inventory — one place for everything the user has or needs,
// across food, supplements, skin, hair, clothing, footwear, innerwear.
// Status lives in profile.inventory: { [itemName]: 'have' | 'need' }.
// Custom items live in profile.customItems: [{ name, cat }].

export const CATALOG = [
  // ---- Proteins ----
  ...[['Chicken breast', '165 kcal · 31g protein/100g — best lean protein'],
    ['Eggs (dozen)', '155 kcal · complete amino acids'],
    ['Paneer', '296 kcal · 21g protein/200g — top veg protein'],
    ['Tofu', '76 kcal · 8g protein/100g'],
    ['Fish / salmon', 'Omega-3 rich'], ['Tuna (canned)', 'Cheapest high-protein food'],
    ['Greek yogurt / curd', '10g protein/100g'], ['Whey protein', 'Fastest post-workout protein'],
    ['Masoor dal (red lentils)', '18g protein/cup — cooks fastest'],
    ['Moong dal', 'Easiest dal to digest'], ['Kidney beans (rajma)', 'Iron + protein'],
    ['Chickpeas (chana)', 'Versatile: curry, salad, hummus'], ['Soya chunks', '52g protein/100g dry'],
  ].map(([name, note]) => ({ name, cat: 'Proteins', note })),
  // ---- Vegetables ----
  ...['Spinach', 'Broccoli', 'Onion', 'Tomato', 'Potato', 'Sweet potato', 'Carrot', 'Capsicum',
    'Cucumber', 'Cabbage', 'Cauliflower', 'Beans', 'Peas', 'Garlic', 'Ginger', 'Mushroom', 'Beetroot']
    .map((name) => ({ name, cat: 'Vegetables' })),
  // ---- Fruits ----
  ...['Banana', 'Apple', 'Orange', 'Papaya', 'Watermelon', 'Grapes', 'Pomegranate', 'Mango',
    'Berries', 'Avocado', 'Lemon', 'Dates']
    .map((name) => ({ name, cat: 'Fruits' })),
  // ---- Grains ----
  ...[['Oats', 'Slow-release breakfast carb'], ['Rice', ''], ['Brown rice', ''], ['Whole-wheat atta / bread', ''],
    ['Quinoa', 'Complete-protein grain'], ['Poha', ''], ['Millets (ragi/jowar)', 'High fiber'], ['Noodles/pasta', '']]
    .map(([name, note]) => ({ name, cat: 'Grains', note })),
  // ---- Dairy ----
  ...['Milk', 'Butter', 'Ghee', 'Cheese', 'Buttermilk'].map((name) => ({ name, cat: 'Dairy' })),
  // ---- Oils & Spices ----
  ...['Olive oil', 'Cooking oil', 'Salt', 'Black pepper', 'Turmeric', 'Chili powder', 'Garam masala',
    'Cumin', 'Honey', 'Soy sauce', 'Vinegar', 'Green tea', 'Coffee']
    .map((name) => ({ name, cat: 'Oils & Spices' })),
  // ---- Nuts & Seeds ----
  ...[['Almonds', 'Vitamin E + healthy fats'], ['Walnuts', 'Brain-food omega-3'], ['Peanuts / peanut butter', ''],
    ['Cashews', ''], ['Chia seeds', 'Fiber + omega-3'], ['Flax seeds', ''], ['Pumpkin seeds', 'Magnesium — great luteal-phase snack']]
    .map(([name, note]) => ({ name, cat: 'Nuts & Seeds', note })),
  // ---- Supplements ----
  ...[['Multivitamin', ''], ['Vitamin D3', 'Most people are deficient — ask a doctor for dose'],
    ['Omega-3 fish oil', ''], ['Creatine', 'Most-researched gym supplement'], ['Magnesium', 'Sleep + cramps'],
    ['Iron', 'Especially during periods — doctor-guided'], ['Protein bar', ''], ['Electrolytes / ORS', '']]
    .map(([name, note]) => ({ name, cat: 'Supplements', note })),
  // ---- Skincare ----
  ...['Face cleanser', 'Moisturizer', 'Sunscreen SPF 50', 'Hyaluronic serum', 'Niacinamide serum',
    'Salicylic acid (BHA)', 'Face mask', 'Lip balm', 'Micellar water', 'Aloe vera gel']
    .map((name) => ({ name, cat: 'Skincare' })),
  // ---- Haircare ----
  ...['Shampoo', 'Anti-dandruff shampoo', 'Conditioner', 'Hair oil', 'Leave-in conditioner',
    'Curl cream', 'Hair serum', 'Heat protectant', 'Deep-conditioning mask', 'Wide-tooth comb', 'Microfiber towel']
    .map((name) => ({ name, cat: 'Haircare' })),
  // ---- Grooming & Makeup ----
  ...['Foundation / BB cream', 'Concealer', 'Compact powder', 'Kajal / eyeliner', 'Mascara', 'Blush',
    'Lipstick', 'Makeup remover', 'Razor / trimmer', 'Beard oil', 'Aftershave', 'Wax strips', 'Nail kit']
    .map((name) => ({ name, cat: 'Grooming & Makeup' })),
  // ---- Clothing basics ----
  ...['White tee', 'Black tee', 'Formal shirt', 'Jeans (dark)', 'Chinos', 'Joggers', 'Hoodie',
    'Blazer', 'Kurta / kurti', 'Ethnic set', 'Workout tee', 'Leggings / shorts', 'Winter jacket']
    .map((name) => ({ name, cat: 'Clothing' })),
  // ---- Footwear ----
  ...['White sneakers', 'Running/training shoes', 'Formal shoes', 'Sandals / slides', 'Ethnic footwear', 'Boots']
    .map((name) => ({ name, cat: 'Footwear' })),
  // ---- Innerwear ----
  ...['Everyday innerwear (7+)', 'Seamless set', 'Sports bra / supporter', 'Nude-tone set', 'Thermal set', 'Socks (ankle + crew)']
    .map((name) => ({ name, cat: 'Innerwear' })),
  // ---- Fitness gear ----
  ...['Yoga mat', 'Dumbbells', 'Resistance bands', 'Skipping rope', 'Water bottle', 'Gym bag']
    .map((name) => ({ name, cat: 'Fitness gear' })),
]

export const CATEGORY_GROUPS = [
  { key: 'all', label: '🌐 All', match: null },
  { key: 'food', label: '🍎 Food', match: ['Proteins', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Oils & Spices', 'Nuts & Seeds'] },
  { key: 'supps', label: '💊 Supplements', match: ['Supplements'] },
  { key: 'skin', label: '✨ Skincare', match: ['Skincare'] },
  { key: 'hair', label: '💇 Haircare', match: ['Haircare'] },
  { key: 'groom', label: '💄 Grooming', match: ['Grooming & Makeup'] },
  { key: 'wear', label: '👕 Clothing', match: ['Clothing', 'Footwear', 'Innerwear'] },
  { key: 'fit', label: '🏋️ Fitness', match: ['Fitness gear'] },
]

export const FOOD_CATS = CATEGORY_GROUPS.find((g) => g.key === 'food').match
export const CARE_CATS = ['Skincare', 'Haircare']

// All items (catalog + user's custom), with legacy pantry/careShelf migrated in
export function allItems(profile = {}) {
  const custom = (profile.customItems || []).map((c) => ({ ...c, custom: true }))
  const known = new Set([...CATALOG, ...custom].map((i) => i.name.toLowerCase()))
  const legacy = [
    ...(profile.pantry || []).map((name) => ({ name, cat: 'Oils & Spices', legacy: 'food' })),
    ...(profile.careShelf || []).map((name) => ({ name, cat: 'Skincare', legacy: 'care' })),
  ].filter((i) => !known.has(i.name.toLowerCase()))
  return [...CATALOG, ...custom, ...legacy]
}

export function statusOf(profile, name) {
  const inv = profile.inventory || {}
  if (inv[name]) return inv[name]
  // legacy lists count as "have" until the user touches the item
  if ((profile.pantry || []).some((x) => x.toLowerCase() === name.toLowerCase())) return 'have'
  if ((profile.careShelf || []).some((x) => x.toLowerCase() === name.toLowerCase())) return 'have'
  return ''
}

export function counts(profile) {
  let have = 0, need = 0
  for (const item of allItems(profile)) {
    const s = statusOf(profile, item.name)
    if (s === 'have') have++
    else if (s === 'need') need++
  }
  return { have, need }
}

// Names the Diet module treats as "in my kitchen"
export function haveFoodNames(profile) {
  return allItems(profile)
    .filter((i) => (FOOD_CATS.includes(i.cat) || i.legacy === 'food') && statusOf(profile, i.name) === 'have')
    .map((i) => i.name)
}

// Names the Care module treats as "on my shelf"
export function haveCareNames(profile) {
  return allItems(profile)
    .filter((i) => (CARE_CATS.includes(i.cat) || i.cat === 'Grooming & Makeup' || i.legacy === 'care') && statusOf(profile, i.name) === 'have')
    .map((i) => i.name)
}

// Returns the profile patch for a status change (empty string clears)
export function setStatusPatch(profile, name, status) {
  const inv = { ...(profile.inventory || {}) }
  if (status) inv[name] = status
  else delete inv[name]
  return { inventory: inv }
}

export function addCustomPatch(profile, name, cat = 'Oils & Spices', status = 'have') {
  const exists = allItems(profile).some((i) => i.name.toLowerCase() === name.toLowerCase())
  const patch = setStatusPatch(profile, name, status)
  if (!exists) patch.customItems = [...(profile.customItems || []), { name, cat }]
  return patch
}
