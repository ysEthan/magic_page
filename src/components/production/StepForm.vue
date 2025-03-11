<template>
  <el-dialog
    :title="form.id ? '编辑步骤' : '添加步骤'"
    v-model="dialogVisible"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="step-form"
    >
      <div class="form-row">
        <el-form-item label="步骤名称" prop="step_name" class="form-col">
          <el-select v-model="form.step_name" placeholder="请选择步骤名称">
            <el-option
              v-for="item in stepNameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="步骤顺序" prop="sequence" class="form-col">
          <el-input-number v-model="form.sequence" :min="1" />
        </el-form-item>
      </div>
      
      <div class="form-row">
        <el-form-item label="操作员" prop="operator" class="form-col">
          <el-select v-model="form.operator" placeholder="请选择操作员">
            <el-option
              v-for="item in operatorOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="计划耗时" prop="planned_duration" class="form-col">
          <el-input-number 
            v-model="form.planned_duration_hours" 
            :min="0"
            :precision="1"
            :step="0.5"
            style="width: 100%"
          >
            <template #append>小时</template>
          </el-input-number>
        </el-form-item>
      </div>
      
      <div class="form-row">
        <el-form-item label="开始时间" prop="start_time" class="form-col">
          <el-date-picker
            v-model="form.start_time"
            type="datetime"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status" class="form-col">
          <el-select 
            v-model="form.status" 
            placeholder="请选择状态"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
      
      <div class="form-row">
        <el-form-item label="承接方" prop="contractor" class="form-col-full">
          <el-input v-model="form.contractor" placeholder="请输入承接方" />
        </el-form-item>
      </div>
      
      <div class="form-row">
        <el-form-item label="步骤描述" prop="description" class="form-col-full">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入步骤描述"
          />
        </el-form-item>
      </div>
    </el-form>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createStep, updateStep } from '@/api/production'
import { getUserList } from '@/api/auth'

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const formRef = ref(null)
const operatorOptions = ref([])

// 步骤名称选项
const stepNameOptions = [
  { label: '3D建模', value: '3d_modeling' },
  { label: '模型打印', value: 'model_printing' },
  { label: '铸造', value: 'casting' },
  { label: '电镀', value: 'plating' },
  { label: '后处理', value: 'post_processing' }
]

// 状态选项
const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 表单数据
const form = ref({
  order: null,
  step_name: '',
  sequence: 1,
  operator: null,
  contractor: '',
  planned_duration_hours: 0,
  description: '',
  start_time: '',
  status: 'pending'
})

// 表单校验规则
const rules = {
  step_name: [{ 
    required: true, 
    message: '请选择步骤名称', 
    trigger: 'change' 
  }],
  sequence: [{ 
    required: true, 
    message: '请输入步骤顺序', 
    trigger: 'blur' 
  }],
  operator: [{ 
    required: true, 
    message: '请选择操作员', 
    trigger: 'change' 
  }],
  planned_duration_hours: [{ 
    required: true, 
    message: '请输入计划耗时', 
    trigger: 'blur' 
  }],
  status: [{ 
    required: true, 
    message: '请选择状态', 
    trigger: 'change' 
  }]
}

// 获取操作员列表
const getOperators = async () => {
  try {
    const { results } = await getUserList()
    operatorOptions.value = results.map(user => ({
      id: user.id,
      username: user.username,
      name: `${user.first_name} ${user.last_name}`.trim() || user.username
    }))
  } catch (error) {
    console.error('获取操作员列表失败:', error)
    ElMessage.error('获取操作员列表失败')
  }
}

// 打开对话框
const open = async (data = {}) => {
  dialogVisible.value = true
  if (operatorOptions.value.length === 0) {
    await getOperators()
  }
  form.value = {
    id: data.id || null,
    order: props.orderId,
    step_name: data.step_name || '',
    sequence: data.sequence || 1,
    operator: data.operator || null,
    contractor: data.contractor || '',
    planned_duration_hours: data.planned_duration ? 
      data.planned_duration.split(':')[0] : 0,
    description: data.description || '',
    start_time: data.start_time || '',
    status: data.status || 'pending'
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          ...form.value,
          planned_duration: `${form.value.planned_duration_hours}:00:00`
        }
        
        if (form.value.id) {
          await updateStep(form.value.id, submitData)
        } else {
          await createStep(submitData)
        }
        
        ElMessage.success(form.value.id ? '更新成功' : '添加成功')
        dialogVisible.value = false
        emit('success')
      } catch (error) {
        // 处理错误响应
        const errorData = error.response?.data
        const statusCode = error.response?.status

        // 处理后端验证错误 (400)
        if (statusCode === 400) {
          let errorMessage = ''
          
          // 处理字段错误
          if (errorData && typeof errorData === 'object') {
            const fieldErrors = []
            const fieldMap = {
              step_name: '步骤名称',
              sequence: '步骤顺序',
              operator: '操作员',
              planned_duration: '计划耗时',
              contractor: '承接方',
              description: '步骤描述'
            }
            
            // 处理非字段错误
            if (errorData.non_field_errors) {
              const nonFieldError = errorData.non_field_errors[0]
              if (nonFieldError.includes('order, sequence')) {
                errorMessage = `步骤顺序 ${form.value.sequence} 已存在，请使用其他顺序值`
              } else {
                fieldErrors.push(nonFieldError)
              }
            }
            
            // 处理字段错误
            Object.entries(errorData).forEach(([field, errors]) => {
              if (field !== 'non_field_errors') {
                const fieldName = fieldMap[field] || field
                const errorText = Array.isArray(errors) ? errors.join(', ') : errors
                fieldErrors.push(`${fieldName}: ${errorText}`)
              }
            })
            
            if (!errorMessage && fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('\n')
            }
          }
          
          if (errorMessage) {
            ElMessage.error(errorMessage)
            return
          }
        }
        
        // 处理其他状态码
        if (statusCode === 401) {
          ElMessage.error('请重新登录')
          return
        }
        
        if (statusCode === 403) {
          ElMessage.error('您没有权限执行此操作')
          return
        }
        
        if (statusCode === 404) {
          ElMessage.error('资源不存在')
          return
        }
        
        if (statusCode === 500) {
          ElMessage.error('服务器错误，请稍后重试')
          return
        }
        
        // 默认错误信息
        ElMessage.error(errorData?.detail || '操作失败，请重试')
      }
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

onMounted(() => {
  getOperators()
})

defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.step-form {
  .form-row {
    display: flex;
    margin: 0 -10px;
    
    .form-col {
      flex: 1;
      padding: 0 10px;
      
      :deep(.el-select),
      :deep(.el-input),
      :deep(.el-input-number) {
        width: 100%;
      }
    }
    
    .form-col-full {
      flex: 0 0 100%;
      padding: 0 10px;
    }
  }
}
</style> 