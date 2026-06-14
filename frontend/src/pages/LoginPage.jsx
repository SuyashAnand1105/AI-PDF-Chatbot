import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) { toast.success('Welcome back!'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="blob" style={{ width: 350, height: 350, background: '#00d4ff', top: 0, left: 0 }} />
      <div className="blob" style={{ width: 350, height: 350, background: '#a855f7', bottom: 0, right: 0, animationDelay: '3s' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>🤖</span>
              <span className="gradient-text" style={{ fontSize: 24, fontWeight: 800 }}>DocuMind AI</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#9ca3af' }}>Sign in to chat with your PDFs</p>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#d1d5db' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#d1d5db' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field" required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ padding: '14px', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? '⏳ Signing in...' : 'Sign In'}
            </motion.button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: '#9ca3af', fontSize: 14 }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
