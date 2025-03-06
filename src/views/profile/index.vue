<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border v-if="!isEditing">
        <el-descriptions-item label="用户名">
          {{ userInfo.username }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userInfo.email }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ userInfo.phone || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="部门">
          {{ userInfo.department || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="职位">
          {{ userInfo.position || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="isEditing = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo || {})
const isEditing = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  email: '',
  phone: '',
  department: '',
  position: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const handleEdit = () => {
  Object.assign(form, userInfo.value)
  isEditing.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    // TODO: 调用更新用户信息的API
    await userStore.updateProfile(form)
    ElMessage.success('更新成功')
    isEditing.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '更新失败')
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-form {
    max-width: 500px;
    margin: 20px auto;
  }
}
</style> 