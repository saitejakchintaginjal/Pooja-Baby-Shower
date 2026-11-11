import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Full-screen photo viewer. Tap the photo, the backdrop or ✕ (or press Esc) to close;
// ‹ › buttons, arrow keys and a left/right swipe move between photos.
// While it is open the page's auto-scroll holds still (it watches for data-lightbox on <html>).
export default function Lightbox({ photos, index, onClose, onIndex }) {
  const closeBtn = useRef(null)
  const touchX = useRef(null)
  const photo = photos[index]
  const go = (d) => onIndex((index + d + photos.length) % photos.length)

  useEffect(() => {
    const root = document.documentElement
    const prevOverflow = document.body.style.overflow
    root.setAttribute('data-lightbox', '')
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      root.removeAttribute('data-lightbox')
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const arrow =
    'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/60 bg-black/50 text-2xl text-gold-light transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.caption} — full screen photo`}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 55) go(dx < 0 ? 1 : -1)
      }}
      className="lightbox fixed inset-0 z-[90] flex cursor-zoom-out items-center justify-center bg-black/92 p-3 sm:p-8"
    >
      <button
        ref={closeBtn}
        type="button"
        aria-label="Close full screen photo"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 bg-black/50 text-xl text-gold-light transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light sm:right-5 sm:top-5"
      >
        ✕
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); go(-1) }} className={`${arrow} left-2 sm:left-5`}>‹</button>
          <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); go(1) }} className={`${arrow} right-2 sm:right-5`}>›</button>
        </>
      )}
      <figure key={photo.src} className="lightbox-photo flex max-h-full max-w-full flex-col items-center">
        <img src={photo.src} alt={photo.alt} className="max-h-[84svh] max-w-[94vw] rounded-md object-contain shadow-[0_20px_70px_rgba(0,0,0,.8)] sm:max-w-[88vw]" />
        <figcaption className="mt-3 font-serif text-[clamp(1.1rem,3svh,1.6rem)] italic text-gold-light">{photo.caption}</figcaption>
      </figure>
    </div>,
    document.body,
  )
}
