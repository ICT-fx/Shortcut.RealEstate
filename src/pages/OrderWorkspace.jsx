import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { STATUS_COLORS } from '../lib/constants'
import { BookingOverlay } from '../components/ui/booking-overlay'
import { ArrowLeft, MessageSquare, FolderOpen, Calendar, Send } from 'lucide-react'

export default function OrderWorkspace() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [tab, setTab] = useState('chat')
  const [bookingOpen, setBookingOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
      .then(({ data }) => setOrder(data))
  }, [orderId])

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(104,69,236,0.15)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <BookingOverlay
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        src="https://cal.com/fantin-slmlin/revision-call?embed=true"
      />

      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(17,24,39,0.45)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', letterSpacing: '-0.02em', padding: 0, fontFamily: 'DM Sans, sans-serif' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', letterSpacing: '-0.03em' }}>
            {order.title || 'Untitled project'}
          </span>
          <span style={{ background: statusColor.bg, color: statusColor.text, fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={() => setBookingOpen(true)}
          style={{ background: '#6845EC', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '-0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Calendar size={14} /> Book a Revision Call
        </button>
      </header>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 24px', display: 'flex', gap: 0, flexShrink: 0 }}>
        {[
          { key: 'chat', label: 'Chat', icon: <MessageSquare size={15} /> },
          { key: 'files', label: 'Files', icon: <FolderOpen size={15} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid #6845EC' : '2px solid transparent',
              color: tab === t.key ? '#6845EC' : 'rgba(17,24,39,0.45)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em',
              padding: '14px 20px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'color 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'chat' && <ChatTab orderId={orderId} />}
        {tab === 'files' && <FilesTab orderId={orderId} />}
      </div>
    </div>
  )
}

function ChatTab({ orderId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id))

    supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))

    const channel = supabase
      .channel(`messages:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: userId,
      sender_role: 'client',
      content: text.trim(),
    })
    setText('')
    setSending(false)
  }

  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(17,24,39,0.3)', fontSize: '0.85rem', letterSpacing: '-0.02em', marginTop: 32 }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map(msg => {
          const isClient = msg.sender_role === 'client'
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isClient ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '70%',
                background: isClient ? '#6845EC' : '#fff',
                color: isClient ? '#fff' : '#111827',
                border: isClient ? 'none' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: isClient ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {!isClient && (
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6845EC', letterSpacing: '-0.01em', marginBottom: 4, margin: '0 0 4px' }}>
                    Shortcut team
                  </p>
                )}
                <p style={{ fontSize: '0.88rem', letterSpacing: '-0.02em', lineHeight: 1.5, margin: 0 }}>
                  {msg.content}
                </p>
                <p style={{ fontSize: '0.68rem', opacity: 0.55, marginTop: 4, textAlign: 'right', margin: '4px 0 0' }}>
                  {fmtTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        style={{ padding: '12px 24px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 10, flexShrink: 0 }}
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          style={{
            flex: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, padding: '10px 14px',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', letterSpacing: '-0.02em',
            outline: 'none', background: '#FAFAFA', color: '#111827',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          style={{
            background: '#6845EC', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.02em',
            opacity: !text.trim() || sending ? 0.5 : 1,
          }}
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  )
}

function FilesTab({ orderId }) {
  const [deliverables, setDeliverables] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    supabase
      .from('deliverables')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDeliverables(data ?? []))
  }, [orderId])

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadError('')

    const path = `${orderId}/${Date.now()}-${file.name}`
    const { error: storageError } = await supabase.storage
      .from('deliverables')
      .upload(path, file)

    if (storageError) {
      setUploadError(storageError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('deliverables')
      .getPublicUrl(path)

    await supabase.from('deliverables').insert({
      order_id: orderId,
      file_name: file.name,
      file_url: publicUrl,
      uploaded_by: 'client',
    })

    const { data } = await supabase
      .from('deliverables')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
    setDeliverables(data ?? [])
    setUploading(false)
    e.target.value = ''
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Upload section */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Upload your rushes & photos
        </p>
        <p style={{ fontSize: '0.78rem', color: 'rgba(17,24,39,0.4)', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Share your raw footage and photos directly here.
        </p>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: uploading ? 'rgba(104,69,236,0.08)' : '#6845EC',
          color: uploading ? '#6845EC' : '#fff',
          border: uploading ? '1px solid #6845EC' : 'none',
          borderRadius: 9, padding: '9px 18px',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '-0.02em',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}>
          {uploading ? 'Uploading…' : 'Choose file'}
          <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        </label>
        {uploadError && <p style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: 8 }}>{uploadError}</p>}
      </div>

      {/* Files list */}
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.35)', marginBottom: 12 }}>
          All files
        </p>

        {deliverables === null && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div style={{ width: 24, height: 24, border: '3px solid rgba(104,69,236,0.15)', borderTop: '3px solid #6845EC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {deliverables !== null && deliverables.length === 0 && (
          <p style={{ color: 'rgba(17,24,39,0.3)', fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
            No files yet. We'll upload your edited video here when it's ready.
          </p>
        )}

        {deliverables !== null && deliverables.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deliverables.map(file => (
              <div key={file.id} style={{
                background: '#fff', borderRadius: 10, padding: '12px 16px',
                border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827', letterSpacing: '-0.03em', margin: 0 }}>
                    {file.file_name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(17,24,39,0.35)', letterSpacing: '-0.02em', margin: '3px 0 0' }}>
                    {file.uploaded_by === 'team' ? 'From Shortcut' : 'Your upload'} · {fmt(file.created_at)}
                  </p>
                </div>
                <a
                  href={file.file_url}
                  download={file.file_name}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'rgba(104,69,236,0.08)', color: '#6845EC',
                    borderRadius: 8, padding: '7px 14px',
                    fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '-0.02em',
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
