const fs = require("fs");
const path = require("path");

const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
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
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

function pixelText(str, originX, originY, size, color, gap = 1) {
  const rows = [];
  let x = originX;
  for (const ch of str) {
    const glyph = FONT[ch];
    if (!glyph) continue;
    glyph.forEach((row, r) => {
      [...row].forEach((bit, c) => {
        if (bit === "1") {
          rows.push(
            `<rect x="${x + c * size}" y="${originY + r * size}" width="${size}" height="${size}" fill="${color}"/>`
          );
        }
      });
    });
    x += (glyph[0].length + gap) * size;
  }
  return { svg: rows.join("\n"), width: x - originX };
}

function measure(str, size, gap = 1) {
  let w = 0;
  for (const ch of str) {
    const glyph = FONT[ch];
    if (!glyph) continue;
    w += (glyph[0].length + gap) * size;
  }
  return w;
}

const W = 1200;
const H = 280;
const name = "HARSH KOHLI";
const size = 8;
const nameW = measure(name, size, 1);
const nameX = Math.round((W - nameW) / 2);
const nameY = 86;

const stars = [];
const starSeed = [
  [40, 28, 2, 1.6],
  [90, 52, 2, 2.1],
  [140, 22, 3, 1.4],
  [210, 44, 2, 2.8],
  [280, 18, 2, 1.9],
  [340, 60, 3, 2.4],
  [410, 30, 2, 1.2],
  [470, 70, 2, 2.6],
  [530, 24, 2, 1.7],
  [620, 48, 3, 2.2],
  [690, 16, 2, 1.5],
  [760, 58, 2, 2.9],
  [830, 34, 3, 1.3],
  [900, 20, 2, 2.0],
  [960, 66, 2, 1.8],
  [1020, 40, 3, 2.5],
  [1100, 26, 2, 1.1],
  [1150, 72, 2, 2.7],
  [60, 90, 2, 2.3],
  [180, 78, 2, 1.6],
  [800, 80, 2, 2.1],
  [1040, 88, 2, 1.4],
];
starSeed.forEach(([x, y, s, dur], i) => {
  stars.push(`<rect class="star s${i % 4}" x="${x}" y="${y}" width="${s}" height="${s}" fill="#e8def6">
  <animate attributeName="opacity" values="0.25;1;0.25" dur="${dur}s" repeatCount="indefinite" begin="${(i * 0.2).toFixed(1)}s"/>
</rect>`);
});

const { svg: nameSvg } = pixelText(name, nameX, nameY, size, "#f6eefe", 1);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title">
  <title id="title">Harsh Kohli, gamer and developer</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#24163d"/>
      <stop offset="55%" stop-color="#2a1b45"/>
      <stop offset="100%" stop-color="#3a2458"/>
    </linearGradient>
    <mask id="crescent">
      <circle cx="1088" cy="58" r="30" fill="white"/>
      <circle cx="1104" cy="48" r="26" fill="black"/>
    </mask>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    .tag { font: 600 13px Verdana, Geneva, sans-serif; fill: #cbb8e4; letter-spacing: 6px; }
    .sub { font: 12px Verdana, Geneva, sans-serif; fill: #9a86b8; letter-spacing: 3px; }
    .prompt { font: 13px "Cascadia Code", Consolas, "Courier New", monospace; fill: #e4d7f5; }
    .cursor { fill: #e8def6; }
    @keyframes blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .cursor { animation: blink 1.15s steps(1, end) infinite; }
  </style>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars.join("\n  ")}

  <circle cx="1088" cy="58" r="38" fill="#d7e0f0" opacity="0.12" filter="url(#glow)">
    <animate attributeName="opacity" values="0.08;0.2;0.08" dur="4.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="1088" cy="58" r="30" fill="#d7e0f0" mask="url(#crescent)"/>

  <g>
    <rect x="70" y="18" width="6" height="6" fill="#cbb8e4"/>
    <rect x="1124" y="18" width="6" height="6" fill="#cbb8e4"/>
    <rect x="70" y="256" width="6" height="6" fill="#cbb8e4"/>
    <rect x="1124" y="256" width="6" height="6" fill="#cbb8e4"/>
  </g>

  <text x="600" y="48" text-anchor="middle" class="tag">NIGHT BUILD  ·  @RIOTLY</text>

  ${nameSvg}

  <text x="600" y="168" text-anchor="middle" class="sub">GAMER  ·  DEVELOPER  ·  STILL AT THE BENCH</text>

  <text x="592" y="214" text-anchor="middle" class="prompt">&gt; write it. break it. watch the tape.</text>
  <rect class="cursor" x="820" y="202" width="9" height="16"/>

  <line x1="360" y1="236" x2="840" y2="236" stroke="#6e5a8c" stroke-width="2"/>
  <text x="600" y="258" text-anchor="middle" class="sub">UTTAR PRADESH  ·  INDIA  ·  HARSHKOHLI.COM</text>
</svg>
`;

const out = path.join(__dirname, "..", "assets", "header.svg");
fs.writeFileSync(out, svg);
console.log("wrote", out);
