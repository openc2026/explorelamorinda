# Explore Lamorinda — 4-Day Improvement Sprint

**Created:** 2026-05-18
**Owner:** Andrew (with Rook executing daily)
**Goal:** Convert the high-level improvement plan into shipped, tested changes over 4 days.
**Schedule:** Daily 9:00 AM PT, May 19–22, 2026 (Tue–Fri).

---

## Ground rules (every day)

1. **Branch-free workflow:** commit on `main`, push to GitHub, let Cloudflare Pages deploy.
2. **No content deletion** without explicit instruction. Additive only.
3. **Every day ends with `npm run test:site`** (the test routine — see bottom).
   - If tests fail, REVERT the last commit, write a changelog entry, and stop. Do not push broken builds.
4. **Each day produces a changelog file** at `changelogs/YYYY-MM-DD-sprint-dayN.md`.
5. **Commit message format:** `sprint-dayN: <short summary>`

---

## Day 1 — Tuesday 2026-05-19 — Schema & E-E-A-T Foundation

Goal: make every page that already exists work harder for SEO/AEO. No new pages today.

### Tasks

- [ ] Create `themes/lamorinda/layouts/partials/schema.html`
  - Output `Organization` schema sitewide (name: "Explore Lamorinda", url: baseURL, logo, sameAs links).
  - Output `WebSite` schema with `potentialAction` SearchAction.
  - Output `BreadcrumbList` schema derived from `.Ancestors` + current page.
  - Output `Place` schema on town pages (Lafayette/Moraga/Orinda) — use coords from a new `data/towns.yaml`.
  - Output `Person` schema for Vlatka Bathgate on `/real-estate/` pages (DRE# 01390784, jobTitle, worksFor, sameAs Zillow/Yelp).
  - Output `FAQPage` schema when frontmatter has `faq:` array.
  - Output `Article` schema on `/blog/` posts (datePublished, dateModified, author).
- [ ] Wire `{{ partial "schema.html" . }}` into `themes/lamorinda/layouts/_default/baseof.html` inside `<head>`.
- [ ] Create `data/towns.yaml` with name, lat/lng, population, zip, founded, description for Lafayette, Moraga, Orinda.
- [ ] Create `data/authors.yaml` with `vlatka` and `explore-lamorinda` records.
- [ ] Add `last_updated` to frontmatter of all `content/**/_index.md` files (use today's date if missing).
- [ ] Update `baseof.html` `<head>`:
  - Add canonical link tag.
  - Add Open Graph tags (og:title, og:description, og:image, og:type, og:url).
  - Add Twitter Card tags.
  - Add `<meta name="robots" content="index,follow">`.
  - Ensure unique `<title>` per page (already partial — verify and extend with site tagline fallback).
- [ ] Add a "Last updated" line to `_default/single.html` rendering `.Params.last_updated`.

### Acceptance

- `hugo --minify` builds clean (zero warnings about templates).
- View-source on `/`, `/lafayette/`, `/real-estate/`, and a blog post — each shows JSON-LD blocks appropriate to page type.
- Test routine passes.

---

## Day 2 — Wednesday 2026-05-20 — Programmatic Surface Area (Round 1)

Goal: triple our indexable pages with data-driven generation.

### Tasks

- [ ] Create `data/neighborhoods.yaml` with at least 12 entries across the three towns. Fields: slug, town, name, blurb, vibe, price_band, schools, walkability, image.
- [ ] Create `data/relocation.yaml` — 8 origin cities (San Francisco, Oakland, Berkeley, Walnut Creek, Piedmont, Marin/Mill Valley, San Jose, Pleasanton). Fields per city: name, commute_notes, lifestyle_contrast, price_contrast, top_3_differences.
- [ ] Create `data/comparisons.yaml` — at least 5 "Lamorinda vs X" entries (Walnut Creek, Danville, Piedmont, Berkeley, San Ramon). Fields: name, schools, prices, vibe, commute, verdict.
- [ ] Add Hugo `content/neighborhoods/_index.md` + a custom list/single layout under `themes/lamorinda/layouts/neighborhoods/` that renders each entry from `data/neighborhoods.yaml`.
  - Alternative if simpler: generate one `.md` file per neighborhood from a Node script into `content/neighborhoods/<slug>.md`. Pick whichever is more robust.
- [ ] Same pattern for `content/moving-to-lamorinda/from-<city>/` (one page per origin).
- [ ] Same pattern for `content/compare/lamorinda-vs-<slug>/`.
- [ ] Add nav menu link "Neighborhoods" (weight 4.5) in `hugo.toml`.
- [ ] Each generated page gets:
  - 600–1200 words (template-driven; the *page type* warrants the length, not arbitrary padding).
  - 3 internal links (to relevant town page, schools, real-estate).
  - Soft CTA to contact Vlatka (use existing `content-cta-banner.html`).
  - FAQ block with 3 Q&As (drives FAQPage schema from Day 1).

### Acceptance

- New page counts (after `hugo`):
  - Neighborhoods: ≥ 12.
  - Relocation: ≥ 8.
  - Comparisons: ≥ 5.
- Build succeeds, no broken internal links.
- Test routine passes.

---

## Day 3 — Thursday 2026-05-21 — Long-Form Authority Pages

Goal: stop the "thin page" problem on the existing core pages.

### Tasks

- [ ] Expand `content/lafayette/_index.md` from ~420 words to 1,500–2,000 words.
  - Sections: Overview, History, Neighborhoods, Schools, Things to Do, Dining, Real Estate Snapshot, Who Loves It Here, FAQ.
  - Add 6–8 internal links to existing pages plus Day-2 neighborhoods.
- [ ] Same expansion for `content/moraga/_index.md` and `content/orinda/_index.md`.
- [ ] Expand `content/schools/_index.md` (currently 935 words) to ~1,800 words with a comparison table across the four districts.
- [ ] Expand `content/real-estate/_index.md` with sub-sections:
  - "Buying in Lamorinda" (process, fire-zone considerations, inspections).
  - "Selling in Lamorinda" (timing, prep, agent selection).
  - "Lamorinda Market at a Glance" (link to monthly updates).
  - FAQ with 6 Q&As.
- [ ] Add `faq:` array to frontmatter on each expanded page so Day-1 schema kicks in.
- [ ] Add a "Related" block at the bottom of each town page linking the new neighborhood pages.

### Acceptance

- `wc -w` (or equivalent) shows each of the 5 expanded pages ≥ 1,500 words.
- Each has a `faq:` block in frontmatter with ≥ 3 Q&As.
- FAQPage JSON-LD visible in view-source.
- Test routine passes.

---

## Day 4 — Friday 2026-05-22 — Conversion + Internal Linking + Sitemap

Goal: turn the traffic foundation into capture.

### Tasks

- [ ] Add 2 new lead magnets in `content/real-estate/`:
  - `relocation-guide.md` (gated PDF link, frontmatter `download: true`).
  - `sellers-prep-guide.md`.
  - Create matching placeholder PDFs in `/static/downloads/` (we'll fill content separately — for now, well-formatted single-page PDFs are fine).
- [ ] Add `content/real-estate/market-snapshot.md` — a template page that the existing daily-freshness cron can update with current numbers.
- [ ] Add a newsletter signup partial `themes/lamorinda/layouts/partials/newsletter-signup.html` (FormSubmit.co–style, posts to vlatka's address; mirror existing contact-form.html pattern).
- [ ] Place newsletter signup on:
  - Bottom of every blog post (modify `themes/lamorinda/layouts/blog/single.html`).
  - Bottom of every town `_index.md` (via partial in `_default/list.html`).
- [ ] Internal linking sweep:
  - Each town page links to ≥ 3 neighborhood pages (Day 2).
  - Each restaurant page links back to town index.
  - Each school district page links to the towns it serves.
  - Every "moving to" page links to schools + real-estate.
- [ ] Verify `sitemap.xml` and `robots.txt`:
  - Hugo emits sitemap automatically; ensure baseURL is correct and new sections are present.
  - Add `robots.txt` in `static/` allowing all, pointing to sitemap.
- [ ] Add `AI_AGENTS.md` at site root (also at `static/llms.txt`) — a llms.txt-style file describing the site for AI crawlers (per AEO best practice).

### Acceptance

- Two new lead-magnet pages render, PDFs download.
- Newsletter signup visible on blog posts and town index pages.
- `sitemap.xml` lists all new neighborhood, relocation, and comparison pages.
- `/llms.txt` accessible.
- Test routine passes.

---

## Stretch (only if Day N finishes early)

- Add `Restaurant` schema to restaurant pages.
- Add `EducationalOrganization` schema to school district pages.
- Add hreflang (only `en-US` for now; mostly forward-compat).
- Add Lighthouse CI to test routine.

---

## Test Routine (`npm run test:site`)

Lives at `scripts/test-site.js`. Run after every day's work. Exits non-zero on any failure.

Checks:

1. **Build** — `hugo --minify` exits 0; capture `Pages` and `Static files` counts; warn if pages decreased vs. previous run (state in `.test-state.json`).
2. **HTML sanity** — for a sample of generated pages in `public/`:
   - Has `<title>` non-empty and ≤ 70 chars.
   - Has `<meta name="description">` non-empty and 50–170 chars.
   - Has at least one `<h1>`.
   - Has canonical link.
3. **Schema sanity** — at least one valid JSON-LD `<script type="application/ld+json">` block on `/`, `/lafayette/index.html`, `/real-estate/index.html`. JSON parses.
4. **Internal link check** — crawl `public/` HTML, collect internal hrefs, verify each resolves to an existing file. Report broken links.
5. **No 0-byte files** in `public/`.
6. **Frontmatter `last_updated`** present on every `_index.md` once Day 1 ships.
7. **Sitemap presence** — `public/sitemap.xml` exists and contains > N URLs (N from previous run; warn if drop).

On failure: print summary, exit 1. On success: print green summary with counts.

---

## How the cron jobs were created

Four `agentTurn` jobs in `~/.openclaw/cron/jobs.json`, one per day, each isolated session:

- `Lamorinda Sprint Day 1: Schema Foundation` — 2026-05-19 09:00 PT
- `Lamorinda Sprint Day 2: Programmatic Pages` — 2026-05-20 09:00 PT
- `Lamorinda Sprint Day 3: Long-Form Authority` — 2026-05-21 09:00 PT
- `Lamorinda Sprint Day 4: Conversion + Linking` — 2026-05-22 09:00 PT

Each job message references this file by absolute path and tells the agent to:
1. Read this checklist.
2. Execute the day's tasks.
3. Run `npm run test:site` and only commit/push if green.
4. Write a changelog at `changelogs/YYYY-MM-DD-sprint-dayN.md`.
5. Report back to Andrew.
