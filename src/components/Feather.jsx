// Peacock feather: teal/green barbs around a gold-ringed blue "eye".
export default function Feather({ className = '', style }) {
  const barbs = Array.from({ length: 44 }, (_, i) => {
    const a = (i / 44) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    return { x1: 30 + 11 * c, y1: 58 + 16 * s, x2: 30 + (24 + (i % 3) * 3) * c, y2: 58 + (33 + (i % 3) * 4) * s, k: i }
  })
  const stemBarbs = Array.from({ length: 14 }, (_, i) => {
    const y = 96 + i * 4.4
    const len = 11 - i * 0.6
    return { y, len, k: i }
  })
  return (
    <svg viewBox="0 0 60 170" className={className} style={style} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1fa37a" />
          <stop offset="1" stopColor="#0e6f86" />
        </linearGradient>
      </defs>
      <path d="M30 88 C26 120 34 145 30 168" stroke="#8a6a1f" strokeWidth="1.6" strokeLinecap="round" />
      {stemBarbs.map((b) => (
        <g key={b.k} stroke="#1a9a80" strokeWidth=".8" strokeLinecap="round" opacity=".85">
          <line x1="30" y1={b.y} x2={30 - b.len} y2={b.y - 5} />
          <line x1="30" y1={b.y} x2={30 + b.len} y2={b.y - 5} />
        </g>
      ))}
      {barbs.map((b) => (
        <line key={b.k} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke="url(#fb)" strokeWidth="1.1" strokeLinecap="round" opacity=".9" />
      ))}
      <ellipse cx="30" cy="58" rx="15" ry="21" fill="#0e8a8f" />
      <ellipse cx="30" cy="58" rx="11.5" ry="17" fill="#d4a02a" />
      <ellipse cx="30" cy="58" rx="8.5" ry="13" fill="#1a2c70" />
      <ellipse cx="30" cy="58" rx="4.5" ry="7" fill="#0a1235" />
      <ellipse cx="28.5" cy="54" rx="1.4" ry="2.4" fill="#7fd3d6" opacity=".7" />
    </svg>
  )
}
