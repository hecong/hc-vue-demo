import { get, post, put, del } from '@/utils/request'
import type {
  ResponseData,
  RoleResponse,
  PermissionResponse
} from '@/types'
import type { RoleRequest, AssignPermissionsRequest, PermissionRequest } from '@/types/api'

export function getRoleList(): Promise<ResponseData<RoleResponse[]>> {
  return get('/sys/role/list')
}

export function getRoleById(id: number): Promise<ResponseData<RoleResponse>> {
  return get(`/sys/role/get/${id}`)
}

export function addRole(data: RoleRequest): Promise<ResponseData<RoleResponse>> {
  return post('/sys/role/add', data)
}

export function editRole(id: number, data: RoleRequest): Promise<ResponseData<RoleResponse>> {
  return put(`/sys/role/edit/${id}`, data)
}

export function deleteRole(id: number): Promise<ResponseData<null>> {
  return del(`/sys/role/delete/${id}`)
}

export function assignPermissions(data: AssignPermissionsRequest): Promise<ResponseData<null>> {
  return post('/sys/role/assign-permissions', data)
}

export function getPermissionList(): Promise<ResponseData<PermissionResponse[]>> {
  return get('/permission/list')
}

export function getPermissionById(id: number): Promise<ResponseData<PermissionResponse>> {
  return get(`/permission/get/${id}`)
}

export function addPermission(data: PermissionRequest): Promise<ResponseData<PermissionResponse>> {
  return post('/permission/add', data)
}

export function editPermission(id: number, data: PermissionRequest): Promise<ResponseData<PermissionResponse>> {
  return put(`/permission/edit/${id}`, data)
}

export function deletePermission(id: number): Promise<ResponseData<null>> {
  return del(`/permission/delete/${id}`)
}

export function initPermissionCache(): Promise<ResponseData<null>> {
  return post('/permission/init')
}
