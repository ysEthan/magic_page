<template>
  <div class="sku-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>SKU管理</span>
          <el-button type="primary" @click="handleAdd">新增SKU</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="SKU名称">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入SKU名称/编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="所属SPU">
          <el-select v-model="queryParams.spu" placeholder="请选择SPU" clearable>
            <el-option
              v-for="spu in spuOptions"
              :key="spu.id"
              :label="`${spu.code} - ${spu.name}`"
              :value="spu.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="材质">
          <el-input
            v-model="queryParams.material"
            placeholder="请输入材质"
            clearable
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-input
            v-model="queryParams.color"
            placeholder="请输入颜色"
            clearable
          />
        </el-form-item>
        <el-form-item label="电镀工艺">
          <el-select v-model="queryParams.plating_process" placeholder="请选择工艺" clearable>
            <el-option
              v-for="item in platingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.is_reviewed" placeholder="请选择状态" clearable>
            <el-option label="已审核" :value="true" />
            <el-option label="未审核" :value="false" />
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
        :data="skuList"
        style="width: 100%"
      >
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.main_image"
              :src="row.main_image"
              :preview-src-list="[row.main_image]"
              style="width: 50px; height: 50px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="SKU信息" width="150">
          <template #default="{ row }">
            <div class="sku-info">
              <div class="sku-code">{{ row.code }}</div>
              <div class="sku-name" :title="row.name">{{ row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属SPU" width="150">
          <template #default="{ row }">
            <div class="spu-info">
              <div class="spu-code">{{ getSPUCode(row.spu) }}</div>
              <div class="spu-name" :title="getSPUName(row.spu)">{{ getSPUName(row.spu) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="180">
          <template #default="{ row }">
            <div class="spec-info">
              <div class="spec-item">
                <span class="label">材质：</span>
                <span class="value">{{ row.material }}</span>
              </div>
              <div class="spec-item">
                <span class="label">颜色：</span>
                <span class="value">{{ row.color }}</span>
              </div>
              <div class="spec-item">
                <span class="label">电镀：</span>
                <span class="value">{{ getPlatingLabel(row.plating_process) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(g)" width="100" />
        <el-table-column prop="is_reviewed" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_reviewed ? 'success' : 'warning'">
              {{ row.is_reviewed ? '已审核' : '未审核' }}
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
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.is_reviewed ? 'warning' : 'success'"
              link
              @click="handleReview(row)"
            >
              {{ row.is_reviewed ? '取消审核' : '审核' }}
            </el-button>
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
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="skuFormRef"
        :model="skuForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SKU编码" prop="code">
              <el-input v-model="skuForm.code" placeholder="请输入SKU编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SKU名称" prop="name">
              <el-input v-model="skuForm.name" placeholder="请输入SKU名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属SPU" prop="spu">
              <el-select v-model="skuForm.spu" placeholder="请选择SPU">
                <el-option
                  v-for="spu in spuOptions"
                  :key="spu.id"
                  :label="`${spu.code} - ${spu.name}`"
                  :value="spu.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电镀工艺" prop="plating_process">
              <el-select v-model="skuForm.plating_process" placeholder="请选择电镀工艺">
                <el-option
                  v-for="item in platingOptions"
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
            <el-form-item label="材质" prop="material">
              <el-input v-model="skuForm.material" placeholder="请输入材质" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="color">
              <el-input v-model="skuForm.color" placeholder="请输入颜色" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="重量(g)" prop="weight">
              <el-input-number v-model="skuForm.weight" :precision="2" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="长(mm)" prop="length">
              <el-input-number v-model="skuForm.length" :precision="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽(mm)" prop="width">
              <el-input-number v-model="skuForm.width" :precision="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="高(mm)" prop="height">
              <el-input-number v-model="skuForm.height" :precision="0" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="其他尺寸" prop="other_dimensions">
              <el-input v-model="skuForm.other_dimensions" placeholder="请输入其他尺寸信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="表面处理" prop="surface_treatment">
          <el-input v-model="skuForm.surface_treatment" placeholder="请输入表面处理工艺" />
        </el-form-item>

        <el-form-item label="供应商列表" prop="suppliers_list">
          <el-input
            v-model="skuForm.suppliers_list"
            type="textarea"
            placeholder="请输入供应商列表"
          />
        </el-form-item>

        <el-form-item label="主图" prop="main_image">
          <el-input v-model="skuForm.main_image" placeholder="请输入主图URL" />
        </el-form-item>

        <el-form-item label="图片列表" prop="images">
          <el-input
            v-model="skuForm.images"
            type="textarea"
            placeholder="请输入图片URL列表，每行一个"
            @input="handleImagesInput"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="skuForm.is_active" />
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
  getSKUList,
  createSKU,
  updateSKU,
  deleteSKU,
  toggleSKUReview,
  getSPUList
} from '@/api/product'

// 常量定义
const platingOptions = [
  { value: 'none', label: '无电镀' },
  { value: '18k_gold', label: '18K金' },
  { value: '18k_silver', label: '18K银' }
]

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const skuList = ref([])
const spuOptions = ref([])
const total = ref(0)
const skuFormRef = ref()

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 10,
  search: '',
  spu: '',
  material: '',
  color: '',
  plating_process: '',
  is_reviewed: '',
  is_active: ''
})

// 表单数据
const skuForm = reactive({
  code: '',
  name: '',
  spu: null,
  material: '',
  color: '',
  plating_process: 'none',
  surface_treatment: '',
  weight: null,
  length: null,
  width: null,
  height: null,
  other_dimensions: '',
  suppliers_list: '',
  main_image: '',
  images: [],
  is_active: true
})

// 表单校验规则
const rules = {
  code: [
    { required: true, message: '请输入SKU编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入SKU名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  spu: [
    { required: true, message: '请选择所属SPU', trigger: 'change' }
  ],
  material: [
    { required: true, message: '请输入材质', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请输入颜色', trigger: 'blur' }
  ]
}

// 工具函数
const getPlatingLabel = (value) => {
  const option = platingOptions.find(item => item.value === value)
  return option ? option.label : value
}

const getSPUName = (id) => {
  const spu = spuOptions.value.find(spu => spu.id === id)
  return spu ? spu.name : '-'
}

const getSPUCode = (id) => {
  const spu = spuOptions.value.find(spu => spu.id === id)
  return spu ? spu.code : '-'
}

const handleImagesInput = (value) => {
  if (typeof value === 'string') {
    skuForm.images = value.split('\n').filter(url => url.trim())
  }
}

// 获取SKU列表
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getSKUList(queryParams)
    skuList.value = results
    total.value = count
  } catch (error) {
    ElMessage.error('获取SKU列表失败')
  } finally {
    loading.value = false
  }
}

// 获取SPU选项
const getSPUOptions = async () => {
  try {
    const { results } = await getSPUList({ 
      is_active: true,
      page_size: 1000  // 获取更多SPU选项
    })
    spuOptions.value = results
  } catch (error) {
    ElMessage.error('获取SPU选项失败')
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
  queryParams.spu = ''
  queryParams.material = ''
  queryParams.color = ''
  queryParams.plating_process = ''
  queryParams.is_reviewed = ''
  queryParams.is_active = ''
  handleQuery()
}

// 新增SKU
const handleAdd = () => {
  dialogTitle.value = '新增SKU'
  dialogVisible.value = true
}

// 编辑SKU
const handleEdit = (row) => {
  dialogTitle.value = '编辑SKU'
  Object.assign(skuForm, {
    ...row,
    images: Array.isArray(row.images) ? row.images.join('\n') : ''
  })
  dialogVisible.value = true
}

// 删除SKU
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该SKU吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSKU(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 审核/取消审核
const handleReview = async (row) => {
  try {
    await toggleSKUReview(row.id)
    row.is_reviewed = !row.is_reviewed
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  await skuFormRef.value.validate()
  
  try {
    const submitData = {
      ...skuForm,
      images: typeof skuForm.images === 'string' ? 
        skuForm.images.split('\n').filter(url => url.trim()) : 
        skuForm.images
    }

    if (skuForm.id) {
      await updateSKU(skuForm.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createSKU(submitData)
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
  skuFormRef.value?.resetFields()
  Object.assign(skuForm, {
    code: '',
    name: '',
    spu: null,
    material: '',
    color: '',
    plating_process: 'none',
    surface_treatment: '',
    weight: null,
    length: null,
    width: null,
    height: null,
    other_dimensions: '',
    suppliers_list: '',
    main_image: '',
    images: [],
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
  getSPUOptions()
})
</script>

<style lang="scss" scoped>
.sku-container {
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

  .sku-info,
  .spu-info {
    .sku-code,
    .spu-code {
      font-weight: bold;
      margin-bottom: 4px;
      font-size: 13px;
    }
    
    .sku-name,
    .spu-name {
      color: #666;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 130px;
    }
  }

  .spec-info {
    .spec-item {
      line-height: 1.5;
      font-size: 13px;
      
      .label {
        color: #909399;
        margin-right: 4px;
      }
      
      .value {
        color: #606266;
      }
    }
  }
}
</style> 