import { useState, useRef, type KeyboardEvent } from 'react'
import { LogOut, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useLayoutStore } from '@/store/layoutStore'
import { fetchMenuTree } from '@/services/menuService'
import api from '@/services/api'

export default function TopBar() {
  const { username, logout } = useAuthStore()
  const { openByScreenNo } = useLayoutStore()

  const [screenInput, setScreenInput] = useState('')
  const [inputError, setInputError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: menus = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenuTree,
    staleTime: 1000 * 60 * 10,
  })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get('/auth/health').then((r) => r.data) as Promise<{ version: string }>,
    staleTime: Infinity,
  })

  const handleScreenEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const val = screenInput.trim()
    if (!val) return

    const ok = openByScreenNo(val, menus)
    if (ok) {
      setScreenInput('')
      setInputError(false)
    } else {
      setInputError(true)
      setTimeout(() => setInputError(false), 1000)
    }
  }

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } finally { logout() }
  }

  return (
    <header className="h-12 bg-blue-900 border-b border-blue-800 flex items-center px-3 shrink-0 z-10 gap-2">

      {/* 1) Logo Area */}
      <div className="flex items-center gap-1.5 shrink-0 mr-2">
        <span className="text-xl font-bold text-white tracking-tight">OMS</span>
        <span className="text-xs text-blue-300 font-normal">주문관리시스템</span>
        {health?.version && (
          <span className="text-[10px] text-blue-400 font-mono">v{health.version}</span>
        )}
      </div>

      <span className="h-5 w-px bg-blue-700 shrink-0" />

      {/* 2) Screen Number Input */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={screenInput}
          onChange={(e) => setScreenInput(e.target.value)}
          onKeyDown={handleScreenEnter}
          placeholder="화면번호"
          maxLength={6}
          className={`w-22 border rounded-lg px-2 py-1 text-sm font-mono text-center focus:outline-none transition-colors
            ${inputError
              ? 'border-red-400 bg-red-50 text-red-600 focus:ring-1 focus:ring-red-300'
              : 'border-blue-700 bg-blue-800 text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-400'
            }`}
        />
      </div>

      <span className="h-5 w-px bg-blue-700 shrink-0" />

      {/* 3) Spacer */}
      <div className="flex-1" />

      <span className="h-5 w-px bg-blue-700 shrink-0" />

      {/* 4) User Area */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-blue-200">{username}</span>
        <button
          title="설정"
          className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-700 transition-colors"
        >
          <Settings size={15} />
        </button>
        <button
          onClick={handleLogout}
          title="로그아웃"
          className="p-1.5 rounded-lg text-blue-400 hover:text-red-300 hover:bg-blue-700 transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>

    </header>
  )
}
