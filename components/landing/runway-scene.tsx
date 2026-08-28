'use client'

/**
 * Fresco runway · scroll-driven 3D storytelling scene.
 *
 * Pure Three.js (no @react-three/fiber, no drei), mounted from hero-runway.tsx via a
 * dynamic `ssr: false` import so three never enters the initial landing bundle.
 *
 * Composition is owned by lib/landing/runway-framing.ts and enforced by its tests: the copy
 * scrim covers the left of the viewport and the overlay cards cover the right, so every
 * stage's subject is sized to 30–95% of frame height and biased into the lower band rather
 * than parked at dead centre behind the UI.
 *
 * The world, one continuous diorama:
 *   01 THE FIELD       golden-hour tomato farm            z ≈ +9 … -38
 *   02 THE SCAN        inspection pedestal, tomato read   z ≈ -40.5
 *   03 THE MARKET      market tables, gold signal         z ≈ -47
 *   ·· world pivot: warm ivory/clay → deep evergreen ··
 *   04 THE DELIVERY    truck drives in, crate lands,      z ≈ -84
 *                      payout resolves under the halo
 *
 * The delivery stage opens with the tracking sphere above the truck as it drives south down
 * the lane, then follows the case onto the dock and the receiver walking in to meet it · the
 * reference project's rotating 3D-sphere-of-items idea, translated into the diorama as a
 * wire globe of Fibonacci-distributed pins with depth-scaled, depth-faded pins and two live
 * tracking pins that follow the truck and the person.
 *
 * Every animation is driven by `band(p, start, end)` over the shared stage windows in
 * lib/landing/runway-progress.ts, so the world turns over on exactly the same progress
 * points as the DOM overlay.
 *
 * The canvas is decorative: aria-hidden, carrying no meaning not also in the overlay copy.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
  band,
  clamp01,
  lerp,
  PIVOT_END,
  PIVOT_START,
  ramp,
  smoothstep,
  stageBand,
} from '@/lib/landing/runway-progress'
import { CAMERA_TRACK, sampleTrack } from '@/lib/landing/runway-framing'
import {
  evaluateQuality,
  idleFrameSkip,
  initialQuality,
  pixelRatioFor,
  WATCHDOG_FIRST_WINDOW,
  WATCHDOG_WINDOW,
} from '@/lib/landing/quality'

export interface RunwaySceneProps {
  /** Returns the current runway progress (0..1). Read synchronously every frame inside
   *  the RAF loop — the caller owns smoothing (the scroll spring in the landing page, or a
   *  small lerp in the dev preview) so the 3D world is locked to the DOM overlay with zero
   *  extra latency. Kept behind a getter so it never causes React re-renders. */
  getProgress: () => number
  /** Called when WebGL is unavailable or the context is lost, so the runway can fall back. */
  onFailure?: () => void
  /**
   * Tone-mapping exposure. Defaults to the shipped value; the dev preview harness at
   * /dev/runway drives it live so it can be tuned without a rebuild.
   */
  exposure?: number
}

export const DEFAULT_EXPOSURE = 1.08

/* ------------------------------------------------------------------ capability */

type Tier = 0 | 1 | 2

interface TierBudget {
  tier: Tier
  terrainSegments: number
  detailSegments: number
  plants: number
  tomatoes: number
  crates: number
  slats: number
  coins: number
  maxPixelRatio: number
  antialias: boolean
  shadowMapSize: number
  useContactDecals: boolean
}

interface NavigatorCapabilities extends Navigator {
  deviceMemory?: number
}

/**
 * Detect software rasterisers (SwiftShader, llvmpipe, ...) so we never ship a 3D scene
 * that crawls at single-digit fps. Those devices go to the lowest budget.
 *
 * The probe context is created ONCE per page load (cached) and released immediately via
 * WEBGL_lose_context. Leaking a context per mount exhausted the browser's WebGL context
 * cap and caused "context loss and was blocked" errors on the real renderer.
 */
let softwareRendererCache: boolean | null = null

function detectSoftwareRenderer(): boolean {
  if (softwareRendererCache !== null) return softwareRendererCache
  let result = false
  try {
    const probe = document.createElement('canvas')
    const gl = (probe.getContext('webgl2') ||
      probe.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null
    if (!gl) {
      result = true
    } else {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      if (dbg) {
        const name = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).toLowerCase()
        result = /swiftshader|llvmpipe|softpipe|software/.test(name)
      }
      // Release the probe context so it never counts toward the browser's context cap.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    result = false
  }
  softwareRendererCache = result
  return result
}

function detectTier(): Tier {
  if (typeof navigator === 'undefined') return 0
  if (typeof window !== 'undefined' && detectSoftwareRenderer()) return 0
  const nav = navigator as NavigatorCapabilities
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  if (cores <= 4 || memory <= 4 || (coarse && cores <= 6)) return 0
  if (cores <= 8 || memory <= 8) return 1
  return 2
}

export function budgetFor(tier: Tier, safari: boolean): TierBudget {
  const budgets: Record<Tier, TierBudget> = {
    0: {
      tier: 0,
      terrainSegments: 40,
      detailSegments: 32,
      plants: 300,
      tomatoes: 1800,
      crates: 3,
      slats: 16,
      coins: 12,
      maxPixelRatio: 1.0,
      antialias: false,
      shadowMapSize: 0,
      useContactDecals: true,
    },
    1: {
      tier: 1,
      terrainSegments: 80,
      detailSegments: 72,
      plants: 600,
      tomatoes: 3600,
      crates: 5,
      slats: 32,
      coins: 24,
      maxPixelRatio: 1.25,
      antialias: true,
      shadowMapSize: 1024,
      useContactDecals: false,
    },
    2: {
      tier: 2,
      terrainSegments: 120,
      detailSegments: 112,
      plants: 1000,
      tomatoes: 6000,
      crates: 8,
      slats: 48,
      coins: 36,
      maxPixelRatio: 1.5,
      antialias: true,
      shadowMapSize: 2048,
      useContactDecals: false,
    },
  }
  const budget = budgets[tier]
  // Safari's WebGL implementation is markedly more fill-rate and shadow sensitive.
  return safari
    ? {
        ...budget,
        maxPixelRatio: Math.min(budget.maxPixelRatio, 1.35),
        antialias: false,
        shadowMapSize: Math.min(budget.shadowMapSize, 1024),
      }
    : budget
}

function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/i.test(ua) && !/Chrome|Chromium|Android|Edg/i.test(ua)
}

/* --------------------------------------------------------------------- palette */

/** Reads the live design tokens so the 3D world can never drift from the CSS palette. */
export function readPalette(element: HTMLElement) {
  const computed = getComputedStyle(element)
  const token = (name: string, fallback: string) => {
    const value = computed.getPropertyValue(name).trim()
    return new THREE.Color(value || fallback)
  }

  return {
    canvas: token('--canvas', '#f3efe5'),
    surfaceWarm: token('--surface-warm', '#ebe4d5'),
    sand: token('--sand', '#ded7c7'),
    ink: token('--ink', '#171713'),
    clay: token('--clay', '#ae4938'),
    forest: token('--forest', '#315642'),
    leaf: token('--leaf', '#4a6b52'),
    gold: token('--gold', '#c8a84b'),
    evergreen: token('--evergreen', '#171713'),
    evergreenSurface: token('--evergreen-surface', '#22211c'),
    charcoal: token('--charcoal', '#121a15'),
  }
}

type Palette = ReturnType<typeof readPalette>

/* ------------------------------------------------------------------ small math */

/** Deterministic PRNG so the diorama is identical on every load and every device. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Coherent value noise. Replaces the per-vertex white noise, which read as colour speckle. */
function valueNoise(x: number, y: number): number {
  const hash = (i: number, j: number) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  return lerp(
    lerp(hash(xi, yi), hash(xi + 1, yi), u),
    lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u),
    v,
  )
}

function fbm(x: number, y: number): number {
  return valueNoise(x, y) * 0.55 + valueNoise(x * 2.1, y * 2.1) * 0.28 + valueNoise(x * 4.3, y * 4.3) * 0.17
}

/** The raw rolling farmland, flattening into a level floor before the delivery room. */
function rawGroundHeight(x: number, z: number): number {
  const fieldFactor = smoothstep(-70, -48, z)
  const macro = fbm(x * 0.055 + 2.7, z * 0.055 - 4.1)
  const meso = fbm(x * 0.12 - 6.0, z * 0.12 + 9.0)
  const rolling = Math.sin(x * 0.085 + Math.sin(z * 0.035) * 0.7) * 0.55
    + Math.cos(z * 0.062 - x * 0.018) * 0.42
  const fieldRowPhase = Math.sin((x / 2.35) * Math.PI + Math.sin(z * 0.035) * 0.32)
  const cropBed = Math.pow(Math.max(0, 1 - Math.abs(fieldRowPhase)), 3.2) * 0.085
  const furrow = -Math.pow(Math.abs(fieldRowPhase), 10) * 0.055
  const micro = (meso - 0.5) * 0.12
  return (rolling + macro * 0.72 + cropBed + furrow + micro) * fieldFactor
}

/** Radius of the level bed carved out beneath the scan pedestal. */
const SCAN_BED_RADIUS = 2.6

/** The height of that bed, computed once on the first probe. */
let scanBedY: number | null = null

/**
 * Ground height used by every terrain mesh. A level bed is carved out around the scan
 * pedestal so the plinth always stands on solid ground · never half-buried in a bump.
 */
function groundHeight(x: number, z: number): number {
  const raw = rawGroundHeight(x, z)
  const dx = x - SCAN_TOMATO.x
  const dz = z - SCAN_TOMATO.z
  const d = Math.sqrt(dx * dx + dz * dz)
  if (d >= SCAN_BED_RADIUS) return raw
  if (scanBedY === null) scanBedY = rawGroundHeight(SCAN_TOMATO.x, SCAN_TOMATO.z)
  return lerp(raw, scanBedY, smoothstep(SCAN_BED_RADIUS, SCAN_BED_RADIUS * 0.55, d))
}

/* ------------------------------------------------------------------- landmarks */

/**
 * Stage 02 is an inspection pedestal at the far edge of the field · clean stone, off the
 * farmland, with the hero tomato on top. SCAN_TOMATO is the fruit centre; the pedestal is
 * built up from the ground beneath it.
 */
const SCAN_TOMATO = new THREE.Vector3(-3.5, 0.7, -38.5)
/** Where the stage-02 camera stands; the corridor from here to the tomato is kept clear. */
const SCAN_EYE = new THREE.Vector3(-5.5, 1.95, -37.4)
const PEDESTAL_CLEARING = 1.05
const SIGHTLINE_CLEARING = 0.95
const EYE_CLEARING = 1.85
const MARKET_Z = -47.0
/** Stage 04 · the crate lands on a lit dock and its payout resolves here. */
const DELIVERY = new THREE.Vector3(0.4, 0, -84)

/* Delivery logistics · the truck lane east of the dock, the case's ride, the receiver. */
const TRUCK_LANE_X = 4.6
const TRUCK_START_Z = -70.0
const TRUCK_END_Z = -82.8
const TRUCK_EXIT_Z = -105.0
const TRUCK_CASE_Y = 2.34

/* ------------------------------------------------------------------ scene build */

/** A material whose base colour lerps across the world pivot. */
interface PivotTint {
  material: THREE.MeshStandardMaterial | THREE.MeshLambertMaterial | THREE.MeshBasicMaterial
  warm: THREE.Color
  deep: THREE.Color
}

/** Soft radial texture, reused for tier-0 contact shadows and for the deep-world light pools. */
function makeRadialTexture(inner: string, mid: string): THREE.Texture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, inner)
    gradient.addColorStop(0.45, mid)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const SKY_VERTEX = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform float uHorizonPower;
  varying vec3 vDirection;
  void main() {
    float h = clamp(vDirection.y * 0.5 + 0.5, 0.0, 1.0);
    gl_FragColor = vec4(mix(uHorizon, uTop, pow(h, uHorizonPower)), 1.0);
  }
`

const ENV_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  varying vec3 vDirection;
  void main() {
    float h = vDirection.y;
    vec3 colour = h > 0.0
      ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.6))
      : mix(uHorizon, uGround, pow(clamp(-h, 0.0, 1.0), 0.5));
    gl_FragColor = vec4(colour, 1.0);
  }
`

export interface SceneHandles {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  fog: THREE.FogExp2
  skyUniforms: {
    uTop: { value: THREE.Color }
    uHorizon: { value: THREE.Color }
    uHorizonPower: { value: number }
  }
  windUniform: { value: number }
  sun: THREE.DirectionalLight
  sunDisc: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  goldKey: THREE.DirectionalLight
  deliverySpot: THREE.SpotLight
  hemi: THREE.HemisphereLight
  ambient: THREE.AmbientLight
  warmWorld: THREE.Group
  deepWorld: THREE.Group
  tints: PivotTint[]
  scanBeam: THREE.Mesh<THREE.PlaneGeometry | THREE.BoxGeometry, THREE.MeshBasicMaterial>
  scanTrail: THREE.Mesh<THREE.PlaneGeometry | THREE.BoxGeometry, THREE.MeshBasicMaterial>
  scanRing: THREE.Mesh<THREE.RingGeometry | THREE.TorusGeometry, THREE.MeshBasicMaterial>
  scanGlow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  scanSpot: THREE.SpotLight
  scanFruitMaterial: THREE.MeshStandardMaterial
  scanStationGroup: THREE.Group
  scanSensor: THREE.Group
  scanDomeMaterial: THREE.MeshPhysicalMaterial
  scanStatusLight: THREE.PointLight
  marketWorld: THREE.Group
  marketShaft: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  marketProduceLight: THREE.PointLight
  marketFillLight: THREE.PointLight
  marketDust: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
  marketLanterns: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>
  fieldClumps: THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  fieldWeeds: THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  deliveryDock: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial | THREE.MeshBasicMaterial>
  deliveryCrate: THREE.Group
  deliveryLidPivot: THREE.Group
  deliveryStraps: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  deliveryTruck: THREE.Group
  deliveryWheels: THREE.Mesh<THREE.TorusGeometry | THREE.CylinderGeometry, THREE.MeshStandardMaterial>[]
  deliveryHeadlights: THREE.Mesh<THREE.BoxGeometry | THREE.CylinderGeometry, THREE.MeshBasicMaterial>[]
  deliveryHeadlightBeams: THREE.Mesh<THREE.ConeGeometry | THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]
  deliveryCargoFlaps: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]
  streetLightReflections: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]
  deliveryStreetLights: THREE.Group
  deliveryPerson: THREE.Group
  deliveryGlobe: THREE.Group
  deliveryGlobePins: THREE.InstancedMesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial | THREE.MeshStandardMaterial>
  deliveryGlobePinCount: number
  deliveryGlobePinDirs: THREE.Vector3[]
  deliveryGlobeWire: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  deliveryGlobeRings: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[]
  deliveryGlobeGlow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  deliveryGlobeTruckPin: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>
  deliveryGlobePersonPin: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>
  deliveryGlow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  deliveryBeam: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  deliveryCoins: THREE.InstancedMesh<THREE.BufferGeometry, THREE.MeshBasicMaterial | THREE.MeshStandardMaterial>
  coinCount: number
  deliveryRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  deliveryRingSecondary: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
  deliveryRingGlow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  deliverySealGroup: THREE.Group
  deliverySealMaterial: THREE.MeshBasicMaterial
  lightPools: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]
  disposables: Array<{ dispose: () => void }>
}

/**
 * A single tomato leaflet: a flat, pointed blade with a drooping tip and a slight curl along
 * the midrib. Flat blades are what give foliage a readable silhouette · closed solids like
 * spheres read as blobs at every distance.
 */
function makeLeafletGeometry(curveSegments: number): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.16, 0.42, 0.62, 0.46, 1.0, 0.06)
  shape.bezierCurveTo(0.78, -0.06, 0.72, -0.30, 0.36, -0.40)
  shape.bezierCurveTo(0.17, -0.38, 0.05, -0.14, 0, 0)

  const geometry = new THREE.ShapeGeometry(shape, curveSegments)
  geometry.rotateX(-Math.PI / 2)

  // tip droop plus a shallow curl away from the midrib, so the blade is never a flat card
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const z = position.getZ(i)
    position.setY(i, -0.22 * x * x + 0.35 * Math.abs(z))
  }
  geometry.computeVertexNormals()
  return geometry
}

/**
 * A pinnate compound leaf: leaflets in opposite pairs down a rachis, shrinking toward the tip,
 * with one terminal leaflet. Points along +X from its attachment point.
 */
function makeCompoundLeafGeometry(pairs: number, curveSegments: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []

  const rachis = new THREE.CylinderGeometry(0.012, 0.018, 0.62, 4, 1)
  rachis.rotateZ(Math.PI / 2)
  rachis.translate(0.31, 0, 0)
  parts.push(rachis)

  const leaflet = makeLeafletGeometry(curveSegments)

  for (let i = 0; i < pairs; i += 1) {
    const along = 0.14 + i * (0.44 / pairs)
    const size = 0.34 - i * 0.05
    for (const side of [1, -1]) {
      const blade = leaflet.clone()
      blade.scale(size, size, size)
      blade.rotateY(side * (Math.PI / 2.6))
      blade.rotateZ(-0.12)
      blade.translate(along, -0.01 * i, side * 0.03)
      parts.push(blade)
    }
  }

  const terminal = leaflet.clone()
  terminal.scale(0.46, 0.46, 0.46)
  terminal.rotateZ(-0.18)
  terminal.translate(0.6, -0.02, 0)
  parts.push(terminal)
  leaflet.dispose()

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  return merged ?? new THREE.PlaneGeometry(0.6, 0.3)
}

/**
 * A staked tomato plant: a leaning main stem, two side branches, and compound leaves set in
 * alternating phyllotaxis up the stem, each tilted down and out. Merged once, then instanced.
 */
