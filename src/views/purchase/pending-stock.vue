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
      <el-collapse>
        <el-collapse-item
          v-for="group in groupedPendingList"
          :key="group.order_number"
          class="order-item"
        >
          <template #title>
            <div class="order-header">
              <div class="header-left">
                <el-link type="primary" @click.stop="viewOrder(group.items[0].order_id)">
                  {{ group.order_number }}
                </el-link>
                <span class="supplier-name">{{ group.items[0].supplier_name }}</span>
              </div>
              <div class="header-center">
                <span class="quantity-info">
                  共 {{ group.items.length }} 个商品
                </span>
                <span class="total-info">
                  总金额：¥{{ calculateOrderTotal(group.items) }}
                </span>
              </div>
              <div class="header-right">
                <span class="date-info">预计到货：{{ group.items[0].expected_date }}</span>
              </div>
            </div>
          </template>

          <div class="items-list">
            <div 
              v-for="item in group.items" 
              :key="item.id"
              class="item-row"
            >
              <div class="item-info">
                <el-image
                  v-if="item.product_image"
                  :src="item.product_image"
                  :preview-src-list="[item.product_image]"
                  fit="contain"
                  class="product-image"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="product-info">
                  <div class="sku">{{ item.sku }}</div>
                  <div class="quantities">
                    <span class="quantity-item">订购：{{ item.quantity || 0 }}</span>
                    <span class="quantity-item">已入库：{{ item.received_quantity || 0 }}</span>
                    <span class="quantity-item">待入库：{{ item.pending_quantity || 0 }}</span>
                  </div>
                </div>
              </div>
              <div class="item-price">
                <div>¥{{ item.unit_price }}</div>
                <div class="total-amount">¥{{ item.total_amount }}</div>
              </div>
              <div class="item-status">
                <el-tag :type="item.status === 'pending' ? 'warning' : 'info'" size="small">
                  {{ item.status === 'pending' ? '待入库' : '部分入库' }}
                </el-tag>
                <el-button
                  v-if="item.pending_quantity > 0"
                  type="primary"
                  link
                  size="small"
                  @click="handleStockIn(item)"
                >
                  入库
                </el-button>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

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
    console.log('查询参数:', params)
    const { results, count } = await getPendingStorageList(params)
    console.log('获取到的数据:', results)
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

// 按采购单分组的数据
const groupedPendingList = computed(() => {
  const groups = {}
  pendingList.value.forEach(item => {
    if (!groups[item.order_number]) {
      groups[item.order_number] = {
        order_number: item.order_number,
        items: []
      }
    }
    groups[item.order_number].items.push(item)
  })
  return Object.values(groups)
})

// 计算采购单总金额
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => total + (Number(item.total_amount) || 0), 0).toFixed(2)
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

  :deep(.el-collapse) {
    --el-collapse-header-height: auto;
    border: none;
    background: transparent;
  }

  :deep(.el-collapse-item) {
    margin-bottom: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    background-color: var(--el-bg-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:last-child {
      margin-bottom: 0;
    }

    .el-collapse-item__header {
      padding: 12px 16px;
      border-bottom: none;
      background-color: var(--el-bg-color-page);
      border-radius: 4px 4px 0 0;

      &.is-active {
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }

    .el-collapse-item__content {
      padding: 8px;
      background-color: #fff;
      border-radius: 0 0 4px 4px;
    }

    .el-collapse-item__arrow {
      margin-right: 8px;
    }
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 200px;

      .el-link {
        font-size: 15px;
        font-weight: 500;
      }

      .supplier-name {
        color: #606266;
        font-size: 14px;
        background-color: var(--el-fill-color-light);
        padding: 2px 8px;
        border-radius: 2px;
      }
    }

    .header-center {
      flex: 1;
      display: flex;
      gap: 24px;
      color: #606266;
      font-size: 14px;

      .quantity-info {
        color: #909399;
        background-color: var(--el-fill-color-lighter);
        padding: 2px 8px;
        border-radius: 2px;
      }

      .total-info {
        font-weight: 500;
        color: var(--el-color-primary);
      }
    }

    .header-right {
      min-width: 200px;
      text-align: right;

      .date-info {
        color: #909399;
        font-size: 13px;
        background-color: var(--el-fill-color-lighter);
        padding: 2px 8px;
        border-radius: 2px;
      }
    }
  }

  .items-list {
    display: flex;
    flex-direction: column;
    background-color: #fff;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--el-fill-color-lighter);
    }
    
    &:last-child {
      border-bottom: none;
    }

    .item-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .product-image {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        border: 1px solid var(--el-border-color-lighter);
        padding: 2px;
      }

      .product-info {
        .sku {
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--el-text-color-primary);
        }

        .quantities {
          display: flex;
          gap: 12px;
          color: #606266;
          font-size: 13px;

          .quantity-item {
            background-color: var(--el-fill-color-lighter);
            padding: 1px 6px;
            border-radius: 2px;
          }
        }
      }
    }

    .item-price {
      text-align: right;
      margin-right: 16px;
      min-width: 90px;
      padding: 2px 8px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;

      .total-amount {
        color: var(--el-color-primary);
        font-size: 13px;
        margin-top: 2px;
        font-weight: 500;
      }
    }

    .item-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      min-width: 70px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 