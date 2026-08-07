# Export for the browser

> **Empty on purpose.** Structure and notes only.

## Target

- **Format:** TensorFlow.js graph model, or ONNX for onnxruntime-web
- **Quantisation:** int8. Fall back to float16 if int8 costs too much accuracy —
  measure it, do not assume.
- **Budget:** under 10 MB total. Mobile users on the PWA will not wait longer,
  and the service worker caches it, so it also becomes install size.

## Steps

1. Export the trained graph.
2. Quantise.
3. **Re-evaluate after quantising.** Accuracy drops; the only question is how
   much. A head that loses a lot should ship at float16, or not ship.
4. Verify the exported model against a fixed batch — the same inputs must give
   the same outputs as the training-time model, within tolerance. This catches
   preprocessing mismatches immediately, which is the failure that otherwise
   costs a day.

## Serving

Ship as a static asset. Note that the app's service worker (`src/sw.js`)
precaches build output, so a 10 MB model becomes part of the install unless it
is deliberately excluded and fetched on demand. For an optional feature,
lazy-fetch on first use and cache it then — do not make every user download it.

Version the filename (`skin-v1.onnx`). A cached old model and updated app code
disagreeing is a bad debugging afternoon.
