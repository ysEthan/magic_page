<template>
  <div class="orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>销售订单</span>
          <el-button type="primary" @click="handleAdd">新建订单</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="订单编号">
          <el-input
            v-model="queryParams.order_number"
            placeholder="请输入订单编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="平台订单号">
          <el-input
            v-model="queryParams.platform_order_number"
            placeholder="请输入平台订单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="店铺">
          <el-select
            v-model="queryParams.shop"
            placeholder="请选择店铺"
            clearable
            filterable
          >
            <el-option
              v-for="item in shopOptions"
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
        <el-form-item label="订单类型">
          <el-select
            v-model="queryParams.order_type"
            placeholder="请选择类型"
            clearable
          >
            <el-option
              v-for="(label, value) in orderTypeOptions"
              :key="value"
              :label="label"
              :value="value"
            />
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
        <el-table-column type="selection" width="55" />
        <el-table-column prop="order_number" label="订单编号" width="150">
          <template #default="{ row }">
            <el-button 
              link 
              type="primary" 
              @click="handleView(row)"
            >
              {{ row.order_number }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="platform_order_number" label="平台订单号" width="150" />
        <el-table-column label="店铺信息" width="180">
          <template #default="{ row }">
            <div>{{ row.shop_info?.name }}</div>
            <div class="sub-text">{{ row.shop_info?.platform_display }}</div>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status_display }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.payment_status ? 'success' : 'warning'">
              {{ row.payment_status ? '已支付' : '未支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="150">
          <template #default="{ row }">
            <div>{{ row.currency }} {{ row.total_amount }}</div>
            <div class="sub-text">运费：{{ row.shipping_fee }}</div>
          </template>
        </el-table-column>
        <el-table-column label="收货信息" width="200">
          <template #default="{ row }">
            <div>{{ row.shipping_contact }}</div>
            <div class="sub-text">{{ row.shipping_phone }}</div>
            <div class="sub-text">{{ row.shipping_address }}</div>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.order_place_time) }}
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
                  <el-dropdown-item @click="handleUpdatePayment(row)">
                    <el-icon><Wallet /></el-icon>更新支付状态
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

    <!-- 支付状态更新对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="更新支付状态"
      width="400px"
    >
      <el-form>
        <el-form-item label="支付状态">
          <el-switch
            v-model="selectedPaymentStatus"
            :active-text="selectedPaymentStatus ? '已支付' : '未支付'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdatePayment">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, SetUp, CaretBottom, Wallet } from '@element-plus/icons-vue'
import { 
  getOrderList, 
  getShopList,
  updateOrderStatus, 
  updateOrderPayment,
  deleteOrder 
} from '@/api/trade'

const router = useRouter()

// 订单状态选项
const orderStatusOptions = {
  unpaid: '未支付',
  pending: '待处理',
  picking: '配货中',
  shipped: '已发货',
  cancelled: '已取消'
}

// 订单类型选项
const orderTypeOptions = {
  platform: '平台订单',
  influencer: '达人订单',
  offline: '线下订单',
  requisition: '员工领用',
  employee: '员工自购'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    unpaid: 'warning',
    pending: 'info',
    picking: 'primary',
    shipped: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 查询参数
const queryParams = reactive({
  order_number: '',
  platform_order_number: '',
  shop: '',
  status: '',
  order_type: '',
  payment_status: '',
  order_place_time_min: '',
  order_place_time_max: '',
  page: 1,
  page_size: 10
})

// 日期范围
const dateRange = ref([])

// 监听日期范围变化
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    queryParams.order_place_time_min = val[0]
    queryParams.order_place_time_max = val[1]
  } else {
    queryParams.order_place_time_min = ''
    queryParams.order_place_time_max = ''
  }
})

// 数据列表
const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const shopOptions = ref([])

// 获取订单列表
const getList = async () => {
  loading.value = true
  try {
    const { results, count } = await getOrderList(queryParams)
    orderList.value = results
    total.value = count
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取店铺选项
const getShopOptions = async () => {
  try {
    const { results } = await getShopList({ status: 1 })
    shopOptions.value = results
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    ElMessage.error('获取店铺列表失败')
  }
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryParams, {
    order_number: '',
    platform_order_number: '',
    shop: '',
    status: '',
    order_type: '',
    payment_status: '',
    order_place_time_min: '',
    order_place_time_max: '',
    page: 1,
    page_size: 10
  })
  dateRange.value = []
  handleQuery()
}

// 查看订单
const handleView = (row) => {
  router.push(`/trade/orders/${row.id}`)
}

// 新增订单
const handleAdd = () => {
  router.push('/trade/orders/create')
}

// 编辑订单
const handleEdit = (row) => {
  router.push(`/trade/orders/${row.id}/edit`)
}

// 状态更新相关
const statusDialogVisible = ref(false)
const selectedStatus = ref('')
const currentRow = ref(null)

const handleUpdateStatus = (row) => {
  currentRow.value = row
  selectedStatus.value = row.status
  statusDialogVisible.value = true
}

const confirmUpdateStatus = async () => {
  try {
    await updateOrderStatus(currentRow.value.id, { status: selectedStatus.value })
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    getList()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('状态更新失败')
  }
}

// 支付状态更新相关
const paymentDialogVisible = ref(false)
const selectedPaymentStatus = ref(false)

const handleUpdatePayment = (row) => {
  currentRow.value = row
  selectedPaymentStatus.value = row.payment_status
  paymentDialogVisible.value = true
}

const confirmUpdatePayment = async () => {
  try {
    await updateOrderPayment(currentRow.value.id, { 
      payment_status: selectedPaymentStatus.value 
    })
    ElMessage.success('支付状态更新成功')
    paymentDialogVisible.value = false
    getList()
  } catch (error) {
    console.error('更新支付状态失败:', error)
    ElMessage.error('支付状态更新失败')
  }
}

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该订单吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除订单失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  queryParams.page_size = val
  getList()
}

// 页码改变
const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return date.toLocaleString()
}

onMounted(() => {
  getList()
  getShopOptions()
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
}
</style> 