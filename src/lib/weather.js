// Live weather from Open-Meteo — completely free, no API key.
// Accepts "lat, lng" (from the GPS button) or a typed city name.
// Returns { temp, humidity, uv, place } or null (never throws).

export async function getWeather(location) {
  if (!location) return null
  try {
    let lat, lon, place = String(location)
    const m = place.match(/^\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)\s*$/)
    if (m) {
      lat = Number(m[1]); lon = Number(m[2]); place = 'your location'
    } else {
      const g = await fetch(
        'https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(place)
      )
      const gd = await g.json()
      const hit = gd.results && gd.results[0]
      if (!hit) return null
      lat = hit.latitude; lon = hit.longitude; place = hit.name
    }
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto'
    )
    const d = await r.json()
    const temp = d.current?.temperature_2m
    const humidity = d.current?.relative_humidity_2m
    if (temp == null || humidity == null) return null
    return {
      temp: Math.round(temp),
      humidity: Math.round(humidity),
      uv: Math.round(d.daily?.uv_index_max?.[0] ?? 0),
      place,
    }
  } catch {
    return null
  }
}
