import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    const result = await register(form.name, form.email, form.password)
    if (result.success) { toast.success('Account created! Welcome!'); navigate('/dashboard') }
    else toast.error(result.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="blob" style={{ width: 350, height: 350, background: '#a855f7', top: 0, right: 0 }} />
      <div className="blob" style={{ width: 350, height: 350, background: '#00d4ff', bottom: 0, left: 0, animationDelay: '3s' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>🤖</span>
              <span className="gradient-text" style={{ fontSize: 24, fontWeight: 800 }}>DocuMind AI</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: '#9ca3af' }}>Start chatting with your PDFs for free</p>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 characters' },
              { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#d1d5db' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="input-field" required />
              </div>
            ))}
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ padding: '14px', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: 4 }}>
              {isLoading ? '⏳ Creating account...' : 'Create Account'}
            </motion.button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: '#9ca3af', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
