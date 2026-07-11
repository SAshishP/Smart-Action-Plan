// Recipe library + daily meal planner.
// diets: veg, vegan, egg, nonveg, keto  ·  allergens: dairy, egg, nuts, peanut,
// gluten, soy, fish  ·  tags: iron (period-friendly), comfort (craving-friendly)

const R = (id, name, meal, diets, allergens, tags, time, kcal, protein, temp, ingredients, steps) =>
  ({ id, name, meal, diets, allergens, tags, time, kcal, protein, temp, ingredients, steps })

export const RECIPES = [
  // ---------- breakfast ----------
  R('masalaoats', 'Masala veggie oats', 'breakfast', ['veg', 'vegan'], ['gluten'], ['iron'],
    15, 320, 11, null,
    [['Oats', '½ cup'], ['Mixed vegetables (onion, tomato, peas, carrot)', '1 cup chopped'], ['Oil', '1 tsp'], ['Turmeric + chili + salt', 'to taste'], ['Water', '1½ cups']],
    ['Heat oil, sauté the vegetables 3–4 min.', 'Add spices, oats and water.', 'Simmer 5–6 min until thick, stirring.', 'Rest 2 min and serve hot.']),
  R('eggscramble', 'Veggie egg scramble + toast', 'breakfast', ['egg', 'nonveg'], ['egg', 'gluten'], [],
    12, 380, 22, null,
    [['Eggs', '3'], ['Onion + tomato + capsicum', '1 cup chopped'], ['Whole-wheat bread', '2 slices'], ['Oil or butter', '1 tsp'], ['Salt + pepper', 'to taste']],
    ['Sauté vegetables 3 min.', 'Beat eggs with salt and pepper, pour in.', 'Stir gently on low heat until just set.', 'Serve on toasted bread.']),
  R('yogurtbowl', 'Greek yogurt fruit bowl', 'breakfast', ['veg'], ['dairy', 'nuts'], ['comfort'],
    5, 300, 18, null,
    [['Greek yogurt / thick curd', '1 cup'], ['Banana or apple', '1, sliced'], ['Mixed nuts or seeds', '2 tbsp'], ['Honey', '1 tsp (optional)']],
    ['Spoon yogurt into a bowl.', 'Top with fruit, nuts and honey.', 'Done — eat slowly, actually taste it.']),
  R('pbtoast', 'Peanut butter banana toast', 'breakfast', ['veg', 'vegan'], ['peanut', 'gluten'], ['comfort'],
    5, 340, 12, null,
    [['Whole-wheat bread', '2 slices'], ['Peanut butter', '1½ tbsp'], ['Banana', '1, sliced'], ['Cinnamon', 'a pinch']],
    ['Toast the bread.', 'Spread peanut butter, layer banana.', 'Dust cinnamon on top.']),
  R('ketoeggs', 'Keto egg & avocado plate', 'breakfast', ['egg', 'keto'], ['egg'], [],
    10, 420, 20, null,
    [['Eggs', '3'], ['Avocado', '½'], ['Olive oil', '1 tsp'], ['Salt + chili flakes', 'to taste']],
    ['Fry or boil the eggs to your liking.', 'Slice avocado alongside.', 'Drizzle oil, season, done.']),

  // ---------- lunch ----------
  R('chickenbowl', 'Chicken & rice power bowl', 'lunch', ['nonveg'], [], ['iron'],
    30, 560, 42, null,
    [['Chicken breast', '150 g, cubed'], ['Rice', '¾ cup cooked'], ['Mixed vegetables', '1 cup'], ['Oil', '2 tsp'], ['Ginger-garlic + spices', 'to taste']],
    ['Marinate chicken with spices 10 min.', 'Pan-cook chicken 6–8 min until done inside.', 'Sauté vegetables 3 min in the same pan.', 'Serve over rice.']),
  R('rajmabowl', 'Rajma (kidney bean) bowl', 'lunch', ['veg', 'vegan'], [], ['iron', 'comfort'],
    35, 480, 19, null,
    [['Kidney beans (boiled/canned)', '1 cup'], ['Onion + tomato', '1 cup chopped'], ['Rice', '¾ cup cooked'], ['Oil', '2 tsp'], ['Garam masala + cumin + salt', 'to taste']],
    ['Sauté onion till golden, add tomato and spices.', 'Add beans + ½ cup water, simmer 10 min.', 'Mash a few beans to thicken.', 'Serve over rice.']),
  R('paneerwrap', 'Paneer veggie wrap', 'lunch', ['veg'], ['dairy', 'gluten'], [],
    20, 450, 24, null,
    [['Paneer', '100 g, cubed'], ['Whole-wheat roti/tortilla', '2'], ['Onion + capsicum', '1 cup sliced'], ['Curd + spices', '2 tbsp'], ['Oil', '1 tsp']],
    ['Toss paneer and veggies with spiced curd.', 'Pan-sear 4–5 min until edges brown.', 'Fill rotis, roll tight, grill seam-side 1 min.']),
  R('tunasalad', 'Tuna protein salad', 'lunch', ['nonveg', 'keto'], ['fish', 'egg'], [],
    10, 390, 34, null,
    [['Canned tuna', '1 can, drained'], ['Boiled egg', '1'], ['Cucumber + tomato + onion', '1½ cups'], ['Olive oil + lemon', '1 tbsp'], ['Salt + pepper', 'to taste']],
    ['Chop everything into a bowl.', 'Flake in tuna, add egg quarters.', 'Dress with oil, lemon, salt, pepper. Toss.']),
  R('chickpeasalad', 'Chickpea crunch salad', 'lunch', ['veg', 'vegan'], [], ['iron'],
    12, 420, 17, null,
    [['Boiled chickpeas', '1 cup'], ['Cucumber + tomato + onion', '1½ cups'], ['Lemon + olive oil', '1 tbsp'], ['Chaat masala or salt + pepper', 'to taste']],
    ['Combine chickpeas and chopped veg.', 'Dress with lemon, oil and spices.', 'Toss and let sit 5 min for flavor.']),

  // ---------- snack ----------
  R('fruitnuts', 'Fruit + nuts plate', 'snack', ['veg', 'vegan'], ['nuts'], [],
    3, 200, 5, null,
    [['Seasonal fruit', '1 cup'], ['Mixed nuts', 'small handful (20 g)']],
    ['Slice fruit, add nuts.', 'That’s it. Better than the packet snack.']),
  R('sprouts', 'Sprouts chaat', 'snack', ['veg', 'vegan'], [], ['iron'],
    8, 180, 10, null,
    [['Moong sprouts', '1 cup'], ['Onion + tomato', '½ cup chopped'], ['Lemon + chaat masala', 'to taste']],
    ['Mix everything in a bowl.', 'Squeeze lemon, sprinkle masala, toss.']),
  R('boiledeggs', 'Boiled eggs + pepper', 'snack', ['egg', 'keto', 'nonveg'], ['egg'], [],
    12, 160, 13, null,
    [['Eggs', '2'], ['Salt + black pepper', 'to taste']],
    ['Boil eggs 9–10 min for firm yolks.', 'Cool in cold water, peel, season.']),
  R('chocdates', 'Choco-peanut stuffed dates', 'snack', ['veg', 'vegan'], ['peanut'], ['comfort'],
    6, 190, 4, null,
    [['Dates', '3, pitted'], ['Peanut butter', '1 tbsp'], ['Dark chocolate', '2 squares, melted']],
    ['Stuff each date with peanut butter.', 'Drizzle melted dark chocolate.', 'Chill 5 min. Craving handled — portion controlled.']),

  // ---------- dinner ----------
  R('grilledchicken', 'Grilled chicken + veggies', 'dinner', ['nonveg', 'keto'], [], ['iron'],
    30, 480, 45, '200°C / 390°F if oven-baking',
    [['Chicken breast/thigh', '180 g'], ['Broccoli + carrot + beans', '1½ cups'], ['Olive oil', '2 tsp'], ['Garlic + chili + salt', 'to taste']],
    ['Marinate chicken 15 min.', 'Grill/pan-cook 6–7 min per side until cooked through.', 'Sauté or roast veggies with garlic.', 'Rest chicken 3 min, then serve.']),
  R('dalrice', 'Dal + rice + salad', 'dinner', ['veg', 'vegan'], [], ['iron', 'comfort'],
    30, 460, 18, null,
    [['Toor/moong dal', '½ cup'], ['Rice', '¾ cup cooked'], ['Onion + tomato tempering', '½ cup'], ['Ghee or oil', '1 tsp'], ['Cucumber-onion salad', '1 cup']],
    ['Pressure-cook dal with turmeric until soft.', 'Temper onion-tomato with spices, stir into dal.', 'Simmer 5 min.', 'Serve with rice and salad.']),
  R('stirfrynoodles', 'Veg stir-fry noodles', 'dinner', ['veg'], ['gluten', 'soy'], ['comfort'],
    20, 430, 13, null,
    [['Noodles', '1 serving'], ['Cabbage + capsicum + carrot', '2 cups sliced'], ['Soy sauce', '1 tbsp'], ['Oil', '2 tsp'], ['Garlic', '2 cloves']],
    ['Boil noodles al dente; drain.', 'Stir-fry garlic and veggies on high 3–4 min.', 'Toss in noodles + soy sauce for 1–2 min.']),
  R('palakpaneer', 'Palak paneer + roti', 'dinner', ['veg'], ['dairy', 'gluten'], ['iron'],
    35, 490, 25, null,
    [['Spinach', '250 g'], ['Paneer', '100 g'], ['Onion + tomato + garlic', '1 cup'], ['Whole-wheat roti', '2'], ['Oil + spices', 'to taste']],
    ['Blanch spinach 2 min, blend to a purée.', 'Sauté onion-garlic-tomato with spices.', 'Add purée, simmer 5 min, add paneer cubes.', 'Serve with rotis.']),
  R('bakedfish', 'Baked fish + potatoes', 'dinner', ['nonveg'], ['fish'], ['iron'],
    35, 470, 36, '190°C / 375°F',
    [['White fish fillet', '180 g'], ['Baby potatoes', '150 g, halved'], ['Olive oil', '2 tsp'], ['Lemon + garlic + herbs', 'to taste']],
    ['Toss potatoes in oil, bake 15 min at 190°C.', 'Add seasoned fish to the tray.', 'Bake 12–14 more min until fish flakes.', 'Finish with lemon.']),
  R('tofustirfry', 'Tofu veggie stir-fry', 'dinner', ['veg', 'vegan', 'keto'], ['soy'], ['iron'],
    20, 400, 22, null,
    [['Firm tofu', '150 g, cubed'], ['Broccoli + capsicum', '2 cups'], ['Soy sauce', '1 tbsp'], ['Oil', '2 tsp'], ['Garlic + chili', 'to taste']],
    ['Pan-sear tofu until golden; set aside.', 'Stir-fry veggies 3–4 min on high.', 'Return tofu, add sauce, toss 1 min.']),
]

