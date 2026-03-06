

## Problem

Currently, non-commerce sites (SaaS, portals, tools like `trustworthycheck.com`) are **completely exempt** from address, phone, and payment penalties via `skipContactPenalties`. You want all sites checked — but intelligently:

- If a site **claims** an address, verify it's consistent (not conflicting with country, TLD, etc.)
- Don't require a physical storefront for every business type, but if contact info is listed, it must be valid
- Payment method checks should apply universally

## Plan

**File: `supabase/functions/analyze-url/index.ts`**

1. **Remove `skipContactPenalties` variable** and all its gates (lines 2894, 2898, 2917, 2969)

2. **Replace address penalty logic** with context-aware checks:
   - **All sites**: If an address is listed but has suspicious patterns (country mismatch with TLD, conflicting location data), apply full penalty (-15)
   - **All sites**: If address is listed and is a PO Box, apply lighter penalty for e-commerce (-10), neutral for non-commerce
   - **E-commerce sites**: No address at all = -20. Non-commerce sites with no address = -5 (lighter, not zero)
   
3. **Replace phone penalty logic**:
   - **All sites**: If phone is listed but suspicious (wrong country code, premium number) = full penalty (-10)
   - **E-commerce**: No phone = -10. Non-commerce: No phone = -3 (lighter, not zero)

4. **Remove payment exemption**: Apply payment risk checks to all sites. SaaS sites accepting only crypto/wire is still a red flag.

5. **Update red flag filtering** (lines 2687-2696): Stop stripping address/phone/payment red flags from non-commerce sites. Only strip e-commerce-specific flags (shipping, refund/return policy).

6. **Bump cache version** to force re-analysis.

### What stays the same
- E-commerce-specific penalties (shipping info, return policy, pricing) remain gated to commerce sites only
- Well-known domains and established retail brands still skip all penalties
- The address consistency/country-mismatch checks that already exist remain intact

