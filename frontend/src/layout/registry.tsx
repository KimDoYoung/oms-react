import React from 'react'
import PlaceholderPage from '@/pages/PlaceholderPage'

// screen_no → React 컴포넌트 매핑
// 향후 실제 페이지 구현 시 PlaceholderPage를 교체
const registry: Record<string, React.ComponentType<{ screenNo?: string; title?: string }>> = {
  // 홈
  'HOME': PlaceholderPage,
  // [1000 주문]
  '1001': PlaceholderPage,
  '1002': PlaceholderPage,
  '1003': PlaceholderPage,
  // [2000 체결]
  '2001': PlaceholderPage,
  '2002': PlaceholderPage,
  // [3000 잔고]
  '3001': PlaceholderPage,
  '3002': PlaceholderPage,
  // [9000 시스템]
  '9001': PlaceholderPage,
  '9002': PlaceholderPage,
}

export default registry
