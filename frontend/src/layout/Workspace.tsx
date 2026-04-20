import React, { useEffect, useState, useRef } from 'react'
import { Actions, Layout, TabNode, TabSetNode, BorderNode, I18nLabel } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { useLayoutStore } from '@/store/layoutStore'
import registry from './registry'
import PlaceholderPage from '@/pages/PlaceholderPage'
import { X, ArrowRight, Layers, Trash2, Home } from 'lucide-react'

export default function Workspace() {
  const modelVersion = useLayoutStore((s) => s.modelVersion)
  const getModel = useLayoutStore((s) => s.getModel)
  const onModelChange = useLayoutStore((s) => s.onModelChange)

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  void modelVersion
  const model = getModel()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [contextMenu])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'F4') return
      e.preventDefault()

      const m = getModel()
      let tabsetId: string | null = null
      m.visitNodes((node) => {
        if (node.getType() === 'tabset' && (node as TabSetNode).isActive()) {
          tabsetId = node.getId()
        }
      })
      if (!tabsetId) {
        m.visitNodes((node) => {
          if (!tabsetId && node.getType() === 'tabset') tabsetId = node.getId()
        })
      }

      if (tabsetId) {
        m.doAction(Actions.maximizeToggle(tabsetId))
        useLayoutStore.setState((s) => ({ modelVersion: s.modelVersion + 1 }))
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [getModel])

  const factory = (node: TabNode) => {
    const screenNo = node.getComponent() ?? ''
    const Component = registry[screenNo] ?? PlaceholderPage
    return <Component screenNo={screenNo} title={node.getName()} />
  }

  const onContextMenu = (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement>) => {
    if (!(node instanceof TabNode)) return
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.getId() })
  }

  const handleAction = (type: 'close' | 'close-others' | 'close-right' | 'close-all') => {
    if (!contextMenu) return
    const { nodeId } = contextMenu
    const m = getModel()
    const node = m.getNodeById(nodeId) as TabNode
    if (!node) return

    const parent = node.getParent() as TabSetNode
    const children = parent.getChildren().filter((c): c is TabNode => c instanceof TabNode)

    switch (type) {
      case 'close':
        if (node.isEnableClose()) {
          m.doAction(Actions.deleteTab(node.getId()))
        }
        break
      case 'close-others':
        children.forEach((child) => {
          if (child.getId() !== node.getId() && child.isEnableClose()) {
            m.doAction(Actions.deleteTab(child.getId()))
          }
        })
        break
      case 'close-right': {
        const idx = children.indexOf(node)
        for (let i = idx + 1; i < children.length; i++) {
          if (children[i].isEnableClose()) {
            m.doAction(Actions.deleteTab(children[i].getId()))
          }
        }
        break
      }
      case 'close-all':
        children.forEach((child) => {
          if (child.isEnableClose()) {
            m.doAction(Actions.deleteTab(child.getId()))
          }
        })
        break
    }
    setContextMenu(null)
    useLayoutStore.setState((s) => ({ modelVersion: s.modelVersion + 1 }))
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      <Layout
        model={model}
        factory={factory}
        onModelChange={onModelChange}
        onContextMenu={onContextMenu}
        onRenderTab={(node, renderValues) => {
          if (node.getId() === 'HOME') {
            renderValues.leading = <Home size={11} className="mr-0.5 shrink-0" />
          }
        }}
        onRenderTabSet={(tabSetNode, renderValues) => {
          if (!(tabSetNode instanceof TabSetNode)) return
          renderValues.buttons.push(
            <button
              key="close-active"
              title="현재 탭 닫기"
              onClick={() => {
                const selected = tabSetNode.getSelectedNode()
                if (selected instanceof TabNode && selected.isEnableClose()) {
                  getModel().doAction(Actions.deleteTab(selected.getId()))
                  useLayoutStore.setState((s) => ({ modelVersion: s.modelVersion + 1 }))
                }
              }}
              className="flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={11} />
            </button>
          )
        }}
        i18nMapper={(id) => {
          if (id === I18nLabel.Maximize) return '최대화(F4)'
          if (id === I18nLabel.Restore) return '복원(F4)'
          return undefined
        }}
        realtimeResize
      />

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-[99999] bg-white border border-gray-200 shadow-2xl rounded-lg py-1.5 min-w-[190px] text-[13px] animate-in fade-in zoom-in duration-100 select-none"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => handleAction('close')}
            className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-600 hover:text-rose-600 transition-colors">
            <X size={14} /><span>이 탭 닫기</span>
          </button>
          <div className="h-[1px] bg-gray-100 my-1" />
          <button onClick={() => handleAction('close-others')}
            className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-600 hover:text-blue-600 transition-colors">
            <Layers size={14} /><span>다른 탭 모두 닫기</span>
          </button>
          <button onClick={() => handleAction('close-right')}
            className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowRight size={14} /><span>오른쪽 탭 모두 닫기</span>
          </button>
          <button onClick={() => handleAction('close-all')}
            className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-600 hover:text-rose-600 transition-colors">
            <Trash2 size={14} /><span>전체 탭 닫기</span>
          </button>
        </div>
      )}
    </div>
  )
}
