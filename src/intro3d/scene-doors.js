// 3D "baby shower" entrance, rendered with three.js. Everything is procedural (no model or
// texture files). Realism comes from: bevelled geometry that catches light, physically based
// materials, soft shadows, a glossy tile floor, multisampled anti-aliasing, vignette + film grain, architectural detail (pilasters, cornice, steps, mouldings, hinges)
// and balloons tied to gift boxes.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

let seed = 11
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a, b, t) => a + (b - a) * t

const DW = 2.05 // width of one door leaf
const DH = 6.2 // door height
const DT = 0.2 // door thickness
const FLOOR_Y = -DH / 2
const PASTEL = [0xff8fb8, 0x7cc4f5, 0xffe27a, 0x8ee3c4, 0xc9a7ff]

// bevelled box: the rounded edge catches highlights, which is a big part of looking "real"
const rgeo = (w, h, d, r = 0.03) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001))

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function flower(g, x, y, r, petal, center, n = 6) {
  g.fillStyle = petal
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    g.beginPath()
    g.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, 0, Math.PI * 2)
    g.fill()
  }
  g.fillStyle = center
  g.beginPath()
  g.arc(x, y, r * 0.38, 0, Math.PI * 2)
  g.fill()
}

// Painted plaster wall with a stencilled flower pattern + mottled paint
function wallCanvases() {
  const [c, g] = canvas(512, 512)
  const bg = g.createLinearGradient(0, 0, 0, 512)
  bg.addColorStop(0, '#f6dcb6')
  bg.addColorStop(1, '#f1c9b4')
  g.fillStyle = bg
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 90; i++) {
    const x = rnd() * 512, y = rnd() * 512, r = 30 + rnd() * 90
    const m = g.createRadialGradient(x, y, 0, x, y, r)
    const light = rnd() < 0.5
    m.addColorStop(0, light ? 'rgba(255,255,255,.08)' : 'rgba(120,70,40,.07)')
    m.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = m
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  const cols = [['#f5859f', '#ffe27a'], ['#6fb4e6', '#fff'], ['#f7c948', '#f5859f'], ['#7fd1ae', '#fff'], ['#b898ee', '#ffe27a']]
  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      const x = 64 + gx * 128 + (gy % 2) * 40 - 20
      const y = 64 + gy * 128
      const [p, ctr] = cols[(gx + gy * 2) % cols.length]
      g.fillStyle = '#5fb985'
      for (const a of [-0.9, 0.9, 2.4, -2.4]) {
        g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(34, 0, 20, 8, 0, 0, Math.PI * 2); g.fill(); g.restore()
      }
      flower(g, x, y, 24, p, ctr)
    }
  }
  const [b, k] = canvas(256, 256)
  k.fillStyle = '#808080'
  k.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 9000; i++) { k.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${rnd() * 0.13})`; k.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2) }
  return { color: c, bump: b }
}

// Polished cream & peach tiles with dark grout and subtle veining
function floorCanvas() {
  const [c, g] = canvas(512, 512)
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const gr = g.createLinearGradient(x * 128, y * 128, x * 128 + 128, y * 128 + 128)
    const a = (x + y) % 2
    gr.addColorStop(0, a ? '#f9d9c5' : '#fff3df')
    gr.addColorStop(1, a ? '#f3cbb4' : '#f6e4c9')
    g.fillStyle = gr
    g.fillRect(x * 128, y * 128, 128, 128)
    g.strokeStyle = 'rgba(150,100,70,.16)'
    g.lineWidth = 1.2
    for (let v = 0; v < 3; v++) {
      g.beginPath()
      g.moveTo(x * 128 + rnd() * 128, y * 128)
      g.bezierCurveTo(x * 128 + rnd() * 128, y * 128 + 40, x * 128 + rnd() * 128, y * 128 + 90, x * 128 + rnd() * 128, y * 128 + 128)
      g.stroke()
    }
  }
  g.strokeStyle = 'rgba(95,60,40,.7)'
  g.lineWidth = 3
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke() }
  return c
}

// Painted door leaf: colour map (paint over faint wood grain, worn edges) + bump map for the carving
function doorCanvases(pal) {
  const CW = 512, CH = 1536
  const ux = CW / DW, uy = CH / DH
  const [c, g] = canvas(CW, CH)
  const [b, k] = canvas(CW, CH)
  const bg = g.createLinearGradient(0, 0, 0, CH)
  bg.addColorStop(0, pal.base1)
  bg.addColorStop(1, pal.base2)
  g.fillStyle = bg
  g.fillRect(0, 0, CW, CH)
  // wood grain showing faintly through the paint
  for (let i = 0; i < 320; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '80,30,20' : '255,255,255'},${rnd() * 0.08})`; g.fillRect(rnd() * CW, 0, 0.6 + rnd() * 1.8, CH) }
  for (let i = 0; i < 30; i++) {
    g.strokeStyle = `rgba(70,25,15,${0.05 + rnd() * 0.06})`
    g.lineWidth = 1
    g.beginPath()
    const x0 = rnd() * CW, amp = 3 + rnd() * 9, f = 0.004 + rnd() * 0.008
    for (let y = 0; y <= CH; y += 24) { const x = x0 + Math.sin(y * f + i) * amp; y === 0 ? g.moveTo(x, y) : g.lineTo(x, y) }
    g.stroke()
  }
  k.fillStyle = '#303030'
  k.fillRect(0, 0, CW, CH)
  for (let i = 0; i < 200; i++) { k.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${rnd() * 0.12})`; k.fillRect(rnd() * CW, 0, 0.6 + rnd() * 1.6, CH) }
  g.strokeStyle = pal.gold; g.lineWidth = 9; g.strokeRect(8, 8, CW - 16, CH - 16)
  k.strokeStyle = '#fff'; k.lineWidth = 9; k.strokeRect(8, 8, CW - 16, CH - 16)

  const m = 0.14, pw = (DW - 3 * m) / 2, ph = (DH - 0.8) / 3
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 3; row++) {
      const x0 = (m + col * (pw + m)) * ux
      const w = pw * ux
      const h = ph * uy
      const y0 = CH - (0.2 + row * (ph + 0.2) + ph) * uy
      const cx = x0 + w / 2, cy = y0 + h / 2
      const path = (ctx, inset) => { ctx.beginPath(); ctx.roundRect(x0 + inset, y0 + inset, w - 2 * inset, h - 2 * inset, 22 - inset) }
      const pg = g.createLinearGradient(x0, y0, x0 + w, y0 + h)
      pg.addColorStop(0, pal.panel)
      pg.addColorStop(1, pal.panel2)
      path(g, 0); g.fillStyle = pg; g.fill()
      g.lineWidth = 4; g.strokeStyle = 'rgba(60,20,20,.35)'; g.stroke()
      path(g, 16); g.lineWidth = 3; g.strokeStyle = pal.accent; g.stroke()
      path(k, 0); k.fillStyle = '#5a5a5a'; k.fill(); k.lineWidth = 7; k.strokeStyle = '#fff'; k.stroke()
      path(k, 16); k.lineWidth = 4; k.strokeStyle = '#cfcfcf'; k.stroke()
      const R = w * 0.4
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2
        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * 1.1
        g.fillStyle = i % 2 ? pal.accent : pal.gold
        g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill()
        k.fillStyle = '#fff'; k.beginPath(); k.arc(px, py, 6, 0, Math.PI * 2); k.fill()
      }
      for (const [fx, fy] of [[x0 + 38, y0 + 38], [x0 + w - 38, y0 + 38], [x0 + 38, y0 + h - 38], [x0 + w - 38, y0 + h - 38]]) {
        flower(g, fx, fy, 14, pal.accent, pal.gold, 5)
        flower(k, fx, fy, 14, '#fff', '#fff', 5)
      }
    }
  }
  // worn, slightly darker edges like real painted wood
  const edge = g.createLinearGradient(0, 0, CW, 0)
  edge.addColorStop(0, 'rgba(60,20,10,.28)')
  edge.addColorStop(0.06, 'rgba(60,20,10,0)')
  edge.addColorStop(0.94, 'rgba(60,20,10,0)')
  edge.addColorStop(1, 'rgba(60,20,10,.28)')
  g.fillStyle = edge
  g.fillRect(0, 0, CW, CH)
  return { color: c, bump: b }
}

// A kolam / rangoli mandala for the floor in front of the door
function kolamCanvas() {
  const [c, g] = canvas(1024, 1024)
  g.translate(512, 512)
  const petal = (n, dist, rx, ry, fill) => {
    for (let k = 0; k < n; k++) {
      g.save()
      g.rotate((k / n) * Math.PI * 2)
      g.translate(dist, 0)
      g.beginPath()
      g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      g.fillStyle = fill
      g.fill()
      g.lineWidth = 3
      g.strokeStyle = 'rgba(255,255,255,.95)'
      g.stroke()
      g.restore()
    }
  }
  g.beginPath()
  g.arc(0, 0, 492, 0, Math.PI * 2)
  g.fillStyle = 'rgba(255,255,255,.5)'
  g.fill()
  g.lineWidth = 7
  g.strokeStyle = '#d4a02a'
  g.stroke()
  for (let k = 0; k < 56; k++) {
    const a = (k / 56) * Math.PI * 2
    g.beginPath()
    g.arc(Math.cos(a) * 455, Math.sin(a) * 455, 6, 0, Math.PI * 2)
    g.fillStyle = k % 2 ? '#f0508a' : '#3f98d8'
    g.fill()
  }
  petal(28, 345, 78, 26, 'rgba(250,190,30,.96)')
  petal(20, 240, 66, 30, 'rgba(240,90,150,.96)')
  petal(12, 140, 56, 28, 'rgba(50,160,220,.96)')
  petal(8, 62, 30, 15, 'rgba(255,255,255,.96)')
  g.beginPath()
  g.arc(0, 0, 26, 0, Math.PI * 2)
  g.fillStyle = '#ff9f1c'
  g.fill()
  g.lineWidth = 3
  g.strokeStyle = '#fff'
  g.stroke()
  return c
}

function leafCanvas() {
  const [c, g] = canvas(64, 128)
  const grad = g.createLinearGradient(0, 0, 64, 0)
  grad.addColorStop(0, '#1b7d44')
  grad.addColorStop(0.5, '#3fb36e')
  grad.addColorStop(1, '#176f3a')
  g.fillStyle = grad
  g.beginPath()
  g.moveTo(32, 2)
  g.bezierCurveTo(70, 34, 66, 92, 32, 126)
  g.bezierCurveTo(-2, 92, -6, 34, 32, 2)
  g.fill()
  g.strokeStyle = 'rgba(10,70,30,.8)'
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(32, 4)
  g.lineTo(32, 124)
  g.stroke()
  g.lineWidth = 1
  for (let y = 20; y < 110; y += 14) {
    g.beginPath()
    g.moveTo(32, y); g.lineTo(52, y + 12)
    g.moveTo(32, y); g.lineTo(12, y + 12)
    g.stroke()
  }
  return c
}

function glowCanvas() {
  const [c, g] = canvas(256, 256)
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  r.addColorStop(0, 'rgba(255,245,205,1)')
  r.addColorStop(0.35, 'rgba(255,205,110,.55)')
  r.addColorStop(1, 'rgba(255,180,70,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 256, 256)
  return c
}

export function createDoorScene(container) {
  const hq = new URLSearchParams(window.location.search).has('hq') // force full quality (testing)
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
  scene.background = new THREE.Color(0xf3e1ec)
  scene.fog = new THREE.FogExp2(0xf3e1ec, 0.005)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.4

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80)

  // ---------- textures & materials ----------
  const tex = (cnv, repeat, srgb = true) => {
    const t = new THREE.CanvasTexture(cnv)
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = aniso
    if (repeat) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(repeat[0], repeat[1])
    }
    return t
  }
  const brass = new THREE.MeshStandardMaterial({ color: 0xf0b83a, metalness: 1, roughness: 0.22, envMapIntensity: 1.8 })
  const gilt = new THREE.MeshStandardMaterial({ color: 0xe6b440, metalness: 0.6, roughness: 0.34 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x139a9d, roughness: 0.34, metalness: 0.05, clearcoat: 0 })
  const creamPaint = new THREE.MeshStandardMaterial({ color: 0xfff0d6, roughness: 0.55 })
  const marble = new THREE.MeshStandardMaterial({ color: 0xfbeedd, roughness: 0.28, metalness: 0.04 })
  const wallCnv = wallCanvases()
  const wallFor = (w, h) =>
    new THREE.MeshStandardMaterial({
      map: tex(wallCnv.color, [w / 4.5, h / 4.5]),
      bumpMap: tex(wallCnv.bump, [w / 2.2, h / 2.2], false),
      bumpScale: 1.4,
      roughness: 0.92,
    })

  // ---------- helpers ----------
  const add = (geo, mat, x, y, z, shadow = true, receive = true) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.castShadow = shadow
    m.receiveShadow = receive
    scene.add(m)
    return m
  }
  const addBox = (w, h, d, mat, x, y, z, r = 0.03) => add(rgeo(w, h, d, r), mat, x, y, z)

  // ---------- wall, pilasters, frame ----------
  const wallD = 0.5
  const jamb = 0.45
  const wallSide = 9
  const wallH = 16
  const sideX = DW + jamb + wallSide / 2
  const wallY = FLOOR_Y + wallH / 2
  addBox(wallSide, wallH, wallD, wallFor(wallSide, wallH), -sideX, wallY, -0.2, 0.01)
  addBox(wallSide, wallH, wallD, wallFor(wallSide, wallH), sideX, wallY, -0.2, 0.01)
  const topH = wallH - DH - 0.55
  addBox(2 * (DW + jamb), topH, wallD, wallFor(2 * (DW + jamb), topH), 0, FLOOR_Y + DH + 0.55 + topH / 2, -0.2, 0.01)

  // skirting boards
  for (const s of [-1, 1]) addBox(wallSide, 0.5, 0.12, frameMat, s * sideX, FLOOR_Y + 0.25, 0.1, 0.03)

  // cream pilasters with gilded flutes, base and capital, either side of the entrance
  const pilH = DH + 1.9
  for (const s of [-1, 1]) {
    const px = s * (DW + jamb + 0.62)
    addBox(0.62, pilH, 0.42, creamPaint, px, FLOOR_Y + pilH / 2, 0.2, 0.05)
    for (const f of [-0.18, -0.06, 0.06, 0.18]) addBox(0.035, pilH - 1.0, 0.03, gilt, px + f, FLOOR_Y + pilH / 2, 0.42, 0.01)
    addBox(0.86, 0.3, 0.6, creamPaint, px, FLOOR_Y + 0.15, 0.2, 0.05)
    addBox(0.9, 0.34, 0.62, creamPaint, px, FLOOR_Y + pilH + 0.0, 0.2, 0.06)
    addBox(0.96, 0.07, 0.68, brass, px, FLOOR_Y + pilH + 0.2, 0.2, 0.02)
  }

  // teal painted jambs + lintel, brass inlay, stepped cornice with dentils
  const H2 = DH + 0.55
  addBox(jamb, H2, 0.62, frameMat, -(DW + jamb / 2), FLOOR_Y + H2 / 2, 0.02, 0.04)
  addBox(jamb, H2, 0.62, frameMat, DW + jamb / 2, FLOOR_Y + H2 / 2, 0.02, 0.04)
  addBox(2 * (DW + jamb), 0.55, 0.62, frameMat, 0, FLOOR_Y + DH + 0.275, 0.02, 0.04)
  for (const s of [-1, 1]) {
    addBox(0.06, H2, 0.05, brass, s * (DW + jamb - 0.04), FLOOR_Y + H2 / 2, 0.35, 0.015)
    addBox(0.06, H2, 0.05, brass, s * (DW + 0.04), FLOOR_Y + H2 / 2, 0.35, 0.015)
  }
  addBox(2 * (DW + jamb), 0.06, 0.05, brass, 0, FLOOR_Y + DH + 0.5, 0.35, 0.015)
  const dentilY = FLOOR_Y + DH + 0.62
  for (let x = -(DW + jamb) + 0.1; x <= DW + jamb - 0.05; x += 0.27) addBox(0.15, 0.13, 0.16, creamPaint, x, dentilY, 0.5, 0.02)
  addBox(2 * (DW + jamb) + 0.5, 0.2, 0.85, frameMat, 0, FLOOR_Y + DH + 0.78, 0.1, 0.04)
  addBox(2 * (DW + jamb) + 0.7, 0.07, 0.95, brass, 0, FLOOR_Y + DH + 0.92, 0.12, 0.02)

  // marble threshold and two steps
  addBox(2 * (DW + jamb) + 0.4, 0.2, 0.55, marble, 0, FLOOR_Y + 0.1, 0.38, 0.05)
  addBox(2 * (DW + jamb) + 1.4, 0.12, 0.7, marble, 0, FLOOR_Y + 0.06, 0.95, 0.04)

  // festive string lights that blink along the frame
  const bulbGeo = new THREE.SphereGeometry(0.075, 14, 12)
  const bulbMats = PASTEL.map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2, roughness: 0.25 }))
  let bi = 0
  const bulb = (x, y) => {
    const b = new THREE.Mesh(bulbGeo, bulbMats[bi++ % bulbMats.length])
    b.position.set(x, y, 0.37)
    scene.add(b)
  }
  for (const s of [-1, 1]) for (let y = FLOOR_Y + 0.55; y < FLOOR_Y + DH + 0.4; y += 0.46) bulb(s * (DW + jamb / 2), y)
  for (let x = -DW + 0.2; x <= DW - 0.2; x += 0.46) bulb(x, FLOOR_Y + DH + 0.275)

  // ---------- door leaves: pink (left) and blue (right) ----------
  const pals = {
    '-1': { base1: '#ff8fb8', base2: '#e8598f', panel: '#ffcadd', panel2: '#ffaecb', accent: '#c92d78', gold: '#e0a526', lotus: [0xffe9f2, 0xffb3d0, 0xff4f92] },
    1: { base1: '#6cb9f2', base2: '#3a88dc', panel: '#c6e4ff', panel2: '#a4d0f7', accent: '#1f6fc2', gold: '#e0a526', lotus: [0xe8f5ff, 0xa9d4f7, 0x2f8ae0] },
  }
  const leaves = []
  const studGeo = new THREE.SphereGeometry(0.05, 16, 12)
  const petalGeo = new THREE.SphereGeometry(0.1, 16, 12)
  function lotus(parent, x, y, s, cols) {
    const g = new THREE.Group()
    g.position.set(x, y, DT / 2 + 0.07)
    const mats = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.38 }))
    const rings = [[14, 0.27, 2.0, 0.8], [10, 0.17, 1.6, 0.7], [7, 0.09, 1.2, 0.6]]
    rings.forEach(([n, r, sx, sy], ri) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ri * 0.2
        const p = new THREE.Mesh(petalGeo, mats[ri])
        p.position.set(Math.cos(a) * r * s, Math.sin(a) * r * s, ri * 0.035)
        p.rotation.z = a
        p.scale.set(sx * s, sy * s, 0.5 * s)
        p.castShadow = true
        g.add(p)
      }
    })
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.075 * s, 18, 14), brass)
    boss.position.z = 0.1 * s
    boss.scale.z = 0.8
    boss.castShadow = true
    g.add(boss)
    parent.add(g)
  }
  function buildLeaf(side) {
    const pal = pals[side]
    const { color, bump } = doorCanvases(pal)
    const mat = new THREE.MeshStandardMaterial({ map: tex(color), bumpMap: tex(bump, null, false), bumpScale: 6, roughness: 0.4, metalness: 0.02 })
    const pivot = new THREE.Group()
    pivot.position.set(side * DW, 0, 0)
    const leaf = new THREE.Group()
    leaf.position.x = -side * (DW / 2)
    pivot.add(leaf)

    const slab = new THREE.Mesh(rgeo(DW, DH, DT, 0.025), mat)
    slab.castShadow = slab.receiveShadow = true
    leaf.add(slab)

    const m = 0.14
    const pw = (DW - 3 * m) / 2
    const ph = (DH - 4 * 0.2) / 3
    const t = 0.05
    const railGeo = (w, h) => rgeo(w, h, 0.05, 0.015)
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 3; row++) {
        const x = -DW / 2 + m + pw / 2 + col * (pw + m)
        const y = -DH / 2 + 0.2 + ph / 2 + row * (ph + 0.2)
        // gilded moulding around each panel
        for (const [w, h, dx, dy] of [[pw, t, 0, ph / 2 - t / 2], [pw, t, 0, -ph / 2 + t / 2], [t, ph, -pw / 2 + t / 2, 0], [t, ph, pw / 2 - t / 2, 0]]) {
          const r = new THREE.Mesh(railGeo(w, h), gilt)
          r.position.set(x + dx, y + dy, DT / 2 + 0.02)
          r.castShadow = true
          leaf.add(r)
        }
        lotus(leaf, x, y, row === 1 ? 1.15 : 0.9, pal.lotus)
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            const st = new THREE.Mesh(studGeo, brass)
            st.position.set(x + sx * (pw / 2 - 0.13), y + sy * (ph / 2 - 0.13), DT / 2 + 0.05)
            st.scale.z = 0.55
            st.castShadow = true
            leaf.add(st)
          }
        }
      }
    }
    for (const y of [-1.0, 1.0]) {
      const band = new THREE.Mesh(rgeo(DW, 0.13, 0.06, 0.02), brass)
      band.position.set(0, y, DT / 2 + 0.035)
      band.castShadow = true
      leaf.add(band)
    }
    const strip = new THREE.Mesh(rgeo(0.09, DH, 0.08, 0.02), brass)
    strip.position.set(-side * (DW / 2 - 0.045), 0, DT / 2 + 0.045)
    strip.castShadow = true
    leaf.add(strip)
    // strap hinges + knuckles on the hinge edge
    for (const hy of [-2.45, 0, 2.45]) {
      const hinge = new THREE.Mesh(rgeo(0.95, 0.17, 0.05, 0.02), brass)
      hinge.position.set(side * (DW / 2 - 0.5), hy, DT / 2 + 0.04)
      hinge.castShadow = true
      leaf.add(hinge)
      for (const dx of [-0.3, 0, 0.3]) {
        const hs = new THREE.Mesh(studGeo, brass)
        hs.position.set(side * (DW / 2 - 0.5) + dx, hy, DT / 2 + 0.075)
        hs.scale.set(0.8, 0.8, 0.5)
        leaf.add(hs)
      }
      const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.32, 18), brass)
      knuckle.position.set(side * (DW / 2), hy, 0)
      knuckle.castShadow = true
      leaf.add(knuckle)
    }
    // ring pull on a brass boss
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 28), brass)
    plate.rotation.x = Math.PI / 2
    plate.position.set(-side * (DW / 2 - 0.22), -0.02, DT / 2 + 0.12)
    plate.castShadow = true
    leaf.add(plate)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 16, 40), brass)
    ring.position.set(-side * (DW / 2 - 0.22), -0.13, DT / 2 + 0.17)
    ring.castShadow = true
    leaf.add(ring)

    scene.add(pivot)
    leaves.push({ pivot, side })
  }
  buildLeaf(-1)
  buildLeaf(1)

  // ---------- floor: glossy tiles over a mirror, kolam and petals ----------
  // polished tiles: low roughness + environment reflections give the glossy look
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ map: tex(floorCanvas(), [9, 9]), roughness: 0.2, metalness: 0.06, envMapIntensity: 1.3 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  floor.receiveShadow = true
  scene.add(floor)
  const kolam = new THREE.Mesh(
    new THREE.PlaneGeometry(8.4, 8.4),
    new THREE.MeshStandardMaterial({ map: tex(kolamCanvas()), transparent: true, roughness: 0.5 }),
  )
  kolam.rotation.x = -Math.PI / 2
  kolam.position.set(0, FLOOR_Y + 0.012, 5.2)
  kolam.receiveShadow = true
  scene.add(kolam)
  const petalFloor = new THREE.PlaneGeometry(0.2, 0.3)
  petalFloor.rotateX(-Math.PI / 2)
  const petals = new THREE.InstancedMesh(petalFloor, new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide }), 50)
  const pc = [0xf4b315, 0xff9f1c, 0xffd23f, 0xe0457b, 0xff8fb8]
  const dummy = new THREE.Object3D()
  for (let i = 0; i < 50; i++) {
    const a = rnd() * Math.PI * 2
    const r = 2.2 + rnd() * 4.6
    dummy.position.set(Math.cos(a) * r * 0.85, FLOOR_Y + 0.02 + rnd() * 0.03, 5.2 + Math.sin(a) * r * 0.7)
    dummy.rotation.set(0, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.3)
    dummy.scale.setScalar(0.7 + rnd() * 0.7)
    dummy.updateMatrix()
    petals.setMatrixAt(i, dummy.matrix)
    petals.setColorAt(i, new THREE.Color(pc[i % pc.length]))
  }
  scene.add(petals)

  // ---------- mango-leaf & marigold toran ----------
  const leafMat = new THREE.MeshStandardMaterial({ map: tex(leafCanvas()), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 })
  const leafGeo = new THREE.PlaneGeometry(0.3, 0.62)
  leafGeo.translate(0, -0.31, 0)
  const toranY = FLOOR_Y + DH + 0.38
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-DW - 0.25, toranY, 0.62),
    new THREE.Vector3(0, toranY - 0.9, 0.7),
    new THREE.Vector3(DW + 0.25, toranY, 0.62),
  )
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.022, 6, false), new THREE.MeshStandardMaterial({ color: 0x8a5a1a, roughness: 0.8 })))
  const toran = []
  const LEAVES = 23
  for (let i = 0; i < LEAVES; i++) {
    const t = (i + 0.5) / LEAVES
    const l = new THREE.Mesh(leafGeo, leafMat)
    l.position.copy(curve.getPoint(t))
    l.position.z += (i % 2) * 0.03
    const sc = 0.85 + rnd() * 0.3
    l.scale.set(sc, sc, 1)
    l.castShadow = true
    scene.add(l)
    toran.push({ mesh: l, base: (rnd() - 0.5) * 0.12, ph: rnd() * 6 })
  }
  const marigold = new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 14, 10), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 76)
  for (let i = 0; i < 76; i++) {
    const p = curve.getPoint((i + 0.5) / 76)
    dummy.position.set(p.x, p.y + 0.012 + rnd() * 0.02, p.z + 0.03 + (i % 2) * 0.04)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.setScalar(0.8 + rnd() * 0.45)
    dummy.updateMatrix()
    marigold.setMatrixAt(i, dummy.matrix)
    marigold.setColorAt(i, new THREE.Color(i % 9 === 0 ? 0xff7a9c : i % 2 ? 0xffa81a : 0xffc93d))
  }
  scene.add(marigold)

  // ---------- pastel bunting ----------
  const buntY = FLOOR_Y + DH + 2.1
  const buntCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-6.6, buntY, 0.3),
    new THREE.Vector3(0, buntY - 1.1, 0.35),
    new THREE.Vector3(6.6, buntY, 0.3),
  )
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(buntCurve, 50, 0.02, 6, false), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })))
  const flagGeo = new THREE.BufferGeometry()
  flagGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.27, 0, 0, 0.27, 0, 0, 0, -0.7, 0]), 3))
  flagGeo.computeVertexNormals()
  const flags = []
  for (let i = 0; i < 19; i++) {
    const f = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: PASTEL[i % PASTEL.length], side: THREE.DoubleSide, roughness: 0.85 }))
    f.position.copy(buntCurve.getPoint((i + 0.5) / 19))
    f.castShadow = true
    scene.add(f)
    flags.push({ mesh: f, ph: rnd() * 6 })
  }

  // ---------- gift boxes with helium balloons tied on ----------
  function giftBox(x, z, color, ribbon) {
    const g = new THREE.Group()
    g.position.set(x, FLOOR_Y + 0.3, z)
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.45 })
    const rmat = new THREE.MeshStandardMaterial({ color: ribbon, roughness: 0.3, metalness: 0.2 })
    const box = new THREE.Mesh(rgeo(0.7, 0.6, 0.7, 0.04), mat)
    box.castShadow = box.receiveShadow = true
    g.add(box)
    for (const [w, d] of [[0.74, 0.12], [0.12, 0.74]]) {
      const r = new THREE.Mesh(rgeo(w, 0.62, d, 0.015), rmat)
      r.castShadow = true
      g.add(r)
    }
    for (const sgn of [-1, 1]) {
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 10, 24), rmat)
      bow.position.set(sgn * 0.1, 0.38, 0)
      bow.rotation.y = Math.PI / 2
      bow.rotation.z = sgn * 0.5
      bow.castShadow = true
      g.add(bow)
    }
    scene.add(g)
    return new THREE.Vector3(x, FLOOR_Y + 0.62, z)
  }
  const anchors = {
    L: giftBox(-3.9, 1.5, 0xf58fb4, 0xffe27a),
    R: giftBox(3.9, 1.5, 0x7cc4f5, 0xfff3c4),
  }
  const balloons = []
  const knotGeo = new THREE.ConeGeometry(0.06, 0.12, 12)
  const spec = [
    [-4.1, 0.9, 1.0, 0xff8fb8, 'L'], [-3.4, 2.6, 0.9, 0x7cc4f5, 'L'], [-4.5, -0.7, 0.8, 0xffe27a, 'L'], [-3.3, 0.2, 1.5, 0x8ee3c4, 'L'],
    [4.1, 1.1, 1.0, 0x7cc4f5, 'R'], [3.4, 2.7, 0.9, 0xff8fb8, 'R'], [4.5, -0.6, 0.8, 0xc9a7ff, 'R'], [3.3, 0.3, 1.5, 0xffe27a, 'R'],
  ]
  for (const [x, y, z, col, a] of spec) {
    const g = new THREE.Group()
    g.position.set(x, y, z)
    const mat = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 1.4 })
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.44, 36, 28), mat)
    body.scale.set(1, 1.17, 1)
    body.castShadow = true
    g.add(body)
    const knot = new THREE.Mesh(knotGeo, mat)
    knot.position.y = -0.55
    knot.rotation.x = Math.PI
    g.add(knot)
    scene.add(g)
    const pts = new Float32Array(12)
    const sg = new THREE.BufferGeometry()
    sg.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    const line = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }))
    line.frustumCulled = false
    scene.add(line)
    balloons.push({ g, y0: y, ph: rnd() * 6, anchor: anchors[a], line, pts })
  }

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xfff3e2, 0xe9c2b4, 0.5))
  const key = new THREE.SpotLight(0xffeccc, 200, 0, 0.62, 0.9, 2)
  key.position.set(3.5, 7.5, 10)
  key.target.position.set(0, 0, 0)
  key.castShadow = true
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048)
  key.shadow.bias = -0.0004
  key.shadow.radius = 4
  scene.add(key, key.target)
  const fill = new THREE.DirectionalLight(0xb9c8ff, 0.35)
  fill.position.set(-6, 3, 6)
  scene.add(fill)

  const glowT = tex(glowCanvas())
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), new THREE.MeshBasicMaterial({ color: 0x80593a }))
  backdrop.position.set(0, 0, -2.5)
  scene.add(backdrop)
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 14),
    new THREE.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  )
  glow.position.set(0, 0.3, -2.3)
  scene.add(glow)
  const inner = new THREE.PointLight(0xffe0a0, 0, 0, 2)
  inner.position.set(0, 0.5, -1.0)
  scene.add(inner)

  // diyas
  const diyas = []
  const bowlPts = []
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2)
    bowlPts.push(new THREE.Vector2(Math.sin(a) * 0.3 + 0.001, 0.14 - Math.cos(a) * 0.14))
  }
  const bowlGeo = new THREE.LatheGeometry(bowlPts, 28)
  const spriteMat = new THREE.SpriteMaterial({ map: glowT, color: 0xffb347, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 })
  for (const x of [-2.9, 2.9, -1.4, 1.4]) {
    const g = new THREE.Group()
    g.position.set(x, FLOOR_Y + 0.02, x > 2 || x < -2 ? 2.4 : 2.9)
    const bowl = new THREE.Mesh(bowlGeo, brass)
    bowl.castShadow = true
    g.add(bowl)
    const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.83, 0.42).multiplyScalar(2.4) })
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), flameMat)
    flame.scale.set(0.8, 1.9, 0.8)
    flame.position.y = 0.26
    g.add(flame)
    const halo = new THREE.Sprite(spriteMat)
    halo.scale.setScalar(0.9)
    halo.position.y = 0.3
    g.add(halo)
    const light = new THREE.PointLight(0xff9a3c, 6, 7, 2)
    light.position.y = 0.4
    g.add(light)
    scene.add(g)
    diyas.push({ flame, halo, light, ph: rnd() * 10 })
  }

  // drifting multicolour sparkles
  const N = small ? 90 : 170
  const pos = new Float32Array(N * 3)
  const cols = new Float32Array(N * 3)
  const tmp = new THREE.Color()
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (rnd() - 0.5) * 12
    pos[i * 3 + 1] = FLOOR_Y + rnd() * 10
    pos[i * 3 + 2] = -1 + rnd() * 10
    tmp.setHex(PASTEL[i % PASTEL.length])
    cols.set([tmp.r, tmp.g, tmp.b], i * 3)
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  dustGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3))
  scene.add(
    new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowT, size: 0.2, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false })),
  )

  // ---------- post-processing: bloom on lamps/bulbs, vignette, film grain ----------
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
        // colour grade: richer saturation + a touch more contrast (same hues, just more vibrant)
        float luma = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        c.rgb = mix(vec3(luma), c.rgb, 1.5);
        c.rgb = (c.rgb - 0.5) * 1.12 + 0.5;
        c.rgb = clamp(c.rgb, 0.0, 1.0);
        vec2 d = vUv - 0.5;
        float v = smoothstep(0.95, 0.28, length(d * vec2(1.0, 1.12)));
        c.rgb *= mix(0.72, 1.0, v);
        c.rgb += (rand(vUv * 900.0 + fract(time)) - 0.5) * 0.028;
        gl_FragColor = c;
      }`,
  })
  composer.addPass(finish)
  let lowQ = false

  // ---------- camera fitting, pointer parallax ----------
  let z0 = 12
  const look = new THREE.Vector3(0, 0.2, 0)
  function fit() {
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    composer.setPixelRatio(dpr)
    composer.setSize(w, h)
    camera.aspect = w / h
    const f = (camera.fov * Math.PI) / 180
    const needH = 11.4
    const needW = 8.4
    z0 = Math.max(needH / 2 / Math.tan(f / 2), needW / camera.aspect / 2 / Math.tan(f / 2))
    camera.updateProjectionMatrix()
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(container)
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  const onMove = (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1
  }
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
  const sp = new THREE.Vector3()
  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = clock.getDelta()
    const t = clock.elapsedTime
    // slow device? drop reflections/bloom and resolution so the entrance stays smooth
    if (!hq && !lowQ && ++frames > 24 && frames <= 84) {
      acc += dt
      if (frames === 84 && acc / 60 > 0.036) {
        lowQ = true
        dpr = 1
        fit()
      }
    }
    const p = openStart ? clamp01((performance.now() - openStart) / openDur) : 0

    const door = ease(clamp01((p - 0.04) / 0.74))
    const theta = door * 1.85
    leaves.forEach((l) => (l.pivot.rotation.y = -l.side * theta))
    const move = ease(clamp01(p / 0.94))
    const zEnd = 2.6
    mouse.sx += (mouse.x - mouse.sx) * 0.04
    mouse.sy += (mouse.y - mouse.sy) * 0.04
    const idleAmt = 1 - clamp01(p * 4)
    camera.position.set(
      mouse.sx * 0.7 * idleAmt + Math.sin(t * 0.35) * 0.12 * idleAmt,
      0.9 - mouse.sy * 0.35 * idleAmt + Math.sin(t * 0.5) * 0.06 * idleAmt,
      lerp(z0, zEnd, move),
    )
    camera.lookAt(look)
    inner.intensity = door * door * 70
    glow.material.opacity = 0.3 + door * 0.4
    glow.scale.setScalar(1 + door * 0.5)
    backdrop.material.color.setRGB(0.5 + door * 0.5, 0.35 + door * 0.5, 0.23 + door * 0.35)
    renderer.toneMappingExposure = 0.95 + clamp01((p - 0.78) / 0.22) * 1.4

    toran.forEach((l) => (l.mesh.rotation.z = l.base + Math.sin(t * 1.3 + l.ph) * 0.07))
    flags.forEach((f) => (f.mesh.rotation.z = Math.sin(t * 1.6 + f.ph) * 0.12))
    balloons.forEach((b) => {
      b.g.position.y = b.y0 + Math.sin(t * 0.9 + b.ph) * 0.1
      b.g.rotation.z = Math.sin(t * 0.7 + b.ph) * 0.06
      // string: from the gift box up to the balloon's knot, with a little sag and sway
      const bx = b.g.position.x, by = b.g.position.y - 0.62, bz = b.g.position.z
      const a = b.anchor
      const sw = Math.sin(t * 1.1 + b.ph) * 0.06
      b.pts.set([a.x, a.y, a.z, lerp(a.x, bx, 0.35) + sw, lerp(a.y, by, 0.35), lerp(a.z, bz, 0.35), lerp(a.x, bx, 0.7) - sw, lerp(a.y, by, 0.7), lerp(a.z, bz, 0.7), bx, by, bz])
      b.line.geometry.attributes.position.needsUpdate = true
    })
    bulbMats.forEach((m, i) => (m.emissiveIntensity = 0.6 + 1.2 * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.3))))
    diyas.forEach((d) => {
      const f = 0.85 + Math.sin(t * 9 + d.ph) * 0.08 + Math.sin(t * 17 + d.ph * 2) * 0.05
      d.flame.scale.set(0.8, 1.9 * f, 0.8)
      d.halo.scale.setScalar(0.8 + f * 0.25)
      d.light.intensity = 5 + f * 3
    })
    const arr = dustGeo.attributes.position.array
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += 0.004 + (i % 5) * 0.0012
      arr[i * 3] += Math.sin(t * 0.4 + i) * 0.0016
      if (arr[i * 3 + 1] > FLOOR_Y + 10) arr[i * 3 + 1] = FLOOR_Y
    }
    dustGeo.attributes.position.needsUpdate = true

    finish.uniforms.time.value = t
    composer.render(dt) // always through the composer so the colour grade is applied on every device
    sp.set(0, 0, 0)
    if (openStart) {
      onProg?.(p)
      if (p >= 1 && !finished) {
        finished = true
        onEnd?.()
      }
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
      mats.forEach((m) => {
        ;['map', 'bumpMap'].forEach((k) => m[k]?.dispose?.())
        m.dispose?.()
      })
    })
    composer.dispose?.()
    rt.dispose()
    envTex.dispose()
    pmrem.dispose()
    renderer.dispose()
    el.remove()
  }

  return { open, dispose }
}
