import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Viewer3D } from '../../components/ui/viewer3d/Viewer3D'

const labelStyle = {
  display: 'block',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.82rem',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#fff',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.9rem',
  letterSpacing: '-0.02em',
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryBtn = {
  background: '#6845EC',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '11px 20px',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: '0.9rem',
  letterSpacing: '-0.02em',
  cursor: 'pointer',
}

export default function AdminModelEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [orders, setOrders] = useState([])
  const [capturing, setCapturing] = useState(false)
  const [pendingPos, setPendingPos] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [roomArea, setRoomArea] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('models').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setModel(data)
      setRooms(data.rooms ?? [])
      setIsDemo(data.is_demo ?? false)
      setOrderId(data.order_id ?? '')
    })
    supabase.from('orders').select('id, title').order('created_at', { ascending: false }).then(({ data }) => setOrders(data ?? []))
  }, [id])

  function handleSavePosition(pos) {
    setPendingPos(pos)
    setCapturing(true)
  }

  function handleAddRoom(e) {
    e.preventDefault()
    if (!roomName.trim() || !pendingPos) return
    setRooms(prev => [...prev, {
      name: roomName.trim(),
      area_m2: roomArea ? parseFloat(roomArea) : null,
      camera_position: pendingPos.camera_position,
      camera_target: pendingPos.camera_target,
    }])
    setCapturing(false)
    setRoomName('')
    setRoomArea('')
    setPendingPos(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    if (isDemo) {
      await supabase.from('models').update({ is_demo: false }).eq('is_demo', true).neq('id', id)
    }

    const { error: err } = await supabase
      .from('models')
      .update({ rooms, is_demo: isDemo, order_id: orderId || null })
      .eq('id', id)

    if (err) { setError(err.message); setSaving(false); return }
    navigate('/admin')
  }

  if (!model) {
    return (
      <div style={{ minHeight: '100vh', background: '#07070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', fontFamily: 'DM Sans, sans-serif', padding: '40px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', padding: 0 }}>
            ← Back
          </button>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>
            Edit: {model.name}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Viewer + rooms */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Viewer3D glbUrl={model.glb_url} rooms={rooms} height={480} editorMode onSavePosition={handleSavePosition} showHotspots={rooms.length > 0} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: 8 }}>Navigate then click "Capture position" to add a room.</p>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rooms.map((room, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em' }}>{room.name}</div>
                    {room.area_m2 && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{room.area_m2}m²</div>}
                  </div>
                  <button onClick={() => setRooms(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem' }}>Remove</button>
                </div>
              ))}
            </div>

            {capturing && (
              <form onSubmit={handleAddRoom} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(104,69,236,0.1)', border: '1px solid rgba(104,69,236,0.25)', borderRadius: 10, padding: 14 }}>
                <p style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>Position captured ✓ — name this room</p>
                <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Room name" required autoFocus style={{ ...inputStyle, fontSize: '0.85rem', padding: '8px 12px' }} />
                <input value={roomArea} onChange={e => setRoomArea(e.target.value)} placeholder="Surface area m² (optional)" type="number" step="0.1" style={{ ...inputStyle, fontSize: '0.85rem', padding: '8px 12px' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ ...primaryBtn, flex: 1, padding: '8px 0', fontSize: '0.82rem' }}>Add room</button>
                  <button type="button" onClick={() => setCapturing(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', padding: '8px 12px', fontSize: '0.82rem' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Right panel: assignment */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div onClick={() => setIsDemo(v => !v)} style={{ width: 44, height: 24, borderRadius: 100, background: isDemo ? '#03A63C' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: isDemo ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease' }} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>Landing page demo</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Replaces current demo</div>
                </div>
              </label>
            </div>

            <div>
              <label style={labelStyle}>Client order</label>
              <select value={orderId} onChange={e => setOrderId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">— No assignment —</option>
                {orders.map(o => <option key={o.id} value={o.id}>{o.title || o.id}</option>)}
              </select>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <button onClick={handleSave} disabled={saving} style={primaryBtn}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
