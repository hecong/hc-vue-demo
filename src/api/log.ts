import { get } from '@/utils/request'
import type {
  ResponseData,
  LoginLogResponse,
  PageResult
} from '@/types'

export function getLoginLogPage(params: {
  pageNum: number
  pageSize: number
  userType?: string
  userId?: number
}): Promise<ResponseData<PageResult<LoginLogResponse>>> {
  return get('/log/login/page', params)
}
