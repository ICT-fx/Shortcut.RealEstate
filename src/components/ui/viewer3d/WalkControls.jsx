import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function WalkControls({ enabled, cameraRef }) {
  const { camera, gl } = useThree()
  const keys = useRef({})
  const mouseDown = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))

  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e) {
      keys.current[e.key] = true
      // Prevent arrow keys from scrolling the page
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
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
      euler.current.setFromQuaternion(camera.quaternion)
      euler.current.y -= dx * 0.003
      euler.current.x -= dy * 0.003
      euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }

    // Sync initial euler from current camera orientation
    euler.current.setFromQuaternion(camera.quaternion)
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
  }, [enabled, camera, gl])

  useFrame((_, delta) => {
    if (!enabled) return
    const speed = 4 * delta

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

    // Expose current camera state for capture
    if (cameraRef) {
      const lookTarget = new THREE.Vector3()
      camera.getWorldDirection(lookTarget)
      lookTarget.multiplyScalar(2).add(camera.position)
      cameraRef.current = {
        position: [parseFloat(camera.position.x.toFixed(3)), parseFloat(camera.position.y.toFixed(3)), parseFloat(camera.position.z.toFixed(3))],
        target: [parseFloat(lookTarget.x.toFixed(3)), parseFloat(lookTarget.y.toFixed(3)), parseFloat(lookTarget.z.toFixed(3))],
      }
    }
  })

  return null
}
