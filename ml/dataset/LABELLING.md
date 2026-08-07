# Labelling rubric

> **Empty on purpose.** Structure and notes only.

## Why this file has to exist before you label anything

A model is a compression of its labels. If "moderate" means something slightly
different to you on a Tuesday than it did on Monday, the model learns that
inconsistency and its ceiling is set by your noise, not by the architecture. No
amount of training fixes an unreliable rubric.

So: write the rubric, label a calibration set, measure agreement, *then* label
in bulk.

---

## Per-attribute rubric

For each attribute, fill in what each level concretely means. Anchor every level
to something countable or visible — never to a feeling.

### Template

```
## <attribute key from deepscan.js>

Region:        <which crop this is rated on>
Rated on:      <what you are actually looking at>

none:          <concrete description — ideally a count or an area>
mild:          <...>
moderate:      <...>
significant:   <...>
unclear:       <the conditions under which the honest answer is "cannot tell">

Do NOT confuse with: <the lookalike, and how to tell them apart>
Reference images:    <paths to 2-3 canonical examples per level>
```

### Worked example of the level of specificity to aim for

```
## pimples

Region:        face_cheek, face_forehead, face_chin (rate each separately)
Rated on:      inflamed lesions only — papules and pustules. Not blackheads,
               not closed comedones, not post-inflammatory marks.

none:          0 inflamed lesions
mild:          1–5
moderate:      6–20
significant:   more than 20, OR any nodule/cyst regardless of count

unclear:       makeup visible, region out of frame, or blur such that a 2 mm
               lesion would not resolve

Do NOT confuse with: post-inflammatory hyperpigmentation (flat, no elevation —
               that is `darkspots`), or keratosis pilaris (rough, follicular,
               not inflamed — that is `kp`).
```

Notice the count anchors. "Some spots" is not a rubric; "6–20 inflamed lesions"
is. Notice also that the boundary against the lookalike is written down — most
label noise in skin data comes from confusable classes, not from hard cases.

---

## Calibration protocol

1. Assemble 50 crops spanning the full range for one attribute.
2. Two or more raters label them **independently**, without discussion.
3. Compute agreement — **quadratic weighted Cohen's kappa**, because the scale
   is ordinal and a none/mild disagreement is genuinely less bad than a
   none/significant one.
4. Interpretation:
   - **κ > 0.8** — go ahead and label in bulk.
   - **κ 0.6–0.8** — usable, but expect the model to plateau around this level.
     Tighten the two levels that disagree most first.
   - **κ < 0.6** — stop. The rubric is the problem, not the raters. Rewrite the
     level definitions and re-run. Labelling 5,000 images against a κ=0.4 rubric
     is weeks of work that produces a model that cannot beat κ=0.4.
5. Re-calibrate every few thousand labels. Rater drift is real and gradual.

## Single-rater reality

If it is only ever you labelling, you cannot compute inter-rater agreement — so
substitute **intra-rater**: re-label 50 crops you already did, at least two weeks
later, with the original labels hidden. Agreement with your past self is the
honest ceiling on your data quality.

## Consent, for anything you photograph yourself

Record per subject, not per photo, and store it with the dataset rather than in
your memory:

- who they are, and that they are an adult
- what they agreed the images would be used for — training specifically, not a
  general "for the app"
- whether the images may persist after the model is trained
- how they withdraw, and what happens to a trained model if they do

That last one is the awkward question everyone skips. Decide the answer before
you collect, not after someone asks.
