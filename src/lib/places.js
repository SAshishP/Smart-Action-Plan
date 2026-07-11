// Real nearby stores INSIDE the app — via OpenStreetMap's free Overpass API.
// Gives actual store names + straight-line distance. (OSM has no live shelf
// prices or ratings — the Maps link on each result covers those.)

import { geocode } from './weather.js'

const OSM_FILTERS = {
  'supermarket': '["shop"~"supermarket|convenience|greengrocer"]',
  'pharmacy': '["amenity"="pharmacy"]',
  'beauty store pharmacy': '["shop"~"beauty|cosmetics|chemist|hairdresser_supply"]',
  'clothing store': '["shop"~"clothes|shoes|fashion_accessories"]',
  'sports store': '["shop"~"sports|fitness_equipment"]',
  'store': '["shop"]',
}

function dist(lat1, lon1, lat2, lon2) {
  const R = 6371, toR = Math.PI / 180
  const dLat = (lat2 - lat1) * toR, dLon = (lon2 - lon1) * toR
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toR) * Math.cos(lat2 * toR) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function coordsFrom(location) {
  const m = String(location || '').match(/^\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)\s*$/)
  if (m) return { lat: Number(m[1]), lon: Number(m[2]) }
  const g = await geocode(location)
  return g ? { lat: g.lat, lon: g.lon } : null
}

export async function findNearbyStores(location, storeType, radiusKm = 3) {
  const c = await coordsFrom(location)
  if (!c) throw new Error('Set a location first (city name, or tap 📍).')
  const filter = OSM_FILTERS[storeType] || OSM_FILTERS.store
  const r = Math.round(radiusKm * 1000)
  const q = `[out:json][timeout:12];(node${filter}(around:${r},${c.lat},${c.lon});way${filter}(around:${r},${c.lat},${c.lon}););out center 30;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(q),
  })
  if (!res.ok) throw new Error('Store lookup is busy — try again in a minute.')
  const data = await res.json()
  const seen = new Set()
  return (data.elements || [])
    .map((e) => {
      const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon
      const name = e.tags?.name
      if (!name || lat == null) return null
      const t = e.tags || {}
      const addr = [t['addr:street'], t['addr:city']].filter(Boolean).join(', ')
      return { name, addr, km: Math.round(dist(c.lat, c.lon, lat, lon) * 10) / 10, lat, lon,
        kind: t.shop || t.amenity || '' }
    })
    .filter((x) => x && !seen.has(x.name + x.addr) && seen.add(x.name + x.addr))
    .sort((a, b) => a.km - b.km)
    .slice(0, 8)
}

export const directionsUrl = (s) =>
  `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`
