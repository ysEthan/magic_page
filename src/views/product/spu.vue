<template>
  <div class="spu-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SPU管理</span>
          <el-button type="primary" @click="handleAdd">新增SPU</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="SPU名称">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入SPU名称/编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="queryParams.product_type" placeholder="请选择类型" clearable>
            <el-option
              v-for="item in productTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生产工艺">
          <el-select v-model="queryParams.production_process" placeholder="请选择工艺" clearable>
            <el-option
              v-for="item in processOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="queryParams.brand" placeholder="请选择品牌" clearable>
            <el-option
              v-for="brand in brandOptions"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
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
        :data="spuList"
        style="width: 100%"
      >
        <el-table-column prop="code" label="SPU编码" width="120" />
        <el-table-column prop="name" label="SPU名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="product_type" label="产品类型" width="120">
          <template #default="{ row }">
            {{ getProductTypeLabel(row.product_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="production_process" label="生产工艺" width="120">
          <template #default="{ row }">
            {{ getProcessLabel(row.production_process) }}
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="120">
          <template #default="{ row }">
            {{ getBrandName(row.brand) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryName(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
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
      width="650px"
      @close="resetForm"
    >
      <el-form
        ref="spuFormRef"
        :model="spuForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SPU编码" prop="code">
              <el-input v-model="spuForm.code" placeholder="请输入SPU编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SPU名称" prop="name">
              <el-input v-model="spuForm.name" placeholder="请输入SPU名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品类型" prop="product_type">
              <el-select v-model="spuForm.product_type" placeholder="请选择产品类型">
                <el-option
                  v-for="item in productTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产工艺" prop="production_process">
              <el-select v-model="spuForm.production_process" placeholder="请选择生产工艺">
                <el-option
                  v-for="item in processOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-select v-model="spuForm.brand" placeholder="请选择品牌">
                <el-option
                  v-for="brand in brandOptions"
                  :key="brand.id"
                  :label="brand.name"
                  :value="brand.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-cascader
                v-model="spuForm.category"
                :options="categoryOptions"
                :props="{
                  checkStrictly: true,
                  label: 'name',
                  value: 'id',
                  emitPath: false
                }"
                placeholder="请选择分类"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="销售渠道" prop="sales_channel">
          <el-input v-model="spuForm.sales_channel" placeholder="请输入销售渠道" />
        </el-form-item>

        <el-form-item label="设计元素" prop="design_elements">
          <el-input v-model="spuForm.design_elements" placeholder="请输入设计元素" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="spuForm.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="spuForm.is_active" />
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
  getSPUList,
  createSPU,
  updateSPU,
  deleteSPU,
  toggleSPUActive,
  getBrandList,
  getAllCategories
} from '@/api/product'

// 产品类型选项
const productTypeOptions = [
  { value: 'math_design', label: '设计款' },
  { value: 'ready_made', label: '现货款' },
  { value: 'raw_material', label: '材料' },
  { value: 'packing_material', label: '包材' }
]

// 生产工艺选项
const processOptions = [
  { value: 'metal', label: '金属类' },
  { value: 'resin', label: '树脂类' },
  { value: 'plush', label: '毛绒类' },
  { value: 'plastic', label: '塑料类' }
]

// 查询参数
const queryParams = reactive({
  search: '',
  product_type: '',
  production_process: '',
  brand: '',
  is_active: '',
  page: 1,
  page_size: 10
})

// SPU列表数据
const spuList = ref([])
const total = ref(0)
const loading = ref(false)
const brandOptions = ref([])
const categoryOptions = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const spuFormRef = ref()
const spuForm = reactive({
  code: '',
  name: '',
  product_type: '',
  production_process: '',
  brand: null,
  category: null,
  sales_channel: '',
  design_elements: '',
  remark: '',
  is_active: true
})

// 表单校验规则
const rules = {
  code: [
    { required: true, message: '请输入SPU编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入SPU名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  product_type: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ],
  brand: [
    { required: true, message: '请选择品牌', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 获取选项标签
const getProductTypeLabel = (value) => {
  const option = productTypeOptions.find(item => item.value === value)
  return option ? option.label : value
}

const getProcessLabel = (value) => {
  const option = processOptions.find(item => item.value === value)
  return option ? option.label : value
}

const getBrandName = (id) => {
  const brand = brandOptions.value.find(item => item.id === id)
  return brand ? brand.name : ''
}

const getCategoryName = (id) => {
  const findCategory = (categories) => {
    for (const category of categories) {
      if (category.id === id) return category.name
      if (category.children) {
        const name = findCategory(category.children)
        if (name) return name
      }
    }
    return ''
  }
  return findCategory(categoryOptions.value)
}

// 获取SPU列表
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getSPUList(queryParams)
    spuList.value = results
    total.value = count
  } catch (error) {
    ElMessage.error('获取SPU列表失败')
  } finally {
    loading.value = false
  }
}

// 获取品牌和分类选项
const getOptions = async () => {
  try {
    const [brandRes, categoryRes] = await Promise.all([
      getBrandList({ is_active: true }),
      getAllCategories()
    ])
    brandOptions.value = brandRes.results
    categoryOptions.value = categoryRes
  } catch (error) {
    ElMessage.error('获取选项数据失败')
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
  queryParams.product_type = ''
  queryParams.production_process = ''
  queryParams.brand = ''
  queryParams.is_active = ''
  handleQuery()
}

// 新增SPU
const handleAdd = () => {
  dialogTitle.value = '新增SPU'
  dialogVisible.value = true
}

// 编辑SPU
const handleEdit = (row) => {
  dialogTitle.value = '编辑SPU'
  Object.assign(spuForm, row)
  dialogVisible.value = true
}

// 删除SPU
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该SPU吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSPU(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 切换状态
const handleStatusChange = async (row) => {
  try {
    await toggleSPUActive(row.id)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.is_active = !row.is_active // 恢复状态
    ElMessage.error('状态更新失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  await spuFormRef.value.validate()
  
  try {
    if (spuForm.id) {
      await updateSPU(spuForm.id, spuForm)
      ElMessage.success('更新成功')
    } else {
      await createSPU(spuForm)
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
  spuFormRef.value?.resetFields()
  Object.assign(spuForm, {
    code: '',
    name: '',
    product_type: '',
    production_process: '',
    brand: null,
    category: null,
    sales_channel: '',
    design_elements: '',
    remark: '',
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
  getOptions()
})
</script>

<style lang="scss" scoped>
.spu-container {
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