# Training

> **Empty on purpose.** Structure and notes only.

## Architecture

Shared trunk, one small head per attribute:

```
input 224x224x3
  → backbone (MobileNetV3-Small or EfficientNet-Lite0, ImageNet-pretrained)
  → global pool
  → per-attribute heads:
       concern heads  (none/mild/moderate/significant)  ← ordinal
       quality heads  (poor/fair/good/excellent)        ← ordinal
       level heads    (low/medium/high)                 ← ordinal
       text heads     (curl pattern, flake type, ...)   ← plain categorical
```

Why shared: skin texture, lighting and pores get learned once instead of once
per attribute. Also one download instead of twenty.

## Ordinal loss — do not skip this

The scales are ordered. Standard cross-entropy treats `none → significant` as
exactly as wrong as `none → mild`, which is nonsense for this data.

Options:

- **CORAL / CORN** ordinal regression heads — principled, easy to add.
- **Cumulative-link (ordinal logistic)** output.
- Cheap fallback: regression to a scalar plus learned thresholds.

Any of these beats plain categorical here.

## Class imbalance

`none` will dominate every concern head — most people do not have most
conditions. Untreated, the model learns to answer `none` and scores well doing
it.

Mitigate with class-weighted loss or balanced sampling, and **never judge these
heads on accuracy** (see EVALUATE.md).

## Confidence, and the `unclear` contract

The app's existing rule is that an unreadable attribute returns `unclear`, never
a guess. A local model must honour that. Two ways:

1. Train `unclear` as a real class (needs it labelled — SCHEMA.md rule 4).
2. Calibrate confidence and threshold it.

If thresholding: raw softmax is **not** calibrated. Apply temperature scaling on
the validation set first, or "0.9 confident" means nothing and the threshold is
arbitrary.

## Schedule

Freeze the backbone, train heads for a few epochs, then unfreeze and fine-tune at
a low learning rate. Early-stop on the validation ordinal metric, not on loss.

## Reproducibility

Seed everything, log the config alongside the weights, and record which dataset
version produced which checkpoint. Six months from now, "which data was this
trained on" needs to have an answer.
