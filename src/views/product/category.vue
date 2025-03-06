<template>
  <div class="category-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">新增分类</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="分类名称">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入分类名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="分类层级">
          <el-select v-model="queryParams.level" placeholder="请选择层级" clearable>
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        :data="categoryList"
        row-key="id"
        border
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="中文名称" min-width="200" />
        <el-table-column prop="name_en" label="英文名称" min-width="200" />
        <el-table-column prop="level" label="层级" width="100">
          <template #default="{ row }">
            {{ getLevelLabel(row.level) }}
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排序" width="80" />
        <el-table-column prop="is_last_level" label="是否末级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_last_level ? 'success' : 'info'">
              {{ row.is_last_level ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAdd(row)">新增子分类</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级分类">
          <el-cascader
            v-model="categoryForm.parent"
            :options="categoryOptions"
            :props="{
              checkStrictly: true,
              label: 'name',
              value: 'id',
              emitPath: false
            }"
            placeholder="请选择上级分类"
            clearable
          />
        </el-form-item>
        <el-form-item label="中文名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="name_en">
          <el-input v-model="categoryForm.name_en" placeholder="请输入英文名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="rank">
          <el-input-number v-model="categoryForm.rank" :min="0" />
        </el-form-item>
        <el-form-item label="是否末级">
          <el-switch v-model="categoryForm.is_last_level" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="categoryForm.is_active" />
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
import {
  getCategoryList,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/product'

// 分类层级选项
const levelOptions = [
  { value: 1, label: '一级分类' },
  { value: 2, label: '二级分类' },
  { value: 3, label: '三级分类' },
  { value: 4, label: '四级分类' },
  { value: 5, label: '五级分类' },
  { value: 6, label: '六级分类' },
  { value: 7, label: '七级分类' }
]

// 查询参数
const queryParams = reactive({
  search: '',
  level: '',
  is_active: ''
})

// 分类列表数据
const categoryList = ref([])
const categoryOptions = ref([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const categoryFormRef = ref()
const categoryForm = reactive({
  name: '',
  name_en: '',
  description: '',
  parent: null,
  rank: 0,
  level: 1,
  is_last_level: false,
  is_active: true
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入中文名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  name_en: [
    { required: true, message: '请输入英文名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ]
}

// 获取层级标签
const getLevelLabel = (level) => {
  const option = levelOptions.find(item => item.value === level)
  return option ? option.label : ''
}

// 获取分类列表
const getList = async () => {
  loading.value = true
  try {
    const { results } = await getCategoryList(queryParams)
    categoryList.value = results
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 获取所有分类（用于级联选择器）
const getAllCategoryOptions = async () => {
  try {
    const data = await getAllCategories()
    categoryOptions.value = data
  } catch (error) {
    ElMessage.error('获取分类选项失败')
  }
}

// 查询操作
const handleQuery = () => {
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.search = ''
  queryParams.level = ''
  queryParams.is_active = ''
  handleQuery()
}

// 新增分类
const handleAdd = (row = null) => {
  dialogTitle.value = row ? '新增子分类' : '新增分类'
  if (row) {
    categoryForm.parent = row.id
    categoryForm.level = row.level + 1
  }
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
  dialogTitle.value = '编辑分类'
  Object.assign(categoryForm, row)
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该分类吗？删除后将无法恢复！', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCategory(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  await categoryFormRef.value.validate()
  
  try {
    if (categoryForm.id) {
      await updateCategory(categoryForm.id, categoryForm)
      ElMessage.success('更新成功')
    } else {
      await createCategory(categoryForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
    getAllCategoryOptions() // 更新分类选项
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '操作失败')
  }
}

// 重置表单
const resetForm = () => {
  categoryFormRef.value?.resetFields()
  Object.assign(categoryForm, {
    name: '',
    name_en: '',
    description: '',
    parent: null,
    rank: 0,
    level: 1,
    is_last_level: false,
    is_active: true
  })
}

onMounted(() => {
  getList()
  getAllCategoryOptions()
})
</script>

<style lang="scss" scoped>
.category-container {
  .search-form {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style> 