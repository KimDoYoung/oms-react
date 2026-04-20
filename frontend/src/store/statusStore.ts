import { create } from 'zustand'

export type StatusType = 'info' | 'error' | 'success' | 'warning'

interface StatusState {
  message: string
  type: StatusType
  setMessage: (msg: string, type?: StatusType) => void
}

export const useStatusStore = create<StatusState>((set) => ({
  message: '시스템이 정상적으로 실행 중입니다.',
  type: 'info',
  setMessage: (message, type = 'info') => set({ message, type })
}))

export const setStatusMessage = (msg: string, type: StatusType = 'info') => {
  useStatusStore.getState().setMessage(msg, type)
}
