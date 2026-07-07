// Game layer — XP, levels and badges computed deterministically from real
// history, so there's nothing extra to store or sync (and no way to cheat
// by re-tapping: the same data always yields the same XP).

export const LEVEL_TITLES = [
  'Rookie', 'Starter', 'Regular', 'Consistent', 'Committed',
  'Disciplined', 'Machine', 'Beast', 'Legend', 'Titan', 'Mythic',
]

export function xpForDay(d, { waterGoal = 8 } = {}) {
  let xp = 0
  xp += Math.min(d.planDone || 0, 12) * 8                    // plan items
  xp += d.water >= waterGoal ? 30 : (d.water || 0) * 2       // hydration
  xp += Math.min(Math.floor((d.steps || 0) / 1000), 12) * 6  // movement
  if (d.sleep >= 7 && d.sleep <= 9.5) xp += 25               // good sleep
  xp += Math.min(Math.round((d.calsOut || 0) / 10), 40)      // workout burn
  if (d.calsIn > 0) xp += 10                                 // tracked food
  if (d.weightKg > 0) xp += 5                                // weighed in
  if (d.mood) xp += 5                                        // checked in
  return xp
}

export function computeGame(series, targets = {}) {
  const xp = series.reduce((s, d) => s + xpForDay(d, targets), 0)
  const level = Math.min(LEVEL_TITLES.length - 1, Math.floor(Math.sqrt(xp / 60)))
  const maxed = level === LEVEL_TITLES.length - 1
  const floorXP = 60 * level * level
  const nextXP = 60 * (level + 1) * (level + 1)
  return {
    xp, level, maxed,
    title: LEVEL_TITLES[level],
    nextTitle: maxed ? null : LEVEL_TITLES[level + 1],
    progress: maxed ? 1 : Math.min(1, (xp - floorXP) / Math.max(1, nextXP - floorXP)),
    toNext: maxed ? 0 : Math.max(0, nextXP - xp),
  }
}

export const BADGES = [
  { id: 'first', emoji: '🎬', name: 'Day One', how: 'Log anything once', test: (s) => s.some((d) => d.logged) },
  { id: 'streak3', emoji: '🔥', name: 'On a Roll', how: '3-day streak', test: (s, _p, _t, stats) => stats.streak >= 3 },
  { id: 'streak7', emoji: '⚡', name: 'Unstoppable', how: '7-day streak', test: (s, _p, _t, stats) => stats.streak >= 7 },
  { id: 'hydra', emoji: '💧', name: 'Hydration Hero', how: 'Hit water goal 5 days', test: (s, _p, t) => s.filter((d) => d.water >= (t.waterGoal || 8)).length >= 5 },
  { id: 'steps10k', emoji: '👟', name: '10K Club', how: '10,000 steps in a day', test: (s) => s.some((d) => d.steps >= 10000) },
  { id: 'burner', emoji: '🥵', name: 'Calorie Burner', how: '2,000 kcal burned total', test: (s) => s.reduce((a, d) => a + d.calsOut, 0) >= 2000 },
  { id: 'sleep5', emoji: '😴', name: 'Sleep Pro', how: '7–9h sleep, 5 nights', test: (s) => s.filter((d) => d.sleep >= 7 && d.sleep <= 9.5).length >= 5 },
  { id: 'chef', emoji: '🍳', name: 'Tracked Chef', how: 'Log food 7 days', test: (s) => s.filter((d) => d.calsIn > 0).length >= 7 },
  { id: 'planner', emoji: '📋', name: 'Plan Slayer', how: '10 plan items in one day', test: (s) => s.some((d) => d.planDone >= 10) },
  { id: 'proof', emoji: '📸', name: 'Proof Collector', how: '2+ progress photos', test: (_s, p) => ((p.progressPhotos || []).length + (p.facePhotos || []).length) >= 2 },
  { id: 'why', emoji: '🎯', name: 'Knows Their Why', how: 'Write your why', test: (_s, p) => Boolean(p.why && p.why.trim()) },
  { id: 'scale', emoji: '⚖️', name: 'Face the Scale', how: 'Log weight 3 times', test: (s) => s.filter((d) => d.weightKg > 0).length >= 3 },
]

export function earnedBadges(series, profile, targets, stats) {
  return BADGES.map((b) => ({ ...b, earned: Boolean(b.test(series, profile || {}, targets || {}, stats || { streak: 0 })) }))
}
