import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Viewer3D } from '../../components/ui/viewer3d/Viewer3D'

/* ── Step 1: Upload GLB and create model row ── */
function StepUpload({ onDone }) {
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !file) return
    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const tmpId = crypto.randomUUID()
    const path = `${tmpId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('models')
      .upload(path, file, { contentType: 'model/gltf-binary', upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('models').getPublicUrl(path)

    const { data: model, error: insertError } = await supabase
      .from('models')
      .insert({ id: tmpId, name: name.trim(), glb_url: urlData.publicUrl, rooms: [] })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setUploading(false)
      return
    }

    onDone(model)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Project name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Villa Riviera — Apartment 3B"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>GLB / GLTF file</label>
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={e => setFile(e.target.files[0])}
          required
          style={{ ...inputStyle, padding: '10px 12px', cursor: 'pointer' }}
        />
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
      <button type="submit" disabled={uploading} style={primaryBtn}>
        {uploading ? 'Uploading…' : 'Upload & continue →'}
      </button>
    </form>
  )
}

/* ── Step 2: Navigate viewer, capture room positions ── */
function StepRooms({ model, onDone }) {
  const [rooms, setRooms] = useState(model.rooms ?? [])
  const [capturing, setCapturing] = useState(false)
  const [pendingPos, setPendingPos] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [roomArea, setRoomArea] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function handleSavePosition(pos) {
    setPendingPos(pos)
    setCapturing(true)
  }

  function handleAddRoom(e) {
    e.preventDefault()
    if (!roomName.trim() || !pendingPos) return
    const newRoom = {
      name: roomName.trim(),
      area_m2: roomArea ? parseFloat(roomArea) : null,
      camera_position: pendingPos.camera_position,
      camera_target: pendingPos.camera_target,
    }
    setRooms(prev => [...prev, newRoom])
    setCapturing(false)
    setRoomName('')
    setRoomArea('')
    setPendingPos(null)
  }

  function removeRoom(idx) {
    setRooms(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('models')
      .update({ rooms })
      .eq('id', model.id)
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    onDone({ ...model, rooms })
  }

  return (
    <div style={{ display: 'flex', gap: 24, height: 560 }}>
      {/* Left: viewer */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Viewer3D
          glbUrl={model.glb_url}
          rooms={rooms}
          height={520}
          editorMode
          onSavePosition={handleSavePosition}
          showHotspots={rooms.length > 0}
        />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: 8, letterSpacing: '-0.01em' }}>
          Navigate the model, then click "Capture position" to save a room viewpoint.
        </p>
      </div>

      {/* Right: room list + capture form */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.03em', margin: 0 }}>
          Rooms ({rooms.length})
        </h3>

        {rooms.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>No rooms yet. Navigate then capture.</p>
        )}

        {rooms.map((room, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em' }}>{room.name}</div>
              {room.area_m2 && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{room.area_m2}m²</div>}
            </div>
            <button onClick={() => removeRoom(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif' }}>
              Remove
            </button>
          </div>
        ))}

        {capturing && (
          <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(104,69,236,0.1)', border: '1px solid rgba(104,69,236,0.25)', borderRadius: 10, padding: 14 }}>
            <p style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>Position captured ✓ — name this room</p>
            <input
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="Room name (e.g. Living Room)"
              required
              autoFocus
              style={{ ...inputStyle, fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <input
              value={roomArea}
              onChange={e => setRoomArea(e.target.value)}
              placeholder="Surface area m² (optional)"
              type="number"
              step="0.1"
              style={{ ...inputStyle, fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{ ...primaryBtn, flex: 1, padding: '8px 0', fontSize: '0.82rem' }}>Add room</button>
              <button type="button" onClick={() => setCapturing(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', padding: '8px 12px', fontSize: '0.82rem' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>}

        <button onClick={handleSave} disabled={saving || rooms.length === 0} style={{ ...primaryBtn, marginTop: 'auto', opacity: rooms.length === 0 ? 0.4 : 1 }}>
          {saving ? 'Saving…' : 'Save rooms & continue →'}
        </button>
      </div>
    </div>
  )
}

/* ── Step 3: Assign to demo or client order ── */
function StepAssign({ model, onDone }) {
  const navigate = useNavigate()
  const [isDemo, setIsDemo] = useState(model.is_demo ?? false)
  const [orderId, setOrderId] = useState(model.order_id ?? '')
  const [orders, setOrders] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useState(() => {
    supabase
      .from('orders')
      .select('id, title')
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders(data ?? []))
  })

  async function handlePublish() {
    setSaving(true)
    setError(null)

    // If marking as demo, unset any existing demo first
    if (isDemo) {
      await supabase.from('models').update({ is_demo: false }).eq('is_demo', true).neq('id', model.id)
    }

    const { error: err } = await supabase
      .from('models')
      .update({
        is_demo: isDemo,
        order_id: orderId || null,
      })
      .eq('id', model.id)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    navigate('/admin')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div
            onClick={() => setIsDemo(v => !v)}
            style={{
              width: 44, height: 24, borderRadius: 100,
              background: isDemo ? '#03A63C' : 'rgba(255,255,255,0.12)',
              position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: isDemo ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s ease',
            }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.02em' }}>Landing page demo</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Replaces the current demo model on the site</div>
          </div>
        </label>
      </div>

      <div>
        <label style={labelStyle}>Link to a client order (optional)</label>
        <select
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">— No assignment —</option>
          {orders.map(o => (
            <option key={o.id} value={o.id}>{o.title || o.id}</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

      <button onClick={handlePublish} disabled={saving} style={primaryBtn}>
        {saving ? 'Publishing…' : 'Publish model'}
      </button>
    </div>
  )
}

/* ── Shared styles ── */
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
  textAlign: 'center',
}

/* ── Wizard shell ── */
const STEPS = ['Upload', 'Define rooms', 'Assign']

export default function AdminModelNew() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [model, setModel] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', fontFamily: 'DM Sans, sans-serif', padding: '40px 32px' }}>
      <div style={{ maxWidth: step === 1 ? 1100 : 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', padding: 0 }}
          >
            ← Back
          </button>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>
            Add model
          </h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: i > step ? 0.35 : 1,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: i < step ? '#03A63C' : i === step ? '#6845EC' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ color: i === step ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.12)', margin: '0 10px' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 0 && (
          <StepUpload onDone={m => { setModel(m); setStep(1) }} />
        )}
        {step === 1 && model && (
          <StepRooms model={model} onDone={m => { setModel(m); setStep(2) }} />
        )}
        {step === 2 && model && (
          <StepAssign model={model} onDone={() => navigate('/admin')} />
        )}
      </div>
    </div>
  )
}
