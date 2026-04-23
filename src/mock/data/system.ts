import type { RoleResponse, PermissionResponse } from '@/types'

export const mockRoles: RoleResponse[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '拥有系统所有权限，可进行任何操作',
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-03-01 10:00:00'
  },
  {
    id: 2,
    name: '企业管理员',
    code: 'ENTERPRISE_ADMIN',
    description: '管理企业内的用户和资源配置',
    createTime: '2024-01-05 09:00:00',
    updateTime: '2024-03-05 14:30:00'
  },
  {
    id: 3,
    name: '普通用户',
    code: 'USER',
    description: '具备基本的查看和操作权限',
    createTime: '2024-01-10 10:00:00',
    updateTime: '2024-03-10 11:00:00'
  },
  {
    id: 4,
    name: '审计员',
    code: 'AUDITOR',
    description: '可查看系统日志和操作记录，用于审计',
    createTime: '2024-01-15 08:30:00',
    updateTime: '2024-03-15 16:00:00'
  },
  {
    id: 5,
    name: '只读用户',
    code: 'READONLY',
    description: '仅具备查看权限，无法进行任何修改操作',
    createTime: '2024-01-20 11:00:00',
    updateTime: '2024-03-20 09:30:00'
  }
]

export const mockPermissions: PermissionResponse[] = [
  // 用户管理
  {
    id: 101,
    name: '用户管理',
    code: 'user',
    type: 'MENU',
    path: '/user',
    parentId: 0,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10101,
    name: '用户列表',
    code: 'user:list',
    type: 'BUTTON',
    path: '',
    parentId: 101,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10102,
    name: '新增用户',
    code: 'user:add',
    type: 'BUTTON',
    path: '',
    parentId: 101,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10103,
    name: '编辑用户',
    code: 'user:edit',
    type: 'BUTTON',
    path: '',
    parentId: 101,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10104,
    name: '删除用户',
    code: 'user:delete',
    type: 'BUTTON',
    path: '',
    parentId: 101,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },

  // 企业管理
  {
    id: 102,
    name: '企业管理',
    code: 'enterprise',
    type: 'MENU',
    path: '/enterprise',
    parentId: 0,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10201,
    name: '企业列表',
    code: 'enterprise:list',
    type: 'BUTTON',
    path: '',
    parentId: 102,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10202,
    name: '新增企业',
    code: 'enterprise:add',
    type: 'BUTTON',
    path: '',
    parentId: 102,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10203,
    name: '编辑企业',
    code: 'enterprise:edit',
    type: 'BUTTON',
    path: '',
    parentId: 102,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10204,
    name: '删除企业',
    code: 'enterprise:delete',
    type: 'BUTTON',
    path: '',
    parentId: 102,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },

  // 角色管理
  {
    id: 103,
    name: '角色管理',
    code: 'role',
    type: 'MENU',
    path: '/role',
    parentId: 0,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10301,
    name: '角色列表',
    code: 'role:list',
    type: 'BUTTON',
    path: '',
    parentId: 103,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10302,
    name: '新增角色',
    code: 'role:add',
    type: 'BUTTON',
    path: '',
    parentId: 103,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10303,
    name: '编辑角色',
    code: 'role:edit',
    type: 'BUTTON',
    path: '',
    parentId: 103,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10304,
    name: '删除角色',
    code: 'role:delete',
    type: 'BUTTON',
    path: '',
    parentId: 103,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },

  // 权限管理
  {
    id: 104,
    name: '权限管理',
    code: 'permission',
    type: 'MENU',
    path: '/permission',
    parentId: 0,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10401,
    name: '权限列表',
    code: 'permission:list',
    type: 'BUTTON',
    path: '',
    parentId: 104,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10402,
    name: '新增权限',
    code: 'permission:add',
    type: 'BUTTON',
    path: '',
    parentId: 104,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10403,
    name: '编辑权限',
    code: 'permission:edit',
    type: 'BUTTON',
    path: '',
    parentId: 104,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10404,
    name: '删除权限',
    code: 'permission:delete',
    type: 'BUTTON',
    path: '',
    parentId: 104,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },

  // 日志管理
  {
    id: 105,
    name: '日志管理',
    code: 'log',
    type: 'MENU',
    path: '/log',
    parentId: 0,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: 10501,
    name: '日志列表',
    code: 'log:list',
    type: 'BUTTON',
    path: '',
    parentId: 105,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  }
]
