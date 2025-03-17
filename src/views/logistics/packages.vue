<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="订单编号" prop="order_number">
          <el-input
            v-model="queryParams.order_number"
            placeholder="请输入订单编号"
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
        <el-form-item label="包裹状态" prop="pkg_status_code">
          <el-select v-model="queryParams.pkg_status_code" placeholder="请选择状态" clearable>
            <el-option
              v-for="(label, value) in packageStatus"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
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
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="packageList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column label="订单信息" min-width="200">
          <template #default="scope">
            <div>订单号：{{ scope.row.order_info?.order_number }}</div>
            <div>店铺：{{ scope.row.order_info?.shop_name }}</div>
            <div>金额：{{ scope.row.order_info?.total_amount }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="tracking_no" label="跟踪号" min-width="120" />
        <el-table-column prop="pkg_status_code" label="包裹状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.pkg_status_code)">
              {{ packageStatus[scope.row.pkg_status_code] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物流信息" min-width="180">
          <template #default="scope">
            <div>物流商：{{ scope.row.carrier_name }}</div>
            <div>服务：{{ scope.row.service_name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="包裹尺寸" min-width="180">
          <template #default="scope">
            <div>尺寸：{{ formatSize(scope.row) }}</div>
            <div>重量：{{ scope.row.weight }}kg</div>
            <div>体积重：{{ scope.row.volume_weight }}kg</div>
          </template>
        </el-table-column>
        <el-table-column label="费用信息" min-width="150">
          <template #default="scope">
            <div>预估费用：{{ scope.row.estimated_logistics_cost }}</div>
            <div>实际费用：{{ scope.row.carrier_cost || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdateStatus(scope.row)">更新状态</el-button>
            <el-button type="primary" link @click="handleViewTracking(scope.row)">查看轨迹</el-button>
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

    <!-- 更新状态对话框 -->
    <el-dialog
      title="更新包裹状态"
      v-model="statusDialog.visible"
      width="500px"
    >
      <el-form
        ref="statusForm"
        :model="statusForm"
        :rules="statusRules"
        label-width="100px"
      >
        <el-form-item label="当前状态">
          <el-tag :type="getStatusType(currentPackage?.pkg_status_code)">
            {{ packageStatus[currentPackage?.pkg_status_code] }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" prop="status">
          <el-select v-model="statusForm.status" placeholder="请选择新状态">
            <el-option
              v-for="status in getAvailableStatus(currentPackage?.pkg_status_code)"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前位置" prop="location">
          <el-input v-model="statusForm.location" placeholder="请输入当前位置" />
        </el-form-item>
        <el-form-item label="状态描述" prop="description">
          <el-input
            v-model="statusForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入状态描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="statusDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleStatusSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 物流轨迹对话框 -->
    <el-dialog
      :title="'包裹轨迹 - ' + currentPackage?.tracking_no"
      v-model="trackingDialog.visible"
      width="680px"
    >
      <el-timeline>
        <el-timeline-item
          v-for="item in trackingList"
          :key="item.id"
          :timestamp="formatDateTime(item.tracking_time)"
          :type="getTrackingType(item.status)"
        >
          <h4>{{ packageStatus[item.status] }}</h4>
          <p>{{ item.description }}</p>
          <p>位置：{{ item.location }}</p>
          <p>操作人：{{ item.operator_name }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getPackageList,
  getPackageDetail,
  updatePackageStatus,
  getTrackingList
} from '@/api/logistics'
import { getCarrierList } from '@/api/logistics'
import { formatDateTime } from '@/utils/format'

// 包裹状态
const packageStatus = {
  '0': '待发货',
  '1': '待揽收',
  '2': '转运中',
  '3': '已签收',
  '4': '已取消'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '0': 'info',
    '1': 'warning',
    '2': 'primary',
    '3': 'success',
    '4': 'danger'
  }
  return types[status] || 'info'
}

// 获取轨迹类型
const getTrackingType = (status) => {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'danger'
  }
  return types[status] || 'info'
}

// 格式化包裹尺寸
const formatSize = (row) => {
  if (row.length && row.width && row.height) {
    return `${row.length}×${row.width}×${row.height}cm`
  }
  return '-'
}

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 10,
  order_number: '',
  tracking_no: '',
  pkg_status_code: '',
  carrier: undefined
})

// 数据列表
const packageList = ref([])
const total = ref(0)
const loading = ref(false)
const carrierOptions = ref([])

// 当前选中的包裹
const currentPackage = ref(null)

// 状态更新对话框
const statusDialog = reactive({
  visible: false
})

// 状态表单
const statusForm = reactive({
  status: '',
  location: '',
  description: ''
})

// 状态表单校验规则
const statusRules = {
  status: [{ required: true, message: '请选择新状态', trigger: 'change' }],
  location: [{ required: true, message: '请输入当前位置', trigger: 'blur' }],
  description: [{ required: true, message: '请输入状态描述', trigger: 'blur' }]
}

// 轨迹对话框
const trackingDialog = reactive({
  visible: false
})

// 轨迹列表
const trackingList = ref([])

// 获取可用的状态选项
const getAvailableStatus = (currentStatus) => {
  const validTransitions = {
    '0': ['1', '4'],  // 待发货 -> 待揽收/已取消
    '1': ['2', '4'],  // 待揽收 -> 转运中/已取消
    '2': ['3', '4'],  // 转运中 -> 已签收/已取消
    '3': [],          // 已签收 -> 不可变更
    '4': []           // 已取消 -> 不可变更
  }

  const availableStatus = validTransitions[currentStatus] || []
  return availableStatus.map(status => ({
    value: status,
    label: packageStatus[status]
  }))
}

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
    const response = await getPackageList(queryParams)
    packageList.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('获取包裹列表失败:', error)
    ElMessage.error('获取包裹列表失败')
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

// 更新包裹状态
const handleUpdateStatus = (row) => {
  currentPackage.value = row
  statusDialog.visible = true
  Object.assign(statusForm, {
    status: '',
    location: '',
    description: ''
  })
}

// 提交状态更新
const handleStatusSubmit = async () => {
  statusForm.value?.validate(async (valid) => {
    if (valid) {
      try {
        await updatePackageStatus(currentPackage.value.id, statusForm)
        ElMessage.success('状态更新成功')
        statusDialog.visible = false
        getList()
      } catch (error) {
        console.error('更新包裹状态失败:', error)
        ElMessage.error('更新包裹状态失败')
      }
    }
  })
}

// 查看物流轨迹
const handleViewTracking = async (row) => {
  currentPackage.value = row
  trackingDialog.visible = true
  try {
    const response = await getTrackingList({ package_id: row.id })
    trackingList.value = response.results
  } catch (error) {
    console.error('获取物流轨迹失败:', error)
    ElMessage.error('获取物流轨迹失败')
  }
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

.el-timeline {
  max-height: 500px;
  overflow-y: auto;
}
</style> 