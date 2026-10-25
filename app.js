/* ============================================================
   THE DAILY FLOOR — live newspaper dashboard
   Simulated data and illustrated camera feeds. No external assets.
   ============================================================ */

'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const pad2 = (n) => String(n).padStart(2, '0');
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const fmtInt = new Intl.NumberFormat('en-US');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  playing: !prefersReducedMotion,
  clock: 18 * 3600 + 42 * 60 + 8,
  wireAge: 0,
  entered: 2418,
  inStore: 48,
  capture: 19.6,
  fittingQueue: 7,
  fittingWait: 460,
  tillQueue: 4,
  tillWait: 138,
  conversion: 24.1,
  windowStops: 46,
  approved: false,
  dispatched: false
};

const AGE = [
  { label: '18–24', value: 22 },
  { label: '25–34', value: 31, best: true },
  { label: '35–44', value: 24 },
  { label: '45–54', value: 15 },
  { label: '55+', value: 8 }
];

const CAMERA_INFO = {
  window: {
    title: 'Camera 01 / Window',
    sub: 'Street window · passers-by and window stops',
    caption: '<strong>Window desk.</strong> 46 passers-by stopped for more than three seconds in the last hour. The new denim window is the strongest performer this month. 22 of those stops converted into an entry.'
  },
  entrance: {
    title: 'Camera 02 / Entrance',
    sub: 'Mall entrance · entry count and capture rate',
    caption: '<strong>Entrance desk.</strong> 2,418 entries today, up 14.8% on the four-week same-weekday average. Capture is 19.6% against a 20% target. The gap is small; the fitting room is the larger leak.'
  },
  floor: {
    title: 'Camera 03 / Floor',
    sub: 'Denim table and front floor · zone engagement',
    caption: '<strong>Floor desk.</strong> Denim is the hottest zone in the store: 3:12 average dwell, 22% of floor traffic. Occasionwear remains a dead zone at 0:24. Sightlines from the main walkway are blocked by the fitting-room wall.'
  },
  fitting: {
    title: 'Camera 04 / Fitting room',
    sub: 'Fitting queue · rooms and throughput',
    caption: '<strong>The bottleneck.</strong> Seven waiting, two rooms in use, 7:40 average wait. Eleven shoppers left the queue between 16:00 and 18:00. This is the most expensive square metre in the store.'
  },
  till: {
    title: 'Camera 05 / Till',
    sub: 'Checkout · queue and service time',
    caption: '<strong>Till desk.</strong> Four waiting at Checkout 2, 2:18 average wait. A backup till is staffed but not open. The queue is below the critical threshold, but it is trending the wrong way.'
  },
  stock: {
    title: 'Camera 06 / Stockroom',
    sub: 'Back door · stock movement and safety',
    caption: '<strong>Stockroom.</strong> Back door closed. Two staff present. No unaccompanied access in the last hour. The stock cage that blocked the fire exit at 18:31 has been moved.'
  }
};

/* ------------------------------------------------------------------ */
/* Time and formatting                                                 */
/* ------------------------------------------------------------------ */

function clockParts() {
  const h = Math.floor(state.clock / 3600) % 24;
  const m = Math.floor((state.clock % 3600) / 60);
  const s = state.clock % 60;
  return { h, m, s };
}

function formatClock(seconds = state.clock, withSeconds = true) {
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return withSeconds ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`;
}

function formatWait(seconds) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${pad2(total % 60)}`;
}

/* ------------------------------------------------------------------ */
/* Live numbers                                                        */
/* ------------------------------------------------------------------ */

function updateClock() {
  const t = formatClock();
  $('#mastheadClock').textContent = t;
  $('#heroClock').textContent = t;
}

function updateWireAge() {
  $('#wireAge').textContent = `${state.wireAge}s`;
}

function updateNumbers() {
  $('#numEntered').textContent = fmtInt.format(state.entered);
  $('#numCapture').textContent = `${state.capture.toFixed(1)}%`;
  $('#numFitting').textContent = formatWait(state.fittingWait);
  $('#numConversion').textContent = `${state.conversion.toFixed(1)}%`;
  $('#numInStore').textContent = state.inStore;
  $('#navInStore').textContent = state.inStore;
  $('#navTraffic').textContent = '+14.8%';
  $('#heroQueueLabel').textContent = `${state.fittingQueue} waiting · 2 rooms in use`;
  const stopFitting = $('#stopFittingHeadline');
  if (stopFitting) stopFitting.textContent = `${numberWord(state.fittingQueue)} waiting. Two rooms in use.`;
  const stopTill = $('#stopTillHeadline');
  if (stopTill) stopTill.textContent = `${numberWord(state.tillQueue)} waiting at Checkout 2.`;
}

function numberWord(n) {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return words[n] || String(n);
}

function updateCameraCounts() {
  const counts = {
    window: state.windowStops > 44 ? randInt(10, 14) : randInt(8, 11),
    entrance: clamp(Math.round(state.inStore / 6), 5, 12),
    floor: clamp(Math.round(state.inStore * .36), 12, 24),
    fitting: state.fittingQueue,
    till: state.tillQueue,
    stock: randInt(1, 3)
  };
  Object.entries(counts).forEach(([key, value]) => {
    const el = document.querySelector(`[data-count="${key}"]`);
    if (el) el.textContent = value;
  });
}

