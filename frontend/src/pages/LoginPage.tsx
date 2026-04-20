import React, { useState, FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { Info, Monitor, ShieldAlert, KeyRound, Globe } from 'lucide-react'

export default function LoginPage({ isModal = false }: { isModal?: boolean }) {
  const queryClient = useQueryClient()
  const { login, username } = useAuthStore()
  
  const [userId, setUserId] = useState(username || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // GWT-like subDomain state (default to admin)
  const [subDomain, setSubDomain] = useState('admin')
  const [autoLogin, setAutoLogin] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // In the legacy code, they used subDomain (locationName) + loginId + passWord
      const res = await api.post('/auth/login', { userId, userPw: password })
      const { accessToken, refreshToken, userNm } = res.data
      if (accessToken) {
        await queryClient.invalidateQueries()
        login(userNm || userId, accessToken, refreshToken)
      } else {
        setError('로그인 실패')
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? '아이디 또는 비밀번호가 올바르지 않습니다.'
      setError(msg)
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  const card = (
    <div className={`relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
      isModal ? 'bg-white' : 'bg-white/90 backdrop-blur-md border border-white/20'
    }`}>
      {/* GWT-like Header Style */}
      <div className="bg-gradient-to-r from-[#344E41] via-[#3A5A40] to-[#588157] p-8 pb-10 text-white">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">OMS 로그인</h1>
        <p className="text-xs text-white/70 font-medium">Order Management System</p>
      </div>

      <div className="px-7 py-8 -mt-6 bg-white rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {error && (
          <div className="mb-5 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* SubDomain / Company lookup (Simplified GWT lookup) */}
          <div className="group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">접속 서버</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#588157] transition-colors" size={16} />
              <select 
                value={subDomain}
                onChange={(e) => setSubDomain(e.target.value)}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#588157]/30 focus:border-[#588157] transition-all cursor-pointer appearance-none"
              >
                <option value="admin">admin (관리자)</option>
                <option value="dev">개발 (Development)</option>
                <option value="real">운영 (Production)</option>
              </select>
            </div>
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">아이디</label>
            <div className="relative">
              <Monitor className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#588157] transition-colors" size={16} />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#588157]/30 focus:border-[#588157] transition-all"
                placeholder="사원번호를 입력하세요"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">비밀번호</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#588157] transition-colors" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#588157]/30 focus:border-[#588157] transition-all"
                placeholder="비밀번호 입력"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${
              loading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#3A5A40] to-[#588157] text-white hover:shadow-[#588157]/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
            }`}
          >
            {loading ? '로그인 처리 중...' : '로그인'}
          </button>

          {/* Auto Login Checkbox */}
          <div className="flex items-center justify-between mt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={autoLogin} 
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#588157] focus:ring-[#588157]/30"
              />
              <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 transition-colors">로그인 상태 유지</span>
            </label>
            <button type="button" className="text-[11px] font-bold text-blue-500 hover:text-blue-700 underline underline-offset-2">비밀번호 재설정</button>
          </div>
        </form>

        {/* Info Labels from GWT */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex gap-3 items-start group">
            <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Info size={14} />
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              <span className="font-bold text-blue-700">CHROME</span>에 최적화 되어 있습니다.
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="mt-0.5 p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Info size={14} />
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Login ID는 <span className="font-bold text-amber-700">사원번호(예:000)</span>를 사용 바랍니다.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">ver. 1.0.0 &copy; 2025 OMS</p>
        </div>
      </div>
    </div>
  )

  if (isModal) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {card}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-[#0f172a] overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#344E41] opacity-30" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#588157] blur-[120px] rounded-full opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3A5A40] blur-[120px] rounded-full opacity-20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>
      {card}
    </div>
  )
}
