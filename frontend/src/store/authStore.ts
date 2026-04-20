import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isLoggedIn: boolean
  username: string
  accessToken: string
  refreshToken: string
  companyId: number | null
  userId: number | null
  login: (username: string, accessToken: string, refreshToken: string, companyId: number, userId: number) => void
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
      companyId: null,
      userId: null,
      login: (username, accessToken, refreshToken, companyId, userId) =>
        set({ isLoggedIn: true, username, accessToken, refreshToken, companyId, userId }),
      logout: () => set({ isLoggedIn: false, username: '', accessToken: '', refreshToken: '', companyId: null, userId: null }),
      expireSession: () => set({ isLoggedIn: false }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
    }),
    { name: 'oms-auth' }
  )
)