function liveTick() {
  if (!state.playing) return;
  state.entered += randInt(1, 4);
  state.inStore = clamp(state.inStore + randInt(-3, 3), 39, 57);
  state.fittingQueue = clamp(state.fittingQueue + (Math.random() > .55 ? randInt(-1, 1) : 0), 5, 9);
  state.fittingWait = clamp(state.fittingWait + randInt(-16, 16), 410, 500);
  state.tillQueue = clamp(state.tillQueue + (Math.random() > .65 ? randInt(-1, 1) : 0), 2, 6);
  state.tillWait = clamp(state.tillWait + randInt(-8, 8), 100, 170);
  state.conversion = clamp(state.conversion + rand(-.12, .12), 23.8, 24.4);
  state.capture = clamp(state.capture + rand(-.08, .08), 19.3, 19.9);
  state.wireAge = 0;

  updateNumbers();
  updateCameraCounts();
  updateWireAge();

  const firstWire = $('#wireTrack span:first-child');
  if (firstWire) {
    firstWire.innerHTML = `<b>${formatClock(state.clock, false)}</b> Fitting queue ${state.fittingQueue} · wait ${formatWait(state.fittingWait)}`;
    firstWire.classList.remove('is-new');
    void firstWire.offsetWidth;
    firstWire.classList.add('is-new');
  }
}

/* ------------------------------------------------------------------ */
/* Age chart                                                           */
/* ------------------------------------------------------------------ */

function renderAgeChart() {
  const el = $('#ageChart');
  if (!el) return;
  const max = Math.max(...AGE.map((a) => a.value));
  el.innerHTML = AGE.map((a) => `
    <div class="age-row ${a.best ? 'best' : ''}" aria-label="${a.label}: ${a.value} percent">
      <span>${a.label}</span>
      <div class="age-track"><i style="width:${(a.value / max) * 100}%"></i></div>
      <strong>${a.value}%</strong>
    </div>`).join('');
}

/* ------------------------------------------------------------------ */
/* Floor map                                                           */
/* ------------------------------------------------------------------ */

