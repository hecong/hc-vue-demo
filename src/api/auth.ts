import { get, post } from '../utils/request'
import type {
  ResponseData,
  LoginResponse,
  CurrentUserInfo,
  CheckEnterpriseResponse,
  IdentityItem
} from '../types/index'
import type {
  CPasswordLoginRequest,
  CCodeLoginRequest,
  BPasswordLoginRequest,
  BCodeLoginRequest,
  PlatformLoginRequest,
  SendCodeRequest,
  CheckEnterpriseRequest,
  IdentityListRequest,
  SelectIdentityRequest,
  SetIdentityDefaultRequest
} from '../types/api.d'

export function getRsaPublicKey(): Promise<ResponseData<string>> {
  return get('/auth/rsa-public-key')
}

export function cPasswordLogin(data: CPasswordLoginRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/c/password-login', data)
}

export function cCodeLogin(data: CCodeLoginRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/c/code-login', data)
}

export function bPasswordLogin(data: BPasswordLoginRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/b/password-login', data)
}

export function bCodeLogin(data: BCodeLoginRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/b/code-login', data)
}

export function bCheckEnterprise(data: CheckEnterpriseRequest): Promise<ResponseData<CheckEnterpriseResponse>> {
  return post('/auth/b/check-enterprise', data)
}

export function platformLogin(data: PlatformLoginRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/platform/login', data)
}

export function getIdentityList(data: IdentityListRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/identity-list', data)
}

export function selectIdentity(data: SelectIdentityRequest): Promise<ResponseData<LoginResponse>> {
  return post('/auth/identity-select', data)
}

export function sendCode(data: SendCodeRequest): Promise<ResponseData<string>> {
  return post('/auth/code/send', data)
}

export function logout(): Promise<ResponseData<null>> {
  return post('/auth/logout')
}

export function getCurrentUserInfo(): Promise<ResponseData<CurrentUserInfo>> {
  return get('/auth/info')
}
