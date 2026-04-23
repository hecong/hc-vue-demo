import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginResponse, CurrentUserInfo, CUserInfo, BUserInfo, IdentityItem } from '@/types'
import { getCurrentUserInfo, logout as logoutApi } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
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
    localStorage.setItem('token', newToken)
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
    localStorage.setItem('userInfo', JSON.stringify(response))
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const res = await getCurrentUserInfo()
      if (res.data) {
        // 兼容后端返回 cuserInfo/buserInfo（全小写）的情况
        const raw = res.data as any
        const normalized = {
          ...raw,
          cUserInfo: raw.cUserInfo ?? raw.cuserInfo ?? null,
          bUserInfo: raw.bUserInfo ?? raw.buserInfo ?? null
        }
        userInfo.value = normalized
        localStorage.setItem('currentUserInfo', JSON.stringify(normalized))
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
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('currentUserInfo')
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function initFromStorage() {
    const storedToken = localStorage.getItem('token')
    const storedUserInfo = localStorage.getItem('userInfo')
    const storedCurrentUserInfo = localStorage.getItem('currentUserInfo')
    if (storedToken) {
      token.value = storedToken
    }
    if (storedCurrentUserInfo) {
      try {
        const parsed = JSON.parse(storedCurrentUserInfo)
        if (parsed.userType) {
          userInfo.value = parsed
          loginResponse.value = storedUserInfo ? JSON.parse(storedUserInfo) : null
          return
        }
      } catch (e) {
        console.error('解析存储的用户信息失败', e)
      }
    }
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo)
        if (parsed.cUserInfo || parsed.bUserInfo) {
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
      } catch (e) {
        console.error('解析存储的用户信息失败', e)
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
})