function storeMapSVG() {
  return `<svg viewBox="0 0 620 320" role="img" aria-label="Store floor plan with live heat zones, camera positions, and customer path">
    <defs>
      <radialGradient id="heat-red" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#b3261e" stop-opacity=".42"/>
        <stop offset="55%" stop-color="#b3261e" stop-opacity=".16"/>
        <stop offset="100%" stop-color="#b3261e" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="heat-ink" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#17140f" stop-opacity=".26"/>
        <stop offset="60%" stop-color="#17140f" stop-opacity=".1"/>
        <stop offset="100%" stop-color="#17140f" stop-opacity="0"/>
      </radialGradient>
      <pattern id="map-dots" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r=".45" fill="#17140f" opacity=".2"/>
      </pattern>
      <pattern id="dead-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#17140f" stroke-width="1" opacity=".25"/>
      </pattern>
      <filter id="soft"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>

    <rect x="8" y="8" width="604" height="304" fill="#e9e1d1" stroke="#17140f" stroke-width="2"/>
    <rect x="8" y="8" width="604" height="304" fill="url(#map-dots)" opacity=".55"/>
    <path d="M20 8 H600 V312 H340 M280 312 H20 V8" fill="none" stroke="#17140f" stroke-width="2"/>

    <!-- window and entrance -->
    <rect x="30" y="238" width="150" height="52" fill="#d8cebd" stroke="#17140f" stroke-width="1"/>
    <text x="38" y="253" class="map-label strong">WINDOW</text>
    <text x="38" y="266" class="map-label">46 stops / hr</text>
    <rect x="280" y="282" width="60" height="22" fill="#d8cebd" stroke="#17140f" stroke-width="1"/>
    <text x="287" y="296" class="map-label strong">ENTRY</text>

    <!-- fixtures -->
    <rect x="50" y="55" width="105" height="95" class="map-fixture"/>
    <line x1="65" y1="72" x2="65" y2="135" class="map-rack"/>
    <line x1="92" y1="72" x2="92" y2="135" class="map-rack"/>
    <line x1="119" y1="72" x2="119" y2="135" class="map-rack"/>
    <line x1="146" y1="72" x2="146" y2="135" class="map-rack"/>
    <text x="58" y="50" class="map-label strong">MENSWEAR</text>

    <rect x="90" y="150" width="62" height="34" class="map-fixture"/>
    <text x="97" y="171" class="map-label">FRONT TABLE</text>

    <rect x="190" y="170" width="104" height="52" class="map-fixture"/>
    <text x="199" y="190" class="map-label strong">DENIM</text>
    <text x="199" y="203" class="map-label">3:12 dwell</text>

    <rect x="320" y="55" width="100" height="110" class="map-fixture"/>
    <line x1="340" y1="70" x2="340" y2="150" class="map-rack"/>
    <line x1="365" y1="70" x2="365" y2="150" class="map-rack"/>
    <line x1="390" y1="70" x2="390" y2="150" class="map-rack"/>
    <text x="328" y="50" class="map-label strong">WOMENSWEAR</text>

    <rect x="320" y="205" width="100" height="55" class="map-fixture" fill="url(#dead-hatch)"/>
    <text x="328" y="226" class="map-label strong">OCCASIONWEAR</text>
    <text x="328" y="239" class="map-label">0:24 dwell · dead</text>

    <!-- fitting rooms -->
    <rect x="465" y="40" width="125" height="92" fill="#d8cebd" stroke="#17140f" stroke-width="1"/>
    <line x1="496" y1="40" x2="496" y2="132" class="map-rack"/>
    <line x1="527" y1="40" x2="527" y2="132" class="map-rack"/>
    <line x1="558" y1="40" x2="558" y2="132" class="map-rack"/>
    <text x="472" y="55" class="map-label strong">FITTING</text>
    <text x="472" y="67" class="map-label">2 in use · 2 open</text>

    <!-- queue -->
    <rect x="445" y="142" width="80" height="64" fill="none" stroke="#b3261e" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="451" y="155" class="map-label red">QUEUE 7</text>

    <!-- till and stock -->
    <rect x="470" y="175" width="105" height="46" class="map-fixture"/>
    <text x="478" y="195" class="map-label strong">TILL</text>
    <text x="478" y="208" class="map-label">4 waiting · 2:18</text>
    <rect x="500" y="245" width="90" height="45" class="map-fixture"/>
    <text x="508" y="263" class="map-label strong">STOCKROOM</text>
    <text x="508" y="276" class="map-label">door closed</text>

    <!-- heat -->
    <circle cx="242" cy="196" r="62" fill="url(#heat-red)" filter="url(#soft)"/>
    <circle cx="482" cy="145" r="58" fill="url(#heat-red)" filter="url(#soft)"/>
    <circle cx="520" cy="198" r="42" fill="url(#heat-ink)" filter="url(#soft)"/>
    <circle cx="105" cy="245" r="48" fill="url(#heat-ink)" filter="url(#soft)"/>
    <circle cx="370" cy="230" r="28" fill="#17140f" opacity=".08" filter="url(#soft)"/>

    <!-- path -->
    <path d="M310 282 C300 260 270 238 245 215 C285 195 360 178 445 160" fill="none" stroke="#b3261e" stroke-width="1.2" stroke-dasharray="3 4" opacity=".8"/>
    <path d="M438 154 L446 160 L438 166" fill="none" stroke="#b3261e" stroke-width="1.2" opacity=".8"/>

    <!-- cameras -->
    <g class="map-cam" data-cam="window"><rect x="98" y="235" width="15" height="11"/><text x="101" y="243">01</text></g>
    <g class="map-cam" data-cam="entrance"><rect x="303" y="288" width="15" height="11"/><text x="306" y="296">02</text></g>
    <g class="map-cam" data-cam="floor"><rect x="237" y="148" width="15" height="11"/><text x="240" y="156">03</text></g>
    <g class="map-cam" data-cam="fitting"><rect x="500" y="104" width="15" height="11"/><text x="503" y="112">04</text></g>
    <g class="map-cam" data-cam="till"><rect x="515" y="188" width="15" height="11"/><text x="518" y="196">05</text></g>
    <g class="map-cam" data-cam="stock"><rect x="565" y="258" width="15" height="11"/><text x="568" y="266">06</text></g>

    <!-- in-store stamp -->
    <rect x="20" y="20" width="92" height="38" fill="#f6f1e6" stroke="#17140f" stroke-width="1"/>
    <text x="28" y="33" class="map-label">IN STORE</text>
    <text x="28" y="50" class="map-number">48</text>

    <!-- compass + note -->
    <text x="585" y="34" class="map-label" text-anchor="middle">N</text>
    <path d="M585 38 L585 52 M581 44 L585 38 L589 44" fill="none" stroke="#17140f" stroke-width="1"/>
    <text x="20" y="306" class="map-label">FIG. 1 — THE FLOOR, 18:30–18:42</text>
  </svg>`;
}

