<template>
  <div class="inventory-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouse" placeholder="请选择仓库" clearable>
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.warehouse_name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.product_name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="warehouse_name" label="仓库" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="sku_code" label="SKU编码" />
        <el-table-column prop="quantity" label="库存数量" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="updated_at" label="最后更新时间" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWarehouseList, getInventoryList } from '@/api/storage'

// 搜索表单数据
const searchForm = ref({
  warehouse: '',
  product_name: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const warehouseOptions = ref([])

// 获取仓库列表
const fetchWarehouseOptions = async () => {
  try {
    const res = await getWarehouseList()
    warehouseOptions.value = res.data.results || []
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  }
}

// 获取库存列表
const fetchInventoryList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      warehouse: searchForm.value.warehouse,
      product_name: searchForm.value.product_name
    }
    const res = await getInventoryList(params)
    tableData.value = res.data.results || []
    total.value = res.data.count || 0
  } catch (error) {
    console.error('获取库存列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchInventoryList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    warehouse: '',
    product_name: ''
  }
  currentPage.value = 1
  fetchInventoryList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchInventoryList()
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchInventoryList()
}

// 页面加载时获取数据
onMounted(() => {
  fetchWarehouseOptions()
  fetchInventoryList()
})
</script>

<style lang="scss" scoped>
.inventory-container {
  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 