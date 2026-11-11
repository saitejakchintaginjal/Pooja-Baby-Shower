import { useEffect } from 'react'

// Auto-scrolls from section to section. It waits WAIT_MS on every screen (the first page included),
// then glides to the next. Any tap / click / scroll / key press stops it straight away, and it
// starts again WAIT_MS after the visitor's last interaction. There is no on/off button.
const WAIT_MS = 3000
const GLIDE_MS = 4500 // one slow, gentle glide from section to section

// sine ease-in-out: starts and stops softly, with no sudden acceleration
const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2

export default function AutoScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return // no automatic motion for these visitors
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
      // a photo is open full screen: stay put and check again shortly
      if (root.hasAttribute('data-lightbox')) {
        timer = setTimeout(step, 500)
        return
      }
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
          timer = setTimeout(step, WAIT_MS)
        }
      }
      raf = requestAnimationFrame(frame)
    }

    // any interaction: stop right now, then carry on WAIT_MS after the last one
    const pause = () => {
      clearTimeout(timer)
      clearTimeout(idle)
      release()
    }
    const resumeLater = () => {
      clearTimeout(idle)
      idle = setTimeout(step, WAIT_MS)
    }

    const onDown = (e) => {
      if (e.type === 'pointerdown' && e.pointerType === 'touch') return // touch is handled by touchstart
      holding = true
      pause()
    }
    const onUp = (e) => {
      if (e.type === 'pointerup' && e.pointerType === 'touch') return
      holding = false
      resumeLater()
    }
    const onWheelKey = () => {
      pause()
      if (!holding) resumeLater()
    }

    timer = setTimeout(step, WAIT_MS)
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
  }, [])

  return null
}
