// Contained confetti shower (CSS only). Pieces are generated deterministically,
// so the pattern is stable between renders. Hidden for reduced-motion users via CSS.
const COLORS = ['#f4b315', '#d4a02a', '#0e8a8f', '#e0457b', '#4aa3df', '#ff8a3d', '#7fd3d6', '#f2d27a']

export default function Confetti({ count = 28 }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const round = i % 3 === 0
    return {
      key: i,
      style: {
        '--x': `${(i * 37 + 5) % 100}%`,
        '--dx': `${((i * 53) % 90) - 45}px`,
        '--rot': `${360 + ((i * 97) % 540)}deg`,
        '--c': COLORS[i % COLORS.length],
        '--w': round ? '7px' : '6px',
        '--h': round ? '7px' : `${10 + (i % 4) * 2}px`,
        '--r': round ? '9999px' : '1px',
        '--dur': `${6 + ((i * 7) % 6)}s`,
        '--delay': `-${(i * 0.83) % 9}s`,
      },
    }
  })
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span key={p.key} className="confetti" style={p.style} />
      ))}
    </div>
  )
}
