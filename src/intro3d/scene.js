// South Indian "Sreemantham" entrance, rendered with three.js (everything procedural, no model files):
//  - a carved teak (Chettinad-style) doorway with lathe-turned pillars, brass caps and bells
//  - a kavi (red & white striped) temple wall
//  - a curtain of jasmine + marigold strands that parts when you tap
//  - a toran of real ruffled marigold flowers and mango leaves; marigold garlands on the pillars
//  - magenta silk drapes with gold zari borders, brass kuthuvilakku lamps, clay diyas with lit flames
//  - kalasams with coconuts, plantain trees, a kolam, hanging valaikappu bangles
//  - behind the curtain: the illustrated thottil (baby in a silk cloth cradle), softly lit in golden light
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

let seed = 5
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a, b, t) => a + (b - a) * t

const FLOOR_Y = -3.2
const OPEN_W = 4.4 // doorway width
const PILLAR_TOP = 3.75
const BEAM_Y = PILLAR_TOP + 0.3
const rgeo = (w, h, d, r = 0.03) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001))
const lathe = (pts, seg = 36) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

// dark teak with grain (vertical streaks, wavy lines)
function teakCanvas() {
  const [c, g] = canvas(256, 512)
  const base = g.createLinearGradient(0, 0, 256, 0)
  base.addColorStop(0, '#4a230e')
  base.addColorStop(0.5, '#6e3a18')
  base.addColorStop(1, '#431e0a')
  g.fillStyle = base
  g.fillRect(0, 0, 256, 512)
  for (let i = 0; i < 700; i++) {
    const a = 0.05 + rnd() * 0.22
    g.fillStyle = rnd() < 0.55 ? `rgba(22,9,2,${a})` : `rgba(200,140,80,${a * 0.5})`
    g.fillRect(rnd() * 256, 0, 0.5 + rnd() * 2.2, 512)
  }
  g.lineWidth = 1.1
  for (let i = 0; i < 30; i++) {
    g.strokeStyle = `rgba(20,8,2,${0.18 + rnd() * 0.2})`
    g.beginPath()
    const x0 = rnd() * 256, amp = 2 + rnd() * 8, f = 0.008 + rnd() * 0.01
    for (let y = 0; y <= 512; y += 14) { const x = x0 + Math.sin(y * f + i) * amp; y === 0 ? g.moveTo(x, y) : g.lineTo(x, y) }
    g.stroke()
  }
  return c
}

// seamless plaster: flat base + soft blotches drawn with wrap-around copies
function plasterCanvas(c1, c2) {
  const [c, g] = canvas(512, 512)
  g.fillStyle = c1
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 512, y = rnd() * 512, r = 30 + rnd() * 90
    const light = rnd() < 0.5
    for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) {
      const m = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r)
      m.addColorStop(0, light ? 'rgba(255,255,255,.07)' : c2)
      m.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = m
      g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2)
    }
  }
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.07})`; g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2) }
  return c
}

// kavi: the red & white vertical stripes painted on the base of South Indian temple walls
function kaviCanvas() {
  const [c, g] = canvas(256, 256)
  for (let x = 0; x < 256; x += 32) {
    g.fillStyle = (x / 32) % 2 ? '#fbf3e4' : '#b3261e'
    g.fillRect(x, 0, 32, 256)
  }
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.1})`; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2) }
  const sh = g.createLinearGradient(0, 0, 0, 256)
  sh.addColorStop(0, 'rgba(255,255,255,.08)')
  sh.addColorStop(1, 'rgba(0,0,0,.18)')
  g.fillStyle = sh
  g.fillRect(0, 0, 256, 256)
  return c
}

// Kanchipuram-style silk drape: deep magenta with gold zari borders left/right and woven motifs
function silkCanvas() {
  const [c, g] = canvas(256, 1024)
  const base = g.createLinearGradient(0, 0, 256, 0)
  base.addColorStop(0, '#9c0f56')
  base.addColorStop(0.5, '#c4186f')
  base.addColorStop(1, '#8e0c4d')
  g.fillStyle = base
  g.fillRect(0, 0, 256, 1024)
  for (let i = 0; i < 380; i++) { g.fillStyle = `rgba(255,${180 + rnd() * 60},${200 + rnd() * 50},${rnd() * 0.07})`; g.fillRect(rnd() * 256, 0, 1, 1024) }
  for (const x0 of [0, 216]) {
    g.fillStyle = '#d9a52b'
    g.fillRect(x0, 0, 40, 1024)
    g.fillStyle = '#7a0b42'
    g.fillRect(x0 + (x0 ? 8 : 6), 0, 3, 1024)
    g.fillRect(x0 + (x0 ? 29 : 31), 0, 3, 1024)
    g.fillStyle = '#f6d672'
    for (let y = 12; y < 1024; y += 26) {
      g.beginPath()
      g.moveTo(x0 + 20, y - 8); g.lineTo(x0 + 28, y); g.lineTo(x0 + 20, y + 8); g.lineTo(x0 + 12, y)
      g.closePath(); g.fill()
    }
  }
  for (let y = 40; y < 1024; y += 70) for (let x = 70; x < 200; x += 60) {
    g.fillStyle = 'rgba(246,214,114,.85)'
    g.beginPath(); g.arc(x + (y % 140 ? 0 : 30), y, 5, 0, Math.PI * 2); g.fill()
  }
  return c
}

function bananaLeafCanvas() {
  const [c, g] = canvas(128, 512)
  const grad = g.createLinearGradient(0, 0, 128, 0)
  grad.addColorStop(0, '#2c8a37')
  grad.addColorStop(0.5, '#5fcb54')
  grad.addColorStop(1, '#2a8035')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 512)
  g.strokeStyle = 'rgba(15,80,25,.55)'
  g.lineWidth = 1
  for (let y = 6; y < 512; y += 7) { g.beginPath(); g.moveTo(64, y); g.lineTo(0, y + 22); g.moveTo(64, y); g.lineTo(128, y + 22); g.stroke() }
  g.strokeStyle = '#d7e8a0'
  g.lineWidth = 4
  g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 512); g.stroke()
  return c
}

