const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'static', 'downloads');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  info: {
    Title: 'Lamorinda Seller\'s Prep Guide',
    Author: 'Vlatka Bathgate - Coldwell Banker',
    Subject: 'Complete prep guide for selling a home in Lafayette, Moraga, or Orinda',
    Keywords: 'Lamorinda, real estate, home selling, prep, Orinda, Lafayette, Moraga'
  }
});

const outputPath = path.join(outputDir, 'lamorinda-sellers-prep-guide.pdf');
doc.pipe(fs.createWriteStream(outputPath));

const primaryColor = '#2C5530';
const accentColor = '#8B4513';
const textColor = '#333333';
const lightGray = '#666666';

function checkbox(doc, x, y, label, indent = 0) {
  doc.rect(x + indent, y, 12, 12).stroke(primaryColor);
  doc.fillColor(textColor).fontSize(11).text(label, x + indent + 18, y + 1, { width: 430 - indent });
  return doc.y + 5;
}

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
  doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold').text(title);
  doc.fillColor(textColor).font('Helvetica').fontSize(11);
  return doc;
}

// ============ PAGE 1: Cover & Timing ============
doc.fillColor(primaryColor).fontSize(28).font('Helvetica-Bold')
  .text('LAMORINDA', { align: 'center' });
doc.fontSize(16).font('Helvetica')
  .text('Seller\'s Prep Guide', { align: 'center' });
doc.moveDown(0.3);
doc.fillColor(lightGray).fontSize(10)
  .text('How to Maximize the Sale of Your Lafayette, Moraga, or Orinda Home', { align: 'center' });
doc.moveDown(1);

doc.fillColor(primaryColor).rect(60, doc.y, 490, 80).fill();
doc.fillColor('white').fontSize(11).font('Helvetica')
  .text('Lamorinda buyers are sophisticated. They pay premium prices, but they also expect a polished, well-documented home. This guide walks sellers through timing, prep, pricing, and the small choices that move the final number.',
    75, doc.y - 70, { width: 460, align: 'center' });

doc.y = doc.y + 25;

sectionHeader(doc, 'STEP 1: TIMING THE MARKET');
doc.fontSize(10).fillColor(lightGray)
  .text('Spring is the strongest selling season in Lamorinda, driven by school-aligned moves. A second window opens late summer / early fall.', { width: 490 });
doc.moveDown(0.3);

let y = doc.y;
y = checkbox(doc, 60, y, 'Pick a target list date 6\u20138 weeks out for prep runway');
y = checkbox(doc, 60, y, 'Aim for March\u2013May or late August\u2013October if possible');
y = checkbox(doc, 60, y, 'Coordinate with your buy-side timeline if also buying');
y = checkbox(doc, 60, y, 'Avoid listing the week of major holidays');
y = checkbox(doc, 60, y, 'Check upcoming open-house competition in your immediate area');
doc.y = y;

subSection(doc, 'Lamorinda-Specific Timing Notes');
doc.fontSize(10).fillColor(textColor).text(
  '\u2022 School calendar drives demand: most family buyers want to close by July to enroll.\n' +
  '\u2022 Lafayette downtown condos peak with the spring BART commuter shopping window.\n' +
  '\u2022 Hillside homes show better when fire-zone visibility is best \u2014 spring or late fall.\n' +
  '\u2022 Country-club neighborhoods often coordinate among neighbors; ask before listing.',
  { width: 490 });

// ============ PAGE 2: Prep ============
doc.addPage();

sectionHeader(doc, 'STEP 2: PRE-LIST PREP');
doc.fontSize(10).fillColor(lightGray)
  .text('In Lamorinda, presentation pays back multiples. Buyers compare your home directly against the freshest, best-staged listings in town.', { width: 490 });
doc.moveDown(0.3);

subSection(doc, 'Documents to Gather');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Original purchase documents and any permits on file');
y = checkbox(doc, 60, y, 'Recent utility bills (PG&E, EBMUD, sewer or septic service)');
y = checkbox(doc, 60, y, 'Septic service history (if applicable) \u2014 critical for resale');
y = checkbox(doc, 60, y, 'Solar lease or PPA contracts (if applicable)');
y = checkbox(doc, 60, y, 'HOA or country-club documents (if applicable)');
y = checkbox(doc, 60, y, 'Roof, HVAC, and water-heater install dates and warranties');
y = checkbox(doc, 60, y, 'Wildfire mitigation receipts (defensible space, vent screens, roof)');
doc.y = y;

subSection(doc, 'Inspections to Order Before Listing');
doc.fontSize(10).fillColor(textColor).text(
  'Pre-listing inspections are now standard in Lamorinda. Buyers expect a clean package. Plan for:',
  { width: 490 });
y = doc.y + 5;
y = checkbox(doc, 60, y, 'General home inspection');
y = checkbox(doc, 60, y, 'Pest/termite (WDI/WDO) inspection');
y = checkbox(doc, 60, y, 'Roof inspection');
y = checkbox(doc, 60, y, 'Sewer lateral camera (private sewer lateral compliance: critical)');
y = checkbox(doc, 60, y, 'Septic inspection (if applicable)');
y = checkbox(doc, 60, y, 'Chimney inspection (if wood-burning fireplace)');
y = checkbox(doc, 60, y, 'Pool/spa inspection (if applicable)');
y = checkbox(doc, 60, y, 'Natural Hazard Disclosure (NHD) report');
doc.y = y;

