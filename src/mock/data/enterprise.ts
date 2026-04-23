import type { EnterpriseResponse, EnterpriseUserResponse, PageResult } from '@/types'

export const mockEnterprise: EnterpriseResponse = {
  id: 1,
  enterpriseCode: 'XCKJ20240001',
  name: '星辰科技有限公司',
  contactPerson: '张星辰',
  contactPhone: '13800138001',
  contactEmail: 'contact@xingchen-tech.com',
  address: '北京市海淀区中关村软件园A座8层',
  status: 1,
  validDate: '2027-12-31',
  ipWhitelist: '192.168.1.0/24,10.0.0.0/16',
  loginMutualExclusion: 0,
  passwordRule: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$',
}

export const mockEnterpriseUsers: EnterpriseUserResponse[] = [
  {
    id: 101,
    enterpriseId: 1,
    username: 'wangjianguo',
    name: '王建国',
    phone: '13812345678',
    email: 'wangjianguo@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-01-15 09:30:00',
  },
  {
    id: 102,
    enterpriseId: 1,
    username: 'lixiuying',
    name: '李秀英',
    phone: '13987654321',
    email: 'lixiuying@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-01-20 14:20:00',
  },
  {
    id: 103,
    enterpriseId: 1,
    username: 'zhangminghui',
    name: '张明辉',
    phone: '15011112222',
    email: 'zhangminghui@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-02-01 10:00:00',
  },
  {
    id: 104,
    enterpriseId: 1,
    username: 'zhaolihua',
    name: '赵丽华',
    phone: '18633334444',
    email: 'zhaolihua@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-02-10 16:45:00',
  },
  {
    id: 105,
    enterpriseId: 1,
    username: 'chenzhiqiang',
    name: '陈志强',
    phone: '13855556666',
    email: 'chenzhiqiang@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-02-18 11:30:00',
  },
  {
    id: 106,
    enterpriseId: 1,
    username: 'liumeiling',
    name: '刘美玲',
    phone: '13977778888',
    email: 'liumeiling@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-03-01 09:00:00',
  },
  {
    id: 107,
    enterpriseId: 1,
    username: 'yangguoqing',
    name: '杨国庆',
    phone: '15099990000',
    email: 'yangguoqing@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-03-10 15:15:00',
  },
  {
    id: 108,
    enterpriseId: 1,
    username: 'zhouxiaoyan',
    name: '周小燕',
    phone: '18612345679',
    email: 'zhouxiaoyan@xingchen-tech.com',
    status: 1,
    isFirstLogin: 0,
    activationExpireTime: '2026-05-01 18:00:00',
    createTime: '2026-03-20 08:45:00',
  },
]

export function getMockEnterpriseUserPage(params: { pageNum?: number; pageSize?: number; keyword?: string }): PageResult<EnterpriseUserResponse> {
  const pageNum = params.pageNum ?? 1
  const pageSize = params.pageSize ?? 10
  const keyword = params.keyword?.trim()

  let list = [...mockEnterpriseUsers]
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    list = list.filter(
      (item) =>
        item.name.includes(keyword) ||
        item.username.toLowerCase().includes(lowerKeyword) ||
        item.phone.includes(keyword) ||
        item.email.toLowerCase().includes(lowerKeyword),
    )
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
