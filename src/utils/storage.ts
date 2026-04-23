/**
 * 存储常量
 */
export const STORAGE_KEYS = {
  TOKEN: 'hc_token',
  USER_INFO: 'hc_userInfo',
  CURRENT_USER_INFO: 'hc_currentUserInfo',
  LOGIN_RESPONSE: 'hc_loginResponse',
  RSA_PUBLIC_KEY: 'hc_rsaPublicKey',
  PUBLIC_KEY_EXPIRE_TIME: 'hc_publicKeyExpireTime'
} as const

/**
 * 生成基于当前域名的动态密钥，增加一点提取难度
 * 注意：前端代码完全可见，任何加密都只是混淆，无法阻止有决心的攻击者。
 * 生产环境强烈建议：后端使用 httpOnly + Secure + SameSite=Strict Cookie 存储 Token。
 */
function getObfuscationKey(): number[] {
  const base = location.hostname || 'hc-default'
  const key: number[] = []
  for (let i = 0; i < base.length; i++) {
    key.push(base.charCodeAt(i) ^ 0x5a)
  }
  return key.length ? key : [0x5a]
}

function xorObfuscate(input: string): string {
  const key = getObfuscationKey()
  const bytes = new TextEncoder().encode(input)
  const obfuscated = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    obfuscated[i] = bytes[i] ^ key[i % key.length]
  }
  return btoa(String.fromCharCode(...obfuscated))
}

function xorDeobfuscate(input: string): string | null {
  try {
    const key = getObfuscationKey()
    const bytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0))
    const deobfuscated = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
      deobfuscated[i] = bytes[i] ^ key[i % key.length]
    }
    return new TextDecoder().decode(deobfuscated)
  } catch {
    // 兼容旧版明文存储：如果反混淆失败，尝试直接返回原文
    return input
  }
}

class StorageService {
  private shouldEncrypt(key: string): boolean {
    return key === STORAGE_KEYS.TOKEN || key === STORAGE_KEYS.USER_INFO || key === STORAGE_KEYS.LOGIN_RESPONSE
  }

  /**
   * 设置存储项（敏感数据自动混淆）
   */
  setItem(key: string, value: string): void {
    try {
      const storeValue = this.shouldEncrypt(key) ? xorObfuscate(value) : value
      localStorage.setItem(key, storeValue)
    } catch (error) {
      console.error(`Storage setItem failed for key: ${key}`, error)
    }
  }

  /**
   * 获取存储项（敏感数据自动解混淆）
   */
  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key)
      if (!value) return null
      return this.shouldEncrypt(key) ? xorDeobfuscate(value) : value
    } catch (error) {
      console.error(`Storage getItem failed for key: ${key}`, error)
      return null
    }
  }

  /**
   * 删除存储项
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Storage removeItem failed for key: ${key}`, error)
    }
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Storage clear failed', error)
    }
  }

  /**
   * 设置 Token
   */
  setToken(token: string): void {
    this.setItem(STORAGE_KEYS.TOKEN, token)
  }

  /**
   * 获取 Token
   */
  getToken(): string | null {
    return this.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * 删除 Token
   */
  removeToken(): void {
    this.removeItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * 设置用户信息（序列化）
   */
  setUserInfo(userInfo: unknown): void {
    if (userInfo) {
      this.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    }
  }

  /**
   * 获取用户信息（反序列化）
   */
  getUserInfo<T = unknown>(): T | null {
    const data = this.getItem(STORAGE_KEYS.USER_INFO)
    if (data) {
      try {
        return JSON.parse(data) as T
      } catch {
        return null
      }
    }
    return null
  }

  /**
   * 设置当前用户信息
   */
  setCurrentUserInfo(userInfo: unknown): void {
    if (userInfo) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_INFO, JSON.stringify(userInfo))
    }
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUserInfo<T = unknown>(): T | null {
    const data = this.getItem(STORAGE_KEYS.CURRENT_USER_INFO)
    if (data) {
      try {
        return JSON.parse(data) as T
      } catch {
        return null
      }
    }
    return null
  }

  /**
   * 缓存 RSA 公钥（带过期时间）
   */
  setRsaPublicKey(publicKey: string, expireHours: number = 24): void {
    this.setItem(STORAGE_KEYS.RSA_PUBLIC_KEY, publicKey)
    const expireTime = Date.now() + expireHours * 60 * 60 * 1000
    this.setItem(STORAGE_KEYS.PUBLIC_KEY_EXPIRE_TIME, String(expireTime))
  }

  /**
   * 获取 RSA 公钥（检查是否过期）
   */
  getRsaPublicKey(): string | null {
    const expireTime = this.getItem(STORAGE_KEYS.PUBLIC_KEY_EXPIRE_TIME)
    if (expireTime && Date.now() > Number(expireTime)) {
      // 公钥已过期，清除缓存
      this.removeItem(STORAGE_KEYS.RSA_PUBLIC_KEY)
      this.removeItem(STORAGE_KEYS.PUBLIC_KEY_EXPIRE_TIME)
      return null
    }
    return this.getItem(STORAGE_KEYS.RSA_PUBLIC_KEY)
  }
}

// 导出单例
export const storage = new StorageService()
