import type { LoginLogResponse, PageResult } from '@/types'

export const mockLoginLogs: LoginLogResponse[] = [
  { id: 1, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-23 09:00:00', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 2, userType: 'B', userId: 101, account: 'wangjianguo', loginTime: '2026-04-23 08:45:30', loginIp: '192.168.1.105', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 3, userType: 'P', userId: 201, account: 'admin', loginTime: '2026-04-23 08:30:15', loginIp: '10.0.0.15', loginLocation: '上海', loginDevice: 'Firefox', loginStatus: 1, failReason: '' },
  { id: 4, userType: 'C', userId: 2, account: 'xiaohong002', loginTime: '2026-04-23 07:20:10', loginIp: '36.5.78.210', loginLocation: '上海', loginDevice: 'Mobile', loginStatus: 0, failReason: '密码错误' },
  { id: 5, userType: 'B', userId: 102, account: 'lixiuying', loginTime: '2026-04-22 19:10:22', loginIp: '192.168.1.106', loginLocation: '北京', loginDevice: 'Safari', loginStatus: 1, failReason: '' },
  { id: 6, userType: 'C', userId: 3, account: 'zhangsan003', loginTime: '2026-04-22 18:55:40', loginIp: '183.12.56.199', loginLocation: '广州', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 7, userType: 'P', userId: 202, account: 'superadmin', loginTime: '2026-04-22 17:30:00', loginIp: '10.0.0.20', loginLocation: '深圳', loginDevice: 'Chrome', loginStatus: 0, failReason: 'IP不在白名单中' },
  { id: 8, userType: 'B', userId: 103, account: 'zhangminghui', loginTime: '2026-04-22 16:15:55', loginIp: '192.168.2.33', loginLocation: '广州', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 9, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-22 14:40:18', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Safari', loginStatus: 1, failReason: '' },
  { id: 10, userType: 'B', userId: 104, account: 'zhaolihua', loginTime: '2026-04-22 12:05:33', loginIp: '192.168.1.107', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 0, failReason: '账号已禁用' },
  { id: 11, userType: 'P', userId: 201, account: 'admin', loginTime: '2026-04-21 22:20:45', loginIp: '10.0.0.15', loginLocation: '上海', loginDevice: 'Firefox', loginStatus: 1, failReason: '' },
  { id: 12, userType: 'C', userId: 4, account: 'lisi004', loginTime: '2026-04-21 20:50:12', loginIp: '58.32.110.77', loginLocation: '深圳', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 13, userType: 'B', userId: 105, account: 'chenzhiqiang', loginTime: '2026-04-21 18:35:28', loginIp: '192.168.3.88', loginLocation: '杭州', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 14, userType: 'C', userId: 5, account: 'wangwu005', loginTime: '2026-04-21 15:10:05', loginIp: '60.176.45.33', loginLocation: '杭州', loginDevice: 'Chrome', loginStatus: 0, failReason: '验证码错误' },
  { id: 15, userType: 'P', userId: 203, account: 'operator1', loginTime: '2026-04-21 10:25:50', loginIp: '10.0.0.25', loginLocation: '成都', loginDevice: 'Edge', loginStatus: 1, failReason: '' },
  { id: 16, userType: 'B', userId: 106, account: 'liumeiling', loginTime: '2026-04-20 21:40:15', loginIp: '192.168.1.108', loginLocation: '北京', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 17, userType: 'C', userId: 2, account: 'xiaohong002', loginTime: '2026-04-20 19:55:30', loginIp: '36.5.78.210', loginLocation: '上海', loginDevice: 'Safari', loginStatus: 1, failReason: '' },
  { id: 18, userType: 'B', userId: 107, account: 'yangguoqing', loginTime: '2026-04-20 17:15:42', loginIp: '192.168.4.12', loginLocation: '成都', loginDevice: 'Chrome', loginStatus: 0, failReason: '密码过期' },
  { id: 19, userType: 'P', userId: 202, account: 'superadmin', loginTime: '2026-04-20 14:30:00', loginIp: '10.0.0.20', loginLocation: '深圳', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 20, userType: 'C', userId: 6, account: 'zhaoliu006', loginTime: '2026-04-20 08:10:25', loginIp: '125.69.88.156', loginLocation: '成都', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
]

export function getMockLoginLogPage(params: { pageNum?: number; pageSize?: number; userType?: string; loginStatus?: number; account?: string }): PageResult<LoginLogResponse> {
  const pageNum = params.pageNum ?? 1
  const pageSize = params.pageSize ?? 10

  let list = [...mockLoginLogs]

  if (params.userType) {
    list = list.filter((item) => item.userType === params.userType)
  }
  if (params.loginStatus !== undefined) {
    list = list.filter((item) => item.loginStatus === params.loginStatus)
  }
  if (params.account) {
    const lowerAccount = params.account.toLowerCase()
    list = list.filter((item) => item.account.toLowerCase().includes(lowerAccount))
  }

  const total = list.length
  const totalPage = Math.ceil(total / pageSize)
  const start = (pageNum - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)

  return {
    list: pageList,
    total,
    pageNum,
    pageSize,
    totalPage,
    hasNext: pageNum < totalPage,
  }
}
