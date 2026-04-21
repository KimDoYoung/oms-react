import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { Monitor, ShieldAlert, KeyRound, Globe, Loader2, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Validation Schema
const loginSchema = z.object({
  companyCode: z.string().min(1, '회사코드를 입력해 주세요.'),
  userId: z.string().min(1, '아이디를 입력해 주세요.'),
  userPw: z.string().min(1, '비밀번호를 입력해 주세요.'),
  autoLogin: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage({ isModal = false }: { isModal?: boolean }) {
  const queryClient = useQueryClient()
  const { login, username } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 테넌트 정보 분석 (asis 로직 이식)
  const [tenant, setTenant] = useState<{ code: string; isAdminMode: boolean }>({
    code: 'admin',
    isAdminMode: true
  })

  useEffect(() => {
    const host = window.location.hostname
    const parts = host.split('.')
    const adminCodes = ['admin', 'admindev', 'admindr', 'localhost', '127.0.0.1']
    
    let detectedCode = 'admin'
    if (parts.length > 1 && !/^\d/.test(parts[0])) { // IP 주소가 아닌 경우에만 서브도메인 추출
      detectedCode = parts[0].toLowerCase()
    }

    const isAdmin = adminCodes.includes(detectedCode)
    setTenant({
      code: isAdmin ? 'admin' : detectedCode,
      isAdminMode: isAdmin
    })
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    values: {
      companyCode: tenant.code,
      userId: username || '',
      userPw: '',
      autoLogin: false,
    }
  })

  const onSubmit = async (values: LoginFormValues) => {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { 
        companyCode: values.companyCode,
        userId: values.userId, 
        userPw: values.userPw 
      })
      
      const { accessToken, refreshToken, userNm, companyId, userId: userLongId } = res.data
      
      if (accessToken) {
        await queryClient.invalidateQueries()
        login(userNm || values.userId, accessToken, refreshToken, companyId, userLongId)
      } else {
        setError('로그인 실패')
      }
    } catch (err: unknown) {
      let msg = '아이디 또는 비밀번호가 올바르지 않습니다.'
      const axiosError = err as { response?: { data?: { detail?: string } } }
      if (axiosError.response?.data?.detail) {
        msg = axiosError.response.data.detail
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const card = (
    <div className={`relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
      isModal ? 'bg-white' : 'bg-white/90 backdrop-blur-md border border-white/20'
    }`}>
      {/* Header - asis 느낌의 다크 그린 그라디언트 */}
      <div className="bg-gradient-to-r from-[#344E41] via-[#3A5A40] to-[#588157] p-8 pb-10 text-white">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">OMS 로그인</h1>
        <p className="text-xs text-white/70 font-medium uppercase tracking-tighter">Order Management System</p>
      </div>

      <div className="px-7 py-8 -mt-6 bg-white rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {error && (
          <div className="mb-5 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* 접속 서버 필드: admin 도메인이 아닐 경우 읽기 전용 및 강조 처리 */}
          <div className="group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">접속 정보</label>
            <div className="relative">
              <Globe className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${tenant.isAdminMode ? 'text-gray-400 group-focus-within:text-[#588157]' : 'text-[#588157]'}`} size={16} />
              <input 
                {...register('companyCode')}
                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none transition-all ${
                  tenant.isAdminMode 
                  ? 'bg-gray-50/80 border-gray-200 focus:ring-2 focus:ring-[#588157]/30 focus:border-[#588157]' 
                  : 'bg-green-50 border-[#588157]/30 text-[#3A5A40] cursor-default'
                }`}
                placeholder="회사코드"
                readOnly={!tenant.isAdminMode}
                disabled={loading}
              />
              {!tenant.isAdminMode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#588157] text-white text-[9px] rounded-full font-bold">
                  AUTODETECTED
                </div>
              )}
            </div>
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">사용자 ID</label>
            <div className="relative">
              <Monitor className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#588157] transition-colors" size={16} />
              <input
                {...register('userId')}
                className={`w-full bg-gray-50/80 border ${errors.userId ? 'border-rose-300' : 'border-gray-200'} rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#588157]/30 focus:border-[#588157] transition-all`}
                placeholder="아이디(사원번호)"
                disabled={loading}
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">비밀번호</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#588157] transition-colors" size={16} />
              <input
                {...register('userPw')}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-gray-50/80 border ${errors.userPw ? 'border-rose-300' : 'border-gray-200'} rounded-xl pl-10 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#588157]/30 focus:border-[#588157] transition-all`}
                placeholder="비밀번호"
                disabled={loading}
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
            className={`mt-4 w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#3A5A40] to-[#588157] text-white hover:shadow-[#588157]/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? '로그인 처리 중...' : '로그인'}
          </button>

          <div className="flex items-center justify-between mt-1 px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                {...register('autoLogin')}
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-[#588157] focus:ring-[#588157]/30"
              />
              <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 transition-colors">자동 로그인</span>
            </label>
            <button type="button" className="text-[11px] font-bold text-blue-500 hover:text-blue-700 underline underline-offset-2">비밀번호 찾기</button>
          </div>
        </form>

        {/* 안내 문구 */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex gap-3 items-start group">
            <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Building2 size={14} />
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
              접속 경로: <span className="font-bold text-blue-700">{window.location.origin}</span>
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase">
            ver. 1.0.0 &copy; 2026 한국펀드서비스(주) OMS
          </p>
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
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#344E41] opacity-30" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#588157] blur-[120px] rounded-full opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3A5A40] blur-[120px] rounded-full opacity-20" />
      </div>
      {card}
    </div>
  )
}
