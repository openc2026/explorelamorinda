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
    Title: 'Lamorinda Home Buyer\'s Checklist',
    Author: 'Vlatka Bathgate - Coldwell Banker',
    Subject: 'Complete guide to buying a home in Lafayette, Moraga, and Orinda',
    Keywords: 'Lamorinda, real estate, home buying, checklist, Orinda, Lafayette, Moraga'
  }
});

const outputPath = path.join(outputDir, 'lamorinda-home-buyers-checklist.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Colors
const primaryColor = '#2C5530';  // Dark green
const accentColor = '#8B4513';   // Saddle brown
const textColor = '#333333';
const lightGray = '#666666';

// Helper function for checkboxes
function checkbox(doc, x, y, label, indent = 0) {
  doc.rect(x + indent, y, 12, 12).stroke(primaryColor);
  doc.fillColor(textColor).fontSize(11).text(label, x + indent + 18, y + 1, { width: 430 - indent });
  return doc.y + 5;
}

// Helper for section headers
function sectionHeader(doc, title, icon = '▶') {
  doc.moveDown(0.5);
  doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
    .text(`${icon} ${title}`, { continued: false });
  doc.moveDown(0.3);
  doc.fillColor(textColor).font('Helvetica');
  return doc;
}

// Helper for subsection
function subSection(doc, title) {
  doc.moveDown(0.3);
  doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold')
    .text(title);
  doc.fillColor(textColor).font('Helvetica').fontSize(11);
  return doc;
}

// ============ PAGE 1: Cover & Pre-Approval ============

// Header with branding
doc.fillColor(primaryColor).fontSize(28).font('Helvetica-Bold')
  .text('LAMORINDA', { align: 'center' });
doc.fontSize(16).font('Helvetica')
  .text('Home Buyer\'s Checklist', { align: 'center' });
doc.moveDown(0.5);

doc.fillColor(lightGray).fontSize(10)
  .text('Your Complete Guide to Buying in Lafayette, Moraga & Orinda', { align: 'center' });

doc.moveDown(1);

// Intro box
doc.fillColor(primaryColor).rect(60, doc.y, 490, 80).fill();
doc.fillColor('white').fontSize(11).font('Helvetica')
  .text('Lamorinda\'s competitive market rewards prepared buyers. This checklist covers everything from getting pre-approved to closing day—with specific guidance for our unique hills, older homes, fire zones, and local market dynamics.', 75, doc.y - 70, { width: 460, align: 'center' });

doc.y = doc.y + 20;

// PRE-APPROVAL SECTION
sectionHeader(doc, 'STEP 1: GET PRE-APPROVED (Do This First!)');

doc.fontSize(10).fillColor(lightGray)
  .text('In Lamorinda\'s competitive market, sellers often won\'t consider offers without pre-approval. Start here.', { width: 490 });
doc.moveDown(0.5);

let y = doc.y;
y = checkbox(doc, 60, y, 'Check credit scores (aim for 720+ for best rates)');
y = checkbox(doc, 60, y, 'Gather documents: 2 years tax returns, W-2s, pay stubs, bank statements');
y = checkbox(doc, 60, y, 'Calculate debt-to-income ratio (should be under 43%)');
y = checkbox(doc, 60, y, 'Get pre-approved by 2-3 lenders to compare rates');
y = checkbox(doc, 60, y, 'Understand the difference: pre-qualification vs pre-approval');
y = checkbox(doc, 60, y, 'Ask about: jumbo loan requirements (most Lamorinda homes exceed conforming limits)');
y = checkbox(doc, 60, y, 'Lock in rate timing strategy with your lender');

doc.y = y;

subSection(doc, 'Lamorinda-Specific Financing Notes:');
doc.fontSize(10).fillColor(textColor)
  .text('• Most homes here exceed $1.5M, requiring jumbo loans with different requirements\n• Down payments typically 20%+ for jumbo; some lenders require 25%\n• Some hills properties may have limitations on certain loan types\n• Cash offers common—discuss competitiveness strategies with your agent', { width: 490 });

// LAMORINDA CONCERNS SECTION
sectionHeader(doc, 'STEP 2: UNDERSTAND LAMORINDA-SPECIFIC CONCERNS');

subSection(doc, 'Hills & Terrain');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Understand grading and drainage issues common in hillside homes');
y = checkbox(doc, 60, y, 'Check for retaining wall conditions and history');
y = checkbox(doc, 60, y, 'Assess driveway steepness and winter weather impact');
y = checkbox(doc, 60, y, 'Verify structural engineering if home is on slope');
y = checkbox(doc, 60, y, 'Check soil stability reports if available');

doc.y = y;

subSection(doc, 'Older Homes (Many Built 1950s-1980s)');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Original plumbing (galvanized pipes may need replacement)');
y = checkbox(doc, 60, y, 'Electrical panel age and capacity (100 amp may not support modern needs)');
y = checkbox(doc, 60, y, 'Foundation type and condition (many have post-and-pier or raised)');
y = checkbox(doc, 60, y, 'Insulation adequacy (many older homes lack proper insulation)');
y = checkbox(doc, 60, y, 'Seismic retrofitting status');

// ============ PAGE 2 ============
doc.addPage();

subSection(doc, 'Septic vs. Sewer — Critical for Lamorinda');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Determine if property is on septic or public sewer');
y = checkbox(doc, 60, y, 'If septic: Get septic inspection (separate from home inspection)');
y = checkbox(doc, 60, y, 'If septic: Verify tank size is adequate for home (3+ bedrooms need larger)');
y = checkbox(doc, 60, y, 'If septic: Check when last pumped and serviced');
y = checkbox(doc, 60, y, 'If septic: Understand leach field location and condition');
y = checkbox(doc, 60, y, 'If septic: Budget $20K-$50K+ for potential replacement');

doc.y = y;

subSection(doc, 'Fire Zones & Wildfire Risk');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Check if property is in State Responsibility Area (SRA) or fire hazard zone');
y = checkbox(doc, 60, y, 'Verify fire insurance availability and cost (some areas difficult to insure)');
y = checkbox(doc, 60, y, 'Assess defensible space around property');
y = checkbox(doc, 60, y, 'Check for fire-resistant roofing, vents, and siding');
y = checkbox(doc, 60, y, 'Review Moraga-Orinda Fire District or ConFire requirements');
y = checkbox(doc, 60, y, 'Understand evacuation routes');

doc.y = y;
doc.moveDown(0.3);

doc.fillColor(accentColor).fontSize(10).font('Helvetica-Oblique')
  .text('⚠️ Important: Fire insurance has become extremely expensive or unavailable in some hillside areas. Research this BEFORE making an offer.', { width: 490 });
doc.font('Helvetica');

// INSPECTIONS SECTION
sectionHeader(doc, 'STEP 3: INSPECTIONS — LAMORINDA EDITION');

doc.fontSize(10).fillColor(lightGray)
  .text('Standard inspections plus Lamorinda-specific concerns. Budget $1,500-$3,000+ for comprehensive inspections.', { width: 490 });
doc.moveDown(0.5);

subSection(doc, 'Essential Inspections');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'General home inspection (3-4 hours for older/larger homes)');
y = checkbox(doc, 60, y, 'Pest/termite inspection (WDI/WDO report)');
y = checkbox(doc, 60, y, 'Roof inspection (especially for shake or tile roofs common here)');
y = checkbox(doc, 60, y, 'Sewer lateral inspection (camera scope)—CRITICAL for older homes');
y = checkbox(doc, 60, y, 'Chimney inspection if wood-burning fireplace');

