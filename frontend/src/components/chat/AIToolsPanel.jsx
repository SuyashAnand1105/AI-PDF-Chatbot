import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const TOOLS = [
  { id: 'summary',   icon: '📝', label: 'Summary',     endpoint: 'summary' },
  { id: 'keywords',  icon: '🏷️', label: 'Keywords',    endpoint: 'keywords' },
  { id: 'points',    icon: '📌', label: 'Key Points',  endpoint: 'important-points' },
  { id: 'quiz',      icon: '❓', label: 'Quiz',        endpoint: 'quiz' },
  { id: 'flashcards',icon: '🃏', label: 'Flashcards',  endpoint: 'flashcards' },
]

export default function AIToolsPanel({ pdfId, onClose }) {
  const [active, setActive] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizDone, setQuizDone] = useState(false)
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const run = async (tool) => {
    setActive(tool.id); setResult(null); setLoading(true)
    setQuizAnswers({}); setQuizDone(false); setCardIdx(0); setFlipped(false)
    try {
      const { data } = await api.get(`/ai/${tool.endpoint}/${pdfId}`)
      setResult(data.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed')
      setActive(null)
    } finally { setLoading(false) }
  }

  const renderResult = () => {
    if (!result) return null
    switch (active) {
      case 'summary':
        return <div style={{ fontSize: 13, lineHeight: 1.8, color: '#d1d5db', whiteSpace: 'pre-wrap' }}>{result.summary}</div>

      case 'keywords':
        return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {result.keywords?.map((k, i) => (
            <span key={i} style={{ padding: '4px 12px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 999, fontSize: 12, color: '#00d4ff' }}>{k}</span>
          ))}
        </div>

      case 'points':
        return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.points?.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#d1d5db' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,212,255,0.2)', color: '#00d4ff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i+1}</span>
              <span style={{ lineHeight: 1.6 }}>{p}</span>
            </div>
          ))}
        </div>

      case 'quiz':
        return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.quiz?.map((q, qi) => (
            <div key={qi} className="glass" style={{ borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{qi+1}. {q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.options?.map((opt, oi) => {
                  const letter = opt.charAt(0)
                  const selected = quizAnswers[qi] === letter
                  const correct = quizDone && letter === q.correctAnswer
                  const wrong = quizDone && selected && !correct
                  return (
                    <button key={oi} onClick={() => !quizDone && setQuizAnswers(p => ({...p, [qi]: letter}))}
                      style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, textAlign: 'left', cursor: quizDone ? 'default' : 'pointer', background: correct ? 'rgba(34,197,94,0.2)' : wrong ? 'rgba(239,68,68,0.2)' : selected ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${correct ? 'rgba(34,197,94,0.5)' : wrong ? 'rgba(239,68,68,0.5)' : selected ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`, color: correct ? '#86efac' : wrong ? '#fca5a5' : selected ? '#67e8f9' : '#d1d5db' }}>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {quizDone && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontStyle: 'italic' }}>{q.explanation}</p>}
            </div>
          ))}
          {!quizDone && (
            <button onClick={() => setQuizDone(true)}
              style={{ padding: '10px', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Submit Answers
            </button>
          )}
        </div>

      case 'flashcards':
        const card = result.flashcards?.[cardIdx]
        return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>{cardIdx+1} / {result.flashcards?.length}</p>
          <motion.div key={cardIdx + (flipped ? 'b' : 'f')} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
            onClick={() => setFlipped(!flipped)}
            className="glass" style={{ borderRadius: 14, padding: '28px 20px', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer' }}>
            <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{flipped ? '✅ Answer' : '❓ Question'}</p>
            <p style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>{flipped ? card?.back : card?.front}</p>
          </motion.div>
          <p style={{ fontSize: 11, color: '#4b5563', textAlign: 'center' }}>Click card to flip</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setCardIdx(Math.max(0, cardIdx-1)); setFlipped(false) }} disabled={cardIdx === 0}
              style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#9ca3af', cursor: cardIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: cardIdx === 0 ? 0.4 : 1 }}>← Prev</button>
            <button onClick={() => { setCardIdx(Math.min(result.flashcards.length-1, cardIdx+1)); setFlipped(false) }} disabled={cardIdx === result.flashcards?.length-1}
              style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#9ca3af', cursor: cardIdx === result.flashcards?.length-1 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: cardIdx === result.flashcards?.length-1 ? 0.4 : 1 }}>Next →</button>
          </div>
        </div>

      default: return null
    }
  }

  return (
    <motion.div initial={{ x: 280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 280, opacity: 0 }}
      style={{ width: 300, borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
          ⚡ AI Tools
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>

      {/* Tool buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px' }}>
        {TOOLS.map(tool => (
          <button key={tool.id} onClick={() => run(tool)}
            style={{ padding: '10px 8px', background: active === tool.id ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active === tool.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: active === tool.id ? '#00d4ff' : '#9ca3af', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
            {tool.icon} {tool.label}
          </button>
        ))}
      </div>

      {/* Result */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, gap: 12 }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(0,212,255,0.3)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Generating with AI...</p>
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {renderResult()}
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, textAlign: 'center' }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>⚡</span>
            <p style={{ fontSize: 13, color: '#6b7280' }}>Pick a tool to analyze your PDF</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
