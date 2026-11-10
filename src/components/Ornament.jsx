import Feather from './Feather'

// Gold divider with a small peacock feather in the middle
export default function Ornament({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-[min(16vw,4rem)] bg-gradient-to-r from-transparent to-gold" />
      <Feather className="h-[5svh] max-h-14 min-h-9 w-auto rotate-[18deg]" />
      <span className="h-px w-[min(16vw,4rem)] bg-gradient-to-l from-transparent to-gold" />
    </div>
  )
}
