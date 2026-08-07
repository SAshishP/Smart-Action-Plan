# Preprocessing

> **Empty on purpose.** Structure and notes only.

## Pipeline order

```
source photo
  → EXIF orientation fix        ← do this first or every side crop is rotated
  → landmark detection          ← MediaPipe FaceMesh / Pose
  → region crop (fixed rules)
  → resize to model input
  → colour normalisation
  → augmentation (train split only)
  → tensor
```

## 1. Orientation

Apply EXIF rotation before anything else. `src/lib/photo-quality.js` already
handles this for the in-app path (`imageOrientation: 'from-image'`) — the same
bug silently rotates training crops if you skip it here.

## 2. Landmark-driven crops

Define each region as a fixed geometric rule relative to landmarks, then write
it down. For example:

```
face_cheek := square, side = 0.35 x inter-ocular distance,
              centred 0.5 x IOD below and 0.6 x IOD lateral to the eye centre
```

Why bother: consistent framing is what lets the model compare across people. A
hand-drawn crop varies in scale, and the model spends capacity undoing that
instead of learning the attribute.

## 3. Colour normalisation — the decision that matters most here

Skin images are dominated by illumination. Two options, and they are not
equivalent:

- **Grey-world / shades-of-grey white balance** — cheap, removes most colour
  cast, standard in dermatology preprocessing.
- **Normalise nothing, and augment colour hard instead** — keeps the real tone
  information a pigmentation head may need.

The trap: aggressive colour normalisation destroys exactly the signal a
pigmentation head needs. Pick per head, not globally. Pigmentation heads want
tone preserved; texture heads do not care.

Whatever you choose, **the same transform must run at inference.** A mismatch
between training and inference preprocessing is the most common cause of "great
in the notebook, useless in the app".

## 4. Augmentation

Reasonable: horizontal flip, small rotation (plus or minus 10 degrees),
brightness and contrast jitter, mild blur, JPEG compression artefacts.

Compression augmentation is worth calling out. The app compresses to 1280px at
q0.72 for detail slots (`src/lib/img.js`). Train on pristine images, deploy on
compressed ones, and accuracy drops for no visible reason. Augment with the
compression the app actually applies.

Avoid: vertical flip (bodies have an up), heavy colour shift on pigmentation
heads, and anything that changes the thing being rated.

## 5. Tone balancing

Check the tone distribution of the training split. If it skews, use weighted
sampling rather than discarding data. Then evaluate per tone regardless — see
EVALUATE.md.
