// One looping video fixed behind the whole site. Each screen lays a tinted overlay on top of it
// (see the section backgrounds), so the video shows through on every page while text stays readable.
// Skipped for visitors who prefer reduced motion.
export default function Backdrop() {
  return (
    <video
      className="pointer-events-none fixed inset-0 h-full w-full object-cover motion-reduce:hidden md:object-[50%_90%]"
      src="/hero-bg.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  )
}
