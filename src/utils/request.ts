import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'
import type { ResponseData } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let pendingRequests: ((token: string) => void)[] = []

function handleUnauthorized() {
  if (isRefreshing) return
  isRefreshing = true
  ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('currentUserInfo')
    router.push('/login')
  }).finally(() => {
    isRefreshing = false
  })
}

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message } = response.data

    if (code === 200) {
      return response.data
    }

    if (code === 401) {
      handleUnauthorized()
      return Promise.reject(new Error(message || '登录已过期'))
    }

    if (code === 403) {
      ElMessage.error('没有权限访问该资源')
      return Promise.reject(new Error(message || '没有权限'))
    }

    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 401:
          handleUnauthorized()
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '网络错误，请稍后重试')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export interface RequestConfig extends AxiosRequestConfig {
  loading?: boolean
}

export function request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
  return instance.request<ResponseData<T>>(config) as unknown as Promise<ResponseData<T>>
}

export function get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
  return request<T>({
    method: 'GET',
    url,
    params,
    ...config
  })
}

export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
  return request<T>({
    method: 'POST',
    url,
    data,
    ...config
  })
}

export function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
  return request<T>({
    method: 'PUT',
    url,
    data,
    ...config
  })
}

export function del<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
  return request<T>({
    method: 'DELETE',
    url,
    params,
    ...config
  })
}

export default instance
