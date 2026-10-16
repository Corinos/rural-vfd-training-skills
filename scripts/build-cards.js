const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = '/Users/scottmacdonald/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// 1. Drill Leader Card
const leaderCardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Drill Leader Pocket Card - Rural VFD</title>
  <link rel="stylesheet" href="../styles.css">
  <style>
    .card-page {
      max-width: 8.5in;
      min-height: 11in;
      background: #ffffff;
      margin: 20px auto;
      padding: 0.4in;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .rule-box {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .step-card {
      border: 1px solid var(--slate-border);
      border-radius: 6px;
      overflow: hidden;
    }
    .step-header {
      background: var(--primary-navy);
      color: #ffffff;
      padding: 6px 12px;
      font-weight: 800;
      font-size: 10pt;
      display: flex;
      justify-content: space-between;
    }
    .step-content {
      padding: 8px 12px;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    .step-content ul {
      margin-left: 18px;
      margin-top: 3px;
    }
    .step-content li {
      margin-bottom: 3px;
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <a href="../index.html">⬅️ Back to Skills Portal</a>
    <button class="btn-print" onclick="window.print()">🖨️ Print Laminated Pocket Card (PDF)</button>
  </div>

  <div class="card-page">
    <div>
      <div class="badge-bar">
        <span class="drill-id-badge" style="background: var(--primary-navy);">POCKET REFERENCE</span>
        <span class="badge badge-red">LAMINATE & KEEP IN CAB</span>
      </div>
      <h1 style="font-size: 20pt; text-transform: uppercase; color: var(--primary-navy); margin-bottom: 4px;">Quick Drill Leader Card</h1>
      <div style="font-size: 11pt; font-weight: 700; color: var(--fire-red); margin-bottom: 10px;">"I'm Running Training Tonight" (No Officer Required)</div>

      <div class="rule-box">
        <strong>The Golden Rule:</strong> You do <em>not</em> need to give a lecture. Your role is simply to hold the sheet, read the objectives, stage the gear, keep time, and guide the crew through practical repetitions.
      </div>

      <div class="steps-container">
        <div class="step-card">
          <div class="step-header">
            <span>STEP 1: GATHER THE CREW & SET ROLES</span>
            <span>3 MINUTES</span>
          </div>
          <div class="step-content">
            1. Call the room to order at 19:00 (7:00 PM).<br>
            2. <strong>Assign Drill Safety Officer:</strong> Hand them the Safety Officer card. Remind them: <em>"Your only job is watching for hazards and calling STOP if needed. No physical reps while on safety watch."</em><br>
            3. <strong>Pick Tonight's Drill:</strong> Check the 52-week schedule or pull the next sheet from the binder. Read Objective and Safety Warnings aloud.
          </div>
        </div>

        <div class="step-card">
          <div class="step-header">
            <span>STEP 2: TOOL STAGING & RADIO CHECK</span>
            <span>7 MINUTES</span>
          </div>
          <div class="step-content">
            1. Direct crew to pull the specific tools and apparatus listed on the drill sheet.<br>
            2. <strong>WorkSafeNB Reg 91-191 PPE Check:</strong> Bunker gear, boots, gloves, flash hood tucked under collar, helmet chinstrap fastened. All rings, watches, and jewellery OFF.<br>
            3. Switch all handheld radios to local tactical channel (e.g. Tac 1). Perform a quick radio check.
          </div>
        </div>

        <div class="step-card">
          <div class="step-header">
            <span>STEP 3: PHASE 1 – THE SLOW WALKTHROUGH</span>
            <span>10–15 MINUTES</span>
          </div>
          <div class="step-content">
            1. Walk through the evolution step-by-step with the sheet in your hand.<br>
            2. <strong>No stopwatch.</strong> Half speed only. Have an experienced member demonstrate.<br>
            3. Ask: <em>"How does our truck differ from the textbook?"</em>, <em>"Where is this valve on Pumper 1 vs Tanker 2?"</em>
          </div>
        </div>

        <div class="step-card">
          <div class="step-header">
            <span>STEP 4: PHASES 2 & 3 – LIVE REPETITIONS & SCENARIO</span>
            <span>25–35 MINUTES</span>
          </div>
          <div class="step-content">
            1. Split crew into pairs (Buddy System). Rotate through 2–3 repetitions so everyone gets hands-on time.<br>
            2. Experienced members coach newer members.<br>
            3. <strong>Phase 3 Challenge:</strong> Add realistic stress (gloved hands, darkened bay, reversed hoods, or timed flow).<br>
            4. Remind everyone: <strong>Anyone can yell "STOP!" if something is unsafe.</strong>
          </div>
        </div>

        <div class="step-card">
          <div class="step-header">
            <span>STEP 5: TAILGATE DEBRIEF & TRUCK RESET</span>
            <span>10 MINUTES</span>
          </div>
          <div class="step-content">
            1. Gather at the tailboard of the primary truck. Ask the 3 Debrief Questions:
            <ul>
              <li><strong>"What went smooth and fast?"</strong></li>
              <li><strong>"What snagged or slowed us down?"</strong></li>
              <li><strong>"If this was 02:00 AM on a snowy back road, what would surprise us?"</strong></li>
            </ul>
            2. Complete the <strong>Truck Reset Checklist</strong> (Hose repacked, SCBA refilled to 4,500 PSI, water topped up).<br>
            3. Have all members sign the <strong>Attendance Roster</strong>.
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Station 2 Rural Fire Department • Training Division</span>
      <span>Frontline Training System</span>
    </div>
  </div>
</body>
</html>`;

// 2. Safety Officer Checklist
const safetyCardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Drill Safety Officer Checklist - Rural VFD</title>
  <link rel="stylesheet" href="../styles.css">
  <style>
    .card-page {
      max-width: 8.5in;
      min-height: 11in;
      background: #ffffff;
      margin: 20px auto;
      padding: 0.4in;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .safety-mandate-box {
      background: #fef2f2;
      border-left: 4px solid var(--fire-red);
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    .section-card {
      border: 1px solid var(--slate-border);
      border-radius: 6px;
      margin-bottom: 10px;
      overflow: hidden;
    }
    .section-header {
      background: var(--primary-navy);
      color: #ffffff;
      padding: 6px 12px;
      font-weight: 800;
      font-size: 9.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .section-body {
      padding: 8px 12px;
      font-size: 9pt;
      line-height: 1.35;
    }
    .stop-banner {
      background: #991b1b;
      color: #ffffff;
      padding: 12px;
      border-radius: 6px;
      margin: 10px 0;
      text-align: center;
      border: 2px solid #f87171;
    }
    .stop-title {
      font-size: 14pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <a href="../index.html">⬅️ Back to Skills Portal</a>
    <button class="btn-print" onclick="window.print()">🖨️ Print Laminated Safety Card (PDF)</button>
  </div>

  <div class="card-page">
    <div>
      <div class="badge-bar">
        <span class="drill-id-badge" style="background: var(--fire-red);">DEDICATED SAFETY ROLE</span>
        <span class="badge badge-navy">NON-PARTICIPATING OBSERVER</span>
      </div>
      <h1 style="font-size: 20pt; text-transform: uppercase; color: var(--primary-navy); margin-bottom: 4px;">Drill Safety Officer Checklist</h1>
      <div style="font-size: 10.5pt; font-weight: 700; color: var(--fire-red); margin-bottom: 10px;">Authority to Halt Training at Any Moment</div>

      <div class="safety-mandate-box">
        <strong>Mandate:</strong> When an officer is not present, you are the department's front line against preventable injuries. You do <strong>not</strong> handle hoses, raise ladders, or swing tools during live reps. Your eyes stay 100% on the firefighters, the apparatus, and the ground.
      </div>

      <div class="section-card">
        <div class="section-header">1. Pre-Drill Safety Scan (Before Reps Begin)</div>
        <div class="section-body">
          <ul class="checklist">
            <li><strong>PPE Inspection:</strong> Pants over boots, coat zipped/velcroed, hood tucked under collar, helmet chinstrap snugly fastened under chin, structural/extrication gloves on, safety glasses worn.</li>
            <li><strong>WorkSafeNB Reg 91-191 Jewellery Rule:</strong> Verify 100% of rings, wristwatches, and neck chains are removed before donning gear.</li>
            <li><strong>Ground Hazards:</strong> Check bay apron and driveway for black ice (salt/sand ready), trip hazards, loose cribbing, and traffic safety.</li>
          </ul>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">2. Active Surveillance During Live Reps</div>
        <div class="section-body">
          <ul class="checklist">
            <li><strong>Ergonomics & Lifting:</strong> Watch for members lifting with backs instead of legs during ladder carries, bottle swaps, or hose rolls.</li>
            <li><strong>Pinch Points:</strong> Fingers on ladder beams (not rungs); hands behind hydraulic tool safety guards; body positioned outside tool kick zones.</li>
            <li><strong>Pressurized Lines:</strong> Ensure members do not straddle uncharged hose lines; warn of nozzle reaction kick; confirm backup firefighter is anchored behind nozzleman.</li>
            <li><strong>Air & Heat Exhaustion:</strong> Minimum 4,000 PSI before starting reps; watch for hyperventilation, dizziness, or fatigue. Water/electrolytes ready.</li>
          </ul>
        </div>
      </div>

      <div class="stop-banner">
        <div class="stop-title">🛑 THE EMERGENCY STOP AUTHORITY</div>
        <div style="font-size: 9.5pt; line-height: 1.3;">
          If you see a slip, dropped tool, missing glove, coupling leak, sudden fatigue, or immediate hazard:<br>
          <strong style="font-size: 11pt; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; margin-top: 4px;">SHOUT: "STOP! STOP! STOP!" OR "FREEZE!"</strong><br>
          Everyone must cease movement, idle down throttles, and stand in place until cleared.
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">3. Post-Drill Safety Clearance & Reset</div>
        <div class="section-body">
          <ul class="checklist">
            <li>Ensure members doff gear in a well-ventilated area to minimize particulate exposure; wipe skin with decontamination wipes.</li>
            <li>Inspect tools for cracks, hydraulic leaks, or structural fatigue before stowing back in brackets.</li>
            <li>Confirm no injuries occurred. If any member sustained a minor strain or scratch, log it immediately on the department incident report.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>WorkSafeNB General Regulation 91-191 Compliance</span>
      <span>Safety Is Non-Negotiable</span>
    </div>
  </div>
</body>
</html>`;

// 3. Attendance Sheet
const attendanceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Weekly Training Attendance Roster - Rural VFD</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    .roster-page {
      max-width: 8.5in;
      min-height: 11in;
      background: #ffffff;
      margin: 20px auto;
      padding: 0.4in;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .roster-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
    }
    .roster-table th {
      background: var(--primary-navy);
      color: #ffffff;
      padding: 6px 8px;
      text-align: left;
      font-size: 8.5pt;
      text-transform: uppercase;
      border: 1px solid var(--slate-border);
    }
    .roster-table td {
      padding: 7px 8px;
      border: 1px solid var(--slate-border);
    }
    .roster-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }
    .form-field {
      border-bottom: 1px solid var(--slate-dark);
      padding-bottom: 2px;
      margin-bottom: 6px;
    }
    .form-field strong {
      color: var(--primary-navy);
    }
  </style>
</head>
<body>
  <div class="screen-toolbar">
    <a href="index.html">⬅️ Back to Skills Portal</a>
    <button class="btn-print" onclick="window.print()">🖨️ Print Attendance Roster (PDF)</button>
  </div>

  <div class="roster-page">
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--fire-red); padding-bottom: 6px; margin-bottom: 10px;">
        <div>
          <h1 style="font-size: 18pt; text-transform: uppercase; color: var(--primary-navy);">Weekly Training Attendance & JPR Sign-Off</h1>
          <div style="font-size: 9.5pt; font-weight: 700; color: var(--slate-medium);">Station 2 • Office of the Fire Marshal (NB) & Insurance Training Log</div>
        </div>
        <span class="badge badge-navy" style="font-size: 9pt; padding: 4px 8px;">FCPNB / FUS RECORD</span>
      </div>

      <div class="form-grid">
        <div class="form-field"><strong>Drill Name:</strong> __________________________________________________</div>
        <div class="form-field"><strong>Date:</strong> ____________________</div>
        <div class="form-field"><strong>Hours:</strong> ________ hrs</div>
      </div>

      <div class="form-grid" style="grid-template-columns: 1fr 1fr 1fr;">
        <div class="form-field"><strong>Standard:</strong> NFPA 1001 L1 [  ] / L2 [  ]</div>
        <div class="form-field"><strong>Drill Leader:</strong> ______________________</div>
        <div class="form-field"><strong>Safety Officer:</strong> ____________________</div>
      </div>

      <div style="background: var(--slate-light); border: 1px solid var(--slate-border); border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; font-size: 8.5pt;">
        <strong>Safety Verification:</strong>
        [  ] Pre-drill brief conducted & STOP command verified |
        [  ] WorkSafeNB Reg 91-191 PPE verified (No jewellery) |
        [  ] Truck reset completed
      </div>

      <table class="roster-table">
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Firefighter Name (Print)</th>
            <th style="width: 70px;">Radio #</th>
            <th style="width: 130px;">Role in Drill</th>
            <th style="width: 70px; text-align: center;">Eval*</th>
            <th style="width: 160px;">Member Signature</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({length: 12}).map((_, i) => `
          <tr>
            <td style="text-align: center; font-weight: bold; color: var(--slate-medium);">${i + 1}</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td style="text-align: center; color: var(--slate-medium); font-size: 8pt;">C / P / I</td>
            <td>&nbsp;</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div style="font-size: 7.5pt; color: var(--slate-medium); margin-bottom: 10px;">
        *Eval Codes: <strong>C</strong> = Competent / Completed; <strong>P</strong> = Needs Practice; <strong>I</strong> = Introduced (Recruit)
      </div>

      <div style="border: 1px solid var(--slate-border); border-radius: 4px; padding: 8px 10px; background: #fafafa; margin-bottom: 10px;">
        <div style="font-weight: 800; font-size: 8.5pt; text-transform: uppercase; color: var(--primary-navy); margin-bottom: 4px;">Tailgate Debrief & Action Items:</div>
        <div style="border-bottom: 1px dotted var(--slate-medium); height: 18px;"></div>
        <div style="border-bottom: 1px dotted var(--slate-medium); height: 18px;"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--slate-border); padding-top: 8px; font-size: 8.5pt;">
      <div>
        <strong>Drill Leader Signature:</strong> ___________________________________
      </div>
      <div>
        <strong>Date Logged:</strong> __________________
      </div>
      <div style="font-size: 7.5pt; color: var(--slate-medium);">
        Rural VFD Weekly Training Records • Retain for 5 Years
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(BASE_DIR, 'html/printable-cards/QUICK_DRILL_LEADER_CARD.html'), leaderCardHtml);
fs.writeFileSync(path.join(BASE_DIR, 'html/printable-cards/SAFETY_OFFICER_CHECKLIST.html'), safetyCardHtml);
fs.writeFileSync(path.join(BASE_DIR, 'html/attendance.html'), attendanceHtml);

console.log('✅ Generated HTML for Cards and Attendance Sheet.');

// Compile Cards to PDF
console.log('🖨️ Compiling Cards & Attendance to PDF...');
execSync(`"${CHROME_PATH}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${path.join(BASE_DIR, 'pdf/printable-cards/QUICK_DRILL_LEADER_CARD.pdf')}" "${path.join(BASE_DIR, 'html/printable-cards/QUICK_DRILL_LEADER_CARD.html')}" 2>/dev/null`);
execSync(`"${CHROME_PATH}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${path.join(BASE_DIR, 'pdf/printable-cards/SAFETY_OFFICER_CHECKLIST.pdf')}" "${path.join(BASE_DIR, 'html/printable-cards/SAFETY_OFFICER_CHECKLIST.html')}" 2>/dev/null`);
execSync(`"${CHROME_PATH}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${path.join(BASE_DIR, 'pdf/ATTENDANCE_AND_SIGN_OFF_SHEET.pdf')}" "${path.join(BASE_DIR, 'html/attendance.html')}" 2>/dev/null`);
console.log('✅ Cards & Attendance PDFs compiled successfully!');
