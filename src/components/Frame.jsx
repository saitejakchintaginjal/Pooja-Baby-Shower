// South Indian festive border for a full-screen section:
//  - triple "zari" border (gold / dotted peacock / fine gold)
//  - mango-leaf & marigold toran (maavilai thoranam) hanging across the top
//  - a row of diyas along the bottom
//  - kolam-style fan ornaments in the four corners
// The border sits above the section; children are padded so they never run under it.

export function Corner({ className = '' }) {
  const petals = [8, 27, 45, 63, 82]
  return (
    <svg
      viewBox="0 0 64 64"
      className={`absolute h-[var(--corner)] w-[var(--corner)] ${className}`}
      fill="none"
    >
      <g transform="translate(7 7)">
        {petals.map((a) => (
          <ellipse
            key={a}
            rx="17"
            ry="5.2"
            transform={`rotate(${a}) translate(21 0)`}
            fill="#f4b315"
            fillOpacity=".3"
            stroke="#d4a02a"
            strokeWidth="1.2"
          />
        ))}
        {[10, 30, 50, 70].map((a) => {
          const r = (a * Math.PI) / 180
          return <circle key={a} cx={44 * Math.cos(r)} cy={44 * Math.sin(r)} r="1.8" fill="#0e8a8f" />
        })}
        <circle r="5.5" fill="#d4a02a" />
        <circle r="2.4" fill="#fff1b8" />
      </g>
    </svg>
  )
}

export default function Frame({ children, className = '' }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
        <span className="absolute inset-[6px] border-2 border-gold/80" />
        <span className="absolute inset-[12px] border-2 border-dotted border-peacock/70" />
        <span className="absolute inset-[18px] border border-gold/50" />

        <div className="toran absolute left-[var(--corner)] right-[var(--corner)] top-[20px] h-[var(--tor)]" />
        <div className="diya-row absolute bottom-[20px] left-[var(--corner)] right-[var(--corner)] h-[var(--diya)]" />

        <Corner className="left-[3px] top-[3px]" />
        <Corner className="right-[3px] top-[3px] -scale-x-100" />
        <Corner className="bottom-[3px] left-[3px] -scale-y-100" />
        <Corner className="bottom-[3px] right-[3px] -scale-100" />
      </div>
      <div
        className={`relative h-full ${className}`}
        style={{
          paddingTop: 'calc(26px + var(--tor))',
          paddingBottom: 'calc(26px + var(--diya))',
          paddingInline: '28px',
        }}
      >
        {children}
      </div>
    </>
  )
}
