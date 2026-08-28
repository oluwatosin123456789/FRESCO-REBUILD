'use client'

import { useCallback } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const tiltSpring = { stiffness: 180, damping: 22, mass: 0.9 }

export function usePointerTilt(maxRotation = 3, maxTranslation = 6) {
  const reduced = useReducedMotion()
  const rotateX = useSpring(useMotionValue(0), tiltSpring)
  const rotateY = useSpring(useMotionValue(0), tiltSpring)
  const translateX = useSpring(useMotionValue(0), tiltSpring)
  const translateY = useSpring(useMotionValue(0), tiltSpring)

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (reduced) return
      if (window.matchMedia('(pointer: coarse)').matches) return
      const rect = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      rotateX.set(-y * maxRotation)
      rotateY.set(x * maxRotation)
      translateX.set(x * maxTranslation)
      translateY.set(y * maxTranslation)
    },
    [reduced, maxRotation, maxTranslation, rotateX, rotateY, translateX, translateY],
  )

  const onPointerLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    translateX.set(0)
    translateY.set(0)
  }, [rotateX, rotateY, translateX, translateY])

  return { rotateX, rotateY, translateX, translateY, onPointerMove, onPointerLeave }
}

export const pointerTiltStyle = motion.div