import JSEncrypt from 'jsencrypt'

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

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
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
