import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePDFStore } from '../../store/pdfStore'
import toast from 'react-hot-toast'

const statusMap = {
  pending:    { icon: '⏳', color: '#f59e0b', label: 'Pending' },
  processing: { icon: '⚙️', color: '#00d4ff', label: 'Processing...' },
  completed:  { icon: '✅', color: '#22c55e', label: 'Ready to chat' },
  failed:     { icon: '❌', color: '#ef4444', label: 'Failed' },
}

export default function PDFCard({ pdf, onStartChat }) {
  const { deletePDF, checkStatus } = usePDFStore()
  const [status, setStatus] = useState(pdf.processingStatus || 'pending')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'processing' || status === 'pending') {
      const t = setInterval(async () => {
        const r = await checkStatus(pdf.id)
        if (r?.status) { setStatus(r.status); if (r.status === 'completed' || r.status === 'failed') clearInterval(t) }
      }, 3000)
      return () => clearInterval(t)
    }
  }, [status])

  const handleDelete = async (e) => {
    e.stopPropagation(); setDeleting(true)
    const r = await deletePDF(pdf.id)
    if (!r.success) { toast.error('Delete failed'); setDeleting(false) }
  }

  const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB'
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const s = statusMap[status] || statusMap.pending

  return (
    <motion.div whileHover={{ y: -3 }} className="card" style={{ opacity: deleting ? 0.5 : 1, position: 'relative', overflow: 'hidden' }}>
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #00d4ff, #a855f7)', opacity: status === 'completed' ? 1 : 0.3 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }} title={pdf.originalName}>{pdf.originalName}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{fmt(pdf.fileSize)} · {pdf.pageCount ? `${pdf.pageCount} pages` : '...'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, color: s.color }}>
        <span>{s.icon}</span> <span>{s.label}</span>
        {status === 'completed' && pdf.chunkCount && <span style={{ color: '#4b5563', fontSize: 12 }}>· {pdf.chunkCount} chunks</span>}
      </div>

      <p style={{ fontSize: 12, color: '#4b5563', marginBottom: 14 }}>Uploaded {fmtDate(pdf.createdAt)}</p>

      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button onClick={() => onStartChat(pdf.id)} disabled={status !== 'completed'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ flex: 1, padding: '9px', background: status === 'completed' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${status === 'completed' ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: status === 'completed' ? '#00d4ff' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: status === 'completed' ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          💬 {status === 'completed' ? 'Chat Now' : 'Processing...'}
        </motion.button>
        <button onClick={handleDelete} disabled={deleting}
          style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#6b7280', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
          🗑️
        </button>
      </div>
    </motion.div>
  )
}
