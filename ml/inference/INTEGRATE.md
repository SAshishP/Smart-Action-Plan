# App integration

> **Empty on purpose.** Structure and notes only.

## The contract

`predict.js` should expose one function returning the shape `deepscan.js`
already consumes, so a local model drops in without the UI changing at all:

```js
// ml/inference/predict.js  (not yet written)
//
// dataUrl: a photo already in the profile
// slot:    which of the 12 photo slots it came from
//
// returns: { attrKey: { value, note, confidence, rated } }
//   value      — a word from the SAME vocabulary as deepscan.js
//   rated      — false when below the confidence threshold; value is 'unclear'
//   confidence — calibrated, not raw softmax
export async function predictLocal(dataUrl, slot) {}
```

Matching the existing shape matters: `Meter`, `protocolsFor()` and the Body
screen already render it. Diverge and you are maintaining a translation layer
that will drift.

## Where it hooks in

In `deepscan.js`, try local first and fall back:

```
runDeepScan()
  → predictLocal()        ← local model, for the attributes it covers
  → askAI()               ← hosted, for everything else (current behaviour)
  → merge
```

Decide the merge rule early: when both produce a value for the same attribute,
which wins? Suggestion — whichever is more confident, but log the
disagreements. Systematic disagreement means one of them is wrong, and you want
to know which before users do.

## Threading

Run inference in a **Web Worker**. On the main thread a 10 MB model blocks the
UI for seconds and the app simply looks broken.

## Rules the local path must not break

- **`unclear` stays honest.** Below threshold returns `unclear`, never a guess.
  This is the single property that makes the deep scan worth trusting.
- **Bad photos stay flagged.** `photo-quality.js` already grades the input; a
  local model must not confidently rate a photo the gate called poor.
- **No new claims.** If a head is not reliable enough to ship, drop the head.
  Do not ship it with a caveat — a caveat under a confident-looking number does
  not get read.

## Rollout

Put it behind the same owner gate as the Lab (`src/lib/owner.js`) first. Compare
local against hosted on your own photos for a while before anyone else sees it.
