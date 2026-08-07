// Light or dark — the user's choice, not ours.
//
// Three states, and the third one matters: "system" follows the phone, so
// someone with scheduled dark mode gets it automatically without ever opening
// a setting. That is the right default. An app that ignores the OS preference
// and forces its own look is the reason people go looking for a toggle at all.
//
// Kept out of the profile deliberately. Appearance belongs to the device: the
// same account on a phone and a laptop can reasonably want different answers,
// and syncing it through the cloud would fight the user on one of them.

const KEY = 'sap_mode_v1'
export const MODES = ['system', 'light', 'dark']

export function getMode() {
  try {
    const v = localStorage.getItem(KEY)
    return MODES.includes(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

export function setMode(mode) {
  const m = MODES.includes(mode) ? mode : 'system'
  try {
    localStorage.setItem(KEY, m)
  } catch {
    /* private mode — the choice just will not survive a reload */
  }
  applyMode(m)
  return m
}

// What "system" currently resolves to.
export function systemPrefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export const resolveMode = (mode = getMode()) =>
  mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode

// Writes the attribute the stylesheet keys off, and keeps the browser chrome
// in step — an app that goes dark while the status bar stays pale grey looks
// broken in exactly the place a PWA is trying hardest to look native.
export function applyMode(mode = getMode()) {
  const resolved = resolveMode(mode)
  document.documentElement.setAttribute('data-mode', resolved)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0e1420' : '#e9edf6')
  return resolved
}

// Follow the OS while the user is on "system". Returns an unsubscribe.
export function watchSystem(onChange) {
  let mq
  try {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
  } catch {
    return () => {}
  }
  const handler = () => {
    if (getMode() !== 'system') return   // an explicit choice always wins
    applyMode('system')
    onChange?.(resolveMode('system'))
  }
  // Safari below 14 has no addEventListener on MediaQueryList.
  if (mq.addEventListener) mq.addEventListener('change', handler)
  else if (mq.addListener) mq.addListener(handler)
  return () => {
    if (mq.removeEventListener) mq.removeEventListener('change', handler)
    else if (mq.removeListener) mq.removeListener(handler)
  }
}

export const MODE_LABELS = {
  system: { icon: '📱', label: 'System', hint: 'Follows your phone' },
  light: { icon: '☀️', label: 'Light', hint: 'Always light' },
  dark: { icon: '🌙', label: 'Dark', hint: 'Always dark' },
}