// ---- filtering ----

function dietAllows(recipe, dietType = '') {
  const d = String(dietType).toLowerCase()
  if (!d || d.includes('no specific')) return true
  if (d.includes('vegan')) return recipe.diets.includes('vegan')
  if (d.includes('vegetarian') && !d.includes('non')) return recipe.diets.includes('veg') || recipe.diets.includes('vegan')
  if (d.includes('eggetarian')) return recipe.diets.some((x) => ['veg', 'vegan', 'egg'].includes(x))
  if (d.includes('keto')) return recipe.diets.includes('keto')
  return true // non-vegetarian eats anything
}

function violates(recipe, profile) {
  const bad = (String(profile.allergies || '') + ',' + String(profile.foodsToAvoid || ''))
    .toLowerCase().split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
  if (!bad.length) return false
  const text = (recipe.allergens.join(' ') + ' ' + recipe.name + ' ' +
    recipe.ingredients.map((i) => i[0]).join(' ')).toLowerCase()
  return bad.some((b) => text.includes(b))
}

export function safeRecipes(profile) {
  return RECIPES.filter((r) => dietAllows(r, profile.dietType) && !violates(r, profile))
}

// How many of the recipe's ingredients the user's pantry covers
export function pantryMatch(recipe, pantry = []) {
  const have = pantry.map((p) => p.toLowerCase())
  const hits = recipe.ingredients.filter(([name]) =>
    have.some((h) => name.toLowerCase().includes(h) || h.includes(name.toLowerCase().split(' ')[0]))
  )
  return { have: hits.length, total: recipe.ingredients.length,
    missing: recipe.ingredients.filter((i) => !hits.includes(i)).map((i) => i[0]) }
}

