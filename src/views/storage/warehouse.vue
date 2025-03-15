<template>
  <div class="warehouse-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>仓库管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="仓库编码">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入仓库编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="仓库名称">
          <el-input
            v-model="queryParams.warehouse_name"
            placeholder="请输入仓库名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
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
        :data="warehouseList"
        style="width: 100%"
      >
        <el-table-column prop="warehouse_code" label="仓库编码" width="120" />
        <el-table-column prop="warehouse_name" label="仓库名称" width="150" />
        <el-table-column prop="location" label="仓库地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="管理员" width="120">
          <template #default="{ row }">
            {{ row.manager_info?.username }}
          </template>
        </el-table-column>
        <el-table-column prop="contact_phone" label="联系电话" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'">
              {{ row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewInventory(row)">
              <el-icon><List /></el-icon>库存
            </el-button>
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

    <!-- 库存汇总对话框 -->
    <el-dialog
      v-model="inventoryDialogVisible"
      :title="currentWarehouse ? `${currentWarehouse.warehouse_name} - 库存汇总` : '库存汇总'"
      width="800px"
    >
      <el-table
        v-loading="inventoryLoading"
        :data="inventorySummary"
        style="width: 100%"
      >
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.product_info?.name }}</div>
            <div class="sub-text">{{ row.product_info?.code }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="total_quantity" label="总数量" width="120" />
        <el-table-column label="总金额" width="150">
          <template #default="{ row }">
            ¥ {{ row.total_value?.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, List } from '@element-plus/icons-vue'
import { getWarehouseList, getWarehouseInventorySummary } from '@/api/storage'

// 查询参数
const queryParams = ref({
  search: '',
  warehouse_name: '',
  status: '',
  page: 1,
  page_size: 10
})

// 数据列表
const warehouseList = ref([])
const total = ref(0)
const loading = ref(false)

// 库存汇总相关
const inventoryDialogVisible = ref(false)
const inventoryLoading = ref(false)
const inventorySummary = ref([])
const currentWarehouse = ref(null)

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getWarehouseList(queryParams.value)
    warehouseList.value = results
    total.value = count
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    ElMessage.error('获取仓库列表失败')
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
    warehouse_name: '',
    status: '',
    page: 1,
    page_size: 10
  }
  handleQuery()
}

// 查看库存汇总
const handleViewInventory = async (row) => {
  currentWarehouse.value = row
  inventoryDialogVisible.value = true
  inventoryLoading.value = true
  try {
    const data = await getWarehouseInventorySummary(row.id)
    inventorySummary.value = data
  } catch (error) {
    console.error('获取库存汇总失败:', error)
    ElMessage.error('获取库存汇总失败')
  } finally {
    inventoryLoading.value = false
  }
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
})
</script>

<style lang="scss" scoped>
.warehouse-container {
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