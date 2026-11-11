import { useState } from 'react'
import Reveal from './Reveal'
import Tilt from './Tilt'
import Ornament from './Ornament'
import Frame from './Frame'
import Lightbox from './Lightbox'

// --r = resting tilt of each polaroid on the clothesline
const photos = [
  { src: '/photos/reading.jpg', alt: 'Pradeep and Pooja reading a sacred book together', caption: 'Together', r: '-4deg' },
  { src: '/photos/portrait.jpg', alt: 'Pooja in a crimson saree reading beside a lotus offering', caption: 'Blessed', r: '3deg' },
  { src: '/photos/boho.jpg', alt: 'Pradeep and Pooja in white beside a window, waiting for their baby', caption: 'Waiting with love', r: '-2deg' },
  { src: '/photos/booties.jpg', alt: 'Tiny baby booties resting on the baby bump', caption: 'Tiny steps soon', r: '4deg' },
]

export default function Gallery() {
  const [open, setOpen] = useState(null) // index of the photo shown full screen, or null

  return (
    <section data-section className="snap-section bg-indigo-dark/72 text-cream">
      <Frame className="flex flex-col items-center justify-center">
        <Reveal>
          <h2 className="gold-text text-center font-display text-[clamp(1.5rem,min(7vw,4.6svh),2.6rem)]">Our Waiting Moments</h2>
          <Ornament className="mt-[0.5svh] [@media(max-height:520px)]:hidden" />
          {/* hint: say Tap on touch screens, Click where there is a mouse */}
          <p className="mt-[0.8svh] flex items-center justify-center gap-1.5 text-center text-[clamp(.68rem,1.9svh,.85rem)] tracking-wide text-gold-light">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[1.2em] w-[1.2em] animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4v8.5l-2.2-1.4a1.7 1.7 0 0 0-2.3.5 1.7 1.7 0 0 0 .3 2.2L13 19h6l1-5.5c.2-1.2-.6-2.3-1.8-2.5L16 10.6V8" />
              <path d="M14 4a1.7 1.7 0 0 1 3.4 0v4" />
            </svg>
            <span>
              <span className="[@media(hover:hover)]:hidden">Tap</span>
              <span className="hidden [@media(hover:hover)]:inline">Click</span> a photo to view it full screen
            </span>
          </p>
        </Reveal>

        {/* Polaroids pegged to a clothesline; each has its own rope segment so rows join up.
            Width is capped by BOTH vw and svh so the whole grid always fits one screen. Tap one to enlarge. */}
        <div className="mt-[2.4svh] grid grid-cols-2 gap-x-3 gap-y-[2.2svh] md:grid-cols-4 landscape:grid-cols-4">
          {photos.map((p, i) => (
            <Reveal key={p.src} delay={i * 120}>
              <div className="relative mx-auto w-[min(41vw,18.4svh)] pt-[2.4svh] md:w-[min(21vw,33svh)] landscape:w-[min(21vw,33svh)]">
                {/* rope */}
                <span aria-hidden="true" className="absolute -left-2 -right-2 top-0 h-[3px] rounded-full bg-gradient-to-r from-gold/40 via-gold to-gold/40 shadow-[0_2px_4px_rgba(0,0,0,.5)]" />
                {/* peg */}
                <span aria-hidden="true" className="absolute left-1/2 top-[-6px] z-10 h-6 w-2.5 -translate-x-1/2 rounded-sm bg-gradient-to-b from-sandal to-gold shadow" />
                <div className="sway" style={{ '--r': p.r, animationDelay: `${i * 0.7}s` }}>
                  <Tilt max={7} className="rounded-sm">
                    <button
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={`${p.caption}: view photo full screen`}
                      className="block w-full cursor-zoom-in bg-cream p-1.5 pb-2 text-center shadow-[0_18px_30px_-10px_rgba(0,0,0,.8)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
                    >
                      <span className="relative block">
                        <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                        {/* small "enlarge" badge so each photo looks tappable */}
                        <span aria-hidden="true" className="absolute right-1.5 top-1.5 flex h-[clamp(1.35rem,3.6svh,1.9rem)] w-[clamp(1.35rem,3.6svh,1.9rem)] items-center justify-center rounded-full bg-black/55 text-gold-light shadow ring-1 ring-gold/60">
                          <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
                          </svg>
                        </span>
                      </span>
                      <span className="mt-1 block font-serif text-[clamp(.85rem,2.2svh,1.1rem)] italic text-indigo">{p.caption}</span>
                    </button>
                  </Tilt>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Frame>

      {open !== null && <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </section>
  )
}
