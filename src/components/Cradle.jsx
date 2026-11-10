import Feather from './Feather'
import Reveal from './Reveal'

// A gently swinging wooden jhula (cradle), drawn with wood-grain, brass, rope-twist,
// soft fabric and lighting so it reads as a real object rather than flat clip-art.
function WoodenCradle() {
  return (
    <svg viewBox="0 0 260 280" className="h-full w-full drop-shadow-[0_26px_22px_rgba(10,18,53,.35)]">
      <defs>
        {/* wood */}
        <linearGradient id="cr-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c58a3d" />
          <stop offset=".45" stopColor="#9a5f25" />
          <stop offset="1" stopColor="#4e2a10" />
        </linearGradient>
        <linearGradient id="cr-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".25" stopColor="#000" stopOpacity="0" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
        <filter id="cr-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.45" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 .16  0 0 0 0 .08  0 0 0 0 .02  1.1 0 0 0 -.25" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id="cr-body">
          <path d="M18 126 C36 214 224 214 242 126 Z" />
        </clipPath>
        {/* brass */}
        <radialGradient id="cr-brass" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset=".45" stopColor="#d9a431" />
          <stop offset="1" stopColor="#6e4a0c" />
        </radialGradient>
        {/* fabric */}
        <radialGradient id="cr-fabric" cx=".5" cy=".4" r=".75">
          <stop offset="0" stopColor="#fffdf4" />
          <stop offset=".7" stopColor="#f3e6c4" />
          <stop offset="1" stopColor="#cdb88a" />
        </radialGradient>
        <linearGradient id="cr-pillow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2d2a8" />
        </linearGradient>
        <linearGradient id="cr-bamboo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c060" />
          <stop offset=".5" stopColor="#c98a1c" />
          <stop offset="1" stopColor="#7a4d0a" />
        </linearGradient>
        <filter id="cr-soft"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      {/* twisted ropes: dark base + light dashed strands for the twist */}
      {[[130, 14, 34, 128], [130, 14, 226, 128]].map(([x1, y1, x2, y2], i) => (
        <g key={i} strokeLinecap="round">
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b3411" strokeWidth="4.2" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a566" strokeWidth="3.2" strokeDasharray="1.6 2.6" />
        </g>
      ))}
      {/* brass hook ring */}
      <circle cx="130" cy="10" r="7.5" fill="none" stroke="url(#cr-brass)" strokeWidth="3.2" />
      <circle cx="130" cy="17" r="3.2" fill="url(#cr-brass)" />

      {/* cradle body: carved wood with grain, side shading and gloss */}
      <g>
        <path d="M18 126 C36 214 224 214 242 126 Z" fill="url(#cr-wood)" />
        <g clipPath="url(#cr-body)">
          <rect x="0" y="100" width="260" height="130" filter="url(#cr-grain)" opacity=".55" />
          <rect x="0" y="100" width="260" height="130" fill="url(#cr-side)" />
          {/* carved band */}
          <path d="M26 152 C60 190 200 190 234 152" fill="none" stroke="#3a1f0a" strokeWidth="5" opacity=".55" />
          <path d="M26 150 C60 187 200 187 234 150" fill="none" stroke="#e0a94f" strokeWidth="1.6" opacity=".9" />
          {Array.from({ length: 15 }, (_, i) => {
            const t = (i + 1) / 16
            const x = 30 + t * 200
            const y = 163 + Math.sin(t * Math.PI) * 17
            return <circle key={i} cx={x} cy={y} r="2.1" fill="url(#cr-brass)" />
          })}
          {/* specular highlight along the left belly */}
          <path d="M40 150 C58 184 96 196 130 197" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="5" strokeLinecap="round" filter="url(#cr-soft)" />
        </g>
        <path d="M18 126 C36 214 224 214 242 126" fill="none" stroke="#2f1707" strokeOpacity=".6" strokeWidth="1.4" />
      </g>

      {/* rim */}
      <ellipse cx="130" cy="126" rx="112" ry="19" fill="#5b3213" />
      <ellipse cx="130" cy="125" rx="112" ry="19" fill="none" stroke="url(#cr-brass)" strokeWidth="3.4" />
      <ellipse cx="130" cy="127" rx="104" ry="14.5" fill="#2a1507" />

      {/* soft mattress + blanket inside */}
      <ellipse cx="130" cy="127" rx="101" ry="13" fill="url(#cr-fabric)" />
      <path d="M44 131 C80 144 180 144 216 131" fill="none" stroke="#0e8a8f" strokeWidth="4" opacity=".75" strokeLinecap="round" />
      <path d="M62 128 C96 138 168 138 200 128" fill="none" stroke="#a88f5a" strokeOpacity=".35" strokeWidth="1.2" />
      <path d="M82 124 C110 132 150 132 178 124" fill="none" stroke="#a88f5a" strokeOpacity=".3" strokeWidth="1.2" />
      {/* inner shadow under the back rim */}
      <path d="M30 123 C70 108 190 108 230 123" fill="none" stroke="#000" strokeOpacity=".28" strokeWidth="5" filter="url(#cr-soft)" />
      {/* pillow */}
      <ellipse cx="66" cy="123" rx="24" ry="6.5" fill="#000" opacity=".18" filter="url(#cr-soft)" transform="translate(1 3)" />
      <ellipse cx="66" cy="121" rx="24" ry="6.5" fill="url(#cr-pillow)" />

      {/* bamboo flute with nodes, holes and tassel */}
      <g transform="rotate(-6 130 120)">
        <ellipse cx="132" cy="127" rx="50" ry="3" fill="#000" opacity=".22" filter="url(#cr-soft)" />
        <rect x="84" y="114" width="96" height="8.5" rx="4.2" fill="url(#cr-bamboo)" />
        <rect x="84" y="115" width="96" height="2" rx="1" fill="#fff" opacity=".3" />
        <g fill="#2a1503">
          {[112, 124, 136, 148].map((x) => <ellipse key={x} cx={x} cy="118.4" rx="1.7" ry="1.4" />)}
        </g>
        {[96, 160].map((x) => <rect key={x} x={x} y="113.6" width="2.4" height="9.4" rx="1" fill="#6b430a" opacity=".8" />)}
        <path d="M84 118 C76 118 72 124 70 132" fill="none" stroke="#d4a02a" strokeWidth="1.4" />
        <circle cx="70" cy="133" r="2.4" fill="url(#cr-brass)" />
      </g>

      {/* carved end posts */}
      {[18, 242].map((x) => (
        <g key={x}>
          <circle cx={x} cy="124" r="8.2" fill="#3a1f0a" opacity=".5" transform="translate(0 1.5)" />
          <circle cx={x} cy="122" r="7.6" fill="url(#cr-brass)" />
        </g>
      ))}
    </svg>
  )
}

