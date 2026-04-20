import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { setStatusMessage } from '@/store/statusStore'

const api = axios.create({
  baseURL: '/oms',
})

// 요청마다 Authorization 헤더 자동 추가
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const res = await axios.post('/oms/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = res.data
        useAuthStore.getState().setTokens(accessToken, newRefreshToken ?? refreshToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().expireSession()
        setStatusMessage('세션이 만료되었습니다. 다시 로그인해 주세요.', 'error')
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
