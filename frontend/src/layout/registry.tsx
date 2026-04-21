import React from 'react'
import PlaceholderPage from '@/pages/PlaceholderPage'
import Sys01CompanyPage from '@/pages/Sys01CompanyPage'
import Sys02UserPage from '@/pages/Sys02UserPage'
import Sys03CompanyMenuPage from '@/pages/Sys03CompanyMenuPage'
import Sys04RolePage from '@/pages/Sys04RolePage'
import Sys05UserRolePage from '@/pages/Sys05UserRolePage'
import Sys07RoleMenuPage from '@/pages/Sys07RoleMenuPage'

// screen_no → React 컴포넌트 매핑
const registry: Record<string, React.ComponentType<{ screenNo?: string; title?: string }>> = {
  // 홈 (asis Sys01_Tab_Company 고정탭과 동일)
  'HOME': Sys01CompanyPage,
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
  '9001': Sys01CompanyPage,
  '9002': Sys02UserPage,
  '9003': Sys03CompanyMenuPage,
  '9004': Sys04RolePage,
  '9005': Sys05UserRolePage,
  '9007': Sys07RoleMenuPage,
}

export default registry