function mangoLeafCanvas() {
  const [c, g] = canvas(64, 128)
  const grad = g.createLinearGradient(0, 0, 64, 0)
  grad.addColorStop(0, '#176f3a'); grad.addColorStop(0.5, '#3fb36a'); grad.addColorStop(1, '#14602f')
  g.fillStyle = grad
  g.beginPath()
  g.moveTo(32, 2); g.bezierCurveTo(70, 34, 66, 92, 32, 126); g.bezierCurveTo(-2, 92, -6, 34, 32, 2)
  g.fill()
  g.strokeStyle = 'rgba(190,235,170,.7)'; g.lineWidth = 2
  g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 124); g.stroke()
  g.strokeStyle = 'rgba(8,60,26,.55)'; g.lineWidth = 1
  for (let y = 18; y < 112; y += 11) { g.beginPath(); g.moveTo(32, y); g.lineTo(54, y + 12); g.moveTo(32, y); g.lineTo(10, y + 12); g.stroke() }
  return c
}

// polished dark granite floor
function graniteCanvas() {
  const [c, g] = canvas(512, 512)
  g.fillStyle = '#26211f'
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = rnd() < 0.5 ? `rgba(255,235,210,${rnd() * 0.16})` : `rgba(0,0,0,${rnd() * 0.3})`
    g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2.4, 1 + rnd() * 2.4)
  }
  g.strokeStyle = 'rgba(0,0,0,.65)'; g.lineWidth = 4
  for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 256); g.lineTo(512, i * 256); g.stroke() }
  return c
}

// vivid kolam / rangoli mandala
function kolamCanvas() {
  const [c, g] = canvas(1024, 1024)
  g.translate(512, 512)
  const petal = (n, dist, rx, ry, fill) => {
    for (let k = 0; k < n; k++) {
      g.save(); g.rotate((k / n) * Math.PI * 2); g.translate(dist, 0)
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      g.fillStyle = fill; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke()
      g.restore()
    }
  }
  g.beginPath(); g.arc(0, 0, 492, 0, Math.PI * 2); g.fillStyle = 'rgba(255,250,235,.22)'; g.fill()
  g.lineWidth = 8; g.strokeStyle = '#f4b315'; g.stroke()
  for (let k = 0; k < 64; k++) { const a = (k / 64) * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * 455, Math.sin(a) * 455, 6, 0, Math.PI * 2); g.fillStyle = '#fff6e0'; g.fill() }
  petal(28, 345, 78, 26, 'rgba(255,170,20,.97)')
  petal(20, 240, 66, 30, 'rgba(225,40,110,.97)')
  petal(12, 140, 56, 28, 'rgba(20,160,120,.97)')
  petal(8, 62, 30, 15, 'rgba(255,250,235,.97)')
  g.beginPath(); g.arc(0, 0, 26, 0, Math.PI * 2); g.fillStyle = '#e8412c'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke()
  return c
}

function glowCanvas() {
  const [c, g] = canvas(256, 256)
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  r.addColorStop(0, 'rgba(255,246,210,1)')
  r.addColorStop(0.35, 'rgba(255,200,100,.55)')
  r.addColorStop(1, 'rgba(255,170,60,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 256, 256)
  return c
}

// a teardrop candle/lamp flame: white-hot core, orange body, soft edges, faint blue base
function flameCanvas() {
  const [c, g] = canvas(64, 128)
  const body = g.createLinearGradient(0, 4, 0, 122)
  body.addColorStop(0, 'rgba(255,110,10,0)')
  body.addColorStop(0.25, 'rgba(255,150,30,.75)')
  body.addColorStop(0.6, 'rgba(255,215,90,.98)')
  body.addColorStop(1, 'rgba(255,252,225,1)')
  g.fillStyle = body
  g.beginPath()
  g.moveTo(32, 4)
  g.bezierCurveTo(54, 46, 60, 86, 32, 122)
  g.bezierCurveTo(4, 86, 10, 46, 32, 4)
  g.fill()
  const core = g.createRadialGradient(32, 96, 2, 32, 96, 26)
  core.addColorStop(0, 'rgba(255,255,255,.95)')
  core.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = core
  g.fillRect(0, 60, 64, 68)
  const blue = g.createRadialGradient(32, 118, 1, 32, 116, 11)
  blue.addColorStop(0, 'rgba(90,130,255,.7)')
  blue.addColorStop(1, 'rgba(90,130,255,0)')
  g.fillStyle = blue
  g.fillRect(14, 104, 36, 24)
  return c
}

// A real marigold: a ruffled pom-pom of layered petals, built once as merged geometry with vertex colours
function makeMarigold(c1, c2, c3) {
  const parts = []
  const rings = [[13, 0.6, 0.0, 0.5, c1], [11, 0.44, 0.1, 0.7, c2], [9, 0.29, 0.2, 0.9, c2], [6, 0.15, 0.3, 1.1, c3]]
  const col = new THREE.Color()
  const paint = (g, hex) => {
    col.setHex(hex)
    const n = g.attributes.position.count
    const arr = new Float32Array(n * 3)
    for (let k = 0; k < n; k++) { arr[k * 3] = col.r; arr[k * 3 + 1] = col.g; arr[k * 3 + 2] = col.b }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  }
  rings.forEach(([n, r, lift, tilt, hex], ri) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ri * 0.35
      const g = new THREE.SphereGeometry(1, 6, 4)
      g.scale(0.3, 0.12, 0.17) // long along x = one petal
      g.rotateZ(tilt * 0.45) // tip lifts up
      g.rotateY(-a) // point outward from the centre
      g.translate(Math.cos(a) * r, lift, Math.sin(a) * r)
      paint(g, hex)
      parts.push(g)
    }
  })
  const dome = new THREE.SphereGeometry(0.16, 8, 6)
  dome.scale(1, 0.8, 1)
  dome.translate(0, 0.3, 0)
  paint(dome, c3)
  parts.push(dome)
  const merged = mergeGeometries(parts, false)
  parts.forEach((p) => p.dispose())
  merged.rotateX(Math.PI / 2) // flower face looks toward +Z, at the viewer
  return merged
}

// feathered alpha mask: opaque in the middle, fading to transparent at the edges
function softEdgeCanvas(w, h) {
  const [c, g] = canvas(w, h)
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  const steps = 44
  for (let i = 0; i < steps; i++) {
    const k = i / (steps - 1)
    const gray = Math.round(255 * Math.pow(k, 0.85))
    g.fillStyle = 'rgb(' + gray + ',' + gray + ',' + gray + ')'
    const inx = i * (w * 0.0035)
    const iny = i * (h * 0.0035)
    g.beginPath()
    g.roundRect(inx, iny, w - inx * 2, h - iny * 2, Math.max(8, 46 - i))
    g.fill()
  }
  return c
}

