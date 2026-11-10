import { useEffect, useRef } from 'react'

// Falling marigold / rose / jasmine petals. Each petal tumbles in 3D
// (the x-rotation squashes it like a real petal flipping) and has a depth
// value that controls size, speed, opacity and blur for parallax.
const COLORS = ['#f4b315', '#f7c948', '#ffe9a8', '#f2d27a', '#8fd6d8', '#5db7c2']

export default function Petals() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w, h, raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const make = (initial) => {
      const z = 0.35 + Math.random() * 0.65 // depth: 1 = near
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -30,
        z,
        size: 4 + z * 6,
        vy: 0.5 + z * 1.4,
        sway: 0.6 + Math.random() * 1.2,
        phase: Math.random() * 6.28,
        rx: Math.random() * 6.28,
        rz: Math.random() * 6.28,
        vrx: 0.01 + Math.random() * 0.03,
        vrz: (Math.random() - 0.5) * 0.03,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      }
    }
    const count = w < 640 ? 14 : 22
    const petals = Array.from({ length: count }, () => make(true))

    const draw = (p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rz)
      ctx.scale(1, Math.cos(p.rx)) // 3D flip
      ctx.globalAlpha = 0.18 + p.z * 0.27 // faint, so the photos and text stay the focus
      const s = p.size
      // Slim petal: pointed tip, fuller rounded base, soft light-to-colour gradient
      const g = ctx.createLinearGradient(0, -s, 0, s)
      g.addColorStop(0, '#fffdf3')
      g.addColorStop(1, p.color)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -s * 1.5)
      ctx.bezierCurveTo(s * 0.75, -s * 0.5, s * 0.8, s * 0.7, 0, s)
      ctx.bezierCurveTo(-s * 0.8, s * 0.7, -s * 0.75, -s * 0.5, 0, -s * 1.5)
      ctx.fill()
      // fine centre vein
      ctx.strokeStyle = 'rgba(255,255,255,.55)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(0, -s * 1.2)
      ctx.lineTo(0, s * 0.8)
      ctx.stroke()
      ctx.restore()
    }

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i]
        p.y += p.vy
        p.x += Math.sin(t / 900 + p.phase) * p.sway
        p.rx += p.vrx
        p.rz += p.vrz
        if (p.y > h + 30) petals[i] = make(false)
        draw(p)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40" />
}
