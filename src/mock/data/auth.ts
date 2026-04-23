import type { LoginResponse, CurrentUserInfo, IdentityItem } from '@/types'

export const mockRsaPublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1QQRl7QW9mTDBc2F8lX1gHkVc3vI8a2mXrZJqVxQWvXyH2dK4wLtPZzL7n1JxXh8tN3vI2mXrZJqVxQWvXyH2dK4wLtPZzL7n1JxXh8tN3vI2mXrZJqVxQWvXyH2dK4wLtPZzL7n1JxXh8tN3vI2mXrZJqVxQWvXyH2dK4wIDAQAB'

export const mockLoginResponse: LoginResponse = {
  token: 'mock-demo-token-2024',
  tokenName: 'X-Access-Token',
  userType: 'P',
  needSelectIdentity: false,
  phone: '13800138000',
  enterpriseId: 1,
  enterpriseCode: 'DEMO001',
  enterpriseName: '演示企业科技有限公司',
  isFirstLogin: 0,
  cUserInfo: {
    id: 1,
    phone: '13800138000',
    email: 'zhangsan@example.com',
    username: 'zhangsan',
    nickname: '张三',
    avatar: '',
    gender: 1,
    status: 1
  },
  bUserInfo: {
    id: 101,
    enterpriseId: 1,
    username: 'zhangsan',
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    status: 1,
    isFirstLogin: 0,
    enterpriseName: '演示企业科技有限公司',
    enterpriseCode: 'DEMO001'
  },
  identityList: [
    {
      identityType: 'C',
      label: '个人用户',
      enterpriseId: 0,
      enterpriseCode: '',
      userId: 1
    },
    {
      identityType: 'B',
      label: '演示企业科技有限公司',
      enterpriseId: 1,
      enterpriseCode: 'DEMO001',
      userId: 101
    }
  ],
  identityDefault: 'C'
}

export const mockCurrentUserInfo: CurrentUserInfo = {
  userType: 'P',
  enterpriseId: 1,
  roles: ['SUPER_ADMIN'],
  permissions: [
    'user:list',
    'user:add',
    'user:edit',
    'user:delete',
    'enterprise:list',
    'enterprise:add',
    'enterprise:edit',
    'enterprise:delete',
    'role:list',
    'role:add',
    'role:edit',
    'role:delete',
    'permission:list',
    'permission:add',
    'permission:edit',
    'permission:delete',
    'log:list'
  ],
  cUserInfo: {
    id: 1,
    phone: '13800138000',
    email: 'zhangsan@example.com',
    username: 'zhangsan',
    nickname: '张三',
    avatar: '',
    gender: 1,
    status: 1
  },
  bUserInfo: {
    id: 101,
    enterpriseId: 1,
    username: 'zhangsan',
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    status: 1,
    isFirstLogin: 0,
    enterpriseName: '演示企业科技有限公司',
    enterpriseCode: 'DEMO001'
  }
}

export const mockIdentityList: IdentityItem[] = [
  {
    identityType: 'C',
    label: '个人用户',
    enterpriseId: 0,
    enterpriseCode: '',
    userId: 1
  },
  {
    identityType: 'B',
    label: '演示企业科技有限公司',
    enterpriseId: 1,
    enterpriseCode: 'DEMO001',
    userId: 101
  }
]

export function getMockLoginResponse(userType: string): LoginResponse {
  return {
    ...mockLoginResponse,
    userType
  }
}
