export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
  path: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  totalPage: number
  hasNext: boolean
}

export interface LoginResponse {
  token: string
  tokenName: string
  userType: string
  needSelectIdentity: boolean
  phone: string
  enterpriseId: number
  enterpriseCode: string
  enterpriseName: string
  isFirstLogin: number
  cUserInfo: CUserInfo | null
  bUserInfo: BUserInfo | null
  identityList: IdentityItem[]
  identityDefault: string
}

export interface CUserInfo {
  id: number
  phone: string
  email: string
  username: string
  nickname: string
  avatar: string
  gender: number
  status: number
}

export interface BUserInfo {
  id: number
  enterpriseId: number
  username: string
  name: string
  phone: string
  email: string
  status: number
  isFirstLogin: number
  enterpriseName: string
  enterpriseCode: string
}

export interface IdentityItem {
  identityType: string
  label: string
  enterpriseId: number
  enterpriseCode: string
  userId: number
}

export interface UserResponse {
  id: number
  username: string
  name: string
  email: string
  phone: string
  status: number
  createTime: string
  updateTime: string
}

export interface CUserResponse {
  id: number
  phone: string
  email: string
  username: string
  nickname: string
  avatar: string
  gender: number
  birthday: string
  status: number
  createTime: string
}

export interface EnterpriseResponse {
  id: number
  enterpriseCode: string
  name: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: string
  status: number
  validDate: string
  ipWhitelist: string
  loginMutualExclusion: number
  passwordRule: string
}

export interface EnterpriseUserResponse {
  id: number
  enterpriseId: number
  username: string
  name: string
  phone: string
  email: string
  status: number
  isFirstLogin: number
  activationExpireTime: string
  createTime: string
}

export interface RoleResponse {
  id: number
  name: string
  code: string
  description: string
  createTime: string
  updateTime: string
}

export interface PermissionResponse {
  id: number
  name: string
  code: string
  type: string
  path: string
  parentId: number
  createTime: string
  updateTime: string
}

export interface LoginLogResponse {
  id: number
  userType: string
  userId: number
  account: string
  loginTime: string
  loginIp: string
  loginLocation: string
  loginDevice: string
  loginStatus: number
  failReason: string
}

export interface CurrentUserInfo {
  userType: string
  enterpriseId: number
  roles: string[]
  permissions: string[]
  cUserInfo: CUserInfo | null
  bUserInfo: BUserInfo | null
}

export interface ExcelTaskStatus {
  taskId: string
  taskType: 'IMPORT' | 'EXPORT'
  state: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAIL'
  total: number
  processed: number
  successCount: number
  failCount: number
  progress: number
  errorMsg: string
  filePath: string
  startTime: number
  endTime: number
}

export interface CheckEnterpriseResponse {
  enterpriseId: number
  enterpriseCode: string
  enterpriseName: string
  status: number
}

export interface CUserThirdPartyResponse {
  id: number
  platform: string
  bindNickname: string
  bindAvatar: string
}
