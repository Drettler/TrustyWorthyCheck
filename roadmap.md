# Roadmap

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
