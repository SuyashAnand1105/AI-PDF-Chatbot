import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { chats, fetchChats, deleteChat } = useChatStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { fetchChats() }, [])

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logged out') }

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation()
    await deleteChat(id)
    if (location.pathname.includes(id)) navigate('/dashboard')
  }

  return (
    <div style={{ width: 240, background: 'rgba(15,23,42,0.6)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🤖</span>
        <span className="gradient-text" style={{ fontWeight: 800, fontSize: 17 }}>DocuMind AI</span>
      </div>

      {/* New Chat */}
      <div style={{ padding: '12px' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 12, color: '#00d4ff', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            ➕ New Chat
          </motion.button>
        </Link>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 8px' }}>
        {[
          { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
        ].map(item => (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 2, background: location.pathname === item.path ? 'rgba(37,99,235,0.2)' : 'transparent', color: location.pathname === item.path ? '#60a5fa' : '#9ca3af', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
              <span>{item.icon}</span> {item.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Chats */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 8px' }}>
        <p style={{ fontSize: 11, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>Recent Chats</p>
        {chats.length === 0 && <p style={{ fontSize: 13, color: '#4b5563', padding: '0 8px' }}>No chats yet</p>}
        {chats.slice(0, 15).map(chat => (
          <Link key={chat.id} to={`/chat/${chat.id}`} style={{ textDecoration: 'none' }}>
            <div className="group" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, marginBottom: 2, background: location.pathname === `/chat/${chat.id}` ? 'rgba(37,99,235,0.2)' : 'transparent', color: location.pathname === `/chat/${chat.id}` ? '#60a5fa' : '#9ca3af', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!location.pathname.includes(chat.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!location.pathname.includes(chat.id)) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ flexShrink: 0 }}>💬</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</span>
              <button onClick={(e) => handleDelete(e, chat.id)}
                style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, padding: 2, flexShrink: 0, opacity: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                🗑️
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} title="Logout"
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16, padding: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
          🚪
        </button>
      </div>
    </div>
  )
}
