<template>
  <div class="orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>生产任务</span>
          <el-button type="primary" @click="handleAdd">新建任务</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="任务编号">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入任务编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="queryParams.order_type" placeholder="请选择类型" clearable>
            <el-option label="试产" value="trial" />
            <el-option label="量产" value="mass" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable>
            <el-option label="紧急" :value="0" />
            <el-option label="高" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="低" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
        :data="orderList"
        style="width: 100%"
      >
        <el-table-column prop="code" label="任务编号" width="120" />
        <el-table-column prop="description" label="任务描述" width="140" show-overflow-tooltip />
        <el-table-column label="优先级" width="120">
          <template #default="{ row }">
            <div class="priority-info">
              <el-tag size="small" :type="getPriorityType(row.priority)">
                {{ row.priority_display }}
              </el-tag>
              <span class="priority-order">({{ row.priority_order }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="150">
          <template #default="{ row }">
            <div class="property-info">
              <div class="property-item">
                <span class="label">类型：</span>
                <el-tag size="small" :type="row.order_type === 'trial' ? 'warning' : 'success'">
                  {{ row.order_type_display }}
                </el-tag>
              </div>
              <div class="property-item">
                <span class="label">状态：</span>
                <el-tag size="small" :type="getStatusType(row.status)">
                  {{ row.status_display }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="产品信息" width="180">
          <template #default="{ row }">
            <template v-if="row.product_info">
              <div>编码：{{ row.product_info.code }}</div>
              <div>名称：{{ row.product_info.name }}</div>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="计划数量" width="100" />
        <el-table-column label="计划日期" width="200">
          <template #default="{ row }">
            <div>开始：{{ row.planned_start_date }}</div>
            <div>结束：{{ row.planned_end_date }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button link>
                更多<el-icon class="el-icon--right"><CaretBottom /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push(`/production/orders/${row.id}`)">
                    <el-icon><View /></el-icon>查看详情
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleUpdateStatus(row)">
                    <el-icon><SetUp /></el-icon>更新状态
                  </el-dropdown-item>
                  <el-dropdown-item divided type="danger" @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="orderFormRef"
        :model="orderForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务编号" prop="code">
              <el-input v-model="orderForm.code" placeholder="请输入任务编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品" prop="product">
              <el-select
                v-model="orderForm.product"
                placeholder="请选择产品"
                filterable
                remote
                :remote-method="handleProductSearch"
                :loading="productLoading"
              >
                <el-option
                  v-for="item in productOptions"
                  :key="item.id"
                  :label="`${item.code} - ${item.name}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="order_type">
              <el-select v-model="orderForm.order_type" placeholder="请选择类型">
                <el-option label="试产" value="trial" />
                <el-option label="量产" value="mass" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="orderForm.priority" placeholder="请选择优先级">
                <el-option label="紧急" :value="0" />
                <el-option label="高" :value="1" />
                <el-option label="中" :value="2" />
                <el-option label="低" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划数量" prop="quantity">
              <el-input-number
                v-model="orderForm.quantity"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产主管" prop="manager">
              <el-select
                v-model="orderForm.manager"
                placeholder="请选择主管"
                filterable
              >
                <el-option
                  v-for="item in managerOptions"
                  :key="item.id"
                  :label="item.username"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="planned_start_date">
              <el-date-picker
                v-model="orderForm.planned_start_date"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="planned_end_date">
              <el-date-picker
                v-model="orderForm.planned_end_date"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序优先级" prop="priority_order">
              <el-input-number
                v-model="orderForm.priority_order"
                :min="0"
                :max="999"
                placeholder="请输入排序优先级"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="技术要求" prop="technical_requirements">
          <el-input
            v-model="orderForm.technical_requirements"
            type="textarea"
            rows="3"
            placeholder="请输入技术要求"
          />
        </el-form-item>
        
        <el-form-item label="质量要求" prop="quality_requirements">
          <el-input
            v-model="orderForm.quality_requirements"
            type="textarea"
            rows="3"
            placeholder="请输入质量要求"
          />
        </el-form-item>
        
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="orderForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入任务描述"
          />
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
import { CaretBottom, View, Edit, SetUp, Delete } from '@element-plus/icons-vue'
import { getOrderList, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '@/api/production'
import { getSKUList } from '@/api/product'
import { getUserList } from '@/api/auth'
import { useUserStore } from '@/stores/user'

// 查询参数
const queryParams = ref({
  search: '',
  order_type: '',
  priority: '',
  status: '',
  page: 1,
  page_size: 10,
  ordering: 'priority,-priority_order'  // 先按优先级升序（紧急->低），再按排序优先级倒序
})

// 数据列表
const orderList = ref([])
const total = ref(0)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const orderFormRef = ref()

// 表单数据
const orderForm = ref({
  code: '',
  product: null,
  order_type: 'mass',
  quantity: 1,
  priority: 2,
  priority_order: 0,
  manager: null,
  planned_start_date: '',
  planned_end_date: '',
  technical_requirements: null,
  quality_requirements: null,
  description: null
})

// 表单校验规则
const rules = {
  code: [
    { required: true, message: '请输入任务编号', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  order_type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入计划数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
    { type: 'number', message: '优先级必须是数字', trigger: 'change' }
  ],
  priority_order: [
    { required: true, message: '请输入排序优先级', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序优先级必须大于等于0', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请选择生产主管', trigger: 'change' }
  ],
  planned_start_date: [
    { required: true, message: '请选择计划开始日期', trigger: 'change' }
  ],
  planned_end_date: [
    { required: true, message: '请选择计划结束日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (orderForm.value.planned_start_date && value && value < orderForm.value.planned_start_date) {
          callback(new Error('结束日期不能早于开始日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 产品选项相关
const productOptions = ref([])
const productLoading = ref(false)

// 主管选项
const managerOptions = ref([])

// 获取优先级标签类型
const getPriorityType = (priority) => {
  const types = {
    0: 'danger',
    1: 'warning',
    2: 'primary',
    3: 'info'
  }
  return types[priority] || 'info'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    pending: 'info',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const { count, results } = await getOrderList(queryParams.value)
    orderList.value = results
    total.value = count
  } catch (error) {
    ElMessage.error('获取生产任务列表失败')
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
  queryParams.value.search = ''
  queryParams.value.order_type = ''
  queryParams.value.priority = ''
  queryParams.value.status = ''
  handleQuery()
}

// 更新状态
const handleUpdateStatus = (row) => {
  ElMessageBox.prompt('请选择新状态', '更新状态', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'select',
    inputValue: row.status,
    inputPlaceholder: '请选择状态',
    inputPattern: /^(pending|in_progress|completed|cancelled)$/,
    inputErrorMessage: '无效的状态',
    inputOptions: [
      { label: '待处理', value: 'pending' },
      { label: '进行中', value: 'in_progress' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' }
    ]
  }).then(async ({ value }) => {
    try {
      await updateOrderStatus(row.id, value)
      ElMessage.success('状态更新成功')
      getList()
    } catch (error) {
      ElMessage.error('状态更新失败')
    }
  })
}

// 删除操作
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该生产任务吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
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

// 搜索产品
const handleProductSearch = async (query) => {
  if (query) {
    productLoading.value = true
    try {
      const { results } = await getSKUList({ search: query, is_active: true })
      productOptions.value = results
    } catch (error) {
      ElMessage.error('获取产品列表失败')
    } finally {
      productLoading.value = false
    }
  }
}

// 获取主管列表
const getManagerOptions = async () => {
  try {
    const { results } = await getUserList({
      page_size: 100,  // 获取足够多的用户
      is_active: true  // 只获取启用的用户
    })
    managerOptions.value = results
  } catch (error) {
    ElMessage.error('获取主管列表失败')
  }
}

// 新增任务
const handleAdd = () => {
  dialogTitle.value = '新建任务'
  dialogVisible.value = true
}

// 编辑任务
const handleEdit = (row) => {
  dialogTitle.value = '编辑任务'
  Object.assign(orderForm.value, row)
  dialogVisible.value = true
}

// 获取用户store
const userStore = useUserStore()

// 提交表单
const handleSubmit = async () => {
  try {
    await orderFormRef.value.validate()
    
    // 格式化日期
    const formData = {
      ...orderForm.value,
      planned_start_date: orderForm.value.planned_start_date ? new Date(orderForm.value.planned_start_date).toISOString().split('T')[0] : null,
      planned_end_date: orderForm.value.planned_end_date ? new Date(orderForm.value.planned_end_date).toISOString().split('T')[0] : null,
      created_at: new Date().toISOString(),
      created_by: userStore.userInfo.id
    }
    
    console.log('提交的表单数据:', formData)
    
    if (orderForm.value.id) {
      await updateOrder(orderForm.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createOrder(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.response?.data) {
      // 显示详细的后端验证错误
      const errorMsg = typeof error.response.data === 'object' 
        ? Object.values(error.response.data).flat().join('\n')
        : error.response.data
      ElMessage.error(errorMsg)
    } else {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  orderFormRef.value?.resetFields()
  Object.assign(orderForm.value, {
    code: '',
    product: null,
    order_type: 'mass',
    quantity: 1,
    priority: 2,
    priority_order: 0,
    manager: null,
    planned_start_date: '',
    planned_end_date: '',
    technical_requirements: null,
    quality_requirements: null,
    description: null
  })
}

onMounted(() => {
  getList()
  getManagerOptions()
})
</script>

<style lang="scss" scoped>
.orders-container {
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

  .priority-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .priority-order {
      color: #909399;
      font-size: 13px;
    }
  }

  .property-info {
    .property-item {
      line-height: 1.8;
      font-size: 13px;
      
      .label {
        color: #909399;
        margin-right: 4px;
      }
      
      .el-tag {
        margin-left: 2px;
      }
    }
  }
}
</style> 