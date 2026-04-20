import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/LoginPage'
import MainLayout from '@/layout/MainLayout'

export default function App() {
  const { isLoggedIn, username } = useAuthStore()

  if (!isLoggedIn && !username) {
    return <LoginPage />
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MainLayout />

      {!isLoggedIn && (
        <div className="absolute inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <LoginPage isModal />
        </div>
      )}
    </div>
  )
}
