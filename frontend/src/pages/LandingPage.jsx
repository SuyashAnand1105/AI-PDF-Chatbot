import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#030712', overflow: 'hidden', position: 'relative' }}>
      {/* Blobs */}
      <div className="blob" style={{ width: 400, height: 400, background: '#00d4ff', top: -100, left: '10%' }} />
      <div className="blob" style={{ width: 400, height: 400, background: '#a855f7', top: 100, right: '10%', animationDelay: '2s' }} />

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🤖</span>
          <span className="gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>DocuMind AI</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
          <Link to="/register">
            <button className="btn-primary">Get Started Free</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 20px 60px', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 999, fontSize: 13, color: '#00d4ff', marginBottom: 32 }}>
            ✨ Powered by Google Gemini AI
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
            Chat with your <span className="gradient-text">PDFs</span><br />like never before
          </h1>

          <p style={{ fontSize: 20, color: '#9ca3af', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Upload any PDF and have an intelligent AI conversation with it. Get instant answers, summaries, quizzes and more.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', border: 'none', borderRadius: 14, color: 'white', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 40px rgba(0,212,255,0.3)' }}
              >
                Start Chatting Free →
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="glass"
                style={{ padding: '16px 36px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, color: 'white', fontSize: 17, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 900, margin: '80px auto 0', padding: '0 20px' }}
        >
          {[
            { icon: '📄', title: 'Upload PDF', desc: 'Drag & drop any PDF up to 50MB' },
            { icon: '🤖', title: 'AI Chat', desc: 'Ask questions in plain English' },
            { icon: '⚡', title: 'Instant Answers', desc: 'Get accurate answers in seconds' },
            { icon: '🎯', title: 'Smart Tools', desc: 'Summaries, quizzes & flashcards' },
          ].map((f, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: '#9ca3af', fontSize: 14 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563', fontSize: 14, position: 'relative', zIndex: 10 }}>
        © 2024 DocuMind AI · Built with React + Node.js + Gemini AI
      </div>
    </div>
  )
}
