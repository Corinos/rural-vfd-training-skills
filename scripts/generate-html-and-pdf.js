const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = '/Users/scottmacdonald/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function parseMarkdownDrill(content) {
  const lines = content.split('\n');
  const data = {
    drillId: '',
    title: '',
    category: '',
    standard: '',
    time: '',
    apparatus: '',
    ppe: '',
    roles: '',
    objective: '',
    equipment: [],
    safetyWatchouts: [],
    stopRule: '',
    phase1Title: '',
    phase1Steps: [],
    phase2Title: '',
    phase2Steps: [],
    phase3Title: '',
    phase3Steps: [],
    pitfalls: [],
    debriefQuestions: [],
    resetChecklist: []
  };

  let currentSection = '';
  let currentPhase = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# DRILL')) {
      const match = line.match(/^# (DRILL \d+):\s*(.+)$/i);
      if (match) {
        data.drillId = match[1];
        data.title = match[2];
      }
      continue;
    }

    if (line.includes('**Category:**')) {
      const catMatch = line.match(/\*\*Category:\*\*\s*([^|]+)/i);
      if (catMatch) data.category = catMatch[1].trim();

      const stdMatch = line.match(/\*\*Standard:\*\*\s*(.+)$/i);
      if (stdMatch) data.standard = stdMatch[1].trim();
      continue;
    }

    if (line.includes('**Est. Time:**')) {
      const timeMatch = line.match(/\*\*Est\. Time:\*\*\s*([^|]+)/i);
      if (timeMatch) data.time = timeMatch[1].trim();

      const appMatch = line.match(/\*\*Apparatus:\*\*\s*([^|]+)/i);
      if (appMatch) data.apparatus = appMatch[1].trim();

      const ppeMatch = line.match(/\*\*PPE:\*\*\s*(.+)$/i);
      if (ppeMatch) data.ppe = ppeMatch[1].trim();
      continue;
    }

    if (line.includes('**Roles:**')) {
      data.roles = line.replace(/\*\*Roles:\*\*\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('### Objective & Rural Fireground Value')) {
      currentSection = 'objective';
      continue;
    }
    if (line.startsWith('### Equipment & Station Setup')) {
      currentSection = 'equipment';
      continue;
    }
    if (line.startsWith('### Safety Officer "Watch Outs" & The STOP Rule')) {
      currentSection = 'safety';
      continue;
    }
    if (line.startsWith('### Step-by-Step Drill Progression')) {
      currentSection = 'progression';
      continue;
    }
    if (line.startsWith('### Common Pitfalls to Avoid')) {
      currentSection = 'pitfalls';
      continue;
    }
    if (line.startsWith('### Tailgate Debrief & Truck Reset Checklist')) {
      currentSection = 'debrief';
      continue;
    }

    // Process section lines
    if (currentSection === 'objective') {
      if (line.startsWith('###') || line.startsWith('---')) continue;
      if (line) {
        data.objective += (data.objective ? ' ' : '') + line;
      }
    } else if (currentSection === 'equipment') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        data.equipment.push(line.substring(2));
      }
    } else if (currentSection === 'safety') {
      if (line.includes('The STOP Rule:')) {
        data.stopRule = line.replace(/^-\s*\*\*The STOP Rule:\*\*\s*/i, '').trim();
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        data.safetyWatchouts.push(line.substring(2));
      }
    } else if (currentSection === 'progression') {
      if (line.startsWith('#### Phase 1:')) {
        currentPhase = 'phase1';
        data.phase1Title = line.replace(/^####\s*/, '').trim();
        continue;
      }
      if (line.startsWith('#### Phase 2:')) {
        currentPhase = 'phase2';
        data.phase2Title = line.replace(/^####\s*/, '').trim();
        continue;
      }
      if (line.startsWith('#### Phase 3:')) {
        currentPhase = 'phase3';
        data.phase3Title = line.replace(/^####\s*/, '').trim();
        continue;
      }

      if (currentPhase && line) {
        if (currentPhase === 'phase1') data.phase1Steps.push(line);
        if (currentPhase === 'phase2') data.phase2Steps.push(line);
        if (currentPhase === 'phase3') data.phase3Steps.push(line);
      }
    } else if (currentSection === 'pitfalls') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        data.pitfalls.push(line.substring(2));
      }
    } else if (currentSection === 'debrief') {
      if (line.includes('**Tailgate Questions:**')) {
        data.debriefQuestions.push(line.replace(/.*?\*\*Tailgate Questions:\*\*\s*/i, '').trim());
      } else if (line.startsWith('- [ ]') || line.startsWith('* [ ]')) {
        data.resetChecklist.push(line.replace(/^[-*]\s*\[\s*\]\s*/, '').trim());
      } else if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
        if (!line.includes('Checklist:')) {
          data.debriefQuestions.push(line.replace(/^\d+\.\s*/, '').trim());
        }
      }
    }
  }

  return data;
}

