import { create } from 'zustand'
import { Actions, DockLocation, Model, TabSetNode } from 'flexlayout-react'
import type { MenuItem } from '@/services/menuService'

const STORAGE_KEY = 'oms-layout'
const SAVED_LAYOUT_KEY = 'oms-saved-layout'

const HOME_TAB = { type: 'tab', id: 'HOME', name: '홈', component: 'HOME' }

const DEFAULT_LAYOUT = {
  global: {
    tabSetMinWidth: 100,
    tabSetMinHeight: 50,
    tabSetEnableMaximize: true,
    tabSetTabStripHeight: 32,
    tabSetHeaderHeight: 0,
    splitterSize: 4,
  },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    id: 'root',
    children: [
      {
        type: 'tabset',
        id: 'main-tabset',
        weight: 100,
        children: [HOME_TAB],
      },
    ],
  },
}

function createModel(): Model {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return Model.fromJson(JSON.parse(saved))
  } catch {
    // 손상된 경우 기본값 사용
  }
  return Model.fromJson(DEFAULT_LAYOUT)
}

let _model: Model = createModel()

function findMenuByScreenNo(screenNo: string, menus: MenuItem[]): MenuItem | null {
  for (const m of menus) {
    if (m.screen_no === screenNo) return m
    const found = findMenuByScreenNo(screenNo, m.children)
    if (found) return found
  }
  return null
}

function getActiveTabsetId(): string {
  let tabsetId = 'main-tabset'
  let foundActive = false
  _model.visitNodes((node) => {
    if (node.getType() === 'tabset') {
      if (!foundActive) tabsetId = node.getId()
      if ((node as TabSetNode).isActive()) {
        tabsetId = node.getId()
        foundActive = true
      }
    }
  })
  return tabsetId
}

interface LayoutState {
  modelVersion: number
  isClosed: boolean
  getModel: () => Model
  openTab: (menu: MenuItem) => void
  openByScreenNo: (screenNo: string, menus: MenuItem[]) => boolean
  closeAllTabs: () => void
  saveScreens: () => void
  restoreScreens: (menus: MenuItem[]) => void
  loadPreset: (layoutJson: string) => void
  onModelChange: (model: Model) => void
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  modelVersion: 0,
  isClosed: !!localStorage.getItem(SAVED_LAYOUT_KEY) && !localStorage.getItem(STORAGE_KEY),

  getModel: () => _model,

  openTab: (menu: MenuItem) => {
    if (!menu.screen_no) return
    const existing = _model.getNodeById(menu.screen_no)
    if (existing) {
      _model.doAction(Actions.selectTab(existing.getId()))
    } else {
      _model.doAction(
        Actions.addNode(
          { type: 'tab', id: menu.screen_no, name: menu.title, component: menu.screen_no },
          getActiveTabsetId(),
          DockLocation.CENTER,
          -1
        )
      )
    }
    set((s) => ({ modelVersion: s.modelVersion + 1, isClosed: false }))
  },

  openByScreenNo: (screenNo: string, menus: MenuItem[]) => {
    if (screenNo === 'HOME') {
      const existing = _model.getNodeById('HOME')
      if (existing) {
        _model.doAction(Actions.selectTab(existing.getId()))
      } else {
        _model.doAction(
          Actions.addNode(HOME_TAB, getActiveTabsetId(), DockLocation.CENTER, -1)
        )
      }
      set((s) => ({ modelVersion: s.modelVersion + 1, isClosed: false }))
      return true
    }
    const menu = findMenuByScreenNo(screenNo, menus)
    if (!menu) return false
    get().openTab(menu)
    return true
  },

  closeAllTabs: () => {
    _model = Model.fromJson(DEFAULT_LAYOUT)
    localStorage.removeItem(STORAGE_KEY)
    set((s) => ({ modelVersion: s.modelVersion + 1, isClosed: true }))
  },

  saveScreens: () => {
    try {
      localStorage.setItem(SAVED_LAYOUT_KEY, JSON.stringify(_model.toJson()))
    } catch {
      // 무시
    }
  },

  restoreScreens: (_menus: MenuItem[]) => {
    try {
      const raw = localStorage.getItem(SAVED_LAYOUT_KEY)
      if (!raw) return
      _model = Model.fromJson(JSON.parse(raw))
      localStorage.setItem(STORAGE_KEY, raw)
      set((s) => ({ modelVersion: s.modelVersion + 1, isClosed: false }))
    } catch {
      // 무시
    }
  },

  loadPreset: (layoutJson: string) => {
    try {
      _model = Model.fromJson(JSON.parse(layoutJson))
      localStorage.setItem(STORAGE_KEY, layoutJson)
      set((s) => ({ modelVersion: s.modelVersion + 1, isClosed: false }))
    } catch {
      // 무시
    }
  },

  onModelChange: (model: Model) => {
    _model = model
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(model.toJson()))
    } catch {
      // 무시
    }
  },
}))
