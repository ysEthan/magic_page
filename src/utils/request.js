import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)    
  }
)

// 标记是否正在刷新token
let isRefreshing = false
// 存储等待token刷新的请求
let requests = []

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  async error => {
    const userStore = useUserStore()
    
    if (error.response?.status === 401 && error.config.url !== '/api/auth/token/refresh/') {
      if (!isRefreshing) {
        isRefreshing = true
        
        if (userStore.refreshToken) {
          try {
            const { access } = await service.post('/api/auth/token/refresh/', {
              refresh: userStore.refreshToken
            })
            userStore.setToken(access)
            isRefreshing = false
            
            // 重试所有等待的请求
            requests.forEach(cb => cb(access))
            requests = []
            
            // 重试当前请求
            error.config.headers['Authorization'] = `Bearer ${access}`
            return service(error.config)
          } catch (refreshError) {
            isRefreshing = false
            userStore.logout()
            router.push('/login')
            return Promise.reject(refreshError)
          }
        } else {
          isRefreshing = false
          userStore.logout()
          router.push('/login')
        }
      } else {
        // 将请求添加到等待队列
        return new Promise(resolve => {
          requests.push(token => {
            error.config.headers['Authorization'] = `Bearer ${token}`
            resolve(service(error.config))
          })
        })
      }
    }
    return Promise.reject(error)
  }
)

export default service 