import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const EYE_HEIGHT = 1.6 // metres

export function WalkControls({ enabled, cameraRef, onUserMove }) {
  const { camera, gl } = useThree()
  const keys = useRef({})
  const mouseDown = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const snapped = useRef(false)

  useEffect(() => {
    if (!enabled) {
      snapped.current = false
      return
    }

    // Snap camera to eye height on entry if it's awkward
    if (!snapped.current) {
      if (camera.position.y < 0.3 || camera.position.y > 5) {
        camera.position.y = EYE_HEIGHT
      }
      euler.current.setFromQuaternion(camera.quaternion)
      snapped.current = true
    }

    function onKeyDown(e) {
      keys.current[e.key] = true
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault()
      if (onUserMove) onUserMove()
    }
    function onKeyUp(e) { keys.current[e.key] = false }

    function onMouseDown(e) {
      mouseDown.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      gl.domElement.style.cursor = 'grabbing'
    }
    function onMouseUp() {
      mouseDown.current = false
      gl.domElement.style.cursor = 'grab'
    }
    function onMouseMove(e) {
      if (!mouseDown.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      euler.current.setFromQuaternion(camera.quaternion)
      euler.current.y -= dx * 0.003
      euler.current.x -= dy * 0.003
      euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
      if (onUserMove) onUserMove()
    }

    gl.domElement.style.cursor = 'grab'
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    gl.domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      keys.current = {}
      gl.domElement.style.cursor = ''
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      gl.domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [enabled, camera, gl, onUserMove])

  useFrame((_, delta) => {
    if (!enabled) return
    const speed = 4 * delta
    const vSpeed = 2 * delta

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    const k = keys.current
    if (k['w'] || k['W'] || k['ArrowUp'])    camera.position.addScaledVector(forward, speed)
    if (k['s'] || k['S'] || k['ArrowDown'])  camera.position.addScaledVector(forward, -speed)
    if (k['a'] || k['A'] || k['ArrowLeft'])  camera.position.addScaledVector(right, -speed)
    if (k['d'] || k['D'] || k['ArrowRight']) camera.position.addScaledVector(right, speed)
    if (k['q'] || k['Q'] || k[' '])         camera.position.y += vSpeed
    if (k['e'] || k['E'])                   camera.position.y -= vSpeed

    // Expose current camera state for capture
    if (cameraRef) {
      const lookTarget = new THREE.Vector3()
      camera.getWorldDirection(lookTarget)
      lookTarget.multiplyScalar(2).add(camera.position)
      cameraRef.current = {
        position: [+camera.position.x.toFixed(3), +camera.position.y.toFixed(3), +camera.position.z.toFixed(3)],
        target: [+lookTarget.x.toFixed(3), +lookTarget.y.toFixed(3), +lookTarget.z.toFixed(3)],
      }
    }
  })

  return null
}
