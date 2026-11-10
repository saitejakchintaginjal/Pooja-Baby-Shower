import { useEffect, useRef, useState } from 'react'

// Fades/rotates content into view in 3D when scrolled onto the screen.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${shown ? 'reveal-in' : ''} ${className}`}>
      {children}
    </div>
  )
}
