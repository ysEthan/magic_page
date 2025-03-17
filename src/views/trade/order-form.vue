<template>
  <div class="order-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑订单' : '新建订单' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="order-form"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单类型" prop="order_type">
              <el-select v-model="formData.order_type" placeholder="请选择订单类型">
                <el-option
                  v-for="(label, value) in orderTypeOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="店铺" prop="shop">
              <el-select
                v-model="formData.shop"
                placeholder="请选择店铺"
                filterable
              >
                <el-option
                  v-for="item in shopOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="平台订单号" prop="platform_order_number">
              <el-input
                v-model="formData.platform_order_number"
                placeholder="请输入平台订单号"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option
                  v-for="(label, value) in orderStatusOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                >
                  <el-tag :type="getStatusType(value)">{{ label }}</el-tag>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="支付状态" prop="payment_status">
              <el-switch
                v-model="formData.payment_status"
                :active-text="formData.payment_status ? '已支付' : '未支付'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="下单时间" prop="order_place_time">
              <el-date-picker
                v-model="formData.order_place_time"
                type="datetime"
                placeholder="请选择下单时间"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 收货信息 -->
        <el-divider content-position="left">收货信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="收货人" prop="shipping_contact">
              <el-input
                v-model="formData.shipping_contact"
                placeholder="请输入收货人姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="shipping_phone">
              <el-input
                v-model="formData.shipping_phone"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="收货地址" prop="shipping_address">
          <el-input
            v-model="formData.shipping_address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <!-- 金额信息 -->
        <el-divider content-position="left">金额信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="货币" prop="currency">
              <el-select v-model="formData.currency" placeholder="请选择货币">
                <el-option label="CNY" value="CNY" />
                <el-option label="USD" value="USD" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="商品总额" prop="total_amount">
              <el-input-number
                v-model="formData.total_amount"
                :precision="2"
                :step="0.1"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="运费" prop="shipping_fee">
              <el-input-number
                v-model="formData.shipping_fee"
                :precision="2"
                :step="0.1"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 商品信息 -->
        <el-divider content-position="left">商品信息</el-divider>
        <el-form-item>
          <el-button type="primary" @click="handleAddItem">
            <el-icon><Plus /></el-icon>添加商品
          </el-button>
        </el-form-item>

        <el-table :data="formData.items" style="width: 100%">
          <el-table-column label="商品名称" min-width="200">
            <template #default="{ $index }">
              <el-form-item
                :prop="'items.' + $index + '.product'"
                :rules="rules.product"
              >
                <el-select
                  v-model="formData.items[$index].product"
                  placeholder="请选择商品"
                  filterable
                  remote
                  :remote-method="handleSearchProduct"
                  :loading="productLoading"
                >
                  <el-option
                    v-for="item in productOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                    <div>{{ item.name }}</div>
                    <div class="sub-text">SKU: {{ item.sku }}</div>
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="150">
            <template #default="{ $index }">
              <el-form-item
                :prop="'items.' + $index + '.quantity'"
                :rules="rules.quantity"
              >
                <el-input-number
                  v-model="formData.items[$index].quantity"
                  :min="1"
                  :max="9999"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="150">
            <template #default="{ $index }">
              <el-form-item
                :prop="'items.' + $index + '.price'"
                :rules="rules.price"
              >
                <el-input-number
                  v-model="formData.items[$index].price"
                  :precision="2"
                  :step="0.1"
                  :min="0"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="小计" width="150">
            <template #default="{ row }">
              {{ calculateSubtotal(row) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button
                link
                type="danger"
                @click="handleRemoveItem($index)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 备注信息 -->
        <el-divider content-position="left">备注信息</el-divider>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>

        <!-- 按钮区域 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { 
  getOrderDetail,
  createOrder,
  updateOrder,
  getShopList,
  searchProducts
} from '@/api/trade'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

// 判断是否为编辑模式
const isEdit = computed(() => route.params.id !== undefined)

// 订单状态选项
const orderStatusOptions = {
  unpaid: '未支付',
  pending: '待处理',
  picking: '配货中',
  shipped: '已发货',
  cancelled: '已取消'
}

// 订单类型选项
const orderTypeOptions = {
  platform: '平台订单',
  influencer: '达人订单',
  offline: '线下订单',
  requisition: '员工领用',
  employee: '员工自购'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    unpaid: 'warning',
    pending: 'info',
    picking: 'primary',
    shipped: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 表单数据
const formData = reactive({
  order_type: '',
  shop: '',
  platform_order_number: '',
  status: 'pending',
  payment_status: false,
  order_place_time: '',
  shipping_contact: '',
  shipping_phone: '',
  shipping_address: '',
  currency: 'CNY',
  total_amount: 0,
  shipping_fee: 0,
  remarks: '',
  items: []
})

// 表单验证规则
const rules = {
  order_type: [{ required: true, message: '请选择订单类型' }],
  shop: [{ required: true, message: '请选择店铺' }],
  status: [{ required: true, message: '请选择订单状态' }],
  order_place_time: [{ required: true, message: '请选择下单时间' }],
  shipping_contact: [{ required: true, message: '请输入收货人姓名' }],
  shipping_phone: [{ required: true, message: '请输入联系电话' }],
  shipping_address: [{ required: true, message: '请输入收货地址' }],
  currency: [{ required: true, message: '请选择货币' }],
  total_amount: [{ required: true, message: '请输入商品总额' }],
  product: [{ required: true, message: '请选择商品' }],
  quantity: [{ required: true, message: '请输入数量' }],
  price: [{ required: true, message: '请输入单价' }]
}

// 店铺选项
const shopOptions = ref([])

// 获取店铺选项
const getShopOptions = async () => {
  try {
    const { results } = await getShopList({ status: 1 })
    shopOptions.value = results
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    ElMessage.error('获取店铺列表失败')
  }
}

// 商品选项
const productOptions = ref([])
const productLoading = ref(false)

// 搜索商品
const handleSearchProduct = async (query) => {
  if (query) {
    productLoading.value = true
    try {
      const { results } = await searchProducts({ search: query })
      productOptions.value = results
    } catch (error) {
      console.error('搜索商品失败:', error)
      ElMessage.error('搜索商品失败')
    } finally {
      productLoading.value = false
    }
  } else {
    productOptions.value = []
  }
}

// 添加商品项
const handleAddItem = () => {
  formData.items.push({
    product: '',
    quantity: 1,
    price: 0
  })
}

// 移除商品项
const handleRemoveItem = (index) => {
  formData.items.splice(index, 1)
}

// 计算小计
const calculateSubtotal = (row) => {
  return (row.quantity * row.price).toFixed(2)
}

// 获取订单详情
const getDetail = async (id) => {
  try {
    const data = await getOrderDetail(id)
    Object.assign(formData, data)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateOrder(route.params.id, formData)
          ElMessage.success('更新成功')
        } else {
          await createOrder(formData)
          ElMessage.success('创建成功')
        }
        router.push('/trade/orders')
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  getShopOptions()
  if (isEdit.value) {
    getDetail(route.params.id)
  }
})
</script>

<style lang="scss" scoped>
.order-form-container {
  .order-form {
    margin-top: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sub-text {
    font-size: 13px;
    color: #909399;
    line-height: 1.5;
  }

  :deep(.el-divider__text) {
    font-size: 16px;
    font-weight: bold;
  }
}
</style> 