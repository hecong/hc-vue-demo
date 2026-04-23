import { get, post, put } from '@/utils/request'
import type { ResponseData, CUserResponse, CUserThirdPartyResponse, LoginLogResponse, PageResult } from '@/types'
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePhoneRequest,
  ChangeEmailRequest,
  UnbindThirdPartyRequest,
  SetIdentityDefaultRequest,
  CUserRegisterRequest,
  ResetPasswordRequest
} from '@/types/api.d'

export function registerCUser(data: CUserRegisterRequest): Promise<ResponseData<CUserResponse>> {
  return post('/cuser/register', data)
}

export function resetCUserPassword(data: ResetPasswordRequest): Promise<ResponseData<null>> {
  return post('/cuser/reset-password', data)
}

export function getCUserProfile(): Promise<ResponseData<CUserResponse>> {
  return get('/cuser/profile')
}

export function updateCUserProfile(data: UpdateProfileRequest): Promise<ResponseData<CUserResponse>> {
  return put('/cuser/profile', data)
}

export function changeCUserPassword(data: ChangePasswordRequest): Promise<ResponseData<null>> {
  return put('/cuser/password', data)
}

export function changeCUserPhone(data: ChangePhoneRequest): Promise<ResponseData<null>> {
  return put('/cuser/phone', data)
}

export function changeCUserEmail(data: ChangeEmailRequest): Promise<ResponseData<null>> {
  return put('/cuser/email', data)
}

export function getCUserThirdParty(): Promise<ResponseData<CUserThirdPartyResponse[]>> {
  return get('/cuser/third-party')
}

export function unbindThirdParty(data: UnbindThirdPartyRequest): Promise<ResponseData<null>> {
  return post('/cuser/third-party/unbind', data)
}

export function getCUserLoginRecords(params: {
  pageNum: number
  pageSize: number
  userType?: string
  userId?: number
}): Promise<ResponseData<PageResult<LoginLogResponse>>> {
  return get('/cuser/login-records', params)
}

export function logoutAllDevices(): Promise<ResponseData<null>> {
  return post('/cuser/logout-all')
}

export function setIdentityDefault(data: SetIdentityDefaultRequest): Promise<ResponseData<null>> {
  return put('/cuser/identity-default', data)
}
