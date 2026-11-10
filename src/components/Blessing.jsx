import { event } from '../config'
import Ornament from './Ornament'
import Reveal from './Reveal'

export default function Blessing() {
  return (
    <section data-section className="snap-section flex items-center justify-center px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Ornament className="mb-[3svh]" />
        <p className="font-serif text-[clamp(1.2rem,min(5.6vw,3.7svh),2rem)] italic leading-relaxed text-indigo">“{event.blessing}”</p>
        <p className="mt-[3svh] text-sm uppercase tracking-widest text-gold">— {event.parents}</p>
      </Reveal>
    </section>
  )
}
