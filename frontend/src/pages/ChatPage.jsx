import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../store/chatStore'
import Sidebar from '../components/layout/Sidebar'
import AIToolsPanel from '../components/chat/AIToolsPanel'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  'Summarize this document',
  'What are the main topics?',
  'List the key conclusions',
  'What are the most important points?',
]

export default function ChatPage() {
  const { chatId } = useParams()
  const { currentChat, messages, loadChat, sendMessage, isSending } = useChatStore()
  const [input, setInput] = useState('')
  const [showTools, setShowTools] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => { if (chatId) loadChat(chatId) }, [chatId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isSending])

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    const msg = input.trim()
    setInput('')
    const result = await sendMessage(chatId, msg)
    if (!result.success) toast.error(result.message || 'Failed to send')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return toast.error('Voice not supported in this browser')
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const r = new SR()
    r.onresult = (e) => { setInput(p => p + e.results[0][0].transcript); setIsListening(false) }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    recognitionRef.current = r
    r.start(); setIsListening(true)
  }

  const exportChat = () => {
    if (!messages.length) return
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = 'chat.txt'; a.click()
    toast.success('Chat exported!')
  }

  const pdfId = currentChat?.pdfIds?.[0]
  const pdfName = currentChat?.pdfNames?.[0] || 'Document'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#030712', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(10px)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{currentChat?.title || 'Chat'}</div>
            <div style={{ fontSize: 12, color: '#00d4ff', display: 'flex', alignItems: 'center', gap: 4 }}>
              🤖 {pdfName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowTools(!showTools)}
              style={{ padding: '8px 14px', background: showTools ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showTools ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, color: showTools ? '#00d4ff' : '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              ⚡ AI Tools
            </button>
            <button onClick={exportChat}
              style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}>
              💾 Export
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div className="animate-float" style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ready to chat!</h2>
                  <p style={{ color: '#9ca3af', marginBottom: 32, maxWidth: 400 }}>
                    I've analyzed <span style={{ color: '#00d4ff', fontWeight: 600 }}>{pdfName}</span>. Ask me anything about it!
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 480, width: '100%' }}>
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.02 }} onClick={() => setInput(s)}
                        className="glass glass-hover"
                        style={{ padding: '12px 16px', borderRadius: 12, color: '#d1d5db', fontSize: 13, cursor: 'pointer', textAlign: 'left', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'linear-gradient(135deg, #00d4ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          {msg.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: 16, borderTopRightRadius: msg.role === 'user' ? 4 : 16, borderTopLeftRadius: msg.role === 'user' ? 16 : 4, background: msg.role === 'user' ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.06)', border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`, fontSize: 14, lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isSending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                      <div className="glass" style={{ padding: '14px 20px', borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="glass" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 16px', borderRadius: 16 }}>
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Ask anything about your PDF..."
                  rows={1}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, resize: 'none', maxHeight: 120, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}
                />
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={handleVoice}
                    style={{ width: 38, height: 38, borderRadius: 10, background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, color: isListening ? '#ef4444' : '#9ca3af', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isListening ? '🔴' : '🎤'}
                  </button>
                  <motion.button onClick={handleSend} disabled={!input.trim() || isSending} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() && !isSending ? 'linear-gradient(135deg, #00d4ff, #a855f7)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: input.trim() && !isSending ? 'pointer' : 'not-allowed', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ➤
                  </motion.button>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#4b5563', marginTop: 8 }}>Enter to send · Shift+Enter for new line</p>
            </div>
          </div>

          {/* AI Tools Panel */}
          <AnimatePresence>
            {showTools && pdfId && (
              <AIToolsPanel pdfId={pdfId} onClose={() => setShowTools(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
