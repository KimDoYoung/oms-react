import { useEffect, useState } from 'react'
import { useStatusStore, type StatusType } from '@/store/statusStore'

function getStatusStyles(type: StatusType) {
  switch (type) {
    case 'error': return { icon: '❌', text: 'text-red-700', bg: 'bg-red-50' }
    case 'warning': return { icon: '⚠️', text: 'text-orange-700', bg: 'bg-orange-50' }
    case 'success': return { icon: '✅', text: 'text-green-700', bg: 'bg-green-50' }
    default: return { icon: '📢', text: 'text-rose-900', bg: 'bg-white/40' }
  }
}

export default function StatusBar() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('ko-KR'))
  const { message, type } = useStatusStore()
  const styles = getStatusStyles(type)

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('ko-KR'))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="h-10 bg-rose-100 text-rose-900 flex items-center px-4 text-sm shrink-0 border-t border-rose-200 select-none">
      <div className="flex-1 flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full shrink-0 shadow-sm border border-rose-200/50">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-rose-950 text-xs">시스템 정상</span>
        </div>
      </div>

      <div className="flex-[2] text-center px-6">
        <div className={`inline-flex items-center px-4 py-1 rounded-xl border border-rose-200/40 transition-colors duration-300 ${styles.bg}`}>
          <span className={`font-bold text-xs tracking-tight ${styles.text}`}>
            {styles.icon} <span className="ml-1">{message}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 text-right font-mono flex items-center justify-end gap-4">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Build Version</span>
          <span className="text-rose-900 font-bold text-xs">v0.0.1</span>
        </div>
        <div className="flex flex-col items-end leading-tight min-w-[110px]">
          <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest text-right w-full mb-0.5">Server Time</span>
          <span className="text-lg text-rose-950 font-black tabular-nums tracking-tighter">{time}</span>
        </div>
      </div>
    </footer>
  )
}
