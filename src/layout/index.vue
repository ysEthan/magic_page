<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <div class="logo">
          <span>Magic ERP</span>
        </div>
        <el-menu
          :default-active="route.path"
          router
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-sub-menu index="1">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/product/brand">品牌管理</el-menu-item>
            <el-menu-item index="/product/category">分类管理</el-menu-item>
            <el-menu-item index="/product/spu">SPU管理</el-menu-item>
            <el-menu-item index="/product/sku">SKU管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存管理</span>
            </template>
            <el-menu-item index="/storage/warehouse">仓库管理</el-menu-item>
            <el-menu-item index="/storage/inventory">库存查询</el-menu-item>
            <el-menu-item index="/storage/stock-in">入库管理</el-menu-item>
            <el-menu-item index="/storage/stock-out">出库管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>生产管理</span>
            </template>
            <el-menu-item index="/production/orders">生产任务</el-menu-item>
            <el-menu-item index="/production/reports">生产报表</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="4">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>采购管理</span>
            </template>
            <el-menu-item index="/purchase/orders">采购订单</el-menu-item>
            <el-menu-item index="/purchase/suppliers">供应商管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="5">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>销售管理</span>
            </template>
            <el-menu-item index="/trade/orders">销售订单</el-menu-item>
            <el-menu-item index="/trade/customers">客户管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="6">
            <template #title>
              <el-icon><Van /></el-icon>
              <span>物流管理</span>
            </template>
            <el-menu-item index="/logistics/carriers">物流商管理</el-menu-item>
            <el-menu-item index="/logistics/services">物流服务</el-menu-item>
            <el-menu-item index="/logistics/packages">包裹管理</el-menu-item>
            <el-menu-item index="/logistics/tracking">物流轨迹</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-left">
            <el-icon class="fold-btn" @click="toggleSidebar">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <breadcrumb />
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                {{ userStore.userInfo?.last_name }}
                <el-icon><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Breadcrumb from '@/components/Breadcrumb.vue'
import {
  Monitor,
  User,
  CaretBottom,
  Goods,
  Box,
  ShoppingCart,
  Sell,
  Fold,
  Expand,
  Van
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.common-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  .el-container {
    height: 100%;
  }
  
  .el-aside {
    background-color: #304156;
    transition: width 0.3s;
    overflow: hidden;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      
      span {
        color: #fff;
        font-size: 20px;
        font-weight: 600;
      }
    }
    
    .el-menu {
      border-right: none;
      
      &.el-menu-vertical:not(.el-menu--collapse) {
        width: 200px;
      }
    }
  }
  
  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 60px;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .fold-btn {
        font-size: 20px;
        cursor: pointer;
        margin-right: 20px;
      }
    }
    
    .header-right {
      .user-info {
        cursor: pointer;
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-left: 5px;
        }
      }
    }
  }
  
  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}
</style> 