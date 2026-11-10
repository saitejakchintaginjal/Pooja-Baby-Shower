import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import Tilt from './Tilt'
import Frame from './Frame'

const KEY = 'baby-guess'

// Listed top-to-bottom in the same order as the hammocks (girl on top, boy below).
const options = [
  {
    id: 'girl',
    img: '/photos/girl.jpg',
    alt: 'Pink baby outfit with tiny shoes in open hands — Girl',
    sub: 'Little Radha',
    ring: 'ring-pink-400',
    glow: 'shadow-[0_0_40px_rgba(244,114,182,.75)]',
    text: 'text-pink-600',
    msg: 'You guessed a little Radha! 💗',
  },
  {
    id: 'boy',
    img: '/photos/boy.jpg',
    alt: 'Blue baby outfit with tiny shoes in open hands — Boy',
    sub: 'Little Kanha',
    ring: 'ring-sky-500',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,.75)]',
    text: 'text-sky-700',
    msg: 'You guessed a little Kanha! 💙',
  },
]

// Reading/writing localStorage can throw (private mode etc.), so always guard it.
const load = () => {
  try { return localStorage.getItem(KEY) } catch { return null }
}
const save = (v) => {
  try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY) } catch { /* ignore */ }
}

export default function Vote() {
  const [pick, setPick] = useState(null)
  useEffect(() => { setPick(load()) }, [])

  const choose = (id) => {
    const next = pick === id ? null : id
    setPick(next)
    save(next)
  }
  const chosen = options.find((o) => o.id === pick)

  return (
    <section data-section className="snap-section">
      <Frame className="flex flex-col items-center justify-center text-center">
      <Reveal>
        <p className="text-[clamp(.65rem,1.9svh,.8rem)] uppercase tracking-[0.3em] text-peacock">Place your guess</p>
        <h2 className="mt-[1svh] font-display text-[clamp(1.6rem,min(8vw,5.2svh),2.8rem)] text-indigo">Boy or Girl?</h2>
        <p className="mx-auto mt-[1.2svh] max-w-md font-serif text-[clamp(1rem,min(4.4vw,2.8svh),1.3rem)] leading-snug text-indigo-dark/80">
          Nobody knows yet! Tap to cast your vote — we'll reveal the answer on the day.
        </p>
      </Reveal>

      <div className="mt-[2.5svh] flex items-center justify-center gap-4 sm:gap-10">
        {/* the two babies in their hammocks: pink on top, blue below */}
        <Reveal>
          <img
            src="/photos/hammocks.png"
            alt="A baby girl in a pink hammock above a baby boy in a blue hammock"
            width="252"
            height="562"
            className="floaty h-[36svh] w-auto drop-shadow-[0_12px_14px_rgba(20,36,92,.25)]"
          />
        </Reveal>

        <div role="radiogroup" aria-label="Your guess: boy or girl" className="flex flex-col gap-[2svh]">
          {options.map((o, i) => {
            const on = pick === o.id
            return (
              <Reveal key={o.id} delay={i * 120}>
                <Tilt max={10} className="rounded-2xl">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose(o.id)}
                    className={`block w-[min(44vw,19svh)] overflow-hidden rounded-2xl bg-cream text-center transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo ${
                      on ? `${o.glow} ring-4 ${o.ring} scale-105` : pick ? 'opacity-55 saturate-50' : 'shadow-lg'
                    }`}
                  >
                    <img src={o.img} alt={o.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <span className={`block py-[0.6svh] font-serif text-[clamp(.85rem,2.3svh,1.1rem)] italic ${o.text}`}>
                      {on ? '✓ ' : ''}{o.sub}
                    </span>
                  </button>
                </Tilt>
              </Reveal>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-[2.5svh] min-h-[3svh] font-serif text-[clamp(1rem,2.8svh,1.3rem)] italic text-indigo">
        {chosen ? chosen.msg : ''}
      </p>
      <p className="h-4 text-xs text-indigo-dark/60">{chosen ? 'Tap your choice again to undo. Saved on this device only.' : ''}</p>
      </Frame>
    </section>
  )
}
