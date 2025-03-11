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

      <el-descriptions :column="3" border>
        <!-- 第一行：任务编号、任务描述、优先级 -->
        <el-descriptions-item label="任务编号">{{ orderInfo.code }}</el-descriptions-item>
        <el-descriptions-item label="任务描述">
          {{ orderInfo.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <div class="priority-info">
            <el-tag :type="getPriorityType(orderInfo.priority)">
              {{ orderInfo.priority_display }}
            </el-tag>
            <span class="sort-priority">排序值: {{ orderInfo.sort_priority }}</span>
          </div>
        </el-descriptions-item>
        
        <!-- 第二行：产品信息、计划数量、任务类型 -->
        <el-descriptions-item label="产品信息">
          <template v-if="orderInfo.product_info">
            <div class="product-info">
              <div>编码：{{ orderInfo.product_info.code }}</div>
              <div>名称：{{ orderInfo.product_info.name }}</div>
            </div>
          </template>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="计划数量">{{ orderInfo.quantity }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">
          <el-tag :type="orderInfo.order_type === 'trial' ? 'warning' : 'success'">
            {{ orderInfo.order_type_display }}
          </el-tag>
        </el-descriptions-item>
        
        <!-- 第三行：计划开始日期、计划结束日期、当前状态 -->
        <el-descriptions-item label="计划开始日期">{{ orderInfo.planned_start_date }}</el-descriptions-item>
        <el-descriptions-item label="计划结束日期">{{ orderInfo.planned_end_date }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(orderInfo.status)">
            {{ orderInfo.status_display }}
          </el-tag>
        </el-descriptions-item>
        
        <!-- 其他信息 -->
        <el-descriptions-item label="生产主管">
          {{ orderInfo.manager_info?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ orderInfo.created_by_info?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ orderInfo.created_at }}
        </el-descriptions-item>
        
        <el-descriptions-item label="技术要求" :span="3">
          {{ orderInfo.technical_requirements || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="质量要求" :span="3">
          {{ orderInfo.quality_requirements || '-' }}
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
            class="timeline-item"
          >
            <div class="step-content">
              <div class="step-info">
                <span class="step-sequence">#{{ step.sequence }}</span>
                <span class="step-name">{{ step.step_name_display }}</span>
                <span v-if="step.contractor" class="contractor">承接方: {{ step.contractor }}</span>
                <el-tag 
                  :type="getStatusTagType(step.status)" 
                  size="small"
                >
                  {{ step.status_display }}
                </el-tag>
                <span class="operator">操作人: {{ step.operator_info?.username || '-' }}</span>
                <span v-if="step.start_time" class="time">
                  开始: {{ formatDateTime(step.start_time) }}
                </span>
                <span v-if="step.end_time" class="time">
                  结束: {{ formatDateTime(step.end_time) }}
                </span>
              </div>
              <div class="step-actions">
                <el-button 
                  v-if="step.status === 'pending'"
                  link 
                  type="primary" 
                  @click="handleStartStep(step)"
                >
                  开始
                </el-button>
                <el-button 
                  v-if="step.status === 'in_progress'"
                  link 
                  type="success" 
                  @click="handleCompleteStep(step)"
                >
                  完成
                </el-button>
                <el-button link type="primary" @click="handleEditStep(step)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteStep(step)">删除</el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 步骤表单对话框 -->
      <step-form
        ref="stepFormRef"
        :order-id="route.params.id"
        @success="getOrderDetail"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { getOrder, deleteStep, updateStepStatus } from '@/api/production'
import StepForm from '@/components/production/StepForm.vue'

const route = useRoute()
const router = useRouter()
const orderInfo = ref({})
const orderSteps = ref([])
const stepFormRef = ref(null)

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

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return ''
  return datetime.replace('T', ' ').substring(0, 16)
}

// 编辑任务
const handleEdit = () => {
  router.push(`/production/orders/edit/${route.params.id}`)
}

// 添加步骤
const handleAddStep = () => {
  stepFormRef.value?.open()
}

// 编辑步骤
const handleEditStep = (step) => {
  stepFormRef.value?.open(step)
}

// 删除步骤
const handleDeleteStep = (step) => {
  ElMessageBox.confirm(
    '确认删除该步骤吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteStep(step.id)
      ElMessage.success('删除成功')
      getOrderDetail()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 开始步骤
const handleStartStep = async (step) => {
  try {
    await updateStepStatus(step.id, 'in_progress')
    ElMessage.success('已开始执行')
    getOrderDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 完成步骤
const handleCompleteStep = async (step) => {
  try {
    await updateStepStatus(step.id, 'completed')
    ElMessage.success('已标记完成')
    getOrderDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  }
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

  .el-descriptions {
    :deep(.el-descriptions__body) {
      .el-descriptions__table {
        .el-descriptions__cell {
          padding: 16px;
        }
      }
    }
    
    .priority-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .sort-priority {
        color: #909399;
        font-size: 13px;
      }
    }
    
    .product-info {
      div {
        line-height: 1.5;
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

    .timeline-item {
      :deep(.el-timeline-item__node) {
        margin-top: 12px;
      }
      
      .step-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f5f7fa;
        padding: 8px 16px;
        border-radius: 4px;
        
        .step-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .step-sequence {
            font-size: 14px;
            color: #909399;
            background-color: #f0f2f5;
            padding: 2px 8px;
            border-radius: 12px;
            min-width: 32px;
            text-align: center;
          }
          
          .step-name {
            font-weight: bold;
            min-width: 80px;
          }
          
          .operator {
            color: #606266;
          }
          
          .contractor {
            color: #606266;
          }
          
          .time {
            color: #909399;
            font-size: 13px;
          }
        }
        
        .step-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}
</style> 