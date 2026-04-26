import { useState, useRef } from 'react'

export function useViewer() {
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeRoomData, setActiveRoomData] = useState(null)
  const controlsRef = useRef(null)
  const targetPos = useRef(null)
  const targetLookAt = useRef(null)
  const animating = useRef(false)

  function flyToRoom(room) {
    setActiveRoom(room.name)
    setActiveRoomData(room)
    targetPos.current = room.camera_position
    targetLookAt.current = room.camera_target
    animating.current = true
  }

  function clearActiveRoom() {
    if (animating.current) return // don't clear during transition
    setActiveRoom(null)
    setActiveRoomData(null)
  }

  return { activeRoom, activeRoomData, flyToRoom, clearActiveRoom, controlsRef, targetPos, targetLookAt, animating }
}