function buildPlantGeometry(tier: Tier): THREE.BufferGeometry {
  const leafCount = tier === 0 ? 6 : tier === 1 ? 8 : 10
  const pairs = tier === 0 ? 2 : 3
  const curveSegments = tier === 0 ? 4 : 5
  const parts: THREE.BufferGeometry[] = []

  const stem = new THREE.CylinderGeometry(0.024, 0.058, 1.42, 8, 2)
  stem.translate(0, 0.71, 0)
  stem.rotateZ(0.045)
  parts.push(stem)

  for (const side of [1, -1]) {
    const primary = new THREE.CylinderGeometry(0.012, 0.029, 0.5, 6, 1)
    primary.rotateZ(side * 0.83)
    primary.translate(side * 0.19, 0.68 + side * 0.12, side * 0.04)
    parts.push(primary)

    const secondary = new THREE.CylinderGeometry(0.009, 0.018, 0.34, 6, 1)
    secondary.rotateZ(side * 0.5)
    secondary.rotateX(side * 0.18)
    secondary.translate(side * 0.23, 0.94, side * 0.07)
    parts.push(secondary)
  }

  const leaf = makeCompoundLeafGeometry(pairs, curveSegments)

  for (let i = 0; i < leafCount; i += 1) {
    // 137.5° golden-angle phyllotaxis, leaves concentrated up the top two-thirds of the stem
    const angle = i * 2.39996
    const height = 0.28 + (i / Math.max(1, leafCount - 1)) * 1.03
    const droop = -0.58 + (i / Math.max(1, leafCount - 1)) * 0.28
    const scale = 1.08 - (i / Math.max(1, leafCount - 1)) * 0.42
    // the rachis has to leave the stem surface, not float beside it: seat its base on the
    // stem's tapering radius at this height so there is never a gap when the camera is close
    const stemRadius = 0.058 - (height / 1.42) * 0.034

    const blade = leaf.clone()
    blade.scale(scale, scale, scale)
    blade.rotateZ(droop)
    blade.rotateY(angle)
    blade.translate(Math.cos(angle) * stemRadius * 1.05, height, Math.sin(angle) * stemRadius * 1.05)
    parts.push(blade)
  }
  leaf.dispose()

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.IcosahedronGeometry(0.6, 0)
  merged.computeVertexNormals()
  return merged
}

/**
 * A tomato truss: a short stalk that leaves the stem at canopy height, then four drooping
 * pedicels. Each pedicel ends at a tip where a fruit hangs · the calyx lives on the fruit
 * itself so it always hugs the fruit it belongs to, whatever its size. The truss is its own
 * instanced geometry so every plant can independently carry (or not carry) fruit, and so the
 * fruit anchor points are known exactly · that is what keeps the tomatoes attached to the vine.
 */
const TRUSS_JUNCTION = new THREE.Vector3(0.3, 0.55, 0)
const TRUSS_JUNCTION_LOWER = new THREE.Vector3(-0.25, 0.36, 0.08)
const TRUSS_TIPS = [
  new THREE.Vector3(0.12, 0.44, 0.1),
  new THREE.Vector3(0.44, 0.42, 0.05),
  new THREE.Vector3(0.32, 0.4, -0.12),
  new THREE.Vector3(0.2, 0.47, -0.05),
  new THREE.Vector3(0.48, 0.35, -0.08),
  new THREE.Vector3(0.26, 0.34, 0.14),
  // Lower cluster branch
  new THREE.Vector3(-0.15, 0.28, 0.16),
  new THREE.Vector3(-0.38, 0.26, 0.05),
  new THREE.Vector3(-0.28, 0.24, -0.12),
]

function cylinderBetween(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radiusTop: number,
  radiusBottom: number,
  segments: number,
  openEnded = false,
): THREE.CylinderGeometry {
  const direction = b.clone().sub(a)
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, segments, 1, openEnded)
  geometry.translate(0, length / 2, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  geometry.applyQuaternion(quaternion)
  geometry.translate(a.x, a.y, a.z)
  return geometry
}

function buildTrussGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  // Upper cluster stalk
  parts.push(cylinderBetween(new THREE.Vector3(0, 0.55, 0), TRUSS_JUNCTION, 0.018, 0.022, 6, true))
  for (let i = 0; i < 6; i += 1) {
    parts.push(cylinderBetween(TRUSS_JUNCTION, TRUSS_TIPS[i], 0.007, 0.012, 6, true))
  }
  // Lower cluster stalk
  parts.push(cylinderBetween(new THREE.Vector3(0, 0.36, 0), TRUSS_JUNCTION_LOWER, 0.016, 0.020, 6, true))
  for (let i = 6; i < TRUSS_TIPS.length; i += 1) {
    parts.push(cylinderBetween(TRUSS_JUNCTION_LOWER, TRUSS_TIPS[i], 0.007, 0.012, 6, true))
  }
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.ConeGeometry(0.04, 0.3, 6)
  merged.computeVertexNormals()
  return merged
}

/**
 * A hanging tomato: the fruit (slightly flattened pole-to-pole), a five-petal calyx star
 * cupping its top, and a short stem stub where the pedicel arrives. Modelled around a unit
 * sphere so one instance scale produces the whole assembly · the calyx therefore always
 * fits its fruit exactly, at any size, with no gap between the pedicel tip and the fruit.
 */
function buildFruitGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  // field fruits sit 0.05-0.09 units wide and are seen from the dolly's distance, so a lean
  // body keeps the instanced draw cheap without changing what the frame shows
  const body = new THREE.SphereGeometry(1, 10, 7)
  body.scale(1, 0.9, 1)
  parts.push(body)
  const petal = makeLeafletGeometry(3)
  for (let i = 0; i < 5; i += 1) {
    const blade = petal.clone()
    blade.scale(0.27, 0.27, 0.27)
    blade.rotateY((i / 5) * Math.PI * 2)
    blade.rotateZ(0.55)
    blade.translate(0, 0.92, 0)
    parts.push(blade)
  }
  petal.dispose()
  const stub = new THREE.CylinderGeometry(0.05, 0.07, 0.18, 6)
  stub.translate(0, 1.16, 0)
  parts.push(stub)
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.SphereGeometry(1, 10, 7)
  merged.computeVertexNormals()
  return merged
}

/** A five-petal calyx star plus a stem stub, for the hero fruit on the scan pedestal. */
function buildCalyxGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  const leaflet = makeLeafletGeometry(3)
  for (let i = 0; i < 5; i += 1) {
    const petal = leaflet.clone()
    petal.scale(0.11, 0.11, 0.11)
    petal.rotateY((i / 5) * Math.PI * 2)
    petal.rotateZ(0.5)
    petal.translate(0, 0.02, 0)
    parts.push(petal)
  }
  leaflet.dispose()
  const stub = new THREE.CylinderGeometry(0.012, 0.016, 0.05, 5)
  stub.translate(0, 0.045, 0)
  parts.push(stub)
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.ConeGeometry(0.05, 0.1, 5)
  merged.computeVertexNormals()
  return merged
}

/** Split bamboo stake. Staking is half the visual signature of a tomato row. */
function buildStakeGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  const cane = new THREE.CylinderGeometry(0.013, 0.019, 1.32, 5, 1)
  cane.translate(0, 0.65, 0)
  parts.push(cane)
  for (const y of [0.46, 0.86]) {
    const tie = new THREE.TorusGeometry(0.042, 0.008, 4, 8)
    tie.rotateX(Math.PI / 2)
    tie.translate(0, y, 0)
    parts.push(tie)
  }
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.CylinderGeometry(0.013, 0.019, 1.32, 5, 1)
  merged.computeVertexNormals()
  return merged
}

/** Crate built from real slats and corner posts, merged so the whole crate can be instanced. */
function buildCrateGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  const push = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const box = new THREE.BoxGeometry(w, h, d)
    box.translate(x, y, z)
    parts.push(box)
  }

  push(1.52, 0.08, 1.06, 0, 0.05, 0)
  for (let i = 0; i < 3; i += 1) {
    const y = 0.2 + i * 0.24
    push(1.52, 0.17, 0.07, 0, y, 0.53)
    push(1.52, 0.17, 0.07, 0, y, -0.53)
    push(0.07, 0.17, 1.06, 0.76, y, 0)
    push(0.07, 0.17, 1.06, -0.76, y, 0)
  }
  for (const x of [0.72, -0.72]) {
    for (const z of [0.49, -0.49]) push(0.11, 0.84, 0.11, x, 0.42, z)
  }

  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.BoxGeometry(1.5, 0.8, 1)
  merged.computeVertexNormals()
  return merged
}

function makePointsGeometry(count: number, random: () => number, areaX: number, areaY: number, areaZ: number, baseY: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (random() - 0.5) * areaX
    positions[i * 3 + 1] = baseY + random() * areaY
    positions[i * 3 + 2] = (random() - 0.5) * areaZ
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

function makeEmissionMaterial(color: THREE.Color, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: color.getHex(),
    transparent: opacity < 1,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
}

/** Natural soil clump: low-poly irregular mound used as instanced field dressing. */
function buildSoilClumpGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(0.12, 1)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const seed = Math.sin(i * 12.17) * 43758.5
    const jitter = seed - Math.floor(seed)
    position.setXYZ(
      i,
      x * (0.72 + jitter * 0.45),
      y * (0.55 + jitter * 0.44),
      z * (0.78 + (1 - jitter) * 0.38),
    )
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Small weed/grass tuft used sparingly between crop rows. */
function buildWeedGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < 5; i += 1) {
    const blade = new THREE.ConeGeometry(0.018 + i * 0.003, 0.24 + i * 0.025, 4, 1)
    blade.translate((i - 2) * 0.018, (0.24 + i * 0.025) * 0.5, 0)
    blade.rotateZ((i - 2) * 0.11)
    blade.rotateY(i * 0.55)
    parts.push(blade)
  }
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.ConeGeometry(0.03, 0.25, 4)
  merged.computeVertexNormals()
  return merged
}

/** A slightly tomato-specific produce shape: subtly flattened and shoulder-heavy. */
function buildMarketTomatoGeometry(): THREE.BufferGeometry {
  // Unit tomato: all market instances deliberately scale this down to a believable
  // real-world produce size. The previous heap instances were close to 1 world unit,
  // which made them read as giant dark objects rather than tomatoes.
  const geometry = new THREE.SphereGeometry(1, 20, 14)
  const position = geometry.attributes.position

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)

    const radial = Math.sqrt(x * x + z * z)
    const azimuth = Math.atan2(z, x)

    // Natural tomato shoulder + gentle five-lobed ribbing.
    const rib =
      1 +
      0.028 *
        Math.cos(azimuth * 5) *
        (0.45 + 0.55 * Math.max(0, y + 0.05))

    const shoulder = 1 + Math.max(0, y) * 0.18
    const base = 1 - Math.max(0, -y) * 0.09
    const belly = 1.035 - radial * 0.07

    position.setX(i, x * shoulder * base * belly * rib)
    position.setY(
      i,
      y * (0.82 + 0.025 * Math.cos(radial * Math.PI)) -
        Math.max(0, -y) * 0.018,
    )
    position.setZ(i, z * shoulder * base * belly * rib)
  }

  geometry.computeVertexNormals()
  return geometry
}

/**
 * A ceremonial payout coin/disc: a stout cylinder with a bevelled rim and a raised centre
 * boss. Reads as a coin from the mid-shot distances the delivery stage is framed at.
 */
function buildCoinGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  const body = new THREE.CylinderGeometry(1, 1, 0.16, 20, 1)
  parts.push(body)
  const rim = new THREE.TorusGeometry(0.98, 0.06, 8, 20)
  rim.rotateX(Math.PI / 2)
  parts.push(rim)
  const boss = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16, 1)
  parts.push(boss)
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  if (!merged) return new THREE.CylinderGeometry(1, 1, 0.16, 20)
  merged.computeVertexNormals()
  return merged
}

