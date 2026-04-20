import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isLoggedIn: boolean
  username: string
  accessToken: string
  refreshToken: string
  login: (username: string, accessToken: string, refreshToken: string) => void
  logout: () => void
  expireSession: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      username: '',
      accessToken: '',
      refreshToken: '',
      login: (username, accessToken, refreshToken) =>
        set({ isLoggedIn: true, username, accessToken, refreshToken }),
      logout: () => set({ isLoggedIn: false, username: '', accessToken: '', refreshToken: '' }),
      expireSession: () => set({ isLoggedIn: false }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
    }),
    { name: 'oms-auth' }
  )
)
