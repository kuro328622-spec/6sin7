import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// 标记：是否正在刷新 Token 中
let isRefreshing = false
// 存储：因为等待 Token 刷新而被挂起的请求队列
let requests: any[] = []

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000
})

// 1. 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// 2. 响应拦截器
service.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const { response } = error
    
    // 如果是 401 错误（Token 过期）
    if (response?.status === 401) {
      const config = error.config as InternalAxiosRequestConfig
      
      if (!isRefreshing) {
        isRefreshing = true
        try {
          // --- 这里调用你后端的刷新 Token 接口 ---
          // const { data } = await axios.post('/auth/refresh', { refresh_token: '...' })
          // localStorage.setItem('token', data.token)
          
          // 刷新成功后，依次执行队列里的请求
          requests.forEach((cb) => cb(localStorage.getItem('token')))
          requests = []
          return service(config)
        } catch (res) {
          // 刷新失败，只能重新登录
          window.location.href = '/login'
          return Promise.reject(res)
        } finally {
          isRefreshing = false
        }
      } else {
        // 如果正在刷新中，把当前请求包装成 Promise 放入队列
        return new Promise((resolve) => {
          requests.push((token: string) => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(service(config))
          })
        })
      }
    }
    return Promise.reject(error)
  }
)

export default service