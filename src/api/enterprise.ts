import { get, post, put, del } from '@/utils/request'
import type {
  ResponseData,
  EnterpriseResponse,
  EnterpriseUserResponse,
  PageResult
} from '@/types'
import type {
  EnterpriseCreateRequest,
  EnterpriseUpdateRequest,
  SecuritySettingRequest,
  EnterpriseUserCreateRequest,
  ResetEnterpriseUserPasswordRequest,
  ChangePasswordRequest
} from '@/types/api.d'

export function getEnterpriseById(id: number): Promise<ResponseData<EnterpriseResponse>> {
  return get(`/enterprise/get/${id}`)
}

export function createEnterprise(data: EnterpriseCreateRequest): Promise<ResponseData<EnterpriseResponse>> {
  return post('/enterprise/add', data)
}

export function updateEnterprise(id: number, data: EnterpriseUpdateRequest): Promise<ResponseData<EnterpriseResponse>> {
  return put(`/enterprise/edit/${id}`, data)
}

export function updateSecuritySetting(id: number, data: SecuritySettingRequest): Promise<ResponseData<null>> {
  return put(`/enterprise/security/${id}`, data)
}

export function createEnterpriseUser(data: EnterpriseUserCreateRequest): Promise<ResponseData<EnterpriseUserResponse>> {
  return post('/enterprise/user/add', data)
}

export function editEnterpriseUser(id: number, data: EnterpriseUserCreateRequest): Promise<ResponseData<EnterpriseUserResponse>> {
  return put(`/enterprise/user/edit/${id}`, data)
}

export function deleteEnterpriseUser(id: number): Promise<ResponseData<null>> {
  return del(`/enterprise/user/delete/${id}`)
}

export function resetEnterpriseUserPassword(id: number, data: ResetEnterpriseUserPasswordRequest): Promise<ResponseData<null>> {
  return put(`/enterprise/user/${id}/reset-password`, data)
}

export function activateEnterpriseUser(id: number): Promise<ResponseData<null>> {
  return post(`/enterprise/user/${id}/activate`)
}

export function updateEnterpriseUserStatus(id: number, status: number): Promise<ResponseData<null>> {
  return put(`/enterprise/user/${id}/status`, { key: status })
}

export function getEnterpriseUserPage(params: {
  pageNum: number
  pageSize: number
  enterpriseId?: number
  username?: string
  name?: string
  status?: number
}): Promise<ResponseData<PageResult<EnterpriseUserResponse>>> {
  return get('/enterprise/user/page', params)
}

export function forceChangePassword(data: ResetEnterpriseUserPasswordRequest): Promise<ResponseData<null>> {
  return put('/enterprise/user/force-change-password', data)
}

export function changeEnterpriseUserPassword(data: ChangePasswordRequest): Promise<ResponseData<null>> {
  return put('/enterprise/user/change-password', data)
}
