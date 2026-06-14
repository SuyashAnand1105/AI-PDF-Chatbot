import { create } from 'zustand'
import api from '../utils/api'

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isSending: false,

  fetchChats: async () => {
    try {
      const { data } = await api.get('/chat')
      set({ chats: data.data.chats })
    } catch {}
  },

  createChat: async (pdfIds) => {
    try {
      const { data } = await api.post('/chat/create', { pdfIds })
      set(s => ({ chats: [data.data.chat, ...s.chats] }))
      return { success: true, chat: data.data.chat }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Failed to create chat' }
    }
  },

  loadChat: async (id) => {
    try {
      const { data } = await api.get(`/chat/${id}`)
      set({ currentChat: data.data.chat, messages: data.data.chat.messages || [] })
      return { success: true }
    } catch { return { success: false } }
  },

  sendMessage: async (chatId, message) => {
    const userMsg = { id: Date.now(), role: 'user', content: message, timestamp: new Date() }
    set(s => ({ messages: [...s.messages, userMsg], isSending: true }))
    try {
      const { data } = await api.post(`/chat/${chatId}/message`, { message })
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: data.data.message, timestamp: new Date() }
      set(s => ({ messages: [...s.messages, aiMsg], isSending: false }))
      return { success: true }
    } catch (e) {
      set(s => ({ messages: s.messages.filter(m => m.id !== userMsg.id), isSending: false }))
      return { success: false, message: e.response?.data?.message || 'Failed' }
    }
  },

  deleteChat: async (id) => {
    try {
      await api.delete(`/chat/${id}`)
      set(s => ({ chats: s.chats.filter(c => c.id !== id) }))
      return { success: true }
    } catch { return { success: false } }
  },

  clearChat: () => set({ currentChat: null, messages: [] })
}))
