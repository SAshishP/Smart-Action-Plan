// Skin, hair and scalp guidance protocols — the "what do I actually do about
// it" half of the deep photo scan.
//
// Same shape and same honesty rules as concerns.js: what it actually is, what
// genuinely helps, what does nothing, how long it takes, and when the real
// answer is a doctor rather than another year of trying. Nothing here promises
// to erase something it cannot.
//
// Keys match the attribute keys in deepscan.js, so an attribute rated moderate
// or worse can surface its protocol directly.

const P = (key, name, icon, o) => ({ key, name, icon, ...o })

export const SKIN_PROTOCOLS = [
  P('kp', 'Strawberry skin / keratosis pilaris', '🍓', {
    what:
      'Keratin plugs the mouth of each hair follicle and traps a fine hair ' +
      'inside it, so the skin over the upper arms, thighs, backside and ' +
      'sometimes the cheeks turns into small rough bumps that feel like ' +
      'sandpaper. Roughly 4 in 10 adults have it, it runs in families, and it ' +
      'is not dirt, not an infection and not something you caused. It is ' +
      'completely harmless. It is also not curable — it is managed, and it ' +
      'usually eases with age. One thing worth untangling first: \'strawberry ' +
      'legs\' is used for three different things. If the bumps are on your upper ' +
      'arms and thighs and feel rough, that is this. If the dark dots appear on ' +
      'your lower legs after shaving, that is trapped hair and open follicles, ' +
      'and the ingrown-hair protocol is the one you want.',
    helps: [
      'Urea 10–20% or a lactic acid / AHA body lotion, daily. This is the ' +
        'treatment — everything else on this list is support',
      'A salicylic acid body wash in the shower a few times a week',
      'Moisturise within three minutes of getting out of the shower, on damp ' +
        'skin. The timing does half the work',
      'Short, lukewarm showers. Hot water strips the barrier and the bumps get ' +
        'redder',
      'A retinoid body lotion 2–3 nights a week for stubborn patches, if your ' +
        'skin tolerates it',
      'Sunscreen on the area, because the brown marks left by picking last far ' +
        'longer than the bumps do',
      'Patience with the pace. It often looks better in summer and worse in ' +
        'winter, and that is just how it behaves',
    ],
    doesNothing: [
      'Scrubbing, loofahs and exfoliating gloves — physical scrubbing inflames ' +
        'it and makes it visibly redder. This is the single most common mistake',
      'Coconut oil on its own — it softens nothing that is inside the follicle',
      'Cutting out gluten or dairy, or any \'detox\'',
      'Picking or squeezing the bumps. It leaves brown marks that outlast the ' +
        'bumps by a year',
      'Any \'bump cream\' whose label does not name urea, lactic acid, salicylic ' +
        'acid or a retinoid',
    ],
    timeline:
      'Roughness softens in 4–6 weeks of daily acid or urea. The redness is ' +
      'slower — give it 3 months. And it returns within a few weeks of ' +
      'stopping, because you are managing it, not curing it. Anyone who tells ' +
      'you otherwise is selling something.',
    doctor:
      'A dermatologist is worth it if the bumps are very red and inflamed ' +
      '(keratosis pilaris rubra), if there is hair loss in the patch, or if you ' +
      'want prescription-strength urea or tretinoin. Lasers help the redness in ' +
      'some people. Nobody honest will promise you smooth skin.',
  }),
  P('ingrownhairs', 'Ingrown hairs & razor bumps', '🪒', {
    what:
      'A hair curls back or grows sideways under the skin instead of out ' +
      'through it, and your body treats it exactly like a splinter — a red ' +
      'bump, sometimes a pus head, and often a brown mark that stays for months ' +
      'after the bump has gone. Coarse and curly hair gets this far more, and ' +
      'it is a shaving-technique problem far more often than a hygiene problem. ' +
      'Nothing about it means you are unclean.',
    helps: [
      'Stop shaving the area for 3–4 weeks and let it settle. Nothing else ' +
        'works while you keep re-cutting the hair below the skin',
      'When you go back: sharp fresh blade, wet the hair for 2–3 minutes first, ' +
        'shave WITH the grain, one pass, and never stretch the skin tight — ' +
        'stretching is what leaves the cut end below the surface',
      'A single-blade razor or an electric trimmer that leaves short stubble. ' +
        'Multi-blade razors get closer, which is the actual cause',
      'Chemical exfoliation 2–3 times a week — salicylic or glycolic acid, ' +
        'starting 48 hours after shaving',
      'A warm compress for 10 minutes on an active bump. Most of them release ' +
        'on their own',
      'If the hair tip is genuinely free and visible, lift it with clean ' +
        'tweezers. If it is not, leave it — digging is how the scars happen',
      'Loose clothing straight after hair removal; friction plus a fresh cut ' +
        'hair is the whole recipe',
      'A benzoyl peroxide wash if the bumps keep getting infected',
      'Laser hair removal is the only durable fix for chronic razor bumps, and ' +
        'it is a legitimate choice rather than a last resort',
    ],
    doesNothing: [
      'Shaving closer to \'get ahead of it\' — this makes it worse, reliably',
      'Scrubbing hard with a loofah on active bumps',
      'Digging out a hair you cannot clearly see. This is the entire reason for ' +
        'the dark marks and pitted scars',
      'Alcohol-heavy aftershaves splashed onto already-angry skin',
      'Hair-removal creams for everyone — they suit some people and chemically ' +
        'burn others. Patch test for 24 hours, every time',
    ],
    timeline:
      'A single bump settles in 5–10 days. A pattern of them takes 4–8 weeks of ' +
      'genuinely changed technique. The dark marks left behind fade over 3–12 ' +
      'months, faster with sunscreen and azelaic acid.',
    doctor:
      'Any bump that is growing, very painful, hot, spreading redness, or comes ' +
      'with a fever is an infection rather than an ingrown, and it needs seeing ' +
      'rather than squeezing. Also worth an appointment for repeated boils, or ' +
      'for prescription retinoid or antibiotic treatment when technique changes ' +
      'have not been enough. On Black skin the scarring risk is highest and ' +
      'laser at a proper clinic is genuinely the definitive answer — see a ' +
      'dermatologist rather than a salon.',
  }),
  P('underarmdark', 'Underarm darkness', '🙌', {
    what:
      'Almost never dirt and almost never a hygiene failure, whatever the ' +
      'advertising implies. It is usually one of four things: pigment left ' +
      'behind by shaving irritation and friction, stubble sitting under the ' +
      'skin and reading as a shadow, a reaction to fragrance or an ingredient ' +
      'in a deodorant, or acanthosis nigricans — a velvety, slightly thickened ' +
      'darkening that is a marker of insulin resistance, PCOS or thyroid ' +
      'problems rather than a skin problem at all. Working out which one you ' +
      'have is the entire protocol, because the fourth one is not treated with ' +
      'cream.',
    helps: [
      'First, look at the texture. If it is velvety and slightly thickened, and ' +
        'the back of your neck and your groin are darkening too, skip the creams ' +
        'and read the doctor line',
      'Switch shaving to trimming, or to laser. Most friction-driven darkening ' +
        'is razor-driven',
      'Stop scrubbing. Irritation causes pigment, so scrubbing to lighten it ' +
        'works backwards',
      'A fragrance-free deodorant trial for 4 weeks if irritation is likely',
      'Niacinamide 5%, azelaic acid 10–15%, alpha arbutin or kojic acid. Slow, ' +
        'unglamorous, and they genuinely work',
      'Lactic acid or another AHA 2–3 times a week for surface buildup',
      'Looser, breathable clothing — friction is a real driver here',
      'If it is insulin resistance, the skin follows the metabolic change. ' +
        'Weight loss and treatment change it far more than any cream ever will',
    ],
    doesNothing: [
      'Lemon, baking soda, toothpaste, potato slices. All irritants, and ' +
        'irritation makes pigment. These actively work against you',
      'Hard scrubbing or an exfoliating mitt',
      '\'Whitening\' creams from unregulated sellers, which frequently contain ' +
        'steroids or mercury',
      'Talcum powder — it hides it for an hour and does nothing else',
      'Switching deodorants every week without giving one four honest weeks',
    ],
    timeline:
      'Irritation-driven pigment: visible improvement in 8–12 weeks, most of ' +
      'what you will get by 6 months. Acanthosis nigricans improves only when ' +
      'the underlying insulin resistance improves — and then it can improve a ' +
      'lot.',
    doctor:
      'If the skin is velvety and thickened and the darkening spans your neck, ' +
      'armpits and groin together, ask for HbA1c, fasting insulin and thyroid ' +
      'tests. That single sentence is the most useful thing in this protocol. ' +
      'Otherwise a dermatologist for prescription azelaic acid, tretinoin or a ' +
      'proper chemical peel — and never for a product bought from an ' +
      'unregulated seller.',
  }),
  P('discoloration', 'Uneven tone, tan lines & dark knees, elbows and neck', '🌗', {
    what:
      'Several separate things wearing the same name. A tan and its tan lines ' +
      'are real melanin responding to real UV damage. Post-inflammatory pigment ' +
      'is a brown shadow left behind by an old spot, a bite or friction. ' +
      'Thickened darker skin on knees, elbows, knuckles and ankles comes from ' +
      'pressure and rubbing, not from being unwashed. Melasma is hormonal and ' +
      'plays by its own rules entirely. The honest headline: tan lines fade on ' +
      'their own and nothing meaningfully speeds that up except time and not ' +
      're-tanning — and every pigment treatment you buy is undone by the next ' +
      'unprotected afternoon, so sun protection is not step one, it is most of ' +
      'the result.',
    helps: [
      'SPF 30–50 on everything exposed, reapplied. This is roughly 80% of the ' +
        'outcome and the only non-negotiable item here',
      'Urea or lactic acid lotion daily on thickened knees and elbows',
      'Niacinamide, azelaic acid, alpha arbutin or vitamin C for pigment. Pick ' +
        'two, use them for three months, judge then',
      'A retinoid at night on body skin — not on broken or irritated skin',
      'Moisturise. Dry, rough skin scatters light and genuinely reads darker ' +
        'than it is',
      'Stop the friction: kneeling, leaning on elbows, tight straps, scrubbing',
      'Time. Tan lines fade in weeks to a few months once you stop topping them ' +
        'up',
    ],
    doesNothing: [
      'Bleach, lemon juice, baking soda and chlorine. Irritation causes more ' +
        'pigment',
      '\'Instant whitening\' creams',
      'Scrubbing dark knees raw — the skin thickens in response, which makes it ' +
        'darker',
      'Tanning the pale parts to match. You are buying permanent damage to fix ' +
        'a temporary line',
    ],
    timeline:
      'Tan lines: 4–12 weeks with real sun protection. Post-inflammatory ' +
      'pigment: 3–12 months. Thickened knees and elbows feel smoother in 2–4 ' +
      'weeks with urea, though the colour takes months. Melasma is managed, ' +
      'never finished.',
    doctor:
      'A mole or patch that changes shape, colour or size, or that bleeds, ' +
      'itches, or simply looks different from all your others — that is a ' +
      'same-month appointment, not a skincare question. Also see a ' +
      'dermatologist for melasma, which needs a proper plan rather than a ' +
      'product. And never buy skin-lightening products containing mercury or ' +
      'unlabelled steroids, whatever the seller claims.',
  }),
  P('marks', 'Marks & scars', '🩹', {
    what:
      'Two different things that get constantly confused, and the difference ' +
      'decides everything. A MARK is flat and coloured — red or purple if it is ' +
      'recent inflammation, brown if it is pigment. Marks always fade, on their ' +
      'own, given time. A SCAR is a change in the surface itself: indented, ' +
      'raised or thickened. Scars do not fade, because the tissue is genuinely ' +
      'different. Run a finger over it with your eyes closed. If you cannot ' +
      'feel it, it is a mark, and time is on your side.',
    helps: [
      'Flat marks: sunscreen first — sun locks brown marks in place — then ' +
        'azelaic acid, niacinamide, vitamin C or a retinoid, and patience',
      'Raised or keloid scars: silicone sheets or gel worn daily for 12 weeks ' +
        'or more. This has the best evidence of anything you can buy without a ' +
        'prescription',
      'Indented acne scars: only procedures change these — microneedling, ' +
        'subcision, fractional laser, TCA CROSS. No cream reaches a missing piece ' +
        'of dermis',
      'New wounds: keep them covered and moist, do not pick the scab, and ' +
        'protect from sun for a full year. That first year is the only window ' +
        'where you influence how the scar turns out',
    ],
    doesNothing: [
      'Vitamin E oil. It has been properly tested and it made scars worse in a ' +
        'meaningful share of people',
      'Any \'scar removal\' cream aimed at indented scars',
      'Lemon, toothpaste, or anything abrasive',
      'Picking. Every mark you have was once something you could have left ' +
        'alone',
    ],
    timeline:
      'Red marks 3–6 months. Brown marks 6–12 months or more. Silicone on ' +
      'raised scars needs 3–6 months of genuinely daily wear. Indented scars: ' +
      '3–6 clinical sessions for a 30–60% improvement, and never gone entirely.',
    doctor:
      'A dermatologist for indented or keloid scars, because that is the only ' +
      'route that changes them at all. See someone promptly instead for a scar ' +
      'that suddenly grows, itches persistently or ulcerates, and for any ' +
      '\'spot\' that never heals.',
  }),
  P('bodyacne', 'Body acne — back, chest and shoulders', '🎯', {
    what:
      'The same disease as facial acne, on skin with larger and more crowded ' +
      'oil glands, under constant occlusion from clothing, backpack straps, ' +
      'sweat and hair products. One lookalike matters enormously: small itchy ' +
      'bumps that are all the same size, mostly across the chest and upper ' +
      'back, are usually malassezia (fungal) folliculitis. Normal acne ' +
      'treatment does nothing for it, and people spend years on the wrong ' +
      'product.',
    helps: [
      'Benzoyl peroxide 4–10% wash — lather, leave it on for two minutes, ' +
        'rinse. It bleaches towels and dark fabric, so use white ones',
      'A salicylic acid wash or spray for the parts you cannot reach. ' +
        'Long-handled applicators cost very little and solve the actual problem',
      'Shower straight after sweating. Never sit around in a damp gym top',
      'Wash your hair BEFORE you wash your body, so conditioner rinse-off gets ' +
        'cleaned off your back. This one change clears a surprising amount of ' +
        'upper-back acne on its own',
      'Loose breathable clothing, and wash bedding and gym gear properly',
      'Adapalene 0.1% gel on the area at night',
      'If you suspect the fungal kind: ketoconazole 2% shampoo used as a body ' +
        'wash, left on 5 minutes, 3–4 times a week for 4 weeks. If it clears, ' +
        'that was your answer',
    ],
    doesNothing: [
      'Scrubbing. It inflames the follicles and spreads bacteria across the ' +
        'area',
      'Antibacterial soap on its own',
      'Sunbathing to \'dry it out\'. It looks better for a week and pigments the ' +
        'marks for a year',
      'Picking. This is the entire reason for the marks that outlast the acne',
    ],
    timeline:
      'Six to eight weeks before you can fairly judge any acne treatment, ' +
      'twelve before the skin looks settled. Fungal folliculitis responds ' +
      'faster — often 2–4 weeks, which is itself a useful clue.',
    doctor:
      'Deep painful nodules or cysts, anything that is scarring, or acne that ' +
      'has not moved after three months of proper treatment. That is a ' +
      'dermatologist and probably oral treatment — do not spend two years on ' +
      'washes. Separately: sudden severe acne alongside irregular periods and ' +
      'increased facial or body hair is worth a PCOS workup rather than a ' +
      'stronger cleanser.',
  }),
  P('bodydry', 'Dry, tight or flaky body skin', '🏜️', {
    what:
      'Your skin barrier is losing water faster than it can hold it. Usually ' +
      'from hot showers, harsh soap, dry indoor air, cold weather, age, or an ' +
      'underlying eczema tendency. Shins, forearms and the backs of the hands ' +
      'go first because they have the fewest oil glands on the body. This is a ' +
      'barrier problem, not a hydration problem — which is why drinking more ' +
      'water does very little for it.',
    helps: [
      'Lukewarm, not hot. Five to ten minutes',
      'A soap-free cleanser, and only where you actually need it. Most of your ' +
        'body does not need soap every day',
      'Moisturise within three minutes of getting out of the shower, on skin ' +
        'still damp. The timing genuinely does half the work',
      'An ointment or a thick cream rather than a lotion in winter',
      'Ingredients that do something: urea, glycerin, ceramides, petrolatum, ' +
        'colloidal oatmeal',
      'A humidifier if your indoor air is dry',
      'Unscented everything while the skin is already irritated',
    ],
    doesNothing: [
      'Drinking litres of water and expecting your shins to change',
      'Scrubbing the flakes off',
      'Alcohol-heavy or heavily fragranced lotions',
      'Coconut oil alone on genuinely eczema-prone skin — it seals, it does not ' +
        'repair, and it irritates a fair number of people',
    ],
    timeline:
      'Tightness and flaking improve within 3–7 days of changing the shower and ' +
      'using a real moisturiser. A properly rebuilt barrier takes 4–6 weeks.',
    doctor:
      'Itchy, red, weeping or cracked skin, or anything that keeps you awake at ' +
      'night. Also dryness alongside fatigue, hair thinning and feeling cold — ' +
      'that combination is worth a thyroid test. Eczema and psoriasis both have ' +
      'genuinely good prescription treatment now, and a lot of people struggle ' +
      'for years with a moisturiser when two weeks of the right prescription ' +
      'would have settled it.',
  }),
  P('rash', 'Rash, irritation & hives', '🔴', {
    what:
      'SAP cannot tell you what a rash is, and neither can a photograph. ' +
      'Contact allergy, eczema, heat rash, fungal infection, a viral rash, a ' +
      'drug reaction and several autoimmune conditions look nearly identical in ' +
      'a phone picture. This is the one area where a confident guess does real ' +
      'harm, so this protocol does not guess. What it can do is help you remove ' +
      'the most likely cause, describe it properly, and recognise the patterns ' +
      'that need a doctor now rather than next month.',
    helps: [
      'Stop every new product touching that skin: detergent, fabric softener, ' +
        'deodorant, cream, sunscreen, jewellery. Contact allergy is the most ' +
        'common cause and removing the cause is the whole treatment',
      'Fragrance-free moisturiser and nothing else on it',
      'A cool compress for the itch',
      'An over-the-counter oral antihistamine for hives specifically — raised ' +
        'wheals that come and go are a histamine reaction, and this is the thing ' +
        'antihistamines are actually for',
      'Loose cotton clothes; keep the area cool and dry',
      'Photograph it daily with the date. Rashes have a habit of vanishing the ' +
        'morning of the appointment, and a doctor genuinely wants to see how it ' +
        'changed',
      'Write down what you ate, took and touched in the 48 hours before it ' +
        'started',
    ],
    doesNothing: [
      'Hydrocortisone on a fungal rash. It looks better and gets genuinely ' +
        'worse, and it is the most common self-treatment mistake there is',
      'Scrubbing it',
      'Hot water for the itch — a minute of relief, hours of worse',
      '\'Detox\' anything',
      'Asking an app to diagnose it, including this one',
    ],
    timeline:
      'A contact reaction settles in 1–3 weeks once the trigger is gone. Hives ' +
      'usually within 24–48 hours. Anything still going at 6 weeks is chronic ' +
      'and needs a proper workup rather than more waiting.',
    doctor:
      'Emergency, today: any rash with swelling of the lips, tongue or throat, ' +
      'difficulty breathing or dizziness; a rash spreading fast with a fever; ' +
      'or a rash that does NOT fade when you press a clear glass against it — ' +
      'that last one is meningitis until proven otherwise. Soon: a rash that ' +
      'started with a new medication (do not stop it yourself, call), a painful ' +
      'blistering band on one side of the body (shingles — antivirals only work ' +
      'in the first 72 hours), anything that looks infected, and anything past ' +
      'two weeks. This is not a cosmetic protocol and it is not trying to be.',
  }),
  P('scalpoily', 'Oily scalp', '💧', {
    what:
      'Your scalp has more oil glands than anywhere else on your body. An oily ' +
      'scalp is mostly genetics and washing habits — and very often seborrheic ' +
      'dermatitis, a low-grade reaction to the malassezia yeast that lives in ' +
      'that oil, which causes greasy yellowish flakes, itching and redness. ' +
      'This matters: oily hair WITH flakes is almost never dryness, and ' +
      'treating it as dryness by adding oil feeds the exact organism causing ' +
      'it.',
    helps: [
      'Wash MORE often, not less. Daily is fine on an oily scalp. The advice ' +
        'that your scalp will \'rebalance\' if you stop washing is not supported by ' +
        'anything',
      'Shampoo the scalp with fingertips for 60 seconds, rinse, then lather a ' +
        'second time. The second lather is the one that actually cleans',
      'Conditioner from mid-length to ends only. Never on the scalp',
      'If there are flakes or itch, use an active: zinc pyrithione, ' +
        'ketoconazole 2% or selenium sulphide, left on 3–5 minutes, 2–3 times a ' +
        'week — and rotate the active every few months',
      'A clarifying or salicylic acid shampoo once a fortnight for buildup',
      'Stop the pre-wash oiling ritual. On an oily, flaking scalp it directly ' +
        'feeds malassezia',
      'Wash after workouts, keep brushes clean, and go easy on heavy silicone ' +
        'stylers, thick pomades and days of dry shampoo',
    ],
    doesNothing: [
      'Washing less to \'train\' your scalp',
      'Lemon juice, vinegar rinses and baking soda — they strip, irritate and ' +
        'rebound',
      'Coconut or olive oil masks on a seborrheic scalp. Malassezia eats those ' +
        'oils',
      'Scratching flakes loose with a comb',
      'Anti-dandruff shampoo used for two days and abandoned. Three to five ' +
        'minutes of contact time, consistently, is the whole treatment',
    ],
    timeline:
      'Grease is under control within one or two washes. Flakes and itch settle ' +
      'over 2–4 weeks of a proper antifungal shampoo — and come back within ' +
      'weeks if you stop. This is control, not cure, and knowing that up front ' +
      'is what keeps people using it.',
    doctor:
      'Thick scaling plaques that extend past your hairline, bleed when lifted, ' +
      'or turn up on your elbows and knees too — that is likely psoriasis and ' +
      'it needs different treatment. Also see someone for hair shedding ' +
      'alongside a very inflamed scalp, or when six weeks of over-the-counter ' +
      'antifungal shampoo has genuinely changed nothing. Prescription-strength ' +
      'shampoos and steroid lotions exist and they work.',
  }),
  P('scalpdry', 'Dry / tight scalp', '🌵', {
    what:
      'The opposite problem to an oily scalp, and considerably less common than ' +
      'people think — most self-diagnosed \'dry scalp\' is actually seborrheic ' +
      'dermatitis, which is oily. A genuinely dry scalp feels tight, itchy and ' +
      'slightly sore; the flakes are small, white and powdery rather than ' +
      'greasy or yellow; and the hair itself is usually dry too. Causes: ' +
      'over-washing, sulphates, hot water, hard water, cold dry air, colour and ' +
      'bleach, and eczema. Before you use any of this, check the flakes. Greasy ' +
      'and yellowish means you want the oily-scalp protocol, and using this one ' +
      'will make you worse.',
    helps: [
      'Wash less often, with a gentler sulphate-free shampoo',
      'Lukewarm water only',
      'A genuine pre-wash oil — light, such as squalane or jojoba — 30 to 60 ' +
        'minutes before washing. This is the one place where oiling honestly ' +
        'helps',
      'A leave-in scalp serum with glycerin, urea or niacinamide',
      'A humidifier in the dry months',
      'A gentle chemical scalp exfoliant (salicylic 2%) every week or two if ' +
        'flakes build up. Not a scrub',
      'Sunscreen or a hat on a wide part. Scalp sunburn is common and nobody ' +
        'expects it',
      'Cut back on alcohol-heavy dry shampoos and daily heat',
    ],
    doesNothing: [
      'Heavier and heavier oils left on for days. They trap, they build up, and ' +
        'they can flip you into the oily-flaky problem instead',
      'Scratching or picking flakes off',
      'Putting conditioner on the scalp — conditioner is for the hair fibre, ' +
        'not for skin',
      'Anti-dandruff shampoo daily on a truly dry scalp. Those actives are ' +
        'drying, and this is how a mild problem becomes a stubborn one',
    ],
    timeline:
      'Tightness and itch improve in 1–2 weeks. Flaking in 3–4. If nothing has ' +
      'changed at four weeks, you were probably treating the wrong problem — go ' +
      'back and read the oily-scalp protocol.',
    doctor:
      'A dermatologist for flaking with hair loss, painful cracked skin, ' +
      'weeping, or scaling that spreads onto your face and behind your ears. ' +
      'Scalp psoriasis and scalp eczema both have prescription treatments that ' +
      'work considerably better than anything on a shelf.',
  }),
  P('hairthinning', 'Thinning, shedding & a widening part', '💇', {
    what:
      'Two different things, and they are treated differently. SHEDDING ' +
      '(telogen effluvium) is hair leaving faster than normal, all over, ' +
      'usually 2–3 months after a trigger: illness, fever, surgery, childbirth, ' +
      'a crash diet, severe stress, stopping the pill, low iron, thyroid ' +
      'trouble. It is temporary and it regrows. THINNING (androgenetic) is each ' +
      'new hair growing back finer and shorter over years — a widening part, or ' +
      'receding temples — and it is progressive, which means the honest goal is ' +
      'holding ground rather than getting it all back. A round, smooth bald ' +
      'patch that appears quickly is neither of those: that is alopecia areata, ' +
      'and it is an appointment.',
    helps: [
      'Get bloods before you buy anything: ferritin (you want it well above 30, ' +
        'not merely \'not anaemic\'), TSH, vitamin D, B12. A great deal of shedding ' +
        'is a number on a blood test',
      'Topical minoxidil 5% is the only over-the-counter treatment with strong ' +
        'evidence for pattern thinning. It must be used indefinitely, and the ' +
        'shed at weeks 2–6 is expected — it is not the treatment failing',
      'For men, oral finasteride is more effective and is a proper doctor ' +
        'conversation, side effects included',
      'Eat enough. Protein at every meal, and not sitting in a deep deficit for ' +
        'months',
      'Stop the traction: tight ponytails, buns, braids and extensions cause ' +
        'hairline loss that no drug reverses',
      'Treat any seborrheic dermatitis you have. An inflamed scalp does not ' +
        'help anything',
      'Be gentle — no daily heat, no bleach on already-thinning hair',
      'Photograph your part in the same light once a month. Hair change is ' +
        'invisible day to day and obvious across three months',
    ],
    doesNothing: [
      'Biotin, unless you have a genuine and rare deficiency. It also skews ' +
        'thyroid and troponin blood tests, so stop it well before any test',
      '\'Hair growth\' gummies',
      'Onion juice and rosemary oil used INSTEAD of minoxidil. The rosemary ' +
        'trial is interesting; it is not equivalent',
      'Expensive shampoos claiming regrowth. Shampoo is on your scalp for ' +
        'ninety seconds',
      'Scalp massage devices as a treatment',
      'Waiting. Follicles gone for years do not come back, and every month of ' +
        'delay is permanent',
    ],
    timeline:
      'Any hair treatment needs 4–6 months before you can judge it, because the ' +
      'growth cycle is genuinely that slow. Shedding after a trigger usually ' +
      'stops by 6 months with thickness returning over 6–12. Minoxidil: early ' +
      'change at 4 months, the real result at 12.',
    doctor:
      'Round patchy loss; loss with scalp pain, burning, or shiny skin where ' +
      'you can no longer see follicles (scarring alopecias are urgent — that ' +
      'loss is permanent and treatment is about stopping it spreading); sudden ' +
      'heavy loss; or loss alongside fatigue, weight change, irregular periods ' +
      'or increased facial hair. A dermatologist can do a pull test, dermoscopy ' +
      'and the right bloods in one visit. This is one of the most worthwhile ' +
      'appointments in this entire app.',
  }),
  P('undereye', 'Under-eye darkness, hollows & bags', '👁️', {
    what:
      'Three different causes share one name, and what fixes one does nothing ' +
      'for the others — which is why so many people conclude that eye creams do ' +
      'not work when the real problem is they bought the wrong answer to the ' +
      'wrong question. PIGMENT: the skin itself is darker, common in brown and ' +
      'olive skin, worse with sun and rubbing. VASCULAR: blue or purple vessels ' +
      'showing through very thin skin, worse with poor sleep, allergy, ' +
      'dehydration and congestion. HOLLOW: a shadow cast by the tear-trough ' +
      'groove — that is bone and fat structure, not a skin problem at all, and ' +
      'it deepens with age and with fat loss. Bags are a fourth thing again: ' +
      'fat pads bulging forward, or overnight fluid.',
    helps: [
      'Work out which one you have. Gently stretch the skin sideways: if the ' +
        'darkness stays it is pigment, if it lightens it is vascular. If it ' +
        'changes when you tilt your face toward a light, it is a hollow',
      'Pigment: sunscreen right up to the lash line, vitamin C, azelaic acid, a ' +
        'gentle retinoid used carefully — and stop rubbing your eyes',
      'Vascular: sleep 7–9 hours, and treat the allergy or congestion. An ' +
        'antihistamine or a steroid nasal spray genuinely resolves some people\'s ' +
        '\'dark circles\'. Less alcohol and salt',
      'Hollow: nothing topical reaches bone. It is filler or fat grafting, or ' +
        'accepting it — and accepting it is a real option, not a defeat',
      'Sleep with your head slightly raised for morning fluid bags',
      'A cold compress for five minutes. Real, and temporary',
      'Concealer. It is a legitimate answer and not a failure',
    ],
    doesNothing: [
      'Expensive eye creams for hollows or for bulging fat pads. No cream ' +
        'reaches bone structure or a herniated fat pad, and every one sold for it ' +
        'knows that',
      'Cucumber and tea bags, beyond the cold',
      '\'Eye massage\' for pigment',
      'More sleep, if your cause is pigment or structure. It helps the vascular ' +
        'kind and nothing else',
    ],
    timeline:
      'Vascular and fluid: days, once sleep and allergy are dealt with. ' +
      'Pigment: 3–6 months of consistent sunscreen and actives. Hollows: never, ' +
      'without a procedure.',
    doctor:
      'Sudden or one-sided swelling, painful swelling, or a lump. Bags with ' +
      'unexplained weight change and fatigue are worth a thyroid and kidney ' +
      'check. Cosmetically, tear-trough filler belongs to a dermatologist or ' +
      'oculoplastic surgeon — it is a technically difficult area and the wrong ' +
      'hands leave lumps and a bluish tint that can last years.',
  }),
]

