import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginResponse, CurrentUserInfo } from '@/types'
import { getCurrentUserInfo, logout as logoutApi } from '@/api/auth'
import router from '@/router'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(storage.getToken() || '')
  const userInfo = ref<CurrentUserInfo | null>(null)
  const loginResponse = ref<LoginResponse | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const userType = computed(() => userInfo.value?.userType || '')
  const isCUser = computed(() => userType.value === 'C')
  const isBUser = computed(() => userType.value === 'B')
  const isPlatformUser = computed(() => userType.value === 'P')
  const cUserInfo = computed(() => userInfo.value?.cUserInfo)
  const bUserInfo = computed(() => userInfo.value?.bUserInfo)
  const permissions = computed(() => userInfo.value?.permissions || [])
  const roles = computed(() => userInfo.value?.roles || [])

  function setToken(newToken: string) {
    token.value = newToken
    storage.setToken(newToken)
  }

  function setLoginResponse(response: LoginResponse) {
    loginResponse.value = response
    setToken(response.token)
    userInfo.value = {
      userType: response.userType,
      enterpriseId: response.enterpriseId,
      roles: [],
      permissions: [],
      cUserInfo: response.cUserInfo,
      bUserInfo: response.bUserInfo
    }
    storage.setUserInfo(response)
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await getCurrentUserInfo()
      if (res.data) {
        // 兼容后端返回 cuserInfo/buserInfo（全小写）的情况
        const raw = res.data as CurrentUserInfo & { cuserInfo?: unknown; buserInfo?: unknown }
        const normalized: CurrentUserInfo = {
          ...raw,
          cUserInfo: raw.cUserInfo ?? (raw.cuserInfo as CurrentUserInfo['cUserInfo']) ?? null,
          bUserInfo: raw.bUserInfo ?? (raw.buserInfo as CurrentUserInfo['bUserInfo']) ?? null
        }
        userInfo.value = normalized
        storage.setCurrentUserInfo(normalized)
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
      throw error
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('登出API失败', error)
    } finally {
      clearUser()
      router.push('/login')
    }
  }

  function clearUser() {
    token.value = ''
    userInfo.value = null
    loginResponse.value = null
    storage.clear()
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function initFromStorage() {
    const storedToken = storage.getToken()
    const storedUserInfo = storage.getUserInfo()
    const storedCurrentUserInfo = storage.getCurrentUserInfo()
    
    if (storedToken) {
      token.value = storedToken
    }
    
    if (storedCurrentUserInfo && typeof storedCurrentUserInfo === 'object' && storedCurrentUserInfo !== null && 'userType' in storedCurrentUserInfo) {
      userInfo.value = storedCurrentUserInfo as CurrentUserInfo
      loginResponse.value = storedUserInfo as LoginResponse
      return
    }

    if (storedUserInfo && typeof storedUserInfo === 'object' && storedUserInfo !== null && 'userType' in storedUserInfo) {
      const parsed = storedUserInfo as LoginResponse
      loginResponse.value = parsed
      userInfo.value = {
        userType: parsed.userType,
        enterpriseId: parsed.enterpriseId,
        roles: [],
        permissions: [],
        cUserInfo: parsed.cUserInfo,
        bUserInfo: parsed.bUserInfo
      }
    }
  }

  return {
    token,
    userInfo,
    loginResponse,
    isLoggedIn,
    userType,
    isCUser,
    isBUser,
    isPlatformUser,
    cUserInfo,
    bUserInfo,
    permissions,
    roles,
    setToken,
    setLoginResponse,
    fetchUserInfo,
    logout,
    clearUser,
    hasPermission,
    hasRole,
    initFromStorage
  }
}, {
  persist: false
})
