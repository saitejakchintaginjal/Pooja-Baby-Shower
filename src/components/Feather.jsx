import { useId } from 'react'

// A realistic peacock feather (drawn as SVG):
//  - a curved, tapering quill with a pale shaft highlight
//  - hundreds of fine barbs in iridescent bronze → emerald → teal, feathering out in a teardrop vane
//  - a layered "eye": bronze rim, emerald, turquoise, deep sapphire core, glossy highlight and the
//    little notch at the bottom of the eye
//  - loose, wispy barbs along the lower stem
// Random-looking values come from a tiny deterministic generator, so it renders identically every time.

const rand = (() => {
  let s = 12345
  return () => (s = (s * 16807) % 2147483647) / 2147483647
})()

const EYE = { x: 30, y: 56 }
// the quill is a gentle curve from the base (30,168) up to the eye
const shaftX = (y) => 30 + Math.sin((y - 40) / 26) * 1.7

// build the barbs once (module level) so every instance shares the same geometry
const BARBS = []
{
  const palette = [
    ['#d9a441', '#b8821f'], // golden bronze
    ['#6fae45', '#3f8a2f'], // fresh green
    ['#2c9a6a', '#1c7a55'], // emerald
    ['#1f9aa0', '#167a86'], // teal
    ['#2f6fb8', '#244d96'], // blue
  ]
  for (const side of [-1, 1]) {
    // vane around and below the eye: a teardrop envelope
    for (let y = 36; y <= 150; y += 0.9) {
      const t = (y - 36) / 114
      // envelope half-width: full around the eye, narrowing toward the base
      const env = y < 100 ? 20 * Math.pow(Math.sin(Math.PI * ((y - 30) / 78)), 0.78) : Math.max(4, 17 * (1 - (y - 100) / 62))
      if (env <= 1) continue
      const len = env * (0.82 + rand() * 0.3)
      const sx = shaftX(y)
      const droop = 3 + 9 * t + rand() * 3
      const ex = sx + side * len
      const ey = y + droop
      const cx = sx + side * len * 0.55
      const cy = y - 1.5 + droop * 0.2
      // colour band depends on how far out the barb reaches and how far down the feather it is
      const dist = len / 20
      let ci = y > 100 ? 0 : dist > 0.85 ? (rand() < 0.5 ? 0 : 1) : dist > 0.6 ? 1 + Math.floor(rand() * 2) : dist > 0.35 ? 2 + Math.floor(rand() * 2) : 3 + Math.floor(rand() * 2)
      if (rand() < 0.1) ci = Math.floor(rand() * palette.length)
      BARBS.push({
        d: `M${sx.toFixed(2)} ${y.toFixed(2)} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`,
        c: palette[ci][rand() < 0.5 ? 0 : 1],
        w: 0.55 + rand() * 0.35,
        o: 0.55 + rand() * 0.4,
      })
    }
    // loose wispy barbs along the lower stem
    for (let y = 98; y <= 160; y += 1.8) {
      const sx = shaftX(y)
      const len = 5 + rand() * 11
      const ang = 0.5 + rand() * 0.5
      BARBS.push({
        d: `M${sx.toFixed(2)} ${y.toFixed(2)} q${(side * len * 0.55).toFixed(2)} ${(-1 + rand() * 2).toFixed(2)} ${(side * len).toFixed(2)} ${(len * ang).toFixed(2)}`,
        c: rand() < 0.5 ? '#9a8a3a' : '#5d8a3a',
        w: 0.35 + rand() * 0.25,
        o: 0.35 + rand() * 0.35,
      })
    }
  }
  // fine tuft of barbs fanning out above the eye
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (i / 25 - 0.5) * 1.5
    const len = 7 + rand() * 7
    const sx = shaftX(38)
    BARBS.push({
      d: `M${sx.toFixed(2)} 38 q${(Math.cos(a) * len * 0.5).toFixed(2)} ${(Math.sin(a) * len * 0.5).toFixed(2)} ${(Math.cos(a) * len).toFixed(2)} ${(Math.sin(a) * len).toFixed(2)}`,
      c: rand() < 0.5 ? '#c99a3a' : '#7cae4a',
      w: 0.4 + rand() * 0.25,
      o: 0.5 + rand() * 0.35,
    })
  }
}

