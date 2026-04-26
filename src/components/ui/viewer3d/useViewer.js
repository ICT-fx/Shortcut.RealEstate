import { useState, useRef } from 'react'

export function useViewer() {
  const [activeRoom, setActiveRoom] = useState(null)
  const controlsRef = useRef(null)
  const targetPos = useRef(null)
  const targetLookAt = useRef(null)
  const animating = useRef(false)

  function flyToRoom(room) {
    setActiveRoom(room.name)
    targetPos.current = room.camera_position
    targetLookAt.current = room.camera_target
    animating.current = true
  }

  return { activeRoom, flyToRoom, controlsRef, targetPos, targetLookAt, animating }
}
