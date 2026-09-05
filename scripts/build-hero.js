const fs = require("fs");
const path = require("path");

const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

function measure(str, size, gap = 1) {
  let w = 0;
  for (const ch of str) {
    const glyph = FONT[ch];
    if (!glyph) continue;
    w += (glyph[0].length + gap) * size;
  }
  return w;
}

function pixelLetters(str, originX, originY, size, color, gap = 1) {
  const parts = [];
  let x = originX;
  let i = 0;
  for (const ch of str) {
    const glyph = FONT[ch];
    if (!glyph) continue;
    const rects = [];
    glyph.forEach((row, r) => {
      [...row].forEach((bit, c) => {
        if (bit === "1") {
          rects.push(
            `<rect x="${x + c * size}" y="${originY + r * size}" width="${size}" height="${size}" fill="${color}"/>`
          );
        }
      });
    });
    const delay = (i * 0.08).toFixed(2);
    parts.push(
      `<g opacity="0">${rects.join("")}<animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="${delay}s" fill="freeze"/></g>`
    );
    x += (glyph[0].length + gap) * size;
    i += 1;
  }
  return parts.join("\n");
}

function starField(count, w, h, prefix) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(((i * 97 + 13) % (w - 20)) + 10);
    const y = Math.floor(((i * 53 + 29) % (h - 20)) + 8);
    const s = 1 + (i % 3);
    const dur = (1.2 + (i % 7) * 0.35).toFixed(2);
    const begin = (i * 0.13).toFixed(2);
    out.push(
      `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#f3eef8" opacity="0.35"><animate attributeName="opacity" values="0.15;1;0.15" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></rect>`
    );
  }
  return out.join("\n");
}

function shootingStar(id, x, y, delay, dur) {
  return `<g id="${id}" opacity="0">
    <rect x="0" y="0" width="18" height="2" fill="#f6eefe"/>
    <rect x="18" y="0" width="8" height="2" fill="#cbb8e4"/>
    <rect x="26" y="0" width="4" height="2" fill="#9a86b8"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.7;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="translate" from="${x},${y}" to="${x + 520},${y + 160}" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
  </g>`;
}

function scanlines(w, h, step = 5) {
  const lines = [];
  for (let y = 0; y < h; y += step) {
    lines.push(`<rect x="0" y="${y}" width="${w}" height="1" fill="#120818" opacity="0.12"/>`);
  }
  return lines.join("\n");
}

function city(w, baseY) {
  const rects = [];
  let x = 0;
  let i = 0;
  while (x < w) {
    const bw = 14 + (i * 5) % 18;
    const bh = 18 + ((i * 13 + 7) % 54);
    rects.push(`<rect x="${x}" y="${baseY - bh}" width="${bw}" height="${bh}" fill="${i % 3 === 0 ? "#1a1028" : "#221536"}"/>`);
    if (bh > 28) {
      for (let wy = baseY - bh + 6; wy < baseY - 6; wy += 8) {
        for (let wx = x + 3; wx < x + bw - 3; wx += 6) {
          const on = (i + wx + wy) % 5 !== 0;
          const fill = on ? "#cbb8e4" : "#3d2a5c";
          const op = on ? "0.55" : "0.25";
          const dur = (1.6 + (wx % 5) * 0.4).toFixed(1);
          rects.push(
            `<rect x="${wx}" y="${wy}" width="3" height="3" fill="${fill}" opacity="${op}"><animate attributeName="opacity" values="${op};${on ? 0.95 : 0.1};${op}" dur="${dur}s" begin="${(i % 4) * 0.3}s" repeatCount="indefinite"/></rect>`
          );
        }
      }
    }
    x += bw + 3;
    i += 1;
  }
  return rects.join("\n");
}

function eqBar(x, delay, maxH) {
  return `<rect x="${x}" y="${18}" width="6" height="${maxH}" fill="#cbb8e4" opacity="0.9">
    <animate attributeName="height" values="${maxH * 0.3};${maxH};${maxH * 0.45};${maxH * 0.85};${maxH * 0.3}" dur="1.05s" begin="${delay}s" repeatCount="indefinite"/>
    <animate attributeName="y" values="${18 + maxH * 0.7};${18};${18 + maxH * 0.55};${18 + maxH * 0.15};${18 + maxH * 0.7}" dur="1.05s" begin="${delay}s" repeatCount="indefinite"/>
  </rect>`;
}

const assets = path.join(__dirname, "..", "assets");