function renderStoreMap() {
  const el = $('#storeMap');
  if (!el) return;
  el.innerHTML = storeMapSVG();
  $$('.map-cam', el).forEach((cam) => {
    const type = cam.dataset.cam;
    const label = CAMERA_INFO[type]?.title || 'Camera';
    cam.setAttribute('role', 'button');
    cam.setAttribute('tabindex', '0');
    cam.setAttribute('aria-label', `Open ${label}`);
    cam.addEventListener('click', () => openCameraModal(type));
    cam.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCameraModal(type);
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* Camera canvas                                                       */
/* ------------------------------------------------------------------ */

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBox(ctx, x, y, w, h, label, scale = 1) {
  ctx.save();
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = Math.max(.8, Math.min(1.4, 1.1 * scale));
  ctx.strokeRect(x, y, w, h);
  if (label) {
    const fs = Math.max(5.2, Math.min(8, 6.1 * scale));
    ctx.font = `700 ${fs}px "Arial Narrow", Arial, sans-serif`;
    const tw = ctx.measureText(label).width;
    const bh = fs + 2.5;
    ctx.fillStyle = '#f6f1e6';
    ctx.fillRect(x, Math.max(0, y - bh), tw + 4, bh);
    ctx.strokeStyle = '#b3261e';
    ctx.lineWidth = .8;
    ctx.strokeRect(x, Math.max(0, y - bh), tw + 4, bh);
    ctx.fillStyle = '#b3261e';
    ctx.fillText(label, x + 2, Math.max(fs, y - 2.2));
  }
  ctx.restore();
}

function drawPerson(ctx, x, y, scale, opts = {}) {
  const H = 44 * scale;
  const ink = opts.ink || '#2a251e';
  const mid = opts.mid || '#6e6455';
  const paper = '#f3ede1';

  ctx.save();
  ctx.fillStyle = 'rgba(23,20,15,.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1.2 * scale, 8 * scale, 2.4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 2 * scale, y - H * .34);
  ctx.lineTo(x - 3.4 * scale, y - 1.2 * scale);
  ctx.moveTo(x + 2 * scale, y - H * .34);
  ctx.lineTo(x + 3.4 * scale, y - 1.2 * scale);
  ctx.stroke();

  // coat / body
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.moveTo(x - 6.2 * scale, y - H * .66);
  ctx.lineTo(x - 4.4 * scale, y - H * .34);
  ctx.lineTo(x + 4.4 * scale, y - H * .34);
  ctx.lineTo(x + 6.2 * scale, y - H * .66);
  ctx.closePath();
  ctx.fill();

  // arms
  ctx.strokeStyle = mid;
  ctx.lineWidth = 2.1 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 5.4 * scale, y - H * .6);
  ctx.lineTo(x - 8 * scale, y - H * .38);
  ctx.moveTo(x + 5.4 * scale, y - H * .6);
  ctx.lineTo(x + 8 * scale, y - H * .38);
  ctx.stroke();

  // head
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(x, y - H * .78, 4.1 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(243,237,225,.22)';
  ctx.beginPath();
  ctx.arc(x + .9 * scale, y - H * .8, 3.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  // collar detail
  ctx.strokeStyle = paper;
  ctx.lineWidth = .8 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y - H * .66);
  ctx.lineTo(x, y - H * .54);
  ctx.stroke();

  if (opts.label) {
    const bw = 19 * scale;
    const bh = H * 1.02;
    drawBox(ctx, x - bw / 2, y - bh, bw, bh, opts.label, scale);
  }
  ctx.restore();
}

function drawPaperScene(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#c9beac');
  bg.addColorStop(.44, '#d8cfbf');
  bg.addColorStop(1, '#cec3b1');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // ceiling band
  ctx.fillStyle = 'rgba(23,20,15,.1)';
  ctx.fillRect(0, 0, w, h * .08);

  // floor
  const fg = ctx.createLinearGradient(0, h * .4, 0, h);
  fg.addColorStop(0, '#d8cfbf');
  fg.addColorStop(1, '#c3b7a3');
  ctx.fillStyle = fg;
  ctx.fillRect(0, h * .4, w, h * .6);

  // perspective floor lines
  ctx.strokeStyle = 'rgba(23,20,15,.13)';
  ctx.lineWidth = .8;
  const vx = w * .5;
  const vy = h * .4;
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(vx + i * w * .13, h);
    ctx.lineTo(vx + i * w * .02, vy);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i++) {
    const y = vy + Math.pow(i / 5, 1.6) * (h - vy);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // paper vignette
  const vg = ctx.createRadialGradient(w * .5, h * .45, h * .2, w * .5, h * .45, w * .7);
  vg.addColorStop(0, 'rgba(23,20,15,0)');
  vg.addColorStop(1, 'rgba(23,20,15,.2)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

function drawFittingScene(ctx, w, h, t) {
  drawPaperScene(ctx, w, h);

  // back wall
  ctx.fillStyle = '#b9ad9b';
  ctx.fillRect(w * .06, h * .08, w * .88, h * .42);
  ctx.fillStyle = 'rgba(246,241,230,.2)';
  ctx.fillRect(w * .06, h * .08, w * .88, h * .04);

  // four fitting rooms
  const rooms = [
    { x: .12, occupied: true },
    { x: .33, occupied: true },
    { x: .54, occupied: false },
    { x: .75, occupied: false }
  ];
  rooms.forEach((room, i) => {
    const x = w * room.x;
    const y = h * .13;
    const roomW = w * .16;
    const roomH = h * .34;
    ctx.fillStyle = room.occupied ? '#8d8170' : '#d7cdbd';
    ctx.fillRect(x, y, roomW, roomH);
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x, y, roomW, roomH);

    // curtain folds
    for (let f = 1; f < 5; f++) {
      ctx.strokeStyle = room.occupied ? 'rgba(23,20,15,.28)' : 'rgba(23,20,15,.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + (roomW / 5) * f, y + 2);
      ctx.lineTo(x + (roomW / 5) * f + 2, y + roomH - 2);
      ctx.stroke();
    }

    // label strip
    ctx.fillStyle = '#f6f1e6';
    ctx.fillRect(x + 4, y + 4, roomW - 8, 12);
    ctx.fillStyle = room.occupied ? '#b3261e' : '#17140f';
    ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
    ctx.fillText(room.occupied ? 'IN USE' : 'OPEN', x + 7, y + 13);
    ctx.fillStyle = '#17140f';
    ctx.font = '700 6px "Arial Narrow", Arial, sans-serif';
    ctx.fillText(`0${i + 1}`, x + roomW - 13, y + 13);
  });

  // queue area
  ctx.strokeStyle = 'rgba(179,38,30,.8)';
  ctx.lineWidth = 1.1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(w * .3, h * .54);
  ctx.lineTo(w * .72, h * .54);
  ctx.lineTo(w * .79, h * .9);
  ctx.lineTo(w * .24, h * .9);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // queue people
  const queue = [
    { x: .34, y: .88, s: 1.16, label: 'person 0.96' },
    { x: .42, y: .82, s: 1.08 },
    { x: .49, y: .76, s: 1.0, label: 'person 0.94' },
    { x: .56, y: .7, s: .92 },
    { x: .62, y: .65, s: .86, label: 'person 0.91' },
    { x: .67, y: .6, s: .8 },
    { x: .71, y: .56, s: .74 }
  ];
  queue.forEach((p, i) => {
    const sway = Math.sin(t * .8 + i * .7) * w * .004;
    drawPerson(ctx, w * p.x + sway, h * p.y, (h / 200) * p.s, {
      ink: '#211d17',
      mid: i % 3 === 0 ? '#4b4236' : i % 3 === 1 ? '#7b6f5e' : '#5d5244',
      label: p.label
    });
  });

  // floor lead
  drawPerson(ctx, w * .22, h * .74, (h / 200) * .95, { ink: '#17140f', mid: '#2f2a22', label: '' });

  // callout
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 1.2;
  ctx.fillRect(w * .06, h * .61, w * .2, h * .11);
  ctx.strokeRect(w * .06, h * .61, w * .2, h * .11);
  ctx.fillStyle = '#b3261e';
  ctx.font = '700 8px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('FITTING QUEUE', w * .075, h * .655);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 17px "Bodoni 72", Didot, serif';
  ctx.fillText('7  ·  7:40', w * .075, h * .699);

  // clock line
  ctx.fillStyle = 'rgba(23,20,15,.5)';
  ctx.font = '7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CAM 04  /  FITTING  /  18:42', w * .06, h * .05);
}

function drawWindowScene(ctx, w, h, t) {
  drawPaperScene(ctx, w, h);

  // interior wall
  ctx.fillStyle = '#c6baa7';
  ctx.fillRect(0, 0, w, h * .14);

  // glass window frame
  ctx.fillStyle = '#dcd3c2';
  ctx.fillRect(w * .06, h * .12, w * .52, h * .54);
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 2;
  ctx.strokeRect(w * .06, h * .12, w * .52, h * .54);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * .32, h * .12);
  ctx.lineTo(w * .32, h * .66);
  ctx.stroke();

  // window lettering
  ctx.fillStyle = 'rgba(23,20,15,.72)';
  ctx.font = '700 10px "Bodoni 72", Didot, serif';
  ctx.fillText('NEW ARRIVALS', w * .09, h * .2);
  ctx.font = '600 6px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('AUTUMN  /  DENIM', w * .09, h * .23);

  // mannequins
  [ .17, .38 ].forEach((x, i) => {
    const mx = w * x;
    const my = h * .56;
    ctx.fillStyle = '#d9d0c0';
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = 1;
    ctx.fillRect(mx - w * .035, h * .44, w * .07, h * .1);
    ctx.strokeRect(mx - w * .035, h * .44, w * .07, h * .1);
    ctx.fillStyle = i === 0 ? '#3a332a' : '#665b4b';
    ctx.beginPath();
    ctx.moveTo(mx - w * .035, h * .44);
    ctx.lineTo(mx - w * .04, h * .3);
    ctx.lineTo(mx + w * .04, h * .3);
    ctx.lineTo(mx + w * .035, h * .44);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx, h * .27, w * .022, 0, Math.PI * 2);
    ctx.fill();
    // plinth
    ctx.fillStyle = '#b8ac9a';
    ctx.fillRect(mx - w * .045, my, w * .09, h * .03);
  });

  // sidewalk
  ctx.fillStyle = '#cfc5b4';
  ctx.fillRect(w * .6, h * .4, w * .4, h * .6);
  ctx.strokeStyle = 'rgba(23,20,15,.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(w * .6, h * (.48 + i * .1));
    ctx.lineTo(w, h * (.48 + i * .1));
    ctx.stroke();
  }

  // passers-by
  const people = [
    { x: .68, y: .84, s: 1.1, label: 'person 0.95', speed: .22 },
    { x: .82, y: .73, s: .94, label: 'person 0.92', speed: .15 },
    { x: .92, y: .62, s: .78, label: '', speed: .18 }
  ];
  people.forEach((p, i) => {
    const x = w * (p.x + Math.sin(t * p.speed + i) * .02);
    drawPerson(ctx, x, h * p.y, (h / 200) * p.s, {
      ink: '#221e18',
      mid: i === 0 ? '#5d5244' : '#7f7361',
      label: p.label
    });
  });

  // stop callout
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 1.2;
  ctx.fillRect(w * .61, h * .12, w * .19, h * .1);
  ctx.strokeRect(w * .61, h * .12, w * .19, h * .1);
  ctx.fillStyle = '#b3261e';
  ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('WINDOW STOPS', w * .625, h * .155);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 16px "Bodoni 72", Didot, serif';
  ctx.fillText('46 / hr', w * .625, h * .202);

  ctx.fillStyle = 'rgba(23,20,15,.5)';
  ctx.font = '7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CAM 01  /  WINDOW  /  18:42', w * .06, h * .05);
}