doc.y = y;

subSection(doc, 'Recommended Additional Inspections');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Foundation/structural engineer (if hillside or concerns noted)');
y = checkbox(doc, 60, y, 'Pool/spa inspection (common in Lamorinda)');
y = checkbox(doc, 60, y, 'Septic inspection (if applicable)');
y = checkbox(doc, 60, y, 'Geological/soils report (for hillside properties)');
y = checkbox(doc, 60, y, 'Radon testing (elevated levels found in some areas)');
y = checkbox(doc, 60, y, 'HVAC inspection (especially if system is 15+ years old)');

doc.y = y;

subSection(doc, 'What to Look For in Lamorinda Inspections');
doc.fontSize(10).fillColor(textColor)
  .text('• Water intrusion signs in basements and lower levels\n• Evidence of settling or movement (cracked stucco, sticky doors)\n• Condition of wood decks and exterior wood (dry rot common)\n• Hot tub and pool equipment age and condition\n• Irrigation and landscaping water usage', { width: 490 });

// ============ PAGE 3 ============
doc.addPage();

// TIMELINE SECTION
sectionHeader(doc, 'STEP 4: TIMELINE FOR COMPETITIVE MARKET');

doc.fontSize(10).fillColor(lightGray)
  .text('Lamorinda moves fast. Well-priced homes often receive multiple offers within days. Here\'s what to expect:', { width: 490 });
doc.moveDown(0.5);

// Timeline visual
const timelineData = [
  { phase: 'Pre-Approval', time: '1-2 weeks', desc: 'Get finances in order before you start looking' },
  { phase: 'Home Search', time: '2-8 weeks', desc: 'Depends on inventory and your flexibility' },
  { phase: 'Make Offer', time: '1-3 days', desc: 'Move quickly when you find "the one"' },
  { phase: 'Under Contract', time: '21-30 days', desc: 'Inspections, appraisal, loan processing' },
  { phase: 'Closing', time: '1 day', desc: 'Sign papers, get keys!' }
];

y = doc.y;
timelineData.forEach((item, i) => {
  doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
    .text(item.phase, 60, y);
  doc.fillColor(accentColor).fontSize(10).font('Helvetica')
    .text(item.time, 200, y);
  doc.fillColor(textColor)
    .text(item.desc, 280, y, { width: 250 });
  y += 25;
});

doc.y = y;

subSection(doc, 'Competitive Offer Strategies');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Get fully underwritten pre-approval (stronger than standard)');
y = checkbox(doc, 60, y, 'Write a personal letter to sellers (still works in Lamorinda!)');
y = checkbox(doc, 60, y, 'Consider removing/shortening contingencies strategically');
y = checkbox(doc, 60, y, 'Have funds ready for appraisal gap coverage');
y = checkbox(doc, 60, y, 'Be flexible on closing date and rent-back');
y = checkbox(doc, 60, y, 'Respond quickly—hours matter in multiple offer situations');

