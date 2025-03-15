<template>
  <div class="orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>采购订单</span>
          <el-button type="primary" @click="handleAdd">新建订单</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form" size="default">
        <el-form-item label="订单编号">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入订单编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select
            v-model="queryParams.supplier"
            placeholder="请选择供应商"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select 
            v-model="queryParams.status" 
            placeholder="请选择状态" 
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in orderStatusOptions"
              :key="value"
              :label="label"
              :value="value"
            >
              <el-tag :type="getStatusType(value)">{{ label }}</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="orderList"
        style="width: 100%"
      >
        <el-table-column prop="order_number" label="订单编号" width="150">
          <template #default="{ row }">
            <el-button 
              link 
              type="primary" 
              @click="$router.push(`/purchase/orders/${row.id}`)"
            >
              {{ row.order_number }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="供应商信息" width="200">
          <template #default="{ row }">
            <div>{{ row.supplier_info?.name }}</div>
            <div class="sub-text">{{ row.supplier_info?.contact_person }}</div>
            <div class="sub-text">{{ row.supplier_info?.contact_phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_display }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="120">
          <template #default="{ row }">
            ¥ {{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column label="交付日期" width="240">
          <template #default="{ row }">
            <div class="date-info">
              <div>预计: {{ row.expected_delivery_date || '-' }}</div>
              <div>实际: {{ row.actual_delivery_date || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="采购员" width="120">
          <template #default="{ row }">
            {{ row.purchaser_info?.last_name || row.purchaser_info?.username }}
          </template>
        </el-table-column>
        <el-table-column prop="tracking_number" label="物流单号" width="150" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-dropdown>
              <el-button link type="primary">
                更多<el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleUpdateStatus(row)">
                    <el-icon><SetUp /></el-icon>更新状态
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
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

    <!-- 状态更新对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新状态"
      width="400px"
    >
      <el-form>
        <el-form-item label="选择状态">
          <el-select v-model="selectedStatus" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="(label, value) in orderStatusOptions"
              :key="value"
              :label="label"
              :value="value"
            >
              <el-tag :type="getStatusType(value)">{{ label }}</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateStatus">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, SetUp, CaretBottom } from '@element-plus/icons-vue'
import { getOrderList, updateOrderStatus, deleteOrder } from '@/api/purchase'
import { getSupplierList } from '@/api/purchase'

const router = useRouter()

// 订单状态选项
const orderStatusOptions = {
  draft: '草稿',
  pending_order: '待下单',
  submitted: '已提交',
  approved: '已审核',
  pending_payment: '待支付',
  processing: '处理中',
  pending_storage: '待入库',
  completed: '已完成',
  cancelled: '已取消'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    draft: 'info',
    pending_order: 'warning',
    submitted: 'primary',
    approved: 'success',
    pending_payment: 'danger',
    processing: 'primary',
    pending_storage: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 查询参数
const queryParams = ref({
  search: '',
  supplier: '',
  status: '',
  min_order_time: '',
  max_order_time: '',
  page: 1,
  page_size: 10
})

// 日期范围
const dateRange = ref([])

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    queryParams.value.min_order_time = newVal[0]
    queryParams.value.max_order_time = newVal[1]
  } else {
    queryParams.value.min_order_time = ''
    queryParams.value.max_order_time = ''
  }
})

// 供应商选项
const supplierOptions = ref([])

// 获取供应商列表
const getSuppliers = async () => {
  try {
    const { results } = await getSupplierList({ status: true, page_size: 100 })
    supplierOptions.value = results
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  }
}

// 数据列表
const orderList = ref([])
const total = ref(0)
const loading = ref(false)

// 状态更新相关
const statusDialogVisible = ref(false)
const selectedStatus = ref('')
const currentRow = ref(null)

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getOrderList(queryParams.value)
    orderList.value = results
    total.value = count
  } catch (error) {
    ElMessage.error('获取采购订单列表失败')
  } finally {
    loading.value = false
  }
}

// 查询操作
const handleQuery = () => {
  queryParams.value.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    search: '',
    supplier: '',
    status: '',
    min_order_time: '',
    max_order_time: '',
    page: 1,
    page_size: 10
  }
  dateRange.value = []
  handleQuery()
}

// 新增订单
const handleAdd = () => {
  // 暂时禁用跳转功能
  ElMessage.info('功能开发中...')
  // router.push('/purchase/orders/create')
}

// 编辑订单
const handleEdit = (row) => {
  // 暂时禁用跳转功能
  ElMessage.info('功能开发中...')
  // router.push(`/purchase/orders/${row.id}/edit`)
}

// 更新状态
const handleUpdateStatus = (row) => {
  currentRow.value = row
  selectedStatus.value = row.status
  statusDialogVisible.value = true
}

// 确认更新状态
const confirmUpdateStatus = async () => {
  try {
    await updateOrderStatus(currentRow.value.id, { status: selectedStatus.value })
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    getList()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该采购订单吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 分页操作
const handleSizeChange = (val) => {
  queryParams.value.page_size = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.value.page = val
  getList()
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString()
}

onMounted(() => {
  getList()
  getSuppliers()
})
</script>

<style lang="scss" scoped>
.orders-container {
  .search-form {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .sub-text {
    font-size: 13px;
    color: #909399;
    line-height: 1.5;
  }

  .date-info {
    line-height: 1.5;
    
    div {
      &:first-child {
        margin-bottom: 4px;
      }
    }
  }
}
</style> 