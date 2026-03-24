# Analytics Setup for ExplorelamorInda.com

Last updated: March 24, 2026

## Overview

The site uses Google Analytics 4 (GA4) to track visitor behavior and conversions. This document explains the setup and how to view reports.

---

## Setup Instructions

### Step 1: Create a GA4 Property (One-time)

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with a Google account (recommend using a shared/business account)
3. Click **Admin** (gear icon, bottom left)
4. Click **Create Property**
5. Enter:
   - Property name: `Explore Lamorinda`
   - Time zone: `Pacific Time`
   - Currency: `USD`
6. Click **Next**, select business info, then **Create**

### Step 2: Get Your Measurement ID

1. In the new property, go to **Admin → Data Streams**
2. Click **Add stream → Web**
3. Enter:
   - URL: `https://explorelamorinda.com`
   - Stream name: `Explore Lamorinda Website`
4. Copy the **Measurement ID** (starts with `G-`)

### Step 3: Add ID to the Site

Edit this file:
```
themes/lamorinda/layouts/partials/analytics.html
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID:
```html
{{ $ga4_id := "G-YOUR_ACTUAL_ID" }}
```

Deploy the site. Analytics will start collecting data immediately.

---

## What We Track

### Page Views
All page visits are automatically tracked by GA4.

### Conversions (Custom Events)

| Event Name | Category | Description | Priority |
|------------|----------|-------------|----------|
| `generate_lead` | Lead | Contact form submit button clicked | 🔴 High |
| `form_submission_complete` | Lead | Thank-you page loaded (confirms submission) | 🔴 High |
| `file_download` | Download | PDF checklist downloaded | 🟡 Medium |
| `click_realtor_site` | Outbound | Click to OrindaRealty.com | 🟡 Medium |
| `click_to_call` | Lead | Phone number clicked | 🔴 High |
| `cta_click` | Engagement | Floating CTA or banner clicked | 🟢 Low |

---

## Setting Up Conversion Goals in GA4

After deploying, mark key events as conversions:

1. Go to **Admin → Events** (in your GA4 property)
2. Find these events (they'll appear after first occurrence):
   - `generate_lead`
   - `form_submission_complete`
   - `click_to_call`
3. Toggle **Mark as conversion** for each

This allows you to:
- See conversion rates in reports
- Set up conversion-based audiences
- Track ROI if you run ads

---

## Viewing Reports

### Quick Access (Key Reports)

| Report | What It Shows | How to Find |
|--------|---------------|-------------|
| **Realtime** | Live visitors on site | Reports → Realtime |
| **Engagement** | Popular pages, time on site | Reports → Engagement → Pages |
| **Conversions** | Lead form submissions | Reports → Engagement → Conversions |
| **Acquisition** | Where traffic comes from | Reports → Acquisition → Overview |

### Recommended Weekly Check

1. **Engagement → Pages**: Which content gets the most traffic?
2. **Engagement → Conversions**: How many leads this week?
3. **Acquisition → Traffic Acquisition**: Are SEO and referrals working?

---

## Lead Attribution

When a visitor submits the contact form, GA4 captures:
- How they found the site (Google, direct, referral)
- What pages they viewed before converting
- Their location, device, etc.

This helps understand which content drives leads.

---

## Privacy Notes

- GA4 uses cookie-less measurement by default where possible
- No personal data (names, emails) is sent to GA — only anonymous behavior
- IP addresses are anonymized automatically by GA4

---

## Troubleshooting

### "No data showing"
- Wait 24-48 hours for initial data to appear
- Check **Realtime** report — this updates instantly

### "Events not appearing"
- Ensure the Measurement ID is correct (starts with `G-`)
- Check browser console for JavaScript errors
- Try in incognito/private mode (ad blockers may block GA)

### "Conversion not marked"
- Events only appear in Admin → Events after they occur at least once
- Trigger the event yourself (submit the form, download the PDF)

---

## Files Reference

| File | Purpose |
|------|---------|
| `themes/lamorinda/layouts/partials/analytics.html` | GA4 script tag |
| `static/js/main.js` | Conversion tracking events |
| `content/real-estate/thank-you.md` | Form completion tracking |

---

## Support

Questions? Contact Andrew (openc2026@outlook.com) or check GA4 documentation at https://support.google.com/analytics

