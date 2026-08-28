import * as THREE from 'three'

/**
 * Camera track and framing rules for the 3D runway.
 *
 * This lives outside the scene component so the composition can be measured in tests rather
 * than eyeballed. The rule it enforces: the overlay copy occupies the left of the viewport
 * and the overlay cards occupy the right, so a 3D subject parked at dead centre at 11% of
 * frame height is invisible in practice. Each stage's subject must be large enough to read
 * and biased out of the region the UI covers.
 */

export interface TrackKey {
  p: number
  position: THREE.Vector3
  target: THREE.Vector3
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/**
 * Eleven keys across the four stages, placed at the stage centres so the "money shot" of each
 * beat lands while its copy is fully opaque. Interpolated with Catmull-Rom · no teleports.
 */
export const CAMERA_TRACK: TrackKey[] = [
  /*
   * Key 0 is deliberately not the old high establishing shot. The opening frame is the
   * field-filling view · the camera already inside the rows, the field covering the whole
   * display · so the field is what the arch reveals and its animation (camera dolly, sun
   * settling, wind) starts from the very top of the runway.
   */
  { p: 0, position: v(5.325, 4.988, 14.384), target: v(-1.535, 1.242, -4.6) },
  /*
   * Stage 01 THE FIELD · the money shot sits exactly on the stage centre (p = 0.125 = the
   * framing test sample point): the camera inside the rows, the field filling the frame.
   */
  { p: 0.125, position: v(4.2, 4.3, 10.4), target: v(-1.35, 1.05, -7) },
  /*
   * Stage 02 THE SCAN · smooth continuous track down the crop rows directly to the scanner (z = -38.5)
   */
  { p: 0.22, position: v(1.8, 3.2, -14.0), target: v(-2.2, 0.95, -27.0) },
  { p: 0.30, position: v(-0.5, 2.1, -26.0), target: v(-3.1, 0.82, -35.0) },
  { p: 0.375, position: v(-1.2, 1.45, -37.0), target: v(-3.55, 0.65, -38.5) },
  /*
   * Stage 03 THE MARKET · smooth transition into near-eye-level among the stalls
   */
  { p: 0.50, position: v(-2.6, 2.6, -38.6), target: v(-1.2, 1.4, -44.5) },
  { p: 0.625, position: v(-4.0, 3.8, -40.2), target: v(1.0, 1.8, -48.5) },
  /*
   * Stage 04 THE DELIVERY · camera frames from behind the truck stationed at the start of the road (z = -70.0)
   * while the package is loaded, then tracks with the truck as it accelerates down the road
   */
  { p: 0.72, position: v(1.8, 4.0, -82.0), target: v(4.2, 1.5, -70.5) },
  { p: 0.80, position: v(1.8, 4.0, -82.0), target: v(4.2, 1.5, -70.5) },
  { p: 0.875, position: v(1.4, 5.0, -94.5), target: v(3.6, 1.5, -81.5) },
  { p: 1, position: v(1.4, 5.6, -106.0), target: v(3.6, 1.6, -93.0) },
]

function catmullRom(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
) {
  const t2 = t * t
  const t3 = t2 * t
  out.set(
    0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  )
}

/** Catmull-Rom sample across explicitly keyed progress points. */
export function sampleTrack(
  keys: TrackKey[],
  p: number,
  position: THREE.Vector3,
  target: THREE.Vector3,
) {
  const last = keys.length - 1
  if (p <= keys[0].p) {
    position.copy(keys[0].position)
    target.copy(keys[0].target)
    return
  }
  if (p >= keys[last].p) {
    position.copy(keys[last].position)
    target.copy(keys[last].target)
    return
  }

  let i = 0
  while (i < last && keys[i + 1].p <= p) i += 1

  const a = keys[i]
  const b = keys[i + 1]
  const t = (p - a.p) / (b.p - a.p)
  const p0 = keys[Math.max(0, i - 1)]
  const p3 = keys[Math.min(last, i + 2)]

  catmullRom(p0.position, a.position, b.position, p3.position, t, position)
  catmullRom(p0.target, a.target, b.target, p3.target, t, target)
}

/** World-space bounds of the thing each stage's copy is talking about. */
export interface StageSubject {
  stage: number
  name: string
  min: THREE.Vector3
  max: THREE.Vector3
}

export const STAGE_SUBJECTS: StageSubject[] = [
  { stage: 0, name: '01 THE FIELD', min: v(-7, 0, -13), max: v(7, 2.1, 4) },
  {
    stage: 1,
    name: '02 THE SCAN',
    min: v(-4.15, -0.25, -39.15),
    max: v(-2.85, 0.78, -37.85),
  },
  { stage: 2, name: '03 THE MARKET', min: v(-3.8, 0.5, -50.8), max: v(6, 3.4, -45.8) },
  {
    stage: 3,
    name: '04 THE DELIVERY',
    min: v(1.8, 0, -86),
    max: v(5.8, 2.4, -77),
  },
]

export interface Framing {
  /** Fraction of frame width the subject spans, 0..1+. */
  width: number
  /** Fraction of frame height the subject spans, 0..1+. */
  height: number
  /** Subject centre in NDC: -1 is the left/bottom edge, +1 the right/top edge. */
  centreX: number
  centreY: number
  /** Distance from camera to the subject centre, in world units. */
  distance: number
  /** True if any corner falls behind the near plane. */
  clipped: boolean
}

/** Projects a stage's subject through the camera at that stage's centre of scroll. */
export function measureFraming(subject: StageSubject, aspect: number, keys = CAMERA_TRACK): Framing {
  const camera = new THREE.PerspectiveCamera(aspect < 1 ? 62 : 46, aspect, 0.4, 400)
  const position = new THREE.Vector3()
  const target = new THREE.Vector3()
  sampleTrack(keys, (subject.stage + 0.5) / STAGE_SUBJECTS.length, position, target)
  camera.position.copy(position)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let clipped = false
  const corner = new THREE.Vector3()
  const view = new THREE.Vector3()

  for (const x of [subject.min.x, subject.max.x]) {
    for (const y of [subject.min.y, subject.max.y]) {
      for (const z of [subject.min.z, subject.max.z]) {
        corner.set(x, y, z)
        view.copy(corner).applyMatrix4(camera.matrixWorldInverse)
        if (view.z > -camera.near) {
          clipped = true
          continue
        }
        corner.project(camera)
        minX = Math.min(minX, corner.x)
        maxX = Math.max(maxX, corner.x)
        minY = Math.min(minY, corner.y)
        maxY = Math.max(maxY, corner.y)
      }
    }
  }

  const centre = subject.min.clone().add(subject.max).multiplyScalar(0.5)
  return {
    width: (maxX - minX) / 2,
    height: (maxY - minY) / 2,
    centreX: (minX + maxX) / 2,
    centreY: (minY + maxY) / 2,
    distance: position.distanceTo(centre),
    clipped,
  }
}

/**
 * Composition budget every stage has to sit inside.
 * `height` keeps the subject readable; `centreY` biases it into the lower band of the frame,
 * away from the copy block; `centreX` keeps it off the dead centre the overlay cards cover.
 */
export const FRAMING_RULES = {
  minHeight: 0.3,
  maxHeight: 0.95,
  minCentreY: -0.72,
  maxCentreY: -0.02,
  minCentreX: -0.35,
  maxCentreX: 0.5,
} as const
