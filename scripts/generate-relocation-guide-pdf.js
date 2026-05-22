const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'static', 'downloads');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  info: {
    Title: 'Lamorinda Relocation Guide',
    Author: 'Vlatka Bathgate - Coldwell Banker',
    Subject: 'Complete guide to relocating to Lafayette, Moraga, or Orinda',
    Keywords: 'Lamorinda, relocation, moving, Orinda, Lafayette, Moraga'
  }
});

const outputPath = path.join(outputDir, 'lamorinda-relocation-guide.pdf');
doc.pipe(fs.createWriteStream(outputPath));

const primaryColor = '#2C5530';
const accentColor = '#8B4513';
const textColor = '#333333';
const lightGray = '#666666';

function sectionHeader(doc, title, icon = '\u25B6') {
  doc.moveDown(0.5);
  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
    .text(`${icon} ${title}`, { continued: false });
  doc.moveDown(0.3);
  doc.fillColor(textColor).font('Helvetica');
  return doc;
}

function subSection(doc, title) {
  doc.moveDown(0.3);
  doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold')
    .text(title);
  doc.fillColor(textColor).font('Helvetica').fontSize(11);
  return doc;
}

function bullets(doc, items) {
  doc.fontSize(10).fillColor(textColor);
  items.forEach((t) => {
    doc.text('\u2022  ' + t, { width: 490, indent: 10 });
  });
  doc.moveDown(0.3);
}

// ============ PAGE 1: Cover & Welcome ============
doc.fillColor(primaryColor).fontSize(28).font('Helvetica-Bold')
  .text('LAMORINDA', { align: 'center' });
doc.fontSize(16).font('Helvetica')
  .text('Relocation Guide', { align: 'center' });
doc.moveDown(0.3);
doc.fillColor(lightGray).fontSize(10)
  .text('Everything Newcomers Need to Know About Lafayette, Moraga & Orinda', { align: 'center' });
doc.moveDown(1);

doc.fillColor(primaryColor).rect(60, doc.y, 490, 80).fill();
doc.fillColor('white').fontSize(11).font('Helvetica')
  .text('Moving to Lamorinda is more than picking a house. It is choosing a school boundary, a commute pattern, a microclimate, and a community. This guide walks newcomers through the questions that matter before, during, and after the move.',
    75, doc.y - 70, { width: 460, align: 'center' });

doc.y = doc.y + 25;

sectionHeader(doc, 'WHY FAMILIES CHOOSE LAMORINDA');
doc.fontSize(10).fillColor(textColor)
  .text('Lamorinda combines three things that are hard to find together in the Bay Area: top-ranked public schools, low crime, and a 30-minute BART ride to downtown San Francisco. Layer in acres of regional open space and a small-town feel, and you have one of California\'s most resilient family markets.',
    { width: 490 });
doc.moveDown(0.5);
bullets(doc, [
  'Acalanes Union High School District: consistently top 1% in California.',
  'BART access in Lafayette and Orinda; about 30\u201335 min off-peak to downtown SF.',
  'Crime rates well below state and county averages.',
  'Surrounded by EBMUD, Briones, Tilden, and Sibley open space.',
  'Strong civic culture: foundations, parks, theater, library, farmers markets.'
]);

sectionHeader(doc, 'PICKING THE RIGHT TOWN');
subSection(doc, 'Lafayette');
doc.fontSize(10).fillColor(textColor).text(
  'Largest of the three, with a walkable downtown along Mt. Diablo Boulevard, BART, and the most restaurant density. Strong pick if you want suburban living with a real downtown core.',
  { width: 490 });
subSection(doc, 'Moraga');
doc.fontSize(10).fillColor(textColor).text(
  'Quietest and most family-centric, anchored by Saint Mary\'s College and surrounded by ranchland. No BART station, so prices run a bit lower than Lafayette or Orinda for comparable homes.',
  { width: 490 });
