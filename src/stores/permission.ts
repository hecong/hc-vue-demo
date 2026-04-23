import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PermissionResponse } from '@/types'
import { getPermissionList, initPermissionCache } from '@/api/system'
import { ElMessage } from 'element-plus'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<PermissionResponse[]>([])
  const permissionCodes = ref<string[]>([])
  const isLoaded = ref(false)

  async function fetchPermissions() {
    try {
      const res = await getPermissionList()
      if (res.data) {
        permissions.value = res.data
        permissionCodes.value = res.data.map(p => p.code)
        isLoaded.value = true
      }
    } catch (error) {
      console.error('获取权限列表失败', error)
      throw error
    }
  }

  async function initPermission() {
    try {
      await initPermissionCache()
      ElMessage.success('权限缓存初始化成功')
    } catch (error) {
      console.error('权限缓存初始化失败', error)
      throw error
    }
  }

  function hasPermission(code: string): boolean {
    return permissionCodes.value.includes(code)
  }

  function clearPermissions() {
    permissions.value = []
    permissionCodes.value = []
    isLoaded.value = false
  }

  return {
    permissions,
    permissionCodes,
    isLoaded,
    fetchPermissions,
    initPermission,
    hasPermission,
    clearPermissions
  }
})
