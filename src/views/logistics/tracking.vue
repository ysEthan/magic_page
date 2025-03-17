<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="包裹编号" prop="package_id">
          <el-input
            v-model="queryParams.package_id"
            placeholder="请输入包裹编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="跟踪号" prop="tracking_no">
          <el-input
            v-model="queryParams.tracking_no"
            placeholder="请输入跟踪号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option
              v-for="(label, value) in packageStatus"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="date_range">
          <el-date-picker
            v-model="queryParams.date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增轨迹</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="trackingList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column label="包裹信息" min-width="200">
          <template #default="scope">
            <div>包裹编号：{{ scope.row.package_id }}</div>
            <div>跟踪号：{{ scope.row.tracking_no }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ packageStatus[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operator_name" label="操作人" min-width="100" />
        <el-table-column prop="tracking_time" label="轨迹时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.tracking_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
        ref="trackingFormRef"
        :model="trackingForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="包裹编号" prop="package_id" v-if="dialog.type === 'add'">
          <el-input v-model="trackingForm.package_id" placeholder="请输入包裹编号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="trackingForm.status" placeholder="请选择状态">
            <el-option
              v-for="(label, value) in packageStatus"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="trackingForm.location" placeholder="请输入当前位置" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="trackingForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入轨迹描述"
          />
        </el-form-item>
        <el-form-item label="轨迹时间" prop="tracking_time">
          <el-date-picker
            v-model="trackingForm.tracking_time"
            type="datetime"
            placeholder="请选择轨迹时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getTrackingList,
  createTracking,
  updateTracking,
  deleteTracking
} from '@/api/logistics'
import { formatDateTime } from '@/utils/format'

// 包裹状态
const packageStatus = {
  0: '待发货',
  1: '待揽收',
  2: '转运中',
  3: '已签收',
  4: '已取消'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'danger'
  }
  return types[status] || 'info'
}

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 10,
  package_id: '',
  tracking_no: '',
  status: null,
  date_range: []
})

// 监听日期范围变化
watch(() => queryParams.date_range, (newVal) => {
  if (newVal && newVal.length === 2) {
    queryParams.start_date = newVal[0]
    queryParams.end_date = newVal[1]
  } else {
    queryParams.start_date = undefined
    queryParams.end_date = undefined
  }
}, { deep: true })

// 数据列表
const trackingList = ref([])
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add' // add or edit
})

// 表单对象
const trackingForm = reactive({
  id: undefined,
  package_id: '',
  status: undefined,
  location: '',
  description: '',
  tracking_time: undefined
})

// 表单校验规则
const rules = {
  package_id: [{ required: true, message: '请输入包裹编号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  location: [{ required: true, message: '请输入当前位置', trigger: 'blur' }],
  description: [{ required: true, message: '请输入轨迹描述', trigger: 'blur' }],
  tracking_time: [{ required: true, message: '请选择轨迹时间', trigger: 'change' }]
}

// 表单引用
const trackingFormRef = ref(null)
const queryForm = ref(null)

// 获取数据列表
const getList = async () => {
  loading.value = true
  try {
    // 构造查询参数
    const params = { ...queryParams }
    delete params.date_range
    // 处理状态参数
    if (params.status === '') {
      params.status = null
    }
    if (queryParams.date_range && queryParams.date_range.length === 2) {
      params.start_date = queryParams.date_range[0]
      params.end_date = queryParams.date_range[1]
    }
    const response = await getTrackingList(params)
    trackingList.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('获取物流轨迹列表失败:', error)
    ElMessage.error('获取物流轨迹列表失败')
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
  queryParams.date_range = []
  queryParams.status = null
  handleQuery()
}

// 新增轨迹
const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增物流轨迹'
  dialog.visible = true
  Object.assign(trackingForm, {
    id: undefined,
    package_id: '',
    status: undefined,
    location: '',
    description: '',
    tracking_time: undefined
  })
}

// 编辑轨迹
const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑物流轨迹'
  dialog.visible = true
  Object.assign(trackingForm, { ...row })
}

// 删除轨迹
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该物流轨迹吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTracking(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除物流轨迹失败:', error)
      ElMessage.error('删除物流轨迹失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  trackingFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (dialog.type === 'add') {
          await createTracking(trackingForm)
          ElMessage.success('新增成功')
        } else {
          await updateTracking(trackingForm.id, trackingForm)
          ElMessage.success('更新成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存物流轨迹失败:', error)
        ElMessage.error('保存物流轨迹失败')
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  trackingFormRef.value?.resetFields()
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