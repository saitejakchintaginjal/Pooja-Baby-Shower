import Reveal from './Reveal'
import Tilt from './Tilt'
import Frame from './Frame'

export default function Ceremony() {
  return (
    <section data-section className="snap-section">
      <Frame>
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-[3svh] text-center landscape:flex-row landscape:gap-10 landscape:text-left md:flex-row md:gap-12 md:text-left">
        <Reveal className="shrink-0">
          <Tilt max={8} className="rounded-3xl">
            <img
              src="/photos/ceremony.jpg"
              alt="Illustration of Pooja seated on a decorated throne, surrounded by women in sarees with garlands, lamps and gifts"
              loading="lazy"
              width="956"
              height="1280"
              className="aspect-[956/1280] h-[37svh] w-auto max-w-none rounded-3xl border-2 border-gold object-cover shadow-[0_24px_50px_-14px_rgba(20,36,92,.6)] landscape:h-[60svh] md:h-[54svh]"
            />
          </Tilt>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-[clamp(.65rem,1.9svh,.8rem)] uppercase tracking-[0.3em] text-peacock">The Ceremony</p>
          <h2 className="mt-[1svh] font-display text-[clamp(1.5rem,min(7vw,4.6svh),2.6rem)] leading-tight text-indigo">Blessings, songs and sweets</h2>
          <p className="mt-[1.6svh] font-serif text-[clamp(1rem,min(4.4vw,2.8svh),1.3rem)] leading-snug text-indigo-dark/80">
            Seemantham is a day to shower the mother-to-be with blessings, flowers, bangles and love from
            family and friends — and to welcome the little one in the most auspicious way.
          </p>
        </Reveal>
      </div>
      </Frame>
    </section>
  )
}
