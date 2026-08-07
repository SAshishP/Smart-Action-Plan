# SAP · ML groundwork

Scaffold for training SAP's own image model, so the app stops depending on a
hosted provider for the things it wants to rate.

**Nothing here is implemented.** Every file is structure plus notes on what goes
in it. Fill them in when you're ready.

---

## Read this before writing any code

The bottleneck is not the model. It is the labelled data, and being honest about
that up front will save you months.

A model that outputs a severity rating is a **supervised** model: it learns the
mapping from image to rating by being shown thousands of examples where a human
already assigned the rating. So the real question for every attribute is not
"can a CNN learn this" — it usually can — but **"where do 2,000 labelled
examples come from, and who was qualified to label them?"**

That question has very different answers depending on the attribute:

### Tier 1 — public data exists, start here

These have real public dermatology datasets, and are the ones worth building
first because you can get a working model without collecting anything yourself:

| Attribute | Dataset options |
|---|---|
| Acne severity | ACNE04, plus several Kaggle acne-grading sets |
| Skin lesions / pigmentation | HAM10000, ISIC Archive, PAD-UFES-20, Fitzpatrick17k |
| General skin condition classes | DermNet, SD-198 |
| Face landmarks (for locating regions) | 300W, WFLW, or MediaPipe FaceMesh off the shelf |
| Body pose / keypoints | COCO keypoints, or MediaPipe Pose off the shelf |

Fitzpatrick17k matters specifically because it is labelled by skin tone, and
dermatology models are notoriously worse on darker skin because the training
sets were overwhelmingly light. If you train on data that does not span tones,
your model will fail exactly the users SAP's WHO-Asian-cutoff work was written
to serve properly. Check per-tone accuracy separately, always.

### Tier 2 — you'd be collecting your own

Underarm darkness, KP, ingrown hairs, tan lines, scalp oiliness, hair density.
No public labelled set exists at useful size. Feasible, but you're the one
building the dataset, and you need a written labelling rubric before you start —
see `dataset/LABELLING.md`.

### Tier 3 — the honest blocker

Intimate-area attributes. There is no public labelled dataset, and there is no
route to one that does not involve accumulating a corpus of intimate images.
Once you hold that corpus you are subject to a different legal regime than the
rest of this app: data-protection law treats it as special-category data, breach
notification obligations change, and "it's just my test account" stops being the
relevant question the moment anyone else installs the app.

This is why the region-measurement tool (`src/lib/regionmetrics.js`) exists and
is owner-gated. It gets you objective, honest numbers — lightness, redness,
texture, hair coverage, tracked over time — for **any** region, with no model, no
dataset, and no corpus, because you supply the localisation by drawing a box.
For tracking whether something is changing, it does the actual job. Consider
whether it is already enough before starting down the Tier 3 road.

---

## Recommended build order

1. **Localisation before classification.** A classifier fed a whole photo learns
   the background. Use MediaPipe Pose/FaceMesh (free, runs in-browser, no
   training) to crop consistent regions first. This single step is worth more
   than any architecture choice.
2. **Start with one Tier 1 attribute end to end** — acne severity is the obvious
   one. Get data → train → export → run in the browser working before adding a
   second. A pipeline that ships one attribute beats six half-trained heads.
3. **Multi-head, shared backbone.** One MobileNetV3 or EfficientNet-Lite trunk
   with a small head per attribute. Far smaller than one model each, and the
   trunk learns skin texture once.
4. **Export to TFJS or ONNX Runtime Web**, quantised int8. Target under 10 MB
   total or mobile users will not wait for it.
5. **Run it in a Web Worker.** Inference on the main thread freezes the UI.

## Where it plugs into the app

`inference/` is the only directory the app imports. Keep the boundary clean so
the app never depends on training code:

```
deepscan.js  →  callLocalModel()  →  ml/inference/predict.js  →  worker  →  model
                      ↓ falls back to
                 askAI() (hosted, current behaviour)
```

Give every prediction a confidence, and hold the same rule the current scan
holds: **below the threshold it returns `unclear`, not a guess.** That rule is
the reason the deep scan is trustworthy, and a local model must not be the thing
that breaks it.

## Layout

```
ml/
├── README.md              ← this file
├── dataset/
│   ├── SCHEMA.md          ← annotation format, one row per labelled crop
│   ├── LABELLING.md       ← the rubric, and inter-rater agreement protocol
│   └── SOURCES.md         ← dataset licences and what each permits
├── training/
│   ├── PREPROCESS.md      ← crop, align, augment, tone-balance
│   ├── TRAIN.md           ← architecture, heads, loss, schedule
│   └── EVALUATE.md        ← metrics, per-tone breakdown, failure analysis
└── inference/
    ├── EXPORT.md          ← quantise and export for the browser
    └── INTEGRATE.md       ← the app-side contract
```
