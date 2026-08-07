# Dataset sources & licences

> **Empty on purpose.** Structure and notes only.

## Fill one block per dataset before downloading it

```
## <name>

URL:
Size:                <images, and how many carry the label you need>
Labels available:    <the actual label set, not a summary>
Skin tones covered:  <if unknown, write UNKNOWN — that is the useful answer>
Licence:
Commercial use:      yes / no / unclear
Redistribution:      yes / no
Attribution needed:
Notes:
```

## The licence question that catches people

Several well-known dermatology datasets are **research-only** or
**non-commercial**. SAP is heading for an app store, which is commercial
distribution — so a model trained on a non-commercial dataset cannot ship, even
though the weights look like your own work. Model weights are generally treated
as a derivative of the training data.

Check this *before* training, not after. Discovering it afterwards means
retraining from scratch on a different corpus.

## Candidates worth evaluating first

| Dataset | Useful for | Licence — VERIFY, do not trust this table |
|---|---|---|
| HAM10000 | pigmented lesions | commonly CC BY-NC (non-commercial) |
| ISIC Archive | lesions, large | varies per collection |
| Fitzpatrick17k | conditions across skin tones | check |
| PAD-UFES-20 | lesions, clinical photos | check |
| DermNet / SD-198 | broad condition classes | check |
| ACNE04 | acne severity grading | check |

The licence column is a starting point for your own reading, not an answer.

## Skin-tone coverage

Record it per dataset, and total it across your final corpus. Published
dermatology sets skew heavily light, and a model trained on them measurably
underperforms on darker skin. SAP already went out of its way to use WHO Asian
BMI cut-offs rather than defaults — shipping a skin model that is worse for the
same users would undo that. Fitzpatrick17k exists specifically to let you check.
