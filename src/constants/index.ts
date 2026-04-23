/**
 * 用户状态枚举
 */
export enum UserStatus {
  ENABLED = 1,
  DISABLED = 0
}

/**
 * 用户类型枚举
 */
export enum UserType {
  C_USER = 'C',
  B_USER = 'B',
  PLATFORM = 'P'
}

/**
 * 性别枚举
 */
export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2
}

/**
 * 倒计时配置
 */
export const COUNTDOWN_CONFIG = {
  DEFAULT_SECONDS: 60,
  INTERVAL_MS: 1000
} as const

/**
 * 分页配置
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100]
} as const

/**
 * RSA 公钥缓存时间（小时）
 */
export const RSA_PUBLIC_KEY_CACHE_HOURS = 24