export function buildScene(palette: Palette, budget: TierBudget): SceneHandles {
  const random = mulberry32(20260819)
  const scene = new THREE.Scene()
  const disposables: Array<{ dispose: () => void }> = []
  const tints: PivotTint[] = []
  const dummy = new THREE.Object3D()
  const trussDummy = new THREE.Object3D()
  const castsShadows = budget.shadowMapSize > 0

  const camera = new THREE.PerspectiveCamera(46, 1, 0.4, 400)
  const windUniform = { value: 0 }

  const warmHaze = palette.canvas.clone().lerp(palette.sand, 0.4)
  const fog = new THREE.FogExp2(warmHaze.getHex(), 0.0105)
  scene.fog = fog

  /* ---- sky dome ---- */
  const skyUniforms = {
    uTop: { value: palette.sand.clone().lerp(new THREE.Color('#7ea8c4'), 0.42) },
    uHorizon: { value: warmHaze.clone().lerp(new THREE.Color('#f6dcae'), 0.5) },
    uHorizonPower: { value: 0.8 },
  }
  const skyGeometry = new THREE.SphereGeometry(250, 28, 18)
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  })
  const sky = new THREE.Mesh(skyGeometry, skyMaterial)
  sky.matrixAutoUpdate = false
  sky.updateMatrix()
  scene.add(sky)
  disposables.push(skyGeometry, skyMaterial)

  /* ---- lighting ---- */
  const hemi = new THREE.HemisphereLight(palette.canvas.getHex(), new THREE.Color('#35533a').getHex(), 0.62)
  scene.add(hemi)

  const ambient = new THREE.AmbientLight(palette.canvas.getHex(), 0.22)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(new THREE.Color('#ffd39a').getHex(), 2.45)
  sun.position.set(-26, 14, 16)
  scene.add(sun)
  scene.add(sun.target)
  if (castsShadows) {
    sun.castShadow = true
    sun.shadow.mapSize.set(Math.min(budget.shadowMapSize, 1024), Math.min(budget.shadowMapSize, 1024))
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 72
    sun.shadow.camera.left = -24
    sun.shadow.camera.right = 24
    sun.shadow.camera.top = 24
    sun.shadow.camera.bottom = -24
    sun.shadow.bias = -0.0012
    sun.shadow.normalBias = 0.035
  }

  const goldKey = new THREE.DirectionalLight(palette.gold.getHex(), 0)
  goldKey.position.set(10, 9, -64)
  scene.add(goldKey)

  // Delivery key light · on only while the crate is opening and the payout is resolving.
  const deliverySpot = new THREE.SpotLight(0xfff2d4, 0, 30, 0.62, 0.7, 1.3)
  deliverySpot.position.set(DELIVERY.x + 0.8, DELIVERY.y + 6.4, DELIVERY.z + 3.8)
  deliverySpot.target.position.set(TRUCK_LANE_X, DELIVERY.y + 0.9, TRUCK_END_Z)
  scene.add(deliverySpot)
  scene.add(deliverySpot.target)

  const sunDiscGeometry = new THREE.SphereGeometry(5.4, 20, 14)
  const sunDiscMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#fff0cc'),
    fog: false,
    transparent: true,
    opacity: 0.95,
  })
  const sunDisc = new THREE.Mesh(sunDiscGeometry, sunDiscMaterial)
  sunDisc.position.set(-64, 12, 22)
  scene.add(sunDisc)
  disposables.push(sunDiscGeometry, sunDiscMaterial)

  /* ---- terrain: a wide base plane plus a high-detail patch under the field ---- */
  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.97,
    metalness: 0,
    envMapIntensity: 0.35,
  })

  const buildGround = (width: number, depth: number, segments: number, centreZ: number, detail: number) => {
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments)
    geometry.rotateX(-Math.PI / 2)
    const position = geometry.attributes.position
    const colours = new Float32Array(position.count * 3)
    const soil = new THREE.Color('#6a4529')
    const soilDark = new THREE.Color('#3f2d1d')
    const grass = palette.leaf.clone().lerp(new THREE.Color('#6e914d'), 0.36)
    const dry = new THREE.Color('#9b8652')
    const loam = new THREE.Color('#7f5a35')
    const swatch = new THREE.Color()
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i)
      const z = position.getZ(i) + centreZ
      const macro = fbm(x * 0.052 + 7, z * 0.052 - 4)
      const micro = fbm(x * 0.22 - 13, z * 0.22 + 5)
      const grain = fbm(x * 0.46 + 4, z * 0.46 - 7)
      const rowPhase = Math.sin((x / 2.35) * Math.PI + Math.sin(z * 0.03) * 0.28)
      const ridge = Math.pow(Math.max(0, rowPhase), 7) * 0.075 - Math.pow(Math.max(0, -rowPhase), 7) * 0.032
      const roughness = detail > 0 ? micro * 0.14 + (grain - 0.5) * 0.05 : micro * 0.04
      position.setY(i, groundHeight(x, z) + ridge + roughness)
      swatch.copy(soil).lerp(loam, clamp01(macro * 1.25))
      swatch.lerp(soilDark, clamp01(0.32 - micro) * 0.5)
      swatch.lerp(new THREE.Color('#8e6138'), clamp01(grain - 0.56) * 0.22)
      swatch.lerp(grass, clamp01(macro - 0.62) * (detail > 0 ? 0.33 : 0.12))
      swatch.lerp(dry, clamp01(0.4 - macro) * 0.15)
      colours[i * 3] = swatch.r
      colours[i * 3 + 1] = swatch.g
      colours[i * 3 + 2] = swatch.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3))
    geometry.computeVertexNormals()
    return geometry
  }

  const baseGeometry = buildGround(320, 360, budget.terrainSegments, -60, 0)
  const terrain = new THREE.Mesh(baseGeometry, terrainMaterial)
  terrain.position.z = -60
  terrain.receiveShadow = castsShadows
  terrain.matrixAutoUpdate = false
  terrain.updateMatrix()
  scene.add(terrain)
  disposables.push(baseGeometry)

  const detailGeometry = buildGround(74, 80, budget.detailSegments, -14, 0.55)
  const detailGround = new THREE.Mesh(detailGeometry, terrainMaterial)
  detailGround.position.set(0, 0.014, -14)
  detailGround.receiveShadow = castsShadows
  detailGround.matrixAutoUpdate = false
  detailGround.updateMatrix()
  scene.add(detailGround)
  disposables.push(detailGeometry, terrainMaterial)

  tints.push({
    material: terrainMaterial,
    warm: new THREE.Color('#ffffff'),
    deep: palette.evergreenSurface.clone().lerp(palette.forest, 0.34),
  })

  /* ---- warm world ---- */
  const warmWorld = new THREE.Group()
  scene.add(warmWorld)

  const plantGeometry = buildPlantGeometry(budget.tier)
  const foliageBase = new THREE.Color('#365f31').lerp(new THREE.Color('#73964a'), 0.44)
  const plantMaterial = new THREE.MeshStandardMaterial({
    color: foliageBase.getHex(),
    roughness: 0.83,
    metalness: 0,
    envMapIntensity: 0.72,
    side: THREE.DoubleSide, // the leaf blades are flat, so both faces have to shade
  })
  // Wind sway only on tier 1+ for performance
  if (budget.tier >= 1) {
    plantMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uWind = windUniform
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uWind;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float swayPhase = uWind;
           #ifdef USE_INSTANCING
             swayPhase += instanceMatrix[3][0] * 0.55 + instanceMatrix[3][2] * 0.31;
           #endif
           float swayReach = max(transformed.y, 0.0);
           transformed.x += sin(swayPhase) * 0.055 * swayReach;
           transformed.z += cos(swayPhase * 0.83) * 0.032 * swayReach;`,
        )
    }
  }
  const plants = new THREE.InstancedMesh(plantGeometry, plantMaterial, budget.plants)
  plants.castShadow = false
  plants.receiveShadow = false

  const tomatoGeometry = buildFruitGeometry()
  const tomatoMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0,
    envMapIntensity: 1.15,
    side: THREE.DoubleSide, // the calyx petals are flat blades, so both faces have to shade
  })
  // fruit sways with the vine it hangs on, so the calyx never detaches from the pedicel tip:
  // the truss geometry sits at object heights ~0.5 while this fruit sits at ~1, so the sway
  // reach is scaled up to land the same world-space displacement as the pedicel end.
  if (budget.tier >= 1) {
    tomatoMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uWind = windUniform
      shader.uniforms.uSwayGain = { value: 7 }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uWind;\nuniform float uSwayGain;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float swayPhase = uWind;
           #ifdef USE_INSTANCING
             swayPhase += instanceMatrix[3][0] * 0.55 + instanceMatrix[3][2] * 0.31;
           #endif
           float swayReach = max(transformed.y, 0.0);
           transformed.x += sin(swayPhase) * 0.075 * swayReach * uSwayGain;
           transformed.z += cos(swayPhase * 0.83) * 0.045 * swayReach * uSwayGain;`,
        )
    }
  }
  const tomatoes = new THREE.InstancedMesh(tomatoGeometry, tomatoMaterial, budget.tomatoes)
  // the field fruits are a few centimetres across · their cast shadows are noise in the
  // shadow map, and skipping them halves the shadow pass on shadow-enabled tiers
  tomatoes.castShadow = false

  // one truss geometry shared by every fruiting plant; per-instance yaw gives the variety.
  // nearly every plant carries fruit · only a scattered minority stay immature and bare ·
  // so a field that reads close-up never looks half-stripped
  const trussGeometry = buildTrussGeometry()
  const trussCount = Math.floor(budget.plants * 0.92)
  const trusses = new THREE.InstancedMesh(trussGeometry, plantMaterial, trussCount)
  trusses.castShadow = false

  const stakeGeometry = buildStakeGeometry()
  // pale sand read as white plastic rods against the foliage; this is split bamboo
  const stakeBase = new THREE.Color('#7d5a32').lerp(palette.clay, 0.18)
  const stakeMaterial = new THREE.MeshStandardMaterial({
    color: stakeBase.getHex(),
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.25,
  })
  const stakeCount = Math.ceil(budget.plants / 3)
  const stakes = new THREE.InstancedMesh(stakeGeometry, stakeMaterial, stakeCount)
  stakes.castShadow = false

  /*
   * Rows run along -Z, away from the camera, so stage 01 gets receding perspective lines
   * instead of bands running across frame. Row count scales with tier; the field keeps the
   * same footprint on every device and only its planting density changes.
   */
  const rowCount = budget.tier === 0 ? 15 : budget.tier === 1 ? 24 : 32
  const perRow = Math.max(6, Math.floor(budget.plants / rowCount))
  const fieldFront = 8.5
  const fieldDepth = 38.5 // Stops at z = -30.0, exactly 8.5 units before Stage 2 at z = -38.5
  const inRowSpacing = fieldDepth / perRow

  const foliageTone = new THREE.Color()
  const fruitTone = new THREE.Color()
  const ripe = new THREE.Color('#E82615')
  const turning = new THREE.Color('#FF721B')
  const unripe = new THREE.Color('#7CAD28')

  let tomatoIndex = 0
  let trussIndex = 0
  for (let i = 0; i < budget.plants; i += 1) {
    const row = i % rowCount
    const along = Math.floor(i / rowCount)
    // Span across to the open right side (x: -9.0 to +16.0)
    const xFraction = row / (rowCount - 1)
    const x = lerp(-9.0, 16.0, xFraction) + (random() - 0.5) * 0.28
    const z = fieldFront - along * inRowSpacing + (random() - 0.5) * inRowSpacing * 0.35
    /*
     * Keep Stage 02's pedestal clearing and corridor clear
     */
    let px = x
    let pz = z
    for (const [centre, radius] of [
      [SCAN_TOMATO, PEDESTAL_CLEARING] as const,
      [SCAN_EYE, EYE_CLEARING] as const,
    ]) {
      const dx = px - centre.x
      const dz = pz - centre.z
      const distance = Math.hypot(dx, dz)
      if (distance < radius) {
        const push = radius / Math.max(0.3, distance)
        px = centre.x + dx * push
        pz = centre.z + dz * push
      }
    }
    const alongX = SCAN_TOMATO.x - SCAN_EYE.x
    const alongZ = SCAN_TOMATO.z - SCAN_EYE.z
    const alongLength = alongX * alongX + alongZ * alongZ
    const t = clamp01(((px - SCAN_EYE.x) * alongX + (pz - SCAN_EYE.z) * alongZ) / alongLength)
    const nearX = px - (SCAN_EYE.x + alongX * t)
    const nearZ = pz - (SCAN_EYE.z + alongZ * t)
    const toLine = Math.hypot(nearX, nearZ)
    if (toLine < SIGHTLINE_CLEARING) {
      const push = SIGHTLINE_CLEARING / Math.max(0.3, toLine)
      px = SCAN_EYE.x + alongX * t + nearX * push
      pz = SCAN_EYE.z + alongZ * t + nearZ * push
    }
    const y = groundHeight(px, pz)
    const scale = 1.05 + random() * 0.55
    const lean = (random() - 0.5) * 0.20

    const plantYaw = random() * Math.PI * 2
    dummy.position.set(px, y, pz)
    dummy.rotation.set(lean * 0.5, plantYaw, lean)
    dummy.scale.set(scale, scale * (0.92 + random() * 0.28), scale * (0.96 + random() * 0.08))
    dummy.updateMatrix()
    plants.setMatrixAt(i, dummy.matrix)
    // per-plant foliage variation
    foliageTone.copy(foliageBase).offsetHSL((random() - 0.5) * 0.07, (random() - 0.5) * 0.20, (random() - 0.5) * 0.18)
    plants.setColorAt(i, foliageTone)

    if (i % 3 === 0 && i / 3 < stakeCount) {
      dummy.position.set(px + 0.17, y, pz + 0.05)
      dummy.rotation.set(0.03, random() * Math.PI, -0.05 + (random() - 0.5) * 0.06)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      stakes.setMatrixAt(Math.floor(i / 3), dummy.matrix)
    }

    /*
     * Fruit hangs on real trusses with 100% plant coverage · all plants carry ripe tomatoes
     */
    if (trussIndex < trussCount && tomatoIndex < budget.tomatoes) {
      trussDummy.position.set(px, y, pz)
      trussDummy.rotation.set(lean * 0.5 + (random() - 0.5) * 0.2, plantYaw + random() * Math.PI * 2, lean)
      trussDummy.scale.setScalar(scale)
      trussDummy.updateMatrix()
      trusses.setMatrixAt(trussIndex, trussDummy.matrix)

      // 4 to 7 plump tomatoes per plant
      const fruitCount = 4 + Math.floor(random() * 4)
      const worldTip = new THREE.Vector3()
      let placed = 0
      for (let t = 0; t < TRUSS_TIPS.length && placed < fruitCount && tomatoIndex < budget.tomatoes; t += 1) {
        placed += 1
        const tip = TRUSS_TIPS[t]
        worldTip.set(tip.x, tip.y, tip.z).applyMatrix4(trussDummy.matrix)
        const fruitRadius = 0.082 * scale * (0.85 + random() * 0.35)
        dummy.position.set(
          worldTip.x + (random() - 0.5) * 0.02,
          worldTip.y - 1.25 * fruitRadius + (random() - 0.5) * 0.01,
          worldTip.z + (random() - 0.5) * 0.02,
        )
        dummy.rotation.set(0, random() * Math.PI * 2, 0)
        dummy.scale.setScalar(fruitRadius)
        dummy.updateMatrix()
        tomatoes.setMatrixAt(tomatoIndex, dummy.matrix)
        // predominantly rich ripe red (70%), with sunburst turning (20%) and fresh green (10%)
        const ripeness = random()
        fruitTone.copy(ripeness > 0.30 ? ripe : ripeness > 0.10 ? turning : unripe)
        fruitTone.offsetHSL(0, (random() - 0.5) * 0.06, (random() - 0.5) * 0.08)
        tomatoes.setColorAt(tomatoIndex, fruitTone)
        tomatoIndex += 1
      }
      trussIndex += 1
    }
  }
  for (let i = tomatoIndex; i < budget.tomatoes; i += 1) {
    dummy.position.set(0, -80, 0)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.setScalar(0.001)
    dummy.updateMatrix()
    tomatoes.setMatrixAt(i, dummy.matrix)
  }
  if (plants.instanceColor) plants.instanceColor.needsUpdate = true
  if (tomatoes.instanceColor) tomatoes.instanceColor.needsUpdate = true
  stakes.matrixAutoUpdate = false
  stakes.updateMatrix()
  warmWorld.add(stakes)
  disposables.push(stakeGeometry, stakeMaterial)
  tints.push({ material: stakeMaterial, warm: stakeBase.clone(), deep: palette.charcoal.clone() })

  plants.matrixAutoUpdate = false
  plants.updateMatrix()
  tomatoes.matrixAutoUpdate = false
  tomatoes.updateMatrix()
  trusses.matrixAutoUpdate = false
  trusses.updateMatrix()
  warmWorld.add(plants, tomatoes, trusses)
  disposables.push(plantGeometry, plantMaterial, tomatoGeometry, tomatoMaterial, trussGeometry)
  tints.push({ material: plantMaterial, warm: foliageBase.clone(), deep: palette.charcoal.clone() })
  tints.push({ material: tomatoMaterial, warm: new THREE.Color('#ffffff'), deep: palette.charcoal.clone() })

  /* ---- field realism dressing: soil clumps + sparse weeds + crop-path variation ---- */
  const clumpGeometry = buildSoilClumpGeometry()
  const clumpMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5a3b25').getHex(),
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.18,
  })
  const clumpCount = budget.tier === 0 ? 60 : budget.tier === 1 ? 120 : 200
  const fieldClumps = new THREE.InstancedMesh(clumpGeometry, clumpMaterial, clumpCount)
  for (let i = 0; i < clumpCount; i += 1) {
    const row = (i % 17) - 8
    const x = row * 1.35 + (random() - 0.5) * 0.9
    const z = 6.8 - random() * 39
    const y = groundHeight(x, z)
    dummy.position.set(x, y + 0.035, z)
    dummy.rotation.set(random() * 0.7, random() * Math.PI * 2, random() * 0.5)
    const sc = 0.45 + random() * 1.35
    dummy.scale.set(sc * (0.65 + random() * 0.55), sc * (0.35 + random() * 0.5), sc * (0.65 + random() * 0.55))
    dummy.updateMatrix()
    fieldClumps.setMatrixAt(i, dummy.matrix)
  }
  fieldClumps.castShadow = false
  fieldClumps.receiveShadow = false
  fieldClumps.matrixAutoUpdate = false
  fieldClumps.updateMatrix()
  warmWorld.add(fieldClumps)
  disposables.push(clumpGeometry, clumpMaterial)
  tints.push({ material: clumpMaterial, warm: new THREE.Color('#5a3b25'), deep: new THREE.Color('#302a20') })

  const weedGeometry = buildWeedGeometry()
  const weedMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5e7d3e').getHex(),
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.32,
    side: THREE.DoubleSide,
  })
  const weedCount = budget.tier === 0 ? 20 : budget.tier === 1 ? 50 : 100
  const fieldWeeds = new THREE.InstancedMesh(weedGeometry, weedMaterial, weedCount)
  for (let i = 0; i < weedCount; i += 1) {
    const x = (random() - 0.5) * 18
    const z = 6.2 - random() * 38
    // keep weeds out of the clean inspection sightline
    if (Math.hypot(x - SCAN_EYE.x, z - SCAN_EYE.z) < 1.8) {
      i -= 1
      continue
    }
    const y = groundHeight(x, z)
    dummy.position.set(x, y + 0.015, z)
    dummy.rotation.set(0, random() * Math.PI * 2, 0)
    const sc = 0.55 + random() * 1.3
    dummy.scale.setScalar(sc)
    dummy.updateMatrix()
    fieldWeeds.setMatrixAt(i, dummy.matrix)
  }
  fieldWeeds.castShadow = false
  fieldWeeds.receiveShadow = false
  fieldWeeds.matrixAutoUpdate = false
  fieldWeeds.updateMatrix()
  warmWorld.add(fieldWeeds)
  disposables.push(weedGeometry, weedMaterial)
  tints.push({ material: weedMaterial, warm: new THREE.Color('#5e7d3e'), deep: new THREE.Color('#293a28') })

  // All market stalls, produce, tables, and dressing are grouped into marketWorld
  const marketWorld = new THREE.Group()
  warmWorld.add(marketWorld)

  // crates, all gathered at the market · nothing sits in the farmland ahead of the scan,
  // so the field reads as produce still on the vine until the inspection pedestal appears
  const crateGeometry = buildCrateGeometry()
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8a5b32').getHex(),
    roughness: 0.91,
    metalness: 0,
    envMapIntensity: 0.6,
  })
  const crateSpots = [
    { x: -2.3, z: MARKET_Z + 1.5, rotation: 0.16, scale: 0.95 },
    { x: 2.4, z: MARKET_Z + 0.5, rotation: -0.26, scale: 0.95 },
    { x: -4.8, z: MARKET_Z - 1.8, rotation: 0.44, scale: 0.9 },
    { x: 5.1, z: MARKET_Z - 2.6, rotation: -0.12, scale: 0.9 },
    { x: -6.8, z: MARKET_Z + 0.2, rotation: -0.5, scale: 0.9 },
    { x: 6.6, z: MARKET_Z + 0.8, rotation: 0.33, scale: 0.9 },
    { x: -1.9, z: MARKET_Z - 2, rotation: -0.62, scale: 0.85 },
    { x: 4.3, z: MARKET_Z - 2.4, rotation: 0.58, scale: 0.85 },
  ]
  const crates = new THREE.InstancedMesh(crateGeometry, woodMaterial, budget.crates)
  crates.castShadow = false
  crates.receiveShadow = false
  for (let c = 0; c < budget.crates; c += 1) {
    const spot = crateSpots[c % crateSpots.length]
    dummy.position.set(spot.x, groundHeight(spot.x, spot.z), spot.z)
    dummy.rotation.set(0, spot.rotation, 0)
    dummy.scale.setScalar(spot.scale)
    dummy.updateMatrix()
    crates.setMatrixAt(c, dummy.matrix)
  }
  crates.matrixAutoUpdate = false
  crates.updateMatrix()
  marketWorld.add(crates)
  disposables.push(crateGeometry, woodMaterial)
  tints.push({
    material: woodMaterial,
    warm: palette.clay.clone().lerp(palette.sand, 0.5),
    deep: palette.charcoal.clone(),
  })

  // produce heaped in the crates · larger spheres so the produce is clearly visible
  const heapGeometry = buildMarketTomatoGeometry()
  const heapMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e33a2f'),
    vertexColors: true,
    roughness: 0.36,
    metalness: 0,
    envMapIntensity: 1.15,
    emissive: new THREE.Color('#5a0f08'),
    emissiveIntensity: 0.12,
  })
  const heapPerCrate = budget.tier === 0 ? 30 : budget.tier === 1 ? 40 : 50
  const heaps = new THREE.InstancedMesh(heapGeometry, heapMaterial, budget.crates * heapPerCrate)
  heaps.castShadow = false
  const produceColours = [
    new THREE.Color('#e33a2f'),
    new THREE.Color('#cf2f25'),
    new THREE.Color('#ef4b35'),
    new THREE.Color('#b9221c'),
    new THREE.Color('#dc3628'),
  ]
  const heapTone = new THREE.Color()
  for (let c = 0; c < budget.crates; c += 1) {
    const spot = crateSpots[c % crateSpots.length]
    const baseY = groundHeight(spot.x, spot.z)
    const tone = produceColours[c % produceColours.length]
    const cosR = Math.cos(spot.rotation)
    const sinR = Math.sin(spot.rotation)
    for (let h = 0; h < heapPerCrate; h += 1) {
      const index = c * heapPerCrate + h
      const perLayer = Math.ceil(heapPerCrate / 4)
      const ring = Math.min(3, Math.floor(h / perLayer))
      const tomatoScale = spot.scale * (0.09 + random() * 0.025)
      const lx = (random() - 0.5) * 1.20 * spot.scale
      const lz = (random() - 0.5) * 0.78 * spot.scale

      // Pack the produce in compact layers inside the crate body · the top layer sits
      // just at the rim so nothing floats above the crate. Placement rotates with the
      // crate so the heap never spills past its sides. Tomatoes are intentionally
      // ~9–12 cm in radius in world scale rather than ~1 metre.
      dummy.position.set(
        spot.x + lx * cosR - lz * sinR,
        baseY + 0.09 * spot.scale + tomatoScale * (1 + 1.8 * ring) + random() * 0.02 * spot.scale,
        spot.z + lx * sinR + lz * cosR,
      )
      dummy.rotation.set(random() * 0.25, random() * Math.PI * 2, random() * 0.25)
      dummy.scale.setScalar(tomatoScale)
      dummy.updateMatrix()
      heaps.setMatrixAt(index, dummy.matrix)
      heapTone.copy(tone).offsetHSL((random() - 0.5) * 0.04, (random() - 0.5) * 0.08, (random() - 0.5) * 0.12)
      heaps.setColorAt(index, heapTone)
    }
  }
  heaps.matrixAutoUpdate = false
  heaps.updateMatrix()
  if (heaps.instanceColor) heaps.instanceColor.needsUpdate = true
  marketWorld.add(heaps)
  disposables.push(heapGeometry, heapMaterial)

  // market tables · proper wooden stall tables with visible legs and a warm wood finish
  const tableGeometry = new THREE.BoxGeometry(1, 1, 1)
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8b6b3e'),  // warm market-wood brown
    roughness: 0.72,
    metalness: 0,
    envMapIntensity: 0.65,
  })
  const tableSpots = [
    { x: -3.4, z: MARKET_Z + 1.1, w: 6, d: 2.2, rot: 0.04 },
    { x: 3.6, z: MARKET_Z, w: 5.6, d: 2.2, rot: -0.03 },
    { x: -0.4, z: MARKET_Z - 3.6, w: 7, d: 2.4, rot: 0.02 },
    { x: -6.2, z: MARKET_Z - 1.2, w: 4.2, d: 2, rot: 0.5 },
    { x: 6.4, z: MARKET_Z + 1.6, w: 4.4, d: 2, rot: -0.3 },
  ]
  // each table: top slab + 4 legs = 5 instances per table
  const tableInstanceCount = tableSpots.length * 5
  const tables = new THREE.InstancedMesh(tableGeometry, tableMaterial, tableInstanceCount)
  tableSpots.forEach((spot, index) => {
    const y = groundHeight(spot.x, spot.z)
    dummy.rotation.set(0, spot.rot, 0)
    // table top · thicker slab for realism
    dummy.position.set(spot.x, y + 0.82, spot.z)
    dummy.scale.set(spot.w, 0.15, spot.d)
    dummy.updateMatrix()
    tables.setMatrixAt(index * 5, dummy.matrix)
    // four legs
    const hw = spot.w * 0.44
    const hd = spot.d * 0.42
    const legPositions = [
      { lx: spot.x - hw, lz: spot.z - hd },
      { lx: spot.x + hw, lz: spot.z - hd },
      { lx: spot.x - hw, lz: spot.z + hd },
      { lx: spot.x + hw, lz: spot.z + hd },
    ]
    legPositions.forEach((leg, li) => {
      dummy.position.set(leg.lx, y + 0.38, leg.lz)
      dummy.rotation.set(0, spot.rot, 0)
      dummy.scale.set(0.13, 0.78, 0.13)
      dummy.updateMatrix()
      tables.setMatrixAt(index * 5 + 1 + li, dummy.matrix)
    })
  })
  tables.castShadow = false
  tables.receiveShadow = false
  tables.matrixAutoUpdate = false
  tables.updateMatrix()
  marketWorld.add(tables)
  disposables.push(tableGeometry, tableMaterial)
  tints.push({
    material: tableMaterial,
    warm: new THREE.Color('#8b6b3e'),
    deep: palette.charcoal.clone(),
  })

  // market floor runners · worn earth paths break up the perfect terrain and ground the stalls
  const marketMatGeometry = new THREE.PlaneGeometry(1, 1)
  marketMatGeometry.rotateX(-Math.PI / 2)
  const marketMatMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#72502f').getHex(),
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.16,
  })
  const marketMats = new THREE.InstancedMesh(marketMatGeometry, marketMatMaterial, tableSpots.length + 2)
  const marketMatSpots = [
    { x: -3.4, z: MARKET_Z + 1.1, w: 6.8, d: 2.9, rot: 0.04 },
    { x: 3.6, z: MARKET_Z, w: 6.3, d: 2.9, rot: -0.03 },
    { x: -0.4, z: MARKET_Z - 3.6, w: 7.5, d: 3.1, rot: 0.02 },
    { x: -6.2, z: MARKET_Z - 1.2, w: 4.9, d: 2.7, rot: 0.5 },
    { x: 6.4, z: MARKET_Z + 1.6, w: 5.1, d: 2.7, rot: -0.3 },
    { x: 0, z: MARKET_Z + 5.2, w: 11, d: 1.2, rot: 0 },
    { x: 0, z: MARKET_Z - 7.1, w: 13, d: 1.4, rot: 0 },
  ]
  marketMatSpots.forEach((spot, i) => {
    const y = groundHeight(spot.x, spot.z) + 0.018
    dummy.position.set(spot.x, y, spot.z)
    dummy.rotation.set(0, spot.rot, 0)
    dummy.scale.set(spot.w, spot.d, 1)
    dummy.updateMatrix()
    marketMats.setMatrixAt(i, dummy.matrix)
  })
  marketMats.receiveShadow = false
  marketMats.matrixAutoUpdate = false
  marketMats.updateMatrix()
  marketWorld.add(marketMats)
  disposables.push(marketMatGeometry, marketMatMaterial)
  tints.push({ material: marketMatMaterial, warm: new THREE.Color('#72502f'), deep: new THREE.Color('#2f2820') })

  // produce displayed ON the tables · vibrant mounds of produce on each stall
  const tableProduceGeometry = buildMarketTomatoGeometry()
  tableProduceGeometry.scale(0.085, 0.085, 0.085)
  const tableProduceMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e33a2f'),
    vertexColors: true,
    roughness: 0.31,
    metalness: 0,
    envMapIntensity: 1.2,
    // a warm red emissive floor guarantees the produce reads red even if every
    // direct light is shadowed · it can never fall to black during the pivot
    emissive: new THREE.Color('#8f1d12'),
    emissiveIntensity: 0.22,
  })
  // Heaped display: four hex-packed layers build a low, dense dome. Every grid cell is
  // placed · the base layer fills the table edge to edge (including the front edge the
  // camera sees), and each layer above steps in toward the centre. The pile stays
  // shallow (~0.5 m) so no tomato sits high in the air against the background.
  const layerShrink = [1, 0.65, 0.4, 0.18]
  const gridCounts = tableSpots.map((spot) =>
    layerShrink.map((shrink) => {
      const dx = 2.35 * 0.08
      const dy = 2.05 * 0.08
      const cols = Math.max(1, Math.floor((spot.w * 0.9 * shrink) / dx))
      const rows = Math.max(1, Math.floor((spot.d * 0.88 * shrink) / dy))
      return { cols, rows }
    }),
  )
  const tableCounts = gridCounts.map((layers) =>
    layers.reduce((sum, { cols, rows }) => sum + cols * rows, 0),
  )
  const produceTotal = tableCounts.reduce((sum, count) => sum + count, 0)
  const tableProduce = new THREE.InstancedMesh(
    tableProduceGeometry, tableProduceMaterial, produceTotal
  )
  // hundreds of interleaved instances would only smear the shadow map into noise
  tableProduce.castShadow = false
  const tableProduceColours = [
    new THREE.Color('#e33a2f'),
    new THREE.Color('#cf2f25'),
    new THREE.Color('#ef4b35'),
    new THREE.Color('#b9221c'),
    new THREE.Color('#dc3628'),
  ]
  const tableOffsets: number[] = []
  {
    let acc = 0
    tableCounts.forEach((count) => {
      tableOffsets.push(acc)
      acc += count
    })
  }
  const tpTone = new THREE.Color()
  tableSpots.forEach((spot, ti) => {
    const offset = tableOffsets[ti]
    const baseY = groundHeight(spot.x, spot.z) + 0.895 // table top surface
    const baseTone = tableProduceColours[ti % tableProduceColours.length]
    const cosRot = Math.cos(spot.rot)
    const sinRot = Math.sin(spot.rot)
    let p = 0
    layerShrink.forEach((shrink, k) => {
      const { cols, rows } = gridCounts[ti][k]
      // fixed spacing · must match gridCounts so the placed grid never exceeds the footprint
      const dx = 2.35 * 0.08
      const dy = 2.05 * 0.08
      const halfW = spot.w * 0.45 * shrink
      const halfD = spot.d * 0.44 * shrink
      for (let ri = 0; ri < rows; ri += 1) {
        for (let ci = 0; ci < cols; ci += 1) {
          const off = (ri % 2) * 0.5 * dx
          const rr = 0.07 + random() * 0.02
          const lx = -halfW + ci * dx + off + (random() - 0.5) * 0.3 * rr
          const lz = -halfD + ri * dy + (random() - 0.5) * 0.3 * rr
          dummy.position.set(
            spot.x + lx * cosRot - lz * sinRot,
            baseY + rr * (1 + 1.6 * k) + (random() - 0.5) * 0.02,
            spot.z + lx * sinRot + lz * cosRot,
          )
          dummy.rotation.set((random() - 0.5) * 0.8, spot.rot + random() * Math.PI * 2, (random() - 0.5) * 0.8)
          dummy.scale.setScalar(rr / 0.085)
          dummy.updateMatrix()
          tableProduce.setMatrixAt(offset + p, dummy.matrix)
          tpTone.copy(baseTone).offsetHSL(
            (random() - 0.5) * 0.05,
            (random() - 0.5) * 0.08,
            (random() - 0.5) * 0.1,
          )
          tableProduce.setColorAt(offset + p, tpTone)
          p += 1
        }
      }
    })
  })
  tableProduce.matrixAutoUpdate = false
  tableProduce.updateMatrix()
  if (tableProduce.instanceColor) tableProduce.instanceColor.needsUpdate = true
  marketWorld.add(tableProduce)
  disposables.push(tableProduceGeometry, tableProduceMaterial)

  // woven produce baskets · small, irregular containers break up the repeated table geometry
  const basketRingGeometry = new THREE.TorusGeometry(0.30, 0.045, 6, 18)
  const basketBodyGeometry = new THREE.CylinderGeometry(0.30, 0.24, 0.22, 14, 1, true)
  const basketMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#a36f37').getHex(),
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.45,
  })
  const basketSpots = [
    { x: -5.2, z: MARKET_Z + 0.7, scale: 1.0 },
    { x: 4.9, z: MARKET_Z - 0.35, scale: 0.92 },
    { x: 1.1, z: MARKET_Z - 4.0, scale: 0.86 },
    { x: -0.8, z: MARKET_Z + 2.35, scale: 0.78 },
  ]
  basketSpots.forEach((spot, index) => {
    const y = groundHeight(spot.x, spot.z) + 0.12
    const body = new THREE.Mesh(basketBodyGeometry, basketMaterial)
    body.position.set(spot.x, y, spot.z)
    body.scale.setScalar(spot.scale)
    body.rotation.y = index * 0.7
    body.receiveShadow = castsShadows
    body.castShadow = castsShadows
    marketWorld.add(body)

    const rim = new THREE.Mesh(basketRingGeometry, basketMaterial)
    rim.position.set(spot.x, y + 0.11 * spot.scale, spot.z)
    rim.scale.setScalar(spot.scale)
    rim.rotation.x = Math.PI / 2
    rim.rotation.y = index * 0.7
    rim.castShadow = castsShadows
    marketWorld.add(rim)
  })
  disposables.push(basketRingGeometry, basketBodyGeometry, basketMaterial)

  // heaped tomatoes in the baskets · piled above the rims so the baskets read as full
  // produce baskets instead of empty dark interiors
  const basketProduceGeometry = buildMarketTomatoGeometry()
  basketProduceGeometry.scale(0.075, 0.075, 0.075)
  const basketProduceMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e33a2f'),
    vertexColors: true,
    roughness: 0.31,
    metalness: 0,
    envMapIntensity: 1.2,
    emissive: new THREE.Color('#8f1d12'),
    emissiveIntensity: 0.22,
  })
  const basketPerBasket = 12
  const basketProduce = new THREE.InstancedMesh(
    basketProduceGeometry, basketProduceMaterial, basketSpots.length * basketPerBasket
  )
  basketProduce.castShadow = false
  const basketProduceColours = [
    new THREE.Color('#e33a2f'),
    new THREE.Color('#cf2f25'),
    new THREE.Color('#ef4b35'),
  ]
  const bpTone = new THREE.Color()
  basketSpots.forEach((spot, bi) => {
    const y0 = groundHeight(spot.x, spot.z) + 0.12 * spot.scale
    const baseTone = basketProduceColours[bi % basketProduceColours.length]
    for (let h = 0; h < basketPerBasket; h += 1) {
      const idx = bi * basketPerBasket + h
      const rr = 0.055 + random() * 0.015
      const ring = h < 8 ? 0 : 1
      const maxD = (ring === 0 ? 0.2 : 0.12) * spot.scale
      const ang = random() * Math.PI * 2
      const rad = Math.sqrt(random()) * maxD
      dummy.position.set(
        spot.x + Math.cos(ang) * rad,
        y0 + rr * (ring === 0 ? 1.8 : 3.4) + (random() - 0.5) * 0.02,
        spot.z + Math.sin(ang) * rad,
      )
      dummy.rotation.set((random() - 0.5) * 0.8, random() * Math.PI * 2, (random() - 0.5) * 0.8)
      dummy.scale.setScalar(rr / 0.075)
      dummy.updateMatrix()
      basketProduce.setMatrixAt(idx, dummy.matrix)
      bpTone.copy(baseTone).offsetHSL(
        (random() - 0.5) * 0.05,
        (random() - 0.5) * 0.08,
        (random() - 0.5) * 0.1,
      )
      basketProduce.setColorAt(idx, bpTone)
    }
  })
  basketProduce.matrixAutoUpdate = false
  basketProduce.updateMatrix()
  if (basketProduce.instanceColor) basketProduce.instanceColor.needsUpdate = true
  marketWorld.add(basketProduce)
  disposables.push(basketProduceGeometry, basketProduceMaterial)

  // canopy poles · vertical timber supports seated flush and directly touching the canopies
  const poleGeometry = new THREE.CylinderGeometry(0.06, 0.08, 2.75, 8)
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#6e5430'),
    roughness: 0.85,
    metalness: 0,
    envMapIntensity: 0.5,
  })
  const polesPerTable = 4
  const poles = new THREE.InstancedMesh(poleGeometry, poleMaterial, tableSpots.length * polesPerTable)
  tableSpots.forEach((spot, ti) => {
    const y = groundHeight(spot.x, spot.z)
    const hw = spot.w * 0.44
    const hd = spot.d * 0.44
    const poleOffsets = [
      { px: -hw, pz: -hd },
      { px: hw, pz: -hd },
      { px: -hw, pz: hd },
      { px: hw, pz: hd },
    ]
    poleOffsets.forEach((po, pi) => {
      dummy.position.set(spot.x + po.px, y + 1.375, spot.z + po.pz)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      poles.setMatrixAt(ti * polesPerTable + pi, dummy.matrix)
    })
  })
  poles.castShadow = false
  poles.matrixAutoUpdate = false
  poles.updateMatrix()
  marketWorld.add(poles)
  disposables.push(poleGeometry, poleMaterial)
  tints.push({ material: poleMaterial, warm: new THREE.Color('#6e5430'), deep: palette.charcoal.clone() })

  // canopies · draped cloth with slight sag, seated directly on the timber support poles
  const canopyGeometry = new THREE.PlaneGeometry(7, 3.6, 16, 8)
  {
    const pos = canopyGeometry.attributes.position
    for (let i = 0; i < pos.count; i += 1) {
      const u = pos.getX(i) / 3.5  // -1..1
      const v = pos.getY(i) / 1.7  // -1..1
      // gentle catenary sag, deepest at centre
      pos.setZ(i, (pos.getZ(i) || 0) - (1 - u * u) * (1 - v * v) * 0.35)
    }
    canopyGeometry.computeVertexNormals()
  }
  const canopyColours = [
    new THREE.Color('#d4a04a'),  // warm ochre
    new THREE.Color('#c4533e'),  // rusty red
    new THREE.Color('#e8dcc8'),  // cream
    new THREE.Color('#b87840'),  // sienna
    new THREE.Color('#d4a04a'),  // warm ochre (repeat)
  ]
  const canopyMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.85,
  })
  const canopies = new THREE.InstancedMesh(canopyGeometry, canopyMaterial, tableSpots.length)
  const canopyColor = new THREE.Color()
  tableSpots.forEach((spot, index) => {
    const canopyY = groundHeight(spot.x, spot.z) + 2.75
    dummy.position.set(spot.x, canopyY, spot.z + 0.1)
    dummy.rotation.set(-Math.PI / 2.35, 0, index % 2 === 0 ? 0.04 : -0.04)
    dummy.scale.set(spot.w / 7, 1, 1)
    dummy.updateMatrix()
    canopies.setMatrixAt(index, dummy.matrix)
    canopyColor.copy(canopyColours[index % canopyColours.length])
    canopies.setColorAt(index, canopyColor)
  })
  if (canopies.instanceColor) canopies.instanceColor.needsUpdate = true
  canopies.castShadow = false
  canopies.matrixAutoUpdate = false
  canopies.updateMatrix()
  marketWorld.add(canopies)
  disposables.push(canopyGeometry, canopyMaterial)
  tints.push({ material: canopyMaterial, warm: new THREE.Color('#ffffff'), deep: palette.charcoal.clone() })

  /* atmospheric dressing · suspended market dust + warm practical lanterns */
  const marketDustGeometry = makePointsGeometry(budget.tier === 0 ? 30 : 80, random, 20, 2.6, 9, 0.45)
  const marketDustMaterial = new THREE.PointsMaterial({
    color: new THREE.Color('#f6d8ad').getHex(),
    size: budget.tier === 0 ? 0.02 : 0.026,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const marketDust = new THREE.Points(marketDustGeometry, marketDustMaterial)
  marketDust.position.set(0, 0.4, MARKET_Z - 0.5)
  marketWorld.add(marketDust)
  disposables.push(marketDustGeometry, marketDustMaterial)

  const lanternPositions = [
    [-5.1, 2.4, MARKET_Z - 0.2],
    [5.1, 2.35, MARKET_Z + 0.4],
    [0.2, 2.65, MARKET_Z - 3.6],
    [-2.4, 2.55, MARKET_Z + 1.5],
    [2.8, 2.5, MARKET_Z + 1.2],
  ]
  const lanternGeometry = new THREE.BufferGeometry()
  lanternGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lanternPositions.flat(), 3))
  const lanternMaterial = new THREE.PointsMaterial({
    color: new THREE.Color('#ffcf82').getHex(),
    size: 0.18,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const marketLanterns = new THREE.Points(lanternGeometry, lanternMaterial)
  marketWorld.add(marketLanterns)
  disposables.push(lanternGeometry, lanternMaterial)

  // Dedicated market fill seated below the canopies so produce stays warm without any top piercing light
  const marketProduceLight = new THREE.PointLight(0xffc77d, 6, 12, 1.5)
  marketProduceLight.position.set(0, 2.35, MARKET_Z + 0.8)
  marketProduceLight.castShadow = false
  marketWorld.add(marketProduceLight)

  // A second fill light among the stalls keeps the produce mounds under the canopies warm and red
  const marketFillLight = new THREE.PointLight(0xffc27a, 6, 12, 1.5)
  marketFillLight.position.set(0, 2.2, MARKET_Z)
  marketFillLight.castShadow = false
  marketWorld.add(marketFillLight)

  // tier 0 runs no shadow map, so it gets painted contact shadows instead
  if (budget.useContactDecals) {
    const decalTexture = makeRadialTexture('rgba(0,0,0,0.55)', 'rgba(0,0,0,0.2)')
    const decalGeometry = new THREE.PlaneGeometry(1, 1)
    decalGeometry.rotateX(-Math.PI / 2)
    const decalMaterial = new THREE.MeshBasicMaterial({
      map: decalTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    })
    const spots = [
      ...crateSpots.slice(0, budget.crates).map((s) => ({ x: s.x, z: s.z, scale: s.scale })),
      ...tableSpots.map((t) => ({ x: t.x, z: t.z, scale: 2.4 })),
    ]
    const decals = new THREE.InstancedMesh(decalGeometry, decalMaterial, spots.length)
    spots.forEach((spot, index) => {
      dummy.position.set(spot.x + 0.5, groundHeight(spot.x, spot.z) + 0.04, spot.z + 0.3)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(3.6 * spot.scale, 1, 3 * spot.scale)
      dummy.updateMatrix()
      decals.setMatrixAt(index, dummy.matrix)
    })
    decals.matrixAutoUpdate = false
    decals.updateMatrix()
    decals.renderOrder = 1
    warmWorld.add(decals)
    disposables.push(decalGeometry, decalMaterial, decalTexture)
  }

  /*
   * 02 THE SCAN · the hero tomato sits on a clean stone inspection pedestal at the far edge of
   * the field, off the farmland, and Fresco reads it. No hand, no phone: a soft key light, a
   * scanning ring, a band that sweeps the fruit and a halo as the read resolves. The fruit
   * alone stands on the pedestal · nothing to compete with the subject at the money shot.
   */
  const scanBaseY = groundHeight(SCAN_TOMATO.x, SCAN_TOMATO.z)

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: palette.sand.clone().lerp(palette.canvas, 0.35).getHex(),
    roughness: 0.62,
    metalness: 0,
    envMapIntensity: 0.75,
  })

  // a wide, low base slab · the station reads as a permanent installation, its footing
  // seated on the level bed carved out of the farmland
  const plinthBaseGeometry = new THREE.CylinderGeometry(1.15, 1.32, 0.22, 32)
  const base = new THREE.Mesh(plinthBaseGeometry, stoneMaterial)
  base.position.set(SCAN_TOMATO.x, scanBaseY + 0.11, SCAN_TOMATO.z)
  base.receiveShadow = castsShadows
  base.castShadow = castsShadows
  warmWorld.add(base)

  // the tapered plinth body rising from the base
  const plinthBodyGeometry = new THREE.CylinderGeometry(0.42, 0.78, 0.5, 28)
  const plinth = new THREE.Mesh(plinthBodyGeometry, stoneMaterial)
  plinth.position.set(SCAN_TOMATO.x, scanBaseY + 0.47, SCAN_TOMATO.z)
  plinth.castShadow = castsShadows
  warmWorld.add(plinth)

  // the top disc the fruit rests on · chamfered lip, top exactly at the fruit's resting height
  const topDiscGeometry = new THREE.CylinderGeometry(0.33, 0.4, 0.07, 28)
  const topDisc = new THREE.Mesh(topDiscGeometry, stoneMaterial)
  topDisc.position.set(SCAN_TOMATO.x, scanBaseY + 0.755, SCAN_TOMATO.z)
  topDisc.receiveShadow = castsShadows
  topDisc.castShadow = castsShadows
  warmWorld.add(topDisc)
  disposables.push(plinthBaseGeometry, plinthBodyGeometry, topDiscGeometry, stoneMaterial)
  tints.push({
    material: stoneMaterial,
    warm: palette.sand.clone().lerp(palette.canvas, 0.35),
    deep: palette.charcoal.clone(),
  })

  // gold rings · one around the base, one under the lip of the top disc · read the station
  // as a deliberate, clean set piece
  const inlayMaterial = new THREE.MeshBasicMaterial({
    color: palette.gold.getHex(),
    transparent: true,
    opacity: 0.7,
    fog: false,
  })
  const baseInlayGeometry = new THREE.TorusGeometry(0.95, 0.012, 8, 64)
  baseInlayGeometry.rotateX(Math.PI / 2)
  const baseInlay = new THREE.Mesh(baseInlayGeometry, inlayMaterial)
  baseInlay.position.set(SCAN_TOMATO.x, scanBaseY + 0.21, SCAN_TOMATO.z)
  baseInlay.renderOrder = 2
  warmWorld.add(baseInlay)
  const lipInlayGeometry = new THREE.TorusGeometry(0.35, 0.01, 8, 64)
  lipInlayGeometry.rotateX(Math.PI / 2)
  const lipInlay = new THREE.Mesh(lipInlayGeometry, inlayMaterial)
  lipInlay.position.set(SCAN_TOMATO.x, scanBaseY + 0.76, SCAN_TOMATO.z)
  lipInlay.renderOrder = 2
  warmWorld.add(lipInlay)
  disposables.push(baseInlayGeometry, lipInlayGeometry, inlayMaterial)

  // the hero fruit, with a calyx star and stem stub so it reads as picked, not printed
  const scanFruitGeometry = new THREE.SphereGeometry(0.075, 20, 14)
  const scanFruitMaterial = new THREE.MeshStandardMaterial({
    color: palette.clay.clone().lerp(new THREE.Color('#d8452e'), 0.62).getHex(),
    emissive: palette.gold.clone().multiplyScalar(0.35).getHex(),
    emissiveIntensity: 0.1,
    roughness: 0.26,
    metalness: 0,
    envMapIntensity: 1.3,
  })
  const scanFruit = new THREE.Mesh(scanFruitGeometry, scanFruitMaterial)
  scanFruit.position.copy(SCAN_TOMATO)
  scanFruit.rotation.set(0, 0.4, 0)
  scanFruit.castShadow = castsShadows
  warmWorld.add(scanFruit)

  const calyxGeometry = buildCalyxGeometry()
  const calyxMaterial = new THREE.MeshStandardMaterial({
    color: palette.leaf.clone().lerp(new THREE.Color('#93a75a'), 0.4).getHex(),
    roughness: 0.85,
    metalness: 0,
    envMapIntensity: 0.5,
  })
  const scanCalyx = new THREE.Mesh(calyxGeometry, calyxMaterial)
  scanCalyx.position.set(SCAN_TOMATO.x, SCAN_TOMATO.y + 0.055, SCAN_TOMATO.z)
  scanCalyx.castShadow = castsShadows
  warmWorld.add(scanCalyx)

  /* premium inspection station · physical sensor hardware around the hero fruit */
  const scanStationGroup = new THREE.Group()
  scanStationGroup.position.set(SCAN_TOMATO.x, scanBaseY + 0.78, SCAN_TOMATO.z)
  warmWorld.add(scanStationGroup)

  const scanMetalMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d8d1c0').getHex(),
    roughness: 0.24,
    metalness: 0.78,
    envMapIntensity: 1.35,
  })
  const scanDarkMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2a2923').getHex(),
    roughness: 0.38,
    metalness: 0.55,
    envMapIntensity: 0.9,
  })

  const sensorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.06, 40), scanMetalMaterial)
  sensorBase.position.y = 0.03
  scanStationGroup.add(sensorBase)

  const sensorCollar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.025, 8, 64), scanDarkMaterial)
  sensorCollar.rotation.x = Math.PI / 2
  sensorCollar.position.y = 0.065
  scanStationGroup.add(sensorCollar)

  const sensorArm = new THREE.Group()
  sensorArm.position.set(0.38, 0.18, 0.02)
  const armStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.72, 10), scanMetalMaterial)
  armStem.position.y = 0.36
  armStem.rotation.z = -0.12
  sensorArm.add(armStem)
  const armHead = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.14), scanDarkMaterial)
  armHead.position.set(-0.02, 0.7, 0)
  armHead.rotation.z = -0.12
  sensorArm.add(armHead)
  const sensorLens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.016, 18), makeEmissionMaterial(palette.gold.clone().lerp(new THREE.Color('#fff6da'), 0.7), 0.95))
  sensorLens.rotation.z = Math.PI / 2
  sensorLens.position.set(-0.12, 0.7, 0)
  sensorArm.add(sensorLens)
  scanStationGroup.add(sensorArm)

  const domeGeometry = new THREE.SphereGeometry(0.52, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.62)
  const scanDomeMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#edf1ed').getHex(),
    roughness: 0.08,
    metalness: 0.05,
    transmission: 0.18,
    thickness: 0.08,
    transparent: true,
    opacity: 0.18,
    envMapIntensity: 1.25,
    side: THREE.DoubleSide,
  })
  const scanDome = new THREE.Mesh(domeGeometry, scanDomeMaterial)
  scanDome.position.y = 0.03
  scanStationGroup.add(scanDome)

  const statusLight = new THREE.PointLight(palette.gold.getHex(), 0.25, 2.2, 2)
  statusLight.position.set(0.38, 0.76, 0.02)
  warmWorld.add(statusLight)

  disposables.push(scanMetalMaterial, scanDarkMaterial, domeGeometry, scanDomeMaterial)

  disposables.push(scanFruitGeometry, scanFruitMaterial, calyxGeometry, calyxMaterial)
  disposables.push(scanFruitGeometry, scanFruitMaterial, calyxGeometry, calyxMaterial)
  tints.push({
    material: scanFruitMaterial,
    warm: palette.clay.clone().lerp(new THREE.Color('#d8452e'), 0.62),
    deep: palette.charcoal.clone(),
  })
  tints.push({
    material: calyxMaterial,
    warm: palette.leaf.clone().lerp(new THREE.Color('#93a75a'), 0.4),
    deep: palette.charcoal.clone(),
  })

  // a soft key light on the pedestal, on only while the stage is scanning
  const scanSpot = new THREE.SpotLight(0xfff2d4, 0, 16, 0.5, 0.65, 1.25)
  scanSpot.position.set(SCAN_TOMATO.x + 1.7, SCAN_TOMATO.y + 3.6, SCAN_TOMATO.z + 2.4)
  scanSpot.target.position.set(SCAN_TOMATO.x, SCAN_TOMATO.y - 0.1, SCAN_TOMATO.z)
  warmWorld.add(scanSpot)
  warmWorld.add(scanSpot.target)

  // 02 THE SCAN · High-tech biometric laser sweep sheet, holographic HUD ring, and verification glow
  const scanLaserTexture = makeRadialTexture('rgba(52, 211, 153, 0.85)', 'rgba(6, 182, 212, 0)')
  const scanBeamGeometry = new THREE.PlaneGeometry(0.68, 0.68)
  scanBeamGeometry.rotateX(-Math.PI / 2)
  const scanBeamMaterial = new THREE.MeshBasicMaterial({
    map: scanLaserTexture,
    color: 0x34D399, // biometric emerald
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
  })
  const scanBeam = new THREE.Mesh(scanBeamGeometry, scanBeamMaterial)
  scanBeam.position.copy(SCAN_TOMATO)
  scanBeam.renderOrder = 4
  warmWorld.add(scanBeam)

  // Focused focal line slicing through the tomato
  const scanTrailGeometry = new THREE.BoxGeometry(0.52, 0.008, 0.012)
  const scanTrailMaterial = new THREE.MeshBasicMaterial({
    color: 0x67E8F9, // laser cyan
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
  const scanTrail = new THREE.Mesh(scanTrailGeometry, scanTrailMaterial)
  scanTrail.position.copy(SCAN_TOMATO)
  scanTrail.renderOrder = 5
  warmWorld.add(scanTrail)

  // Holographic rotating HUD targeting reticle ring
  const scanRingGeometry = new THREE.RingGeometry(0.24, 0.265, 48)
  scanRingGeometry.rotateX(-Math.PI / 2)
  const scanRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x10B981,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
  })
  const scanRing = new THREE.Mesh(scanRingGeometry, scanRingMaterial)
  scanRing.position.copy(SCAN_TOMATO)
  scanRing.renderOrder = 4
  warmWorld.add(scanRing)

  // Verified Grade-A biometric certification halo
  const scanGlowTexture = makeRadialTexture('rgba(16, 185, 129, 0.85)', 'rgba(245, 158, 11, 0)')
  const scanGlowGeometry = new THREE.PlaneGeometry(0.85, 0.85)
  const scanGlowMaterial = new THREE.MeshBasicMaterial({
    map: scanGlowTexture,
    color: 0x10B981,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
  })
  const scanGlow = new THREE.Mesh(scanGlowGeometry, scanGlowMaterial)
  scanGlow.position.copy(SCAN_TOMATO)
  scanGlow.renderOrder = 3
  warmWorld.add(scanGlow)

  disposables.push(
    scanLaserTexture, scanBeamGeometry, scanBeamMaterial,
    scanTrailGeometry, scanTrailMaterial,
    scanRingGeometry, scanRingMaterial,
    scanGlowTexture, scanGlowGeometry, scanGlowMaterial,
  )

  // 03 THE MARKET · economic signal handle (suppressed to prevent shed roof penetration)
  const shaftGeometry = new THREE.PlaneGeometry(0.1, 0.1)
  const shaftMaterial = new THREE.MeshBasicMaterial({
    color: palette.gold.getHex(),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    visible: false,
  })
  const marketShaft = new THREE.Mesh(shaftGeometry, shaftMaterial)
  marketShaft.visible = false
  disposables.push(shaftGeometry, shaftMaterial)

  /* ---- deep world ---- */
  const deepWorld = new THREE.Group()
  scene.add(deepWorld)

  // Stage 04 roadside environment · professional ornamental trees only; no tall wood/slat walls.
  const roadsideTrees = new THREE.Group()
  const treeTrunkGeometry = new THREE.CylinderGeometry(0.09, 0.15, 1.35, 8)
  const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4B3224').getHex(),
    roughness: 0.92,
    metalness: 0,
  })
  const treeCrownGeometry = new THREE.IcosahedronGeometry(0.92, 1)
  const treeCrownMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#315B3D').getHex(),
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 0.48,
  })
  const treeCrown2Geometry = new THREE.IcosahedronGeometry(0.62, 1)
  const treeCrown2Material = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#52784F').getHex(),
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.4,
  })
  // Fewer trees on low-end tier for performance
  const treePositions = budget.tier === 0
    ? [
        [-1, -66.5, 0.82], [1, -67.5, 0.88],
        [-1, -81.0, 0.90], [1, -81.8, 1.02],
        [-1, -96.0, 1.04], [1, -97.0, 0.92],
      ] as const
    : [
        [-1, -66.5, 0.82], [1, -67.5, 0.88],
        [-1, -73.5, 1.02], [1, -74.8, 0.92],
        [-1, -81.0, 0.90], [1, -81.8, 1.02],
        [-1, -88.5, 0.98], [1, -89.8, 0.86],
        [-1, -96.0, 1.04], [1, -97.0, 0.92],
        [-1, -103.0, 0.90], [1, -104.0, 1.02],
      ] as const
  for (const [side, z, scale] of treePositions) {
    const x = TRUCK_LANE_X + side * (6.4 + ((Math.abs(z) * 11) % 3) * 0.18)
    const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial)
    trunk.position.set(x, 0.68, z)
    trunk.scale.set(scale, scale, scale)
    roadsideTrees.add(trunk)

    const lower = new THREE.Mesh(treeCrownGeometry, treeCrownMaterial)
    lower.position.set(x, 1.78 * scale, z)
    lower.scale.set(scale * 0.95, scale * 0.82, scale * 0.95)
    roadsideTrees.add(lower)

    const upper = new THREE.Mesh(treeCrown2Geometry, treeCrown2Material)
    upper.position.set(x - side * 0.08, 2.42 * scale, z - 0.06)
    upper.scale.setScalar(scale * 0.74)
    roadsideTrees.add(upper)
  }
  roadsideTrees.traverse((o) => { if (o instanceof THREE.Mesh) o.castShadow = false })
  deepWorld.add(roadsideTrees)
  disposables.push(
    treeTrunkGeometry, treeTrunkMaterial,
    treeCrownGeometry, treeCrownMaterial,
    treeCrown2Geometry, treeCrown2Material,
  )

  // Stage 04 road · a true black carriageway that follows the terrain so the field can never
  // visually bury the road during the warm-to-dark transition.
  const ROAD_Z_START = -60.5
  const ROAD_Z_END = -107.5
  const ROAD_WIDTH = 7.8
  const roadSegments = 96
  const roadPositions = new Float32Array((roadSegments + 1) * 2 * 3)
  const roadUvs = new Float32Array((roadSegments + 1) * 2 * 2)
  const roadIndices: number[] = []
  for (let i = 0; i <= roadSegments; i += 1) {
    const t = i / roadSegments
    const z = lerp(ROAD_Z_START, ROAD_Z_END, t)
    const yLeft = groundHeight(TRUCK_LANE_X - ROAD_WIDTH / 2, z) + 0.055
    const yRight = groundHeight(TRUCK_LANE_X + ROAD_WIDTH / 2, z) + 0.055
    const base = i * 6
    roadPositions[base] = TRUCK_LANE_X - ROAD_WIDTH / 2
    roadPositions[base + 1] = yLeft
    roadPositions[base + 2] = z
    roadPositions[base + 3] = TRUCK_LANE_X + ROAD_WIDTH / 2
    roadPositions[base + 4] = yRight
    roadPositions[base + 5] = z
    const uv = i * 4
    roadUvs[uv] = 0
    roadUvs[uv + 1] = t
    roadUvs[uv + 2] = 1
    roadUvs[uv + 3] = t
    if (i < roadSegments) {
      const a = i * 2
      const b = (i + 1) * 2
      roadIndices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const roadGeometry = new THREE.BufferGeometry()
  roadGeometry.setAttribute('position', new THREE.BufferAttribute(roadPositions, 3))
  roadGeometry.setAttribute('uv', new THREE.BufferAttribute(roadUvs, 2))
  roadGeometry.setIndex(roadIndices)
  roadGeometry.computeVertexNormals()
  const roadMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#05070A').getHex(),
    transparent: false,
    fog: false,
  })
  const road = new THREE.Mesh(roadGeometry, roadMaterial)
  road.receiveShadow = false
  deepWorld.add(road)

  const roadYAt = (z: number, x = TRUCK_LANE_X) => groundHeight(x, z) + 0.09

  const shoulderGeometry = new THREE.BoxGeometry(0.34, 0.10, 1.0)
  const shoulderMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#292D37').getHex(),
    roughness: 0.9,
    metalness: 0.02,
  })
  for (const sx of [TRUCK_LANE_X - 3.86, TRUCK_LANE_X + 3.86]) {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.10, ROAD_Z_START - ROAD_Z_END), shoulderMaterial)
    shoulder.position.set(sx, 0.06, (ROAD_Z_START + ROAD_Z_END) / 2)
    deepWorld.add(shoulder)
  }

  const roadEdgeGeometry = new THREE.BoxGeometry(0.075, 0.035, 1.2)
  const roadEdgeMaterial = new THREE.MeshBasicMaterial({
    color: palette.gold.getHex(),
    transparent: true,
    opacity: 0.72,
    fog: false,
  })
  for (const ex of [TRUCK_LANE_X - 3.45, TRUCK_LANE_X + 3.45]) {
    for (let dz = -61.0; dz >= -107.0; dz -= 1.5) {
      const edge = new THREE.Mesh(roadEdgeGeometry, roadEdgeMaterial)
      edge.position.set(ex, roadYAt(dz), dz)
      deepWorld.add(edge)
    }
  }

  const dashGeometry = new THREE.BoxGeometry(0.095, 0.04, 1.35)
  const dashMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#D9DEE8').getHex(),
    transparent: true,
    opacity: 0.7,
    fog: false,
  })
  for (let dz = -61; dz >= -106; dz -= 2.65) {
    const dash = new THREE.Mesh(dashGeometry, dashMaterial)
    dash.position.set(TRUCK_LANE_X, roadYAt(dz), dz)
    deepWorld.add(dash)
  }

  // Streetlights run beside both edges of the delivery lane. Their pools of warm light
  // make the road legible without overpowering the truck's blue/yellow silhouette.
  const deliveryStreetLights = new THREE.Group()
  const lampPoleMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2E3443').getHex(),
    roughness: 0.48,
    metalness: 0.58,
    envMapIntensity: 0.7,
  })
  const lampGlowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#FFE7A8').getHex(),
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
  const lampPointLights: THREE.PointLight[] = []
  const lampPoleGeometry = new THREE.CylinderGeometry(0.055, 0.085, 3.65, 8)
  const lampArmGeometry = new THREE.BoxGeometry(0.72, 0.055, 0.055)
  const lampHeadGeometry = new THREE.BoxGeometry(0.18, 0.08, 0.26)
  const lightCount = budget.tier === 0 ? 3 : 6
  for (let lightIndex = 0; lightIndex < lightCount; lightIndex += 1) {
    const z = -69.5 - lightIndex * 7.0
    for (const side of [-1, 1]) {
      const x = TRUCK_LANE_X + side * 5.0
      const pole = new THREE.Mesh(lampPoleGeometry, lampPoleMaterial)
      pole.position.set(x, 1.825, z)
      pole.castShadow = false
      pole.receiveShadow = false
      deliveryStreetLights.add(pole)

      const arm = new THREE.Mesh(lampArmGeometry, lampPoleMaterial)
      arm.position.set(x - side * 0.30, 3.60, z)
      deliveryStreetLights.add(arm)

      const head = new THREE.Mesh(lampHeadGeometry, lampGlowMaterial.clone())
      head.position.set(x - side * 0.66, 3.54, z)
      deliveryStreetLights.add(head)

      // One live light per pair is enough; the opposite fixture remains emissive.
      if (side === -1 || lightIndex % 2 === 1) {
        const light = new THREE.PointLight(0xFFE2A1, 1.25, 7.0, 1.9)
        light.position.set(x - side * 0.66, 3.45, z)
        deliveryStreetLights.add(light)
        lampPointLights.push(light)
      }
    }
  }
  deepWorld.add(deliveryStreetLights)

  // Subtle warm reflections on the black road. These are visual reflection decals, so the
  // result still reads correctly on low-end GPUs without multiplying expensive lights.
  const reflectionTexture = makeRadialTexture('rgba(255,224,156,0.30)', 'rgba(255,224,156,0.09)')
  const reflectionGeometry = new THREE.PlaneGeometry(2.2, 3.4)
  reflectionGeometry.rotateX(-Math.PI / 2)
  const reflectionMaterial = new THREE.MeshBasicMaterial({
    map: reflectionTexture,
    color: new THREE.Color('#FFE4A6').getHex(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
  const streetLightReflections: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []
  for (let lightIndex = 0; lightIndex < lightCount; lightIndex += 1) {
    const z = -69.5 - lightIndex * 7.0
    const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial.clone())
    reflection.position.set(TRUCK_LANE_X, roadYAt(z) + 0.018, z)
    reflection.scale.set(1.45, 1.0, 1.90)
    reflection.rotation.z = (lightIndex % 2 === 0 ? 1 : -1) * 0.035
    deepWorld.add(reflection)
    streetLightReflections.push(reflection)
  }

  disposables.push(
    roadGeometry, roadMaterial, shoulderGeometry, shoulderMaterial, roadEdgeGeometry, roadEdgeMaterial,
    dashGeometry, dashMaterial, lampPoleGeometry, lampArmGeometry, lampHeadGeometry,
    lampPoleMaterial, lampGlowMaterial, reflectionGeometry, reflectionTexture, reflectionMaterial,
  )

  // =========================================================================
  // DELIVERY TRUCK · Authentic 3D translation of the Order Confirm Animation
  // Precision-crafted 3D PBR truck: royal blue aerodynamic cab (#275EFE),
  // angled forward windshield (#7699FF) with 14deg glare, recessed radiator grille,
  // dual top/bottom LED headlights (#F0DC5F) with volumetric beams, side mirrors,
  // white-to-slate gradient container (#FFFFFF -> #CDD9ED), functioning rear cargo
  // doors (+90deg/-90deg swing), 5-spoke alloy wheels, and speed lines.
  // =========================================================================
  const truckGroup = new THREE.Group()
  truckGroup.position.set(TRUCK_LANE_X, 0, TRUCK_START_Z)
  deepWorld.add(truckGroup)

  /* --- 1. Chassis & Heavy Undercarriage --- */
  const chassisGeometry = new THREE.BoxGeometry(2.36, 0.26, 6.1)
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: 0x181C26,
    roughness: 0.85,
    metalness: 0.2,
  })
  const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial)
  chassis.position.set(0, 0.34, -0.05)
  chassis.castShadow = castsShadows
  truckGroup.add(chassis)

  // Sculpted front bumper with intake cutouts
  const frontBumperGeometry = new THREE.BoxGeometry(2.46, 0.36, 0.42)
  const bumperMaterial = new THREE.MeshStandardMaterial({
    color: 0x222736,
    roughness: 0.55,
    metalness: 0.35,
  })
  const frontBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial)
  frontBumper.position.set(0, 0.36, -3.12)
  frontBumper.castShadow = castsShadows
  truckGroup.add(frontBumper)

  const bumperVentGeometry = new THREE.BoxGeometry(1.4, 0.12, 0.08)
  const bumperVentMaterial = new THREE.MeshBasicMaterial({ color: 0x0E1118 })
  const bumperVent = new THREE.Mesh(bumperVentGeometry, bumperVentMaterial)
  bumperVent.position.set(0, 0.28, -3.34)
  truckGroup.add(bumperVent)

  // Rear bumper / step bar
  const rearBumperGeometry = new THREE.BoxGeometry(2.46, 0.26, 0.36)
  const rearBumper = new THREE.Mesh(rearBumperGeometry, bumperMaterial)
  rearBumper.position.set(0, 0.34, 2.92)
  truckGroup.add(rearBumper)

  // Aerodynamic side skirts
  const skirtGeometry = new THREE.BoxGeometry(0.12, 0.28, 2.3)
  for (const sx of [-1.16, 1.16]) {
    const skirt = new THREE.Mesh(skirtGeometry, bumperMaterial)
    skirt.position.set(sx, 0.34, 0.0)
    truckGroup.add(skirt)
  }

  /* --- 2. Blue Aerodynamic Cab Body (#275EFE) --- */
  const cabPaintMaterial = new THREE.MeshStandardMaterial({
    color: 0x275EFE,
    roughness: 0.24,
    metalness: 0.22,
    envMapIntensity: 1.2,
  })

  // Lower cab base (engine compartment & lower cabin)
  const cabBaseGeometry = new THREE.BoxGeometry(2.36, 0.94, 2.1)
  const cabBase = new THREE.Mesh(cabBaseGeometry, cabPaintMaterial)
  cabBase.position.set(0, 0.94, -2.05)
  cabBase.castShadow = castsShadows
  truckGroup.add(cabBase)

  // Front hood nose curve connecting vertical grille to hood slope
  const hoodNoseGeometry = new THREE.CylinderGeometry(0.32, 0.32, 2.36, 20)
  hoodNoseGeometry.rotateZ(Math.PI / 2)
  const hoodNose = new THREE.Mesh(hoodNoseGeometry, cabPaintMaterial)
  hoodNose.position.set(0, 1.10, -3.05)
  hoodNose.castShadow = castsShadows
  truckGroup.add(hoodNose)

  // Upper cabin greenhouse
  const cabUpperGeometry = new THREE.BoxGeometry(2.32, 1.08, 1.48)
  const cabUpper = new THREE.Mesh(cabUpperGeometry, cabPaintMaterial)
  cabUpper.position.set(0, 1.88, -1.68)
  cabUpper.castShadow = castsShadows
  truckGroup.add(cabUpper)

  // Aerodynamic roof fairing / deflector rounding into the cargo container height
  const roofDeflectorGeometry = new THREE.CylinderGeometry(0.38, 0.38, 2.32, 20)
  roofDeflectorGeometry.rotateZ(Math.PI / 2)
  const roofDeflector = new THREE.Mesh(roofDeflectorGeometry, cabPaintMaterial)
  roofDeflector.position.set(0, 2.42, -1.62)
  roofDeflector.castShadow = castsShadows
  truckGroup.add(roofDeflector)

  /* --- 3. Recessed Front Radiator Grille & Logo --- */
  const grilleBoxGeometry = new THREE.BoxGeometry(1.68, 0.54, 0.12)
  const grilleBoxMaterial = new THREE.MeshStandardMaterial({
    color: 0x141824,
    roughness: 0.8,
    metalness: 0.2,
  })
  const grilleBox = new THREE.Mesh(grilleBoxGeometry, grilleBoxMaterial)
  grilleBox.position.set(0, 0.72, -3.12)
  truckGroup.add(grilleBox)

  const slatGeometry = new THREE.BoxGeometry(1.58, 0.035, 0.04)
  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xD6DEEB,
    roughness: 0.15,
    metalness: 0.85,
    envMapIntensity: 1.3,
  })
  for (const sy of [0.85, 0.72, 0.59]) {
    const slat = new THREE.Mesh(slatGeometry, chromeMaterial)
    slat.position.set(0, sy, -3.19)
    truckGroup.add(slat)
  }

  // Fresco center chrome emblem
  const emblemGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16)
  emblemGeometry.rotateX(Math.PI / 2)
  const emblem = new THREE.Mesh(emblemGeometry, chromeMaterial)
  emblem.position.set(0, 0.72, -3.20)
  truckGroup.add(emblem)

  /* --- 4. 3D Forward-Facing Angled Windshield & Side Windows --- */
  const windowCanvas = document.createElement('canvas')
  windowCanvas.width = 256
  windowCanvas.height = 128
  const windowCtx = windowCanvas.getContext('2d')!
  windowCtx.fillStyle = '#7699FF'
  windowCtx.fillRect(0, 0, 256, 128)
  // Dark bottom dashboard tint
  windowCtx.fillStyle = '#1C212E'
  windowCtx.fillRect(0, 96, 256, 32)
  // 14deg diagonal reflection highlight bars (matching HTML template)
  windowCtx.fillStyle = 'rgba(255, 255, 255, 0.48)'
  windowCtx.save()
  windowCtx.translate(140, 48)
  windowCtx.transform(1, 0.25, 0, 1, 0, 0)
  windowCtx.fillRect(-45, -6, 90, 12)
  windowCtx.translate(0, 34)
  windowCtx.fillRect(-45, -6, 90, 12)
  windowCtx.restore()

  const windowTexture = new THREE.CanvasTexture(windowCanvas)
  windowTexture.magFilter = THREE.LinearFilter
  const windshieldMaterial = new THREE.MeshStandardMaterial({
    map: windowTexture,
    roughness: 0.05,
    metalness: 0.45,
    envMapIntensity: 1.4,
  })

  // Solid 3D angled windshield glass (sloped at 16deg facing front)
  const windshieldGeometry = new THREE.BoxGeometry(2.16, 0.96, 0.06)
  const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial)
  windshield.position.set(0, 1.94, -2.40)
  windshield.rotation.x = -0.28
  truckGroup.add(windshield)

  // Dark A-pillar frame borders on left & right
  const aPillarGeometry = new THREE.BoxGeometry(0.08, 0.98, 0.08)
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x1C212E,
    roughness: 0.6,
    metalness: 0.2,
  })
  for (const ax of [-1.11, 1.11]) {
    const aPillar = new THREE.Mesh(aPillarGeometry, pillarMaterial)
    aPillar.position.set(ax, 1.94, -2.40)
    aPillar.rotation.x = -0.28
    truckGroup.add(aPillar)
  }

  // Side driver & passenger windows
  const sideWindowGeometry = new THREE.BoxGeometry(0.04, 0.72, 1.18)
  const sideWindowMaterial = new THREE.MeshStandardMaterial({
    color: 0x5C80E6,
    roughness: 0.08,
    metalness: 0.5,
    envMapIntensity: 1.3,
  })
  for (const wx of [-1.17, 1.17]) {
    const sideWin = new THREE.Mesh(sideWindowGeometry, sideWindowMaterial)
    sideWin.position.set(wx, 1.88, -1.68)
    truckGroup.add(sideWin)
  }

  // Aerodynamic side mirrors
  const mirrorGeometry = new THREE.BoxGeometry(0.10, 0.22, 0.14)
  const mirrorStemGeometry = new THREE.BoxGeometry(0.12, 0.04, 0.04)
  for (const [mx, mDir] of [[-1.28, -1], [1.28, 1]] as const) {
    const mirror = new THREE.Mesh(mirrorGeometry, pillarMaterial)
    mirror.position.set(mx, 1.86, -2.32)
    truckGroup.add(mirror)
    const mirrorStem = new THREE.Mesh(mirrorStemGeometry, pillarMaterial)
    mirrorStem.position.set(mx - mDir * 0.06, 1.86, -2.32)
    truckGroup.add(mirrorStem)
  }

  /* --- 5. Dual Top/Bottom LED Headlights & Road Illumination (.light.top / .light.bottom) --- */
  const headlightHousingGeometry = new THREE.BoxGeometry(0.38, 0.16, 0.08)
  const headlightHousingMaterial = new THREE.MeshStandardMaterial({
    color: 0x141824,
    roughness: 0.5,
    metalness: 0.6,
    envMapIntensity: 1.2,
  })
  const headlightLedGeometry = new THREE.BoxGeometry(0.34, 0.12, 0.04)
  const headlightLedMaterial = new THREE.MeshBasicMaterial({
    color: 0xF5DF65,
    transparent: true,
    opacity: 0,
  })

  // Soft road forward projection light pools on the asphalt
  const roadLightPoolTexture = makeRadialTexture('rgba(255,240,168,0.75)', 'rgba(255,240,168,0)')
  const roadLightPoolGeometry = new THREE.PlaneGeometry(2.2, 5.8)
  roadLightPoolGeometry.rotateX(-Math.PI / 2)
  const roadLightPoolMaterial = new THREE.MeshBasicMaterial({
    map: roadLightPoolTexture,
    color: 0xFFF0A8,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })

  const deliveryHeadlights: THREE.Mesh<THREE.BoxGeometry | THREE.CylinderGeometry, THREE.MeshBasicMaterial>[] = []
  const deliveryHeadlightBeams: THREE.Mesh<THREE.ConeGeometry | THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []
  // Dual top & bottom headlights on both left & right corners
  for (const hy of [0.92, 0.58]) {
    for (const hx of [-0.84, 0.84]) {
      const housing = new THREE.Mesh(headlightHousingGeometry, headlightHousingMaterial)
      housing.position.set(hx, hy, -3.12)
      truckGroup.add(housing)

      const hl = new THREE.Mesh(headlightLedGeometry, headlightLedMaterial.clone())
      hl.position.set(hx, hy, -3.17)
      truckGroup.add(hl)
      deliveryHeadlights.push(hl)
    }
  }

  // Left and right forward road illumination pools
  for (const hx of [-0.84, 0.84]) {
    const roadBeam = new THREE.Mesh(roadLightPoolGeometry, roadLightPoolMaterial.clone())
    roadBeam.position.set(hx, 0.04, -5.6)
    truckGroup.add(roadBeam)
    deliveryHeadlightBeams.push(roadBeam as unknown as THREE.Mesh<THREE.ConeGeometry | THREE.PlaneGeometry, THREE.MeshBasicMaterial>)
  }

  disposables.push(
    headlightHousingGeometry, headlightHousingMaterial,
    headlightLedGeometry, headlightLedMaterial,
    roadLightPoolGeometry, roadLightPoolMaterial, roadLightPoolTexture,
  )

  /* --- 6. White-to-Slate Gradient Cargo Container (HTML .back) --- */
  const bedCanvas = document.createElement('canvas')
  bedCanvas.width = 2
  bedCanvas.height = 256
  const bedCtx = bedCanvas.getContext('2d')!
  const bedGrad = bedCtx.createLinearGradient(0, 0, 0, 256)
  bedGrad.addColorStop(0, '#FFFFFF')
  bedGrad.addColorStop(1, '#CDD9ED')
  bedCtx.fillStyle = bedGrad
  bedCtx.fillRect(0, 0, 2, 256)
  const bedTexture = new THREE.CanvasTexture(bedCanvas)
  bedTexture.magFilter = THREE.LinearFilter

  const bedMaterial = new THREE.MeshStandardMaterial({
    map: bedTexture,
    roughness: 0.32,
    metalness: 0.12,
    envMapIntensity: 0.95,
  })

  // Open cargo shell: floor, ceiling, left wall, right wall, front bulkhead
  const bedParts: THREE.BufferGeometry[] = []
  const pushBedPart = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const part = new THREE.BoxGeometry(w, h, d)
    part.translate(x, y, z)
    bedParts.push(part)
  }
  pushBedPart(2.36, 0.12, 3.8, 0, -1.02, 0.95) // floor
  pushBedPart(2.36, 0.12, 3.8, 0, 1.02, 0.95)  // roof
  pushBedPart(0.12, 2.04, 3.8, -1.12, 0, 0.95) // left wall
  pushBedPart(0.12, 2.04, 3.8, 1.12, 0, 0.95)  // right wall
  pushBedPart(2.36, 2.04, 0.12, 0, 0, -0.90)   // front bulkhead behind cab
  const bedGeometry = mergeGeometries(bedParts, false) ?? new THREE.BoxGeometry(2.36, 2.16, 3.8)
  bedParts.forEach((part) => part.dispose())

  const bed = new THREE.Mesh(bedGeometry, bedMaterial)
  bed.position.set(0, 1.58, 0)
  bed.castShadow = castsShadows
  bed.receiveShadow = castsShadows
  truckGroup.add(bed)

  // Aluminum corner trim on container
  const bedFrameGeometry = new THREE.BoxGeometry(2.42, 2.22, 0.06)
  const bedFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0xCDD9ED,
    roughness: 0.35,
    metalness: 0.3,
  })
  for (const fz of [-0.94, 2.82]) {
    const frame = new THREE.Mesh(bedFrameGeometry, bedFrameMaterial)
    frame.position.set(0, 1.58, fz)
    truckGroup.add(frame)
  }

  /* --- 7. Functioning Rear Cargo Doors (Top & Bottom Flaps like HTML) --- */
  // Top door hinged at top outer edge (swings upwards -90deg)
  const flapGeometryTop = new THREE.BoxGeometry(2.30, 0.98, 0.08)
  flapGeometryTop.translate(0, -0.49, 0)

  // Bottom door hinged at bottom outer edge (swings downwards +90deg)
  const flapGeometryBottom = new THREE.BoxGeometry(2.30, 0.98, 0.08)
  flapGeometryBottom.translate(0, 0.49, 0)

  const flapMaterial = new THREE.MeshStandardMaterial({
    color: 0xE2E9F6,
    roughness: 0.35,
    metalness: 0.15,
    envMapIntensity: 0.9,
  })

  const topFlap = new THREE.Mesh(flapGeometryTop, flapMaterial)
  topFlap.position.set(0, 2.54, 2.84)
  topFlap.castShadow = castsShadows
  truckGroup.add(topFlap)

  const bottomFlap = new THREE.Mesh(flapGeometryBottom, flapMaterial)
  bottomFlap.position.set(0, 0.58, 2.84)
  bottomFlap.castShadow = castsShadows
  truckGroup.add(bottomFlap)

  const deliveryCargoFlaps = [topFlap, bottomFlap]

  /* --- 8. Alloy Wheels & Rubber Tires --- */
  const tireGeometry = new THREE.CylinderGeometry(0.44, 0.44, 0.32, 24)
  tireGeometry.rotateZ(Math.PI / 2)
  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x161922,
    roughness: 0.88,
    metalness: 0.1,
  })
  const hubGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.34, 16)
  hubGeometry.rotateZ(Math.PI / 2)
  const hubMaterial = new THREE.MeshStandardMaterial({
    color: 0x9AA4B8,
    roughness: 0.25,
    metalness: 0.75,
  })

  const deliveryWheels: THREE.Mesh<THREE.TorusGeometry | THREE.CylinderGeometry, THREE.MeshStandardMaterial>[] = []
  for (const wx of [-1.24, 1.24]) {
    for (const wz of [-2.15, 1.95]) {
      const tire = new THREE.Mesh(tireGeometry, tireMaterial)
      tire.position.set(wx, 0.44, wz)
      tire.castShadow = castsShadows
      truckGroup.add(tire)
      const hub = new THREE.Mesh(hubGeometry, hubMaterial)
      hub.position.set(wx, 0.44, wz)
      truckGroup.add(hub)
      deliveryWheels.push(tire)
    }
  }

  /* --- 9. Cardboard Order Box (.box in HTML: linear-gradient(#EDD9A9, #DCB773)) --- */
  const deliveryCrate = new THREE.Group()
  deliveryCrate.position.set(TRUCK_LANE_X, 0.52, TRUCK_START_Z + 4.2)
  deliveryCrate.visible = false
  deepWorld.add(deliveryCrate)

  const caseBodyGeometry = new THREE.BoxGeometry(0.95, 0.95, 0.95)
  const caseCanvas = document.createElement('canvas')
  caseCanvas.width = 64
  caseCanvas.height = 64
  const caseCtx = caseCanvas.getContext('2d')!
  const caseGrad = caseCtx.createLinearGradient(0, 0, 0, 64)
  caseGrad.addColorStop(0, '#EDD9A9')
  caseGrad.addColorStop(1, '#DCB773')
  caseCtx.fillStyle = caseGrad
  caseCtx.fillRect(0, 0, 64, 64)
  // Dark center tape band
  caseCtx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  caseCtx.fillRect(0, 28, 64, 8)
  const caseTexture = new THREE.CanvasTexture(caseCanvas)

  const caseMaterial = new THREE.MeshStandardMaterial({
    map: caseTexture,
    roughness: 0.6,
    metalness: 0.05,
    envMapIntensity: 0.7,
  })
  const caseBody = new THREE.Mesh(caseBodyGeometry, caseMaterial)
  caseBody.position.y = 0.48
  caseBody.castShadow = castsShadows
  caseBody.receiveShadow = castsShadows
  deliveryCrate.add(caseBody)

  // Shipping label
  const labelGeometry = new THREE.PlaneGeometry(0.34, 0.22)
  const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
  const label = new THREE.Mesh(labelGeometry, labelMaterial)
  label.position.set(0, 0.58, 0.485)
  deliveryCrate.add(label)

  disposables.push(caseBodyGeometry, caseMaterial, caseTexture, labelGeometry, labelMaterial)

  const dockGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
  const dockMaterial = new THREE.MeshBasicMaterial({ visible: false })
  const deliveryDock = new THREE.Mesh(dockGeometry, dockMaterial)
  deliveryDock.visible = false
  disposables.push(dockGeometry, dockMaterial)

  const deliveryLidPivot = new THREE.Group()
  const deliveryStraps: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[] = []
  deliveryLidPivot.visible = false

  const deliveryPerson = new THREE.Group()
  deliveryPerson.visible = false
  deepWorld.add(deliveryPerson)

  const deliveryGlobe = new THREE.Group()
  deliveryGlobe.visible = false
  deepWorld.add(deliveryGlobe)
  const GLOBE_PIN_COUNT = 1
  const globePins = new THREE.InstancedMesh(
    new THREE.OctahedronGeometry(0.01, 0),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
    1,
  )
  const globePinDirs: THREE.Vector3[] = [new THREE.Vector3(0, 1, 0)]
  const globeWire = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 4, 3),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true }),
  )
  const deliveryGlobeRings: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = []
  const globeGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.01, 0.01),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  )
  const globeTruckPin = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.01, 0),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  )
  const globePersonPin = globeTruckPin.clone()
  deliveryGlobe.add(globePins, globeWire, globeGlow, globeTruckPin, globePersonPin)
  disposables.push(
    globePins.geometry, globePins.material,
    globeWire.geometry, globeWire.material,
    globeGlow.geometry, globeGlow.material,
    globeTruckPin.geometry, globeTruckPin.material,
    globePersonPin.geometry, globePersonPin.material,
  )

  const deliveryGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 1.2),
    new THREE.MeshBasicMaterial({ color: palette.gold.getHex(), transparent: true, opacity: 0, depthWrite: false, fog: false }),
  )
  deliveryGlow.position.set(DELIVERY.x, 0.9, DELIVERY.z)
  deepWorld.add(deliveryGlow)

  const deliveryBeam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 0.1),
    new THREE.MeshBasicMaterial({ color: palette.gold.getHex(), transparent: true, opacity: 0, depthWrite: false, fog: false }),
  )
  deliveryBeam.visible = false
  deepWorld.add(deliveryBeam)

  const deliveryCoins = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.01, 4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
    1,
  )
  deliveryCoins.visible = false
  deepWorld.add(deliveryCoins)

  const deliveryRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.01, 0.001, 3, 6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  )
  const deliveryRingSecondary = deliveryRing.clone()
  const deliveryRingGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.01, 0.01),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  )
  deliveryRing.visible = false
  deliveryRingSecondary.visible = false
  deliveryRingGlow.visible = false
  const deliverySealGroup = new THREE.Group()
  deliverySealGroup.visible = false
  const deliverySealMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })

  const poolTexture = makeRadialTexture('rgba(255,255,255,0.75)', 'rgba(255,255,255,0.18)')
  const poolGeometry = new THREE.PlaneGeometry(1, 1)
  poolGeometry.rotateX(-Math.PI / 2)
  const lightPools: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = []
  const poolMaterial = new THREE.MeshBasicMaterial({
    map: poolTexture,
    color: palette.gold.clone().lerp(new THREE.Color('#ffffff'), 0.55).getHex(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const pool = new THREE.Mesh(poolGeometry, poolMaterial)
  pool.position.set(DELIVERY.x, 0.03, DELIVERY.z)
  pool.scale.set(11, 1, 8)
  pool.matrixAutoUpdate = false
  pool.updateMatrix()
  deepWorld.add(pool)
  lightPools.push(pool)
  disposables.push(poolGeometry, poolTexture, poolMaterial)

  return {
    scene,
    camera,
    fog,
    skyUniforms,
    windUniform,
    sun,
    sunDisc,
    goldKey,
    deliverySpot,
    hemi,
    ambient,
    warmWorld,
    deepWorld,
    tints,
    scanBeam,
    scanTrail,
    scanRing,
    scanGlow,
    scanSpot,
    scanFruitMaterial,
    scanStationGroup,
    scanSensor: sensorArm,
    scanDomeMaterial,
    scanStatusLight: statusLight,
    marketWorld,
    marketShaft,
    marketProduceLight,
    marketFillLight,
    marketDust,
    marketLanterns,
    fieldClumps,
    fieldWeeds,
    deliveryDock,
    deliveryCrate,
    deliveryLidPivot,
    deliveryStraps,
    deliveryTruck: truckGroup,
    deliveryWheels,
    deliveryHeadlights,
    deliveryHeadlightBeams,
    deliveryCargoFlaps,
    streetLightReflections,
    deliveryStreetLights,
    deliveryPerson,
    deliveryGlobe,
    deliveryGlobePins: globePins,
    deliveryGlobePinCount: GLOBE_PIN_COUNT,
    deliveryGlobePinDirs: globePinDirs,
    deliveryGlobeWire: globeWire,
    deliveryGlobeRings: deliveryGlobeRings,
    deliveryGlobeGlow: globeGlow,
    deliveryGlobeTruckPin: globeTruckPin,
    deliveryGlobePersonPin: globePersonPin,
    deliveryGlow,
    deliveryBeam,
    deliveryCoins,
    coinCount: budget.coins,
    deliveryRing,
    deliveryRingSecondary,
    deliveryRingGlow,
    deliverySealGroup,
    deliverySealMaterial,
    lightPools,
    disposables,
  }
}

/* ------------------------------------------------------------------ environment */

/** Bakes a cheap image-based light so MeshStandardMaterial gets real specular response. */
function bakeEnvironment(
  renderer: THREE.WebGLRenderer,
  top: THREE.Color,
  horizon: THREE.Color,
  ground: THREE.Color,
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  const geometry = new THREE.SphereGeometry(10, 24, 16)
  const material = new THREE.ShaderMaterial({
    uniforms: { uTop: { value: top }, uHorizon: { value: horizon }, uGround: { value: ground } },
    vertexShader: SKY_VERTEX,
    fragmentShader: ENV_FRAGMENT,
    side: THREE.BackSide,
  })
  envScene.add(new THREE.Mesh(geometry, material))
  const target = pmrem.fromScene(envScene, 0, 0.1, 100)
  geometry.dispose()
  material.dispose()
  pmrem.dispose()
  return target.texture
}

/* ------------------------------------------------------------------- component */

export default function RunwayScene({ getProgress, onFailure, exposure }: RunwaySceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const failureRef = useRef(onFailure)
  const getProgressRef = useRef(getProgress)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useEffect(() => {
    failureRef.current = onFailure
  }, [onFailure])

  useEffect(() => {
    getProgressRef.current = getProgress
  }, [getProgress])

  useEffect(() => {
    if (rendererRef.current) rendererRef.current.toneMappingExposure = exposure ?? DEFAULT_EXPOSURE
  }, [exposure])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const safari = isSafari()
    const tier = detectTier()
    const budget = budgetFor(tier, safari)
    const palette = readPalette(mount)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: budget.antialias,
        alpha: false,
        powerPreference: tier === 2 ? 'high-performance' : 'default',
        failIfMajorPerformanceCaveat: false,
        logarithmicDepthBuffer: tier === 2,
      })
    } catch {
      failureRef.current?.()
      return
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = DEFAULT_EXPOSURE
    rendererRef.current = renderer
    // Initialize with the warm atmospheric fog color rather than stark white
    renderer.setClearColor(palette.canvas.clone().lerp(palette.sand, 0.4), 1)
    if (budget.shadowMapSize > 0) {
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // Shadows are expensive on mobile and only change when the camera moves, so we
      // render them on demand instead of every frame (see renderFrame below).
      renderer.shadowMap.autoUpdate = false
    }

    const canvas = renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')

    const handles = buildScene(palette, budget)
    const { camera, scene, fog, skyUniforms } = handles

    /* ---- baked environment for rich PBR specular response without runtime swapping ---- */
    const studioEnvironment = bakeEnvironment(
      renderer,
      palette.sand.clone().lerp(new THREE.Color('#7ea8c4'), 0.42),
      new THREE.Color('#f6dcae'),
      palette.clay.clone().lerp(palette.ink, 0.4),
    )
    scene.environment = studioEnvironment

    /* ---- pivot colour targets ---- */
    const warmHaze = palette.canvas.clone().lerp(palette.sand, 0.4)
    const deepHaze = palette.evergreen.clone()
    const warmSkyTop = skyUniforms.uTop.value.clone()
    const warmSkyHorizon = skyUniforms.uHorizon.value.clone()
    const deepSkyTop = palette.evergreen.clone()
    const deepSkyHorizon = palette.evergreenSurface.clone().lerp(palette.forest, 0.2)
    const warmSun = new THREE.Color('#ffcf8e')
    const deepSun = palette.gold.clone()
    const warmHemiSky = palette.canvas.clone()
    const deepHemiSky = palette.evergreenSurface.clone()
    const scratch = new THREE.Color()

    /* ---- sizing ---- */
    // Adaptive resolution control. Starts at the tier budget and is stepped down by the
    // frame-time watchdog so the scene holds a smooth rate even on weak GPUs.
    const basePixelRatio = Math.min(window.devicePixelRatio || 1, budget.maxPixelRatio)
    let quality = initialQuality()
    const applyQuality = () => {
      renderer.setPixelRatio(basePixelRatio * pixelRatioFor(quality.pixelRatioStep))
      if (budget.shadowMapSize > 0) {
        renderer.shadowMap.enabled = !quality.shadowsDisabled
        renderer.shadowMap.needsUpdate = true
      }
    }
    const resize = () => {
      const rect = mount.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      applyQuality()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.fov = camera.aspect < 1 ? 62 : 46
      camera.updateProjectionMatrix()
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    window.visualViewport?.addEventListener('resize', resize)

    /* ---- animation state ---- */
    const cameraPosition = new THREE.Vector3()
    const cameraTarget = new THREE.Vector3()
    const lookAt = new THREE.Vector3()
    const sunOffset = new THREE.Vector3(-24, 17, 14)

    // Pre-warm 100% of WebGL shader programs and shadow pipelines across the entire runway path
    for (const sampleP of [0, 0.25, 0.50, 0.75, 1.0]) {
      sampleTrack(CAMERA_TRACK, sampleP, cameraPosition, cameraTarget)
      camera.position.copy(cameraPosition)
      camera.lookAt(cameraTarget)
      camera.updateMatrixWorld()
      camera.updateProjectionMatrix()
      renderer.compile(scene, camera)
    }
    let smoothedVelocity = 0
    let previousProgress = clamp01(getProgressRef.current())
    let clockStart = performance.now()
    // Watchdog state. We sample ONLY real rendered frames so idle-throttled gaps never
    // count as slowness — that was the bug that made adaptive quality step down every time
    // the user paused scrolling.
    let previousClock = performance.now()
    let qualityWindowFrames = 0
    let qualityWindowAccum = 0
    let firstQualityCheckDone = false
    let qualityDownStreak = 0
    let qualityUpStreak = 0
    let initialShadowFrame = true

    const renderFrame = (elapsed: number) => {
      // The caller already smooths the input (the scroll spring in the landing page).
      // Reading it directly here is what locks the 3D world to the DOM overlay with zero
      // extra latency — the previous exponential pass added ~100ms of trail during scroll.
      const p = clamp01(getProgressRef.current())
      const pivot = smoothstep(PIVOT_START, PIVOT_END, p)
      const delta = p - previousProgress
      const cameraMoved = Math.abs(delta) > 1e-4
      previousProgress = p
      smoothedVelocity += (delta - smoothedVelocity) * 0.15
      handles.windUniform.value = elapsed * 0.00085

      // Shadows only re-render when the camera (and therefore the shadow casters) move,
      // plus always on the very first frame so the initial view has its shadows.
      if (budget.shadowMapSize > 0) {
        renderer.shadowMap.needsUpdate = (initialShadowFrame || cameraMoved) && !quality.shadowsDisabled
        initialShadowFrame = false
      }

      /* camera · one continuous smooth path with gentle velocity dampening */
      const cameraProgress = p > 0.90 ? 0.90 : p
      sampleTrack(CAMERA_TRACK, cameraProgress, cameraPosition, cameraTarget)
      const parallax = THREE.MathUtils.clamp(smoothedVelocity * 4, -0.1, 0.1)

      camera.position.copy(cameraPosition)
      const cinematicPull = smoothstep(0.30, 0.45, p) * 0.7 + smoothstep(0.72, 0.92, p) * 0.9
      camera.position.y += parallax * 0.05 + cinematicPull * 0.15
      camera.position.z += cinematicPull * 0.45
      if (camera.aspect < 1) {
        camera.position.lerp(cameraTarget, -0.22)
        camera.position.y += 0.75
      }
      lookAt.copy(cameraTarget)
      lookAt.x -= parallax * 0.08
      camera.lookAt(lookAt)

      /* world pivot · continuous smooth lerp of fog, sky, lighting and clearColor (NO glitching) */
      const currentFogColor = scratch.copy(warmHaze).lerp(deepHaze, pivot)
      fog.color.copy(currentFogColor)
      fog.density = lerp(0.0105, 0.028, pivot)
      renderer.setClearColor(currentFogColor, 1)

      skyUniforms.uTop.value.copy(scratch.copy(warmSkyTop).lerp(deepSkyTop, pivot))
      skyUniforms.uHorizon.value.copy(scratch.copy(warmSkyHorizon).lerp(deepSkyHorizon, pivot))
      skyUniforms.uHorizonPower.value = lerp(0.8, 1.7, pivot)

      scene.environmentIntensity = lerp(1, 0.55, pivot)

      handles.sun.intensity = lerp(2.1, 0.05, pivot)
      handles.sun.color.copy(scratch.copy(warmSun).lerp(deepSun, pivot))
      handles.sun.position.copy(cameraTarget).add(sunOffset)
      handles.sun.target.position.copy(cameraTarget)
      handles.sun.target.updateMatrixWorld()
      handles.sunDisc.visible = pivot < 0.98
      handles.sunDisc.material.opacity = (1 - pivot) * 0.95
      handles.goldKey.intensity = lerp(0, 1.15, pivot)
      handles.hemi.intensity = lerp(0.7, 0.16, pivot)
      handles.hemi.color.copy(scratch.copy(warmHemiSky).lerp(deepHemiSky, pivot))
      handles.ambient.intensity = lerp(0.22, 0.1, pivot)

      for (const tint of handles.tints) {
        tint.material.color.copy(scratch.copy(tint.warm).lerp(tint.deep, pivot))
      }

      // Smooth light fades without toggling .visible (prevents shader recompilations)
      const marketActive = p > 0.18 && p < 0.62
      handles.marketProduceLight.intensity = marketActive ? lerp(12, 6, pivot) : 0
      handles.marketProduceLight.color.set('#ffc27a')
      handles.marketFillLight.intensity = marketActive ? lerp(8, 4, pivot) : 0
      handles.marketFillLight.color.set('#ffc27a')

      /* 01 THE FIELD · living agricultural atmosphere */
      const field = stageBand(p, 0, 0.01)
      handles.marketDust.visible = p > 0.16 && p < 0.54
      handles.marketDust.material.opacity = clamp01((p - 0.12) * 5) * clamp01((0.62 - p) * 4) * 0.26 + 0.04
      if (p > 0.16 && p < 0.54) handles.marketDust.rotation.y = elapsed * 0.000025
      if (p < 0.34) {
        handles.fieldWeeds.rotation.y = Math.sin(elapsed * 0.00018) * 0.015
        handles.fieldClumps.rotation.y = Math.sin(elapsed * 0.00008) * 0.006
      }
      handles.sunDisc.position.y = 12.6 - field * 3.2

      /* 02 THE SCAN · Active biometric laser inspection, LiDAR sweeps & verification */
      const scan = band(p, 0.18, 0.44)
      const scanActive = scan > 0.005
      const scanCycle = elapsed * 0.0032 + p * 14
      const laserY = SCAN_TOMATO.y + Math.sin(scanCycle) * 0.18
      const laserProximity = Math.max(0, 1 - Math.abs(laserY - SCAN_TOMATO.y) * 5.5)

      // Sensor arm telemetry tracking
      handles.scanStationGroup.rotation.y = Math.sin(elapsed * 0.00032) * 0.015
      handles.scanSensor.rotation.y = Math.sin(elapsed * 0.0008) * 0.04 + Math.sin(scanCycle * 0.5) * 0.06
      handles.scanDomeMaterial.opacity = scanActive ? 0.28 : 0.12
      handles.scanStatusLight.intensity = scanActive ? (1.2 + Math.sin(elapsed * 0.01) * 0.4) : 0.2
      handles.scanStatusLight.color.set(p > 0.32 ? '#10B981' : '#34D399')
      handles.scanSpot.intensity = scanActive ? 16 : 0

      // Holographic laser sweep sheet & focal bar
      handles.scanBeam.visible = scanActive
      handles.scanBeam.position.set(SCAN_TOMATO.x, laserY, SCAN_TOMATO.z)
      handles.scanBeam.material.opacity = scanActive ? (0.75 + Math.sin(elapsed * 0.006) * 0.2) : 0
      handles.scanBeam.scale.setScalar(1 + Math.sin(scanCycle * 2) * 0.08)

      handles.scanTrail.visible = scanActive
      handles.scanTrail.position.set(SCAN_TOMATO.x, laserY, SCAN_TOMATO.z)
      handles.scanTrail.rotation.y = elapsed * 0.002
      handles.scanTrail.material.opacity = scanActive ? 0.95 : 0

      // Rotating holographic targeting HUD ring
      handles.scanRing.visible = scanActive
      handles.scanRing.position.set(SCAN_TOMATO.x, SCAN_TOMATO.y + 0.06, SCAN_TOMATO.z)
      handles.scanRing.rotation.z = elapsed * 0.0022
      handles.scanRing.scale.setScalar(1 + Math.sin(elapsed * 0.003) * 0.05)
      handles.scanRing.material.opacity = scanActive ? 0.85 : 0

      // Dynamic reactive subsurface glow on inspected fruit
      handles.scanFruitMaterial.emissive.set(p > 0.32 ? '#10B981' : '#34D399')
      handles.scanFruitMaterial.emissiveIntensity = scanActive ? (0.2 + laserProximity * 0.7) : 0.1

      // Biometric verification pulse on completion
      const verifyT = smoothstep(0.30, 0.36, p) * (1 - smoothstep(0.40, 0.45, p))
      handles.scanGlow.visible = verifyT > 0.01
      handles.scanGlow.material.opacity = verifyT * 0.85
      handles.scanGlow.scale.setScalar(0.9 + verifyT * 0.3)
      handles.scanGlow.quaternion.copy(camera.quaternion)

      /* 03 THE MARKET · produce stalls, red tomatoes, cloth canopies + economic signal */
      const market = stageBand(p, 2, 0.01)
      const signal = Math.sin(clamp01(market) * Math.PI)
      handles.marketShaft.visible = false
      handles.marketLanterns.material.opacity = 0.42 + signal * 0.46
      handles.marketLanterns.material.size = 0.14 + signal * 0.06

      /* 04 THE DELIVERY · Exact HTML order-confirm timing in 3D:
       * 1) At the start of Stage 4 (p: 0.65 -> 0.73), the truck is stationed at the start of the road (TRUCK_START_Z = -70.0)
       *    in front of the camera, opening its rear container doors wide (+90° / -90°).
       * 2) p: 0.73 -> 0.81: The package slides along the road from the market (z = -63.0) directly into the open rear container hold (z = -69.1)
       *    in full, direct view of the rear camera!
       * 3) p: 0.81 -> 0.85: Storage doors swing closed and latch securely shut over the loaded parcel.
       * 4) p: 0.85 -> 0.88: Headlights blaze on bright, illuminating the asphalt ahead.
       * 5) p: 0.88 -> 1.00: Wheels spin, and the truck accelerates from the start of the road (z = -70.0) down the runway to TRUCK_EXIT_Z!
       */
      const delivery = stageBand(p, 3, 0.014)
      const doorOpenT = smoothstep(0.66, 0.73, p)
      const boxLoadT = smoothstep(0.73, 0.81, p)
      const doorCloseT = smoothstep(0.81, 0.85, p)
      const headlightT = smoothstep(0.85, 0.88, p)
      const truckDriveT = smoothstep(0.88, 1.00, p)

      // The truck starts at the beginning of the road, remains stationary during package loading, then accelerates away
      const truckZ = lerp(TRUCK_START_Z, TRUCK_EXIT_Z, truckDriveT)
      handles.deliveryTruck.position.set(TRUCK_LANE_X, 0, truckZ)
      handles.deliveryTruck.visible = p >= 0.58 && p <= 1.0

      // Wheel rotation (spins when driving)
      const isDriving = truckDriveT > 0.01 && truckDriveT < 0.99
      const wheelSpin = truckDriveT * 36
      for (const wheel of handles.deliveryWheels) wheel.rotation.x = wheelSpin

      // Realistic crystal LED headlights & road illumination
      const headlightBase = p >= 0.60 ? 0.65 : 0
      const headlightOpacity = headlightT > 0.01 ? (0.65 + headlightT * 0.35) : headlightBase
      for (const headlight of handles.deliveryHeadlights) headlight.material.opacity = headlightOpacity
      for (const beam of handles.deliveryHeadlightBeams) beam.material.opacity = headlightOpacity * 0.75

      // Rear storage doors open to receive package, then latch closed
      const flapOpenProgress = doorOpenT * (1 - doorCloseT)
      if (handles.deliveryCargoFlaps && handles.deliveryCargoFlaps.length >= 2) {
        handles.deliveryCargoFlaps[0].rotation.x = -flapOpenProgress * (Math.PI / 2) // top flap swings up 90°
        handles.deliveryCargoFlaps[1].rotation.x = flapOpenProgress * (Math.PI / 2)  // bottom flap swings down 90°
      }

      // Order box loading: comes from the marketplace (z = -63.0) right into the truck's storage carriage hold (z = TRUCK_START_Z + 0.9 = -69.1)
      const marketOriginZ = -63.0
      const holdCrateZ = TRUCK_START_Z + 0.9
      const boxActive = p >= 0.70 && p < 0.86
      handles.deliveryCrate.visible = boxActive
      if (boxActive) {
        const currentBoxZ = lerp(marketOriginZ, holdCrateZ, boxLoadT)
        const boxArcY = 0.52 + Math.sin(boxLoadT * Math.PI) * 0.22
        handles.deliveryCrate.position.set(TRUCK_LANE_X, boxArcY, currentBoxZ)
        handles.deliveryCrate.scale.setScalar(1 - smoothstep(0.94, 1.0, boxLoadT) * 0.96)
      } else {
        handles.deliveryCrate.visible = false
      }

      // Suppress legacy stage 04 handles
      handles.deliveryPerson.visible = false
      handles.deliveryGlobe.visible = false
      handles.deliveryGlow.visible = false
      handles.deliveryBeam.visible = false
      handles.deliveryCoins.visible = false
      handles.deliveryRing.visible = false
      handles.deliveryRingSecondary.visible = false
      handles.deliveryRingGlow.visible = false
      handles.deliverySealGroup.visible = false
      handles.deliverySpot.intensity = doorOpenT * 12

      const nightT = smoothstep(0.34, 0.56, p)
      for (const reflection of handles.streetLightReflections) {
        reflection.material.opacity = nightT * 0.42
      }
      handles.lightPools.forEach((pool) => {
        pool.visible = delivery > 0.02
        pool.material.opacity = smoothstep(0.38, 0.62, p) * 0.34
      })

      renderer.render(scene, camera)
    }

    /* ---- run loop, paused when off-screen or hidden ---- */
    let frameId = 0
    let running = false
    let onScreen = true
    let documentVisible = !document.hidden
    let lastProgress = getProgressRef.current()
    let idleFrames = 0
    let idleCadence = 0

    const loop = () => {
      frameId = requestAnimationFrame(loop)
      const p = getProgressRef.current()
      if (p === lastProgress) idleFrames += 1
      else {
        idleFrames = 0
        lastProgress = p
      }
      // While idle (not scrolling) the scene's living ambience still animates, but it does
      // not need a full-rate render — the cadence keeps the ambience alive while giving the
      // battery and thermal headroom back so a full-rate render is available the instant
      // the user scrolls again.
      const skip = idleFrameSkip(tier)
      const isIdle = idleFrames > 12 && skip > 0
      if (isIdle) {
        idleCadence += 1
        if (idleCadence % (skip + 1) !== 0) return
      } else {
        idleCadence = 0
      }

      // Frame-time watchdog: sample the delta between frames we actually rendered. Because
      // idle-skipped frames return above, a pause in scrolling can never be misread as a
      // slow device — that misreading was what caused the spurious quality drops.
      const now = performance.now()
      qualityWindowAccum += now - previousClock
      previousClock = now
      qualityWindowFrames += 1
      const windowLen = firstQualityCheckDone ? WATCHDOG_WINDOW : WATCHDOG_FIRST_WINDOW
      if (qualityWindowFrames >= windowLen) {
        const avgFrameMs = qualityWindowAccum / qualityWindowFrames
        qualityWindowFrames = 0
        qualityWindowAccum = 0
        firstQualityCheckDone = true
        const nextQuality = evaluateQuality(quality, avgFrameMs)
        const changed =
          nextQuality.pixelRatioStep !== quality.pixelRatioStep ||
          nextQuality.shadowsDisabled !== quality.shadowsDisabled
        const degraded =
          nextQuality.pixelRatioStep > quality.pixelRatioStep || nextQuality.shadowsDisabled
        if (changed && degraded) {
          // Step down decisively (1 window) so an obviously slow device smooths out fast.
          qualityDownStreak += 1
          qualityUpStreak = 0
          if (qualityDownStreak >= 1) {
            quality = nextQuality
            qualityDownStreak = 0
            applyQuality()
          }
        } else if (changed) {
          // Recover cautiously (2 clean windows) so quality never flickers up and down.
          qualityUpStreak += 1
          qualityDownStreak = 0
          if (qualityUpStreak >= 2) {
            quality = nextQuality
            qualityUpStreak = 0
            applyQuality()
          }
        } else {
          qualityDownStreak = 0
          qualityUpStreak = 0
        }
      }

      renderFrame(performance.now() - clockStart)
    }

    const start = () => {
      if (running) return
      running = true
      clockStart = performance.now() - 1
      frameId = requestAnimationFrame(loop)
    }

    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(frameId)
    }

    const sync = () => {
      if (onScreen && documentVisible) start()
      else stop()
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting)
        sync()
      },
      { rootMargin: '20% 0px 20% 0px', threshold: 0 },
    )
    intersectionObserver.observe(mount)

    const onVisibilityChange = () => {
      documentVisible = !document.hidden
      sync()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const onContextLost = (event: Event) => {
      event.preventDefault()
      stop()
      failureRef.current?.()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    // Paint the complete first frame to the WebGL buffer, then mount to DOM
    renderFrame(0)
    mount.appendChild(canvas)
    sync()

    return () => {
      stop()
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      window.visualViewport?.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      canvas.removeEventListener('webglcontextlost', onContextLost)

      studioEnvironment.dispose()
      for (const disposable of handles.disposables) disposable.dispose()
      handles.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const material = object.material
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose())
          else material.dispose()
        }
      })
      handles.scene.clear()
      rendererRef.current = null
      renderer.dispose()
      renderer.forceContextLoss()
      if (canvas.parentNode === mount) mount.removeChild(canvas)
    }
  }, [getProgressRef])

  return <div ref={mountRef} className="runway-scene" aria-hidden="true" />
}