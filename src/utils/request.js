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

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  async error => {
    const userStore = useUserStore()
    
    if (error.response?.status === 401) {
      // token过期，尝试刷新token
      if (userStore.refreshToken) {
        try {
          const { access } = await service.post('/api/auth/token/refresh/', {
            refresh: userStore.refreshToken
          })
          userStore.setToken(access)
          // 重试原请求
          return service(error.config)
        } catch (refreshError) {
          // 刷新token失败，退出登录
          userStore.logout()
          router.push('/login')
        }
      } else {
        userStore.logout()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default service 