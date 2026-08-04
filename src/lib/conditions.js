// Health-condition engine.
//
// One catalog that every module reads: Diet reads `eat` / `limit`, Workout
// reads `prefer` / `avoid` / `avoidIds`, nutrition.js reads `calorieFactor` and
// `proteinPerKg`, and the Body report reads the whole thing.
//
// Source of truth is profile.conditions = ['pcos', 'hypothyroid', …] (ticked in
// Onboarding / Profile). Free text in profile.medicalConditions and
// profile.medications is scanned too, so an account that only ever typed
// "PCOD + thyroid" still gets the right plan.
//
// Nothing here diagnoses anything. Every entry carries `redFlags` — the
// symptoms where the honest answer is "see a doctor", not "try this workout".

const C = (key, name, icon, o) => ({ key, name, icon, sexes: 'all', ...o })

export const CONDITIONS = [
  C('pcos', 'PCOS / PCOD', '🌸', {
    sexes: 'female',
    aliases: ['pcos', 'pcod', 'polycystic'],
    summary:
      'A hormonal condition where the ovaries make more androgens than usual. Around 7 in 10 women with it also have insulin resistance — which is why the food and training changes below work on the cause, not just the symptoms.',
    eat: [
      'Protein at every single meal (25–30 g) — it blunts the insulin spike more than anything else you can do',
      'Low-GI carbs only: oats, millets, brown rice, whole dal, sweet potato — never a naked carb, always pair it with protein or fat',
      '25–30 g fibre a day (vegetables, chia/flax, whole pulses) — it feeds the gut bacteria that clear excess oestrogen',
      'Omega-3: walnuts, flax, chia, fatty fish 2×/week — lowers the inflammation that drives androgens',
      'Spearmint tea, 2 cups a day — one of the few teas with real trial data on androgen symptoms',
      'Vitamin D, magnesium and B12 are commonly low in PCOS — worth testing before supplementing',
    ],
    limit: [
      'Sugary drinks, packaged juice and desserts — the single biggest insulin lever',
      'Refined flour: white bread, maida, biscuits, most packaged snacks',
      'Deep-fried and ultra-processed food — inflammatory, and it stacks onto insulin resistance',
      'Very long fasting windows if they leave you binge-hungry at night — that pattern backfires in PCOS',
    ],
    prefer: [
      'Strength training 3–4×/week — the strongest evidence of any exercise type for insulin sensitivity in PCOS',
      '150 min a week of moderate cardio (brisk walk, cycling, swimming)',
      'A 10–15 min walk after your biggest meal — it flattens the post-meal glucose curve',
      'Yoga or breath work 2×/week — cortisol is a genuine driver here, not a wellness cliché',
    ],
    avoid: [
      'Daily high-intensity training — chronic HIIT raises cortisol and can worsen symptoms. Cap it at 1–2 sessions a week',
      'Extreme calorie restriction — it stalls the metabolism and worsens cycle irregularity',
    ],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.6,
    carbNote: 'Aim for roughly 35–40% of calories from carbs, all low-GI, spread across meals rather than loaded into one.',
    expect:
      'Cycles typically respond after 3–6 months of consistency. Losing 5–10% of body weight is the number that restores ovulation for most women — that is 3–7 kg for most people, not 20.',
    redFlags: [
      'No period for 3+ months',
      'Sudden rapid hair loss from the scalp, or coarse new facial hair',
      'Dark velvety patches on the neck, armpits or groin — a visible sign of insulin resistance',
      'Trying to conceive for 12+ months (6 months if over 35)',
    ],
  }),

  C('hypothyroid', 'Hypothyroidism / Hashimoto’s', '🦋', {
    aliases: ['hypothyroid', 'hashimoto', 'underactive thyroid', 'thyroid', 'thyroxine', 'levothyroxine', 'eltroxin', 'thyronorm'],
    summary:
      'An underactive thyroid runs your whole metabolism slower — typically 5–10% fewer calories burned at rest than the standard formula predicts. Your targets here are already adjusted for that, so the numbers you see are honest ones.',
    eat: [
      'Selenium: 2 Brazil nuts a day, or eggs and fish — supports thyroid hormone conversion',
      'Zinc and iron — both commonly low, and both needed to convert T4 into active T3',
      'Enough iodine from iodised salt, dairy and fish — but do not megadose iodine supplements, they can worsen Hashimoto’s',
      'Protein at 1.4–1.6 g/kg — it protects muscle while you are in a deficit with a slower metabolism',
    ],
    limit: [
      'Calcium, iron and soy within 4 hours of your thyroid tablet — they block its absorption outright',
      'Coffee within 1 hour of the tablet, for the same reason',
      'Very large amounts of raw cruciferous vegetables — cooked is fine, normal portions are not a problem',
    ],
    prefer: [
      'Strength training 3×/week — the direct answer to the muscle loss a slow thyroid causes',
      'Daily walking, 7–8k steps — far better tolerated than long hard cardio when energy is low',
      'Consistent sleep and wake times — thyroid symptoms amplify on broken sleep',
    ],
    avoid: [
      'Judging yourself against "normal" loss rates — expect roughly 20–30% slower, and that is the condition, not your effort',
      'Training hard on days of genuine exhaustion — swap to a walk instead of pushing through',
    ],
    avoidIds: [],
    calorieFactor: 0.93,
    proteinPerKg: 1.5,
    expect:
      'Once your dose is stable, fat loss works normally — just slower. Retest TSH before concluding that a plateau is your fault.',
    redFlags: [
      'New swelling at the front of the neck',
      'Heart racing, tremor or unexplained weight loss — the dose may now be too high',
      'Exhaustion that has not improved after 3 months on treatment — the dose likely needs review',
    ],
  }),

  C('hyperthyroid', 'Hyperthyroidism / Graves’', '🔥', {
    aliases: ['hyperthyroid', 'graves', 'overactive thyroid', 'carbimazole', 'methimazole'],
    summary:
      'An overactive thyroid burns through energy and muscle fast. The priority right now is not fat loss — it is protecting muscle and heart, with your doctor steering.',
    eat: [
      'More calories than you would expect, not fewer — an overactive thyroid can raise burn by 10–20%',
      'Protein 1.6 g/kg to defend muscle mass',
      'Calcium and vitamin D — bone loss is a real risk while thyroid levels are high',
    ],
    limit: ['Caffeine and energy drinks — they stack onto an already fast heart rate', 'Iodine supplements and kelp'],
    prefer: [
      'Light resistance work and walking only, until your doctor confirms your levels are controlled',
      'Yoga, stretching and breath work',
    ],
    avoid: [
      'High-intensity cardio and heavy lifting until you have medical clearance — this is a heart-rate safety issue, not a preference',
    ],
    avoidIds: ['burpee', 'highknees', 'mountainclimber', 'treadmill'],
    calorieFactor: 1.1,
    proteinPerKg: 1.6,
    expect: 'This one is doctor-led. Training returns to normal once your levels are back in range.',
    redFlags: ['Resting heart rate over 100', 'Chest pain or palpitations', 'Severe shortness of breath', 'Rapid unexplained weight loss'],
  }),

  C('insulin', 'Insulin resistance / prediabetes', '📉', {
    aliases: ['insulin resistance', 'prediabetes', 'pre-diabetes', 'pre diabetic', 'metformin', 'hba1c'],
    summary:
      'Your cells respond sluggishly to insulin, so glucose stays high and fat storage stays switched on. It is also one of the most reversible things on this list — often within 3 months.',
    eat: [
      'Meal order genuinely matters: vegetables and protein first, carbs last. Same food, noticeably smaller glucose spike',
      'Every carb gets a partner — protein, fat or fibre. Never a plain carb on its own',
      'Vinegar or lemon with meals, and cinnamon — small effects, but free ones',
      'Soluble fibre: oats, beans, psyllium, apples',
    ],
    limit: [
      'Sugary drinks and juice — the fastest route to a spike there is',
      'White rice, maida and refined breakfast cereal eaten alone',
      'Late-night carb-heavy meals — insulin sensitivity is at its lowest then',
    ],
    prefer: [
      'A 10–15 min walk within 30 min of finishing a meal — one of the highest-return habits in this whole app',
      'Strength training 3×/week: muscle is where glucose goes to be stored',
      'Zone-2 cardio — the pace where you can still hold a conversation — 2–3×/week',
    ],
    avoid: ['Sitting for 2+ unbroken hours — stand and move every 45 min'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.5,
    carbNote: 'Keep carbs around 35–40% of calories, and make almost all of them low-GI and fibrous.',
    expect: 'HbA1c usually moves measurably within 3 months. A 7% body-weight loss is the classic threshold where prediabetes reverses.',
    redFlags: ['Constant thirst and frequent urination', 'Blurred vision', 'Tingling or numbness in hands or feet'],
  }),

  C('diabetes', 'Type 2 diabetes', '🩸', {
    aliases: ['type 2 diabetes', 'type ii diabetes', 'diabetes', 'diabetic', 'sugar problem', 'glimepiride', 'insulin injection'],
    summary:
      'Everything in this app still applies — with one extra rule: exercise and medication both lower blood sugar, so they need coordinating with your doctor.',
    eat: [
      'Consistent carb amounts at consistent times — steadiness beats perfection',
      'Vegetables and protein before carbs at every meal',
      'High fibre: whole pulses, millets, vegetables — around 30 g a day',
      'Never skip a meal if you are on sulfonylureas or insulin',
    ],
    limit: ['Sugary drinks, sweets and juice', 'Refined carbs eaten alone', 'Alcohol on an empty stomach — it can cause a delayed low'],
    prefer: ['Post-meal walks — the single most effective glucose habit', 'Strength training 2–3×/week', 'Steady moderate cardio'],
    avoid: [
      'Fasted intense exercise while on glucose-lowering medication, unless your doctor has cleared it',
      'Training without fast-acting sugar within reach',
    ],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.5,
    expect: 'Meaningful HbA1c improvement in 3 months. Real remission is possible for many people with sustained weight loss.',
    redFlags: [
      'Blood sugar under 70 mg/dL, shakiness, sweating or confusion — treat immediately with fast sugar',
      'A foot wound that is not healing',
      'Any change to your medication should come from your doctor, never from an app',
    ],
  }),

  C('hypertension', 'High blood pressure', '💓', {
    aliases: ['hypertension', 'high bp', 'high blood pressure', 'bp problem', 'amlodipine', 'telmisartan', 'losartan'],
    summary:
      'Blood pressure responds fast to sodium, potassium, weight and cardio — often within weeks. Two lifting habits matter here for safety.',
    eat: [
      'Sodium under 2 g a day (about 5 g of salt) — pickles, papad, packaged snacks and restaurant food are where it hides',
      'Potassium-rich food: banana, coconut water, spinach, beans, curd — unless your doctor limits potassium',
      'The DASH pattern: vegetables, fruit, whole grains, low-fat dairy, nuts',
      'Beetroot and leafy greens — nitrate-rich, a small but real effect',
    ],
    limit: ['Added salt at the table', 'Processed and restaurant food', 'Alcohol', 'Excess caffeine if it spikes you'],
    prefer: [
      'Cardio first: 30 min most days is the most proven lever you have',
      'Moderate-weight strength training with normal breathing',
      'Isometric holds like wall sits — surprisingly strong evidence for lowering blood pressure',
    ],
    avoid: [
      'Holding your breath under load (the Valsalva manoeuvre) — always exhale on the effort',
      'Maximal near-failure heavy lifts without clearance',
      'Sudden all-out sprints from cold',
    ],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Sodium and cardio changes can move readings within 2–4 weeks. Every 1 kg lost drops systolic by roughly 1 mmHg.',
    redFlags: ['A reading above 180/120', 'Severe headache with visual changes', 'Chest pain or one-sided weakness — emergency, call for help'],
  }),

  C('cholesterol', 'High cholesterol', '🫀', {
    aliases: ['cholesterol', 'high ldl', 'dyslipidemia', 'statin', 'atorvastatin', 'rosuvastatin'],
    summary: 'Diet composition moves this more than diet quantity. Soluble fibre and fat swaps do most of the work.',
    eat: [
      'Soluble fibre, 10 g+ a day: oats, barley, beans, psyllium, apples — it physically removes cholesterol',
      'Omega-3: fatty fish 2×/week, walnuts, flax',
      'A small handful of nuts daily, and olive oil in place of butter or ghee for cooking',
      'Soy protein and plant sterols if you tolerate them',
    ],
    limit: [
      'Trans fats — anything listing "partially hydrogenated", and most commercial bakery items',
      'Deep-fried food and reused cooking oil',
      'Heavy saturated fat: excess ghee, butter, coconut oil, fatty red meat',
    ],
    prefer: ['Cardio 150+ min a week — it raises HDL', 'Strength training 2×/week'],
    avoid: [],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Lipids typically improve measurably in 8–12 weeks. Retest before judging the plan.',
    redFlags: ['Chest tightness on exertion', 'New muscle pain if you take a statin — tell your doctor, do not just stop it'],
  }),

  C('fattyliver', 'Fatty liver (NAFLD)', '🫁', {
    aliases: ['fatty liver', 'nafld', 'nash', 'liver fat', 'grade 1 fatty liver'],
    summary:
      'There is no drug for this — weight loss is the treatment. Losing 7–10% of body weight clears liver fat for most people, and it is one of the fastest-responding things on this list.',
    eat: [
      'Coffee, 2–3 cups a day — one of the few things with genuine liver-protective data',
      'A Mediterranean pattern: olive oil, fish, vegetables, nuts, whole grains',
      'High protein, to protect muscle while you lose',
    ],
    limit: [
      'Fructose: sugary drinks, packaged juice, sweets — the liver turns it directly into fat',
      'Alcohol — ideally none at all while reversing this',
      'Refined carbs and fried food',
    ],
    prefer: ['Both cardio and strength — the combination beats either alone for liver fat', 'Daily steps'],
    avoid: ['Crash diets — rapid loss can transiently worsen liver inflammation. Steady 0.5–0.75 kg a week is the sweet spot'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.5,
    expect: 'Liver enzymes often improve within 3 months; scans usually show change by 6 months.',
    redFlags: ['Yellowing of the eyes or skin', 'Swelling of the abdomen or legs', 'Vomiting blood — emergency'],
  }),

  C('anemia', 'Anaemia / low iron', '🩸', {
    aliases: ['anemia', 'anaemia', 'low iron', 'low hemoglobin', 'low haemoglobin', 'ferritin', 'iron deficiency'],
    summary:
      'Low iron means less oxygen reaching muscle — so the breathlessness and dead legs you feel in workouts are physiology, not weakness.',
    eat: [
      'Iron sources: dal, rajma, spinach, dates, jaggery, ragi, liver, red meat',
      'Always add vitamin C to the same meal — lemon, tomato, amla, guava. It multiplies absorption several times over',
      'Cook in a cast-iron pan when you can',
      'Get B12 and folate checked too — they usually travel together',
    ],
    limit: ['Tea and coffee within an hour of meals — tannins block iron absorption significantly', 'Calcium supplements at the same time as iron'],
    prefer: ['Lower-intensity training until levels recover', 'Strength work at moderate load', 'Walking'],
    avoid: ['Pushing through dizziness or breathlessness', 'High-volume endurance training while ferritin is low'],
    avoidIds: ['burpee', 'highknees', 'mountainclimber'],
    calorieFactor: 1,
    proteinPerKg: 1.3,
    expect: 'Energy usually lifts in 4–6 weeks of treatment; stores take 3–6 months to refill. Do not stop supplements early.',
    redFlags: ['Fainting or chest pain', 'Periods heavy enough to soak through hourly', 'Black or bloody stools'],
  }),

  C('endometriosis', 'Endometriosis', '🌷', {
    sexes: 'female',
    aliases: ['endometriosis', 'endo', 'adenomyosis'],
    summary: 'An inflammatory, pain-driven condition. This plan flexes around flares instead of pretending they are not happening.',
    eat: [
      'An anti-inflammatory pattern: omega-3 fish, olive oil, colourful vegetables, turmeric',
      'High fibre — it helps clear excess oestrogen',
      'Magnesium-rich foods for cramping: pumpkin seeds, dark chocolate, greens',
    ],
    limit: ['Trans fats — linked to higher risk', 'Excess alcohol and caffeine', 'Very high red-meat intake'],
    prefer: [
      'Low-impact movement during flares: walking, swimming, gentle yoga',
      'Heat on the lower abdomen',
      'Pelvic-floor physiotherapy — genuinely underused for this',
    ],
    avoid: ['High-impact and heavy core work during a flare', 'Treating flare days as failed days — they are planned rest'],
    avoidIds: ['burpee', 'highknees', 'mountainclimber', 'plank', 'sideplank'],
    calorieFactor: 1,
    proteinPerKg: 1.3,
    expect: 'Diet changes tend to affect pain over 2–3 months. Nothing here replaces gynaecological treatment.',
    redFlags: ['Pain that stops you working or sleeping', 'Pain with bowel movements or urination', 'Trouble conceiving'],
  }),

  C('asthma', 'Asthma', '🌬️', {
    aliases: ['asthma', 'inhaler', 'salbutamol', 'wheezing'],
    summary: 'Exercise is protective for asthma long term — the trick is warming up long enough and keeping your reliever with you.',
    eat: ['Vitamin D and omega-3 — both associated with better control', 'Plenty of fruit and vegetables'],
    limit: ['Any food that triggers you personally', 'Sulphite-heavy processed food if you react to it'],
    prefer: [
      'A long warm-up — 10–15 min gradual, not 3. This alone prevents most exercise-induced attacks',
      'Swimming and indoor cycling — warm humid air is easiest on airways',
      'Interval-style efforts rather than long continuous hard cardio',
    ],
    avoid: ['Hard training in cold dry air or heavy pollution without covering your mouth', 'Training without your reliever inhaler nearby'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Fitness improvements usually reduce symptom frequency within 8–12 weeks.',
    redFlags: ['Needing your reliever more than twice a week', 'Waking at night breathless', 'The reliever not working — emergency'],
  }),

  C('knee', 'Knee pain / arthritis', '🦵', {
    aliases: ['knee pain', 'knee problem', 'arthritis', 'osteoarthritis', 'meniscus', 'acl', 'chondromalacia'],
    summary:
      'Strong quads and glutes are the treatment for most knee pain — rest is not. What changes is the exercise selection, not the effort.',
    eat: [
      'Enough protein to build the muscle that unloads the joint',
      'Omega-3 and colourful vegetables for inflammation',
      'Weight loss where relevant — each kg lost takes about 4 kg of load off the knee with every step',
    ],
    limit: ['Nothing specific beyond the general anti-inflammatory pattern'],
    prefer: [
      'Cycling, swimming, incline walking, elliptical — full effort, no impact',
      'Leg extensions and leg curls through a pain-free range',
      'Glute bridges and hip work — weak glutes are behind a huge share of knee pain',
      'Quarter and half squats before full-depth ones',
    ],
    avoid: [
      'Jumping, running on hard surfaces, and deep loaded lunges until strength catches up',
      'Any movement that produces sharp pain — dull effort is fine, sharp is a stop signal',
    ],
    avoidIds: ['burpee', 'highknees', 'lunge', 'dblunge', 'mountainclimber'],
    calorieFactor: 1,
    proteinPerKg: 1.4,
    expect: 'Structured strength work usually reduces knee pain noticeably in 6–12 weeks.',
    redFlags: ['The knee locking or giving way', 'Significant swelling', 'Pain at rest or at night'],
  }),

  C('backpain', 'Back pain / disc issue', '🦴', {
    aliases: ['back pain', 'lower back', 'slip disc', 'slipped disc', 'sciatica', 'spondylitis', 'spondylosis', 'herniated'],
    summary:
      'Core endurance and a proper hip hinge fix far more backs than rest does. But loaded spinal flexion — sit-ups, weighted toe touches — is genuinely the wrong tool here.',
    eat: ['Enough protein and vitamin D for muscle and bone', 'The general anti-inflammatory pattern'],
    limit: [],
    prefer: [
      'The McGill big three: curl-up, side plank, bird dog — endurance, not max reps',
      'Glute bridges and hip hinges (Romanian deadlifts, light weight, flat back)',
      'Walking daily — one of the best things there is for a sore back',
      'Cat–cow and hip-flexor stretches',
    ],
    avoid: [
      'Sit-ups, crunches and Russian twists — repeated loaded spinal flexion is exactly the load a disc dislikes',
      'Toe touches and heavy deadlifts with a rounded back',
      'Long unbroken sitting — get up every 45 min',
    ],
    avoidIds: ['burpee', 'mountainclimber', 'superman'],
    calorieFactor: 1,
    proteinPerKg: 1.3,
    expect: 'Most non-specific back pain improves substantially within 6–8 weeks of consistent core work.',
    redFlags: [
      'Numbness in the groin or saddle area, or loss of bladder or bowel control — go to emergency now',
      'Progressive leg weakness',
      'Pain that started after a fall or accident',
    ],
  }),

  C('ibs', 'IBS / sensitive gut', '🌀', {
    aliases: ['ibs', 'irritable bowel', 'bloating problem', 'sensitive stomach'],
    summary: 'Trigger foods are individual. The structure below finds yours instead of guessing at them.',
    eat: [
      'Regular meal timing — an erratic schedule is itself a trigger',
      'Soluble fibre (oats, psyllium, banana) rather than a wall of insoluble bran',
      'Peppermint oil capsules have real trial support for cramping',
      'Slow, chewed eating — a large share of bloating is swallowed air',
    ],
    limit: [
      'Run a structured low-FODMAP trial for 4 weeks, then reintroduce one group at a time — this is the evidence-based way to find your triggers',
      'Carbonated drinks, sugar alcohols (sorbitol, xylitol), excess caffeine',
      'Very large meals',
    ],
    prefer: ['Walking and yoga — the gut–brain axis is not woo, stress is a genuine trigger', 'Moderate steady exercise'],
    avoid: ['Very high-intensity work right after eating', 'Sudden large jumps in fibre intake'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'A low-FODMAP trial gives you an answer within 4 weeks. It is a diagnostic tool, not a permanent diet.',
    redFlags: ['Blood in stool', 'Unintentional weight loss', 'Symptoms starting after age 50', 'Waking at night with pain'],
  }),

  C('gerd', 'Acidity / GERD / reflux', '🔥', {
    aliases: ['gerd', 'acidity', 'acid reflux', 'heartburn', 'gastritis', 'pantoprazole', 'omeprazole'],
    summary: 'Meal timing and body position around meals matter more here than any single food does.',
    eat: ['Smaller, more frequent meals', 'Dinner at least 3 hours before lying down', 'Ginger, oats, bananas, non-citrus fruit'],
    limit: [
      'Late-night eating — the biggest lever by far',
      'Citrus, tomato, mint, chocolate, coffee, alcohol, very spicy or fatty food — test which ones actually affect you',
      'Tight waistbands after meals',
    ],
    prefer: ['Walking after meals', 'Upright exercise', 'Raising the head of the bed by about 15 cm if nights are bad'],
    avoid: ['Core work, inversions and lying-down exercises within 2 hours of eating', 'Heavy abdominal compression on a full stomach'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Timing and trigger changes usually help within 2 weeks.',
    redFlags: ['Difficulty swallowing', 'Vomiting blood, or black stools', 'Unexplained weight loss', 'Chest pain — always rule out the heart first'],
  }),

  C('gout', 'Gout / high uric acid', '🦶', {
    aliases: ['gout', 'uric acid', 'hyperuricemia', 'febuxostat', 'allopurinol'],
    summary: 'Hydration and avoiding crash diets matter as much as the purine list everyone hands you.',
    eat: ['3+ litres of water a day', 'Low-fat dairy — protective', 'Cherries: small but consistent evidence', 'Coffee and vitamin C'],
    limit: [
      'Organ meats, red meat, shellfish, sardines',
      'Beer and spirits — alcohol is a major trigger',
      'High-fructose drinks and sweets',
      'Crash dieting and fasting — rapid weight loss triggers attacks',
    ],
    prefer: ['Low-impact cardio', 'Strength training between flares'],
    avoid: ['Exercising a joint during an active flare', 'Rapid weight loss'],
    avoidIds: ['burpee', 'highknees', 'lunge', 'dblunge'],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Steady 0.5 kg/week loss reduces attacks. Fast loss increases them.',
    redFlags: ['A hot, red, exquisitely painful joint — get it checked, infection looks similar', 'Kidney stones'],
  }),

  C('kidney', 'Kidney disease', '🫘', {
    aliases: ['kidney disease', 'ckd', 'chronic kidney', 'creatinine high', 'dialysis', 'nephropathy'],
    summary:
      'This is the one condition where the app deliberately does not set your protein target. Kidney nutrition is individually prescribed — your nephrologist or renal dietitian sets those numbers, not an app.',
    eat: ['Exactly what your renal dietitian prescribes — protein, potassium, phosphorus and sodium limits are all individual'],
    limit: [
      'Sodium',
      'Potassium and phosphorus if your doctor has restricted them — that rules out many "healthy" foods like banana, coconut water and nuts',
      'Protein supplements and creatine, unless cleared',
    ],
    prefer: ['Walking and light-to-moderate resistance training — both are beneficial in CKD', 'Consistent gentle activity'],
    avoid: ['High-dose protein powders and pre-workouts', 'NSAID painkillers for muscle soreness', 'Dehydration'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: null,
    proteinNote: 'Your protein target has to come from your doctor, not from this app — so SAP does not show one for you.',
    expect: 'Blood-pressure and blood-sugar control are what protect kidney function long term.',
    redFlags: ['Swelling in the legs or face', 'A sharp drop in urine output', 'Persistent nausea', 'Breathlessness'],
  }),

  C('pregnancy', 'Pregnancy', '🤰', {
    sexes: 'female',
    aliases: ['pregnant', 'pregnancy', 'expecting', 'first trimester', 'second trimester', 'third trimester'],
    summary:
      'Fat loss is not a goal during pregnancy — the app switches to maintaining strength, comfort and steady nutrition. Everything below assumes you have your obstetrician’s clearance to exercise.',
    eat: [
      'No extra calories in the first trimester; about +340 in the second and +450 in the third',
      'Folic acid, iron, calcium, vitamin D and iodine — as prescribed',
      'Protein 1.4–1.6 g/kg',
      'Small frequent meals if nausea is an issue',
    ],
    limit: [
      'Raw or undercooked eggs, meat and fish; unpasteurised dairy; high-mercury fish',
      'Alcohol entirely; caffeine under 200 mg a day',
      'Any calorie deficit',
    ],
    prefer: [
      'Walking, swimming, stationary cycling, prenatal yoga',
      'Light-to-moderate strength training with normal breathing',
      'Pelvic floor training daily — the single best investment for your recovery later',
    ],
    avoid: [
      'Lying flat on your back for exercise after the first trimester',
      'Crunches, planks, and any core work that domes or cones your belly',
      'Contact sports, anything with a fall risk, hot yoga, scuba diving',
      'Holding your breath under load',
    ],
    avoidIds: ['burpee', 'mountainclimber', 'plank', 'sideplank', 'superman', 'highknees', 'glutebridge'],
    calorieFactor: 1,
    proteinPerKg: 1.5,
    noDeficit: true,
    expect: 'Strength and comfort are the wins here. Body-composition work resumes after delivery and clearance.',
    redFlags: [
      'Bleeding, fluid leaking, or regular painful contractions',
      'Severe headache, visual changes or sudden swelling — possible pre-eclampsia, seek care immediately',
      'Reduced fetal movement',
      'Chest pain, or calf pain and swelling',
    ],
  }),

  C('postpartum', 'Postpartum / after delivery', '🍼', {
    sexes: 'female',
    aliases: ['postpartum', 'post partum', 'after delivery', 'c-section', 'csection', 'new mother', 'breastfeeding', 'nursing'],
    summary:
      'The order matters more than the intensity: breathing and pelvic floor first, then deep core, then everything else. Skipping straight to crunches is how a gap in the abdominal wall gets worse instead of better.',
    eat: [
      'If breastfeeding, add roughly 400–500 kcal a day and do not run an aggressive deficit — milk supply drops before fat does',
      'Protein 1.6 g/kg, and plenty of fluid',
      'Keep taking your prenatal vitamin while nursing',
      'Iron if you lost blood during delivery',
    ],
    limit: ['Crash diets entirely', 'Alcohol if nursing'],
    prefer: [
      'Weeks 0–6: walking, diaphragmatic breathing and gentle pelvic-floor contractions only',
      'After medical clearance: deep core work (dead bugs, heel slides), then progressive strength',
      'Check for diastasis recti before starting any core programme — the Body report shows you how',
    ],
    avoid: [
      'Crunches, sit-ups, full planks and running until you have clearance and the abdominal gap has closed to under 2 finger-widths',
      'Comparing your timeline to anyone else’s',
    ],
    avoidIds: ['burpee', 'mountainclimber', 'plank', 'sideplank', 'highknees'],
    calorieFactor: 1,
    proteinPerKg: 1.6,
    expect: 'Core and pelvic-floor rehab takes 3–6 months of consistent work. It is worth every week of it.',
    redFlags: [
      'Leaking urine, heaviness or bulging in the pelvis — see a pelvic-floor physiotherapist. This is treatable and not something to live with',
      'Heavy bleeding returning, fever, or a painful red breast',
      'Persistent low mood, hopelessness or intrusive thoughts — postnatal depression is common and treatable. Please tell someone today',
    ],
  }),

  C('menopause', 'Menopause / perimenopause', '🌗', {
    sexes: 'female',
    aliases: ['menopause', 'perimenopause', 'peri-menopause', 'hot flashes', 'hot flushes', 'hrt'],
    summary:
      'Falling oestrogen accelerates muscle and bone loss and shifts fat storage toward the belly. Resistance training and protein are not optional here — they are the treatment.',
    eat: [
      'Protein 1.6 g/kg, spread across meals — muscle is less responsive now, so each meal needs a real dose',
      'Calcium 1000–1200 mg and vitamin D daily, for bone',
      'Soy, flax and legumes — the phytoestrogens may ease hot flushes',
      'Fibre and whole grains, for the cholesterol shift that comes with menopause',
    ],
    limit: ['Alcohol, caffeine and spicy food if they trigger your hot flushes', 'Added sugar — insulin sensitivity drops in this window'],
    prefer: [
      'Resistance training 3×/week — the single highest-value habit of this decade of your life',
      'Impact work (walking, light jumping, stair climbing) for bone density, if your joints allow',
      'Balance work',
      'A strict sleep routine — sleep disruption drives most of the other symptoms',
    ],
    avoid: ['Cardio-only programmes — they do nothing for the muscle and bone loss that is the actual problem'],
    avoidIds: [],
    calorieFactor: 0.96,
    proteinPerKg: 1.6,
    expect: 'Strength gains show in 8–12 weeks. Bone density takes 12+ months — which is exactly why you start now.',
    redFlags: ['Bleeding after 12 months of no periods — always get this checked', 'New severe mood changes', 'A fracture from a minor fall'],
  }),

  C('celiac', 'Coeliac disease', '🌾', {
    aliases: ['celiac', 'coeliac', 'gluten intolerance', 'gluten allergy'],
    summary: 'Strict, lifelong gluten avoidance, including cross-contamination. This is not a preference — it is intestinal damage.',
    eat: [
      'Naturally gluten-free grains: rice, millets, quinoa, buckwheat, amaranth',
      'Dal, beans, eggs, meat, fish, dairy, fruit, vegetables',
      'Check iron, B12, vitamin D and calcium — deficiencies are common after years of poor absorption',
    ],
    limit: ['Wheat, barley, rye — and anything sharing a fryer, toaster or serving spoon with them', 'Oats unless certified gluten-free'],
    prefer: ['Anything — no exercise restrictions once you are absorbing nutrients properly'],
    avoid: [],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.3,
    expect: 'Gut healing takes 6–24 months of strict avoidance. Energy usually improves much sooner.',
    redFlags: ['Ongoing symptoms despite strict avoidance — look for hidden sources with a dietitian'],
  }),

  C('lactose', 'Lactose intolerance', '🥛', {
    aliases: ['lactose', 'milk intolerance', 'dairy intolerance'],
    summary: 'Usually a dose problem rather than an all-or-nothing one — most people tolerate curd, hard cheese and small amounts of milk.',
    eat: [
      'Curd and yogurt — the live cultures pre-digest the lactose',
      'Hard aged cheeses',
      'Lactose-free milk, or fortified soy/almond milk',
      'Calcium from ragi, sesame, almonds, greens and fortified drinks',
    ],
    limit: ['Large glasses of plain milk', 'Cream-heavy dishes and milk-based sweets'],
    prefer: [],
    avoid: [],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Symptoms settle within days of finding your tolerance level.',
    redFlags: ['Symptoms with foods that contain no lactose — that points at something else, get it checked'],
  }),

  C('migraine', 'Migraine', '⚡', {
    aliases: ['migraine', 'chronic headache', 'sumatriptan'],
    summary: 'Regularity is the medicine: same sleep, same meals, same hydration. Skipped meals and poor sleep are the two most common triggers.',
    eat: [
      'Never skip meals — a drop in blood sugar is a classic trigger',
      'Magnesium-rich foods (pumpkin seeds, greens, dark chocolate) — magnesium has real preventive evidence',
      'Steady hydration',
      'Riboflavin (B2) and CoQ10 are worth discussing with your doctor',
    ],
    limit: [
      'Your personal triggers — aged cheese, red wine, MSG, nitrates and artificial sweeteners are the common ones',
      'Caffeine swings in either direction',
      'Alcohol',
    ],
    prefer: ['Regular moderate aerobic exercise — it genuinely reduces migraine frequency', 'Yoga and stress management', 'A fixed sleep schedule, weekends included'],
    avoid: ['Sudden very intense exertion from cold', 'Exercising dehydrated', 'Training during an attack'],
    avoidIds: [],
    calorieFactor: 1,
    proteinPerKg: 1.2,
    expect: 'Regular aerobic exercise reduces attack frequency over about 3 months.',
    redFlags: ['The worst headache of your life, sudden onset — emergency', 'Headache with fever and neck stiffness', 'New weakness, or speech or vision change'],
  }),
]

export const CONDITION_KEYS = CONDITIONS.map((c) => c.key)
const byKey = Object.fromEntries(CONDITIONS.map((c) => [c.key, c]))

export const getCondition = (key) => byKey[key] || null

// Conditions offered in the picker, filtered to the ones that apply.
export function pickableConditions(profile = {}) {
  const g = String(profile.gender || '').toLowerCase()
  return CONDITIONS.filter((c) => c.sexes === 'all' || c.sexes === g)
}

// Scan free text for anything the user typed instead of ticking. Longest alias
// wins so "high blood pressure" doesn't also fire a shorter unrelated match.
export function detectFromText(text = '') {
  const t = ' ' + String(text).toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').replace(/\s+/g, ' ') + ' '
  if (!t.trim()) return []
  const hits = []
  for (const c of CONDITIONS) {
    const found = [...(c.aliases || [])]
      .sort((a, b) => b.length - a.length)
      .some((a) => t.includes(' ' + a + ' ') || t.includes(' ' + a + 's ') || t.includes(' ' + a + ','))
    if (found) hits.push(c.key)
  }
  // "thyroid" on its own maps to hypothyroid (far more common). Drop that guess
  // when the text clearly meant the overactive kind.
  if (hits.includes('hyperthyroid')) return hits.filter((k) => k !== 'hypothyroid')
  return hits
}

// Everything that applies to this user: ticked boxes first, typed text second.
export function activeConditions(profile = {}) {
  const ticked = Array.isArray(profile.conditions) ? profile.conditions : []
  const typed = detectFromText(
    [profile.medicalConditions, profile.medications, profile.healthNotes].filter(Boolean).join(' , ')
  )
  return [...new Set([...ticked, ...typed])].map((k) => byKey[k]).filter(Boolean)
}

// Only the ones the user never ticked — the UI offers to add these.
export function suggestedConditions(profile = {}) {
  const ticked = new Set(Array.isArray(profile.conditions) ? profile.conditions : [])
  return detectFromText([profile.medicalConditions, profile.medications].filter(Boolean).join(' , '))
    .filter((k) => !ticked.has(k))
    .map((k) => byKey[k])
    .filter(Boolean)
}

// Merged diet rules across every active condition. Each line keeps the name of
// the condition it came from, so the UI can say *why* a rule is there.
export function dietGuidance(profile = {}) {
  const list = activeConditions(profile)
  const rows = (field) => {
    const seen = new Set()
    return list.flatMap((c) => (c[field] || []).map((text) => ({ text, from: c.name, icon: c.icon })))
      .filter((r) => (seen.has(r.text) ? false : seen.add(r.text)))
  }
  return {
    conditions: list,
    eat: rows('eat'),
    limit: rows('limit'),
    carbNotes: list.map((c) => c.carbNote).filter(Boolean),
    proteinNote: list.map((c) => c.proteinNote).filter(Boolean)[0] || null,
  }
}

// Merged training rules across every active condition.
export function workoutGuidance(profile = {}) {
  const list = activeConditions(profile)
  const rows = (field) => {
    const seen = new Set()
    return list.flatMap((c) => (c[field] || []).map((text) => ({ text, from: c.name, icon: c.icon })))
      .filter((r) => (seen.has(r.text) ? false : seen.add(r.text)))
  }
  return {
    conditions: list,
    prefer: rows('prefer'),
    avoid: rows('avoid'),
    redFlags: rows('redFlags'),
    avoidIds: new Set(list.flatMap((c) => c.avoidIds || [])),
  }
}

// Multiplier on the calorie formula — a slow thyroid really does burn less.
// Multiple conditions compound, but the result is clamped so it stays sane.
export function calorieFactor(profile = {}) {
  const f = activeConditions(profile).reduce((acc, c) => acc * (c.calorieFactor || 1), 1)
  return Math.min(1.15, Math.max(0.88, f))
}

// The highest protein target any active condition calls for. Returns null when
// a condition (kidney disease) says the app must not set one at all, and
// undefined when no condition has an opinion.
export function proteinOverride(profile = {}) {
  const list = activeConditions(profile)
  if (list.some((c) => c.proteinPerKg === null)) return null
  const vals = list.map((c) => c.proteinPerKg).filter((v) => typeof v === 'number')
  return vals.length ? Math.max(...vals) : undefined
}

// The condition (if any) that means "do not run a calorie deficit right now".
export function deficitBlocked(profile = {}) {
  return activeConditions(profile).find((c) => c.noDeficit) || null
}

// Conditions that make fat loss genuinely slower — used to keep the goal
// timeline honest instead of promising a rate the body will not deliver.
const SLOWER = { hypothyroid: 0.75, pcos: 0.8, insulin: 0.9, menopause: 0.85, postpartum: 0.8 }

export function lossRateFactor(profile = {}) {
  return activeConditions(profile).reduce((acc, c) => Math.min(acc, SLOWER[c.key] ?? 1), 1)
}

export function lossRateNote(profile = {}) {
  const hit = activeConditions(profile).filter((c) => SLOWER[c.key])
  if (!hit.length) return null
  const pct = Math.round((1 - lossRateFactor(profile)) * 100)
  return `${hit.map((c) => c.name).join(' and ')} slows fat loss by roughly ${pct}% compared with the standard formula. Your timeline already accounts for that — so a slower week is the condition, not a failure.`
}