subSection(doc, 'Physical Prep');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Declutter and depersonalize \u2014 buyers want to project themselves in');
y = checkbox(doc, 60, y, 'Paint touch-ups in neutral tones');
y = checkbox(doc, 60, y, 'Deep clean carpets, windows, and grout');
y = checkbox(doc, 60, y, 'Power-wash exterior, walkways, and decks');
y = checkbox(doc, 60, y, 'Refresh landscaping \u2014 first impression matters');
y = checkbox(doc, 60, y, 'Defensible space cleanup (CAL FIRE 100-ft zone)');
y = checkbox(doc, 60, y, 'Stage \u2014 even occupied homes benefit from a stager\'s eye');

// ============ PAGE 3: Pricing & Marketing ============
doc.addPage();

sectionHeader(doc, 'STEP 3: PRICING STRATEGY');
doc.fontSize(10).fillColor(textColor).text(
  'In Lamorinda, pricing is a tactical choice, not a guess. The right list price drives traffic, momentum, and multiple offers. The wrong one stalls the listing and prints a permanent mark on Days on Market.',
  { width: 490 });
doc.moveDown(0.3);
subSection(doc, 'Two viable strategies');
doc.fontSize(10).fillColor(textColor).text(
  '\u2022 Price-to-market: list at honest fair value with a 7\u201310 day offer review window. Works when the market is hot enough to draw a strong buyer pool.\n' +
  '\u2022 Price-to-create-competition: list slightly below comps to drive a deeper buyer pool and let bidding find true value. Common in spring, riskier in soft markets.',
  { width: 490 });
doc.moveDown(0.3);
subSection(doc, 'Pricing red flags to avoid');
doc.fontSize(10).fillColor(textColor).text(
  '\u2022 Pricing to your mortgage balance, not the market.\n' +
  '\u2022 Pricing high to "test" and lower later \u2014 the data trail kills future offers.\n' +
  '\u2022 Ignoring the most recent 60 days of closed comps in the exact school boundary.',
  { width: 490 });

sectionHeader(doc, 'STEP 4: MARKETING');
doc.fontSize(10).fillColor(lightGray)
  .text('Lamorinda buyers research deeply before stepping inside. The marketing package needs to answer their questions before they ask.', { width: 490 });
doc.moveDown(0.3);
y = doc.y;
y = checkbox(doc, 60, y, 'Professional photography (daylight + twilight where it helps)');
y = checkbox(doc, 60, y, 'Drone / aerial imagery (especially for hillsides and lots)');
y = checkbox(doc, 60, y, 'Floor plan with dimensions (now a buyer expectation)');
y = checkbox(doc, 60, y, '3D tour (Matterport or equivalent)');
y = checkbox(doc, 60, y, 'Property website with disclosure package downloadable');
y = checkbox(doc, 60, y, 'Multi-channel: MLS, Coldwell Banker network, local print, social');
y = checkbox(doc, 60, y, 'Coordinated open house schedule (weekend + broker tour)');
y = checkbox(doc, 60, y, 'Neighbor outreach \u2014 great buyers often live one street away');
doc.y = y;

sectionHeader(doc, 'STEP 5: OFFER REVIEW & ESCROW');
y = doc.y;
y = checkbox(doc, 60, y, 'Set a clear offer review date in the listing');
y = checkbox(doc, 60, y, 'Pre-screen buyer financing strength with their lender');
y = checkbox(doc, 60, y, 'Evaluate price AND terms (contingencies, close timing, rent-back)');
y = checkbox(doc, 60, y, 'Counter strategically \u2014 sometimes the best deal is not the highest');
y = checkbox(doc, 60, y, 'Track inspection negotiations carefully \u2014 re-trades are common');

// ============ PAGE 4: Contact & Notes ============
doc.addPage();

// Quick reference box
doc.fillColor('#f5f5f5').rect(60, 60, 490, 130).fill();
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
  .text('SELLER QUICK FACTS', 75, 75);
doc.fillColor(textColor).fontSize(10).font('Helvetica');

const col1X = 75;
const col2X = 310;
let refY = 100;

doc.font('Helvetica-Bold').text('Typical timeline', col1X, refY);
doc.font('Helvetica').text('6\u20138 weeks prep\n7\u201314 days on market\n30-day escrow', col1X, refY + 15, { width: 200 });

doc.font('Helvetica-Bold').text('Closing costs', col2X, refY);
doc.font('Helvetica').text('~5\u20136% of price\nIncludes commissions,\ntransfer tax, fees', col2X, refY + 15, { width: 200 });

refY += 60;
doc.font('Helvetica-Bold').text('Sewer lateral', col1X, refY);
doc.font('Helvetica').text('Compliance certificate\noften required at sale.\nVerify your district.', col1X, refY + 15, { width: 200 });

doc.font('Helvetica-Bold').text('Fire mitigation', col2X, refY);
doc.font('Helvetica').text('Defensible space matters\nfor buyer insurance\nand appraisal.', col2X, refY + 15, { width: 200 });

doc.y = 210;

sectionHeader(doc, 'YOUR NOTES');
doc.strokeColor(lightGray);
for (let i = 0; i < 8; i++) {
  doc.moveTo(60, doc.y).lineTo(550, doc.y).stroke();
  doc.y += 25;
}

// Footer with Vlatka's branding
doc.y = 540;
doc.strokeColor(primaryColor).lineWidth(2).moveTo(60, doc.y).lineTo(550, doc.y).stroke();
doc.y += 15;

doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold')
  .text('Vlatka Bathgate', 60, doc.y);
doc.fillColor(accentColor).fontSize(12).font('Helvetica')
  .text('#1 Coldwell Banker Realtor in Orinda', 60, doc.y + 22);

doc.fillColor(textColor).fontSize(11)
  .text('22+ years selling Lamorinda homes', 60, doc.y + 40);
doc.fontSize(10);
doc.text('250+ homes sold across Lafayette, Moraga & Orinda', 60, doc.y + 55);

const contactX = 350;
doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
  .text('Considering Selling?', contactX, 555);
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
