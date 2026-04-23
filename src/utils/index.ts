import JSEncrypt from 'jsencrypt'
import dayjs from 'dayjs'

export function encryptPassword(password: string, publicKey: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(password) || password
}

export function getUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(url.split('?')[1])
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(date: string | Date | null | undefined, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let previous = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - previous > wait) {
      func.apply(this, args)
      previous = now
    }
  }
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)
}