function drawEntranceScene(ctx, w, h, t) {
  drawPaperScene(ctx, w, h);

  // glass doors
  const doorY = h * .1;
  const doorH = h * .38;
  [ .28, .5 ].forEach((xr) => {
    const x = w * xr;
    const dw = w * .2;
    const glass = ctx.createLinearGradient(x, doorY, x + dw, doorY + doorH);
    glass.addColorStop(0, 'rgba(246,241,230,.75)');
    glass.addColorStop(.45, 'rgba(210,220,218,.45)');
    glass.addColorStop(1, 'rgba(170,180,176,.6)');
    ctx.fillStyle = glass;
    ctx.fillRect(x, doorY, dw, doorH);
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x, doorY, dw, doorH);
    ctx.strokeStyle = 'rgba(23,20,15,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + dw * .2, doorY + 3);
    ctx.lineTo(x + dw * .34, doorY + doorH - 3);
    ctx.stroke();
  });

  // door handles
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 1;
  [ .48, .5 ].forEach((xr) => {
    ctx.beginPath();
    ctx.moveTo(w * xr, h * .27);
    ctx.lineTo(w * xr, h * .36);
    ctx.stroke();
  });

  // mat
  ctx.fillStyle = '#b9ae9c';
  ctx.fillRect(w * .3, h * .75, w * .4, h * .12);
  ctx.strokeStyle = 'rgba(23,20,15,.4)';
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(w * .3, h * .75, w * .4, h * .12);
  ctx.setLineDash([]);

  // entry line
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(w * .2, h * .72);
  ctx.lineTo(w * .8, h * .72);
  ctx.stroke();
  ctx.fillStyle = '#b3261e';
  ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('ENTRY LINE', w * .21, h * .705);

  // people entering
  const people = [
    { x: .39, y0: .93, y1: .46, speed: .2, phase: .2, s: 1.1, label: 'person 0.96' },
    { x: .58, y0: .52, y1: .92, speed: .15, phase: 1.2, s: .94, label: 'person 0.92' },
    { x: .48, y0: .96, y1: .61, speed: .12, phase: .6, s: 1.0, label: '' }
  ];
  people.forEach((p, i) => {
    const k = .5 - .5 * Math.cos(t * p.speed + p.phase * Math.PI * 2);
    const y = h * (p.y0 + (p.y1 - p.y0) * k);
    const x = w * p.x + Math.sin(t * .7 + i) * w * .008;
    drawPerson(ctx, x, y, (h / 200) * p.s * (.72 + y / h * .32), {
      ink: '#201c16',
      mid: i === 1 ? '#7d705e' : '#544a3d',
      label: p.label
    });
  });

  // count callout
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 1;
  ctx.fillRect(w * .06, h * .12, w * .17, h * .1);
  ctx.strokeRect(w * .06, h * .12, w * .17, h * .1);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('ENTERED', w * .075, h * .155);
  ctx.font = '700 16px "Bodoni 72", Didot, serif';
  ctx.fillText('2,418', w * .075, h * .202);

  ctx.fillStyle = 'rgba(23,20,15,.5)';
  ctx.font = '7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CAM 02  /  ENTRANCE  /  18:42', w * .06, h * .05);
}

