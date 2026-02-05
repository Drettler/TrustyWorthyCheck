# TrustworthyCheck URL Validation & Scoring Methodology

**Version:** 2026-02-05  
**Last Updated:** February 5, 2026

---

## Overview

TrustworthyCheck analyzes websites using a comprehensive multi-source approach that evaluates **35+ indicators** across 7 main categories. The system starts at a **base score of 100** and applies penalties for red flags and bonuses for positive signals.

---

## Scoring Categories & Weights

| Category | Weight | Max Penalty |
|----------|--------|-------------|
| Domain & Identity | 20% | -70 points |
| Security | 20% | -65 points |
| Reputation | 20% | -60+ points |
| Business Transparency | 15% | -82 points |
| Payment Safety | 15% | -45 points |
| Behavioral Red Flags | 10% | -40 points |
| Bonuses | N/A | +55 points |

---

## 1. DOMAIN & IDENTITY (20%)

### Penalties

| Check | Penalty | Condition |
|-------|---------|-----------|
| New Domain (< 6 months) | **-20** | Domain registered within last 180 days |
| WHOIS Privacy + New Domain | **-15** | Privacy protection enabled AND domain < 1 year old |
| Country Mismatch | **-15** | Claimed location differs from technical indicators |
| Typosquatting Detection | **-25** | Domain mimics known brands (e.g., amaz0n, paypa1) |
| Suspicious TLD | **-10** | Uses commonly abused extensions (.xyz, .top, .work, .click, .link, .info, .biz, .online, .site, .club, .vip, .win, .review) |

### Multiplier
| Check | Effect |
|-------|--------|
| Domain < 1 year old | Score × 0.85 |

### Data Sources
- WHOIS lookup (whoisjson.com API, RDAP fallback)
- Domain registration date analysis
- Registrar information

---

## 2. SECURITY (20%)

### Penalties

| Check | Penalty | Condition |
|-------|---------|-----------|
| No HTTPS | **-40** | Website doesn't support HTTPS connection |
| Invalid SSL/TLS | **-25** | Certificate issues, TLS misconfiguration |

### Positive Signals
| Check | Bonus | Condition |
|-------|-------|-----------|
| HTTP → HTTPS Redirect | +0 (neutral) | Properly redirects insecure requests |

### Data Sources
- Live HTTPS connection testing
- TLS handshake verification
- HTTP redirect behavior analysis

---

## 3. REPUTATION (20%)

### Community Reports (User-Submitted)

| Report Count | Penalty | Score Cap |
|--------------|---------|-----------|
| 1 report | **-5** | None |
| 5 reports | **-25** | Max 40 |
| 10+ reports | **-50** | Max 25 |

### Threat Intelligence Feeds

| Check | Penalty | Score Cap |
|-------|---------|-----------|
| In Threat Feed (FBI IC3, FTC) | **-50** | Max 30 |

### Scam Type Detection

| Scam Type | Penalty | Triggers |
|-----------|---------|----------|
| Government Impersonation | **-60** | Fake IRS, SSA, HMRC, DMV claims + threatening language |
| Tech Support Scam | **-60** | Fake antivirus warnings (Norton, McAfee, Microsoft), phone prompts |

### VirusTotal Integration

| Result | Effect |
|--------|--------|
| Malicious (any engine) | Triggers critical cap (max 45) |
| Clean (50+ engines, 0 flags) | **+5 bonus** |

### Data Sources
- Community reports database
- FBI IC3 threat feeds
- FTC scam reports
- VirusTotal API (80+ security engines)

---

## 4. BUSINESS TRANSPARENCY (15%)

*Note: Only applied to e-commerce sites. Skipped for portals, SaaS, news sites, and established retail brands.*

### Contact Information

| Check | Penalty | Condition |
|-------|---------|-----------|
| No Physical Address | **-20** | No street address found |
| Fake/PO Box Address | **-15** / **-10** | Suspicious patterns or PO Box only |
| No Phone Number | **-10** | No contact phone found |
| Suspicious Phone | **-10** | Fake patterns, premium rate numbers |
| Generic Email Only | **-10** | Only Gmail/Yahoo for business contact |

### Essential Pages

| Missing Page | Penalty |
|--------------|---------|
| Privacy Policy | **-8** |
| Terms of Service | **-6** |
| Shipping Information | **-8** |
| About Page | **-5** |
| 2+ Pages Missing | **-5** additional |

### Data Sources
- Content scraping (Firecrawl API)
- Address pattern recognition
- Phone number validation
- Email domain analysis

---

## 5. PAYMENT SAFETY (15%)

### Payment Status Penalties

| Status | Penalty | Description |
|--------|---------|-------------|
| Crypto/Wire/Gift Cards Only | **-30** | No buyer protection available |
| Crypto Only | **-15** | Limited buyer protection |
| Unknown Methods | **-5** | Neutral/mild concern |
| Standard Gateway Detected | **+0** | Stripe, PayPal, etc. (positive signal) |

