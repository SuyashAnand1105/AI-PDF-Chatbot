import { create } from 'zustand'
import api from '../utils/api'

export const usePDFStore = create((set, get) => ({
  pdfs: [],
  isLoading: false,

  fetchPDFs: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/pdf')
      set({ pdfs: data.data.pdfs, isLoading: false })
    } catch { set({ isLoading: false }) }
  },

  uploadPDF: async (file, onProgress) => {
    const form = new FormData()
    form.append('pdf', file)
    try {
      const { data } = await api.post('/pdf/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress && onProgress(Math.round(e.loaded * 100 / e.total))
      })
      set(s => ({ pdfs: [data.data.pdf, ...s.pdfs] }))
      return { success: true, pdf: data.data.pdf }
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'Upload failed' }
    }
  },

  deletePDF: async (id) => {
    try {
      await api.delete(`/pdf/${id}`)
      set(s => ({ pdfs: s.pdfs.filter(p => p.id !== id) }))
      return { success: true }
    } catch { return { success: false } }
  },

  checkStatus: async (id) => {
    try {
      const { data } = await api.get(`/pdf/${id}/status`)
      set(s => ({ pdfs: s.pdfs.map(p => p.id === id ? { ...p, ...data.data, processingStatus: data.data.status } : p) }))
      return data.data
    } catch { return null }
  }
}))
