// Step-by-step corrections for issues detected in photo analysis.

export const POSTURE_FIXES = {
  'forward head': {
    name: 'Forward head posture', icon: '🙇',
    why: 'The head sits ahead of the shoulders — common from phones and desks. Strains the neck and upper back.',
    steps: [
      'Chin tucks: sit tall, glide your chin straight back (make a double chin), hold 5s. 10 reps × 3/day.',
      'Wall check: stand with heels, hips, upper back against a wall — bring the back of your head to touch it without tilting up. Hold 30s.',
      'Raise your phone to eye level instead of dropping your head. Screen top at eye height at the desk.',
      'Upper-trap stretch: ear toward shoulder, gentle hand assist, 30s each side.',
    ],
    avoid: 'Avoid sleeping on very tall pillow stacks; avoid jutting the chin during lifts.',
  },
  'rounded shoulders': {
    name: 'Rounded shoulders', icon: '🐢',
    why: 'Shoulders roll forward from tight chest + weak upper back.',
    steps: [
      'Doorway chest stretch: forearms on the frame, step through gently, 30s × 3.',
      'Wall angels: back flat on the wall, slide arms up/down like a snow angel, 10 reps × 3.',
      'Band pull-aparts (or towel): squeeze shoulder blades, 15 reps × 3, daily.',
      'Every workout: pull (rows) at least as much as you push (presses).',
    ],
    avoid: 'Avoid only training chest; avoid slouched sitting marathons — stand every 45 min.',
  },
  'anterior pelvic tilt': {
    name: 'Anterior pelvic tilt', icon: '🦴',
    why: 'The pelvis tips forward — arched lower back, belly pushed out. Tight hip flexors + weak glutes/core.',
    steps: [
      'Couch/hip-flexor stretch: half-kneel, tuck the tailbone, shift forward gently, 30s each side × 2.',
      'Glute bridges with a hard 2s squeeze at the top, 12 × 3.',
      'Dead bugs: back FLAT to the floor the whole time, slow, 8 each side × 3.',
      'RKC plank: plank while actively tucking the tailbone and squeezing glutes, 20–30s × 3.',
    ],
    avoid: 'Avoid over-arching in standing; avoid heavy back squats until the tilt improves.',
  },
  'uneven shoulders': {
    name: 'Uneven shoulders', icon: '⚖️',
    why: 'One shoulder sits visibly higher — often habit (bag on one side) or muscle imbalance.',
    steps: [
      'Switch your bag/backpack to both straps or alternate sides daily.',
      'Single-arm farmer carry on the LOWER side: walk tall 30 steps × 3.',
      'Stretch the higher side’s upper trap 30s × 3/day.',
      'If it’s pronounced or comes with back pain, get it looked at once — a physio can rule out scoliosis.',
    ],
    avoid: 'Avoid always carrying, leaning, or phone-holding on the same side.',
  },
}

export const SKIN_FIXES = {
  'blackheads': {
    name: 'Blackheads', icon: '⚫',
    steps: [
      'Salicylic acid (BHA 2%) on the affected zones at night, 2–3×/week — it dissolves inside the pore.',
      'Clay mask on the T-zone 1×/week, 10 minutes.',
      'Oil cleanse first if you wear sunscreen — sunscreen buildup feeds blackheads.',
      'Give it 4–6 weeks; they clear slowly and return if you stop.',
    ],
    avoid: 'Do NOT squeeze or use metal extractors — that’s how scars happen. Skip pore strips; they empty the top and enlarge the pore.',
  },
  'whiteheads': {
    name: 'Whiteheads', icon: '⚪',
    steps: [
      'Gentle BHA or benzoyl-peroxide spot care at night on affected areas.',
      'Non-comedogenic moisturizer only (check the label).',
      'Change pillowcases 2×/week; keep hair oils off the face.',
    ],
    avoid: 'Don’t pop them — each pop risks a mark that lasts months.',
  },
  'open pores': {
    name: 'Open / large pores', icon: '🕳️',
    steps: [
      'Niacinamide serum every morning — the best-evidenced pore ingredient.',
      'Sunscreen daily: sun damage slackens pores permanently.',
      'BHA 1–2×/week keeps them empty (empty pores look smaller).',
    ],
    avoid: 'Pores can’t “close” — anyone selling that is selling. Goal is smaller-looking, not gone.',
  },
  'acne': {
    name: 'Active acne', icon: '🔴',
    steps: [
      'Gentle cleanse 2×/day — over-washing makes it worse.',
      'Benzoyl peroxide 2.5% or adapalene at night (start 2–3×/week).',
      'Moisturize even if oily; dried-out skin produces more oil.',
      'More than ~10 active spots, painful cysts, or scarring acne → dermatologist. Prescription care works and prevents scars.',
    ],
    avoid: 'Don’t pick. Don’t layer 5 actives at once. Don’t scrub.',
  },
  'scars': {
    name: 'Scars / marks', icon: '🩹',
    steps: [
      'Flat dark marks (PIH): vitamin C in the morning + strict daily sunscreen — sun makes marks permanent.',
      'Gentle AHA (lactic/glycolic) 1–2×/week speeds fading over 2–3 months.',
      'Pitted or raised scars: creams can’t fix texture — a dermatologist (microneedling/laser) can. Save your money on miracle creams.',
    ],
    avoid: 'Avoid lemon juice, toothpaste and other home “hacks” — they burn skin.',
  },
  'dark circles': {
    name: 'Dark circles', icon: '🌙',
    steps: [
      'Sleep 7–9h — no cream outworks sleep debt.',
      'Cold compress or chilled spoons 5 min in the morning reduces puffiness.',
      'Caffeine eye serum in the AM, gentle tapping with the ring finger.',
      'If they’re hollow/genetic, concealer is the honest fix — see the Style tab.',
    ],
    avoid: 'Don’t rub your eyes; avoid heavy salt at dinner.',
  },
  'pigmentation': {
    name: 'Pigmentation / uneven tone', icon: '🟤',
    steps: [
      'Sunscreen every single morning, reapplied outdoors — non-negotiable, pigmentation is sun-fed.',
      'Vitamin C serum in the AM; niacinamide at night.',
      'Expect 8–12 weeks for visible change; photos beat mirrors for tracking.',
    ],
    avoid: 'Avoid bleaching creams from unverified brands — many contain harmful steroids/mercury.',
  },
}

// Map free-text lists from the AI to our known keys
export function matchKeys(list, dict) {
  const keys = Object.keys(dict)
  return [...new Set(
    (list || []).map((x) => keys.find((k) => String(x).toLowerCase().includes(k)) || null).filter(Boolean)
  )]
}
