# Evaluation

> **Empty on purpose.** Structure and notes only.

## Accuracy is the wrong metric here

With `none` at 80% of a concern head, a model that always answers `none` scores
80% and is worthless. Report instead:

- **Quadratic weighted kappa** — the primary metric. Ordinal-aware, and directly
  comparable to the inter-rater kappa from LABELLING.md. That comparison is the
  meaningful one: a model at k=0.70 against raters who agree at k=0.72 has
  essentially learned the task, and no architecture change will beat the labels.
- **Mean absolute error in levels** — how many steps off, on average.
- **Full confusion matrix per head** — where it fails matters more than how often.
- **Adjacent accuracy** — within one level. Often the honest headline number.

## Per-tone breakdown — non-negotiable

Report every metric split by skin tone. A model at 0.75 overall that scores 0.82
on light skin and 0.51 on dark skin is not a 0.75 model. It is a model that
fails some users badly while the average hides it.

If the gap is large, fix it before shipping: rebalance, collect more, or ship
only the heads that hold up across tones.

## Failure analysis

Pull the worst predictions and actually look at them. Recurring causes, roughly
in order of likelihood:

- label noise (the rubric was ambiguous — fix the rubric, relabel)
- the crop missed the region (a localisation problem, not a classification one)
- lighting the training set never contained
- a genuinely confusable lookalike (KP vs body acne, PIH vs an active lesion)

Only the last is a modelling problem. The first three are data problems, and
reaching for a bigger model to fix a data problem is the most expensive mistake
available.

## Before shipping any head

- [ ] kappa within reach of human inter-rater kappa
- [ ] per-tone gap acceptable, and written down
- [ ] confidence calibrated (temperature scaling), `unclear` threshold set
- [ ] tested on images that went through the app's real compression path
- [ ] tested on deliberately bad photos — the quality gate flags them, and the
      model must not confidently rate them anyway
