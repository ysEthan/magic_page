<template>
  <div class="stock-in-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>入库记录</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="入库单号">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入入库单号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="queryParams.warehouse"
            placeholder="请选择仓库"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.warehouse_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库类型">
          <el-select
            v-model="queryParams.stock_in_type"
            placeholder="请选择类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in stockInTypeOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库时间">
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
        :data="stockInList"
        style="width: 100%"
      >
        <el-table-column prop="stock_in_code" label="入库单号" width="150" />
        <el-table-column label="仓库信息" width="180">
          <template #default="{ row }">
            <div>{{ row.warehouse_info?.warehouse_name }}</div>
            <div class="sub-text">{{ row.warehouse_info?.warehouse_code }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.product_info?.name }}</div>
            <div class="sub-text">{{ row.product_info?.code }}</div>
          </template>
        </el-table-column>
        <el-table-column label="入库类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.stock_in_type_display }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="入库数量" width="100" />
        <el-table-column label="单位成本" width="120">
          <template #default="{ row }">
            ¥ {{ row.unit_cost }}
          </template>
        </el-table-column>
        <el-table-column label="总金额" width="120">
          <template #default="{ row }">
            ¥ {{ (row.quantity * row.unit_cost).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="source_order" label="来源单号" width="150" show-overflow-tooltip />
        <el-table-column label="操作人" width="120">
          <template #default="{ row }">
            {{ row.operator_info?.username }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="入库时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.stock_in_time) }}
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getStockInList } from '@/api/storage'
import { getWarehouseList } from '@/api/storage'

// 入库类型选项
const stockInTypeOptions = {
  'purchase': '采购入库',
  'return': '退货入库',
  'transfer': '调拨入库',
  'other': '其他入库'
}

// 查询参数
const queryParams = ref({
  search: '',
  warehouse: '',
  stock_in_type: '',
  min_stock_in_time: '',
  max_stock_in_time: '',
  page: 1,
  page_size: 10
})

// 日期范围
const dateRange = ref([])

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    queryParams.value.min_stock_in_time = newVal[0]
    queryParams.value.max_stock_in_time = newVal[1]
  } else {
    queryParams.value.min_stock_in_time = ''
    queryParams.value.max_stock_in_time = ''
  }
})

// 仓库选项
const warehouseOptions = ref([])

// 获取仓库列表
const getWarehouses = async () => {
  try {
    const { results } = await getWarehouseList({ status: true, page_size: 100 })
    warehouseOptions.value = results
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  }
}

// 数据列表
const stockInList = ref([])
const total = ref(0)
const loading = ref(false)

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getStockInList(queryParams.value)
    stockInList.value = results
    total.value = count
  } catch (error) {
    console.error('获取入库记录失败:', error)
    ElMessage.error('获取入库记录失败')
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
    warehouse: '',
    stock_in_type: '',
    min_stock_in_time: '',
    max_stock_in_time: '',
    page: 1,
    page_size: 10
  }
  dateRange.value = []
  handleQuery()
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
  getWarehouses()
})
</script>

<style lang="scss" scoped>
.stock-in-container {
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