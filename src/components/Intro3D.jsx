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
    // the South Indian temple entrance is the default; add ?doors to the address to see the earlier pastel doors
    ;(new URLSearchParams(window.location.search).has('doors') ? import('../intro3d/scene-doors') : import('../intro3d/scene'))
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
      {/* dark fades behind the text (top for the names, bottom for the tap prompt) so it reads over the bright wall and floor */}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(22,7,12,.82)_0%,rgba(22,7,12,.55)_14%,transparent_27%,transparent_80%,rgba(22,7,12,.8)_100%)] transition-opacity duration-700 ${tapped ? 'opacity-0' : 'opacity-100'}`} />

      {/* top: blessing, then the names and the invitation line */}
      <div className={`pointer-events-none absolute inset-x-0 top-[3.5svh] px-6 text-center transition-opacity duration-700 ${tapped ? 'opacity-0' : 'opacity-100'}`}>
        <p className="font-serif text-[clamp(.75rem,2.2svh,1.05rem)] uppercase tracking-[0.3em] text-gold-light [text-shadow:0_2px_10px_rgba(0,0,0,.9)]">|| Jai Shri Krishna ||</p>
        <p className="gold-text mt-[0.8svh] font-display text-[clamp(1.6rem,min(8vw,5svh),2.8rem)] font-bold leading-tight [filter:drop-shadow(0_2px_10px_rgba(0,0,0,.85))]">{event.parents}</p>
        <p className="font-serif text-[clamp(.95rem,min(4.4vw,2.8svh),1.35rem)] italic text-sandal [text-shadow:0_2px_10px_rgba(0,0,0,.9)]">invite you to the {event.title}</p>
      </div>

      {/* bottom: the tap prompt stays where thumbs expect it */}
      <div className={`pointer-events-none absolute inset-x-0 bottom-[4svh] px-6 text-center transition-opacity duration-700 ${tapped ? 'opacity-0' : 'opacity-100'}`}>
        <p className="inline-block animate-pulse rounded-full border border-gold bg-black/45 px-5 py-[1svh] text-[clamp(.6rem,1.8svh,.8rem)] font-semibold uppercase tracking-[0.3em] text-gold-light shadow backdrop-blur">
          Tap anywhere to open
        </p>
      </div>
    </div>
  )
}
