<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理订单</span>
              <el-tag type="warning">10</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-icon class="icon"><Document /></el-icon>
            <div class="content">
              <div class="value">150</div>
              <div class="label">本月订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
              <el-tag type="danger">5</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-icon class="icon"><Box /></el-icon>
            <div class="content">
              <div class="value">1280</div>
              <div class="label">当前库存总量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>生产任务</span>
              <el-tag type="success">8</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-icon class="icon"><Tools /></el-icon>
            <div class="content">
              <div class="value">12</div>
              <div class="label">进行中的任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>采购申请</span>
              <el-tag type="info">3</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-icon class="icon"><ShoppingCart /></el-icon>
            <div class="content">
              <div class="value">6</div>
              <div class="label">待审批申请</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Document, Box, Tools, ShoppingCart } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.dashboard-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-body {
    display: flex;
    align-items: center;
    padding: 20px 0;
    
    .icon {
      font-size: 48px;
      margin-right: 20px;
      color: #409EFF;
    }
    
    .content {
      .value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .label {
        color: #909399;
      }
    }
  }
}
</style> 