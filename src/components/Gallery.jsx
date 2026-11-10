import Reveal from './Reveal'
import Tilt from './Tilt'
import Ornament from './Ornament'
import Frame from './Frame'

// --r = resting tilt of each polaroid on the clothesline
const photos = [
  { src: '/photos/reading.jpg', alt: 'Pradeep and Pooja reading a sacred book together', caption: 'Together', r: '-4deg' },
  { src: '/photos/portrait.jpg', alt: 'Pooja in a crimson saree reading beside a lotus offering', caption: 'Blessed', r: '3deg' },
  { src: '/photos/boho.jpg', alt: 'Pradeep and Pooja in white beside a window, waiting for their baby', caption: 'Waiting with love', r: '-2deg' },
  { src: '/photos/booties.jpg', alt: 'Tiny baby booties resting on the baby bump', caption: 'Tiny steps soon', r: '4deg' },
]

export default function Gallery() {
  return (
    <section data-section className="snap-section bg-indigo-dark text-cream">
      <Frame className="flex flex-col items-center justify-center">
      <Reveal>
        <h2 className="gold-text text-center font-display text-[clamp(1.5rem,min(7vw,4.6svh),2.6rem)]">Our Waiting Moments</h2>
        <Ornament className="mt-[0.5svh] [@media(max-height:520px)]:hidden" />
      </Reveal>

      {/* Polaroids pegged to a clothesline; each has its own rope segment so rows join up.
          Width is capped by BOTH vw and svh so the whole grid always fits one screen. */}
      <div className="mt-[3svh] grid grid-cols-2 gap-x-3 gap-y-[3svh] md:grid-cols-4 landscape:grid-cols-4">
        {photos.map((p, i) => (
          <Reveal key={p.src} delay={i * 120}>
            <div className="relative mx-auto w-[min(38vw,16.5svh)] pt-[2.6svh] md:w-[min(19vw,30svh)] landscape:w-[min(19vw,30svh)]">
              {/* rope */}
              <span aria-hidden="true" className="absolute -left-2 -right-2 top-0 h-[3px] rounded-full bg-gradient-to-r from-gold/40 via-gold to-gold/40 shadow-[0_2px_4px_rgba(0,0,0,.5)]" />
              {/* peg */}
              <span aria-hidden="true" className="absolute left-1/2 top-[-6px] z-10 h-6 w-2.5 -translate-x-1/2 rounded-sm bg-gradient-to-b from-sandal to-gold shadow" />
              <div className="sway" style={{ '--r': p.r, animationDelay: `${i * 0.7}s` }}>
                <Tilt max={7} className="rounded-sm">
                  <figure className="bg-cream p-1.5 pb-2 shadow-[0_18px_30px_-10px_rgba(0,0,0,.8)]">
                    <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                    <figcaption className="mt-1 text-center font-serif text-[clamp(.85rem,2.2svh,1.1rem)] italic text-indigo">{p.caption}</figcaption>
                  </figure>
                </Tilt>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      </Frame>
    </section>
  )
}
