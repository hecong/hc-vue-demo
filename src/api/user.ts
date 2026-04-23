import { get, post, put, del } from '@/utils/request'
import type {
  ResponseData,
  UserResponse,
  PageResult,
  ExcelTaskStatus
} from '@/types'
import type { UserRequest, AssignRolesRequest } from '@/types/api.d'

export function getUserList(): Promise<ResponseData<UserResponse[]>> {
  return get('/user/list')
}

export function getUserById(id: number): Promise<ResponseData<UserResponse>> {
  return get(`/user/get/${id}`)
}

export function getUserPage(params: {
  pageNum: number
  pageSize: number
  username?: string
  name?: string
  phone?: string
}): Promise<ResponseData<PageResult<UserResponse>>> {
  return get('/user/page', params)
}

export function addUser(data: UserRequest): Promise<ResponseData<UserResponse>> {
  return post('/user/add', data)
}

export function editUser(id: number, data: UserRequest): Promise<ResponseData<UserResponse>> {
  return put(`/user/edit/${id}`, data)
}

export function deleteUser(id: number): Promise<ResponseData<null>> {
  return del(`/user/delete/${id}`)
}

export function assignRoles(data: AssignRolesRequest): Promise<ResponseData<null>> {
  return post('/user/assign-roles', data)
}

export function exportUsers(): Promise<ResponseData> {
  return get('/user/export')
}

export function exportUsersAsync(): Promise<ResponseData<string>> {
  return post('/user/export-async')
}

export function getExportStatus(taskId: string): Promise<ResponseData<ExcelTaskStatus>> {
  return get(`/user/export-async/status/${taskId}`)
}

export function downloadExportFile(taskId: string): string {
  return `/user/export-async/download/${taskId}`
}
