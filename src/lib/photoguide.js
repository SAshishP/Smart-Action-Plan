// How to take photos SAP can actually read.
//
// This exists because the single biggest cause of a wrong analysis is not the
// model — it is the photo. Overhead light drops shadows into the eye sockets
// and under the jaw, and the scan reads them as under-eye darkness and a
// slackening jawline. Yellow bulb light makes every skin tone read warm, so the
// undertone and every colour recommendation built on it is fiction. Beauty mode
// erases the exact texture the face scan measures.
//
// None of that is the user's fault, and all of it is avoidable in about two
// minutes — which is why the guidance is specific and physical ("phone at chest
// height, 2 m away") rather than "take a good photo".
//
// Pairs with photo-quality.js, which measures the result and warns before
// upload. This module is the instruction; that one is the check.

export const GLOBAL_RULES = [
  {
    rule: 'Shoot in soft, indirect daylight. Stand 1–2 m from a window with the ' +
      'window IN FRONT of you, mid-morning or mid-afternoon, or any time on an ' +
      'overcast day. Curtain sheer drawn if the sun is direct.',
    why: 'This is the only light that shows skin and shape as they actually are. ' +
      'Everything else in this list is a variation on the same point: the ' +
      'analysis can only report what the light let it see.',
  },
  {
    rule: 'Never let a ceiling light be your main light. Turn it off if daylight is ' +
      'available.',
    why: 'Overhead light drops hard shadows into the eye sockets and under the jaw ' +
      'and cheekbones. The scan reads those shadows as under-eye darkness, eye ' +
      'bags and a slackening jawline. It will report sagging that is not there, ' +
      'and you will be handed a plan for a problem you do not have.',
  },
  {
    rule: 'Never use direct sun or the phone flash.',
    why: 'Harsh direct light flattens skin texture and blows out the T-zone. ' +
      'Pores, blackheads, fine marks and early stretch marks all disappear into ' +
      'the highlight. The scan then reports \'texture: good\' when the honest ' +
      'answer is that it could not see the texture at all — which is worse than ' +
      'no reading.',
  },
  {
    rule: 'Never use warm indoor bulbs (normal yellow room lighting, ~2700K) as ' +
      'your light source.',
    why: 'Yellow light makes every skin tone read warm or olive. The UNDERTONE ' +
      'line becomes fiction, and every shade, colour and product recommendation ' +
      'built on top of it is wrong. If daylight is genuinely impossible, take ' +
      'the photo anyway — the app should just skip the undertone reading and ' +
      'say so, rather than print a confident wrong answer.',
  },
  {
    rule: 'Do not stand with a window or bright lamp behind you.',
    why: 'The camera exposes for the bright background and turns you into a dark ' +
      'silhouette. Backlighting is the single most common cause of an unusable ' +
      'photo.',
  },
  {
    rule: 'Turn OFF beauty mode, skin smoothing, filters and any ' +
      '\'portrait\'/\'natural\' effect in the camera app. Check this before every ' +
      'session — many Android phones and some iPhone selfie modes re-enable it ' +
      'silently.',
    why: 'Smoothing erases the exact thing the face scan measures. A beautified ' +
      'photo reliably returns \'pores: none, evenness: excellent, scars: none\' — ' +
      'and then the entire skincare routine is built on a photo of a face that ' +
      'does not exist.',
  },
  {
    rule: 'Prop the phone against something solid and use the 10-second timer. Use ' +
      'the REAR camera wherever you physically can, including for face shots.',
    why: 'Hand-held at arm\'s length adds tilt and motion blur. And the front ' +
      'camera is a wide-angle lens: at 30 cm it enlarges the nose, narrows the ' +
      'jaw and shortens the face, which corrupts FACE_SHAPE and the jawline ' +
      'rating. The rear camera has both the better sensor and the honest ' +
      'geometry.',
  },
  {
    rule: 'Phone vertical (portrait), held perfectly upright — not tilted up at ' +
      'you, not tilted down at you. Switch on the camera grid or level line.',
    why: 'A phone tilted down shortens your legs and enlarges your head, so the ' +
      'scan reads shorter, heavier proportions than you have. Tilted up does ' +
      'the reverse. This distorts more than lighting does and nobody notices ' +
      'they are doing it.',
  },
  {
    rule: 'Wipe the lens with a cloth before you start.',
    why: 'Pocket lint and finger grease on the lens are the number one cause of a ' +
      'soft photo. It costs two seconds and it is the highest-return item on ' +
      'this list.',
  },
  {
    rule: 'Plain, uncluttered wall behind you, in a colour that contrasts with what ' +
      'you are wearing. Nothing on the floor around your feet.',
    why: 'The body read is fundamentally an outline read. A patterned wall, a ' +
      'doorframe or a laundry pile behind you breaks the edge and the ' +
      'silhouette measurement degrades.',
  },
  {
    rule: 'Fitted athletic wear for the four body shots — sports bra + leggings or ' +
      'shorts, or a fitted vest + shorts. Nothing baggy, no hoodies, no loose ' +
      't-shirts, no jackets.',
    why: 'This is about clothes not hiding your shape, not about wearing less. A ' +
      'loose t-shirt hides the waist, the posture and the entire midsection. If ' +
      'fitted athletic wear is all that is available and comfortable, that is ' +
      'the whole requirement — the app will never ask you to go further than ' +
      'this.',
  },
  {
    rule: 'For face and hair shots, wear a plain mid-tone top. Avoid bright red, ' +
      'orange or hot pink.',
    why: 'A strongly coloured top bounces its colour up onto your jaw and neck. ' +
      'Red reads as redness and irritation; yellow shifts the undertone. It is ' +
      'a real, measurable effect and it is entirely avoidable.',
  },
  {
    rule: 'Hair fully off the face and neck (tie it back) for all face shots and ' +
      'all four body shots.',
    why: 'Hair across the jaw and neck hides the jawline, the under-chin area and ' +
      'the shoulder line — three of the things you most likely came here to ask ' +
      'about.',
  },
  {
    rule: 'Take them in the morning, before eating, before training, and before a ' +
      'shower. No makeup, no glasses, no fresh moisturiser in the last 30 ' +
      'minutes.',
    why: 'A post-workout flush reads as redness, a hot shower reads as irritation, ' +
      'and fresh moisturiser reads as oiliness. Morning-and-neutral is also ' +
      'when you take your tape measurements, so the numbers and the photos ' +
      'describe the same body on the same day.',
  },
  {
    rule: 'Stand neutrally. Do not pose, do not suck in, do not flex, do not lift ' +
      'your chin.',
    why: 'A posed photo cannot be compared to an unposed one, so the first time ' +
      'you forget to pose it will look like you went backwards.',
  },
  {
    rule: 'Same spot, same window, same time of day, same clothes, every single ' +
      'time you re-shoot.',
    why: 'Every future progress comparison is measured against these twelve ' +
      'photos. Changing the light or the angle changes the apparent result more ' +
      'than eight weeks of genuine training does — that is not an exaggeration, ' +
      'it is the main reason progress photos mislead people.',
  },
  {
    rule: 'Take three of each shot and keep the sharpest.',
    why: 'It costs nothing and it removes the most common reason a photo has to be ' +
      'retaken later, when you no longer look the same.',
  },
]