subSection(doc, 'Orinda');
doc.fontSize(10).fillColor(textColor).text(
  'Closest to the Caldecott Tunnel \u2014 the fastest Lamorinda commute. Theatre Square, Cal Shakes, and a classic California hillside feel. Strong pick for SF/Oakland commuters who still want trees and trails.',
  { width: 490 });

// ============ PAGE 2: Commute & Cost of Living ============
doc.addPage();

sectionHeader(doc, 'COMMUTING FROM LAMORINDA');
bullets(doc, [
  'BART: Lafayette and Orinda stations on the Antioch / Yellow line.',
  'San Francisco (Embarcadero): ~30\u201335 min off-peak from Orinda, ~35\u201340 from Lafayette.',
  'Oakland (12th St / Downtown): ~20 min by BART.',
  'Caldecott Tunnel: shapes traffic. Expect slower drives 7\u20139 am and 4\u20137 pm.',
  'Moraga: no BART. Most residents drive 10\u201315 min to Lafayette or Orinda BART.',
  'Cycling: Lafayette-Moraga Trail and Iron Horse Trail connect Lamorinda east-west.'
]);

sectionHeader(doc, 'COST OF LIVING SNAPSHOT');
doc.fontSize(10).fillColor(textColor).text(
  'Lamorinda is a premium market. Plan for jumbo financing on most homes and budget for higher property tax, insurance (especially fire), and ongoing hillside maintenance. Newcomers from coastal SF or the Peninsula often find the per-square-foot numbers favorable; newcomers from Walnut Creek or further east often find them steep.',
  { width: 490 });
doc.moveDown(0.3);
bullets(doc, [
  'Median single-family: typically $1.5M\u2013$3M+ depending on town and neighborhood.',
  'Property tax: ~1.1\u20131.3% of assessed value depending on local bonds.',
  'Fire insurance: budget materially more than coastal Bay Area; some hillsides hard to insure.',
  'Utilities: PG&E electric/gas; EBMUD water; sewer or septic depending on lot.',
  'HOA fees: only in select neighborhoods (Moraga Country Club, parts of Orinda).'
]);

sectionHeader(doc, 'SCHOOLS \u2014 THE QUICK MAP');
doc.fontSize(10).fillColor(textColor).text(
  'Lamorinda has three separate K-8 districts, all feeding into one shared high school district. Boundaries matter \u2014 a single street can change which elementary your kids attend.',
  { width: 490 });
doc.moveDown(0.3);
bullets(doc, [
  'Lafayette School District (K-8): Burton Valley, Happy Valley, Lafayette, Springhill, Stanley Middle.',
  'Moraga School District (K-8): Camino Pablo, Donald Rheem, Los Perales, Joaquin Moraga Intermediate.',
  'Orinda Union School District (K-8): Del Rey, Glorietta, Sleepy Hollow, Wagner Ranch, Orinda Intermediate.',
  'Acalanes Union HSD (9-12): Acalanes, Las Lomas, Campolindo, Miramonte.',
  'Always verify school assignment for the exact address before making an offer.'
]);

// ============ PAGE 3: Practical Checklist ============
doc.addPage();

sectionHeader(doc, 'NEWCOMER PRACTICAL CHECKLIST');
subSection(doc, 'Before you move');
bullets(doc, [
  'Pick a target town and a target school zone before house-hunting in earnest.',
  'Get pre-approved with a lender experienced in jumbo loans.',
  'Talk to a fire-insurance broker early; quote any address before offering.',
  'Visit on a weekday morning AND a weekend afternoon to feel the rhythm.',
  'Drive your real commute at real commute times.'
]);

subSection(doc, 'During the search');
bullets(doc, [
  'Confirm sewer vs septic on every property.',
  'Verify the elementary, middle, and high school attendance areas.',
  'Check fire hazard zone designation (CAL FIRE map).',
  'Read the Natural Hazard Disclosure carefully.',
  'Have a hillside-savvy inspector for any sloped lot.'
]);

