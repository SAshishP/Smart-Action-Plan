// Colours the user picks for themselves.
//
// SAP has always tinted itself from the gender on the profile. That stays as
// the default — it is a reasonable first guess and it means the app looks
// personal before anyone opens a setting — but it was only ever a guess, and
// "auto" being the default is different from it being the only option.
//
// WHERE THIS IS STORED, and why it differs from light/dark:
//   accent + backdrop  → the PROFILE, so they sync and survive a reinstall
//   light / dark       → the DEVICE (lib/mode.js)
// The line is: colour is part of who you are, light-or-dark is part of where
// you are. Someone wants the same teal on every device they own, and still
// wants their phone dark at night while the laptop stays light.
//
// Applied by writing CSS custom properties straight onto <html>. The
// stylesheet already resolves everything from those variables, so nothing here
// needs a class per combination — eight accents times six backdrops would be
// forty-eight dead rules otherwise.

// Each accent is a PAIR. The same hue cannot serve both modes: a colour with
// enough contrast on white is muddy on near-black, and one that glows on dark
// is invisible on white. See the note in styles.css.
export const ACCENTS = [
  { key: 'auto', name: 'Match my profile', light: null, dark: null, swatch: null },
  { key: 'ocean', name: 'Ocean', light: '#0a7d94', dark: '#2dd4a7' },
  { key: 'orchid', name: 'Orchid', light: '#8b3fd4', dark: '#c77dff' },
  { key: 'amber', name: 'Amber', light: '#b45309', dark: '#ffb454' },
  { key: 'rose', name: 'Rose', light: '#be1250', dark: '#ff7aa8' },
  { key: 'forest', name: 'Forest', light: '#15803d', dark: '#4ade80' },
  { key: 'indigo', name: 'Indigo', light: '#4338ca', dark: '#a5b4fc' },
  { key: 'crimson', name: 'Crimson', light: '#b91c1c', dark: '#fca5a5' },
  { key: 'slate', name: 'Slate', light: '#475569', dark: '#cbd5e1' },
]

// Backdrops carry four surfaces each, because changing the page colour without
// changing the card and line colours produces a card that either vanishes into
// the page or floats on it like a sticker.
export const BACKDROPS = [
  {
    key: 'default', name: 'Default',
    light: { bg: '#e9edf6', bg2: '#f3f6fb', card: '#ffffff', line: '#e2e8f2' },
    dark: { bg: '#0e1420', bg2: '#151d2e', card: '#1a2438', line: '#263349' },
  },
  {
    key: 'paper', name: 'Paper',
    light: { bg: '#f4f4f2', bg2: '#fafaf9', card: '#ffffff', line: '#e7e5e2' },
    dark: { bg: '#16181d', bg2: '#1c1f26', card: '#22262e', line: '#333842' },
  },
  {
    key: 'sand', name: 'Sand',
    light: { bg: '#f2ede4', bg2: '#f9f6f1', card: '#fffdfa', line: '#e7dfd1' },
    dark: { bg: '#171410', bg2: '#1e1a15', card: '#26211a', line: '#3a3228' },
  },
  {
    key: 'mist', name: 'Mist',
    light: { bg: '#e8f0ef', bg2: '#f3f8f7', card: '#ffffff', line: '#d9e7e5' },
    dark: { bg: '#0d1512', bg2: '#111a16', card: '#16211c', line: '#24332b' },
  },
  {
    key: 'blush', name: 'Blush',
    light: { bg: '#f6ecef', bg2: '#fcf6f8', card: '#ffffff', line: '#eddde3' },
    dark: { bg: '#14101c', bg2: '#1a1524', card: '#201a2c', line: '#2f2740' },
  },
  {
    key: 'contrast', name: 'High contrast',
    // Pure white and true black. The black one is not decoration: on an OLED
    // screen those pixels are switched off, which is a real battery saving at
    // night, and the extra separation helps anyone who finds low-contrast
    // greys hard to read.
    light: { bg: '#ffffff', bg2: '#f2f5f9', card: '#ffffff', line: '#c9d3e0' },
    dark: { bg: '#000000', bg2: '#0b0b0d', card: '#131417', line: '#3a3d44' },
  },
]

const accentByKey = Object.fromEntries(ACCENTS.map((a) => [a.key, a]))
const backdropByKey = Object.fromEntries(BACKDROPS.map((b) => [b.key, b]))

export const getAccent = (key) => accentByKey[key] || accentByKey.auto
export const getBackdrop = (key) => backdropByKey[key] || backdropByKey.default

// What the swatch in the picker should show, given the mode being previewed.
export function accentSwatch(key, mode = 'light', gender = 'male') {
  const a = accentByKey[key]
  if (!a) return null
  if (a.key === 'auto') {
    const auto = gender === 'female' ? accentByKey.orchid
      : gender === 'other' ? accentByKey.amber
      : accentByKey.ocean
    return mode === 'dark' ? auto.dark : auto.light
  }
  return mode === 'dark' ? a.dark : a.light
}

// Write the choices onto <html>. Must re-run whenever the mode flips, because
// each choice holds a different value per mode and only one of them applies.
//
// Removing a property rather than setting it back to a default matters: the
// stylesheet's own [data-theme] rules should take over again when the user
// picks "auto", and an inline style would permanently outrank them.
export function applyAppearance(profile = {}, resolvedMode = 'light') {
  const root = document.documentElement
  const dark = resolvedMode === 'dark'

  const a = accentByKey[profile.themeAccent] || accentByKey.auto
  if (a.key === 'auto' || !a.light) {
    root.style.removeProperty('--accent-l')
    root.style.removeProperty('--accent-d')
  } else {
    root.style.setProperty('--accent-l', a.light)
    root.style.setProperty('--accent-d', a.dark)
  }

  const b = backdropByKey[profile.themeBackdrop]
  const surfaces = b ? (dark ? b.dark : b.light) : null
  const keys = ['bg', 'bg-2', 'card', 'line']
  const from = surfaces ? [surfaces.bg, surfaces.bg2, surfaces.card, surfaces.line] : null
  keys.forEach((k, i) => {
    if (from) root.style.setProperty('--' + k, from[i])
    else root.style.removeProperty('--' + k)
  })

  // Keep the browser chrome matching the page, or the status bar sits in a
  // colour the app stopped using two settings ago.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', surfaces ? surfaces.bg : (dark ? '#0e1420' : '#e9edf6'))
}
