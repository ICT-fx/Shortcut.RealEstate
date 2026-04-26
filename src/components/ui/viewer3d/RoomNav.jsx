export function RoomNav({ rooms, activeRoom, onSelectRoom, accentColor }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8,
      zIndex: 10,
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '0 16px',
    }}>
      {rooms.map(room => {
        const isActive = activeRoom === room.name
        return (
          <button
            key={room.name}
            onClick={() => onSelectRoom(room)}
            style={{
              background: isActive ? accentColor : 'rgba(7,7,15,0.75)',
              color: '#fff',
              border: `1px solid ${isActive ? accentColor : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 100,
              padding: '7px 16px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '0.8rem',
              letterSpacing: '-0.02em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {room.name}
          </button>
        )
      })}
    </div>
  )
}
