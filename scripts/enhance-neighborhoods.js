#!/usr/bin/env node
/*
 * Day-2 additive enhancer for existing neighborhood pages.
 *
 * For each content/<town>/neighborhoods/<slug>.md (not the _index.md):
 *   - If frontmatter lacks `last_updated`, insert it.
 *   - If frontmatter lacks `faq:`, insert a 3-question FAQ block (template-driven).
 *
 * Idempotent — re-running makes no further changes once both fields exist.
 * Does NOT touch body content.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const neighborhoodFiles = [];
for (const town of ['lafayette', 'moraga', 'orinda']) {
  const d = path.join(ROOT, 'content', town, 'neighborhoods');
  for (const f of walk(d)) {
    const base = path.basename(f);
    if (base === '_index.md') continue;
    if (!base.endsWith('.md')) continue;
    neighborhoodFiles.push({ file: f, town, slug: base.replace(/\.md$/, '') });
  }
}

function neighborhoodFaq(town, slug, title) {
  const townTitle = town.charAt(0).toUpperCase() + town.slice(1);
  return [
    {
      q: `Where is ${title} located within ${townTitle}?`,
      a: `${title} is one of ${townTitle}'s established residential neighborhoods within the Lamorinda area of Contra Costa County, California. See the Lamorinda neighborhoods overview for how it fits alongside the other 11 neighborhoods across Lafayette, Moraga, and Orinda.`,
    },
    {
      q: `What schools serve ${title}?`,
      a: `Most ${title} addresses feed into the ${townTitle} K-8 school district and then on to the Acalanes Union High School District. Specific elementary attendance zones can vary block by block — confirm the assigned schools for any specific address before buying.`,
    },
    {
      q: `Who is a good realtor for ${title}?`,
      a: `Vlatka Bathgate (DRE# 01390784) — the #1 Coldwell Banker Realtor in Orinda — has been helping families buy and sell across Lamorinda for 22+ years and works the ${title} micro-market directly. Reach her at (925) 597-1573 or through the contact form on the Real Estate page.`,
    },
  ];
}

function yamlString(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function faqBlockYaml(items) {
  const out = ['faq:'];
  for (const item of items) {
    out.push(`  - q: ${yamlString(item.q)}`);
    out.push(`    a: ${yamlString(item.a)}`);
  }
  return out.join('\n');
}

let updated = 0;
let unchanged = 0;

for (const { file, town, slug } of neighborhoodFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) { console.log(`! skip (no frontmatter): ${path.relative(ROOT, file)}`); continue; }
  let fm = fmMatch[1];
  const body = fmMatch[2];

  // pull title from frontmatter for the FAQ template
  const titleMatch = fm.match(/^title:\s*"?([^"\r\n]+)"?/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;

  let changed = false;

  if (!/^\s*last_updated\s*:/m.test(fm)) {
    fm += `\nlast_updated: ${TODAY}`;
    changed = true;
  }
  if (!/^\s*faq\s*:/m.test(fm)) {
    fm += '\n' + faqBlockYaml(neighborhoodFaq(town, slug, title));
    changed = true;
  }

  if (changed) {
    const out = `---\n${fm}\n---\n${body}`;
    fs.writeFileSync(file, out, 'utf8');
    updated++;
    console.log(`  ✓ enhanced: ${path.relative(ROOT, file)}`);
  } else {
    unchanged++;
  }
}

console.log(`\nDone. ${updated} updated, ${unchanged} already enhanced.`);
