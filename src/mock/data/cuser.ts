import type { CUserResponse, CUserThirdPartyResponse, LoginLogResponse, PageResult } from '@/types'

export const mockCUserProfile: CUserResponse = {
  id: 1,
  phone: '13800138000',
  email: 'xiaoming@example.com',
  username: 'xiaoming001',
  nickname: '小明同学',
  avatar: '',
  gender: 1,
  birthday: '1995-06-15',
  status: 1,
  createTime: '2025-06-15 10:30:00',
}

export const mockThirdPartyList: CUserThirdPartyResponse[] = [
  {
    id: 1,
    platform: 'wechat',
    bindNickname: '微信用户_小明',
    bindAvatar: '',
  },
  {
    id: 2,
    platform: 'alipay',
    bindNickname: '支付宝用户_小明',
    bindAvatar: '',
  },
]

export const mockLoginRecords: LoginLogResponse[] = [
  { id: 1, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-23 08:30:25', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 2, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-22 19:15:10', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Safari', loginStatus: 1, failReason: '' },
  { id: 3, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-21 12:40:33', loginIp: '36.5.78.210', loginLocation: '上海', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 4, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-20 09:05:47', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 0, failReason: '密码错误' },
  { id: 5, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-19 21:22:18', loginIp: '183.12.56.199', loginLocation: '广州', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 6, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-18 07:55:02', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 7, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-17 16:30:55', loginIp: '36.5.78.210', loginLocation: '上海', loginDevice: 'Safari', loginStatus: 0, failReason: '验证码已过期' },
  { id: 8, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-16 11:10:40', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 9, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-15 20:45:12', loginIp: '58.32.110.77', loginLocation: '深圳', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 10, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-14 08:20:30', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 11, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-13 14:05:22', loginIp: '60.176.45.33', loginLocation: '杭州', loginDevice: 'Safari', loginStatus: 0, failReason: '账号被锁定' },
  { id: 12, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-12 22:15:08', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 13, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-11 10:50:18', loginIp: '183.12.56.199', loginLocation: '广州', loginDevice: 'Mobile', loginStatus: 1, failReason: '' },
  { id: 14, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-10 18:35:44', loginIp: '113.45.12.88', loginLocation: '北京', loginDevice: 'Chrome', loginStatus: 1, failReason: '' },
  { id: 15, userType: 'C', userId: 1, account: 'xiaoming001', loginTime: '2026-04-09 09:25:36', loginIp: '125.69.88.156', loginLocation: '成都', loginDevice: 'Mobile', loginStatus: 0, failReason: '网络异常' },
]

export function getMockLoginRecordPage(params: { pageNum?: number; pageSize?: number }): PageResult<LoginLogResponse> {
  const pageNum = params.pageNum ?? 1
  const pageSize = params.pageSize ?? 10
  const total = mockLoginRecords.length
  const totalPage = Math.ceil(total / pageSize)
  const start = (pageNum - 1) * pageSize
  const pageList = mockLoginRecords.slice(start, start + pageSize)

  return {
    list: pageList,
    total,
    pageNum,
    pageSize,
    totalPage,
    hasNext: pageNum < totalPage,
  }
}
