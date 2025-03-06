<template>
  <div class="brand-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>品牌管理</span>
          <el-button type="primary" @click="handleAdd">新增品牌</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="品牌名称">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入品牌名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.is_active" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="brandList"
        style="width: 100%"
      >
        <el-table-column prop="name" label="品牌名称" />
        <el-table-column prop="description" label="品牌描述" show-overflow-tooltip />
        <el-table-column prop="logo_url" label="品牌LOGO">
          <template #default="{ row }">
            <el-image
              v-if="row.logo_url"
              :src="row.logo_url"
              :preview-src-list="[row.logo_url]"
              style="width: 50px; height: 50px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="brandFormRef"
        :model="brandForm"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="brandForm.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌描述" prop="description">
          <el-input
            v-model="brandForm.description"
            type="textarea"
            placeholder="请输入品牌描述"
          />
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logo_url">
          <el-input v-model="brandForm.logo_url" placeholder="请输入品牌LOGO地址" />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="brandForm.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBrandList, createBrand, updateBrand, deleteBrand } from '@/api/product'

// 查询参数
const queryParams = reactive({
  search: '',
  is_active: '',
  page: 1,
  page_size: 10
})

// 品牌列表数据
const brandList = ref([])
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const brandFormRef = ref()
const brandForm = reactive({
  name: '',
  description: '',
  logo_url: '',
  is_active: true
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ]
}

// 获取品牌列表
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getBrandList(queryParams)
    brandList.value = results
    total.value = count
  } catch (error) {
    ElMessage.error('获取品牌列表失败')
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
  queryParams.search = ''
  queryParams.is_active = ''
  handleQuery()
}

// 新增品牌
const handleAdd = () => {
  dialogTitle.value = '新增品牌'
  dialogVisible.value = true
}

// 编辑品牌
const handleEdit = (row) => {
  dialogTitle.value = '编辑品牌'
  Object.assign(brandForm, row)
  dialogVisible.value = true
}

// 删除品牌
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该品牌吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteBrand(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  await brandFormRef.value.validate()
  
  try {
    if (brandForm.id) {
      await updateBrand(brandForm.id, brandForm)
      ElMessage.success('更新成功')
    } else {
      await createBrand(brandForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '操作失败')
  }
}

// 重置表单
const resetForm = () => {
  brandFormRef.value?.resetFields()
  Object.assign(brandForm, {
    name: '',
    description: '',
    logo_url: '',
    is_active: true
  })
}

// 分页操作
const handleSizeChange = (val) => {
  queryParams.page_size = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.brand-container {
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
}
</style> 