const shaftPath = (() => {
  let d = ''
  for (let y = 168; y >= 38; y -= 4) d += `${d ? 'L' : 'M'}${shaftX(y).toFixed(2)} ${y} `
  return d
})()

export default function Feather({ className = '', style }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const u = (n) => `pf${id}${n}`
  return (
    <svg viewBox="0 0 60 170" className={className} style={style} aria-hidden="true" fill="none">
      <defs>
        <radialGradient id={u('rim')} cx=".5" cy=".42" r=".6">
          <stop offset="0" stopColor="#1c8f6a" />
          <stop offset=".55" stopColor="#7aa63c" />
          <stop offset="1" stopColor="#c99732" />
        </radialGradient>
        <radialGradient id={u('mid')} cx=".5" cy=".4" r=".65">
          <stop offset="0" stopColor="#12a09a" />
          <stop offset=".7" stopColor="#1e8a78" />
          <stop offset="1" stopColor="#3f9b4a" />
        </radialGradient>
        <radialGradient id={u('blue')} cx=".5" cy=".38" r=".7">
          <stop offset="0" stopColor="#3aa6e0" />
          <stop offset=".45" stopColor="#1f5fc0" />
          <stop offset="1" stopColor="#1a2f86" />
        </radialGradient>
        <radialGradient id={u('core')} cx=".5" cy=".42" r=".6">
          <stop offset="0" stopColor="#2a2a8a" />
          <stop offset=".6" stopColor="#14125a" />
          <stop offset="1" stopColor="#0a0838" />
        </radialGradient>
        <linearGradient id={u('quill')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b4a14" />
          <stop offset=".45" stopColor="#e6cf93" />
          <stop offset="1" stopColor="#6b4a14" />
        </linearGradient>
        <filter id={u('soft')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      {/* soft iridescent glow behind the eye */}
      <ellipse cx={EYE.x} cy={EYE.y} rx="19" ry="25" fill="#1f9d8a" opacity=".32" filter={`url(#${u('soft')})`} />

      {/* the barbs */}
      <g strokeLinecap="round">
        {BARBS.map((b, i) => (
          <path key={i} d={b.d} stroke={b.c} strokeWidth={b.w} opacity={b.o} />
        ))}
      </g>

      {/* the quill: darker edge + pale highlight */}
      <path d={shaftPath} stroke="#5a3d10" strokeWidth="1.5" strokeLinecap="round" />
      <path d={shaftPath} stroke={`url(#${u('quill')})`} strokeWidth="1" strokeLinecap="round" />

      {/* layered eye */}
      <ellipse cx={EYE.x} cy={EYE.y} rx="14.5" ry="19.5" fill={`url(#${u('rim')})`} />
      <ellipse cx={EYE.x} cy={EYE.y} rx="14.5" ry="19.5" stroke="#8a6a1a" strokeWidth=".5" opacity=".6" />
      <ellipse cx={EYE.x} cy={EYE.y + 0.4} rx="11.6" ry="16.2" fill={`url(#${u('mid')})`} />
      <ellipse cx={EYE.x} cy={EYE.y + 0.6} rx="9" ry="12.8" fill={`url(#${u('blue')})`} />
      <ellipse cx={EYE.x} cy={EYE.y + 0.8} rx="5.8" ry="8.6" fill={`url(#${u('core')})`} />
      {/* the notch at the bottom of the eye, where the colours pinch inward */}
      <path d={`M${EYE.x - 3.4} ${EYE.y + 14.6} Q${EYE.x} ${EYE.y + 8.2} ${EYE.x + 3.4} ${EYE.y + 14.6} Q${EYE.x} ${EYE.y + 11.6} ${EYE.x - 3.4} ${EYE.y + 14.6}Z`} fill="#c9a24a" opacity=".85" />
      {/* glossy highlights */}
      <ellipse cx={EYE.x - 2.4} cy={EYE.y - 4.2} rx="2.1" ry="3.6" fill="#bfe8ff" opacity=".65" transform={`rotate(-14 ${EYE.x - 2.4} ${EYE.y - 4.2})`} />
      <ellipse cx={EYE.x + 2.2} cy={EYE.y + 4} rx=".9" ry="1.5" fill="#9ad4ff" opacity=".4" />
    </svg>
  )
}
