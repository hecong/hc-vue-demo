import type { UserResponse, PageResult } from '@/types'

export const mockUsers: UserResponse[] = [
  {
    id: 1,
    username: 'zhangwei',
    name: '张伟',
    email: 'zhangwei@example.com',
    phone: '13800138001',
    status: 1,
    createTime: '2024-01-15 09:30:00',
    updateTime: '2024-03-20 14:22:00'
  },
  {
    id: 2,
    username: 'lina',
    name: '李娜',
    email: 'lina@example.com',
    phone: '13800138002',
    status: 1,
    createTime: '2024-01-18 10:15:00',
    updateTime: '2024-03-18 16:45:00'
  },
  {
    id: 3,
    username: 'wangqiang',
    name: '王强',
    email: 'wangqiang@example.com',
    phone: '13800138003',
    status: 1,
    createTime: '2024-02-01 08:00:00',
    updateTime: '2024-03-22 09:10:00'
  },
  {
    id: 4,
    username: 'zhaomin',
    name: '赵敏',
    email: 'zhaomin@example.com',
    phone: '13800138004',
    status: 1,
    createTime: '2024-02-05 11:20:00',
    updateTime: '2024-03-15 13:30:00'
  },
  {
    id: 5,
    username: 'liuyang',
    name: '刘洋',
    email: 'liuyang@example.com',
    phone: '13800138005',
    status: 1,
    createTime: '2024-02-10 14:00:00',
    updateTime: '2024-03-25 10:00:00'
  },
  {
    id: 6,
    username: 'chenjing',
    name: '陈静',
    email: 'chenjing@example.com',
    phone: '13800138006',
    status: 1,
    createTime: '2024-02-15 09:45:00',
    updateTime: '2024-03-10 15:20:00'
  },
  {
    id: 7,
    username: 'yangfan',
    name: '杨帆',
    email: 'yangfan@example.com',
    phone: '13800138007',
    status: 1,
    createTime: '2024-02-20 16:30:00',
    updateTime: '2024-03-28 11:45:00'
  },
  {
    id: 8,
    username: 'zhoulei',
    name: '周磊',
    email: 'zhoulei@example.com',
    phone: '13800138008',
    status: 1,
    createTime: '2024-02-25 08:15:00',
    updateTime: '2024-03-12 09:50:00'
  },
  {
    id: 9,
    username: 'wuting',
    name: '吴婷',
    email: 'wuting@example.com',
    phone: '13800138009',
    status: 1,
    createTime: '2024-03-01 10:30:00',
    updateTime: '2024-03-22 14:00:00'
  },
  {
    id: 10,
    username: 'sunpeng',
    name: '孙鹏',
    email: 'sunpeng@example.com',
    phone: '13800138010',
    status: 1,
    createTime: '2024-03-05 13:00:00',
    updateTime: '2024-03-26 16:15:00'
  }
]

export function getMockUserPage(params: { pageNum?: number; pageSize?: number; keyword?: string }): PageResult<UserResponse> {
  const pageNum = params.pageNum ?? 1
  const pageSize = params.pageSize ?? 10
  const keyword = params.keyword?.toLowerCase() ?? ''

  let filtered = mockUsers
  if (keyword) {
    filtered = mockUsers.filter(
      user =>
        user.name.includes(keyword) ||
        user.username.toLowerCase().includes(keyword)
    )
  }

  const total = filtered.length
  const totalPage = Math.ceil(total / pageSize) || 1
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  const list = filtered.slice(start, end)
  const hasNext = end < total

  return {
    list,
    total,
    pageNum,
    pageSize,
    totalPage,
    hasNext
  }
}
