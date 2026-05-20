#!/usr/bin/env node
/*
 * Day-2 programmatic page generator.
 *
 * Reads:
 *   data/relocation.yaml  -> emits content/moving-to-lamorinda/from-<slug>/_index.md
 *   data/comparisons.yaml -> emits content/compare/lamorinda-vs-<slug>/_index.md
 *   data/neighborhoods.yaml is consumed by Hugo directly (templates + internal links).
 *
 * Pages are written ADDITIVELY: if the target file already exists, we skip it
 * unless --force is passed. This makes the script safe to re-run.
 *
 * Each generated page contains:
 *   - 600-1200 words of template-driven, factual prose.
 *   - 3+ internal links to town/school/real-estate pages.
 *   - A soft CTA banner (the content-cta-banner.html partial fires automatically
 *     on non-/real-estate pages; we also include a Markdown CTA box for visibility).
 *   - A `faq:` frontmatter array with 3 Q&As -> FAQPage JSON-LD via Day-1 schema.
 *   - last_updated frontmatter -> renders the "Last updated:" stamp.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const CONTENT_DIR = path.join(ROOT, 'content');
const TODAY = new Date().toISOString().slice(0, 10);
const FORCE = process.argv.includes('--force');

// ----- tiny YAML loader (no deps) -----
// Hugo's data/ folder is also YAML; for our manifest shape (top-level key with
// a list of objects whose values are simple strings or arrays of strings)
// a small purpose-built parser is enough and avoids adding js-yaml.
function loadYaml(p) {
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  const root = {};
  let currentTopKey = null;
  let currentList = null;
  let currentItem = null;
  let currentItemKey = null; // for multi-line string list (top_3_differences)
  let currentArray = null;

  const stripComment = (s) => {
    // remove trailing comment that isn't inside quotes
    let inQ = false, qch = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (inQ) { if (c === qch) inQ = false; continue; }
      if (c === '"' || c === "'") { inQ = true; qch = c; continue; }
      if (c === '#') return s.slice(0, i);
    }
    return s;
  };
  const unquote = (v) => {
    v = v.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    return v;
  };

  for (let raw of lines) {
    const line = stripComment(raw).replace(/\s+$/, '');
    if (!line.trim()) continue;
    const indent = line.match(/^ */)[0].length;

    if (indent === 0) {
      // top-level "key:" expecting a list of objects on subsequent lines
      const m = line.match(/^([A-Za-z0-9_]+):\s*$/);
      if (m) {
        currentTopKey = m[1];
        root[currentTopKey] = [];
        currentList = root[currentTopKey];
        currentItem = null;
        currentArray = null;
        continue;
      }
    } else if (indent === 2 && line.trim().startsWith('- ')) {
      // start of a new item
      const rest = line.trim().slice(2); // strip "- "
      currentItem = {};
      currentList.push(currentItem);
      currentArray = null;
      const km = rest.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (km) {
        const key = km[1];
        const val = km[2];
        if (val === '') { currentItemKey = key; currentItem[key] = null; }
        else { currentItem[key] = unquote(val); currentItemKey = null; }
      }
      continue;
    } else if (indent === 4) {
      // a property of the current item
      const trimmed = line.trim();
      const km = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (km) {
        const key = km[1];
        const val = km[2];
        currentArray = null;
        if (val === '') { currentItemKey = key; currentItem[key] = null; }
        else { currentItem[key] = unquote(val); currentItemKey = null; }
        continue;
      }
    } else if (indent === 6) {
      // nested array element under currentItemKey (e.g. top_3_differences)
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        if (!currentArray) {
          currentArray = [];
          currentItem[currentItemKey] = currentArray;
        }
        currentArray.push(unquote(trimmed.slice(2)));
        continue;
      }
    }
    // anything else is treated as ignorable
  }

  return root;
}

