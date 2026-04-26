import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function CameraController({ controlsRef, targetPos, targetLookAt, animating }) {
  const { camera } = useThree()

  useFrame(() => {
    if (!animating.current || !targetPos.current || !targetLookAt.current || !controlsRef.current) return

    const tPos = new THREE.Vector3(...targetPos.current)
    const tLook = new THREE.Vector3(...targetLookAt.current)

    controlsRef.current.enabled = false

    camera.position.lerp(tPos, 0.06)
    controlsRef.current.target.lerp(tLook, 0.06)
    controlsRef.current.update()

    const posClose = camera.position.distanceTo(tPos) < 0.05
    const lookClose = controlsRef.current.target.distanceTo(tLook) < 0.05

    if (posClose && lookClose) {
      camera.position.copy(tPos)
      controlsRef.current.target.copy(tLook)
      controlsRef.current.update()
      controlsRef.current.enabled = true
      animating.current = false
    }
  })

  return null
}
