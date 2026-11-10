# Roadmap

- [x] Reproduce Sundance Living official and impersonator scores and identify the shared penalty path.
- [x] Distinguish official stores that no longer accept online orders from impersonating storefronts without whitelisting domains.
- [x] Add regression and live calibration coverage, then deploy and verify both verdicts.
- [x] Run a broad live calibration matrix across varied site types and URL forms.
- [x] Test Etsy and multiple dropshipping platforms without treating dropshipping alone as fraud.
- [x] Investigate the gov.uk false positive and any scoring failures without adding site-specific exceptions.
- [x] Report live pass/fail/error results and remaining coverage limits.
- [x] Expand calibration with versioned live-site and synthetic edge-case coverage.
- [x] Add protocol, IDN, redirect, storefront, marketplace, and legitimacy regression tests.
- [x] Make calibration results resilient to stale cache, rate limits, and changing third-party sites.
- [x] Validate and deploy the tuned scoring and calibration workflow.
- [x] Add BBB Scam Tracker and review lookup using exact-domain candidates.
- [x] Replace partial threat-feed domain matching and add regression tests.
- [x] Verify negative reviews and lookalike domains do not change qualified-store scores.
- [x] Deploy and validate the reported scam domain plus a known-good retailer.
- [ ] Allow verified BBB Scam Tracker reports to affect scoring — blocked pending approved official BBB API access and permission for derived public scores.
- [x] Inspect the current scan, result-card, and share-text flow and record regression coverage for the November 8 test table.
- [x] Distinguish confirmed nonexistent addresses and information-limited results without changing threat, merchant, or dormant-store behavior.
- [x] Generate every share option from the completed visible result and clear stale results on each new submission.
- [x] Run analyzer tests and all requested live cases through the normal preview form, including the sequential Target/phishing check; leave changes unpublished.

## Final validation — November 10, 2026

- All 63 analyzer regression tests passed.
- Normal preview form: Sundance Living 75/Use Caution; Sundance Outlet USA 0/High Risk; Simple Modern 100/Likely Legit; USA Simple Modern 45/High Risk; Target 100/Likely Legit; full phishing test URL 5/High Risk. Historical engine scores unchanged.
- Reserved .invalid: Website not found, 0/6 checks, no displayed score, scam warning, or cashback. Example.com: Limited information, VirusTotal only (1/6), no displayed score or cashback.
- All five share/copy options produced identical text matching verdict, submitted URL, confidence, and card score visibility. External social publication was not performed.
- Target followed by the full phishing URL in one tab: old result cleared during loading; phishing warning retained the full path. Simulated 503 and delayed/out-of-order responses left no stale result.
- Homepage submit, popular Target link, checker reset, and non-web protocol rejection passed. No browser page errors during the eight-case live matrix.
- At 390×844, homepage submit was above the fold with a 56px tap target; result messages and report submit fit. At 1280×1800, report submit also fit. The existing mobile extension prompt partially clips its secondary label and overlays lower actions; dismissal remains available. No design changes made.
- Public checker, domain page, threat feed, recent reports, cashback, protection, About, and calibration pages loaded without horizontal page overflow. Threat-feed refresh returned HTTP 200 and Last Updated appeared.
- Coverage limits: no purchase, paid PDF download, authenticated flow, actual community-report submission, external affiliate transaction, or automatic scheduler execution was performed. Diagnostic build logs were unavailable in this sandbox; the live preview rendered successfully.
- Website remains unpublished. Verified BBB scoring still awaits approved official BBB API access.
