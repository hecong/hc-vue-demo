import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ResponseData, CheckEnterpriseResponse } from '@/types'
import {
  mockRsaPublicKey,
  mockCurrentUserInfo,
  mockIdentityList,
  getMockLoginResponse,
} from './data/auth'
import { mockUsers, getMockUserPage } from './data/user'
import { mockEnterprise, mockEnterpriseUsers, getMockEnterpriseUserPage } from './data/enterprise'
import { mockRoles, mockPermissions } from './data/system'
import { mockCUserProfile, mockThirdPartyList, getMockLoginRecordPage } from './data/cuser'
import { getMockLoginLogPage } from './data/log'

export function isMockMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true'
}

function success<T>(data: T, url: string, message = 'success'): ResponseData<T> {
  return { code: 200, message, data, timestamp: new Date().toISOString(), path: url }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type MockHandler = (config: AxiosRequestConfig, url: string) => ResponseData<unknown>

interface MockRoute {
  test: (url: string, method: string) => boolean
  handler: MockHandler
}

function route(
  method: string,
  urlTest: string | RegExp | ((url: string) => boolean),
  handler: MockHandler
): MockRoute {
  const test =
    typeof urlTest === 'function'
      ? (url: string, m: string) => m === method && urlTest(url)
      : (url: string, m: string) =>
          m === method &&
          (typeof urlTest === 'string'
            ? url.includes(urlTest)
            : urlTest.test(url))
  return { test, handler }
}

// ========== 认证模块 ==========
const authRoutes: MockRoute[] = [
  route('get', '/auth/rsa-public-key', (_, url) => success(mockRsaPublicKey, url)),
  route('post', '/auth/c/password-login', (_, url) => success(getMockLoginResponse('C'), url)),
  route('post', '/auth/c/code-login', (_, url) => success(getMockLoginResponse('C'), url)),
  route('post', '/auth/b/password-login', (_, url) => success(getMockLoginResponse('B'), url)),
  route('post', '/auth/b/code-login', (_, url) => success(getMockLoginResponse('B'), url)),
  route('post', '/auth/b/check-enterprise', (_, url) => {
    const checkRes: CheckEnterpriseResponse = {
      enterpriseId: mockEnterprise.id,
      enterpriseCode: mockEnterprise.enterpriseCode,
      enterpriseName: mockEnterprise.name,
      status: mockEnterprise.status,
    }
    return success(checkRes, url)
  }),
  route('post', '/auth/platform/login', (_, url) => success(getMockLoginResponse('P'), url)),
  route('post', '/auth/identity-list', (_, url) => success(mockIdentityList, url)),
  route('post', '/auth/identity-select', (_, url) => success(getMockLoginResponse('P'), url)),
  route('post', '/auth/code/send', (_, url) => success(true, url)),
  route('post', '/auth/logout', (_, url) => success(true, url)),
  route('get', '/auth/info', (_, url) => success(mockCurrentUserInfo, url)),
]

// ========== 用户模块 ==========
const userRoutes: MockRoute[] = [
  route('get', '/user/page', (config, url) => success(getMockUserPage(config.params || {}), url)),
  route('get', '/user/list', (_, url) => success(mockUsers, url)),
  route('get', /\/user\/get\/\d+/, (_, url) => success(mockUsers[0], url)),
  route('post', '/user/add', (_, url) => success(true, url, '操作成功')),
  route('put', /\/user\/edit\/\d+/, (_, url) => success(true, url, '操作成功')),
  route('delete', /\/user\/delete\/\d+/, (_, url) => success(true, url, '操作成功')),
  route('post', '/user/assign-roles', (_, url) => success(true, url, '操作成功')),
  route(
    'get',
    (url) => url.includes('/user/export') && !url.includes('/export-async'),
    (_, url) => success(true, url, '操作成功')
  ),
  route(
    'post',
    (url) => url.includes('/user/export-async') && !url.includes('/status/') && !url.includes('/download/'),
    (_, url) => success('mock-export-task-id-001', url)
  ),
  route('get', /\/user\/export-async\/status\//, (_, url) =>
    success(
      {
        taskId: 'mock-export-task-id-001',
        taskType: 'EXPORT',
        state: 'SUCCESS',
        total: 10,
        processed: 10,
        successCount: 10,
        failCount: 0,
        progress: 100,
        errorMsg: '',
        filePath: '/mock/export/users.xlsx',
        startTime: Date.now() - 5000,
        endTime: Date.now(),
      },
      url
    )
  ),
]

// ========== 企业模块 ==========
const enterpriseRoutes: MockRoute[] = [
  route('get', /\/enterprise\/get\/\d+/, (_, url) => success(mockEnterprise, url)),
  route('post', '/enterprise/add', (_, url) => success(mockEnterprise, url, '操作成功')),
  route('put', /\/enterprise\/edit\/\d+/, (_, url) => success(mockEnterprise, url, '操作成功')),
  route('put', /\/enterprise\/security\/\d+/, (_, url) => success(true, url, '操作成功')),
  route('get', '/enterprise/user/page', (config, url) =>
    success(getMockEnterpriseUserPage(config.params || {}), url)
  ),
  route('post', '/enterprise/user/add', (_, url) => success(mockEnterpriseUsers[0], url, '操作成功')),
  route('put', /\/enterprise\/user\/edit\/\d+/, (_, url) => success(mockEnterpriseUsers[0], url, '操作成功')),
  route('delete', /\/enterprise\/user\/delete\/\d+/, (_, url) => success(true, url, '操作成功')),
  route('put', /\/enterprise\/user\/\d+\/reset-password/, (_, url) => success(true, url, '操作成功')),
  route('post', /\/enterprise\/user\/\d+\/activate/, (_, url) => success(true, url, '操作成功')),
  route('put', /\/enterprise\/user\/\d+\/status/, (_, url) => success(true, url, '操作成功')),
  route('put', '/enterprise/user/force-change-password', (_, url) => success(true, url, '操作成功')),
  route('put', '/enterprise/user/change-password', (_, url) => success(true, url, '操作成功')),
]

// ========== 系统模块（角色与权限） ==========
const systemRoutes: MockRoute[] = [
  route('get', '/sys/role/list', (_, url) => success(mockRoles, url)),
  route('get', /\/sys\/role\/get\/\d+/, (_, url) => success(mockRoles[0], url)),
  route('post', '/sys/role/add', (_, url) => success(mockRoles[0], url, '操作成功')),
  route('put', /\/sys\/role\/edit\/\d+/, (_, url) => success(mockRoles[0], url, '操作成功')),
  route('delete', /\/sys\/role\/delete\/\d+/, (_, url) => success(true, url, '操作成功')),
  route('post', '/sys/role/assign-permissions', (_, url) => success(true, url, '操作成功')),
  route('get', '/permission/list', (_, url) => success(mockPermissions, url)),
  route('get', /\/permission\/get\/\d+/, (_, url) => success(mockPermissions[0], url)),
  route('post', '/permission/add', (_, url) => success(mockPermissions[0], url, '操作成功')),
  route('put', /\/permission\/edit\/\d+/, (_, url) => success(mockPermissions[0], url, '操作成功')),
  route('delete', /\/permission\/delete\/\d+/, (_, url) => success(true, url, '操作成功')),
  route('post', '/permission/init', (_, url) => success(true, url, '操作成功')),
]

// ========== C端用户模块 ==========
const cuserRoutes: MockRoute[] = [
  route('post', '/cuser/register', (_, url) => success(mockCUserProfile, url, '操作成功')),
  route('post', '/cuser/reset-password', (_, url) => success(true, url, '操作成功')),
  route('get', '/cuser/profile', (_, url) => success(mockCUserProfile, url)),
  route('put', '/cuser/profile', (_, url) => success(mockCUserProfile, url, '操作成功')),
  route('put', '/cuser/password', (_, url) => success(true, url, '操作成功')),
  route('put', '/cuser/phone', (_, url) => success(true, url, '操作成功')),
  route('put', '/cuser/email', (_, url) => success(true, url, '操作成功')),
  route(
    'get',
    (url) => url.includes('/cuser/third-party') && !url.includes('/unbind'),
    (_, url) => success(mockThirdPartyList, url)
  ),
  route('post', '/cuser/third-party/unbind', (_, url) => success(true, url, '操作成功')),
  route('get', '/cuser/login-records', (config, url) =>
    success(getMockLoginRecordPage(config.params || {}), url)
  ),
  route('post', '/cuser/logout-all', (_, url) => success(true, url, '操作成功')),
  route('put', '/cuser/identity-default', (_, url) => success(true, url, '操作成功')),
]

// ========== 日志模块 ==========
const logRoutes: MockRoute[] = [
  route('get', '/log/login/page', (config, url) =>
    success(getMockLoginLogPage(config.params || {}), url)
  ),
]

const allRoutes: MockRoute[] = [
  ...authRoutes,
  ...userRoutes,
  ...enterpriseRoutes,
  ...systemRoutes,
  ...cuserRoutes,
  ...logRoutes,
]

export async function mockRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
  await delay(50 + Math.random() * 150)

  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()

  const matched = allRoutes.find((r) => r.test(url, method))
  const responseData = matched ? matched.handler(config, url) : success(null, url)

  return {
    data: responseData,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config as any,
    request: {},
  }
}
