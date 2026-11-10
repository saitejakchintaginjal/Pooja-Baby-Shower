import { useEffect, useState } from 'react'
import { event } from '../config'
import Reveal from './Reveal'
import Tilt from './Tilt'
import Frame from './Frame'
import Confetti from './Confetti'

const calc = () => {
  const diff = Math.max(0, new Date(event.date) - new Date())
  return {
    Days: Math.floor(diff / 864e5),
    Hours: Math.floor(diff / 36e5) % 24,
    Minutes: Math.floor(diff / 6e4) % 60,
    Seconds: Math.floor(diff / 1e3) % 60,
    done: diff === 0,
  }
}

// Phone: compact icon + text rows. sm and up: three columns.
function Info({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gold/60 bg-cream/90 p-[min(2.6vw,.7rem)] text-left shadow-[0_12px_28px_-14px_rgba(20,36,92,.55)] sm:flex-col sm:justify-center sm:gap-1 sm:p-3 sm:text-center">
      <div className="text-[clamp(1.3rem,3.6svh,2rem)] leading-none" aria-hidden="true">{icon}</div>
      <div>
        <h3 className="text-[clamp(.55rem,1.5svh,.7rem)] uppercase tracking-[0.3em] text-gold">{label}</h3>
        <div className="font-serif text-[clamp(.95rem,min(4.2vw,2.6svh),1.35rem)] leading-tight text-indigo">{children}</div>
      </div>
    </div>
  )
}

export default function CountdownDetails() {
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const d = new Date(event.date)
  const date = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <section id="details" data-section className="snap-section bg-sandal">
      {/* celebration: confetti keeps falling (and doubles up once the big day arrives) */}
      <Confetti count={t.done ? 60 : 28} />
      <Frame className="flex flex-col items-center justify-center text-center">
        <Reveal className="w-full max-w-3xl">
          <h2 className="font-display text-[clamp(1.35rem,min(6.4vw,4.2svh),2.4rem)] leading-tight text-indigo">
            {t.done ? 'The celebration is here!' : 'Counting down to the celebration'}{' '}
            <span className="inline-block animate-bounce" aria-hidden="true">🎉</span>
          </h2>

          {!t.done && (
            <div role="timer" aria-label="Time remaining until the event" className="mx-auto mt-[2.4svh] grid max-w-xl grid-cols-4 gap-2 sm:gap-5">
              {['Days', 'Hours', 'Minutes', 'Seconds'].map((k, i) => (
                <Tilt key={k} max={14} className="rounded-2xl">
                  <div
                    className="tile-glow rounded-2xl border border-gold bg-gradient-to-b from-cream to-sandal px-1 py-[1.6svh] shadow-[0_10px_25px_-8px_rgba(20,36,92,.45),inset_0_-4px_0_rgba(201,150,43,.35)]"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {/* key re-mounts on change so the number flips in */}
                    <div key={t[k]} className="flip-num font-display text-[clamp(1.4rem,min(8vw,5.4svh),2.8rem)] font-bold tabular-nums text-indigo">
                      {String(t[k]).padStart(2, '0')}
                    </div>
                    <div className="mt-0.5 text-[clamp(.5rem,1.5svh,.72rem)] uppercase tracking-widest text-gold">{k}</div>
                  </div>
                </Tilt>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={200} className="mt-[2.6svh] w-full max-w-3xl">
          <div className="grid gap-[1.1svh] sm:grid-cols-3 sm:gap-4">
            <Info icon="📅" label="Date">{date}</Info>
            <Info icon="🕚" label="Time">{time} onwards</Info>
            <Info icon="📍" label="Venue">
              <strong className="font-semibold">{event.venueName}</strong>
              <div className="text-[0.85em] text-indigo-dark/80">{event.address}</div>
            </Info>
          </div>
          <a
            href={event.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[2.2svh] inline-block rounded-full bg-indigo px-7 py-[1.2svh] text-xs uppercase tracking-widest text-cream shadow transition hover:bg-indigo-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo"
          >
            Open in Google Maps
          </a>
        </Reveal>
      </Frame>
    </section>
  )
}
