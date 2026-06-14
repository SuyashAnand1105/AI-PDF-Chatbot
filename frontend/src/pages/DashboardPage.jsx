import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { usePDFStore } from '../store/pdfStore'
import { useChatStore } from '../store/chatStore'
import Sidebar from '../components/layout/Sidebar'
import PDFUploadZone from '../components/pdf/PDFUploadZone'
import PDFCard from '../components/pdf/PDFCard'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { pdfs, fetchPDFs, isLoading } = usePDFStore()
  const { chats, fetchChats, createChat } = useChatStore()
  const navigate = useNavigate()

  useEffect(() => { fetchPDFs(); fetchChats() }, [])

  const handleStartChat = async (pdfId) => {
    const result = await createChat([pdfId])
    if (result.success) navigate(`/chat/${result.chat.id}`)
    else toast.error(result.message || 'PDF is still processing, please wait...')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#030712', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: '#9ca3af' }}>Upload a PDF and start an intelligent conversation</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '📄', label: 'PDFs Uploaded', value: pdfs.length, color: '#00d4ff' },
            { icon: '💬', label: 'Total Chats', value: chats.length, color: '#a855f7' },
            { icon: '⚡', label: 'AI Ready', value: '100%', color: '#22c55e' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upload */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📤 Upload PDF</h2>
          <PDFUploadZone />
        </motion.div>

        {/* PDF Library */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>📚 Your Documents</h2>
            <span style={{ color: '#9ca3af', fontSize: 14 }}>{pdfs.length} files</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => <div key={i} className="card" style={{ height: 160, opacity: 0.5 }} />)}
            </div>
          ) : pdfs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <p style={{ color: '#9ca3af', fontSize: 16 }}>No documents yet. Upload your first PDF above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {pdfs.map((pdf, i) => (
                <motion.div key={pdf.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <PDFCard pdf={pdf} onStartChat={handleStartChat} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