doc.y = y;

// QUESTIONS SECTION
sectionHeader(doc, 'STEP 5: QUESTIONS TO ASK YOUR AGENT');

subSection(doc, 'About the Property');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'How long has it been on market? Any price reductions?');
y = checkbox(doc, 60, y, 'Are there any offers? What\'s the offer deadline?');
y = checkbox(doc, 60, y, 'Why are the sellers moving?');
y = checkbox(doc, 60, y, 'What\'s included vs. excluded in the sale?');
y = checkbox(doc, 60, y, 'Any known issues or recent repairs?');
y = checkbox(doc, 60, y, 'What are the HOA fees and rules? (if applicable)');
y = checkbox(doc, 60, y, 'Property tax amount and any special assessments?');

doc.y = y;

subSection(doc, 'About the Neighborhood');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'Which school attendance area is this property in?');
y = checkbox(doc, 60, y, 'What\'s the commute like to SF/Oakland at rush hour?');
y = checkbox(doc, 60, y, 'Any development planned nearby?');
y = checkbox(doc, 60, y, 'How\'s parking during school drop-off/pickup? (relevant for many areas)');
y = checkbox(doc, 60, y, 'Wildlife issues? (deer, turkeys, occasional mountain lions)');

doc.y = y;

subSection(doc, 'About the Offer Process');
y = doc.y + 5;
y = checkbox(doc, 60, y, 'What\'s the likely competition level?');
y = checkbox(doc, 60, y, 'What terms would make our offer stand out?');
y = checkbox(doc, 60, y, 'Should we do pre-inspections before offering?');
y = checkbox(doc, 60, y, 'What\'s your recommended offer strategy?');

// ============ PAGE 4: Final Page with Vlatka's Info ============
doc.addPage();

// Quick reference box
doc.fillColor('#f5f5f5').rect(60, 60, 490, 150).fill();
doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
  .text('QUICK REFERENCE: LAMORINDA AT A GLANCE', 75, 75);
doc.fillColor(textColor).fontSize(10).font('Helvetica');

const col1X = 75;
const col2X = 310;
let refY = 100;

doc.font('Helvetica-Bold').text('Lafayette', col1X, refY);
doc.font('Helvetica').text('Most walkable, BART access\nMedian: $2.0M-$2.8M', col1X, refY + 15, { width: 200 });

doc.font('Helvetica-Bold').text('Moraga', col2X, refY);
doc.font('Helvetica').text('Quieter, larger lots\nMedian: $1.8M-$2.4M', col2X, refY + 15, { width: 200 });

refY += 55;
doc.font('Helvetica-Bold').text('Orinda', col1X, refY);
doc.font('Helvetica').text('Classic hills, BART access\nMedian: $2.2M-$3.0M+', col1X, refY + 15, { width: 200 });

doc.font('Helvetica-Bold').text('School District', col2X, refY);
doc.font('Helvetica').text('Acalanes Union HSD\nTop-rated public schools', col2X, refY + 15, { width: 200 });

doc.y = 230;

// Notes section
sectionHeader(doc, 'YOUR NOTES');
doc.strokeColor(lightGray);
for (let i = 0; i < 8; i++) {
  doc.moveTo(60, doc.y).lineTo(550, doc.y).stroke();
  doc.y += 25;
}

// Footer with Vlatka's branding
doc.y = 580;
doc.strokeColor(primaryColor).lineWidth(2).moveTo(60, doc.y).lineTo(550, doc.y).stroke();
doc.y += 15;

doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold')
  .text('Vlatka Bathgate', 60, doc.y);
doc.fillColor(accentColor).fontSize(12).font('Helvetica')
  .text('#1 Coldwell Banker Realtor in Orinda', 60, doc.y + 22);

doc.fillColor(textColor).fontSize(11)
  .text('Over 22 years serving Lamorinda families', 60, doc.y + 40);
doc.fontSize(10);
doc.text('250+ homes sold in Lafayette, Moraga & Orinda', 60, doc.y + 55);

// Contact info - right side
const contactX = 350;
doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
  .text('Ready to Start Your Search?', contactX, 595);
doc.fillColor(textColor).font('Helvetica').fontSize(10);
doc.text('📞  (925) 597-1573', contactX, 615);
doc.text('🌐  orindarealty.com', contactX, 630);
doc.text('📧  vlatka@bestlamorindahomes.com', contactX, 645);
doc.text('DRE# 01390784', contactX, 665);

doc.fillColor(lightGray).fontSize(9)
  .text('Coldwell Banker | 5 Moraga Way, Orinda, CA 94563', contactX, 685);

// Final footer
doc.fillColor(lightGray).fontSize(8)
  .text('© 2026 ExploreLamorinda.com | This checklist is for informational purposes only.', 60, 730, { align: 'center', width: 490 });

doc.end();

console.log(`PDF created: ${outputPath}`);
