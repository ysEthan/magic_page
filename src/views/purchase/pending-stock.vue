<template>
  <div class="app-container">
    <el-card class="search-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="采购单号" prop="order_number">
          <el-input
            v-model="queryParams.order_number"
            placeholder="请输入采购单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-select
            v-model="queryParams.supplier"
            placeholder="请选择供应商"
            clearable
            filterable
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="product_name">
          <el-input
            v-model="queryParams.product_name"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="SKU" prop="sku">
          <el-input
            v-model="queryParams.sku"
            placeholder="请输入SKU"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="入库状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待入库" value="pending">
              <el-tag size="small" type="warning">待入库</el-tag>
            </el-option>
            <el-option label="部分入库" value="partial">
              <el-tag size="small" type="info">部分入库</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预计到货日期">
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
    </el-card>

    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="pendingList"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="order_number"
          label="采购单号"
          min-width="120"
        >
          <template #default="{ row }">
            <el-link type="primary" @click="viewOrder(row.order_id)">
              {{ row.order_number }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="supplier_name"
          label="供应商"
          min-width="120"
        />
        <el-table-column
          label="商品图片"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.product_image"
              :src="row.product_image"
              :preview-src-list="[row.product_image]"
              fit="contain"
              style="width: 50px; height: 50px"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          prop="sku"
          label="产品编码"
          min-width="120"
        />
        <el-table-column
          prop="ordered_quantity"
          label="订购数量"
          min-width="100"
          align="right"
        />
        <el-table-column
          prop="received_quantity"
          label="已入库数量"
          min-width="100"
          align="right"
        />
        <el-table-column
          prop="pending_quantity"
          label="待入库数量"
          min-width="100"
          align="right"
        />
        <el-table-column
          prop="unit_price"
          label="单价"
          min-width="100"
          align="right"
        >
          <template #default="{ row }">
            ¥{{ row.unit_price }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_amount"
          label="总金额"
          min-width="100"
          align="right"
        >
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column
          prop="expected_date"
          label="预计到货日期"
          min-width="120"
        />
        <el-table-column
          label="状态"
          min-width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'warning' : 'info'">
              {{ row.status === 'pending' ? '待入库' : '部分入库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="row.pending_quantity > 0"
              type="primary"
              link
              @click="handleStockIn(row)"
            >
              入库
            </el-button>
            <el-button
              type="primary"
              link
              @click="viewOrder(row.order_id)"
            >
              查看订单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[10, 20, 50, 100, 999]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Picture } from '@element-plus/icons-vue'
import { getPendingStorageList } from '@/api/purchase'
import { getSupplierList } from '@/api/purchase'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const queryForm = ref(null)
const supplierOptions = ref([])
const dateRange = ref([])

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 999,
  order_number: '',
  supplier: undefined,
  product_name: '',
  sku: '',
  status: '',
  ordering: 'expected_date'
})

// 计算属性：处理日期范围
const computedParams = computed(() => {
  const params = { ...queryParams }
  if (dateRange.value && dateRange.value.length === 2) {
    params.expected_date_start = dateRange.value[0]
    params.expected_date_end = dateRange.value[1]
  }
  
  // 移除空值参数
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === undefined || params[key] === null) {
      delete params[key]
    }
  })
  
  return params
})

// 待入库列表
const pendingList = ref([])

// 获取供应商选项
const getSupplierOptions = async () => {
  try {
    const { results } = await getSupplierList({ 
      page_size: 100,
      is_active: true 
    })
    supplierOptions.value = results
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    ElMessage.error('获取供应商列表失败')
  }
}

// 获取待入库列表
const getList = async () => {
  loading.value = true
  try {
    const params = computedParams.value
    console.log('查询参数:', params) // 添加日志
    const { results, count } = await getPendingStorageList(params)
    pendingList.value = results
    total.value = count
  } catch (error) {
    console.error('获取待入库列表失败:', error)
    if (error.response?.data) {
      ElMessage.error(error.response.data.detail || '获取待入库列表失败')
    } else {
      ElMessage.error('获取待入库列表失败')
    }
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
  dateRange.value = []
  queryForm.value?.resetFields()
  handleQuery()
}

// 处理入库
const handleStockIn = (row) => {
  router.push(`/storage/stock-in?order_id=${row.order_id}&item_id=${row.id}`)
}

// 查看订单
const viewOrder = (order_id) => {
  router.push(`/purchase/orders/${order_id}`)
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

onMounted(() => {
  getSupplierOptions()
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  .search-container {
    margin-bottom: 20px;
  }
  
  .table-container {
    margin-bottom: 20px;
  }

  .sub-text {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 