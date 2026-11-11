import { event } from '../config'
import Feather from './Feather'
import Ornament from './Ornament'
import Confetti from './Confetti'
import Reveal from './Reveal'
import { Corner } from './Frame'

// Big slowly-spinning rangoli mandala that sits behind the thank-you message
function Mandala({ className = '' }) {
  const rings = [
    { n: 24, r: 78, rx: 15, ry: 5, fill: '#f4b315' },
    { n: 18, r: 56, rx: 13, ry: 5.5, fill: '#ee5d9a' },
    { n: 12, r: 36, rx: 11, ry: 5.5, fill: '#33a9dd' },
    { n: 8, r: 18, rx: 8, ry: 4.5, fill: '#fff4d0' },
  ]
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true">
      <circle r="97" fill="none" stroke="#d4a02a" strokeWidth="1.2" />
      <circle r="92" fill="none" stroke="#f2d27a" strokeWidth=".6" strokeDasharray="1.5 3" />
      {rings.map((ring) =>
        Array.from({ length: ring.n }, (_, i) => (
          <ellipse
            key={`${ring.r}-${i}`}
            rx={ring.rx}
            ry={ring.ry}
            transform={`rotate(${(i / ring.n) * 360}) translate(${ring.r} 0)`}
            fill={ring.fill}
            fillOpacity=".75"
            stroke="#fff4d0"
            strokeWidth=".5"
          />
        )),
      )}
      <circle r="7" fill="#f4b315" stroke="#fff4d0" strokeWidth="1" />
    </svg>
  )
}

// A firework: rays shoot out from a point, then fade, over and over
function Burst({ x, y, color, delay, rays = 16, r = 70, len = 26 }) {
  return (
    <div className="burst" style={{ '--x': x, '--y': y, '--c': color, '--r': `${r}px`, '--len': `${len}px`, '--delay': delay }} aria-hidden="true">
      {Array.from({ length: rays }, (_, i) => (
        <i key={i} style={{ '--a': `${(i / rays) * 360}deg` }} />
      ))}
    </div>
  )
}

const BALLOONS = [
  { x: '6%', s: '46px', c: '#ff7eb0', dx: '24px', dur: '13s', delay: '-2s' },
  { x: '18%', s: '38px', c: '#5bb8f2', dx: '-20px', dur: '16s', delay: '-9s' },
  { x: '30%', s: '50px', c: '#ffd84d', dx: '26px', dur: '14s', delay: '-5s' },
  { x: '48%', s: '36px', c: '#7de3bd', dx: '-22px', dur: '17s', delay: '-12s' },
  { x: '64%', s: '48px', c: '#c39bff', dx: '22px', dur: '15s', delay: '-7s' },
  { x: '78%', s: '40px', c: '#ff7eb0', dx: '-26px', dur: '12s', delay: '-1s' },
  { x: '90%', s: '52px', c: '#5bb8f2', dx: '18px', dur: '18s', delay: '-14s' },
]

export default function Footer() {
  return (
    <footer
      data-section
      className="snap-section bg-[radial-gradient(ellipse_at_50%_42%,rgba(34,56,143,.82)_0%,rgba(16,28,85,.88)_48%,rgba(7,13,46,.92)_100%)] text-cream"
    >
      {/* spinning mandala behind everything */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(112vw,112svh)] -translate-x-1/2 -translate-y-1/2 opacity-30" aria-hidden="true">
        <Mandala className="spin-slow w-full" />
      </div>

      {/* fireworks */}
      <Burst x="16%" y="20%" color="#ffd84d" delay="0s" />
      <Burst x="84%" y="16%" color="#ff7eb0" delay="1.1s" r={62} />
      <Burst x="72%" y="62%" color="#5bb8f2" delay="2.1s" r={54} len={22} />
      <Burst x="24%" y="66%" color="#7de3bd" delay="1.6s" r={58} len={24} />

      {/* confetti + balloons floating up */}
      <Confetti count={36} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {BALLOONS.map((b, i) => (
          <span key={i} className="balloon" style={{ '--x': b.x, '--s': b.s, '--c': b.c, '--dx': b.dx, '--dur': b.dur, '--delay': b.delay }} />
        ))}
      </div>

      {/* kolam-style corner ornaments */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Corner className="left-[4px] top-[4px]" />
        <Corner className="right-[4px] top-[4px] -scale-x-100" />
        <Corner className="bottom-[4px] left-[4px] -scale-y-100" />
        <Corner className="bottom-[4px] right-[4px] -scale-100" />
      </div>

      {/* message */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_48%,rgba(7,13,46,.8)_0%,rgba(7,13,46,.5)_36%,transparent_68%)] px-8 pb-[8svh] text-center">
        <Reveal>
          <Feather className="floaty mx-auto mb-[1.5svh] h-[15svh] w-auto drop-shadow-[0_0_18px_rgba(242,210,122,.6)]" />
          <p className="font-serif text-[clamp(.75rem,2.2svh,1.05rem)] uppercase tracking-[0.35em] text-gold-light">|| Jai Shri Krishna ||</p>
          <h2 className="shimmer mt-[1.5svh] font-display text-[clamp(2.4rem,min(13vw,9svh),4.6rem)] font-bold leading-none">Thank you</h2>
          <Ornament className="my-[2svh]" />
          <p className="mx-auto max-w-md font-serif text-[clamp(1.1rem,min(4.8vw,3.1svh),1.6rem)] italic leading-snug text-sandal">
            Your presence and blessings will make our day complete.
          </p>
          <p className="mt-[2.5svh] text-[clamp(.65rem,1.9svh,.8rem)] uppercase tracking-[0.3em] text-gold-light">With love, {event.parents}</p>
        </Reveal>
      </div>

      {/* row of flickering diyas along the bottom */}
      <div className="diya-row pointer-events-none absolute inset-x-0 bottom-[1.2svh] z-10 h-[var(--diya)]" aria-hidden="true" />
    </footer>
  )
}
