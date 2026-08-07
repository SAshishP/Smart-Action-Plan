// Is the person using this app you?
//
// READ THIS BEFORE TRUSTING IT FOR ANYTHING:
//
// This is a UI switch, not a security boundary. It runs in the browser, so
// anyone determined can flip it in dev tools and reveal whatever it hides.
// SECURITY.md says the client is never a trust boundary, and this does not
// change that.
//
// It is safe here only because of what it gates: the Lab screen operates on the
// CURRENT user's own photos, already on their own device, and computes
// arithmetic on those pixels. Someone who forced this true would unlock the
// ability to measure their own photos. There is no other user's data behind it
// and no privilege to escalate.
//
// Do NOT reuse this to hide anything that would actually matter if revealed —
// anyone else's data, a destructive action, a paid feature. Those belong behind
// RLS in Postgres or a check inside an edge function, where the user cannot
// reach. If you ever want a real admin surface in the app, the honest way is a
// server-side check: an `is_owner` column read through a policy, or an edge
// function that compares against an owner id held in a secret.

const OWNER_EMAIL = String(import.meta.env.VITE_OWNER_EMAIL || '').trim().toLowerCase()

// Local override so the Lab can be opened while testing without a cloud session
// at all. Set in the console:  localStorage.setItem('sap_owner', '1')
const LOCAL_FLAG = 'sap_owner'

export function isOwner(profile = null, session = null) {
  try {
    if (localStorage.getItem(LOCAL_FLAG) === '1') return true
  } catch {
    /* storage blocked — fall through to the email check */
  }
  if (!OWNER_EMAIL) return false
  const email = String(session?.user?.email || profile?.email || '').trim().toLowerCase()
  return Boolean(email) && email === OWNER_EMAIL
}

// True when an owner email was configured at build time. Used to explain why
// the Lab is invisible rather than leaving it a mystery.
export const ownerConfigured = () => Boolean(OWNER_EMAIL)