function renderStepsList(steps) {
  let html = '<ul class="step-list">';
  let inSublist = false;

  for (const rawLine of steps) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.match(/^\d+\.\s+\*\*(.+?)\*\*(.*)$/)) {
      if (inSublist) {
        html += '</ul>';
        inSublist = false;
      }
      const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*(.*)$/);
      html += `<li><span class="step-title">${escapeHtml(match[1])}</span> ${inlineMarkdown(match[2])}`;
    } else if (line.match(/^\d+\.\s+(.+)$/)) {
      if (inSublist) {
        html += '</ul>';
        inSublist = false;
      }
      const match = line.match(/^\d+\.\s+(.+)$/);
      html += `<li>${inlineMarkdown(match[1])}`;
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inSublist) {
        html += '<ul class="sub-steps">';
        inSublist = true;
      }
      html += `<li>${inlineMarkdown(line.substring(2))}</li>`;
    } else {
      if (inSublist) {
        html += '</ul>';
        inSublist = false;
      }
      html += `<p style="margin: 3px 0 3px 24px; font-size: 9pt; color: var(--slate-dark);">${inlineMarkdown(line)}</p>`;
    }
  }

  if (inSublist) html += '</ul>';
  html += '</ul>';
  return html;
}

function generateDrillHtml(data, level, prevDrill, nextDrill, relativeCss = '../../styles.css', isUnified = false) {
  const frontHtml = `
    <!-- FRONT SIDE (PAGE 1) -->
    <div class="page page-front">
      ${!isUnified ? '<span class="page-tag">Front Side — Page 1 of 2</span>' : ''}
      
      <div class="header-front">
        <div class="header-top-row">
          <div>
            <span class="drill-id-badge">${data.drillId}</span>
            <div class="drill-category">${data.category}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-navy">${escapeHtml(data.standard)}</span>
          </div>
        </div>
        
        <h1 class="drill-title">${data.title}</h1>
        
        <div class="meta-badges">
          <span class="badge badge-slate">⏱️ <strong>Time:</strong> ${escapeHtml(data.time)}</span>
          <span class="badge badge-slate">🚒 <strong>Apparatus:</strong> ${escapeHtml(data.apparatus)}</span>
          <span class="badge badge-red">🦺 <strong>PPE:</strong> ${escapeHtml(data.ppe)}</span>
          <span class="badge badge-slate">👥 <strong>Roles:</strong> ${escapeHtml(data.roles)}</span>
        </div>
      </div>

      <div class="objective-box">
        <h3>🎯 Objective & Rural Fireground Value</h3>
        <p>${inlineMarkdown(data.objective)}</p>
      </div>

      <div class="grid-2col">
        <div class="card card-equipment">
          <div class="card-title">📦 Tools & Apparatus Setup</div>
          <ul class="checklist">
            ${data.equipment.map(item => `<li>${inlineMarkdown(item)}</li>`).join('\n')}
          </ul>
        </div>

        <div class="card card-safety">
          <div class="card-title">⚠️ Safety Watch-Outs & STOP Rule</div>
          <ul class="checklist">
            ${data.safetyWatchouts.map(item => `<li>${inlineMarkdown(item)}</li>`).join('\n')}
          </ul>
          ${data.stopRule ? `
          <div class="stop-rule-callout">
            🛑 <strong>THE STOP RULE:</strong> ${inlineMarkdown(data.stopRule)}
          </div>` : ''}
        </div>
      </div>

      <div class="phase-card">
        <div class="phase-header">
          <span>${data.phase1Title || 'Phase 1: Tailgate Walkthrough & Mechanics'}</span>
          <span>Slow Dry Run</span>
        </div>
        <div class="phase-body">
          ${renderStepsList(data.phase1Steps)}
        </div>
      </div>

      <div class="page-footer">
        <span>Rural VFD Weekly Training Playbook • Station 2</span>
        <span class="turn-over-notice">Turn Over for Live Reps & Reset ➡️</span>
        <span>${data.drillId} • Page 1</span>
      </div>
    </div>
  `;

  const backHtml = `
    <!-- BACK SIDE (PAGE 2) -->
    <div class="page page-back">
      ${!isUnified ? '<span class="page-tag">Back Side — Page 2 of 2</span>' : ''}
      
      <div class="header-back">
        <h2>${data.drillId}: Practical Evolutions & Tailgate Debrief</h2>
        <span>${escapeHtml(data.category)} • Practical Application</span>
      </div>

      ${data.phase2Steps.length > 0 ? `
      <div class="phase-card">
        <div class="phase-header" style="background-color: var(--primary-navy);">
          <span>${data.phase2Title || 'Phase 2: Crew Practice Repetitions'}</span>
          <span>Buddy Coaching</span>
        </div>
        <div class="phase-body">
          ${renderStepsList(data.phase2Steps)}
        </div>
      </div>` : ''}

      ${data.phase3Steps.length > 0 ? `
      <div class="phase-card">
        <div class="phase-header" style="background-color: #7f1d1d;">
          <span>${data.phase3Title || 'Phase 3: Real-Time Scenario Challenge'}</span>
          <span>Timed / Stress</span>
        </div>
        <div class="phase-body">
          ${renderStepsList(data.phase3Steps)}
        </div>
      </div>` : ''}

      ${data.pitfalls.length > 0 ? `
      <div class="pitfalls-card">
        <div class="card-title">⚠️ Common Pitfalls & Fireground Hazards</div>
        <ul>
          ${data.pitfalls.map(p => `<li>${inlineMarkdown(p)}</li>`).join('\n')}
        </ul>
      </div>` : ''}

      <div class="grid-2col" style="margin-bottom: 6px;">
        <div class="debrief-card">
          <div class="card-title">🗣️ 5-Minute Tailgate Debrief</div>
          <ol>
            ${data.debriefQuestions.map(q => `<li>${inlineMarkdown(q)}</li>`).join('\n')}
          </ol>
        </div>

        <div class="reset-card">
          <div class="card-title">✅ Apparatus Reset Checklist</div>
          <ul class="checkbox-list">
            ${data.resetChecklist.map(item => `<li><span class="square-box"></span> <span>${inlineMarkdown(item)}</span></li>`).join('\n')}
          </ul>
        </div>
      </div>

      <div class="signoff-card">
        <div class="signoff-grid">
          <div class="signoff-field">
            <span class="signoff-label">Drill Leader Signature</span>
            <div class="signoff-line"></div>
          </div>
          <div class="signoff-field">
            <span class="signoff-label">Safety Officer Signature</span>
            <div class="signoff-line"></div>
          </div>
          <div class="signoff-field">
            <span class="signoff-label">Date Completed</span>
            <div class="signoff-line"></div>
          </div>
          <div class="signoff-field">
            <span class="signoff-label">Training Hours</span>
            <div class="signoff-line"></div>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span>WorkSafeNB Reg 91-191 & NFPA 1001 Certified Training Record</span>
        <span>${data.drillId} • Page 2</span>
      </div>
    </div>
  `;

  if (isUnified) {
    return frontHtml + backHtml;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.drillId}: ${data.title} - Weekly Skills Drill</title>
  <link rel="stylesheet" href="${relativeCss}">
</head>
<body>

  <div class="screen-toolbar">
    <div>
      <a href="../../index.html">⬅️ Back to Master Skills Index</a>
    </div>
    <div class="toolbar-actions">
      ${prevDrill ? `<a href="${prevDrill}.html">⬅️ Prev Drill</a>` : ''}
      ${nextDrill ? `<a href="${nextDrill}.html">Next Drill ➡️</a>` : ''}
      <button class="btn-print" onclick="window.print()">🖨️ Print Double-Sided Sheet (PDF)</button>
    </div>
  </div>

  <div class="sheet-container">
    ${frontHtml}
    ${backHtml}
  </div>

</body>
</html>`;
}

// Generate all drill HTML and PDFs
async function buildAll() {
  console.log('🚀 Starting HTML & PDF Generation for Rural VFD Skills Book...');

  const level1Dir = path.join(BASE_DIR, 'skills/level-1');
  const level2Dir = path.join(BASE_DIR, 'skills/level-2');
  
  const l1Files = fs.readdirSync(level1Dir).filter(f => f.endsWith('.md')).sort();
  const l2Files = fs.readdirSync(level2Dir).filter(f => f.endsWith('.md')).sort();

  const allDrills = [];

  // Level 1
  for (let i = 0; i < l1Files.length; i++) {
    const file = l1Files[i];
    const filePath = path.join(level1Dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parseMarkdownDrill(content);
    const baseName = path.basename(file, '.md');
    
    const prev = i > 0 ? path.basename(l1Files[i-1], '.md') : null;
    const next = i < l1Files.length - 1 ? path.basename(l1Files[i+1], '.md') : (l2Files.length > 0 ? path.basename(l2Files[0], '.md') : null);

    const html = generateDrillHtml(data, 'Level 1', prev, next, '../../styles.css');
    const outHtmlPath = path.join(BASE_DIR, 'html/skills/level-1', `${baseName}.html`);
    fs.writeFileSync(outHtmlPath, html);

    allDrills.push({
      level: 'Level 1',
      id: data.drillId,
      title: data.title,
      category: data.category,
      time: data.time,
      apparatus: data.apparatus,
      htmlRel: `skills/level-1/${baseName}.html`,
      pdfRel: `skills/level-1/${baseName}.pdf`,
      outHtmlPath,
      outPdfPath: path.join(BASE_DIR, 'pdf/skills/level-1', `${baseName}.pdf`),
      data
    });
  }

  // Level 2
  for (let i = 0; i < l2Files.length; i++) {
    const file = l2Files[i];
    const filePath = path.join(level2Dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parseMarkdownDrill(content);
    const baseName = path.basename(file, '.md');

    const prev = i > 0 ? path.basename(l2Files[i-1], '.md') : path.basename(l1Files[l1Files.length-1], '.md');
    const next = i < l2Files.length - 1 ? path.basename(l2Files[i+1], '.md') : null;

    const html = generateDrillHtml(data, 'Level 2', prev, next, '../../styles.css');
    const outHtmlPath = path.join(BASE_DIR, 'html/skills/level-2', `${baseName}.html`);
    fs.writeFileSync(outHtmlPath, html);

    allDrills.push({
      level: 'Level 2',
      id: data.drillId,
      title: data.title,
      category: data.category,
      time: data.time,
      apparatus: data.apparatus,
      htmlRel: `skills/level-2/${baseName}.html`,
      pdfRel: `skills/level-2/${baseName}.pdf`,
      outHtmlPath,
      outPdfPath: path.join(BASE_DIR, 'pdf/skills/level-2', `${baseName}.pdf`),
      data
    });
  }

  console.log(`✅ Generated ${allDrills.length} individual drill HTML files.`);

  // Build Master Interactive Index Portal
  generateIndexPortal(allDrills);

  // Build Unified Complete Binder HTML
  generateUnifiedBinder(allDrills);

  // Compile PDFs using Chrome
  console.log('🖨️ Compiling individual PDFs via Headless Chrome...');
  for (const item of allDrills) {
    process.stdout.write(`  Generating PDF for ${item.id}... `);
    try {
      execSync(`"${CHROME_PATH}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${item.outPdfPath}" "${item.outHtmlPath}" 2>/dev/null`);
      console.log('OK');
    } catch (e) {
      console.log('Error:', e.message);
    }
  }

  console.log('🖨️ Compiling Master Complete Binder PDF (all 28 drills in one file)...');
  const unifiedHtmlPath = path.join(BASE_DIR, 'html/full-binder.html');
  const unifiedPdfPath = path.join(BASE_DIR, 'pdf/Rural_VFD_Weekly_Skills_Manual_Complete.pdf');
  try {
    execSync(`"${CHROME_PATH}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${unifiedPdfPath}" "${unifiedHtmlPath}" 2>/dev/null`);
    console.log(`✅ Complete Binder PDF compiled successfully: ${unifiedPdfPath}`);
  } catch (e) {
    console.log('Error compiling unified PDF:', e.message);
  }

  console.log('🎉 Generation complete!');
}

function generateIndexPortal(allDrills) {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rural VFD Weekly Skills Training Manual - Station Portal</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    .portal-container {
      max-width: 1100px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .portal-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 35px 30px;
      border-radius: 12px;
      margin-bottom: 25px;
      border-left: 8px solid var(--fire-red);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .portal-hero h1 {
      font-size: 26pt;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .portal-hero p {
      font-size: 12pt;
      color: #cbd5e1;
      max-width: 800px;
      line-height: 1.5;
    }
    .portal-meta-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    .hero-btn {
      background: var(--fire-red);
      color: #ffffff;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10.5pt;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .hero-btn:hover {
      background: #dc2626;
    }
    .hero-btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .hero-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .filter-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--slate-border);
      padding-bottom: 10px;
    }
    .tab-btn {
      background: none;
      border: none;
      font-size: 11pt;
      font-weight: 700;
      color: var(--slate-medium);
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
    }
    .tab-btn.active {
      background: var(--primary-navy);
      color: #ffffff;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 15px;
    }
    .skill-card {
      background: #ffffff;
      border: 1px solid var(--slate-border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .skill-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
      border-color: var(--slate-dark);
    }
    .card-top {
      margin-bottom: 12px;
    }
    .badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .card-title-link {
      font-size: 12.5pt;
      font-weight: 800;
      color: var(--primary-navy);
      text-decoration: none;
      line-height: 1.25;
      display: block;
      margin-bottom: 6px;
    }
    .card-title-link:hover {
      color: var(--fire-red);
    }
    .card-category-label {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--slate-medium);
    }
    .card-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--slate-light);
      padding-top: 10px;
      margin-top: 10px;
    }
    .action-link {
      font-size: 9pt;
      font-weight: 700;
      text-decoration: none;
      color: var(--fire-red);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .action-link:hover {
      text-decoration: underline;
    }
    .pdf-link {
      color: var(--slate-dark);
    }
  </style>
</head>
<body>

  <div class="portal-container">
    <div class="portal-hero">
      <span class="badge badge-red" style="font-size: 10pt; margin-bottom: 8px;">Station 2 • New Brunswick</span>
      <h1>Weekly Skills Training Manual</h1>
      <p>Turnkey, double-sided 1-page skills drills aligned with NFPA 1001 Level 1 & Level 2 and WorkSafeNB General Regulation 91-191. Ready to run by any senior firefighter when officers are unavailable.</p>
      
      <div class="portal-meta-bar">
        <a href="../pdf/Rural_VFD_Weekly_Skills_Manual_Complete.pdf" class="hero-btn" target="_blank">📥 Download Complete Binder PDF (56 Pages)</a>
        <a href="full-binder.html" class="hero-btn hero-btn-secondary" target="_blank">🖨️ View Print-All HTML Binder</a>
        <a href="../HOW_TO_USE.md" class="hero-btn hero-btn-secondary">📖 Officer-less Playbook</a>
        <a href="../ANNUAL_TRAINING_SCHEDULE.md" class="hero-btn hero-btn-secondary">📅 52-Week Schedule</a>
      </div>
    </div>

    <div class="filter-tabs">
      <button class="tab-btn active" onclick="filterDrills('all', this)">All Drills (28)</button>
      <button class="tab-btn" onclick="filterDrills('Level 1', this)">Level 1 (NFPA 1001 FF I)</button>
      <button class="tab-btn" onclick="filterDrills('Level 2', this)">Level 2 (NFPA 1001 FF II)</button>
    </div>

    <div class="skills-grid" id="drillsGrid">
      ${allDrills.map(d => `
      <div class="skill-card" data-level="${d.level}">
        <div class="card-top">
          <div class="badge-row">
            <span class="drill-id-badge" style="font-size: 11px; padding: 2px 6px;">${d.id}</span>
            <span class="badge badge-navy" style="font-size: 8pt;">${d.level}</span>
          </div>
          <div class="card-category-label">${escapeHtml(d.category)}</div>
          <a href="${d.htmlRel}" class="card-title-link">${escapeHtml(d.title)}</a>
          <div style="font-size: 8.5pt; color: var(--slate-dark); margin-top: 4px;">
            ⏱️ ${escapeHtml(d.time)} • 🚒 ${escapeHtml(d.apparatus)}
          </div>
        </div>
        <div class="card-action-bar">
          <a href="${d.htmlRel}" class="action-link">🖥️ Interactive Sheet</a>
          <a href="../pdf/${d.pdfRel}" class="action-link pdf-link" target="_blank">📄 Download PDF</a>
        </div>
      </div>`).join('\n')}
    </div>
  </div>

  <script>
    function filterDrills(level, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cards = document.querySelectorAll('.skill-card');
      cards.forEach(card => {
        if (level === 'all' || card.getAttribute('data-level') === level) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(BASE_DIR, 'html/index.html'), indexHtml);
}

function generateUnifiedBinder(allDrills) {
  const binderHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Complete Rural VFD Skills Training Manual - Station Binder</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    @media print {
      .page-front { page-break-after: always !important; }
      .page-back { page-break-after: always !important; }
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <div>
      <a href="index.html">⬅️ Back to Skills Portal</a>
    </div>
    <div class="toolbar-actions">
      <button class="btn-print" onclick="window.print()">🖨️ Print Entire 28-Drill Binder</button>
    </div>
  </div>

  <div class="sheet-container" style="gap: 0;">
    ${allDrills.map(d => generateDrillHtml(d.data, d.level, null, null, 'styles.css', true)).join('\n')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(BASE_DIR, 'html/full-binder.html'), binderHtml);
}

buildAll();
