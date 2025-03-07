<template>
  <div class="order-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="$router.back()">
              <el-icon><Back /></el-icon>
              返回列表
            </el-button>
            <el-divider direction="vertical" />
            <span class="title">任务详情</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务编号">{{ orderInfo.code }}</el-descriptions-item>
        <el-descriptions-item label="任务状态">
          <el-tag :type="getStatusType(orderInfo.status)">
            {{ orderInfo.status_display }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="任务类型">
          <el-tag :type="orderInfo.order_type === 'trial' ? 'warning' : 'success'">
            {{ orderInfo.order_type_display }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityType(orderInfo.priority)">
            {{ orderInfo.priority_display }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="排序优先级">{{ orderInfo.sort_priority }}</el-descriptions-item>
        <el-descriptions-item label="产品信息" :span="2">
          <template v-if="orderInfo.product_info">
            <div>编码：{{ orderInfo.product_info.code }}</div>
            <div>名称：{{ orderInfo.product_info.name }}</div>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="计划数量">{{ orderInfo.quantity }}</el-descriptions-item>
        <el-descriptions-item label="生产主管">{{ orderInfo.manager_info?.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划开始日期">{{ orderInfo.planned_start_date }}</el-descriptions-item>
        <el-descriptions-item label="计划结束日期">{{ orderInfo.planned_end_date }}</el-descriptions-item>
        <el-descriptions-item label="技术要求" :span="2">
          {{ orderInfo.technical_requirements || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="质量要求" :span="2">
          {{ orderInfo.quality_requirements || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">
          {{ orderInfo.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建信息" :span="2">
          <div>创建人：{{ orderInfo.created_by_info?.username || '-' }}</div>
          <div>创建时间：{{ orderInfo.created_at }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 生产步骤区域 -->
      <div class="steps-section">
        <div class="section-header">
          <h3>生产步骤</h3>
          <el-button type="primary" @click="handleAddStep">添加步骤</el-button>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="step in orderSteps"
            :key="step.id"
            :type="getStepNodeType(step.status)"
            :hollow="step.status === 'pending'"
          >
            <h4>{{ step.name }}</h4>
            <p>状态：{{ step.status_display }}</p>
            <p>操作人：{{ step.operator_info?.username || '-' }}</p>
            <p v-if="step.start_time">开始时间：{{ step.start_time }}</p>
            <p v-if="step.end_time">结束时间：{{ step.end_time }}</p>
            <div class="step-actions">
              <el-button link type="primary" @click="handleEditStep(step)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteStep(step)">删除</el-button>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { getOrder } from '@/api/production'

const route = useRoute()
const router = useRouter()
const orderInfo = ref({})
const orderSteps = ref([])

// 获取任务详情
const getOrderDetail = async () => {
  try {
    const data = await getOrder(route.params.id)
    orderInfo.value = data
    orderSteps.value = data.steps || []
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    pending: 'info',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 获取优先级标签类型
const getPriorityType = (priority) => {
  const types = {
    0: 'danger',
    1: 'warning',
    2: 'primary',
    3: 'info'
  }
  return types[priority] || 'info'
}

// 获取步骤节点类型
const getStepNodeType = (status) => {
  const types = {
    pending: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 编辑任务
const handleEdit = () => {
  router.push(`/production/orders/edit/${route.params.id}`)
}

onMounted(() => {
  getOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: bold;
      }
    }
  }

  .steps-section {
    margin-top: 30px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
      }
    }
  }

  .step-actions {
    margin-top: 10px;
  }
}
</style> 