### Return Policy

| Check | Penalty | Condition |
|-------|---------|-----------|
| No Refund Policy | **-15** | E-commerce site without return policy |

### Payment Gateway Detection
Detects: Stripe, PayPal, Shopify Payments, Adyen, Square, Braintree, Klarna, Affirm, Afterpay

---

## 6. BEHAVIORAL RED FLAGS (10%)

| Check | Penalty | Condition |
|-------|---------|-----------|
| Countdown Timers / Urgency | **-10** | Fake urgency tactics, "offer expires" |
| Fake Trust Badges | **-10** | Unverified McAfee/Norton badges |
| URL Shortener Redirects | **-10** / **-3** | Hides true destination (less for professional sites) |
| Cloned/Template Content | **-10** | Website appears copied from other sites |
| Excessive Discount Claims | *flagged* | 5+ extreme discount claims |
| Fake Review Patterns | *flagged* | Multiple 5-star "verified" reviews |

---

## 7. BONUSES (Positive Signals)

| Signal | Bonus | Condition |
|--------|-------|-----------|
| Well-Known Domain | **+40** | Google, Amazon, Microsoft, etc. |
| Established Retail Brand | **+35** | Nike, Nordstrom, IKEA, etc. |
| Portal/News Site | **+10** | News/media characteristics |
| Valid Business Registration | **+5** | VAT number, company registration, DUNS |
| GDPR/Cookie Compliance | **+5** | Cookie notice or GDPR mention |
| Complete Contact Info | **+5** | Address + phone + professional email |
| External Review Platforms | **+5** | Listed on 2+ review sites |
| High Professionalism (strong) | **+15** | Professional + 8+ positive signals |
| High Professionalism (good) | **+8** | Professional + 5+ positive signals |
| SaaS Platform | **+5** | Established software platform |
| Clean VirusTotal | **+5** | 0 flags from 50+ security engines |

---

## CRITICAL ISSUE CAPS

If any of these conditions are met, the maximum trust score is **capped at 45**:

- ⚠️ Government impersonation scam detected
- ⚠️ Tech support/subscription scam detected
- ⚠️ Typosquatting detected
- ⚠️ VirusTotal reports as malicious
- ⚠️ Only accepts crypto/wire/gift cards
- ⚠️ No HTTPS (with no redirect to HTTPS)

---

## FINAL VERDICTS

| Score Range | Verdict | Meaning |
|-------------|---------|---------|
| **85-100** | ✅ Likely Legit | Safe to proceed with normal caution |
| **60-84** | ⚠️ Use Caution | Some concerns, verify before purchasing |
| **0-59** | 🚨 High Risk | Significant red flags, avoid transactions |

---

## CONFIDENCE LEVELS

The system also calculates confidence based on available data:

| Data Points Verified | Confidence |
|---------------------|------------|
| 5-6 sources | **High** - Comprehensive data available |
| 3-4 sources | **Medium** - Some checks unverified |
| 0-2 sources | **Low** - Limited data, less certain |

### Data Sources Checked:
1. WHOIS data
2. VirusTotal scan
3. Physical address
4. Payment methods
5. Business policies
6. External links (social/reviews)

---

## SITE TYPE ADJUSTMENTS

The system detects site types and adjusts expectations:

| Site Type | Adjustments |
|-----------|-------------|
| **Well-Known Domains** | Skip e-commerce penalties, +40 bonus |
| **Established Retail** | Skip address penalties, skip clone detection, +35 bonus |
| **SaaS/Software** | Skip shipping/return policy penalties |
| **Portal/News** | Skip e-commerce-specific checks |

---

## SPECIAL DETECTIONS

### Typosquatting Monitoring
Monitors for lookalikes of: Amazon, PayPal, Facebook, Google, Apple, Microsoft, Netflix, Instagram

### Government Scam Detection
Monitors for impersonation of:
- **US:** IRS, Social Security, DMV, Medicare, FBI, CBP, USCIS
- **UK:** HMRC, DVLA, NHS, Home Office
- **AU:** ATO, Centrelink, MyGov
- **CA:** CRA, Service Canada

### Tech Support Scam Detection
Monitors for fake alerts from: Norton, McAfee, Windows, Microsoft, Kaspersky, Avast, AVG

---

## DATA SOURCES SUMMARY

| Source | Purpose |
|--------|---------|
| **Firecrawl API** | Website scraping, screenshot, content analysis |
| **VirusTotal API** | Security scan from 80+ engines |
| **WHOIS APIs** | Domain age, registrar, ownership |
| **Community Reports** | User-submitted scam reports |
| **Threat Feeds** | FBI IC3, FTC official reports |
| **Lovable AI** | Natural language analysis, pattern detection |

---

## CACHE & UPDATES

- Results cached for **24 hours**
- Cache invalidated when scoring logic is updated
- Current version: `2026-02-04-v1`

---

*This methodology is continuously refined based on emerging scam patterns and user feedback.*
