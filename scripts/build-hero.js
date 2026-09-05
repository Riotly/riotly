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

writeBannerLive();
writeHeader();
writeHud();
writeTerminal();
writeDivider();
console.log("wrote banner-live, header, hud, terminal, divider");
