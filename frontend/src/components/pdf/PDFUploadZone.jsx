import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { usePDFStore } from '../../store/pdfStore'
import toast from 'react-hot-toast'

export default function PDFUploadZone() {
  const { uploadPDF, checkStatus } = usePDFStore()
  const [files, setFiles] = useState([])

  const onDrop = useCallback(async (accepted, rejected) => {
    if (rejected.length) return toast.error('Only PDF files accepted (max 50MB)')

    for (const file of accepted) {
      const entry = { id: Date.now() + Math.random(), name: file.name, size: file.size, status: 'uploading', progress: 0 }
      setFiles(p => [...p, entry])

      const result = await uploadPDF(file, (prog) => {
        setFiles(p => p.map(f => f.id === entry.id ? { ...f, progress: prog } : f))
      })

      if (result.success) {
        setFiles(p => p.map(f => f.id === entry.id ? { ...f, status: 'processing', progress: 100 } : f))
        toast.success(`${file.name} uploaded! Processing...`)
        pollStatus(result.pdf.id, entry.id)
      } else {
        setFiles(p => p.map(f => f.id === entry.id ? { ...f, status: 'error' } : f))
        toast.error(result.message || 'Upload failed')
      }
    }
  }, [uploadPDF])

  const pollStatus = async (pdfId, fileId) => {
    let attempts = 0
    const poll = async () => {
      if (attempts++ > 40) return
      const s = await checkStatus(pdfId)
      if (s?.status === 'completed') {
        setFiles(p => p.map(f => f.id === fileId ? { ...f, status: 'done' } : f))
        toast.success('✅ PDF ready to chat!')
        setTimeout(() => setFiles(p => p.filter(f => f.id !== fileId)), 3000)
      } else if (s?.status === 'failed') {
        setFiles(p => p.map(f => f.id === fileId ? { ...f, status: 'error' } : f))
        toast.error('PDF processing failed')
      } else {
        setTimeout(poll, 3000)
      }
    }
    setTimeout(poll, 2000)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxSize: 50 * 1024 * 1024, multiple: true
  })

  const fmt = (b) => b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <motion.div {...getRootProps()} whileHover={{ scale: 1.01 }}
        style={{ border: `2px dashed ${isDragActive ? '#00d4ff' : 'rgba(255,255,255,0.15)'}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s' }}>
        <input {...getInputProps()} />
        <div style={{ fontSize: 48, marginBottom: 12 }}>{isDragActive ? '📂' : '📤'}</div>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
          {isDragActive ? 'Drop your PDF here!' : 'Drag & drop your PDF here'}
        </p>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>or click to browse files</p>
        <span style={{ fontSize: 12, color: '#6b7280', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
          PDF only · Max 50MB · Multiple files OK
        </span>
      </motion.div>

      <AnimatePresence>
        {files.map(f => (
          <motion.div key={f.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>
              {f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : f.status === 'processing' ? '⚙️' : '📄'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>{fmt(f.size)}</span>
              </div>
              {f.status === 'uploading' && (
                <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${f.progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #00d4ff, #a855f7)', borderRadius: 999 }} />
                </div>
              )}
              {f.status === 'processing' && <p style={{ fontSize: 12, color: '#00d4ff' }}>⚙️ Processing with AI...</p>}
              {f.status === 'done' && <p style={{ fontSize: 12, color: '#22c55e' }}>Ready to chat!</p>}
              {f.status === 'error' && <p style={{ fontSize: 12, color: '#ef4444' }}>Upload failed</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
