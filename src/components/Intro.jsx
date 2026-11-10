import { useEffect, useRef, useState } from 'react'
import { event } from '../config'
import Feather from './Feather'

// Opening screen: a pair of ornate temple doors. Tap the medallion and the doors swing
// open in 3D to reveal the invitation website.
const OPEN_MS = 3000

function Door({ side, open }) {
  const left = side === 'left'
  return (
    <div
      className={`absolute top-0 h-full w-1/2 transition-transform ease-[cubic-bezier(.6,.05,.2,1)] motion-reduce:transition-none ${left ? 'left-0' : 'right-0'}`}
      style={{
        transformOrigin: left ? 'left center' : 'right center',
        transitionDuration: `${OPEN_MS}ms`,
        transform: open ? `rotateY(${left ? -105 : 105}deg)` : 'rotateY(0)',
        background: 'linear-gradient(90deg,#0a1235,#16276a 55%,#0a1235)',
        backfaceVisibility: 'hidden',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,.6)',
      }}
    >
      {/* arched gold panels */}
      <div className={`absolute inset-4 border-2 border-gold/80 sm:inset-8 ${left ? '[border-radius:999px_0_0_0]' : '[border-radius:0_999px_0_0]'}`} />
      <div className={`absolute inset-7 border border-gold/40 sm:inset-12 ${left ? '[border-radius:999px_0_0_0]' : '[border-radius:0_999px_0_0]'}`} />
      <div
        className="absolute inset-10 opacity-40 sm:inset-16"
        style={{ backgroundImage: 'radial-gradient(circle,#f2d27a 1.2px,transparent 1.6px)', backgroundSize: '22px 22px' }}
      />
      {/* door ring */}
      <span
        className={`absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-4 border-gold shadow ${left ? 'right-3' : 'left-3'}`}
        style={{ background: 'radial-gradient(circle at 35% 30%,#fff1b8,#b9831c)' }}
      />
    </div>
  )
}

export default function Intro({ onOpen, onDone }) {
  const [open, setOpen] = useState(false)
  const btn = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    btn.current?.focus()
    return () => { document.body.style.overflow = prev }
  }, [])

  const start = () => {
    if (open) return
    setOpen(true)
    onOpen()
    // Tapping is a user gesture, so the music is allowed to start now.
    window.dispatchEvent(new Event('invitation-open'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(onDone, reduce ? 0 : OPEN_MS + 100)
  }

  return (
    // Tapping anywhere on the screen opens the doors and starts the music.
    // (The medallion is still a real button so keyboard users can open it too.)
    <div
      onClick={start}
      className={`fixed inset-0 z-[70] overflow-hidden ${open ? '' : 'cursor-pointer'}`}
      style={{ perspective: '1800px' }}
    >
      <Door side="left" open={open} />
      <Door side="right" open={open} />

      {/* centre medallion */}
      <div className={`absolute inset-0 flex items-center justify-center px-6 transition-opacity duration-500 ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <button
          ref={btn}
          type="button"
          onClick={start}
          aria-label="Open the invitation"
          className="group flex w-full max-w-xs flex-col items-center rounded-full border-2 border-gold bg-indigo-dark/90 px-6 py-[4svh] text-center shadow-[0_0_60px_rgba(212,160,42,.45)] backdrop-blur transition hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
        >
          <span className="text-[0.7rem] uppercase tracking-[0.3em] text-gold-light">|| Jai Shri Krishna ||</span>
          <Feather className="floaty my-[1.5svh] h-[12svh] max-h-24 w-auto" />
          <span className="gold-text font-display text-3xl leading-tight">{event.parents}</span>
          <span className="mt-1 font-serif text-lg italic text-sandal">invite you to the {event.title}</span>
          <span className="mt-5 animate-pulse rounded-full border border-gold px-5 py-2 text-xs uppercase tracking-[0.3em] text-gold-light group-hover:bg-gold group-hover:text-indigo-dark">
            Tap anywhere to open
          </span>
        </button>
      </div>
    </div>
  )
}
