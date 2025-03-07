import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register', 
      component: () => import('@/views/register/index.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/',
      component: () => import('@/layout/index.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', icon: 'dashboard' }
        },
        {
          path: '/product',
          name: 'Product',
          redirect: '/product/brand',
          meta: { title: '商品管理' },
          children: [
            {
              path: 'brand',
              name: 'Brand',
              component: () => import('@/views/product/brand.vue'),
              meta: { title: '品牌管理' }
            },
            {
              path: 'category',
              name: 'Category',
              component: () => import('@/views/product/category.vue'),
              meta: { title: '分类管理' }
            },
            {
              path: 'spu',
              name: 'SPU',
              component: () => import('@/views/product/spu.vue'),
              meta: { title: 'SPU管理' }
            },
            {
              path: 'sku',
              name: 'SKU',
              component: () => import('@/views/product/sku.vue'),
              meta: { title: 'SKU管理' }
            }
          ]
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/profile/index.vue'),
          meta: { title: '个人信息', icon: 'user' }
        },
        {
          path: '/production',
          name: 'Production',
          redirect: '/production/orders',
          meta: { title: '生产管理' },
          children: [
            {
              path: 'orders',
              name: 'ProductionOrders',
              component: () => import('@/views/production/orders.vue'),
              meta: { title: '生产任务' }
            },
            {
              path: 'orders/:id',
              name: 'ProductionOrderDetail',
              component: () => import('@/views/production/order-detail.vue'),
              meta: { title: '任务详情' }
            }
          ]
        }
      ]
    }
  ]
})

export default router
