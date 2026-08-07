# Annotation schema

> **Empty on purpose.** Structure and notes only — fill in when you start.

## What one row is

One row = **one labelled crop of one region**, not one photo. A photo of a back
with acne produces several rows if you crop several regions. This is what lets
one photo train more than one head.

## Proposed record shape

```jsonc
{
  // --- identity -------------------------------------------------------
  "id": "",              // stable uuid. Never derive it from a filename.
  "subject_id": "",      // WHO this is. Critical — see the split note below.
  "captured_at": "",     // ISO date. Lets you hold out by time as well.

  // --- the image ------------------------------------------------------
  "image_path": "",
  "region": "",          // face_cheek | back_upper | arm_outer | scalp_part | ...
  "bbox": [0, 0, 0, 0],  // normalised x,y,w,h of the crop inside the source
  "landmark_source": "", // mediapipe | manual — record it, they behave differently

  // --- capture conditions --------------------------------------------
  // Record these. When the model fails, this is how you find out it learned
  // "photos taken under yellow light" instead of the actual attribute.
  "lighting": "",        // daylight_indirect | overhead | mixed | flash
  "device": "",
  "resolution": [0, 0],

  // --- the labels -----------------------------------------------------
  "labels": {
    // "attribute": { "value": ..., "rater": "", "confidence": 0.0 }
    // Values must match the vocabularies in src/lib/deepscan.js exactly,
    // or the model output cannot drop into the existing UI without a
    // translation layer that will eventually drift.
  },

  // --- provenance -----------------------------------------------------
  "source": "",          // public dataset name, or "own"
  "licence": "",         // REQUIRED for public data. See SOURCES.md.
  "consent": ""          // REQUIRED for own data. Who agreed to what.
}
```

## Rules worth writing down now

**1. Split by `subject_id`, never randomly.**
The single most common way a dermatology model reports 95% and then fails in
production: two crops of the same person land in both train and test, so the
model gets credit for recognising the person rather than the condition. Group
split, always.

**2. Record the capture conditions even though it feels like overkill.**
When accuracy collapses on real users, the answer is almost always a spurious
correlation with lighting or device. Without these fields you cannot check.

**3. Keep the label vocabularies identical to `deepscan.js`.**
`none | mild | moderate | significant` for concerns, `poor | fair | good |
excellent` for qualities. Diverging means writing a mapping layer, and mapping
layers rot.

**4. Store `unclear` as a real label, not a missing value.**
"A rater looked and could not tell" is different information from "nobody
labelled this", and the model should be able to learn the first one. It is also
what lets local inference honour the app's existing rule that an unreadable
attribute returns `unclear` rather than a guess.

**5. Ordinal, not categorical.**
`none < mild < moderate < significant` is an ordered scale. Training it as
4-way categorical throws that away and treats confusing "none" with
"significant" as no worse than confusing it with "mild". Use an ordinal loss —
see `training/TRAIN.md`.
