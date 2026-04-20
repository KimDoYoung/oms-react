import TopBar from '@/layout/TopBar'
import Workspace from '@/layout/Workspace'
import Sidebar from '@/layout/Sidebar'
import StatusBar from '@/layout/StatusBar'
import { fetchMenuTree } from '@/services/menuService'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

export default function MainLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenuTree,
    staleTime: 1000 * 60 * 10,
    enabled: isLoggedIn,
  })

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Workspace />
      </div>
      <StatusBar />
    </div>
  )
}