function writeBannerLive() {
  const png = fs.readFileSync(path.join(assets, "banner.png"));
  const b64 = png.toString("base64");
  const W = 1500;
  const H = 500;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Harsh Kohli night sky">
  <image href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
  ${starField(42, W, H * 0.55, "b")}
  ${shootingStar("m1", -40, 40, "0s", "3.8")}
  ${shootingStar("m2", 200, 10, "1.9s", "4.4")}
  ${shootingStar("m3", -20, 120, "3.3s", "3.2")}
  <circle cx="980" cy="210" r="70" fill="#d7e0f0" opacity="0.07">
    <animate attributeName="opacity" values="0.04;0.14;0.04" dur="5s" repeatCount="indefinite"/>
    <animate attributeName="r" values="60;82;60" dur="5s" repeatCount="indefinite"/>
  </circle>
  ${scanlines(W, H, 6)}
  ${Array.from({ length: 22 }, (_, i) => {
    const x = (i * 67 + 19) % W;
    const dur = (2.4 + (i % 6) * 0.35).toFixed(2);
    const len = 7 + (i % 5) * 3;
    return `<rect x="${x}" y="-16" width="2" height="${len}" fill="#e8def6" opacity="0.28"><animate attributeName="y" from="-20" to="${H + 10}" dur="${dur}s" begin="${(i * 0.18).toFixed(2)}s" repeatCount="indefinite"/></rect>`;
  }).join("\n")}
  <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#cbb8e4" stroke-width="8" opacity="0.18"/>
</svg>`;
  fs.writeFileSync(path.join(assets, "banner-live.svg"), svg);
}

function writeHeader() {
  const W = 1200;
  const H = 360;
  const name = "HARSH KOHLI";
  const size = 8;
  const nameW = measure(name, size, 1);
  const nameX = Math.round((W - nameW) / 2);
  const nameY = 118;
  const namePixels = pixelLetters(name, nameX, nameY, size, "#f6eefe", 1);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">Harsh Kohli, gamer and developer</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1028"/>
      <stop offset="45%" stop-color="#2a1b45"/>
      <stop offset="100%" stop-color="#3d2a5c"/>
    </linearGradient>
    <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7dffb3" stop-opacity="0"/>
      <stop offset="40%" stop-color="#cbb8e4" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#9ae0ff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#7dffb3" stop-opacity="0"/>
    </linearGradient>
    <mask id="crescent">
      <circle cx="1092" cy="64" r="32" fill="white"/>
      <circle cx="1108" cy="52" r="27" fill="black"/>
    </mask>
  </defs>
  <style>
    .tag { font: 700 12px Verdana, Geneva, sans-serif; fill: #cbb8e4; letter-spacing: 5px; }
    .sub { font: 12px Verdana, Geneva, sans-serif; fill: #9a86b8; letter-spacing: 3px; }
    .prompt { font: 13px Consolas, "Courier New", monospace; fill: #e4d7f5; }
    .live { font: 700 11px Verdana, Geneva, sans-serif; fill: #7dffb3; letter-spacing: 3px; }
    .muted { font: 10px Verdana, Geneva, sans-serif; fill: #9a86b8; letter-spacing: 2px; }
    @keyframes blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .cursor { fill: #e8def6; animation: blink 1.15s steps(1, end) infinite; }
  </style>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <ellipse cx="600" cy="70" rx="380" ry="28" fill="url(#aurora)">
    <animate attributeName="opacity" values="0.35;0.85;0.35" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="cx" values="520;680;520" dur="11s" repeatCount="indefinite"/>
  </ellipse>
  ${starField(36, W, 210, "h")}
  ${shootingStar("h1", -30, 20, "0.4s", "3.6")}
  ${shootingStar("h2", 140, 8, "2.2s", "4.1")}

  <circle cx="1092" cy="64" r="48" fill="#d7e0f0" opacity="0.1">
    <animate attributeName="opacity" values="0.06;0.2;0.06" dur="4.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1092" cy="64" r="32" fill="#e8def6" mask="url(#crescent)"/>

  <g transform="translate(28,22)">
    <circle cx="7" cy="7" r="6" fill="#7dffb3">
      <animate attributeName="opacity" values="1;0.25;1" dur="1.15s" repeatCount="indefinite"/>
    </circle>
    <text x="22" y="11" class="live">LIVE</text>
    <text x="22" y="26" class="muted">NIGHT SERVER</text>
  </g>

  <g transform="translate(1088,18)">
    ${eqBar(0, 0, 22)}
    ${eqBar(10, 0.12, 22)}
    ${eqBar(20, 0.24, 22)}
    ${eqBar(30, 0.08, 22)}
    ${eqBar(40, 0.3, 22)}
  </g>

  <rect x="24" y="16" width="10" height="10" fill="#cbb8e4"/>
  <rect x="1166" y="16" width="10" height="10" fill="#cbb8e4"/>
  <rect x="24" y="334" width="10" height="10" fill="#cbb8e4"/>
  <rect x="1166" y="334" width="10" height="10" fill="#cbb8e4"/>
  <rect x="36" y="22" width="${W - 72}" height="${H - 44}" fill="none" stroke="#6e5a8c" stroke-width="2" opacity="0.55"/>

  <text x="600" y="86" text-anchor="middle" class="tag">NIGHT BUILD  ·  @RIOTLY</text>
  ${namePixels}
  <text x="600" y="200" text-anchor="middle" class="sub">GAMER  ·  DEVELOPER  ·  STILL AT THE BENCH</text>
  <text x="590" y="232" text-anchor="middle" class="prompt">&gt; write it. break it. watch the tape.</text>
  <rect class="cursor" x="818" y="220" width="9" height="16"/>

  ${city(W, 348)}
  <rect x="0" y="348" width="${W}" height="12" fill="#1a1028"/>
</svg>`;
  fs.writeFileSync(path.join(assets, "header.svg"), svg);
}