const byKey = Object.fromEntries(SKIN_PROTOCOLS.map((p) => [p.key, p]))

export const getSkinProtocol = (key) => byKey[key] || null

// Which finding surfaces which protocol. An attribute rated moderate or worse
// gets its protocol; anything milder is left alone, because telling someone to
// treat "mild" is how an app turns a non-problem into a worry.
export const ATTR_PROTOCOL = {
  kp: 'kp',
  ingrownbody: 'ingrownhairs',
  underarmdark: 'underarmdark',
  discoloration: 'discoloration',
  tanlines: 'discoloration',
  bodyscars: 'marks',
  scars: 'marks',
  darkspots: 'marks',
  bodyacne: 'bodyacne',
  bodydryness: 'bodydry',
  rash: 'rash',
  hives: 'rash',
  scalpoil: 'scalpoily',
  scalpdry: 'scalpdry',
  dandruff: 'scalpoily',
  breakage: 'hairthinning',
  partwidth: 'hairthinning',
  thinningpattern: 'hairthinning',
  darkcircles: 'undereye',
  eyebags: 'undereye',
  puffiness: 'undereye',
}

// Protocols with no photo attribute behind them — guidance the user opts into
// reading rather than anything a scan surfaces.
//
// Currently empty. It stays as an export because the distinction is real and
// the Body screen's rendering path is worth keeping: a finding that no photo
// can produce needs somewhere to live that is not the scan results. Add a key
// here and it appears under its own opt-in section.
export const TEXT_ONLY_PROTOCOLS = []

// Everything worth showing for a set of scan findings, worst first.
// findings: { key -> { value, note } } from deepscan.js
export function protocolsFor(findings = {}) {
  const WORST = { significant: 3, moderate: 2, poor: 3, fair: 2, high: 2 }
  const seen = new Map()
  for (const [attr, proto] of Object.entries(ATTR_PROTOCOL)) {
    const rank = WORST[String(findings[attr]?.value || '').toLowerCase()]
    if (!rank) continue
    const p = byKey[proto]
    if (!p) continue
    const prev = seen.get(proto)
    if (!prev || rank > prev.rank) seen.set(proto, { ...p, rank, from: attr })
  }
  return [...seen.values()].sort((a, b) => b.rank - a.rank)
}
