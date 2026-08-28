import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  CAMERA_TRACK,
  FRAMING_RULES,
  measureFraming,
  sampleTrack,
  STAGE_SUBJECTS,
} from './runway-framing'

const ASPECTS = [16 / 9, 4 / 3, 0.46]

describe('runway camera track', () => {
  it('keys every stage centre in order between 0 and 1', () => {
    expect(CAMERA_TRACK[0].p).toBe(0)
    expect(CAMERA_TRACK[CAMERA_TRACK.length - 1].p).toBe(1)
    for (let i = 1; i < CAMERA_TRACK.length; i += 1) {
      expect(CAMERA_TRACK[i].p).toBeGreaterThan(CAMERA_TRACK[i - 1].p)
    }
  })

  it('travels continuously, with no teleport between frames', () => {
    const position = new THREE.Vector3()
    const target = new THREE.Vector3()
    const previous = new THREE.Vector3()
    let maxStep = 0
    for (let i = 0; i <= 600; i += 1) {
      const p = i / 600
      sampleTrack(CAMERA_TRACK, p, position, target)
      expect(Number.isFinite(position.x + position.y + position.z)).toBe(true)
      expect(Number.isFinite(target.x + target.y + target.z)).toBe(true)
      // the camera looks deeper into the diorama during the runway scroll;
      // in the delivery stage (p > 0.65) it may look back north to frame the truck front
      if (p <= 0.65) expect(target.z).toBeLessThan(position.z)
      if (i > 0) maxStep = Math.max(maxStep, position.distanceTo(previous))
      previous.copy(position)
    }
    expect(maxStep).toBeLessThan(1.5)
  })
})

describe('stage framing', () => {
  it('has a subject for each of the four stages', () => {
    expect(STAGE_SUBJECTS).toHaveLength(4)
    expect(STAGE_SUBJECTS.map((subject) => subject.stage)).toEqual([0, 1, 2, 3])
  })

  for (const aspect of ASPECTS) {
    describe(`aspect ${aspect.toFixed(2)}`, () => {
      for (const subject of STAGE_SUBJECTS) {
        it(`${subject.name} is readable and clear of the overlay`, () => {
          const framing = measureFraming(subject, aspect)
          expect(framing.clipped).toBe(false)
          // large enough to be legible behind the UI, not so large it fills the frame
          expect(framing.height).toBeGreaterThanOrEqual(FRAMING_RULES.minHeight)
          expect(framing.height).toBeLessThanOrEqual(FRAMING_RULES.maxHeight)
          // biased into the lower band, away from the copy block and the overlay cards
          expect(framing.centreY).toBeGreaterThanOrEqual(FRAMING_RULES.minCentreY)
          expect(framing.centreY).toBeLessThanOrEqual(FRAMING_RULES.maxCentreY)
          expect(framing.centreX).toBeGreaterThanOrEqual(FRAMING_RULES.minCentreX)
          expect(framing.centreX).toBeLessThanOrEqual(FRAMING_RULES.maxCentreX)
        })
      }
    })
  }
})
