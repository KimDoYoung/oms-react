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
  'folder': LayoutDashboard,
  'users': Settings,
  'file-text': Settings,
  'credit-card': ShoppingCart,
  'calendar': Settings,
  'database': Settings,
  'briefcase': Settings,
  'clipboard': Settings,
}

function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Menu
  return ICON_MAP[iconName] ?? Menu
}

function LeafItem({ menu, onSelect, inset = false }: { menu: MenuItem; onSelect: () => void; inset?: boolean }) {
  const openTab = useLayoutStore((s) => s.openTab)

  const handleClick = () => {
    openTab(menu)
    onSelect()
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left py-1.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-md transition-colors truncate
        ${inset ? 'pl-8 pr-4' : 'px-4'}`}
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
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-md transition-all
          ${open 
            ? 'text-green-800 bg-green-50/50' 
            : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <span className="truncate">{menu.title}</span>
        <div className="shrink-0 ml-2">
          {open ? <ChevronDown size={14} className="text-green-600" /> : <ChevronRight size={14} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {menu.children.map((child) => (
            child.children && child.children.length > 0 ? (
              <SubGroupItem key={child.id} menu={child} onSelect={onSelect} />
            ) : (
              <LeafItem key={child.id} menu={child} onSelect={onSelect} inset />
            )
          ))}
        </div>
      )}
    </div>
  )
}

function SubGroupItem({ menu, onSelect }: { menu: MenuItem; onSelect: () => void }) {
  const [open, setOpen] = useState(true)
  
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="truncate">{menu.title}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {menu.children.map((child) => (
            <LeafItem key={child.id} menu={child} onSelect={onSelect} inset />
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

  const groups = menu.children.filter((c) => c.children && c.children.length > 0)
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
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-xl animate-in slide-in-from-left-2 duration-200">
      <div className="h-12 flex items-center justify-between px-4 bg-gray-50/80 border-b border-gray-200 shrink-0 backdrop-blur-sm">
        <span className="text-sm font-bold text-gray-800 truncate">{menu.title}</span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={expandAll} title="모두 펼치기"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
            <ChevronsDown size={14} />
          </button>
          <button onClick={collapseAll} title="모두 접기"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
            <ChevronsUp size={14} />
          </button>
          <div className="w-px h-3 bg-gray-300 mx-0.5" />
          <button onClick={onTogglePin} title={pinned ? '고정 해제' : '사이드바 고정'}
            className={`p-1.5 rounded-md transition-colors ${pinned
              ? 'text-blue-600 bg-blue-50 hover:text-blue-800'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}>
            {pinned ? <Pin size={14} /> : <PinOff size={14} />}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
        {menu.children.map((child) =>
          child.children && child.children.length > 0 ? (
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
      <div className="w-12 flex flex-col items-center py-2 gap-1"
        style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)' }}>
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
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <Icon size={18} />
              {pinned && isActive && (
                <span className="w-1 h-1 rounded-full bg-green-300 mt-0.5" />
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