export default function Cradle() {
  return (
    <section data-section className="snap-section bg-gradient-to-b from-cream to-sandal">
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-[3svh] px-6 text-center landscape:flex-row landscape:gap-10 landscape:text-left md:flex-row md:gap-10 md:text-left">
        <Reveal className="shrink-0">
          <div className="swing relative aspect-[13/14] h-[32svh] landscape:h-[58svh] md:h-[44svh]" aria-hidden="true">
            <WoodenCradle />
            <Feather className="absolute left-[33%] top-[13%] h-[42%] w-auto -rotate-6 drop-shadow-[2px_4px_3px_rgba(10,18,53,.35)]" />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <p className="text-[clamp(.65rem,1.9svh,.8rem)] uppercase tracking-[0.3em] text-peacock">A little one is on the way</p>
          <h2 className="mt-[1svh] font-display text-[clamp(1.5rem,min(7vw,4.6svh),2.6rem)] leading-tight text-indigo">Little Kanha or little Radha?</h2>
          <p className="mt-[1.6svh] font-serif text-[clamp(1rem,min(4.4vw,2.8svh),1.3rem)] leading-snug text-indigo-dark/80">
            Like Gokul rejoicing over the arrival of Kanha, our home is filling with butter-soft laughter,
            lullabies and the sound of a flute. Boy or girl, it's a surprise — come bless the mother-to-be
            and the little one.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