function drawFloorScene(ctx, w, h, t) {
  drawPaperScene(ctx, w, h);

  // back wall
  ctx.fillStyle = '#c0b4a2';
  ctx.fillRect(0, h * .06, w, h * .3);
  ctx.fillStyle = 'rgba(246,241,230,.3)';
  ctx.fillRect(0, h * .06, w, h * .012);

  // racks left and right
  [ .04, .7 ].forEach((xr, side) => {
    const x = w * xr;
    const rw = w * .24;
    ctx.fillStyle = '#b7ab99';
    ctx.fillRect(x, h * .2, rw, h * .34);
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, h * .2, rw, h * .34);
    for (let i = 0; i < 6; i++) {
      const cx = x + 8 + i * (rw - 16) / 5;
      ctx.strokeStyle = 'rgba(23,20,15,.55)';
      ctx.beginPath();
      ctx.moveTo(cx, h * .22);
      ctx.lineTo(cx, h * .5);
      ctx.stroke();
      ctx.fillStyle = i % 2 ? '#4a4135' : '#766a59';
      ctx.fillRect(cx - 3, h * .26, 6, h * .12);
    }
    // rack rail
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, h * .25);
    ctx.lineTo(x + rw - 4, h * .25);
    ctx.stroke();
  });

  // center table
  ctx.fillStyle = '#b9ad9b';
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 1.2;
  ctx.fillRect(w * .34, h * .42, w * .27, h * .2);
  ctx.strokeRect(w * .34, h * .42, w * .27, h * .2);
  // folded clothes
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = ['#4b4337', '#736654', '#8b7e69', '#584d3f'][(r + c) % 4];
      ctx.fillRect(w * (.36 + c * .055), h * (.46 + r * .045), w * .045, h * .028);
    }
  }

  // shoppers
  const people = [
    { x: .42, y: .82, s: 1.08, label: 'person 0.95' },
    { x: .58, y: .72, s: .94, label: '' },
    { x: .28, y: .66, s: .86, label: 'person 0.91' },
    { x: .78, y: .86, s: 1.02, label: '' }
  ];
  people.forEach((p, i) => {
    const x = w * p.x + Math.sin(t * .55 + i * 1.3) * w * .012;
    const y = h * p.y + Math.cos(t * .4 + i) * h * .006;
    drawPerson(ctx, x, y, (h / 200) * p.s, {
      ink: '#1f1b15',
      mid: i % 2 === 0 ? '#5b5042' : '#7c705f',
      label: p.label
    });
  });

  // denim callout
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 1.2;
  ctx.fillRect(w * .05, h * .58, w * .2, h * .1);
  ctx.strokeRect(w * .05, h * .58, w * .2, h * .1);
  ctx.fillStyle = '#b3261e';
  ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('DENIM', w * .065, h * .615);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 15px "Bodoni 72", Didot, serif';
  ctx.fillText('3:12 dwell', w * .065, h * .66);

  ctx.fillStyle = 'rgba(23,20,15,.5)';
  ctx.font = '7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CAM 03  /  FLOOR  /  18:42', w * .06, h * .05);
}

