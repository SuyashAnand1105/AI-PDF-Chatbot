import { create } from 'zustand'
import api from '../utils/api'

const saved = localStorage.getItem('auth')
const initial = saved ? JSON.parse(saved) : { user: null, token: null }

export const useAuthStore = create((set) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: !!initial.token,
  isLoading: false,

  checkAuth: () => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      const { user, token } = JSON.parse(saved)
      set({ user, token, isAuthenticated: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { user, token } = data.data
      localStorage.setItem('auth', JSON.stringify({ user, token }))
      set({ user, token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (e) {
      set({ isLoading: false })
      return { success: false, message: e.response?.data?.message || 'Login failed' }
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      const { user, token } = data.data
      localStorage.setItem('auth', JSON.stringify({ user, token }))
      set({ user, token, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (e) {
      set({ isLoading: false })
      return { success: false, message: e.response?.data?.message || 'Registration failed' }
    }
  },

  logout: () => {
    localStorage.removeItem('auth')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
