import { useRef } from 'react'

// Wrapper that tilts its child in 3D toward the pointer and adds a moving glare.
export default function Tilt({ children, max = 10, scale = 1.02, glare = true, className = '' }) {
  const ref = useRef(null)
  const glareRef = useRef(null)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const move = (e) => {
    if (reduce || e.pointerType === 'touch') return
    const el = ref.current
    el.style.willChange = 'transform' // only promote to its own layer while actually tilting (keeps images sharp at rest)
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg) scale(${scale})`
    if (glareRef.current) {
      glareRef.current.style.opacity = 1
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.35), transparent 55%)`
    }
  }
  const leave = () => {
    ref.current.style.transform = '' // back to no transform at rest = crisp rendering
    ref.current.style.willChange = ''
    if (glareRef.current) glareRef.current.style.opacity = 0
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`relative transition-transform duration-200 ease-out [transform-style:preserve-3d] ${className}`}
    >
      {children}
      {glare && (
        <div ref={glareRef} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300" />
      )}
    </div>
  )
}
