<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="中文名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入物流商中文名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="物流商代码" prop="code">
          <el-input
            v-model="queryParams.code"
            placeholder="请输入物流商代码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact">
          <el-input
            v-model="queryParams.contact"
            placeholder="请输入联系电话"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="carrierList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="name_zh" label="中文名称" min-width="120" />
        <el-table-column prop="name_en" label="英文名称" min-width="120" />
        <el-table-column prop="code" label="物流商代码" min-width="100" />
        <el-table-column prop="contact" label="联系电话" min-width="120" />
        <el-table-column prop="url" label="官网地址" min-width="150">
          <template #default="scope">
            <el-link v-if="scope.row.url" type="primary" :href="scope.row.url" target="_blank">
              {{ scope.row.url }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="carrierFormRef"
        :model="carrierForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="中文名称" prop="name_zh">
          <el-input v-model="carrierForm.name_zh" placeholder="请输入中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="name_en">
          <el-input v-model="carrierForm.name_en" placeholder="请输入英文名称" />
        </el-form-item>
        <el-form-item label="物流商代码" prop="code">
          <el-input v-model="carrierForm.code" placeholder="请输入物流商代码" />
        </el-form-item>
        <el-form-item label="官网地址" prop="url">
          <el-input v-model="carrierForm.url" placeholder="请输入官网地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact">
          <el-input v-model="carrierForm.contact" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="查询代码" prop="query_key">
          <el-input v-model="carrierForm.query_key" placeholder="请输入查询代码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCarrierList, createCarrier, updateCarrier, deleteCarrier } from '@/api/logistics'
import { formatDateTime } from '@/utils/format'

// 查询参数
const queryParams = reactive({
  page: 1,
  page_size: 10,
  name: '',
  code: '',
  contact: ''
})

// 数据列表
const carrierList = ref([])
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialog = reactive({
  visible: false,
  title: '',
  type: 'add' // add or edit
})

// 表单对象
const carrierForm = reactive({
  id: undefined,
  name_zh: '',
  name_en: '',
  code: '',
  url: '',
  contact: '',
  query_key: null
})

// 表单校验规则
const rules = {
  name_zh: [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
  name_en: [{ required: true, message: '请输入英文名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入物流商代码', trigger: 'blur' }]
}

// 表单引用
const carrierFormRef = ref(null)
const queryForm = ref(null)

// 获取数据列表
const getList = async () => {
  loading.value = true
  try {
    const response = await getCarrierList(queryParams)
    carrierList.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('获取物流商列表失败:', error)
    ElMessage.error('获取物流商列表失败')
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
  queryForm.value?.resetFields()
  handleQuery()
}

// 新增物流商
const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '新增物流商'
  dialog.visible = true
  Object.assign(carrierForm, {
    id: undefined,
    name_zh: '',
    name_en: '',
    code: '',
    url: '',
    contact: '',
    query_key: null
  })
}

// 编辑物流商
const handleEdit = (row) => {
  dialog.type = 'edit'
  dialog.title = '编辑物流商'
  dialog.visible = true
  Object.assign(carrierForm, { ...row })
}

// 删除物流商
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该物流商吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCarrier(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除物流商失败:', error)
      ElMessage.error('删除物流商失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  carrierFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        if (dialog.type === 'add') {
          await createCarrier(carrierForm)
          ElMessage.success('新增成功')
        } else {
          await updateCarrier(carrierForm.id, carrierForm)
          ElMessage.success('更新成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存物流商失败:', error)
        ElMessage.error('保存物流商失败')
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  carrierFormRef.value?.resetFields()
}

// 分页相关
const handleSizeChange = (val) => {
  queryParams.page_size = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style> 