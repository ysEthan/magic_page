import router from './index'
import { useUserStore } from '@/stores/user'

const whiteList = ['/login', '/register'] // 不需要登录的路由

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  if (userStore.token) {
    if (to.path === '/login') {
      next('/')
    } else {
      if (!userStore.userInfo) {
        try {
          await userStore.getProfile()
          next()
        } catch (error) {
          userStore.logout()
          next('/login')
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router 