# Explore Lamorinda — Site Freshness Automation

## Purpose

Keep the site fresh for Google. Stale sites rank poorly. Daily micro-updates signal active maintenance.

## Daily Job (7:00 AM PST)

### What It Does

Each day, make 1-3 small changes from this rotation:

1. **Content Tweaks**
   - Add a new tip or "local secret" to a page
   - Update a description with seasonal reference
   - Add a "did you know" fact
   - Expand a thin section

2. **Data Updates**
   - Verify a restaurant is still open (quick web search)
   - Update hours if changed
   - Add a new restaurant discovered via search
   - Update price indicators

3. **Technical Freshness**
   - Update "last verified" dates in frontmatter
   - Add internal links between related pages
   - Improve meta descriptions
   - Add missing tags

4. **New Micro-Content**
   - Add a new "quick bite" restaurant
   - Add a trail or park detail
   - Add a neighborhood note
   - Add a seasonal event mention

### What It Does NOT Do

- Major redesigns
- Delete content
- Change site structure
- Require human approval for each change

### Output

1. Make changes directly to content files
2. Commit and push to GitHub (triggers Cloudflare deploy)
3. Save changelog to `changelogs/YYYY-MM-DD.md`

## Changelog Format

```markdown
# Site Update — YYYY-MM-DD

## Changes Made

- [page]: Description of change
- [page]: Description of change

## Verification

- Confirmed [restaurant] still open via Yelp
- Updated hours for [restaurant]

## Next Priorities

- [suggestion for future update]
```

## Integration with Daily Briefing

The Daily Intelligence Briefing (12:00 PM) should read `changelogs/YYYY-MM-DD.md` and append a "Site Updates" section.