function drawTillScene(ctx, w, h, t) {
  drawPaperScene(ctx, w, h);

  // back wall / shelving
  ctx.fillStyle = '#c3b7a5';
  ctx.fillRect(0, h * .08, w, h * .2);
  ctx.strokeStyle = 'rgba(23,20,15,.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, h * (.12 + i * .05));
    ctx.lineTo(w, h * (.12 + i * .05));
    ctx.stroke();
  }

  // counter
  ctx.fillStyle = '#9c907d';
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 1.6;
  ctx.fillRect(w * .14, h * .32, w * .7, h * .16);
  ctx.strokeRect(w * .14, h * .32, w * .7, h * .16);

  // POS
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 1;
  ctx.fillRect(w * .62, h * .25, w * .12, h * .08);
  ctx.strokeRect(w * .62, h * .25, w * .12, h * .08);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 5px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('TILL 2', w * .64, h * .29);

  // cashier
  drawPerson(ctx, w * .52, h * .33, (h / 200) * .82, { ink: '#17140f', mid: '#3c352b', label: 'staff 0.93' });

  // queue
  const queue = [
    { x: .32, y: .85, s: 1.1, label: 'person 0.96' },
    { x: .43, y: .74, s: 1.0 },
    { x: .53, y: .64, s: .92, label: 'person 0.92' },
    { x: .61, y: .56, s: .84 }
  ];
  queue.forEach((p, i) => {
    const x = w * p.x + Math.sin(t * .7 + i) * w * .006;
    drawPerson(ctx, x, h * p.y, (h / 200) * p.s, {
      ink: '#201c16',
      mid: i === 0 ? '#5c5042' : '#7e705e',
      label: p.label
    });
  });

  // queue callout
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 1.2;
  ctx.fillRect(w * .06, h * .1, w * .18, h * .1);
  ctx.strokeRect(w * .06, h * .1, w * .18, h * .1);
  ctx.fillStyle = '#b3261e';
  ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CHECKOUT 2', w * .075, h * .135);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 15px "Bodoni 72", Didot, serif';
  ctx.fillText('4  ·  2:18', w * .075, h * .178);

  ctx.fillStyle = 'rgba(23,20,15,.5)';
  ctx.font = '7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CAM 05  /  TILL  /  18:42', w * .06, h * .05);
}

function drawStockScene(ctx, w, h, t) {
  drawPaperScene(ctx, w, h);

  // corridor walls
  ctx.fillStyle = '#b0a492';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * .28, h * .18);
  ctx.lineTo(w * .28, h * .86);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w * .72, h * .18);
  ctx.lineTo(w * .72, h * .86);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // door
  ctx.fillStyle = '#8b7e6b';
  ctx.strokeStyle = '#17140f';
  ctx.lineWidth = 1.4;
  ctx.fillRect(w * .4, h * .2, w * .2, h * .36);
  ctx.strokeRect(w * .4, h * .2, w * .2, h * .36);
  ctx.fillStyle = '#f6f1e6';
  ctx.fillRect(w * .41, h * .29, w * .18, h * .1);
  ctx.fillStyle = '#17140f';
  ctx.font = '700 6px "Arial Narrow", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STOCKROOM', w * .5, h * .34);
  ctx.fillText('AUTHORISED ONLY', w * .5, h * .365);
  ctx.textAlign = 'left';

  // boxes
  [ .1, .18, .8 ].forEach((xr, i) => {
    ctx.fillStyle = '#a99c88';
    ctx.strokeStyle = '#17140f';
    ctx.lineWidth = 1;
    const x = w * xr;
    const y = h * (.6 + i * .04);
    ctx.fillRect(x, y, w * .1, h * .1);
    ctx.strokeRect(x, y, w * .1, h * .1);
    ctx.beginPath();
    ctx.moveTo(x, y + h * .04);
    ctx.lineTo(x + w * .1, y + h * .04);
    ctx.stroke();
  });

  // staff
  drawPerson(ctx, w * .58, h * .82, (h / 200) * 1.0, { ink: '#17140f', mid: '#4d4337', label: 'staff 0.94' });
  drawPerson(ctx, w * .38, h * .74, (h / 200) * .9, { ink: '#17140f', mid: '#6f6251', label: '' });

  // door status
  ctx.fillStyle = '#f6f1e6';
  ctx.strokeStyle = '#1f5a42';
  ctx.lineWidth = 1.2;
  ctx.fillRect(w * .58, h * .1, w * .2, h * .09);
  ctx.strokeRect(w * .58, h * .1, w * .2, h * .09);
  ctx.fillStyle = '#1f5a42';
  ctx.font = '700 7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('DOOR', w * .595, h * .132);
  ctx.font = '700 14px "Bodoni 72", Didot, serif';
  ctx.fillText('CLOSED', w * .595, h * .17);

  ctx.fillStyle = 'rgba(23,20,15,.5)';
  ctx.font = '7px "Arial Narrow", Arial, sans-serif';
  ctx.fillText('CAM 06  /  STOCKROOM  /  18:42', w * .06, h * .05);
}

