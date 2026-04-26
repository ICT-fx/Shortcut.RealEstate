import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useViewer } from './useViewer'
import { CameraController } from './CameraController'
import { Hotspots } from './Hotspots'
import { RoomNav } from './RoomNav'

function Model({ url }) {
  if (!url) return null
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Spinner({ height }) {
  return (
    <div style={{
      width: '100%',
      height,
      background: 'linear-gradient(135deg, #0d0d1a 0%, #111827 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid rgba(255,255,255,0.08)',
        borderTop: '3px solid rgba(255,255,255,0.55)',
        borderRadius: '50%',
        animation: 'viewer-spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes viewer-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function Viewer3D({
  glbUrl,
  rooms = [],
  height = 500,
  showHotspots = true,
  accentColor = '#6845EC',
  editorMode = false,
  onSavePosition,
}) {
  const { activeRoom, flyToRoom, controlsRef, targetPos, targetLookAt, animating } = useViewer()

  function handleCapture() {
    if (!controlsRef.current || !onSavePosition) return
    const cam = controlsRef.current.object
    onSavePosition({
      camera_position: [
        parseFloat(cam.position.x.toFixed(3)),
        parseFloat(cam.position.y.toFixed(3)),
        parseFloat(cam.position.z.toFixed(3)),
      ],
      camera_target: [
        parseFloat(controlsRef.current.target.x.toFixed(3)),
        parseFloat(controlsRef.current.target.y.toFixed(3)),
        parseFloat(controlsRef.current.target.z.toFixed(3)),
      ],
    })
  }

  const mobileHeight = Math.min(height, 320)
  const responsiveHeight = window.innerWidth < 640 ? mobileHeight : height

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: responsiveHeight,
      borderRadius: 16,
      overflow: 'hidden',
      background: '#0d0d1a',
    }}>
      <Suspense fallback={<Spinner height={responsiveHeight} />}>
        <Canvas
          camera={{ position: [5, 3, 8], fov: 55 }}
          style={{ width: '100%', height: '100%' }}
          shadows
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <Model url={glbUrl} />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            maxPolarAngle={Math.PI / 1.8}
            minDistance={1}
            maxDistance={30}
          />
          <CameraController
            controlsRef={controlsRef}
            targetPos={targetPos}
            targetLookAt={targetLookAt}
            animating={animating}
          />
          {showHotspots && rooms.length > 0 && (
            <Hotspots rooms={rooms} activeRoom={activeRoom} />
          )}
        </Canvas>
      </Suspense>

      {rooms.length > 0 && (
        <RoomNav
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={flyToRoom}
          accentColor={accentColor}
        />
      )}

      {editorMode && (
        <button
          onClick={handleCapture}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#6845EC',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: '0.82rem',
            letterSpacing: '-0.02em',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          Capture position
        </button>
      )}
    </div>
  )
}
