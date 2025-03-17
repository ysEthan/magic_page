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
          meta: { title: '首页', icon: 'Monitor' }
        },
        {
          path: '/product',
          name: 'Product',
          redirect: '/product/brand',
          meta: { title: '商品管理', icon: 'Goods' },
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
          meta: { title: '个人信息', icon: 'User' }
        },
        {
          path: '/production',
          name: 'Production',
          redirect: '/production/orders',
          meta: { title: '生产管理', icon: 'Box' },
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
            },
            {
              path: 'reports',
              name: 'ProductionReports',
              component: () => import('@/views/production/reports.vue'),
              meta: { title: '生产报表' }
            }
          ]
        },
        {
          path: '/purchase',
          component: () => import('@/layout/index.vue'),
          redirect: '/purchase/orders',
          name: 'Purchase',
          meta: { title: '采购管理', icon: 'ShoppingCart' },
          children: [
            {
              path: 'suppliers',
              name: 'Suppliers',
              component: () => import('@/views/purchase/suppliers.vue'),
              meta: { title: '供应商管理' }
            },
            {
              path: 'orders',
              name: 'PurchaseOrders',
              component: () => import('@/views/purchase/orders.vue'),
              meta: { title: '采购订单' }
            }
          ]
        },
        {
          path: '/storage',
          component: () => import('@/layout/index.vue'),
          redirect: '/storage/warehouse',
          name: 'Storage',
          meta: { title: '库存管理', icon: 'Box' },
          children: [
            {
              path: 'warehouse',
              name: 'Warehouse',
              component: () => import('@/views/storage/warehouse.vue'),
              meta: { title: '仓库管理' }
            },
            {
              path: 'inventory',
              name: 'Inventory',
              component: () => import('@/views/storage/inventory.vue'),
              meta: { title: '库存查询' }
            },
            {
              path: 'stock-in',
              name: 'StockIn',
              component: () => import('@/views/storage/stock-in.vue'),
              meta: { title: '入库管理' }
            },
            {
              path: 'stock-out',
              name: 'StockOut',
              component: () => import('@/views/storage/stock-out.vue'),
              meta: { title: '出库管理' }
            }
          ]
        },
        {
          path: '/trade',
          component: () => import('@/layout/index.vue'),
          redirect: '/trade/orders',
          meta: { title: '销售管理', icon: 'ShoppingCart' },
          children: [
            {
              path: 'orders',
              name: 'Orders',
              component: () => import('@/views/trade/orders.vue'),
              meta: { title: '订单管理' }
            },
            {
              path: 'orders/create',
              name: 'CreateOrder',
              component: () => import('@/views/trade/order-form.vue'),
              meta: { title: '新建订单', activeMenu: '/trade/orders' },
              hidden: true
            },
            {
              path: 'orders/:id/edit',
              name: 'EditOrder',
              component: () => import('@/views/trade/order-form.vue'),
              meta: { title: '编辑订单', activeMenu: '/trade/orders' },
              hidden: true
            }
          ]
        },
        {
          path: '/logistics',
          component: () => import('@/layout/index.vue'),
          meta: { title: '物流管理', icon: 'Van' },
          children: [
            {
              path: 'carriers',
              name: 'Carriers',
              component: () => import('@/views/logistics/carriers.vue'),
              meta: { title: '物流商管理' }
            },
            {
              path: 'services',
              name: 'Services',
              component: () => import('@/views/logistics/services.vue'),
              meta: { title: '物流服务' }
            },
            {
              path: 'packages',
              name: 'Packages',
              component: () => import('@/views/logistics/packages.vue'),
              meta: { title: '包裹管理' }
            },
            {
              path: 'tracking',
              name: 'Tracking',
              component: () => import('@/views/logistics/tracking.vue'),
              meta: { title: '物流轨迹' }
            }
          ]
        }
      ]
    }
  ]
})

export default router
