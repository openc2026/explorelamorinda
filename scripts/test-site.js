#!/usr/bin/env node
/*
 * Explore Lamorinda — site test routine.
 *
 * Used by the 4-day improvement sprint to catch breakage before pushing.
 * Run via: npm run test:site
 *
 * Exit 0 on green, 1 on any failure.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const STATE_FILE = path.join(ROOT, '.test-state.json');

const fails = [];
const warns = [];
const info = [];

function ok(msg)   { info.push(`✓ ${msg}`); }
function warn(msg) { warns.push(`! ${msg}`); }
function fail(msg) { fails.push(`✗ ${msg}`); }

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return {}; }
}
function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

function walk(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p, ext));
    else if (!ext || p.endsWith(ext)) out.push(p);
  }
  return out;
}

// ---------- 1. Build ----------
console.log('→ Building site with hugo --minify ...');
const build = spawnSync('hugo', ['--minify', '--logLevel', 'warn'], {
  cwd: ROOT,
  encoding: 'utf8',
  shell: true,
});
if (build.status !== 0) {
  fail(`hugo build failed (exit ${build.status})`);
  console.log(build.stdout);
  console.error(build.stderr);
} else {
  ok('hugo build succeeded');
  const m = (build.stdout || '').match(/Pages\s*\|\s*(\d+)/i);
  if (m) info.push(`  pages: ${m[1]}`);
}

// ---------- 2. HTML sanity ----------
const htmlFiles = walk(PUBLIC_DIR, '.html');
if (htmlFiles.length === 0) {
  fail('no HTML files in public/');
} else {
  ok(`${htmlFiles.length} HTML files generated`);
}

// sample: index + a few section indexes + first 20 others
const sampleTargets = new Set();
for (const f of ['index.html', 'lafayette/index.html', 'moraga/index.html',
                 'orinda/index.html', 'real-estate/index.html', 'schools/index.html']) {
  const full = path.join(PUBLIC_DIR, f);
  if (fs.existsSync(full)) sampleTargets.add(full);
}
for (const f of htmlFiles.slice(0, 20)) sampleTargets.add(f);

let titleIssues = 0, descIssues = 0, h1Issues = 0, canonIssues = 0;
for (const f of sampleTargets) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(PUBLIC_DIR, f);

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    fail(`empty/missing <title>: ${rel}`); titleIssues++;
  } else if (titleMatch[1].length > 70) {
    warn(`title >70 chars (${titleMatch[1].length}): ${rel}`);
  }

  const descMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+name=description\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+name=description\s+content=([^\s>]+)/i);
  if (!descMatch || !descMatch[1].trim()) {
    warn(`missing meta description: ${rel}`); descIssues++;
  } else if (descMatch[1].length < 50 || descMatch[1].length > 200) {
    warn(`meta description length ${descMatch[1].length} (50-200 ideal): ${rel}`);
  }

  if (!/<h1[\s>]/i.test(html)) {
    warn(`no <h1>: ${rel}`); h1Issues++;
  }

  if (!/<link\s+rel=(["']?)canonical\1/i.test(html)) {
    // canonical is added in Day 1 — soft warn until then
    warn(`no canonical link: ${rel}`); canonIssues++;
  }
}
if (titleIssues === 0) ok('all sampled pages have <title>');
if (h1Issues === 0)    ok('all sampled pages have <h1>');

// ---------- 3. Schema sanity ----------
const schemaTargets = [
  'index.html',
  'lafayette/index.html',
  'real-estate/index.html',
];
for (const t of schemaTargets) {
  const full = path.join(PUBLIC_DIR, t);
  if (!fs.existsSync(full)) { warn(`schema target missing: ${t}`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  if (blocks.length === 0) {
    warn(`no JSON-LD on ${t} (expected after Day 1)`);
    continue;
  }
  let parsedOk = 0;
  for (const b of blocks) {
    try { JSON.parse(b[1]); parsedOk++; }
    catch (e) { fail(`invalid JSON-LD on ${t}: ${e.message}`); }
  }
  if (parsedOk > 0) ok(`${parsedOk} valid JSON-LD block(s) on ${t}`);
}

// ---------- 4. Internal links ----------
let brokenLinks = 0;
const linkCheckSample = htmlFiles.slice(0, 60);
for (const f of linkCheckSample) {
  const html = fs.readFileSync(f, 'utf8');
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/gi)].map(m => m[1]);
  for (const h of hrefs) {
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(h)) continue;
    if (h.startsWith('//')) continue;
    let target = h.startsWith('/') ? path.join(PUBLIC_DIR, h) : path.join(path.dirname(f), h);
    // strip query
    target = target.split('?')[0];
    // try as-is, then with index.html
    const candidates = [target];
    if (!target.endsWith('.html') && !path.extname(target)) {
      candidates.push(path.join(target, 'index.html'));
    }
    if (target.endsWith('/')) candidates.push(target + 'index.html');
    const exists = candidates.some(c => fs.existsSync(c));
    if (!exists) {
      brokenLinks++;
      if (brokenLinks <= 10) warn(`broken link in ${path.relative(PUBLIC_DIR, f)}: ${h}`);
    }
  }
}
if (brokenLinks === 0) ok('no broken internal links in sample');
else if (brokenLinks > 20) fail(`${brokenLinks} broken internal links (showing first 10)`);

// ---------- 5. No empty files ----------
let emptyFiles = 0;
for (const f of htmlFiles) {
  if (fs.statSync(f).size === 0) {
    fail(`empty HTML file: ${path.relative(PUBLIC_DIR, f)}`);
    emptyFiles++;
  }
}
if (emptyFiles === 0) ok('no 0-byte HTML files');

// ---------- 6. last_updated on _index.md (Day 1+) ----------
const contentDir = path.join(ROOT, 'content');
const indexFiles = walk(contentDir, '_index.md');
let missingUpdated = 0;
for (const f of indexFiles) {
  const txt = fs.readFileSync(f, 'utf8');
  // only check after Day 1 ships — gate on whether ANY _index.md has it yet
  if (!/^\s*last_updated\s*:/m.test(txt)) missingUpdated++;
}
if (missingUpdated === 0 && indexFiles.length > 0) {
  ok(`all ${indexFiles.length} _index.md have last_updated`);
} else if (missingUpdated < indexFiles.length) {
  warn(`${missingUpdated}/${indexFiles.length} _index.md missing last_updated (expected after Day 1)`);
} else {
  warn(`last_updated not yet rolled out (${missingUpdated} _index.md without it)`);
}

// ---------- 7. Sitemap ----------
const sitemap = path.join(PUBLIC_DIR, 'sitemap.xml');
if (!fs.existsSync(sitemap)) {
  fail('public/sitemap.xml missing');
} else {
  const xml = fs.readFileSync(sitemap, 'utf8');
  const urlCount = (xml.match(/<loc>/g) || []).length;
  ok(`sitemap.xml present with ${urlCount} URLs`);
  // drop check vs previous run
  const state = loadState();
  if (state.sitemapUrls && urlCount < state.sitemapUrls * 0.9) {
    fail(`sitemap URL count dropped sharply: ${state.sitemapUrls} -> ${urlCount}`);
  }
  state.sitemapUrls = urlCount;
  state.htmlFiles = htmlFiles.length;
  state.lastRunAt = new Date().toISOString();
  saveState(state);
}

// ---------- Report ----------
console.log('');
console.log('─── Test Summary ───');
for (const i of info)  console.log(i);
for (const w of warns) console.log(w);
for (const f of fails) console.log(f);
console.log('');
console.log(`Result: ${fails.length === 0 ? 'PASS' : 'FAIL'}  (${fails.length} fail, ${warns.length} warn, ${info.length} ok)`);

process.exit(fails.length === 0 ? 0 : 1);
