import { useState } from 'react'
import Intro from './components/Intro3D'
import Hero from './components/Hero'
import Vote from './components/Vote'
import Gallery from './components/Gallery'
import Ceremony from './components/Ceremony'
import CountdownDetails from './components/CountdownDetails'
import Footer from './components/Footer'
import Petals from './components/Petals'
import Music from './components/Music'
import AutoScroll from './components/AutoScroll'
import Backdrop from './components/Backdrop'

export default function App() {
  // opened: tapped, site mounts (so its entrance animations play as the doors open)
  // introDone: doors finished opening, intro layer removed
  const [opened, setOpened] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      {!introDone && <Intro onOpen={() => setOpened(true)} onDone={() => setIntroDone(true)} />}
      <Music />
      {introDone && <AutoScroll />}
      {opened && <Backdrop />}
      {opened && (
        <main>
          <Petals />
          <Hero />
          <Vote />
          <Gallery />
          <Ceremony />
          <CountdownDetails />
          <Footer />
        </main>
      )}
    </>
  )
}
