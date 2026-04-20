import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart2,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Pin,
  PinOff,
  type LucideIcon,
  Menu,
} from 'lucide-react'
import { fetchMenuTree, type MenuItem } from '@/services/menuService'
import { useLayoutStore } from '@/store/layoutStore'
import { useAuthStore } from '@/store/authStore'

const ICON_MAP: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'shopping-cart': ShoppingCart,
  'bar-chart-2': BarChart2,
  'settings': Settings,
}

function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Menu
  return ICON_MAP[iconName] ?? Menu
}

function LeafItem({ menu, onSelect }: { menu: MenuItem; onSelect: () => void }) {
  const openTab = useLayoutStore((s) => s.openTab)

  const handleClick = () => {
    openTab(menu)
    onSelect()
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors truncate"
    >
      {menu.title}
      {menu.screen_no && (
        <span className="ml-1 text-xs text-gray-400">({menu.screen_no})</span>
      )}
    </button>
  )
}

function GroupItem({
  menu,
  open,
  onToggle,
  onSelect,
}: {
  menu: MenuItem
  open: boolean
  onToggle: () => void
  onSelect: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 uppercase tracking-wide rounded-md hover:bg-gray-100 transition-colors"
      >
        <span>{menu.title}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="ml-1 flex flex-col gap-0.5 mb-1">
          {menu.children.map((child) => (
            <LeafItem key={child.id} menu={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuPanel({
  menu,
  pinned,
  onTogglePin,
  onClose,
}: {
  menu: MenuItem
  pinned: boolean
  onTogglePin: () => void
  onClose: () => void
}) {
  const handleSelect = pinned ? () => {} : onClose

  const groups = menu.children.filter((c) => c.level === 2)
  const groupIds = groups.map((g) => g.id)
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set(groupIds))

  const toggleGroup = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })

  const expandAll = () => setOpenIds(new Set(groupIds))
  const collapseAll = () => setOpenIds(new Set())

  return (
    <div className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="h-10 flex items-center justify-between px-3 bg-gray-50 border-b border-gray-200 shrink-0">
        <span className="text-sm font-bold text-gray-700 truncate">{menu.title}</span>
        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          <button onClick={expandAll} title="모두 펼치기"
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
            <ChevronsDown size={13} />
          </button>
          <button onClick={collapseAll} title="모두 접기"
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
            <ChevronsUp size={13} />
          </button>
          <button onClick={onTogglePin} title={pinned ? '고정 해제' : '사이드바 고정'}
            className={`p-1 rounded transition-colors ${pinned
              ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}>
            {pinned ? <Pin size={13} /> : <PinOff size={13} />}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {menu.children.map((child) =>
          child.level === 2 ? (
            <GroupItem
              key={child.id}
              menu={child}
              open={openIds.has(child.id)}
              onToggle={() => toggleGroup(child.id)}
              onSelect={handleSelect}
            />
          ) : (
            <LeafItem key={child.id} menu={child} onSelect={handleSelect} />
          )
        )}
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [pinned, setPinned] = useState(false)

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { data: menus = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenuTree,
    staleTime: 1000 * 60 * 10,
    enabled: isLoggedIn,
  })

  const activeMenu = menus.find((m) => m.id === activeId) ?? null

  const handleIconClick = (menu: MenuItem) => {
    if (pinned && activeId === menu.id) return
    setActiveId((prev) => (prev === menu.id ? null : menu.id))
  }

  const handleTogglePin = () => {
    setPinned((p) => {
      if (p) setActiveId(null)
      return !p
    })
  }

  const handleClose = () => {
    if (!pinned) setActiveId(null)
  }

  return (
    <div className="flex h-full shrink-0">
      <div className="w-12 flex flex-col items-center py-2 gap-1 bg-blue-900">
        {menus.map((menu) => {
          const Icon = getIcon(menu.icon)
          const isActive = activeId === menu.id
          return (
            <button
              key={menu.id}
              onClick={() => handleIconClick(menu)}
              title={menu.title}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded-lg transition-colors
                ${isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-300 hover:bg-blue-700 hover:text-white'
                }`}
            >
              <Icon size={18} />
              {pinned && isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-300 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {activeMenu && (
        <MenuPanel
          menu={activeMenu}
          pinned={pinned}
          onTogglePin={handleTogglePin}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
