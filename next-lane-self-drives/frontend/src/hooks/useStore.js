import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API = '/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await axios.post(`${API}/auth/login`, { email, password })
          set({ user: data.user, token: data.token, isLoading: false })
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const { data } = await axios.post(`${API}/auth/register`, userData)
          set({ user: data.user, token: data.token, isLoading: false })
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null })
        delete axios.defaults.headers.common['Authorization']
      },

      isAdmin: () => get().user?.role === 'admin',
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'nextlane-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)

// Theme store
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
        document.documentElement.classList.toggle('light', next === 'light')
      },
    }),
    { name: 'nextlane-theme' }
  )
)