// ----- frontmatter helpers -----
function yamlString(s) {
  // YAML-safe double-quoted string for frontmatter values.
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function frontmatter(fields) {
  // fields: ordered array of [key, value] pairs.
  // value may be a string, number, array of strings, or array of {q, a}.
  const out = ['---'];
  for (const [k, v] of fields) {
    if (Array.isArray(v)) {
      if (v.length === 0) { out.push(`${k}: []`); continue; }
      if (typeof v[0] === 'object' && v[0] !== null) {
        // array of objects (faq)
        out.push(`${k}:`);
        for (const item of v) {
          const keys = Object.keys(item);
          out.push(`  - ${keys[0]}: ${yamlString(item[keys[0]])}`);
          for (let i = 1; i < keys.length; i++) {
            out.push(`    ${keys[i]}: ${yamlString(item[keys[i]])}`);
          }
        }
      } else {
        out.push(`${k}:`);
        for (const item of v) out.push(`  - ${yamlString(item)}`);
      }
    } else if (typeof v === 'number') {
      out.push(`${k}: ${v}`);
    } else {
      out.push(`${k}: ${yamlString(v)}`);
    }
  }
  out.push('---', '');
  return out.join('\n');
}

// ----- soft-CTA Markdown block (mirrors styling of existing pages) -----
const CTA_BLOCK = `
<div class="real-estate-cta-box">
<strong>Ready to talk specifics?</strong> Vlatka Bathgate — #1 Coldwell Banker Realtor in Orinda, DRE# 01390784 — has helped families relocate to Lamorinda for 22+ years. Connect for honest, no-pressure guidance.
<br><br>
<strong>📞 (925) 597-1573</strong> · <a href="/real-estate/#contact-form">Contact Vlatka</a> · <a href="/real-estate/">Real Estate Overview</a>
</div>
`;

// ----- relocation page builder -----
function buildRelocationMarkdown(city) {
  const title = `Moving from ${city.name} to Lamorinda`;
  const desc = `What to expect when relocating from ${city.name} to Lafayette, Moraga, or Orinda — commute, prices, schools, and lifestyle compared.`;

  const diffs = (city.top_3_differences || [])
    .map((d) => `- ${d}`)
    .join('\n');

  const body = `
> **At a glance.** A practical, plain-English look at what changes when you move from ${city.name} to Lamorinda — the daily commute, the housing math, the school landscape, and the small lifestyle shifts that catch new arrivals by surprise.

## Why people make this move

Most ${city.name}-to-Lamorinda moves are driven by three things: **schools, square footage, and a calmer day-to-day rhythm**. Lamorinda — the regional nickname for [Lafayette](/lafayette/), [Moraga](/moraga/), and [Orinda](/orinda/) — sits just east of the Caldecott Tunnel from Oakland and Berkeley, in the rolling oak-studded hills of Contra Costa County. The three towns share the [Acalanes Union High School District](/schools/) and a regional identity that residents lean into. People here say "I live in Lamorinda" more often than they name a specific town.

If you're considering the move, you're not alone. Families relocate here every year from across the Bay Area, and the patterns are consistent enough that we can lay out what you should actually expect.

## The commute reality from ${city.name}

${city.commute_notes}

For most professionals, the calculus comes down to whether BART works for your specific employer. Lafayette and Orinda each have their own BART station inside town, and Moraga residents typically drive five to ten minutes to Lafayette or Orinda to catch the train. The Yellow Line runs straight into downtown San Francisco — Embarcadero is about 30 minutes from Lafayette station — and connects to the rest of the BART system at MacArthur and 12th Street/Oakland.

If your commute is in the East Bay rather than San Francisco, the Caldecott Tunnel keeps Oakland and Berkeley about 15–20 minutes away by car. Reverse commutes (Lamorinda to South Bay or Marin) are harder; we don't sugar-coat that.

See also: [Getting Around Lamorinda](/getting-around/) for the full transit picture.

## Lifestyle: what actually changes

${city.lifestyle_contrast}

A few patterns we see consistently with ${city.short_name} transplants:

- **You'll drive more.** Even with BART, day-to-day errands tend to be car-based. Most households end up with one or two cars.
- **Weekends look different.** Lamorinda residents spend a lot of time outdoors — the [Lafayette Reservoir](/things-to-do/), the Lafayette-Moraga Regional Trail, Briones Regional Park, and the local pools and country clubs anchor the social calendar.
- **The dinner-out density is lower.** Lafayette has the largest concentration of restaurants; Moraga and Orinda each have a more modest set. The Caldecott keeps Oakland and Berkeley restaurants 15–20 minutes away when you want more variety.
- **Neighbors are present.** Block-level community is stronger than in most urban neighborhoods — people know each other through schools, pools, and sports.

## The housing math

${city.price_contrast}

Lamorinda's housing stock is largely 1950s–1980s single-family homes on lots from a quarter-acre up. You'll find newer construction scattered throughout, but the bulk of inventory is established homes that have been updated incrementally. Plan for renovation budgets if you want a turn-key high-end finish.

Three things to know about the local market:

1. **Inventory is consistently tight.** Well-priced homes in good condition often see multiple offers, particularly in spring and early summer.
2. **Fire-zone awareness matters.** Many Lamorinda properties sit in CAL FIRE-mapped wildfire zones. Insurance underwriting has tightened across California; build it into your due diligence.
3. **Schools shape micro-pricing.** A home that feeds into a specific top-ranked elementary school can carry a measurable premium over a similar home a few blocks away in a different attendance zone.

See the [Real Estate Overview](/real-estate/) for current market context and the [Home Buyer's Checklist](/real-estate/home-buyers-checklist/).

## Top 3 differences ${city.short_name} families notice

${diffs}

## Choosing between Lafayette, Moraga, and Orinda

Once you've decided on Lamorinda, the next question is which town. The short version:

- **[Lafayette](/lafayette/)** — The largest of the three, with a walkable downtown along Mt. Diablo Boulevard, the Lafayette Reservoir, and the most restaurant density. Strongest pick if you want suburban living with a real "downtown."
- **[Moraga](/moraga/)** — Quietest and most family-focused, with Saint Mary's College, abundant open space, and a small commercial center. Strong pick for families who want a calm, school-anchored community.
- **[Orinda](/orinda/)** — The closest town to the Caldecott Tunnel, with the Orinda Theatre, Cal Shakes amphitheater, and a charming small downtown. Strong pick for families who prioritize an easier Oakland or San Francisco commute.

All three flow into the same high school district, so the high-school-level academic experience is broadly similar. The K-8 districts (Lafayette School District, Moraga School District, Orinda Union School District) are separate and each has its own personality.

## Frequently asked questions

- **How long does the typical commute take?** From Lafayette or Orinda BART to downtown San Francisco runs about 30–35 minutes. By car, the same trip is 30–60 minutes off-peak.
- **What's the median home price?** Lamorinda single-family medians broadly span $1.5M–$3M+ depending on town, neighborhood, lot size, and condition. See the [Real Estate Overview](/real-estate/) for current figures.
- **Are the schools really that good?** The Acalanes Union High School District is consistently ranked among the top 1% of California public high schools, and the three K-8 feeder districts perform similarly. See the [Schools page](/schools/) for specifics.

${CTA_BLOCK}
`.trim();

  const faq = [
    {
      q: `How long is the commute from Lamorinda back to ${city.name}?`,
      a: city.commute_notes,
    },
    {
      q: `Will my budget go further moving from ${city.name} to Lamorinda?`,
      a: city.price_contrast,
    },
    {
      q: `What's the biggest lifestyle change to expect?`,
      a: city.lifestyle_contrast,
    },
  ];

  const fm = frontmatter([
    ['title', title],
    ['description', desc],
    ['last_updated', TODAY],
    ['image', '/images/new_home1.png'],
    ['keywords', [`moving from ${city.name} to Lamorinda`, `${city.name} to Lafayette`, `${city.name} to Orinda`, `${city.name} to Moraga`, 'Lamorinda relocation']],
    ['faq', faq],
  ]);

  return fm + body + '\n';
}

// ----- comparison page builder -----
function buildComparisonMarkdown(c) {
  const title = `Lamorinda vs ${c.name}`;
  const desc = `An honest, side-by-side look at Lamorinda and ${c.name} — schools, prices, vibe, commute, and which one fits which family.`;

  const body = `
> **At a glance.** Two desirable East Bay options, with real trade-offs in either direction. Here's the side-by-side that families ask us for most often.

## Why this comparison comes up

Buyers shopping the East Bay almost always weigh Lamorinda — [Lafayette](/lafayette/), [Moraga](/moraga/), and [Orinda](/orinda/) — against ${c.name} at some point. They're both established, school-strong, and family-oriented. The differences are real but rarely dealbreakers, and the right answer depends on what you value most.

This page is intentionally even-handed. We're not here to talk you into Lamorinda; we're here to help you decide.

## Schools

${c.schools}

For deeper detail on the Lamorinda side, see the [Schools page](/schools/), which covers the Acalanes Union High School District, the three K-8 districts (Lafayette, Moraga, Orinda Union), and the private and parochial options families consider.

A practical tip: in any East Bay comparison, look past district-level rankings to **specific school attendance zones**. A great district can still have variation across its elementary schools, and a home's address determines which schools your kids attend.

## Home prices

${c.prices}

Both markets reward patience and a clear sense of what you want. Lamorinda's housing stock skews older (1950s–1980s) with incremental updates; pure new construction is rare. ${c.name}'s housing mix is different, which we get into in the verdict below.

Either way, plan to budget for:

- **Property taxes** — about 1.1–1.25% of assessed value in Contra Costa County.
- **Mello-Roos / special assessments** — possible in some neighborhoods.
- **Insurance** — California's wildfire-aware insurance market has tightened; underwriting is stricter than it was five years ago.

See the [Real Estate Overview](/real-estate/) for current Lamorinda market context.

## Vibe and daily rhythm

${c.vibe}

The "vibe" question really comes down to what your weekends look like. Lamorinda weekends tend to revolve around outdoors — trails, the [Lafayette Reservoir](/things-to-do/), youth sports, and the swim/country club scene — plus a steady rotation through the restaurants in downtown Lafayette and the smaller commercial centers in Moraga and Orinda.

## Commute

${c.commute}

If your job is in San Francisco, BART is the single biggest variable in any East Bay comparison. Lamorinda's Lafayette and Orinda stations are inside the towns themselves, with parking and bus connections.

If your work is in the East Bay or hybrid, the Caldecott Tunnel keeps Oakland and Berkeley about 15–20 minutes from Lamorinda by car.

## The verdict

${c.verdict}

A final practical note: most families who agonize over this comparison end up being happy in either place. The differences are real but not life-altering. The decision usually gets made by a specific home, a specific school zone, or a specific commute window — not by an abstract ranking of the two towns.

## Frequently asked questions

- **Which has better schools, Lamorinda or ${c.name}?** Both perform well on standard measures. The Lamorinda answer (Acalanes Union plus three top-ranked K-8 districts) is the more uniformly top-tier of the two; ${c.name}'s answer varies more by specific school.
- **Which is more expensive?** Median prices are broadly comparable, with differences driven mostly by lot size, school attendance zone, and home age/condition.
- **Which is the easier commute to San Francisco?** Lamorinda has BART stations inside Lafayette and Orinda. ${c.name}'s answer depends on which part of the city you live in — see the commute notes above.

${CTA_BLOCK}
`.trim();

  const faq = [
    { q: `Which has better schools, Lamorinda or ${c.name}?`, a: c.schools },
    { q: `How do home prices compare?`, a: c.prices },
    { q: `What's the commute difference?`, a: c.commute },
  ];

  const fm = frontmatter([
    ['title', title],
    ['description', desc],
    ['last_updated', TODAY],
    ['image', '/images/new_panoramic1.png'],
    ['keywords', [`Lamorinda vs ${c.name}`, `${c.name} vs Lafayette`, `${c.name} vs Orinda`, 'East Bay comparison']],
    ['faq', faq],
  ]);

  return fm + body + '\n';
}

// ----- write helpers -----
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function writePage(targetPath, content) {
  if (fs.existsSync(targetPath) && !FORCE) {
    console.log(`  · skip (exists): ${path.relative(ROOT, targetPath)}`);
    return false;
  }
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`  ✓ wrote: ${path.relative(ROOT, targetPath)}`);
  return true;
}

// ----- main -----
function main() {
  console.log('Generating relocation pages …');
  const reloc = loadYaml(path.join(DATA_DIR, 'relocation.yaml'));
  let wroteR = 0;
  for (const city of (reloc.cities || [])) {
    const target = path.join(CONTENT_DIR, 'moving-to-lamorinda', `from-${city.slug}`, '_index.md');
    if (writePage(target, buildRelocationMarkdown(city))) wroteR++;
  }

  console.log('Generating comparison pages …');
  const comp = loadYaml(path.join(DATA_DIR, 'comparisons.yaml'));
  let wroteC = 0;
  for (const c of (comp.comparisons || [])) {
    const target = path.join(CONTENT_DIR, 'compare', `lamorinda-vs-${c.slug}`, '_index.md');
    if (writePage(target, buildComparisonMarkdown(c))) wroteC++;
  }

  console.log(`\nDone. Relocation pages: ${wroteR}, Comparison pages: ${wroteC}.`);
}

if (require.main === module) main();
