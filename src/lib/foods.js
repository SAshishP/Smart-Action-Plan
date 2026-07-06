// Pantry: quick-add basics + live search of Open Food Facts —
// a free, open database of ~3 million real food products worldwide.

export const PANTRY_BASICS = [
  'Oats', 'Rice', 'Whole-wheat bread', 'Roti/tortilla', 'Noodles', 'Eggs',
  'Milk', 'Greek yogurt', 'Curd', 'Paneer', 'Tofu', 'Chicken', 'Fish', 'Tuna can',
  'Kidney beans', 'Chickpeas', 'Dal (lentils)', 'Moong sprouts',
  'Onion', 'Tomato', 'Potato', 'Spinach', 'Broccoli', 'Carrot', 'Capsicum',
  'Cucumber', 'Cabbage', 'Beans', 'Peas', 'Banana', 'Apple', 'Seasonal fruit',
  'Avocado', 'Dates', 'Mixed nuts', 'Peanut butter', 'Dark chocolate',
  'Olive oil', 'Cooking oil', 'Ghee', 'Butter', 'Honey', 'Soy sauce',
  'Lemon', 'Garlic', 'Ginger', 'Salt', 'Spices',
]

// Free search — no key needed. Returns [{name, kcal100}]
export async function searchWorldFoods(query) {
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=8' +
    '&fields=product_name,brands,nutriments&search_terms=' + encodeURIComponent(query)
  const res = await fetch(url)
  if (!res.ok) throw new Error('The food database is unreachable right now — try again in a minute.')
  const data = await res.json()
  return (data.products || [])
    .map((p) => ({
      name: [p.brands, p.product_name].filter(Boolean).join(' · ').trim(),
      kcal100: Math.round(p.nutriments?.['energy-kcal_100g'] || 0) || null,
    }))
    .filter((x) => x.name)
}

// Same open data family, but for cosmetics / skin / hair products (free, no key)
export async function searchBeautyProducts(query) {
  const url =
    'https://world.openbeautyfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=8' +
    '&fields=product_name,brands&search_terms=' + encodeURIComponent(query)
  const res = await fetch(url)
  if (!res.ok) throw new Error('The product database is unreachable right now — try again in a minute.')
  const data = await res.json()
  return (data.products || [])
    .map((p) => ({ name: [p.brands, p.product_name].filter(Boolean).join(' · ').trim() }))
    .filter((x) => x.name)
}
