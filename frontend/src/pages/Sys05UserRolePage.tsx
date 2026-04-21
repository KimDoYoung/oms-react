import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sys01 } from '@/services/sys01CompanyService'
import { sys02, type UserDto } from '@/services/sys02UserService'
import { sys04 } from '@/services/sys04RoleService'
import { sys05, type UserRoleDto } from '@/services/sys05UserRoleService'
import { Trash2 } from 'lucide-react'

export default function Sys05UserRolePage() {
  const qc = useQueryClient()
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  const { data: companies = [] } = useQuery({ queryKey: ['sys01-companies'], queryFn: sys01.getAll })
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['sys02-users', companyId],
    queryFn: () => sys02.getByCompany(companyId!),
    enabled: companyId != null,
  })
  const { data: roles = [] } = useQuery({
    queryKey: ['sys04-roles', companyId],
    queryFn: () => sys04.getByCompany(companyId!),
    enabled: companyId != null,
  })
  const { data: userRoles = [], isLoading: urLoading } = useQuery({
    queryKey: ['sys05-user-roles', selectedUser?.userId],
    queryFn: () => sys05.getByUser(selectedUser!.userId!),
    enabled: selectedUser?.userId != null,
  })

  const insertMut = useMutation({
    mutationFn: (dto: UserRoleDto) => sys05.insert(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sys05-user-roles', selectedUser?.userId] }),
  })
  const delMut = useMutation({
    mutationFn: (id: number) => sys05.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sys05-user-roles', selectedUser?.userId] }),
  })

  const assignedRoleIds = new Set(userRoles.map(ur => ur.roleId))

  const handleToggle = (roleId: number) => {
    if (!selectedUser?.userId) return
    const existing = userRoles.find(ur => ur.roleId === roleId)
    if (existing) {
      delMut.mutate(existing.userRoleId!)
    } else {
      insertMut.mutate({ userId: selectedUser.userId, roleId })
    }
  }

  const handleCompanyChange = (id: number) => {
    setCompanyId(id)
    setSelectedUser(null)
  }

  return (
    <div className="flex h-full gap-3 p-3">
      {/* 사용자 목록 */}
      <div className="w-72 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <label className="text-xs font-bold text-gray-500 block mb-1">회사 선택</label>
          <select value={companyId ?? ''} onChange={e => handleCompanyChange(Number(e.target.value))}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-300">
            <option value="">-- 선택 --</option>
            {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="px-3 py-2 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">사용자 목록</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {usersLoading ? (
            <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
          ) : users.map(u => (
            <button key={u.userId} onClick={() => setSelectedUser(u)}
              className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedUser?.userId === u.userId ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}>
              <div className="text-sm font-medium text-gray-800">{u.korNm}</div>
              <div className="text-xs text-gray-400">{u.loginId}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 역할 할당 */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">
            {selectedUser ? `${selectedUser.korNm} — 역할 할당` : '사용자를 선택하세요'}
          </span>
        </div>

        {selectedUser ? (
          urLoading ? (
            <div className="p-4 text-center text-gray-400">로딩 중...</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs text-gray-500 mb-3">체크하면 해당 사용자에게 역할이 부여됩니다.</p>
              {roles.length === 0 ? (
                <div className="text-sm text-gray-400">이 회사에 등록된 역할이 없습니다.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {roles.map(r => (
                    <label key={r.roleId} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={assignedRoleIds.has(r.roleId!)}
                        onChange={() => handleToggle(r.roleId!)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <span className="text-sm text-gray-700">{r.roleName}</span>
                      <span className="text-xs text-gray-400">seq: {r.seq}</span>
                      {r.adminYn === 'Y' && <span className="text-xs text-red-500 font-bold">관리자</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">회사 선택 후 사용자를 선택하세요</div>
        )}
      </div>

      {/* 할당된 역할 목록 */}
      <div className="w-56 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-700">할당된 역할 ({userRoles.length})</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {userRoles.map(ur => {
            const role = roles.find(r => r.roleId === ur.roleId)
            return (
              <div key={ur.userRoleId} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-700">{role?.roleName ?? `roleId:${ur.roleId}`}</span>
                <button onClick={() => delMut.mutate(ur.userRoleId!)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50">
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
