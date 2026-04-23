export interface CPasswordLoginRequest {
  account: string
  password: string
}

export interface CCodeLoginRequest {
  target: string
  code: string
}

export interface BPasswordLoginRequest {
  enterpriseCode: string
  username: string
  password: string
}

export interface BCodeLoginRequest {
  target: string
  code: string
  enterpriseCode?: string
}

export interface PlatformLoginRequest {
  username: string
  password: string
}

export interface SendCodeRequest {
  target: string
  scene: 'login' | 'register' | 'reset'
}

export interface CheckEnterpriseRequest {
  enterpriseCode: string
}

export interface IdentityListRequest {
  phone: string
}

export interface SelectIdentityRequest {
  phone: string
  identityType: string
  enterpriseId?: number
}

export interface SetIdentityDefaultRequest {
  identityDefault: string
}

export interface UserRequest {
  id?: number
  username?: string
  password?: string
  name?: string
  email?: string
  phone?: string
  status?: number
}

export interface AssignRolesRequest {
  userId: number
  roleIds: number[]
}

export interface CUserRegisterRequest {
  phone?: string
  email?: string
  username?: string
  password: string
}

export interface ResetPasswordRequest {
  account: string
  newPassword: string
}

export interface UpdateProfileRequest {
  nickname?: string
  avatar?: string
  gender?: number
  birthday?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangePhoneRequest {
  newPhone: string
}

export interface ChangeEmailRequest {
  newEmail: string
}

export interface UnbindThirdPartyRequest {
  platform: string
}

export interface EnterpriseCreateRequest {
  name: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
  validDate?: string
}

export interface EnterpriseUpdateRequest {
  name?: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  address?: string
}

export interface SecuritySettingRequest {
  ipWhitelist?: string
  loginMutualExclusion?: number
  passwordRule?: string
}

export interface EnterpriseUserCreateRequest {
  enterpriseId: number
  username: string
  password: string
  name: string
  phone?: string
  email?: string
}

export interface ResetEnterpriseUserPasswordRequest {
  newPassword: string
}

export interface RoleRequest {
  name?: string
  code?: string
  description?: string
}

export interface PermissionRequest {
  name?: string
  code?: string
  type?: string
  path?: string
  parentId?: number
}

export interface AssignPermissionsRequest {
  roleId: number
  permissionIds: number[]
}