export function createDoorScene(container) {
  const hq = new URLSearchParams(window.location.search).has('hq')
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  const small = Math.min(window.innerWidth, window.innerHeight) < 600
  let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2)
  renderer.setPixelRatio(dpr)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const el = renderer.domElement
  el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  container.appendChild(el)
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2b1608)
  scene.fog = new THREE.FogExp2(0x2b1608, 0.006)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.45

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80)

  // ---------- textures & materials ----------
  const tex = (cnv, repeat, srgb = true) => {
    const t = new THREE.CanvasTexture(cnv)
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = aniso
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]) }
    return t
  }
  const teakT = tex(teakCanvas())
  const teak = new THREE.MeshStandardMaterial({ map: teakT, bumpMap: teakT, bumpScale: 2.5, roughness: 0.5, metalness: 0.04 })
  const brass = new THREE.MeshStandardMaterial({ color: 0xf0b83a, metalness: 1, roughness: 0.24, envMapIntensity: 1.8 })
  const silk = new THREE.MeshPhysicalMaterial({ map: tex(silkCanvas()), roughness: 0.42, sheen: 1, sheenColor: new THREE.Color(0xffa8d0), sheenRoughness: 0.35, side: THREE.DoubleSide })
  const plasterCnv = plasterCanvas('#f2d6a0', 'rgba(150,95,40,.07)')
  const kaviCnv = kaviCanvas()
  const wallFor = (w, h, kavi) =>
    new THREE.MeshStandardMaterial({ map: tex(kavi ? kaviCnv : plasterCnv, kavi ? [w / 1.4, h / 1.4] : [w / 4.5, h / 4.5]), roughness: 0.9 })

  const add = (geo, mat, x, y, z, cast = true, recv = true) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.castShadow = cast
    m.receiveShadow = recv
    scene.add(m)
    return m
  }
  const addBox = (w, h, d, mat, x, y, z, r = 0.03) => add(rgeo(w, h, d, r), mat, x, y, z)
  // ---------- real marigolds (ruffled, layered petals) ----------
  const marigoldMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: 0x3a1800, emissiveIntensity: 0.55 })
  const orangeGeo = makeMarigold(0xff9a1a, 0xff8200, 0xe85d04)
  const yellowGeo = makeMarigold(0xffd23a, 0xffbf0a, 0xf59a00)
  const dummy = new THREE.Object3D()
  const col = new THREE.Color()
  // place many marigolds at once: items = [{ p: Vector3, s: scale, yellow: bool, rz?: rotation }]
  function marigolds(parent, items) {
    const make = (geo, list) => {
      if (!list.length) return
      const im = new THREE.InstancedMesh(geo, marigoldMat, list.length)
      list.forEach((it, i) => {
        dummy.position.copy(it.p)
        dummy.rotation.set((rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.4, it.rz ?? rnd() * Math.PI * 2)
        dummy.scale.setScalar(it.s)
        dummy.updateMatrix()
        im.setMatrixAt(i, dummy.matrix)
        const b = 0.86 + rnd() * 0.24
        col.setRGB(b, b, b)
        im.setColorAt(i, col)
      })
      im.frustumCulled = false
      parent.add(im)
    }
    make(orangeGeo, items.filter((i) => !i.yellow))
    make(yellowGeo, items.filter((i) => i.yellow))
  }

  // ---------- temple wall: kavi stripes below, warm plaster above ----------
  const stripeH = 3.0
  const sideW = 16
  const sideX = OPEN_W / 2 + 0.7 + sideW / 2 - 0.05
  const wallTop = 15
  for (const s of [-1, 1]) {
    addBox(sideW, stripeH, 0.5, wallFor(sideW, stripeH, true), s * sideX, FLOOR_Y + stripeH / 2, -0.25, 0.01)
    addBox(sideW, wallTop - stripeH, 0.5, wallFor(sideW, wallTop - stripeH, false), s * sideX, FLOOR_Y + stripeH + (wallTop - stripeH) / 2, -0.25, 0.01)
    addBox(sideW, 0.12, 0.56, brass, s * sideX, FLOOR_Y + stripeH + 0.04, -0.2, 0.02)
  }
  const aboveH = wallTop - (PILLAR_TOP - FLOOR_Y) - 0.6
  addBox(2 * (OPEN_W / 2 + 0.7), aboveH, 0.5, wallFor(8, aboveH, false), 0, PILLAR_TOP + 0.6 + aboveH / 2, -0.25, 0.01)

  // ---------- interior: warm golden corridor behind the curtain ----------
  const inter = new THREE.MeshStandardMaterial({ map: tex(plasterCanvas('#efb350', 'rgba(150,80,10,.09)'), [2, 2]), roughness: 0.85, emissive: 0x6b3a08, emissiveIntensity: 0.5 })
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), inter)
    w.rotation.y = -s * Math.PI / 2
    w.position.set(s * (OPEN_W / 2 + 0.05), 0, -3.2)
    scene.add(w)
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(OPEN_W + 0.2, 6), new THREE.MeshStandardMaterial({ map: teakT, roughness: 0.6 }))
  ceil.rotation.x = Math.PI / 2
  ceil.position.set(0, PILLAR_TOP - 0.55, -3.2)
  scene.add(ceil)
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(OPEN_W + 0.4, 9), new THREE.MeshBasicMaterial({ color: 0xc8821e }))
  backdrop.position.set(0, 0, -6.1)
  scene.add(backdrop)
  const glowT = tex(glowCanvas())
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 10),
    new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  )
  glow.position.set(0, 0.2, -5.9)
  scene.add(glow)
  const inner = new THREE.PointLight(0xffd27a, 14, 0, 2)
  inner.position.set(0, 1.4, -2.6)
  scene.add(inner)

  // ---------- teak pillars, beam, bells ----------
  const pilFr = [[0.001, 0], [0.46, 0], [0.46, 0.02], [0.37, 0.035], [0.37, 0.075], [0.44, 0.09], [0.44, 0.105], [0.32, 0.12], [0.29, 0.2], [0.29, 0.3], [0.35, 0.33], [0.35, 0.36], [0.28, 0.38], [0.27, 0.5], [0.27, 0.62], [0.33, 0.65], [0.37, 0.69], [0.3, 0.72], [0.3, 0.75], [0.42, 0.78], [0.46, 0.8], [0.5, 0.83], [0.5, 0.88], [0.55, 0.9], [0.55, 0.97], [0.5, 0.98], [0.5, 1.0], [0.001, 1.0]]
  const pilH = PILLAR_TOP - FLOOR_Y
  const pilGeo = lathe(pilFr.map(([r, f]) => [r, f * pilH]), 40)
  for (const s of [-1, 1]) {
    const x = s * (OPEN_W / 2 + 0.35)
    add(pilGeo, teak, x, FLOOR_Y, 0)
    for (const f of [0.035, 0.895]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(f < 0.5 ? 0.375 : 0.555, 0.028, 12, 40), brass)
      ring.rotation.x = Math.PI / 2
      ring.position.set(x, FLOOR_Y + f * pilH, 0)
      ring.castShadow = true
      scene.add(ring)
    }
    addBox(1.25, 0.1, 1.25, brass, x, PILLAR_TOP + 0.04, 0, 0.03)
  }
  addBox(2 * (OPEN_W / 2 + 0.95), 0.55, 0.95, teak, 0, BEAM_Y, 0, 0.05)
  addBox(2 * (OPEN_W / 2 + 0.95) + 0.1, 0.07, 1.0, brass, 0, BEAM_Y + 0.31, 0, 0.02)
  addBox(2 * (OPEN_W / 2 + 0.9), 0.06, 0.05, brass, 0, BEAM_Y - 0.12, 0.49, 0.015)
  addBox(2 * (OPEN_W / 2 + 0.9), 0.06, 0.05, brass, 0, BEAM_Y + 0.12, 0.49, 0.015)
  for (let x = -OPEN_W / 2 - 0.8; x <= OPEN_W / 2 + 0.8; x += 0.42) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), brass)
    knob.position.set(x, BEAM_Y, 0.5)
    scene.add(knob)
  }
  const bellGeo = lathe([[0.001, 0.3], [0.05, 0.29], [0.08, 0.22], [0.11, 0.12], [0.15, 0.02], [0.16, -0.02], [0.001, -0.02]], 24)
  const bells = []
  for (const x of [-3.5, -3.15, -2.8, 2.8, 3.15, 3.5]) {
    const g = new THREE.Group()
    g.position.set(x, BEAM_Y - 0.3, 0.62)
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 6), brass)
    chain.position.y = 0.16
    g.add(chain)
    const b = new THREE.Mesh(bellGeo, brass)
    b.position.y = -0.3
    b.castShadow = true
    g.add(b)
    scene.add(g)
    bells.push({ g, ph: rnd() * 6 })
  }

  // ---------- marigold + jasmine garlands spiralling up each pillar ----------
  const jasmineGeo = new THREE.SphereGeometry(1, 10, 8)
  const jasmineMat = new THREE.MeshStandardMaterial({ roughness: 0.5, emissive: 0x2a2418, emissiveIntensity: 0.5 })
  const FL = { jasmine: 0xfffaf0, marigold: 0xffa01a, yellow: 0xffc93a, rose: 0xf0426e, leaf: 0x3aa55a }
  for (const s of [-1, 1]) {
    const items = []
    const jas = new THREE.InstancedMesh(jasmineGeo, jasmineMat, 90)
    const n = 74
    for (let i = 0; i < n; i++) {
      const t = i / n
      const a = t * Math.PI * 9 + (s > 0 ? 0 : 1.2)
      items.push({ p: new THREE.Vector3(s * (OPEN_W / 2 + 0.35) + Math.cos(a) * 0.62, FLOOR_Y + 0.3 + t * (pilH - 0.6), Math.sin(a) * 0.62), s: 0.135, yellow: i % 2 === 1 })
    }
    for (let i = 0; i < 90; i++) {
      const t = (i + 0.5) / 90
      const a = t * Math.PI * 9 + (s > 0 ? 0 : 1.2) + 0.18
      dummy.position.set(s * (OPEN_W / 2 + 0.35) + Math.cos(a) * 0.62, FLOOR_Y + 0.3 + t * (pilH - 0.6) + 0.04, Math.sin(a) * 0.62)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(0.05, 0.065, 0.05)
      dummy.updateMatrix()
      jas.setMatrixAt(i, dummy.matrix)
      col.setHex(FL.jasmine)
      jas.setColorAt(i, col)
    }
    jas.frustumCulled = false
    scene.add(jas)
    marigolds(scene, items)
  }

  // ---------- flower curtain: strands of jasmine + marigold (parts when tapped) ----------
  const strandMat = new THREE.MeshStandardMaterial({ roughness: 0.55, emissive: 0x2a1a08, emissiveIntensity: 0.6 })
  const STRANDS = small ? 28 : 38
  const PER = 50
  const strands = []
  const topY = PILLAR_TOP - 0.55
  const spanX = OPEN_W / 2 - 0.1
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i < STRANDS; i++) {
      const x0 = -spanX + ((i + layer * 0.5) / (STRANDS - 0.5)) * spanX * 2
      const g = new THREE.Group()
      g.position.set(x0, topY, 0.2 + layer * 0.16)
      const im = new THREE.InstancedMesh(jasmineGeo, strandMat, PER)
      for (let k = 0; k < PER; k++) {
        const kind = (k + i * 3 + layer * 2) % 9
        let c = FL.jasmine, sc = 0.068 + rnd() * 0.016, sy = 1.45
        if (kind === 3) { c = FL.marigold; sc = 0.092; sy = 0.95 }
        else if (kind === 6) { c = i % 3 ? FL.yellow : FL.rose; sc = 0.088; sy = 0.95 }
        else if (kind === 0) { c = FL.leaf; sc = 0.06; sy = 1.8 }
        dummy.position.set((rnd() - 0.5) * 0.03, -k * 0.125 - 0.05, (rnd() - 0.5) * 0.03)
        dummy.rotation.set(0, rnd() * 3, 0)
        dummy.scale.set(sc, sc * sy, sc)
        dummy.updateMatrix()
        im.setMatrixAt(k, dummy.matrix)
        col.setHex(c)
        im.setColorAt(k, col)
      }
      im.frustumCulled = false
      g.add(im)
      const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, PER * 0.125, 4), new THREE.MeshBasicMaterial({ color: 0xc9b27a }))
      thread.position.y = -(PER * 0.125) / 2
      g.add(thread)
      scene.add(g)
      strands.push({ g, x0, ph: rnd() * 6, f: Math.abs(x0) / spanX })
    }
  }

  // ---------- silk drapes tied back at the pillars ----------
  function drape(side) {
    const w = 1.5, h = 6.7
    const geo = new THREE.PlaneGeometry(w, h, 16, 52)
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / w + 0.5
      const t = p.getY(i) / h + 0.5
      const cinch = 1 - 0.58 * Math.exp(-Math.pow((t - 0.42) / 0.08, 2))
      const fan = 1 + 0.2 * (1 - t) * (1 - t)
      const pleat = Math.sin(u * Math.PI * 9) * (0.05 + 0.07 * (1 - cinch)) + Math.sin(u * Math.PI * 4 + t * 3) * 0.03
      p.setX(i, p.getX(i) * cinch * fan * (0.55 + 0.45 * t))
      p.setZ(i, pleat)
    }
    geo.computeVertexNormals()
    const m = new THREE.Mesh(geo, silk)
    m.position.set(side * (OPEN_W / 2 - 0.45), PILLAR_TOP - 0.55 - h / 2 + 0.4, 0.7)
    m.castShadow = true
    m.receiveShadow = true
    scene.add(m)
    const cy = m.position.y + (0.42 - 0.5) * h
    const cord = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 10, 28), brass)
    cord.position.set(side * (OPEN_W / 2 - 0.45), cy, 0.78)
    cord.rotation.x = Math.PI / 2
    scene.add(cord)
    const tassel = new THREE.Group()
    tassel.position.set(side * (OPEN_W / 2 - 0.45), cy - 0.2, 0.9)
    tassel.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), brass))
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 16, 1, true), silk)
    skirt.position.y = -0.18
    tassel.add(skirt)
    scene.add(tassel)
  }
  drape(-1)
  drape(1)

  // ---------- toran: a heavy garland of REAL marigolds with mango leaves hanging below ----------
  const mangoMat = new THREE.MeshStandardMaterial({ map: tex(mangoLeafCanvas()), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 })
  const mangoGeo = new THREE.PlaneGeometry(0.3, 0.66, 2, 8)
  mangoGeo.translate(0, -0.33, 0)
  {
    const lp = mangoGeo.attributes.position
    for (let i = 0; i < lp.count; i++) { const t = -lp.getY(i) / 0.66; lp.setZ(i, 0.07 * t * t - Math.abs(lp.getX(i)) * 0.18 * t) } // curl like a real leaf
    mangoGeo.computeVertexNormals()
  }
  const toranY = BEAM_Y - 0.28
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-OPEN_W / 2 - 0.8, toranY, 0.62), new THREE.Vector3(0, toranY - 0.85, 0.72), new THREE.Vector3(OPEN_W / 2 + 0.8, toranY, 0.62))
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 50, 0.03, 6, false), new THREE.MeshStandardMaterial({ color: 0x7a4a14, roughness: 0.8 })))
  const toran = []
  for (let i = 0; i < 36; i++) {
    const l = new THREE.Mesh(mangoGeo, mangoMat)
    l.position.copy(curve.getPoint((i + 0.5) / 36))
    l.position.z += 0.02 + (i % 2) * 0.03
    l.position.y -= 0.03
    const sc = 0.85 + rnd() * 0.35
    l.scale.set(sc, sc, 1)
    l.castShadow = true
    scene.add(l)
    toran.push({ mesh: l, base: (rnd() - 0.5) * 0.12, ph: rnd() * 6 })
  }
  {
    const items = []
    for (let i = 0; i < 64; i++) {
      const p = curve.getPoint((i + 0.5) / 64)
      items.push({ p: new THREE.Vector3(p.x, p.y + 0.02 + (i % 2) * 0.05, p.z + 0.07 + (i % 2) * 0.03), s: 0.15 - (i % 2) * 0.02, yellow: i % 3 === 1 })
    }
    marigolds(scene, items)
  }

  // ---------- valaikappu: glass bangles hanging from the beam ----------
  const bangleGeo = new THREE.TorusGeometry(0.14, 0.02, 12, 36)
  const BANGLE = [0xd7263d, 0x1f9d55, 0xf2b705, 0xe83e8c, 0x1e6fd9, 0x7b3fe4]
  const bangleMats = BANGLE.map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.08, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.8 }))
  const bangleGroups = []
  for (const x of [-1.5, -0.55, 0.55, 1.5]) {
    const g = new THREE.Group()
    g.position.set(x, BEAM_Y - 0.28, 0.66)
    const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 5), brass)
    thread.position.y = -0.22
    g.add(thread)
    for (let k = 0; k < 9; k++) {
      const b = new THREE.Mesh(bangleGeo, bangleMats[(k + Math.abs(Math.round(x * 3))) % bangleMats.length])
      b.position.set(Math.sin(k * 1.4) * 0.015, -0.45 - k * 0.07, 0)
      b.rotation.set(0.12 * Math.sin(k), 0.2 * Math.cos(k * 1.7), 0)
      b.castShadow = true
      g.add(b)
    }
    scene.add(g)
    bangleGroups.push({ g, ph: rnd() * 6 })
  }

  // ---------- after the curtain opens: the illustrated thottil hangs in the golden light ----------
  const thottil = new THREE.Group()
  thottil.position.set(0, 0.55, -2.7)
  scene.add(thottil)
  const THOTTIL_W = 3.3
  // warm tint: the picture's cream background melts into the golden corridor instead of showing as a pale patch
  const thottilMat = new THREE.MeshBasicMaterial({ color: 0xffd98e, transparent: true, opacity: 0, alphaMap: tex(softEdgeCanvas(256, 180), null, false), depthWrite: false, fog: false })
  const thottilMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), thottilMat)
  thottilMesh.scale.set(THOTTIL_W, THOTTIL_W * 0.7, 1)
  thottil.add(thottilMesh)
  new THREE.TextureLoader().load('/photos/thottil.jpg', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = aniso
    thottilMat.map = t
    thottilMat.opacity = 1
    thottilMat.needsUpdate = true
    thottilMesh.scale.set(THOTTIL_W, THOTTIL_W * (t.image.height / t.image.width), 1)
  })

  // ---------- floor, kolam, scattered petals ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: tex(graniteCanvas(), [8, 8]), roughness: 0.2, metalness: 0.1, envMapIntensity: 1.4 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  floor.receiveShadow = true
  scene.add(floor)
  const kolam = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 9.6), new THREE.MeshStandardMaterial({ map: tex(kolamCanvas()), transparent: true, roughness: 0.5 }))
  kolam.rotation.x = -Math.PI / 2
  kolam.position.set(0, FLOOR_Y + 0.012, 5.4)
  kolam.receiveShadow = true
  scene.add(kolam)
  const petalFloor = new THREE.CircleGeometry(0.1, 12)
  petalFloor.scale(0.8, 1.35, 1)
  petalFloor.rotateX(-Math.PI / 2)
  const petals = new THREE.InstancedMesh(petalFloor, new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide }), 60)
  const pc = [0xffa01a, 0xffc93a, 0xf0426e, 0xfffaf0]
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2, r = 1.5 + rnd() * 5.2
    dummy.position.set(Math.cos(a) * r * 0.9, FLOOR_Y + 0.02 + rnd() * 0.03, 5.0 + Math.sin(a) * r * 0.7)
    dummy.rotation.set(0, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.3)
    dummy.scale.setScalar(0.7 + rnd() * 0.7)
    dummy.updateMatrix()
    petals.setMatrixAt(i, dummy.matrix)
    petals.setColorAt(i, new THREE.Color(pc[i % pc.length]))
  }
  scene.add(petals)

  // ---------- plantain (banana) trees flanking the entrance ----------
  const bananaMat = new THREE.MeshStandardMaterial({ map: tex(bananaLeafCanvas()), side: THREE.DoubleSide, roughness: 0.55 })
  function bananaLeafGeo(len, wid, bend) {
    const g = new THREE.PlaneGeometry(wid, len, 6, 20)
    const p = g.attributes.position
    const R = len / bend
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const t = (p.getY(i) + len / 2) / len
      const a = bend * t
      const droop = x * x * 0.55 * t
      p.setXYZ(i, x * (1 - 0.3 * t * t), R * Math.sin(a) - droop * 0.5, R * (1 - Math.cos(a)) + droop * 0.25)
    }
    g.computeVertexNormals()
    return g
  }
  const trees = []
  for (const s of [-1, 1]) {
    const tree = new THREE.Group()
    tree.position.set(s * 4.7, FLOOR_Y, 1.4)
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 2.7, 16), new THREE.MeshStandardMaterial({ color: 0xa6cf86, roughness: 0.75 }))
    trunk.position.y = 1.35
    trunk.castShadow = true
    tree.add(trunk)
    const crown = new THREE.Group()
    crown.position.y = 2.65
    for (let k = 0; k < 7; k++) {
      const leaf = new THREE.Mesh(bananaLeafGeo(3.2 + rnd() * 0.8, 1.0, 1.4 + rnd() * 0.5), bananaMat)
      const holder = new THREE.Group()
      holder.rotation.y = (k / 7) * Math.PI * 2 + s * 0.3
      holder.rotation.x = -0.15 - rnd() * 0.25
      leaf.rotation.x = -0.05
      leaf.castShadow = true
      holder.add(leaf)
      crown.add(holder)
    }
    tree.add(crown)
    scene.add(tree)
    trees.push({ crown, ph: rnd() * 6 })
  }

  // ---------- lit flames (sprites) used by the lamps and diyas ----------
  const flameT = tex(flameCanvas())
  const flameMat = new THREE.SpriteMaterial({ map: flameT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
  const haloMat = new THREE.SpriteMaterial({ map: glowT, color: 0xffa83a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 })
  const flames = []
  function flame(parent, x, y, z, w, h, haloS) {
    const f = new THREE.Sprite(flameMat)
    f.center.set(0.5, 0.06)
    f.scale.set(w, h, 1)
    f.position.set(x, y, z)
    parent.add(f)
    const hl = new THREE.Sprite(haloMat)
    hl.scale.setScalar(haloS)
    hl.position.set(x, y + h * 0.35, z)
    parent.add(hl)
    flames.push({ f, hl, w, h, hs: haloS, ph: rnd() * 10 })
  }

  // tall brass kuthuvilakku lamps
  const lampGeo = lathe([[0.001, 0], [0.42, 0], [0.42, 0.05], [0.3, 0.12], [0.1, 0.3], [0.09, 0.45], [0.16, 0.5], [0.09, 0.56], [0.09, 0.9], [0.15, 0.95], [0.09, 1.0], [0.09, 1.4], [0.2, 1.5], [0.12, 1.58], [0.12, 1.7], [0.38, 1.82], [0.42, 1.9], [0.38, 1.95], [0.001, 1.95]], 40)
  for (const s of [-1, 1]) {
    const g = new THREE.Group()
    g.position.set(s * 3.15, FLOOR_Y, 2.2)
    const lamp = new THREE.Mesh(lampGeo, brass)
    lamp.castShadow = true
    g.add(lamp)
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      const cup = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), brass)
      cup.position.set(Math.cos(a) * 0.3, 1.97, Math.sin(a) * 0.3)
      g.add(cup)
      flame(g, Math.cos(a) * 0.3, 2.0, Math.sin(a) * 0.3, 0.12, 0.3, 0.55)
    }
    const light = new THREE.PointLight(0xff9a3c, 9, 9, 2)
    light.position.set(0, 2.3, 0)
    g.add(light)
    flames.push({ light, ph: rnd() * 10 })
    scene.add(g)
  }

  // clay diyas: terracotta bowls with oil, a wick and a lit flame, ringed with marigolds
  const diyaGeo = lathe([[0.001, 0], [0.13, 0], [0.2, 0.03], [0.25, 0.08], [0.27, 0.12], [0.23, 0.115], [0.2, 0.07], [0.001, 0.06]], 28)
  const clay = new THREE.MeshStandardMaterial({ color: 0xb4532a, roughness: 0.85, bumpMap: teakT, bumpScale: 1 })
  const oil = new THREE.MeshStandardMaterial({ color: 0xe8b04a, roughness: 0.1, metalness: 0.3, emissive: 0x6a3a00, emissiveIntensity: 0.6 })
  const wick = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 1 })
  const diyaMarigolds = []
  const placeDiya = (x, z, sc) => {
    const g = new THREE.Group()
    g.position.set(x, FLOOR_Y + 0.012, z)
    g.scale.setScalar(sc)
    const bowl = new THREE.Mesh(diyaGeo, clay)
    bowl.castShadow = true
    g.add(bowl)
    const o = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), oil)
    o.rotation.x = -Math.PI / 2
    o.position.y = 0.075
    g.add(o)
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), wick)
    w.position.set(0.18, 0.1, 0)
    w.rotation.z = -0.5
    g.add(w)
    flame(g, 0.22, 0.12, 0, 0.2, 0.42, 0.62)
    scene.add(g)
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3
      diyaMarigolds.push({ p: new THREE.Vector3(x + Math.cos(a) * 0.36 * sc, FLOOR_Y + 0.06, z + Math.sin(a) * 0.36 * sc), s: 0.07, yellow: k % 2 === 0, rz: a })
    }
  }
  for (let i = 0; i < 11; i++) {
    const a = -1.35 + (i / 10) * 2.7
    if (Math.abs(a) > 0.32 && Math.abs(a) < 0.5) continue // keep clear of the kalasams
    placeDiya(Math.sin(a) * 4.6, 5.4 - Math.cos(a) * 4.6, 0.85)
  }
  for (const s of [-1, 1]) { placeDiya(s * 2.45, 1.7, 0.8); placeDiya(s * 0.9, 3.0, 0.8) }
  // lay the diya marigolds flat on the floor (their faces point up)
  {
    const flat = new THREE.Group()
    flat.rotation.x = -Math.PI / 2
    // convert world-space items to the rotated parent's space
    const conv = diyaMarigolds.map((it) => ({ ...it, p: new THREE.Vector3(it.p.x, -it.p.z, it.p.y) }))
    marigolds(flat, conv)
    scene.add(flat)
  }

  // kalasams: brass pots with mango leaves, a coconut and a garland of marigolds
  const potGeo = lathe([[0.001, 0], [0.2, 0], [0.3, 0.1], [0.34, 0.3], [0.28, 0.55], [0.2, 0.66], [0.23, 0.72], [0.3, 0.78], [0.26, 0.8], [0.001, 0.8]], 32)
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 })
  for (const s of [-1, 1]) {
    const g = new THREE.Group()
    g.position.set(s * 1.75, FLOOR_Y, 3.1)
    const pot = new THREE.Mesh(potGeo, brass)
    pot.castShadow = true
    g.add(pot)
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2
      const lf = new THREE.Mesh(mangoGeo, mangoMat)
      lf.scale.set(1.1, -1.1, 1)
      lf.position.set(Math.cos(a) * 0.2, 0.86, Math.sin(a) * 0.2)
      lf.rotation.order = 'YXZ'
      lf.rotation.x = -0.9
      lf.rotation.y = -a + Math.PI / 2
      g.add(lf)
    }
    const coco = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), coconutMat)
    coco.scale.y = 1.12
    coco.position.y = 0.98
    coco.castShadow = true
    g.add(coco)
    const kumkum = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), new THREE.MeshBasicMaterial({ color: 0xd1252b }))
    kumkum.position.set(0, 0.98, 0.205)
    g.add(kumkum)
    const neck = []
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2
      neck.push({ p: new THREE.Vector3(Math.cos(a) * 0.3, 0.58, Math.sin(a) * 0.3), s: 0.07, yellow: k % 2 === 0 })
    }
    marigolds(g, neck)
    scene.add(g)
  }

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xffe9c8, 0x3a1d0c, 0.5))
  const key = new THREE.SpotLight(0xffe2b0, 230, 0, 0.62, 0.9, 2)
  key.position.set(3.5, 8, 10)
  key.target.position.set(0, 0, 0)
  key.castShadow = true
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048)
  key.shadow.bias = -0.0004
  key.shadow.radius = 4
  scene.add(key, key.target)
  const rim = new THREE.DirectionalLight(0x9bb4ff, 0.35)
  rim.position.set(-6, 4, 6)
  scene.add(rim)

  // falling petals in front
  const fallGeo = new THREE.CircleGeometry(0.1, 12)
  fallGeo.scale(0.8, 1.35, 1)
  const fall = new THREE.InstancedMesh(fallGeo, new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide }), 46)
  fall.frustumCulled = false
  const fl = []
  for (let i = 0; i < 46; i++) {
    fl.push({ x: (rnd() - 0.5) * 8, y: FLOOR_Y + rnd() * 9, z: 0.8 + rnd() * 6, v: 0.006 + rnd() * 0.006, ph: rnd() * 6, s: 0.8 + rnd() * 0.6 })
    fall.setColorAt(i, new THREE.Color(pc[i % pc.length]))
  }
  scene.add(fall)

  // golden dust
  const N = small ? 80 : 150
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - 0.5) * 12; pos[i * 3 + 1] = FLOOR_Y + rnd() * 10; pos[i * 3 + 2] = -1 + rnd() * 9 }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowT, size: 0.18, color: 0xffd98a, transparent: true, opacity: 0.8, depthWrite: false })))

  // ---------- post-processing: colour grade, vignette, film grain ----------
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 })
  const composer = new EffectComposer(renderer, rt)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new OutputPass())
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
      float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        float luma = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        c.rgb = mix(vec3(luma), c.rgb, 1.25);
        c.rgb = clamp((c.rgb - 0.5) * 1.08 + 0.5, 0.0, 1.0);
        vec2 d = vUv - 0.5;
        float v = smoothstep(0.95, 0.3, length(d * vec2(1.0, 1.12)));
        c.rgb *= mix(0.7, 1.0, v);
        c.rgb += (rand(vUv * 900.0 + fract(time)) - 0.5) * 0.026;
        gl_FragColor = c;
      }`,
  })
  composer.addPass(finish)
  let lowQ = false

  // ---------- camera fitting, pointer parallax ----------
  let z0 = 12
  const look = new THREE.Vector3(0, 1.0, 0) // aimed a little high, so the scene sits lower and leaves headroom for the names at the top
  function fit() {
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    composer.setPixelRatio(dpr)
    composer.setSize(w, h)
    camera.aspect = w / h
    const f = (camera.fov * Math.PI) / 180
    const needH = 12.6
    const needW = 10.6
    z0 = Math.max(needH / 2 / Math.tan(f / 2), needW / camera.aspect / 2 / Math.tan(f / 2))
    camera.updateProjectionMatrix()
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(container)
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  const onMove = (e) => { mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = (e.clientY / window.innerHeight) * 2 - 1 }
  window.addEventListener('pointermove', onMove, { passive: true })

  // ---------- opening sequence ----------
  let openStart = 0
  let openDur = 3600
  let onProg = null
  let onEnd = null
  let finished = false
  function open(opts) {
    if (openStart) return
    openStart = performance.now()
    openDur = opts.duration ?? 3600
    onProg = opts.onProgress
    onEnd = opts.onDone
  }

  // ---------- render loop ----------
  const clock = new THREE.Clock()
  let raf = 0
  let running = true
  let frames = 0
  let acc = 0
  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = clock.getDelta()
    const t = clock.elapsedTime
    if (!hq && !lowQ && ++frames > 24 && frames <= 84) {
      acc += dt
      if (frames === 84 && acc / 60 > 0.036) { lowQ = true; dpr = 1; fit() }
    }
    const p = openStart ? clamp01((performance.now() - openStart) / openDur) : 0

    // the flower curtain draws back to both sides, the camera glides in, golden light floods the scene
    const door = ease(clamp01((p - 0.04) / 0.72))
    strands.forEach((s) => {
      const delay = (1 - s.f) * 0.18
      const k = ease(clamp01((door - delay) / (1 - 0.18)))
      const target = Math.sign(s.x0 || 1) * (OPEN_W / 2 - 0.15 + (1 - s.f) * 0.25)
      s.g.position.x = lerp(s.x0, target, k)
      s.g.rotation.z = Math.sin(t * 1.3 + s.ph) * (0.03 + 0.12 * Math.sin(k * Math.PI))
    })
    const move = ease(clamp01(p / 0.94))
    // stop far enough back that the whole picture is in frame, even on a narrow phone
    const halfFov = (camera.fov * Math.PI) / 360
    const zEnd = Math.max(3.4, -2.7 + (THOTTIL_W * 0.95) / (2 * Math.tan(halfFov) * camera.aspect))
    mouse.sx += (mouse.x - mouse.sx) * 0.04
    mouse.sy += (mouse.y - mouse.sy) * 0.04
    const idle = 1 - clamp01(p * 4)
    camera.position.set(
      mouse.sx * 0.7 * idle + Math.sin(t * 0.35) * 0.12 * idle,
      0.9 - mouse.sy * 0.35 * idle + Math.sin(t * 0.5) * 0.06 * idle,
      lerp(z0, zEnd, move),
    )
    camera.lookAt(look)
    inner.intensity = 14 + door * 60
    glow.material.opacity = 0.55 + door * 0.35
    glow.scale.setScalar(1 + door * 0.3)
    renderer.toneMappingExposure = 0.95 + clamp01((p - 0.78) / 0.22) * 1.5

    thottil.rotation.z = Math.sin(t * 1.1) * 0.018
    thottil.position.y = 0.55 + Math.sin(t * 0.9) * 0.04
    bells.forEach((b) => (b.g.rotation.z = Math.sin(t * 1.9 + b.ph) * 0.12))
    bangleGroups.forEach((b) => (b.g.rotation.z = Math.sin(t * 1.2 + b.ph) * 0.04))
    toran.forEach((l) => (l.mesh.rotation.z = l.base + Math.sin(t * 1.3 + l.ph) * 0.07))
    trees.forEach((tr) => (tr.crown.rotation.z = Math.sin(t * 0.8 + tr.ph) * 0.03))
    flames.forEach((d) => {
      const f = 0.88 + Math.sin(t * 9 + d.ph) * 0.07 + Math.sin(t * 17 + d.ph * 2) * 0.05
      if (d.f) {
        d.f.scale.set(d.w * (1.05 - (f - 0.88) * 0.8), d.h * f, 1)
        d.f.position.x += (Math.sin(t * 5 + d.ph) * 0.004 - (d.f.position.x - Math.round(d.f.position.x * 1000) / 1000) * 0)
        d.hl.scale.setScalar(d.hs * (0.9 + f * 0.15))
      }
      if (d.light) d.light.intensity = 7 + f * 4
    })
    for (let i = 0; i < fl.length; i++) {
      const q = fl[i]
      q.y -= q.v
      if (q.y < FLOOR_Y + 0.05) q.y = FLOOR_Y + 9
      dummy.position.set(q.x + Math.sin(t * 0.6 + q.ph) * 0.35, q.y, q.z)
      dummy.rotation.set(t * 0.8 + q.ph, t * 0.5 + q.ph, t * 0.4)
      dummy.scale.setScalar(q.s)
      dummy.updateMatrix()
      fall.setMatrixAt(i, dummy.matrix)
    }
    fall.instanceMatrix.needsUpdate = true
    const arr = dustGeo.attributes.position.array
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += 0.004 + (i % 5) * 0.0012
      arr[i * 3] += Math.sin(t * 0.4 + i) * 0.0016
      if (arr[i * 3 + 1] > FLOOR_Y + 10) arr[i * 3 + 1] = FLOOR_Y
    }
    dustGeo.attributes.position.needsUpdate = true

    finish.uniforms.time.value = t
    composer.render(dt)
    if (openStart) {
      onProg?.(p)
      if (p >= 1 && !finished) { finished = true; onEnd?.() }
    }
  }
  frame()

  function dispose() {
    running = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    window.removeEventListener('pointermove', onMove)
    scene.traverse((o) => {
      o.geometry?.dispose?.()
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
      mats.forEach((m) => { ;['map', 'bumpMap', 'alphaMap'].forEach((k) => m[k]?.dispose?.()); m.dispose?.() })
    })
    orangeGeo.dispose()
    yellowGeo.dispose()
    composer.dispose?.()
    rt.dispose()
    envTex.dispose()
    pmrem.dispose()
    renderer.dispose()
    el.remove()
  }

  return { open, dispose }
}
