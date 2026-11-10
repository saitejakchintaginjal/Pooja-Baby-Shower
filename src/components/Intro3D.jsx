import { useEffect, useRef, useState } from 'react'
import { event } from '../config'
import Intro from './Intro'

// 3D entrance: carved temple doors lit by diyas. Tap anywhere -> doors swing open, the camera
// glides through into golden light, and the invitation site appears.
// Falls back to the lighter CSS doors (Intro.jsx) if WebGL is missing, the 3D code fails to
// load, or the visitor prefers reduced motion.
const OPEN_MS = 4200

function webglOK() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

export default function Intro3D({ onOpen, onDone }) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [fallback, setFallback] = useState(() => reduce || !webglOK())
  const [tapped, setTapped] = useState(false)
  const [fade, setFade] = useState(false)
  const wrap = useRef(null)
  const mount = useRef(null)
  const scene = useRef(null)
  const wanted = useRef(false)
  const siteShown = useRef(false)

  const runOpen = () => {
    scene.current?.open({
      duration: OPEN_MS,
      onProgress: (p) => {
        // mount the site while the doors are still opening so its entrance animation plays
        if (p > 0.55 && !siteShown.current) {
          siteShown.current = true
          onOpen()
        }
        if (p > 0.86) setFade(true)
      },
      onDone: () => setTimeout(onDone, 950),
    })
  }

  useEffect(() => {
    if (fallback) return
    let dead = false
    let dispose = () => {}
    import('../intro3d/scene')
      .then(({ createDoorScene }) => {
        if (dead) return
        try {
          scene.current = createDoorScene(mount.current)
          dispose = scene.current.dispose
          if (wanted.current) runOpen()
        } catch {
          setFallback(true)
        }
      })
      .catch(() => setFallback(true))
    return () => {
      dead = true
      dispose()
      scene.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback])

  useEffect(() => {
    if (fallback) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    wrap.current?.focus()
    return () => { document.body.style.overflow = prev }
  }, [fallback])

  if (fallback) return <Intro onOpen={onOpen} onDone={onDone} />

  const start = () => {
    if (tapped) return
    setTapped(true)
    wanted.current = true
    // tapping is a user gesture, so the music is allowed to start now
    window.dispatchEvent(new Event('invitation-open'))
    runOpen()
  }

  return (
    <div
      ref={wrap}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onClick={start}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() } }}
      className={`fixed inset-0 z-[70] overflow-hidden bg-[#f7e6f3] outline-none transition-opacity duration-[900ms] ${fade ? 'pointer-events-none opacity-0' : 'opacity-100'} ${tapped ? '' : 'cursor-pointer'}`}
    >
      <div ref={mount} className="absolute inset-0" />
      {/* soft cream fades behind the text so it stays readable over the bright wall and floor */}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,246,236,.6),transparent_10%,transparent_66%,rgba(255,244,234,.82))] transition-opacity duration-700 ${tapped ? 'opacity-0' : 'opacity-100'}`} />

      <div className={`pointer-events-none absolute inset-x-0 top-[4.5svh] px-6 text-center transition-opacity duration-700 ${tapped ? 'opacity-0' : 'opacity-100'}`}>
        <p className="font-serif text-[clamp(.75rem,2.4svh,1.1rem)] font-semibold uppercase tracking-[0.3em] text-indigo [text-shadow:0_1px_8px_rgba(255,255,255,.95)]">|| Jai Shri Krishna ||</p>
      </div>

      <div className={`pointer-events-none absolute inset-x-0 bottom-[4svh] px-6 text-center transition-opacity duration-700 ${tapped ? 'opacity-0' : 'opacity-100'}`}>
        <p className="font-display text-[clamp(1.6rem,min(8vw,5svh),2.8rem)] font-bold leading-tight text-[#c2185b] [text-shadow:0_1px_10px_rgba(255,255,255,.95)]">{event.parents}</p>
        <p className="font-serif text-[clamp(.95rem,min(4.4vw,2.8svh),1.35rem)] italic text-indigo [text-shadow:0_1px_8px_rgba(255,255,255,.95)]">invite you to the {event.title}</p>
        <p className="mt-[1.4svh] inline-block animate-pulse rounded-full border border-gold bg-white/75 px-5 py-[1svh] text-[clamp(.6rem,1.8svh,.8rem)] font-semibold uppercase tracking-[0.3em] text-indigo shadow backdrop-blur">
          Tap anywhere to open
        </p>
      </div>
    </div>
  )
}
