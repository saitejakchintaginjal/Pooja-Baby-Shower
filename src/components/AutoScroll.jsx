import { useEffect, useState } from 'react'

// Auto-scrolls from section to section: waits 3s on the first page, then glides down,
// pausing 2s on each section. Any tap / click / scroll / key press pauses it, and it
// carries on 2s after the visitor's last interaction. The small button turns it off for good.
const FIRST_DELAY = 3000 // wait on the first page
const DWELL = 2000 // pause on every other section
const RESUME_AFTER = 2000 // wait after a tap / scroll before auto-scroll carries on
const GLIDE_MS = 2200 // one slow, gentle glide from section to section

// sine ease-in-out: starts and stops softly, with no sudden acceleration
const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2

export default function AutoScroll() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [on, setOn] = useState(!reduce)

  useEffect(() => {
    if (!on) return
    const root = document.documentElement
    let timer = 0
    let idle = 0
    let raf = 0
    let holding = false // finger / mouse button currently down

    const sections = () => [...document.querySelectorAll('[data-section]')]
    const current = () => {
      const y = window.scrollY
      let best = 0
      let min = Infinity
      sections().forEach((s, i) => {
        const d = Math.abs(s.offsetTop - y)
        if (d < min) { min = d; best = i }
      })
      return best
    }
    // Snap + CSS smooth-scroll are switched off only while we animate ourselves.
    const release = () => {
      cancelAnimationFrame(raf)
      raf = 0
      root.style.scrollSnapType = ''
      root.style.scrollBehavior = ''
    }

    const step = () => {
      const list = sections()
      const i = current()
      if (i >= list.length - 1) return // reached the last section
      const start = window.scrollY
      const dist = list[i + 1].offsetTop - start
      const t0 = performance.now()
      root.style.scrollSnapType = 'none'
      root.style.scrollBehavior = 'auto'
      const frame = (now) => {
        const p = Math.min(1, (now - t0) / GLIDE_MS)
        window.scrollTo(0, start + dist * ease(p))
        if (p < 1) {
          raf = requestAnimationFrame(frame)
        } else {
          release()
          timer = setTimeout(step, DWELL)
        }
      }
      raf = requestAnimationFrame(frame)
    }

    // any interaction: stop right now, then carry on RESUME_AFTER ms after the last one
    const pause = () => {
      clearTimeout(timer)
      clearTimeout(idle)
      release()
    }
    const resumeLater = () => {
      clearTimeout(idle)
      idle = setTimeout(step, RESUME_AFTER)
    }
    const ignore = (e) => e.target instanceof Element && e.target.closest('[data-autoscroll-toggle]')

    const onDown = (e) => {
      if (ignore(e) || (e.type === 'pointerdown' && e.pointerType === 'touch')) return // touch is handled by touchstart
      holding = true
      pause()
    }
    const onUp = (e) => {
      if (ignore(e) || (e.type === 'pointerup' && e.pointerType === 'touch')) return
      holding = false
      resumeLater()
    }
    const onWheelKey = (e) => {
      if (ignore(e)) return
      pause()
      if (!holding) resumeLater()
    }

    timer = setTimeout(step, FIRST_DELAY)
    const opts = { passive: true }
    window.addEventListener('pointerdown', onDown, opts)
    window.addEventListener('touchstart', onDown, opts)
    window.addEventListener('pointerup', onUp, opts)
    window.addEventListener('touchend', onUp, opts)
    window.addEventListener('touchcancel', onUp, opts)
    window.addEventListener('wheel', onWheelKey, opts)
    window.addEventListener('keydown', onWheelKey, opts)
    return () => {
      clearTimeout(timer)
      clearTimeout(idle)
      release()
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('touchstart', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchcancel', onUp)
      window.removeEventListener('wheel', onWheelKey)
      window.removeEventListener('keydown', onWheelKey)
    }
  }, [on])

  return (
    <button
      type="button"
      data-autoscroll-toggle
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label={on ? 'Pause auto-scroll' : 'Start auto-scroll'}
      className="fixed bottom-4 right-14 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-indigo-dark/70 text-sm text-gold-light opacity-70 transition hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light"
    >
      <span aria-hidden="true">{on ? '⏸' : '▶'}</span>
    </button>
  )
}
