<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="物流商" prop="carrier">
          <el-select
            v-model="queryParams.carrier"
            placeholder="请选择物流商"
            clearable
            filterable
          >
            <el-option
              v-for="item in carrierOptions"
              :key="item.id"
              :label="item.name_zh"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称" prop="service_name">
          <el-input
            v-model="queryParams.service_name"
            placeholder="请输入服务名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="服务代码" prop="service_code">
          <el-input
            v-model="queryParams.service_code"
            placeholder="请输入服务代码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="serviceList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="carrier_name" label="物流商" min-width="120" />
        <el-table-column prop="service_name" label="服务名称" min-width="120" />
        <el-table-column prop="service_code" label="服务代码" min-width="100" />
        <el-table-column prop="service_type" label="服务类型" min-width="100">
          <template #default="scope">
            {{ formatServiceType(scope.row.service_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="serviceFormRef"
        :model="serviceForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="物流商" prop="carrier">
          <el-select
            v-model="serviceForm.carrier"
            placeholder="请选择物流商"
            filterable
          >
            <el-option
              v-for="item in carrierOptions"
              :key="item.id"
              :label="item.name_zh"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称" prop="service_name">
          <el-input v-model="serviceForm.service_name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务代码" prop="service_code">
          <el-input v-model="serviceForm.service_code" placeholder="请输入服务代码" />
        </el-form-item>
        <el-form-item label="服务类型" prop="service_type">
          <el-select v-model="serviceForm.service_type" placeholder="请选择服务类型">
            <el-option
              v-for="(label, value) in serviceTypes"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getServiceList, createService, updateService, deleteService } from '@/api/logistics'
import { getCarrierList } from '@/api/logistics'
import { formatDateTime } from '@/utils/format'

// 服务类型选项
const serviceTypes = {
  1: '国际快递',
  2: '国内快递',
  3: '海运',
  4: '空运',
  5: '铁路运输',
  6: '公路运输'
}

// 格式化服务类型
const formatServiceType = (type) => {
  return serviceTypes[type] || '未知类型'
}

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 10,
  carrier: undefined,
  service_name: '',
  service_code: ''
})

// 数据列表
const serviceList = ref([])
const total = ref(0)
const loading = ref(false)
const carrierOptions = ref([])

// 对话框相关
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add' // add or edit
})

// 表单对象
const serviceForm = reactive({
  id: undefined,
  carrier: undefined,
  service_name: '',
  service_code: '',
  service_type: undefined
})

// 表单校验规则
const rules = {
  carrier: [{ required: true, message: '请选择物流商', trigger: 'change' }],
  service_name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  service_code: [{ required: true, message: '请输入服务代码', trigger: 'blur' }],
  service_type: [{ required: true, message: '请选择服务类型', trigger: 'change' }]
}

// 表单引用
const serviceFormRef = ref(null)
const queryForm = ref(null)

// 获取物流商选项
const getCarrierOptions = async () => {
  try {
    const response = await getCarrierList({ page_size: 100 })
    carrierOptions.value = response.results
  } catch (error) {
    console.error('获取物流商列表失败:', error)
    ElMessage.error('获取物流商列表失败')
  }
}

// 获取数据列表
const getList = async () => {
  loading.value = true
  try {
    const response = await getServiceList(queryParams)
    serviceList.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('获取物流服务列表失败:', error)
    ElMessage.error('获取物流服务列表失败')
  } finally {
    loading.value = false
  }
}

// 查询操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryForm.value?.resetFields()
  handleQuery()
}

// 新增物流服务
const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增物流服务'
  dialog.visible = true
  Object.assign(serviceForm, {
    id: undefined,
    carrier: undefined,
    service_name: '',
    service_code: '',
    service_type: undefined
  })
}

// 编辑物流服务
const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑物流服务'
  dialog.visible = true
  Object.assign(serviceForm, { ...row })
}

// 删除物流服务
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该物流服务吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteService(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除物流服务失败:', error)
      ElMessage.error('删除物流服务失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  serviceFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (dialog.type === 'add') {
          await createService(serviceForm)
          ElMessage.success('新增成功')
        } else {
          await updateService(serviceForm.id, serviceForm)
          ElMessage.success('更新成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存物流服务失败:', error)
        ElMessage.error('保存物流服务失败')
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  serviceFormRef.value?.resetFields()
}

// 分页相关
const handleSizeChange = (val) => {
  queryParams.page_size = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

// 初始化
onMounted(() => {
  getCarrierOptions()
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style> 