const S = (slot, label, icon, o) => ({ slot, label, icon, ...o })

export const SLOT_GUIDE = [
  S('body_front', 'Body · Front', '🧍', {
    framing: 'Full body, head to feet, phone vertical. Leave roughly a hand\'s width of ' +
      'empty space above your head and below your feet. Nothing may be cropped ' +
      '— the scan reads your proportions partly from your head-to-height ratio, ' +
      'and a cropped photo silently breaks that.',
    distance: '2.0–2.5 m between you and the phone. Lens at hip height, about 90–100 cm ' +
      'off the floor — put the phone on a chair seat or a stack of books. Not ' +
      'on the floor, and not held at chest or eye level by another person.',
    angle: 'Square to the camera. Both shoulders level, feet hip-width apart and ' +
      'flat, weight even on both feet, looking straight ahead at the lens. ' +
      'Phone perfectly upright.',
    clothing: 'Sports bra + leggings or shorts, or a fitted vest + fitted shorts. ' +
      'Waistband sitting at your natural waist and not rolled over. Barefoot.',
    tips: [
      'Let your arms hang with a fist-width gap (15–20 cm) between your hands ' +
        'and your thighs, palms facing in. If your arms touch your sides the ' +
        'waist outline vanishes and the waist-to-shoulder ratio cannot be read.',
      'Even weight on both feet. Standing on one hip drops that side and fakes ' +
        'a pelvic tilt or uneven hips.',
      'Relax your shoulders down. Braced shoulders read as broader than you are ' +
        'and change the body-shape classification.',
      'If you use a mirror instead of a timer, your phone body blocks your ' +
        'torso — do not use a mirror for this shot.',
      'Roll the leggings waistband flat. A rolled band creates a fold above it ' +
        'that reads as a muffin top.',
    ],
    commonMistake: 'Someone standing close and holding the phone at their own eye level, ' +
      'angled down. That single mistake shortens your legs, widens your hips ' +
      'and enlarges your head — it makes almost every body metric read worse ' +
      'than reality, and it is what nearly every full-body photo on a phone ' +
      'looks like.',
  }),
  S('body_left', 'Body · Left side', '🧍', {
    framing: 'Full body, head to feet, phone vertical, exactly the same crop as the ' +
      'front shot. Same hand\'s width of space top and bottom.',
    distance: 'Identical to the front shot — same 2.0–2.5 m, same 90–100 cm lens ' +
      'height, same spot on the floor. Mark the spot with a bit of tape if you ' +
      'can.',
    angle: 'Turn exactly 90° to your left so your left shoulder points at the ' +
      'camera. Your feet point at the wall, not at the camera. Do not turn to ' +
      '45° and do not turn your head towards the lens.',
    clothing: 'Exactly what you wore for the front shot.',
    tips: [
      'Look straight ahead at the wall, NOT at the camera. Turning your head to ' +
        'look at the lens destroys the forward-head-posture reading, which is the ' +
        'single most valuable thing this photo gives you.',
      'Arms relaxed and hanging at your sides — no hands on hips, arms not ' +
        'swung forward or back. This is the standard clinical posture-assessment ' +
        'position and it keeps the abdomen and lower-back outline clean.',
      'Stand as you normally stand. Do not correct your posture for the camera; ' +
        'the whole point of this shot is to see the posture you actually have.',
      'This is the depth photo: forward head, rounded shoulders, anterior ' +
        'pelvic tilt, belly projection and the lower-back curve all only exist in ' +
        'the side view.',
      'Chin level. Lifting the chin hides the under-chin area entirely.',
    ],
    commonMistake: 'Standing at 45° instead of a true 90°, and turning the head to check the ' +
      'camera. A three-quarter turn plus a turned head makes the posture read ' +
      'look fine when it is not — this shot is worth less than nothing if it is ' +
      'inaccurate.',
  }),
  S('body_right', 'Body · Right side', '🧍', {
    framing: 'Same as the left side shot — full body, head to feet, vertical, ' +
      'identical crop.',
    distance: 'Identical again: same 2.0–2.5 m, same 90–100 cm lens height, same floor ' +
      'mark. Do not move the phone between the left and right shots.',
    angle: 'Turn exactly 90° to your right, so your right shoulder points at the ' +
      'camera. Feet pointing at the wall, head facing forward.',
    clothing: 'Exactly what you wore for the other three body shots.',
    tips: [
      'Both sides are needed, and not for symmetry\'s sake — asymmetry only ' +
        'becomes visible by comparing the two. A shoulder that sits higher on one ' +
        'side, an uneven hip, or a curve worth showing a physiotherapist are all ' +
        'invisible from one side alone.',
      'Same rules as the left: look at the wall, arms hanging, natural posture, ' +
        'chin level.',
      'If you can only manage one side shot today, take it and add the other ' +
        'later — a single side is far more useful than none.',
      'Take it immediately after the left shot, before you shift your stance or ' +
        'your light changes.',
    ],
    commonMistake: 'Taking this one from a different distance or on a different day than the ' +
      'left, which makes the two sides look asymmetric when the only thing that ' +
      'changed was the camera.',
  }),
  S('body_back', 'Body · Back', '🧍', {
    framing: 'Full body, head to feet, vertical, identical crop to the other three.',
    distance: 'Same 2.0–2.5 m and the same 90–100 cm lens height. A 10-second timer is ' +
      'easiest here since you cannot see the screen.',
    angle: 'Face directly away from the camera, looking straight ahead at the wall. ' +
      'Shoulders level, feet hip-width, weight even on both feet.',
    clothing: 'Sports bra, or a racerback / open-back fitted top. A normal fitted ' +
      't-shirt is acceptable but the shoulder blades will be much harder to ' +
      'read.',
    tips: [
      'Hair fully up and off your back and shoulders. Hair covers the shoulder ' +
        'blades and the upper-back line, which is precisely where uneven ' +
        'shoulders, winging scapulae and upper-back rounding show.',
      'Same fist-width gap between arms and body, palms facing in.',
      'Even weight on both feet — standing on one leg drops a hip and fakes a ' +
        'lateral tilt.',
      'This shot is where back fat distribution, glute shape, hamstring ' +
        'development and the left-to-right symmetry of your back actually get ' +
        'read. It is the one people skip and the one that adds the most that the ' +
        'front shot missed.',
      'If the timer beeps and you flinch, take it again — a startled posture is ' +
        'not your posture.',
    ],
    commonMistake: 'Leaving hair down. It is the most-skipped instruction in the whole set ' +
      'and it blanks out the majority of what this photo is for.',
  }),
  S('face_front', 'Face · Front', '🙂', {
    framing: 'Head and shoulders, phone vertical. Top of your head just below the top ' +
      'edge, shoulders at the bottom edge — the face should fill roughly 60–70% ' +
      'of the frame height. Do not crop the top of your head and do not crop ' +
      'your chin: the hairline and the jawline are both being measured.',
    distance: '50–70 cm, using the REAR camera on a propped phone with a 10-second ' +
      'timer. If you must use the selfie camera, hold it at full arm\'s length ' +
      'and never closer than about 45 cm.',
    angle: 'Lens exactly at eye level. Not above you, not below you. Chin level — ' +
      'imagine a line from ear to ear running parallel to the floor. Head ' +
      'straight, no tilt, no turn.',
    clothing: 'A plain, mid-tone, non-reflective crew-neck top. Nothing bright red or ' +
      'orange, no high collar, no hood — the neck and jaw need to be visible.',
    tips: [
      'Face the window directly, 1–1.5 m from it, with the phone between you ' +
        'and the window but set slightly to one side so it does not block the ' +
        'light. That gives you even light across both cheeks, which is the whole ' +
        'ballgame for a skin read.',
      'Neutral expression: mouth closed, eyes open, no smile. A smile creases ' +
        'the under-eye area and fakes lines and bags that are not there at rest.',
      'Clean, dry face. No makeup, no glasses, no moisturiser applied in the ' +
        'last 30 minutes — fresh product reads as oiliness and can flip your ' +
        'whole skin-type classification.',
      'Hair pulled fully back off the forehead, temples and cheeks. The ' +
        'hairline is a real data point.',
      'Shooting from slightly above is the reflex everyone has, because it is ' +
        'flattering. It also hides the under-chin area — so if you came here ' +
        'about a double chin, a shot from above guarantees the app never sees it.',
    ],
    commonMistake: 'Leaving beauty mode on. This is the most damaging single error in the ' +
      'entire set: the scan comes back \'pores: none, blackheads: none, ' +
      'evenness: excellent\', you are told your skin is in great shape, and ' +
      'nothing in the plan addresses what you actually wanted help with.',
  }),
  S('face_left', 'Face · Left three-quarter', '🙂', {
    framing: 'Head and shoulders, same crop and same frame fill as the front shot. ' +
      'Your left cheek, left jawline and the left side of your nose all ' +
      'visible.',
    distance: 'Same 50–70 cm, same propped phone, same spot on the floor. Do not move ' +
      'the phone between the three face shots — only your head turns.',
    angle: 'Turn your HEAD 45° to the left — halfway between looking at the lens and ' +
      'looking at the wall. Not a full 90° profile. Shoulders stay square to ' +
      'the camera, chin stays level.',
    clothing: 'The same plain mid-tone top as the front shot.',
    tips: [
      '45° rather than a full profile is deliberate. A true side profile shows ' +
        'the cheek edge-on, where texture reads terribly; three-quarter is the ' +
        'angle dermatology photography uses because it shows the cheek, the jaw ' +
        'line, the nasolabial fold and the side of the nose all at once — which ' +
        'is exactly where pores and pigmentation concentrate.',
      'Turn your head, not your body. Rotating your shoulders changes the light ' +
        'on your face and makes the two side shots incomparable.',
      'Keep the window light falling on the side you are showing. If you turn ' +
        'away from the window, that cheek drops into shadow and the shadow reads ' +
        'as pigmentation or dark patches.',
      'Chin level throughout. Dropping the chin as you turn is a reflex and it ' +
        'hides the jaw.',
      'Same neutral expression as the front shot.',
    ],
    commonMistake: 'Turning the whole upper body instead of just the head, which throws the ' +
      'near shoulder forward, changes the lighting angle, and makes the left ' +
      'and right shots look like two different faces.',
  }),
  S('face_right', 'Face · Right three-quarter', '🙂', {
    framing: 'Head and shoulders, identical crop again. Right cheek, right jawline and ' +
      'the right side of the nose visible.',
    distance: 'Same 50–70 cm, same propped phone, taken back-to-back with the left ' +
      'shot.',
    angle: 'Turn your head 45° to the right. Shoulders square, chin level, no tilt.',
    clothing: 'The same plain mid-tone top.',
    tips: [
      'Take it seconds after the left one so the light is identical. Skin is ' +
        'genuinely asymmetric — most people have more sun damage on their driving ' +
        'side — and that asymmetry is only visible when both sides are lit the ' +
        'same way.',
      'If your window is on one side of the room, one of these two shots will ' +
        'be dimmer than the other. Move so the window is in front of you and turn ' +
        'your head both ways from there, rather than turning towards and away ' +
        'from a side window.',
      'Keep the same distance. A closer right-side shot will report more ' +
        'visible pores purely because the camera could see more.',
      'If you have a mole, scar or patch you are tracking, make sure it is in ' +
        'frame on the side it lives on.',
    ],
    commonMistake: 'Taking this one under different light than the left — a different room, ' +
      'a different hour, or a lamp switched on — which produces a left/right ' +
      'difference in the report that is entirely an artefact of the lighting.',
  }),
  S('hair_front', 'Hair · Front hairline', '💇', {
    framing: 'Forehead, hairline, both temples, and the front third of your head ' +
      'filling the frame. Your chin can be cut off — this shot is about the ' +
      'hairline, not the face. Eyebrows near the bottom edge is about right.',
    distance: '40–50 cm, phone vertical, lens at forehead height and level — pointed ' +
      'straight at your hairline, not angled up from below.',
    angle: 'Face the camera straight on with your head level. Do not tip your head ' +
      'back, which stretches the forehead and fakes a receding hairline, and do ' +
      'not tip it forward, which hides the hairline entirely.',
    clothing: 'Anything plain with no hood and no cap. Push any headband or clip out of ' +
      'frame.',
    tips: [
      'Hair must be DRY and in its natural state. Wet hair clumps and shows ' +
        'scalp that is not normally visible, which reliably produces a false ' +
        'thinning result.',
      'No product — no gel, no serum, no dry shampoo. Product fakes shine, ' +
        'flattens volume and hides flakes.',
      'Brushed but not styled. Do not fluff, tease or arrange it to look ' +
        'fuller; that is a natural instinct and it makes the photo useless as a ' +
        'baseline you will be compared against in eight weeks.',
      'Push your fringe back so both temples and the full hairline are visible. ' +
        'Temple recession is one of the earliest and most trackable signs there ' +
        'is.',
      'Soft window light in front of you. Direct sun on hair blows out the ' +
        'highlights and destroys both the scalp reading and the shine rating.',
    ],
    commonMistake: 'Taking it straight out of the shower. Wet hair is the single most common ' +
      'reason a hair scan comes back with a density and thinning result that ' +
      'alarms someone unnecessarily.',
  }),
  S('hair_left', 'Hair · Left side', '💇', {
    framing: 'The whole left side of your head — ear, temple, and up to the crown. The ' +
      'ear should sit roughly in the middle of the frame.',
    distance: '40–50 cm, phone vertical, lens level with your ear and pointed straight ' +
      'at the side of your head. Easiest with someone else holding it, or a ' +
      'propped phone and the timer.',
    angle: 'Turn a full 90° so the camera is looking flat at the side of your head. ' +
      'Head level, chin neither up nor down.',
    clothing: 'Plain top, no hood, no high collar, nothing covering the neck or the ' +
      'area behind the ear.',
    tips: [
      'Tuck the hair behind your ear on the side being photographed. The temple ' +
        'and the hairline above the ear are the whole reason this photo exists, ' +
        'and hair hanging over them blanks out the entire measurement.',
      'Dry, no product, natural state — same as every other hair shot.',
      'Keep the lens level with your ear. Shooting up from below foreshortens ' +
        'the side and hides the crown; shooting down hides the temple.',
      'This is where side density and temple recession are read, and where you ' +
        'would see a thinning pattern before it becomes obvious anywhere else.',
      'Same light, same distance, same side of the room as the right-side shot.',
    ],
    commonMistake: 'Leaving hair hanging over the temple, which is exactly the region being ' +
      'assessed — the scan then reports \'not clearly visible\' and you get ' +
      'nothing back for the effort.',
  }),
  S('hair_right', 'Hair · Right side', '💇', {
    framing: 'The whole right side of your head — ear, temple, up to the crown, ear ' +
      'roughly centred in the frame.',
    distance: 'Same 40–50 cm, same ear-level lens height, taken immediately after the ' +
      'left side.',
    angle: 'Turn a full 90° the other way. Head level, camera flat on to the side of ' +
      'your head.',
    clothing: 'The same plain top.',
    tips: [
      'Tuck the hair behind your ear on this side too.',
      'Take it right after the left one, in the same light. Hairlines are ' +
        'commonly asymmetric, and the difference is only meaningful if both shots ' +
        'were taken the same way.',
      'If you have a fixed parting, one of these two sides will naturally show ' +
        'more scalp than the other. That is normal — keep the parting where you ' +
        'always wear it rather than moving it to look even.',
      'Do not comb the hair forward over the temple to \'tidy it up\' before the ' +
        'shot.',
    ],
    commonMistake: 'Moving your parting between the left and right shots to make them look ' +
      'symmetric, which erases the real, trackable asymmetry the pair was taken ' +
      'to capture.',
  }),
  S('hair_back', 'Hair · Back', '💇', {
    framing: 'The whole back of your head plus the top of your shoulders, including ' +
      'the nape hairline at the bottom of the frame. Phone vertical.',
    distance: '50–60 cm, with the lens slightly ABOVE the top of your head and angled ' +
      'down about 20° so the crown is visible, not just the back of your neck.',
    angle: 'Back directly to the camera, head level and looking straight ahead. Do ' +
      'not tip your head forward — that shows the top of your head rather than ' +
      'the back, which is what hair_top is for.',
    clothing: 'Plain top with a low neckline or a collar folded down. No hood.',
    tips: [
      'Be realistic about this one: you cannot take it well yourself. Ask ' +
        'someone, or prop the phone behind you at head height with the 10-second ' +
        'timer, or stand with your back to a mirror and shoot the mirror with the ' +
        'rear camera.',
      'Lighting: stand 1–2 m into the room facing AWAY from the window so ' +
        'daylight lands on the back of your head. Whoever is holding the phone ' +
        'should stand slightly off to one side so their shadow does not fall ' +
        'across your crown.',
      'This shot carries the crown density, the overall length, the condition ' +
        'of the ends and the nape hairline — the crown in particular is the most ' +
        'common thinning site and the one you physically cannot check yourself.',
      'Do not brush it flat immediately before the shot; natural state, dry, no ' +
        'product.',
      'If someone is helping you, ask them to hold the phone above their own ' +
        'head height rather than at their chest.',
    ],
    commonMistake: 'Shooting from below or from chest height, so the crown never appears in ' +
      'the frame at all. That removes the single most valuable thing this photo ' +
      'can show.',
  }),
  S('hair_top', 'Hair · Top / crown', '💇', {
    framing: 'The top of your head filling the entire frame, with your parting running ' +
      'down the middle of the frame. Ears at the left and right edges is about ' +
      'the right width.',
    distance: '30–40 cm directly above your head, lens pointing straight down at the ' +
      'crown. Tilt your head forward about 30° and hold the phone above and in ' +
      'front of you, or ask someone taller, or use the timer with the phone ' +
      'braced overhead.',
    angle: 'Straight down onto the crown, lens parallel to the top of the head. Not ' +
      'at a slant — a slanted shot compresses the parting and makes it look ' +
      'narrower than it is.',
    clothing: 'Irrelevant for this shot; just keep hoods and collars down.',
    tips: [
      'Comb a clean parting where you normally part before you shoot. This is ' +
        'the technique that makes the photo work: the width of visible scalp ' +
        'along a parting is how thinning is genuinely measured, and without a ' +
        'parting the surrounding hair hides everything.',
      'Light: bright but indirect, coming from in FRONT of you. Do not stand ' +
        'under a ceiling light or a bathroom downlight — your own head blocks it ' +
        'and the crown goes dark, and a dark crown reads as dense hair whether it ' +
        'is or not.',
      'Dry, no product, and do not fluff or tease it first. The instinct to ' +
        'make it look fuller before photographing it is universal and it defeats ' +
        'the purpose entirely.',
      'This is the highest-value hair photo of the five. Crown density, parting ' +
        'width, scalp visibility and flaking all live here.',
      'Keep the parting in the same place every time you re-shoot, or the ' +
        'comparison is meaningless.',
    ],
    commonMistake: 'Taken in a bathroom under a downlight, so the crown is a black blob with ' +
      'no readable detail — combined with fluffing the hair up first, which is ' +
      'exactly the wrong preparation for the one shot that is supposed to show ' +
      'the scalp.',
  }),
]

const bySlot = Object.fromEntries(SLOT_GUIDE.map((s) => [s.slot, s]))

export const guideFor = (slot) => bySlot[slot] || null

// The short version, for the line under a photo tile. The full guide opens on
// tap — nobody reads seventeen rules before their first photo, and burying the
// tile in text is how people skip the photos altogether.
export function shortHint(slot) {
  const g = bySlot[slot]
  if (!g) return ''
  return `${g.distance} · ${g.angle}`
}

// Which slots feed which scan, so the UI can say what a missing photo costs
// rather than just showing an empty square.
export const SLOT_UNLOCKS = {
  body_front: 'body composition, fat map, posture',
  body_left: 'body fat estimate, abdominal and chest profile',
  body_right: 'the same read as the left side — one of the two is enough',
  body_back: 'back fat, hip and glute rating, body acne',
  face_front: 'every face skin rating, under-eye, face shape',
  face_left: 'jawline, under-chin, side profile',
  face_right: 'the same as the left — one of the two is enough',
  hair_front: 'hairline, density at the front',
  hair_left: 'side density and hairline recession',
  hair_right: 'the same as the left',
  hair_back: 'crown thinning, overall length and damage',
  hair_top: 'scalp health, dandruff, part width — the most useful hair photo',
}
