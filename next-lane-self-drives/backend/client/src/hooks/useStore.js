import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import { createClient } from '../utils/supabase/client'

const supabase = createClient()
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
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          
          // After successful Supabase login, fetch MongoDB profile
          const { data: profile } = await axios.get(`${API}/auth/profile`)
          set({ user: profile.user, token: data.session.access_token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name,
                phone: userData.phone
              }
            }
          })
          if (error) throw error
          
          // User is signed up in Supabase. Now we need to sync with MongoDB.
          // The backend protect middleware handles the auto-creation of the MongoDB record
          // but we trigger a profile fetch to initialize the store.
          const { data: profile } = await axios.get(`${API}/auth/profile`)
          set({ user: profile.user, token: data.session?.access_token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.message || 'Registration failed' }
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, token: null })
        delete axios.defaults.headers.common['Authorization']
      },

      isAdmin: () => get().user?.role === 'admin',
      isAuthenticated: () => !!get().user,
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
