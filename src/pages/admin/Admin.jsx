import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchModels()
  }, [])

  async function fetchModels() {
    const { data } = await supabase
      .from('models')
      .select('id, name, is_demo, order_id, created_at, rooms')
      .order('created_at', { ascending: false })
    setModels(data ?? [])
    setLoading(false)
  }

  async function deleteModel(id) {
    if (!confirm('Delete this model? This cannot be undone.')) return
    await supabase.from('models').delete().eq('id', id)
    setModels(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070F', fontFamily: 'DM Sans, sans-serif', padding: '40px 32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', textDecoration: 'none' }}>← Site</a>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.04em', margin: 0 }}>
              3D Models
            </h1>
          </div>
          <button
            onClick={() => navigate('/admin/models/new')}
            style={{ background: '#6845EC', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.02em', cursor: 'pointer' }}
          >
            + Add model
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading…</p>
        ) : models.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No models yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {models.map(model => (
              <div
                key={model.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.03em' }}>
                      {model.name}
                    </span>
                    {model.is_demo && (
                      <span style={{ background: '#03A63C', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>
                        DEMO
                      </span>
                    )}
                    {model.order_id && (
                      <span style={{ background: 'rgba(104,69,236,0.25)', color: '#a78bfa', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>
                        CLIENT
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginTop: 4, letterSpacing: '-0.01em' }}>
                    {(model.rooms ?? []).length} room{(model.rooms ?? []).length !== 1 ? 's' : ''} defined
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => navigate(`/admin/models/${model.id}`)}
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteModel(model.id)}
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '7px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