function writeHud() {
  const rows = [
    ["SOFTWARE", 0.88, "#e8def6"],
    ["QUALITY", 0.81, "#cbb8e4"],
    ["MARKETS", 0.69, "#9ae0ff"],
  ];
  const bars = rows
    .map(([label, pct, color], i) => {
      const y = 28 + i * 42;
      const max = 720;
      const w = Math.round(max * pct);
      return `<text x="36" y="${y + 16}" class="lab">${label}</text>
      <rect x="200" y="${y}" width="${max}" height="18" fill="#1a1028" stroke="#6e5a8c" stroke-width="2"/>
      <rect x="202" y="${y + 2}" width="0" height="14" fill="${color}">
        <animate attributeName="width" from="0" to="${w}" dur="1.4s" begin="${0.2 + i * 0.25}s" fill="freeze"/>
      </rect>
      <text x="940" y="${y + 15}" class="pct">${Math.round(pct * 100)}</text>`;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="160" viewBox="0 0 1200 160" role="img" aria-label="Status bars">
  <style>
    .lab { font: 700 13px Verdana, Geneva, sans-serif; fill: #cbb8e4; letter-spacing: 3px; }
    .pct { font: 700 12px Consolas, "Courier New", monospace; fill: #f6eefe; }
    .cap { font: 10px Verdana, Geneva, sans-serif; fill: #9a86b8; letter-spacing: 2px; }
  </style>
  <rect width="1200" height="160" fill="#2a1b45"/>
  <rect x="16" y="12" width="1168" height="136" fill="none" stroke="#6e5a8c" stroke-width="2"/>
  <text x="36" y="22" class="cap">PLAYER STATUS</text>
  ${bars}
</svg>`;
  fs.writeFileSync(path.join(assets, "hud.svg"), svg);
}

function writeTerminal() {
  const lines = [
    ["$ whoami", "#7dffb3"],
    ["harsh kohli", "#f6eefe"],
    ["gamer. developer. still at the bench.", "#cbb8e4"],
    ["", "#cbb8e4"],
    ["$ cat about.txt", "#7dffb3"],
    ["I write software, I test it like it matters,", "#e4d7f5"],
    ["and I keep learning the systems underneath,", "#e4d7f5"],
    ["including the ones that move money.", "#e4d7f5"],
    ["", "#e4d7f5"],
    ["First computer in 2015. Shipping for real in 2022.", "#cbb8e4"],
    ["Senior QA in 2024. Still asking what happens", "#cbb8e4"],
    ["if you press it twice.", "#cbb8e4"],
    ["", "#cbb8e4"],
    ["$ echo site", "#7dffb3"],
    ["https://harshkohli.com", "#9ae0ff"],
  ];
  const text = lines
    .map(([line, fill], i) => {
      const y = 58 + i * 18;
      return `<text x="36" y="${y}" fill="${fill}" class="mono" opacity="0">${escapeXml(
        line
      )}<animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="${(
        0.15 +
        i * 0.16
      ).toFixed(2)}s" fill="freeze"/></text>`;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360" role="img" aria-label="Terminal">
  <style>
    .mono { font: 14px Consolas, "Courier New", monospace; }
    .title { font: 700 11px Verdana, Geneva, sans-serif; fill: #2a1b45; letter-spacing: 1px; }
    @keyframes blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .cursor { fill: #7dffb3; animation: blink 1.15s steps(1, end) infinite; }
  </style>
  <rect width="1200" height="360" rx="10" fill="#1a1028"/>
  <rect x="0" y="0" width="1200" height="32" fill="#cbb8e4"/>
  <circle cx="22" cy="16" r="6" fill="#ff6b8a"/>
  <circle cx="42" cy="16" r="6" fill="#ffd36b"/>
  <circle cx="62" cy="16" r="6" fill="#7dffb3"/>
  <text x="90" y="20" class="title">riotly@night  ~  zsh</text>
  ${text}
  <rect class="cursor" x="36" y="332" width="8" height="14"/>
</svg>`;
  fs.writeFileSync(path.join(assets, "terminal.svg"), svg);
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function writeDivider() {
  const meteors = [0, 1, 2, 3]
    .map((i) => shootingStar(`d${i}`, -30 + i * 80, 2 + i * 3, `${i * 0.9}s`, `${2.8 + i * 0.3}`))
    .join("\n");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="36" viewBox="0 0 1200 36" role="img" aria-hidden="true">
  <rect width="1200" height="36" fill="#2a1b45"/>
  ${starField(18, 1200, 36, "d")}
  ${meteors}
  <line x1="140" y1="18" x2="1060" y2="18" stroke="#6e5a8c" stroke-width="1"/>
</svg>`;
  fs.writeFileSync(path.join(assets, "divider.svg"), svg);
}

function embedJpeg(file) {
  const buf = fs.readFileSync(path.join(assets, file));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function writePressStart() {
  const label = "PRESS START";
  const size = 7;
  const w = measure(label, size, 1);
  const x = Math.round((1200 - w) / 2);
  const letters = pixelLetters(label, x, 38, size, "#f6eefe", 1);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="110" viewBox="0 0 1200 110" role="img" aria-label="Press start">
  <rect width="1200" height="110" fill="#1a1028"/>
  <g>
    <animate attributeName="opacity" values="1;0.2;1" dur="1.35s" repeatCount="indefinite"/>
    ${letters}
  </g>
  <text x="600" y="96" text-anchor="middle" fill="#9a86b8" font-family="Verdana, Geneva, sans-serif" font-size="12" letter-spacing="4">ENTER HARSHKOHLI.COM</text>
</svg>`;
  fs.writeFileSync(path.join(assets, "press-start.svg"), svg);
}

function writeWorld() {
  const href = embedJpeg("world.jpg");
  const W = 1549;
  const H = 495;
  const nodes = [
    { x: 290, y: 330, name: "THE BENCH", sub: "software" },
    { x: 650, y: 400, name: "HOME", sub: "harshkohli.com" },
    { x: 800, y: 268, name: "THE LAB", sub: "quality" },
    { x: 1265, y: 315, name: "THE TAPE", sub: "markets" },
  ];
  const marks = nodes
    .map(
      (n, i) => `<g>
      <circle cx="${n.x}" cy="${n.y}" r="18" fill="none" stroke="#f6eefe" stroke-width="2" opacity="0.85">
        <animate attributeName="r" values="14;24;14" dur="${2.2 + i * 0.2}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="${2.2 + i * 0.2}s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${n.x}" cy="${n.y}" r="5" fill="#ffd36b">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.1s" begin="${i * 0.15}s" repeatCount="indefinite"/>
      </circle>
      <rect x="${n.x - 52}" y="${n.y - 42}" width="104" height="22" fill="#1a1028" opacity="0.72"/>
      <text x="${n.x}" y="${n.y - 27}" text-anchor="middle" fill="#f6eefe" font-family="Verdana, Geneva, sans-serif" font-size="11" font-weight="700" letter-spacing="1">${n.name}</text>
      <text x="${n.x}" y="${n.y + 38}" text-anchor="middle" fill="#cbb8e4" font-family="Verdana, Geneva, sans-serif" font-size="10">${n.sub}</text>
    </g>`
    )
    .join("\n");
  const pathD = `M ${nodes[0].x},${nodes[0].y} L ${nodes[1].x},${nodes[1].y} L ${nodes[2].x},${nodes[2].y} L ${nodes[3].x},${nodes[3].y} L ${nodes[0].x},${nodes[0].y}`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Night world map">
  <image href="${href}" xlink:href="${href}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
  <path d="${pathD}" fill="none" stroke="#f6eefe" stroke-width="2" stroke-dasharray="6 8" opacity="0.7">
    <animate attributeName="stroke-dashoffset" from="80" to="0" dur="4s" repeatCount="indefinite"/>
  </path>
  ${marks}
  <circle r="7" fill="#7dffb3" stroke="#1a1028" stroke-width="2">
    <animateMotion dur="14s" repeatCount="indefinite" rotate="0" path="${pathD}"/>
  </circle>
  <rect x="18" y="16" width="210" height="36" fill="#1a1028" opacity="0.75"/>
  <text x="30" y="39" fill="#cbb8e4" font-family="Verdana, Geneva, sans-serif" font-size="13" font-weight="700" letter-spacing="2">WORLD  ·  NIGHT</text>
</svg>`;
  fs.writeFileSync(path.join(assets, "world.svg"), svg);
}

function writeDialogue() {
  const href = embedJpeg("moth.jpg");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="420" viewBox="0 0 1200 420" role="img" aria-label="Night dialogue">
  <style>
    .d { font: 16px Georgia, "Times New Roman", serif; fill: #f6eefe; }
    .s { font: 11px Verdana, Geneva, sans-serif; fill: #cbb8e4; letter-spacing: 2px; }
    @keyframes blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .tri { fill: #f6eefe; animation: blink 1.1s steps(1, end) infinite; }
  </style>
  <image href="${href}" xlink:href="${href}" x="0" y="0" width="1200" height="250" preserveAspectRatio="xMidYMid slice"/>
  <rect x="40" y="268" width="1120" height="132" fill="#1a1028" stroke="#cbb8e4" stroke-width="4"/>
  <rect x="48" y="276" width="1104" height="116" fill="none" stroke="#6e5a8c" stroke-width="2"/>
  <text x="72" y="304" class="s">MOON MOTH</text>
  <text x="72" y="336" class="d" opacity="0">The night is long. The bench is still on.<animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="0.3s" fill="freeze"/></text>
  <text x="72" y="364" class="d" opacity="0">I write it. I break it. I watch the tape.<animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.1s" fill="freeze"/></text>
  <polygon class="tri" points="1118,372 1134,372 1126,384"/>
</svg>`;
  fs.writeFileSync(path.join(assets, "dialogue.svg"), svg);
}

function slot(x, y, label, icon) {
  return `<g transform="translate(${x},${y})">
    <rect width="130" height="92" fill="#1a1028" stroke="#6e5a8c" stroke-width="3"/>
    <rect x="6" y="6" width="118" height="54" fill="#2a1b45"/>
    ${icon}
    <text x="65" y="80" text-anchor="middle" fill="#cbb8e4" font-family="Verdana, Geneva, sans-serif" font-size="10" letter-spacing="1">${label}</text>
    <rect width="130" height="92" fill="none" stroke="#f6eefe" stroke-width="1" opacity="0">
      <animate attributeName="opacity" values="0;0.55;0" dur="3.2s" repeatCount="indefinite"/>
    </rect>
  </g>`;
}

function writeInventory() {
  const items = [
    slot(40, 44, "KEYBOARD", `<rect x="28" y="22" width="74" height="22" fill="#cbb8e4"/><rect x="32" y="26" width="8" height="6" fill="#1a1028"/><rect x="44" y="26" width="8" height="6" fill="#1a1028"/><rect x="56" y="26" width="8" height="6" fill="#1a1028"/><rect x="68" y="26" width="8" height="6" fill="#1a1028"/><rect x="80" y="26" width="8" height="6" fill="#1a1028"/>`),
    slot(190, 44, "LENS", `<circle cx="65" cy="30" r="14" fill="none" stroke="#9ae0ff" stroke-width="4"/><rect x="76" y="38" width="18" height="5" fill="#cbb8e4" transform="rotate(35 76 38)"/>`),
    slot(340, 44, "CANDLE", `<rect x="58" y="18" width="14" height="28" fill="#7dffb3"/><rect x="62" y="10" width="6" height="10" fill="#ffd36b"/>`),
    slot(490, 44, "MOON", `<circle cx="65" cy="32" r="14" fill="#e8def6"/><circle cx="72" cy="26" r="12" fill="#2a1b45"/>`),
    slot(640, 44, "COMMIT", `<rect x="40" y="28" width="50" height="6" fill="#cbb8e4"/><circle cx="48" cy="31" r="6" fill="#7dffb3"/><circle cx="82" cy="31" r="6" fill="#7dffb3"/>`),
    slot(790, 44, "SERVER", `<rect x="48" y="16" width="34" height="36" fill="#cbb8e4"/><rect x="52" y="20" width="26" height="6" fill="#1a1028"/><rect x="52" y="30" width="26" height="6" fill="#1a1028"/><circle cx="58" cy="44" r="3" fill="#7dffb3"/>`),
    slot(940, 44, "TAPE", `<circle cx="52" cy="32" r="12" fill="none" stroke="#ffd36b" stroke-width="4"/><circle cx="78" cy="32" r="12" fill="none" stroke="#ffd36b" stroke-width="4"/><rect x="52" y="30" width="26" height="4" fill="#cbb8e4"/>`),
    slot(1090, 44, "NIGHT", `<rect x="40" y="18" width="50" height="30" fill="#1a1028"/><rect x="46" y="24" width="6" height="6" fill="#f6eefe"/><rect x="70" y="22" width="4" height="4" fill="#cbb8e4"/>`),
  ].join("\n");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="160" viewBox="0 0 1260 160" role="img" aria-label="Inventory">
  <rect width="1260" height="160" fill="#2a1b45"/>
  <rect x="16" y="10" width="1228" height="140" fill="none" stroke="#6e5a8c" stroke-width="2"/>
  <text x="36" y="28" fill="#9a86b8" font-family="Verdana, Geneva, sans-serif" font-size="11" letter-spacing="3">INVENTORY</text>
  ${items}
</svg>`;
  fs.writeFileSync(path.join(assets, "inventory.svg"), svg);
}

function writeConstellation() {
  const stars = [
    { x: 80, y: 130, ylbl: "2015", t: "first computer" },
    { x: 280, y: 70, ylbl: "2022", t: "started shipping" },
    { x: 480, y: 150, ylbl: "2023", t: "QA at scale" },
    { x: 680, y: 60, ylbl: "2024", t: "senior QA" },
    { x: 880, y: 140, ylbl: "2025", t: "deepest year" },
    { x: 1080, y: 80, ylbl: "2026", t: "the tape" },
  ];
  const pathD = stars.map((s, i) => `${i ? "L" : "M"} ${s.x},${s.y}`).join(" ");
  const nodes = stars
    .map(
      (s, i) => `<g>
      <circle cx="${s.x}" cy="${s.y}" r="0" fill="#f6eefe">
        <animate attributeName="r" from="0" to="6" dur="0.4s" begin="${0.3 + i * 0.35}s" fill="freeze"/>
      </circle>
      <circle cx="${s.x}" cy="${s.y}" r="10" fill="none" stroke="#cbb8e4" opacity="0">
        <animate attributeName="opacity" from="0" to="0.8" dur="0.4s" begin="${0.3 + i * 0.35}s" fill="freeze"/>
      </circle>
      <text x="${s.x}" y="${s.y - 18}" text-anchor="middle" fill="#f6eefe" font-family="Verdana, Geneva, sans-serif" font-size="12" font-weight="700" opacity="0">${s.ylbl}<animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${0.45 + i * 0.35}s" fill="freeze"/></text>
      <text x="${s.x}" y="${s.y + 28}" text-anchor="middle" fill="#cbb8e4" font-family="Verdana, Geneva, sans-serif" font-size="11" opacity="0">${s.t}<animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${0.55 + i * 0.35}s" fill="freeze"/></text>
    </g>`
    )
    .join("\n");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="220" viewBox="0 0 1200 220" role="img" aria-label="Journey constellation">
  <rect width="1200" height="220" fill="#1a1028"/>
  ${starField(28, 1200, 220, "c")}
  <path d="${pathD}" fill="none" stroke="#cbb8e4" stroke-width="2" stroke-dasharray="420" stroke-dashoffset="420">
    <animate attributeName="stroke-dashoffset" from="420" to="0" dur="2.8s" fill="freeze"/>
  </path>
  ${nodes}
  <text x="40" y="28" fill="#9a86b8" font-family="Verdana, Geneva, sans-serif" font-size="11" letter-spacing="3">CONSTELLATION  ·  SAVE FILE</text>
</svg>`;
  fs.writeFileSync(path.join(assets, "constellation.svg"), svg);
}

writeBannerLive();
writeHeader();
writeHud();
writeTerminal();
writeDivider();
writePressStart();
writeWorld();
writeDialogue();
writeInventory();
writeConstellation();
console.log("wrote living night set");
