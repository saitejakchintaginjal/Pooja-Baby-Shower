import { useEffect, useRef, useState } from 'react'

// Background music with a floating play/pause button.
// Browsers block autoplay with sound, so it starts when the visitor taps the button.
export default function Music() {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [hint, setHint] = useState(true)

  // The opening screen's "tap to open" is a user gesture, so music may start then.
  useEffect(() => {
    const start = () => {
      const a = ref.current
      if (!a || !a.paused) return
      a.volume = 0.7
      a.play().then(() => { setPlaying(true); setHint(false) }).catch(() => {})
    }
    window.addEventListener('invitation-open', start)
    return () => window.removeEventListener('invitation-open', start)
  }, [])

  const toggle = async () => {
    const a = ref.current
    setHint(false)
    if (a.paused) {
      try {
        a.volume = 0.7
        await a.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    } else {
      a.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio ref={ref} src="/music.m4a" loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-indigo-dark/70 text-sm opacity-70 transition hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
      >
        <span aria-hidden="true">{playing ? '🔊' : '🔇'}</span>
      </button>
    </>
  )
}