subSection(doc, 'After you close');
bullets(doc, [
  'Register kids early with the district \u2014 some schools have orientation windows.',
  'Set up EBMUD water and PG&E within 1\u20132 weeks of closing.',
  'Order a Clipper card if you will commute via BART.',
  'Join the relevant town Nextdoor and the school PTA / foundation list.',
  'Sign up for community alerts (CodeRED, Nixle, Moraga-Orinda Fire District).'
]);

sectionHeader(doc, 'NEIGHBORHOOD CHEAT SHEET');
doc.fontSize(10).fillColor(textColor).text(
  'Each town has distinct neighborhoods with their own pricing, vibe, and commute pattern. A few worth knowing as a newcomer:',
  { width: 490 });
doc.moveDown(0.3);
bullets(doc, [
  'Lafayette \u2014 Downtown: walkable village, urban feel, near BART.',
  'Lafayette \u2014 Burton Valley: family heartland, flat streets, top elementary.',
  'Lafayette \u2014 Happy Valley: prestigious hillside, larger lots, secluded.',
  'Moraga \u2014 Campolindo: athletic, school-centered family neighborhood.',
  'Moraga \u2014 Moraga Country Club: gated, golf-course living.',
  'Orinda \u2014 Glorietta: family swim-club community.',
  'Orinda \u2014 Sleepy Hollow: wooded, established estates.',
  'Orinda \u2014 Orinda Country Club: historic, country-club estates.'
]);

// ============ PAGE 4: Contact Vlatka ============
doc.addPage();

sectionHeader(doc, 'COMMON RELOCATION QUESTIONS');
subSection(doc, 'Should I rent first?');
doc.fontSize(10).fillColor(textColor).text(
  'For families with school-aged kids, renting first can be useful for confirming the right town and boundary. The rental inventory is thin, so plan early. For confident buyers familiar with the area, buying directly is the more common path.',
  { width: 490 });

subSection(doc, 'How long does a typical buy take?');
doc.fontSize(10).fillColor(textColor).text(
  'On well-priced, well-prepared homes: offers in 7\u201314 days, 30-day escrow, ~45 days from list to keys. Allow more if you are doing extensive inspections or financing contingencies.',
  { width: 490 });

subSection(doc, 'Will my kids fit in?');
doc.fontSize(10).fillColor(textColor).text(
  'Lamorinda schools are tight-knit, with strong PTA and foundation cultures. New families almost always report a warm welcome \u2014 sports teams, school events, and the foundations make integration straightforward.',
  { width: 490 });

// Footer with Vlatka's branding
doc.y = 540;
doc.strokeColor(primaryColor).lineWidth(2).moveTo(60, doc.y).lineTo(550, doc.y).stroke();
doc.y += 15;

doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold')
  .text('Vlatka Bathgate', 60, doc.y);
doc.fillColor(accentColor).fontSize(12).font('Helvetica')
  .text('#1 Coldwell Banker Realtor in Orinda', 60, doc.y + 22);

doc.fillColor(textColor).fontSize(11)
  .text('Relocation specialist \u2014 22+ years serving Lamorinda families', 60, doc.y + 40);
doc.fontSize(10);
doc.text('250+ homes sold across Lafayette, Moraga & Orinda', 60, doc.y + 55);

const contactX = 350;
doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
  .text('Ready to Talk About Your Move?', contactX, 555);
doc.fillColor(textColor).font('Helvetica').fontSize(10);
doc.text('Phone:  (925) 597-1573', contactX, 575);
doc.text('Web:    orindarealty.com', contactX, 590);
doc.text('Email:  vlatka@bestlamorindahomes.com', contactX, 605);
doc.text('DRE# 01390784', contactX, 625);

doc.fillColor(lightGray).fontSize(9)
  .text('Coldwell Banker | 5 Moraga Way, Orinda, CA 94563', contactX, 645);

doc.fillColor(lightGray).fontSize(8)
  .text('\u00A9 2026 ExploreLamorinda.com | Informational only \u2014 not legal, financial, or tax advice.',
    60, 730, { align: 'center', width: 490 });

doc.end();

console.log(`PDF created: ${outputPath}`);