const FALLBACK = {
  id: 'askai', name: 'Custom safe meal — ask the Assistant', meal: 'any',
  diets: ['veg', 'vegan', 'egg', 'nonveg', 'keto'], allergens: [], tags: [],
  time: 5, kcal: 0, protein: 0, temp: null,
  ingredients: [['Your safe staples', 'whatever you have']],
  steps: [
    'Your allergy / avoid list filters out every built-in recipe for this slot — good, that’s the filter doing its job.',
    'Open the ✨ Assistant tab and ask for a meal idea: it knows your allergies and will only suggest safe foods.',
  ],
}

// Daily plan: one recipe per meal, allergy-safe, rotated daily,
// pantry-coverage preferred, iron-rich prioritized during the period.
// HARD RULE: an allergen is never served — if a meal slot has no safe
// recipe, a safe recipe from another slot (or a placeholder) is used instead.
export function planMeals(profile, pantry = [], swaps = {}, cyclePhase = null) {
  const dayIdx = Math.floor(Date.now() / 86400000)
  const safe = safeRecipes(profile)
  const result = {}
  for (const meal of ['breakfast', 'lunch', 'snack', 'dinner']) {
    let options = safe.filter((r) => r.meal === meal)
    if (!options.length) options = safe          // any safe recipe beats an allergen
    if (!options.length) options = [FALLBACK]    // extreme allergy lists
    options = options
      .map((r) => ({ r, score: pantryMatch(r, pantry).have + (cyclePhase === 'menstrual' && r.tags.includes('iron') ? 2 : 0) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r)
    const shift = (dayIdx + (swaps[meal] || 0)) % options.length
    result[meal] = options[(shift + options.length) % options.length]
  }
  return result
}

export const filterSafe = (list, profile) =>
  list.filter((r) => dietAllows(r, profile.dietType) && !violates(r, profile))

const SNACK = (name, when, diets, allergens, kcal, why) =>
  ({ name, when, diets, allergens, kcal, why, ingredients: [[name, '']], meal: 'snack' })

export const PRE_WORKOUT = [
  SNACK('Banana + peanut butter', '30–45 min before', ['veg', 'vegan'], ['peanut'], 200, 'Fast carbs + a little fat — the classic pre-fuel.'),
  SNACK('Oats with honey (small bowl)', '60–90 min before', ['veg', 'vegan'], ['gluten'], 220, 'Slow carbs for longer sessions.'),
  SNACK('Boiled egg + toast', '60 min before', ['egg', 'nonveg'], ['egg', 'gluten'], 210, 'Carbs + protein for strength work.'),
  SNACK('Black coffee + dates (2)', '20–30 min before', ['veg', 'vegan', 'keto'], [], 90, 'Caffeine kick + quick sugar. Skip if training at night.'),
  SNACK('Apple + handful of almonds', '45 min before', ['veg', 'vegan', 'keto'], ['nuts'], 180, 'Light and steady energy.'),
]

export const POST_WORKOUT = [
  SNACK('Whey shake in milk/water', 'within 45 min', ['veg', 'nonveg'], ['dairy'], 180, '~25g protein — the repair signal.'),
  SNACK('Curd/Greek yogurt + banana', 'within 60 min', ['veg'], ['dairy'], 230, 'Protein + carbs to refill muscles.'),
  SNACK('3 boiled eggs', 'within 60 min', ['egg', 'nonveg', 'keto'], ['egg'], 210, 'Cheap complete protein.'),
  SNACK('Sprouts chaat (big bowl)', 'within 60 min', ['veg', 'vegan'], [], 200, 'Plant protein + iron.'),
  SNACK('Paneer cubes (100g) + fruit', 'within 60 min', ['veg', 'keto'], ['dairy'], 300, 'Slow protein — great after evening workouts.'),
  SNACK('Tofu scramble', 'within 60 min', ['veg', 'vegan', 'keto'], ['soy'], 190, 'Vegan repair fuel.'),
]
