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
      <el-form :inline="true" :model="queryParams" class="search-form" size="default">
        <el-form-item label="任务编号">
          <el-input
            v-model="queryParams.search"
            placeholder="请输入任务编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select 
            v-model="queryParams.order_type" 
            placeholder="请选择类型" 
            clearable
            style="width: 120px"
          >
            <el-option label="试产" value="trial">
              <el-tag size="small" type="warning">试产</el-tag>
            </el-option>
            <el-option label="量产" value="mass">
              <el-tag size="small" type="success">量产</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select 
            v-model="queryParams.priority" 
            placeholder="请选择优先级" 
            clearable
            style="width: 120px"
          >
            <el-option label="紧急" :value="0">
              <el-tag size="small" type="danger">紧急</el-tag>
            </el-option>
            <el-option label="高" :value="1">
              <el-tag size="small" type="warning">高</el-tag>
            </el-option>
            <el-option label="中" :value="2">
              <el-tag size="small" type="primary">中</el-tag>
            </el-option>
            <el-option label="低" :value="3">
              <el-tag size="small" type="info">低</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="queryParams.status" 
            placeholder="请选择状态" 
            clearable
            style="width: 120px"
          >
            <el-option label="待处理" value="pending">
              <el-tag size="small" type="info">待处理</el-tag>
            </el-option>
            <el-option label="进行中" value="in_progress">
              <el-tag size="small" type="primary">进行中</el-tag>
            </el-option>
            <el-option label="已完成" value="completed">
              <el-tag size="small" type="success">已完成</el-tag>
            </el-option>
            <el-option label="已取消" value="cancelled">
              <el-tag size="small" type="danger">已取消</el-tag>
            </el-option>
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
        :data="orderList"
        style="width: 100%"
      >
        <el-table-column label="主图" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.main_image_url"
              :src="row.main_image_url"
              :preview-src-list="[row.main_image_url]"
              fit="cover"
              class="table-image"
            />
            <el-icon v-else><Picture /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="编号" width="100">
          <template #default="{ row }">
            <span 
              class="order-code" 
              @click="$router.push(`/production/orders/${row.id}`)"
            >
              {{ row.code.slice(-4) }}
            </span>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="row.code"
              placement="top"
            >
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="任务描述" width="140" show-overflow-tooltip />
        <el-table-column label="任务类型" width="200">
          <template #default="{ row }">
            <div class="property-info">
              <div class="property-item">
                <div class="category-name">{{ row.category_info?.name || '-' }}</div>
                <div class="type-and-channel">
                  <el-tag
                    size="small"
                    :type="row.order_type === 'trial' ? 'warning' : 'success'"
                    class="type-tag"
                  >
                    {{ row.order_type_display }}
                  </el-tag>
                  <el-tag
                    v-if="row.channel_info"
                    size="small"
                    type="info"
                    class="channel-tag"
                  >
                    {{ row.channel_info.name }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
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
        <el-table-column label="生产主管" width="120">
          <template #default="{ row }">
            <span>{{ row.manager_info?.last_name || row.manager_info?.username || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品信息" width="180">
          <template #default="{ row }">
            <template v-if="row.product_info">
              <div>编码：{{ row.product_info.code }}</div>
              <div>名称：{{ row.product_info.name }}</div>
            </template>
            <span v-else class="pending-text">(待创建)</span>
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
      width="900px"
      @close="resetForm"
    >
      <el-form
        ref="orderFormRef"
        :model="orderForm"
        :rules="rules"
        label-width="100px"
        class="order-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="任务编号" prop="code">
                <el-input
                  v-model="orderForm.code"
                  disabled
                  placeholder="系统自动生成"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产类目" prop="category">
                <el-select
                  v-model="orderForm.category"
                  placeholder="请选择生产类目"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in categoryOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="来源渠道" prop="channel">
                <el-select
                  v-model="orderForm.channel"
                  placeholder="请选择来源渠道"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in channelOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生产主管" prop="manager">
                <el-select
                  v-model="orderForm.manager"
                  placeholder="请选择主管"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in managerOptions"
                    :key="item.id"
                    :label="item.last_name || item.username"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 任务配置 -->
        <div class="form-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="任务类型" prop="order_type">
                <el-select 
                  v-model="orderForm.order_type" 
                  placeholder="请选择类型"
                  style="width: 100%"
                >
                  <el-option label="试产" value="trial">
                    <el-tag size="small" type="warning">试产</el-tag>
                  </el-option>
                  <el-option label="量产" value="mass">
                    <el-tag size="small" type="success">量产</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="优先级" prop="priority">
                <el-select 
                  v-model="orderForm.priority" 
                  placeholder="请选择优先级"
                  style="width: 100%"
                >
                  <el-option label="紧急" :value="0">
                    <el-tag size="small" type="danger">紧急</el-tag>
                  </el-option>
                  <el-option label="高" :value="1">
                    <el-tag size="small" type="warning">高</el-tag>
                  </el-option>
                  <el-option label="中" :value="2">
                    <el-tag size="small" type="primary">中</el-tag>
                  </el-option>
                  <el-option label="低" :value="3">
                    <el-tag size="small" type="info">低</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计划数量" prop="quantity">
                <el-input-number
                  v-model="orderForm.quantity"
                  :min="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="开始日期" prop="planned_start_date">
                <el-date-picker
                  v-model="orderForm.planned_start_date"
                  type="date"
                  placeholder="选择开始日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="结束日期" prop="planned_end_date">
                <el-date-picker
                  v-model="orderForm.planned_end_date"
                  type="date"
                  placeholder="选择结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="排序优先级" prop="priority_order">
                <el-input-number
                  v-model="orderForm.priority_order"
                  :min="0"
                  :max="999"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 任务详情 -->
        <div class="form-section">
          <el-form-item label="任务描述" prop="description">
            <el-input
              v-model="orderForm.description"
              type="textarea"
              rows="3"
              placeholder="请输入任务描述"
            />
          </el-form-item>
          
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
        </div>

        <!-- 附件信息 -->
        <div class="form-section">
          <el-form-item label="主图">
            <el-upload
              class="image-upload"
              :show-file-list="false"
              accept="image/jpeg,image/png,image/gif"
              :before-upload="beforeImageUpload"
              @change="handleImageChange"
            >
              <img v-if="imageUrl" :src="imageUrl" class="preview-image" />
              <el-button v-else type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">只能上传 jpg/png/gif 文件，且不超过 5MB</div>
              </template>
            </el-upload>
          </el-form-item>
        </div>
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
import { CaretBottom, View, Edit, SetUp, Delete, Picture, InfoFilled, Search, Refresh } from '@element-plus/icons-vue'
import { 
  getOrderList, 
  createOrder, 
  updateOrder, 
  deleteOrder, 
  updateOrderStatus,
  getCategoryList,
  getNextOrderCode,
  getChannelList
} from '@/api/production'
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
  ordering: 'priority,-priority_order'
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
  code: '',  // 将由后端生成
  product: null,
  category: null,
  channel: null,  // 添加渠道字段
  order_type: 'trial',  // 默认为试产
  quantity: 1,
  priority: 1,  // 默认为高优先级
  priority_order: 0,
  manager: null,
  planned_start_date: new Date().toISOString().split('T')[0],  // 默认为当天
  planned_end_date: '',
  technical_requirements: '',
  quality_requirements: '',
  description: '',
  main_image: null,
  main_image_url: ''
})

// 表单校验规则
const rules = {
  order_type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入计划数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  priority_order: [
    { required: true, message: '请输入排序优先级', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序优先级必须大于等于0', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请选择生产主管', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入任务描述', trigger: 'blur' },
    { min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur' }
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

// 类目选项
const categoryOptions = ref([])

// 渠道选项
const channelOptions = ref([])

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
    console.log('任务列表:', results)  // 添加日志输出
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
      is_staff: true,
      page_size: 100,  // 获取更多数据
      ordering: 'username'  // 按用户名排序
    })
    console.log('管理员列表:', results)
    if (!results || results.length === 0) {
      console.warn('未获取到管理员数据')
      return
    }
    managerOptions.value = results
    // 检查数据结构
    console.log('第一个管理员数据:', {
      id: results[0].id,
      username: results[0].username,
      last_name: results[0].last_name,
      is_staff: results[0].is_staff
    })
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error('获取管理员列表失败')
  }
}

// 获取类目列表
const getCategoryOptions = async () => {
  try {
    const { results } = await getCategoryList()
    categoryOptions.value = results
  } catch (error) {
    ElMessage.error('获取生产类目列表失败')
  }
}

// 获取渠道列表
const getChannelOptions = async () => {
  try {
    const { results } = await getChannelList({ is_active: true })
    channelOptions.value = results
  } catch (error) {
    ElMessage.error('获取渠道列表失败')
  }
}

// 新增任务
const handleAdd = async () => {
  dialogTitle.value = '新建任务'
  try {
    const { code } = await getNextOrderCode()
    orderForm.value.code = code
  } catch (error) {
    ElMessage.error('获取任务编号失败')
    return
  }
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

// 图片预览
const imageUrl = ref('')

// 图片上传前的验证
const beforeImageUpload = (file) => {
  const isImage = /^image\/(jpeg|png|gif)$/.test(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 处理图片变化
const handleImageChange = (file) => {
  const isValid = beforeImageUpload(file.raw)
  if (!isValid) return

  // 预览图片
  imageUrl.value = URL.createObjectURL(file.raw)
  // 保存文件对象，等表单提交时一起上传
  orderForm.value.main_image = file.raw
}

// 提交表单
const handleSubmit = async () => {
  try {
    await orderFormRef.value.validate()
    
    // 使用 FormData 处理文件上传
    const formData = new FormData()
    
    // 添加基本字段
    const formFields = {
      code: orderForm.value.code,
      category: orderForm.value.category,
      order_type: orderForm.value.order_type,
      quantity: orderForm.value.quantity,
      priority: orderForm.value.priority,
      priority_order: orderForm.value.priority_order,
      manager: orderForm.value.manager,
      description: orderForm.value.description,
      technical_requirements: orderForm.value.technical_requirements || '',
      quality_requirements: orderForm.value.quality_requirements || '',
      channel: orderForm.value.channel
    }
    
    // 处理日期字段
    if (orderForm.value.planned_start_date) {
      formFields.planned_start_date = new Date(orderForm.value.planned_start_date).toISOString().split('T')[0]
    }
    if (orderForm.value.planned_end_date) {
      formFields.planned_end_date = new Date(orderForm.value.planned_end_date).toISOString().split('T')[0]
    }
    
    // 添加所有字段到 FormData
    Object.keys(formFields).forEach(key => {
      formData.append(key, formFields[key])
    })
    
    // 添加图片文件（如果有）
    if (orderForm.value.main_image) {
      formData.append('main_image', orderForm.value.main_image)
    }
    
    // 添加创建者信息
    if (!orderForm.value.id) {  // 只在创建时添加
      formData.append('created_by', userStore.userInfo.id)
    }
    
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
  imageUrl.value = ''
  Object.assign(orderForm.value, {
    code: '',
    product: null,
    category: null,
    channel: null,  // 添加渠道字段重置
    order_type: 'trial',
    quantity: 1,
    priority: 1,
    priority_order: 0,
    manager: null,
    planned_start_date: new Date().toISOString().split('T')[0],
    planned_end_date: '',
    technical_requirements: '',
    quality_requirements: '',
    description: '',
    main_image: null,
    main_image_url: ''
  })
}

onMounted(() => {
  getList()
  getManagerOptions()
  getCategoryOptions()
  getChannelOptions()  // 添加获取渠道列表
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
    gap: 4px;
    
    .priority-order {
      color: #909399;
      font-size: 13px;
    }
  }

  .property-info {
    .property-item {
      line-height: 1.8;
      font-size: 13px;
      
      .category-name {
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .type-and-channel {
        display: flex;
        gap: 4px;
        align-items: center;
        
        .type-tag {
          min-width: 40px;
          text-align: center;
        }
        
        .channel-tag {
          font-size: 12px;
        }
      }
    }
  }

  .table-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
  }

  .image-upload {
    .preview-image {
      width: 100px;
      height: 100px;
      border-radius: 4px;
      object-fit: cover;
    }
    
    .el-upload__tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  .order-code {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
    cursor: pointer;
    transition: color 0.3s;
    
    &:hover {
      color: #409EFF;
      text-decoration: underline;
    }
  }

  .info-icon {
    margin-left: 8px;
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    vertical-align: middle;
  }

  .pending-text {
    color: #909399;
    font-size: 13px;
    font-style: italic;
  }

  .form-section {
    margin-bottom: 12px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .order-form {
    :deep(.el-form-item__label) {
      font-weight: 500;
    }
    
    :deep(.el-form-item) {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(.el-row) {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    :deep(.el-input-number) {
      width: 100%;
    }
    
    :deep(.el-date-editor) {
      width: 100%;
    }
  }
}
</style> 