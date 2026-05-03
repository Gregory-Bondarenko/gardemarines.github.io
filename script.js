/* ============================================================
   GARDEMARINES [GDM] — script.js
   Sections: particles · nav · reveal · radar
   ============================================================ */

/* ── 1. PARTICLES ─────────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const SIZES = ['s', 's', 's', 'm', 'm', 'l'];
  const COUNT = 50;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    const size = SIZES[Math.floor(Math.random() * SIZES.length)];
    p.className = `particle ${size}`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 20}s`;
    p.style.animationDuration = `${10 + Math.random() * 12}s`;
    fragment.appendChild(p);
  }

  container.appendChild(fragment);
})();

/* ── 2. NAV SCROLL ────────────────────────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── 3. SCROLL REVEAL ─────────────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── 4. RADAR CANVAS ──────────────────────────────────────── */
(function initRadar() {
  const cv = document.getElementById('radarCanvas');
  if (!cv) return;

  const ctx  = cv.getContext('2d');
  const W    = 620;
  const CX   = W / 2;
  const CY   = W / 2;
  const RMAX = 268;
  const TAU  = Math.PI * 2;
  const SPEED = 0.0028;
  const TOTAL_SWEEPS = 4;

  /* Player list ─ index, nick, tier */
  const PLAYERS = [
    'egorkochman','MaloyGnoy','Leps_on_TV','gggk303','Alex_DeviL777',
    'Wit163rus','Yaruy_K','PoznyakAlexDi','Tima-ma','Roman_WOW_',
    'Checkmatic','mcbay1988','Alexander-VIII','CEPbIU_76','Evgeniy_Ivshin',
    'Alex_Messer','Prado_VOD','Naikon71','F0K1CH','Super-zverugin',
    'BaLTaZaR014','ZEMJI9IHUH','komawars','dimonlamo','RoskeA-RoBBi',
    'isaev_denis','Dennazzz','Intrepids7','FenomenRostov','BursAssassin',
    'ChestorQQ_RU','OziSchneider','GOLDBERG475','devasator91','lucky292pear',
    'OziBlitz','Xolod','vsegda-buhoy','vladimir_chevere','sagoyakov_roman',
    'Fufic-92','Aerilou','Mrwhitevoron','Redvoin_RF','SharOn_RU',
  ];

  const n  = PLAYERS.length;
  const r0 = 124; // inner ring radius
  const r1 = 176; // outer ring radius

  /* Build dot positions ────────────────────────────────────── */
  function norm(a) { const x = a % TAU; return x < 0 ? x + TAU : x; }

  const dots = PLAYERS.map((nick, idx) => {
    const inner = idx % 2 === 0;
    const r     = inner ? r0 : r1;
    const ang   = norm(-Math.PI / 2 + (idx / n) * TAU);
    const rv    = r + (Math.random() - 0.5) * 5;
    return {
      x: CX + rv * Math.cos(ang),
      y: CY + rv * Math.sin(ang),
      angle: ang, nick,
      bright: 0, revealed: false,
      group: idx % 3,
    };
  });

  /* Manual position tweaks ─────────────────────────────────── */
  const adjustments = {
    egorkochman:  { dr: -34, da: +0.14 },
    RoskeA_RoBBi: { r: 105 },
    Wit163rus:    { r: 200, group: 1 },
    Mrwhitevoron: { da: +0.18 },
    BaLTaZaR014:  { da: +0.16 },
  };

  dots.forEach(d => {
    // egorkochman: move inward and rotate slightly
    if (d.nick === 'egorkochman') {
      const ang = d.angle + 0.14;
      d.x = CX + 90 * Math.cos(ang); d.y = CY + 90 * Math.sin(ang); d.angle = ang;
    }
    // RoskeA-RoBBi: tighter radius
    if (d.nick === 'RoskeA-RoBBi') {
      d.x = CX + 105 * Math.cos(d.angle); d.y = CY + 105 * Math.sin(d.angle);
    }
    // Wit163rus: push outward and change group
    if (d.nick === 'Wit163rus') {
      const ang = d.angle + 0.42;
      d.x = CX + 200 * Math.cos(ang); d.y = CY + 200 * Math.sin(ang);
      d.angle = ang; d.group = 1;
    }
    // Small rotations
    if (d.nick === 'Mrwhitevoron') {
      const ang = d.angle + 0.18;
      const r   = Math.hypot(d.x - CX, d.y - CY);
      d.x = CX + r * Math.cos(ang); d.y = CY + r * Math.sin(ang); d.angle = ang;
    }
    if (d.nick === 'BaLTaZaR014') {
      const ang = d.angle + 0.16;
      const r   = Math.hypot(d.x - CX, d.y - CY);
      d.x = CX + r * Math.cos(ang); d.y = CY + r * Math.sin(ang); d.angle = ang;
    }
  });

  /* Nick label positioning ─────────────────────────────────── */
  function nickPos(d) {
    const NW  = d.nick.length * 6.2;
    const PAD = 30;
    const qx  = d.x > CX ? 1 : -1;
    const qy  = d.y > CY ? 1 : -1;
    let   tx  = d.x + qx * 10;
    let   ty  = d.y + qy * 13;
    const anchor = qx > 0 ? 'left' : 'right';
    if (anchor === 'left')  { if (tx + NW > W - PAD) tx = W - PAD - NW; }
    else                    { if (tx - NW < PAD)     tx = PAD + NW;     }
    ty = Math.max(PAD + 10, Math.min(W - PAD, ty));
    return { tx, ty, anchor };
  }

  /* State ──────────────────────────────────────────────────── */
  let sweep      = norm(-Math.PI / 2 + 0.7);
  let totalAngle = 0;

  function reset() {
    totalAngle = 0;
    sweep = norm(-Math.PI / 2 + 0.7);
    dots.forEach(d => { d.bright = 0; d.revealed = false; });
  }

  /* Draw helpers ───────────────────────────────────────────── */
  function drawBackground() {
    ctx.clearRect(0, 0, W, W);

    // Rings
    [52, 108, 166, 224, 268].forEach((r, i) => {
      ctx.beginPath(); ctx.arc(CX, CY, r, 0, TAU);
      ctx.strokeStyle = i === 4 ? '#c9a04a' : '#243040';
      ctx.lineWidth   = i === 4 ? 1.2 : 0.5;
      ctx.stroke();
    });

    // Cross-hairs
    [
      [CX - 272, CY, CX + 272, CY], [CX, CY - 272, CX, CY + 272],
      [CX - 193, CY - 193, CX + 193, CY + 193], [CX + 193, CY - 193, CX - 193, CY + 193],
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#243040'; ctx.lineWidth = 0.4; ctx.stroke();
    });

    // Tick marks
    for (let i = 0; i < 36; i++) {
      const a   = (i / 36) * TAU;
      const len = i % 9 === 0 ? 10 : i % 3 === 0 ? 6 : 3;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * 268, CY + Math.sin(a) * 268);
      ctx.lineTo(CX + Math.cos(a) * (268 - len), CY + Math.sin(a) * (268 - len));
      ctx.strokeStyle = '#c9a04a'; ctx.lineWidth = 0.6; ctx.stroke();
    }

    // Cardinal directions
    ctx.font = 'bold 11px monospace'; ctx.fillStyle = '#d4a849';
    ctx.textAlign = 'center'; ctx.fillText('N', CX, CY - 276); ctx.fillText('S', CX, CY + 287);
    ctx.textAlign = 'left';   ctx.fillText('E', CX + 278, CY + 4);
    ctx.textAlign = 'right';  ctx.fillText('W', CX - 275, CY + 4);

    // Center dot
    ctx.beginPath(); ctx.arc(CX, CY, 3, 0, TAU);
    ctx.fillStyle = '#d4a849'; ctx.fill();

    // Scan counter
    const pass = Math.floor(totalAngle / TAU) + 1;
    const pct  = Math.min(100, Math.round(((totalAngle % TAU) / TAU) * 100));
    ctx.font = '9px monospace'; ctx.fillStyle = '#2a3a48';
    ctx.textAlign = 'left';
    ctx.fillText(`SCAN ${Math.min(pass, TOTAL_SWEEPS)}/${TOTAL_SWEEPS}  ${pct}%`, CX - 260, CY + 263);
  }

  function drawSweep() {
    const TRAIL = Math.PI * 0.55;
    const STEPS = 20;
    for (let i = 0; i < STEPS; i++) {
      const a0 = sweep - TRAIL * (1 - i / STEPS);
      const a1 = sweep - TRAIL * (1 - (i + 1) / STEPS);
      const t  = (i + 1) / STEPS;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, RMAX, a0, a1); ctx.closePath();
      ctx.fillStyle = `rgba(212,168,73,${t * t * 0.13})`;
      ctx.fill(); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(sweep) * RMAX, CY + Math.sin(sweep) * RMAX);
    ctx.strokeStyle = 'rgba(212,168,73,0.88)'; ctx.lineWidth = 1.2; ctx.stroke();
  }

  function drawDots() {
    dots.forEach(d => {
      if (d.bright < 0.01) return;
      const a = d.bright;

      // Glow halo
      ctx.save(); ctx.globalAlpha = a * 0.15;
      ctx.beginPath(); ctx.arc(d.x, d.y, 12, 0, TAU);
      ctx.fillStyle = '#d4a849'; ctx.fill(); ctx.restore();

      // Dot
      ctx.save(); ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, TAU);
      ctx.fillStyle = '#d4a849'; ctx.fill(); ctx.restore();

      // Nick label
      if (a < 0.08) return;
      const { tx, ty, anchor } = nickPos(d);
      ctx.save(); ctx.globalAlpha = a * 0.92;
      ctx.font = '10px monospace'; ctx.fillStyle = '#d4a849';
      ctx.textAlign = anchor; ctx.fillText(d.nick, tx, ty);
      ctx.restore();
    });
  }

  /* Animation loop ─────────────────────────────────────────── */
  function frame() {
    sweep       = norm(sweep + SPEED);
    totalAngle += SPEED;

    if (totalAngle >= TAU * TOTAL_SWEEPS + 0.01) {
      reset();
      return requestAnimationFrame(frame);
    }

    const passes = totalAngle / TAU;
    dots.forEach(d => {
      const canReveal = passes >= d.group && passes < d.group + 1;
      const diff      = norm(d.angle - sweep);
      const onBeam    = diff < 0.07 || diff > TAU - 0.015;

      if (onBeam && canReveal && !d.revealed) d.revealed = true;

      if (d.revealed) {
        d.bright = onBeam && canReveal
          ? Math.min(1, d.bright + 0.08)
          : Math.max(0, d.bright - 0.0008);
      }
    });

    drawBackground();
    drawSweep();
    drawDots();
    requestAnimationFrame(frame);
  }

  /* Start only when in viewport */
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { observer.disconnect(); frame(); }
  }, { threshold: 0.2 });
  observer.observe(cv);
})();
