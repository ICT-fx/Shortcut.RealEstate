import { Html } from '@react-three/drei'

export function Hotspots({ rooms, activeRoom }) {
  return rooms.map((room) => {
    if (!room.camera_target) return null
    const isActive = activeRoom === room.name
    return (
      <Html
        key={room.name}
        position={room.camera_target}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        center
      >
        <div style={{
          background: 'rgba(7,7,15,0.85)',
          border: `1px solid ${isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 8,
          padding: '5px 12px',
          color: '#fff',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          opacity: isActive ? 1 : 0.65,
          transition: 'opacity 0.3s ease, border-color 0.3s ease',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          {room.name}{room.area_m2 ? ` · ${room.area_m2}m²` : ''}
        </div>
      </Html>
    )
  })
}
