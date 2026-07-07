// Store links: honest, free "where to get it" — a maps search near the
// user's live location, and an online search. (Live local shelf prices
// aren't public data anywhere, so we link instead of faking numbers.)

export function nearbyUrl(q, location) {
  const loc = String(location || '').trim()
  const m = loc.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/)
  if (m) return `https://www.google.com/maps/search/${encodeURIComponent(q + ' store')}/@${m[1]},${m[2]},14z`
  return `https://www.google.com/maps/search/${encodeURIComponent(q + ' store near ' + (loc || 'me'))}`
}

export const onlineUrl = (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`

// Which kind of real store to search near the user, per inventory category
export function storeTypeFor(cat = '') {
  if (['Proteins', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Oils & Spices', 'Nuts & Seeds'].includes(cat)) return 'supermarket'
  if (cat === 'Supplements') return 'pharmacy'
  if (['Skincare', 'Haircare', 'Grooming & Makeup'].includes(cat)) return 'beauty store pharmacy'
  if (['Clothing', 'Footwear', 'Innerwear'].includes(cat)) return 'clothing store'
  if (cat === 'Fitness gear') return 'sports store'
  return 'store'
}
