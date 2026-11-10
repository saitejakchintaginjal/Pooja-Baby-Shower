import { event } from '../config'
import Ornament from './Ornament'
import Tilt from './Tilt'
import Feather from './Feather'

// Fixed star positions (no randomness, so server/client render identically)
const stars = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 11) % 97}%`,
  top: `${(i * 53 + 7) % 92}%`,
  delay: `${(i % 7) * 0.45}s`,
}))

// Everything is sized with svh/vw clamps so the whole first page fits any screen:
// small phones, tall phones, tablets, short landscape phones and desktops.
export default function Hero() {
  return (
    <header data-section className="snap-section bg-indigo-dark text-cream">
      {/* looping background video (skipped for reduced-motion users) */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden md:object-[50%_90%]"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      {/* Overlay: deep Krishna-blue behind the photo + text at the top, fading away toward the bottom
          so the video's flowers and characters play clearly there */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,18,53,.9)_0%,rgba(10,18,53,.8)_48%,rgba(10,18,53,.3)_72%,rgba(10,18,53,.04)_100%)]"
        aria-hidden="true"
      />

      {/* night-sky glow + twinkling stars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(14,138,143,.4),transparent_60%),radial-gradient(ellipse_at_50%_90%,rgba(212,160,42,.25),transparent_55%)]" aria-hidden="true" />
      {stars.map((s, i) => (
        <span key={i} className="star" style={{ left: s.left, top: s.top, animationDelay: s.delay }} aria-hidden="true" />
      ))}
      <div className="pointer-events-none absolute inset-2 rounded-[1.5rem] border border-gold/50 sm:inset-5 sm:rounded-[2rem]" aria-hidden="true" />

      {/* corner peacock feathers (only where there is room) */}
      <Feather className="floaty pointer-events-none absolute -left-4 top-10 hidden h-[34svh] w-auto rotate-[25deg] opacity-80 md:block" />
      <Feather className="floaty pointer-events-none absolute -right-4 bottom-10 hidden h-[34svh] w-auto -rotate-[155deg] opacity-80 md:block" style={{ animationDelay: '1.5s' }} />

      <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-start gap-[2.2svh] px-5 pb-[3svh] pt-[5svh] text-center landscape:flex-row landscape:justify-center landscape:gap-[5vw] landscape:pb-[22svh] landscape:pt-[3svh] landscape:text-left lg:flex-row lg:justify-center lg:gap-16 lg:pb-[26svh] lg:text-left">
        {/* Smaller arch-shaped (temple-niche) frame, faded at the bottom into the background */}
        <Tilt
          max={8}
          glare={false}
          className="hero-enter aspect-[2/3] h-[26svh] shrink-0 [border-radius:999px_999px_1rem_1rem] landscape:h-[52svh] lg:h-[48svh]"
        >
          <img
            src="/photos/hero.jpg"
            alt="Pradeep and Pooja embracing, Pooja's crimson saree flowing in the air"
            width="1066"
            height="1599"
            className="h-full w-full object-cover opacity-70 outline outline-1 outline-offset-4 outline-gold/50 [border-radius:999px_999px_1rem_1rem] [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]"
            style={{ transform: 'translateZ(20px)' }}
          />
        </Tilt>

        <div className="hero-enter flex min-w-0 flex-col items-center landscape:items-start lg:items-start" style={{ animationDelay: '.25s' }}>
          <p className="font-serif text-[clamp(.72rem,min(3.4vw,2.2svh),1.1rem)] uppercase tracking-[0.25em] text-gold-light">|| Jai Shri Krishna ||</p>
          <p className="mt-[1.6svh] font-serif text-[clamp(1rem,min(5vw,3svh),1.6rem)] italic text-sandal">{event.parents} cordially invite you to the</p>
          <h1 className="gold-text font-display text-[clamp(2.3rem,min(13vw,9svh),4.75rem)] font-bold leading-tight">{event.title}</h1>
          <p className="font-serif text-[clamp(.8rem,min(3.8vw,2.5svh),1.3rem)] uppercase tracking-widest text-sandal">{event.tagline}</p>

          <Ornament className="my-[1.2svh] landscape:justify-start lg:justify-start [@media(max-height:480px)]:hidden" />

          <a
            href="#details"
            className="mt-[2.2svh] inline-block rounded-full border border-gold px-7 py-[1.1svh] text-xs uppercase tracking-widest text-gold-light transition hover:bg-gold hover:text-indigo-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
          >
            View Details
          </a>
        </div>
      </div>
    </header>
  )
}
