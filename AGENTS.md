# Checker architecture

- Keep result presentation and sharing in `src/lib/check-result.ts` so verdict wording, confidence, and score visibility cannot diverge.
- Treat confirmed hostname nonexistence and reputation-only evidence as explicit outcomes, separate from scoring thresholds; independent threats retain their warnings.
- Use a monotonically increasing submission identifier in the checker so delayed responses cannot overwrite the latest scan.