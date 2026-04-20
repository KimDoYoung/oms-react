import React, { useState, useCallback, useEffect, useMemo, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeShuffledPad(): (number | null)[] {
  const nums = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  return [...nums.slice(0, 9), -1, nums[9], -2]
}

function getBgImageUrl(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `https://picsum.photos/seed/${today}/1920/1080`
}

export default function LoginPage({ isModal = false }: { isModal?: boolean }) {
  const queryClient = useQueryClient()
  const { login, username } = useAuthStore()
  const [userId, setUserId] = useState(username || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [padKeys, setPadKeys] = useState<(number | null)[]>(makeShuffledPad)
  const [bgLoaded, setBgLoaded] = useState(false)
  const bgUrl = useMemo(() => getBgImageUrl(), [])

  useEffect(() => {
    if (isModal) return
    const img = new Image()
    img.onload = () => setBgLoaded(true)
    img.src = bgUrl
  }, [bgUrl, isModal])

  const reshufflePad = useCallback(() => {
    setPadKeys(makeShuffledPad())
  }, [])

  const handlePadInput = (key: number | null) => {
    if (key === null) return
    if (key === -1) {
      setPassword((p) => p.slice(0, -1))
    } else if (key === -2) {
      setPassword('')
      setError('')
      reshufflePad()
    } else {
      if (password.length < 4) {
        setPassword((p) => p + key.toString())
        setError('')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { userId, userPw: password })
      const { accessToken, refreshToken, userNm } = res.data
      if (accessToken) {
        await queryClient.invalidateQueries()
        login(userNm || userId, accessToken, refreshToken)
      } else {
        setError('로그인 실패')
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      const msg = e.response?.data?.detail ?? '서버에 연결할 수 없습니다.'
      setError(msg)
      setPassword('')
      reshufflePad()
    } finally {
      setLoading(false)
    }
  }

  const passwordDisplay = password.padEnd(4, '○').split('').map((c) =>
    c === '○' ? '○' : (showPassword ? c : '●')
  ).join(' ')

  const card = (
    <div className={isModal
      ? 'bg-white rounded-xl shadow-2xl p-5 w-full max-w-md border border-gray-100'
      : 'relative z-10 bg-white/95 rounded-xl shadow-2xl p-5 w-full max-w-md'
    }>
      {/* Logo */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-blue-700 tracking-tight">OMS</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isModal ? '세션 만료 - 다시 로그인' : '주문관리시스템'}
        </p>
      </div>

      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">아이디</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="아이디를 입력하세요"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">비밀번호 (4자리)</label>
          <div className="flex gap-2">
            <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-center text-xl font-mono tracking-widest bg-gray-50 select-none">
              {passwordDisplay}
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="px-3 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          {padKeys.map((key, idx) => {
            const baseStyle: React.CSSProperties = {
              height: '52px',
              fontSize: '1.1rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none',
            }
            if (key === -1) {
              return (
                <button key={idx} type="button"
                  onClick={() => handlePadInput(-1)}
                  disabled={loading || password.length === 0}
                  style={{ ...baseStyle, backgroundColor: '#ffd699', color: '#6b5200' }}
                  className="disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0"
                >⌫</button>
              )
            }
            if (key === -2) {
              return (
                <button key={idx} type="button"
                  onClick={() => handlePadInput(-2)}
                  disabled={loading || password.length === 0}
                  style={{ ...baseStyle, backgroundColor: '#ffb3ba', color: '#6b1a1f' }}
                  className="disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0"
                >✕</button>
              )
            }
            return (
              <button key={idx} type="button"
                onClick={() => handlePadInput(key)}
                disabled={loading || password.length >= 4}
                style={{ ...baseStyle, backgroundColor: '#bfdbfe', color: '#1e3a5f' }}
                className="disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px active:translate-y-0"
              >{key}</button>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={loading || password.length !== 4}
          className={`mt-1 font-semibold rounded-lg py-3 text-sm transition-all text-white
            ${password.length === 4 && !loading
              ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'
              : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-300 mt-4">© 2025 KimDoYoung</p>
    </div>
  )

  if (isModal) return card

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 pb-24 relative"
      style={{
        backgroundImage: bgLoaded ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
        transition: 'background-image 0.7s ease',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      {card}
    </div>
  )
}