class CameraPlate {
  constructor(canvas, type, opts = {}) {
    this.canvas = canvas;
    this.type = type;
    this.ctx = canvas.getContext('2d');
    this.t = opts.offset || Math.random() * 10;
    this.running = true;
    this.last = 0;
    this.frames = 0;
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.resize();
    this.boundFrame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.boundFrame);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  frame(ts) {
    if (!this.running) return;
    if (!this.last) this.last = ts;
    const dt = Math.min(.06, (ts - this.last) / 1000);
    this.last = ts;
    if (state.playing) this.t += dt;
    this.frames++;
    if (this.frames % 30 === 0) {
      const rect = this.canvas.getBoundingClientRect();
      if (Math.round(rect.width) !== this.w || Math.round(rect.height) !== this.h) this.resize();
    }
    this.draw();
    this.raf = requestAnimationFrame(this.boundFrame);
  }

  draw() {
    if (this.w < 2 || this.h < 2) return;
    const { ctx, w, h, t } = this;
    ctx.clearRect(0, 0, w, h);
    if (this.type === 'window') drawWindowScene(ctx, w, h, t);
    else if (this.type === 'entrance') drawEntranceScene(ctx, w, h, t);
    else if (this.type === 'floor') drawFloorScene(ctx, w, h, t);
    else if (this.type === 'fitting') drawFittingScene(ctx, w, h, t);
    else if (this.type === 'till') drawTillScene(ctx, w, h, t);
    else drawStockScene(ctx, w, h, t);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}

const plates = new Map();

function initCameras() {
  const map = {
    heroCamera: 'fitting',
    camWindow: 'window',
    camEntrance: 'entrance',
    camFloor: 'floor',
    camFitting: 'fitting',
    camTill: 'till',
    camStock: 'stock'
  };
  Object.entries(map).forEach(([id, type]) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    plates.set(id, new CameraPlate(canvas, type, { offset: Math.random() * 8 }));
  });
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

let modalPlate = null;

function openCameraModal(type) {
  const info = CAMERA_INFO[type];
  if (!info) return;
  const modal = $('#cameraModal');
  $('#modalTitle').textContent = info.title;
  $('#modalSub').textContent = info.sub;
  $('#modalCaption').innerHTML = info.caption;
  modal.hidden = false;
  if (modalPlate) {
    modalPlate.stop();
    modalPlate = null;
  }
  requestAnimationFrame(() => {
    modalPlate = new CameraPlate($('#modalCamera'), type, { offset: 2 });
  });
}

function closeCameraModal() {
  $('#cameraModal').hidden = true;
  if (modalPlate) {
    modalPlate.stop();
    modalPlate = null;
  }
}

$$('[data-cam]').forEach((el) => {
  el.addEventListener('click', () => openCameraModal(el.dataset.cam));
});
$$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeCameraModal));

/* ------------------------------------------------------------------ */
/* Approval and safety actions                                         */
/* ------------------------------------------------------------------ */

function approveCoverage() {
  if (state.approved) return;
  state.approved = true;
  const button = $('#approveButton');
  const stamp = $('#approvalStamp');
  button.disabled = true;
  button.textContent = 'Coverage approved';
  stamp.textContent = `Approved ${formatClock(state.clock, false)}`;
  stamp.classList.add('approved');
  showToast('Approved. One associate moved to fitting, 16:00–18:00.');
}

function dispatchFloorLead() {
  if (state.dispatched) return;
  state.dispatched = true;
  const button = $('#dispatchButton');
  button.disabled = true;
  button.textContent = 'Dispatched';
  $('#dispatchNote').textContent = `Floor lead dispatched ${formatClock(state.clock, false)}`;
  showToast('Floor lead dispatched to Aisle 4. Hazard remains open.');
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ------------------------------------------------------------------ */
/* Live / pause                                                        */
/* ------------------------------------------------------------------ */

function toggleLive() {
  state.playing = !state.playing;
  const btn = $('#pauseLive');
  btn.textContent = state.playing ? 'Pause' : 'Resume';
  $('#editionState').textContent = state.playing ? 'Live edition' : 'Edition paused';
  document.body.classList.toggle('is-paused', !state.playing);
  showToast(state.playing ? 'Live edition resumed.' : 'Edition paused. Camera stills held.');
}

/* ------------------------------------------------------------------ */
/* Clock / live loop                                                   */
/* ------------------------------------------------------------------ */

function tickClock() {
  if (!state.playing) return;
  state.clock = (state.clock + 1) % 86400;
  updateClock();
  state.wireAge++;
  updateWireAge();
}

/* ------------------------------------------------------------------ */
/* Init                                                                */
/* ------------------------------------------------------------------ */

function boot() {
  renderAgeChart();
  renderStoreMap();
  updateClock();
  updateNumbers();
  updateCameraCounts();
  initCameras();

  $('#approveButton').addEventListener('click', approveCoverage);
  $('#dispatchButton').addEventListener('click', dispatchFloorLead);
  $('#pauseLive').addEventListener('click', toggleLive);

  if (!state.playing) {
    $('#pauseLive').textContent = 'Resume';
    $('#editionState').textContent = 'Edition paused';
    document.body.classList.add('is-paused');
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCameraModal();
  });

  setInterval(tickClock, 1000);
  setInterval(liveTick, 5000);

  // Make the nav feel alive without hijacking the page.
  const navLinks = $$('.section-nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((l) => l.classList.remove('is-current'));
      link.classList.add('is-current');
    });
  });

  if (!prefersReducedMotion) {
    // A single quiet reveal for the masthead on load.
    document.body.classList.add('is-loaded');
  }
}

boot();
