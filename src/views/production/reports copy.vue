<template>
  <div class="reports-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="生产类目">
          <el-select v-model="queryParams.category" placeholder="请选择类目" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchReportData">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="data-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>任务总数</span>
              <el-tag>{{ summaryData.total_orders || 0 }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <el-progress
              type="dashboard"
              :percentage="summaryData.completion_rate || 0"
              :color="progressColors"
            />
            <div class="progress-label">完成率</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>计划生产量</span>
            </div>
          </template>
          <div class="quantity-stats">
            <div class="stat-item">
              <div class="label">计划总量</div>
              <div class="value">{{ summaryData.total_planned || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="label">实际完成</div>
              <div class="value">{{ summaryData.total_completed || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>任务状态分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="trend-card">
      <template #header>
        <div class="card-header">
          <span>任务趋势</span>
          <el-radio-group v-model="trendType" size="small" @change="updateTrendChart">
            <el-radio-button :value="'daily'">日</el-radio-button>
            <el-radio-button :value="'weekly'">周</el-radio-button>
            <el-radio-button :value="'monthly'">月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getCategoryList, getReportSummary, getReportTrend } from '@/api/production'

// 查询参数
const queryParams = ref({
  category: null,
  start_date: null,
  end_date: null
})

// 日期选择器相关
const dateRange = ref([])
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 图表相关
const statusChartRef = ref(null)
const trendChartRef = ref(null)
let statusChart = null
let trendChart = null

// 数据统计
const summaryData = ref({
  total_orders: 0,
  completion_rate: 0,
  total_planned: 0,
  total_completed: 0
})

// 趋势图类型
const trendType = ref('daily')

// 进度条颜色
const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#67c23a', percentage: 100 }
]

// 类目选项
const categoryOptions = ref([])

// 获取类目列表
const getCategoryOptions = async () => {
  try {
    const { results } = await getCategoryList()
    categoryOptions.value = results
  } catch (error) {
    ElMessage.error('获取生产类目列表失败')
  }
}

// 初始化状态分布图表
const initStatusChart = () => {
  statusChart = echarts.init(statusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{d}%'
        },
        labelLine: {
          show: false
        },
        data: []  // 初始化时不设置数据
      }
    ]
  }
  statusChart.setOption(option)
}

// 初始化趋势图表
const initTrendChart = () => {
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['新建任务', '完成任务']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: []
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        type: 'bar',
        name: '新建任务',
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        type: 'bar',
        name: '完成任务',
        emphasis: {
          focus: 'series'
        },
        data: []
      }
    ]
  }
  trendChart.setOption(option)
}

// 更新趋势图表
const updateTrendChart = () => {
  fetchReportData()
}

// 处理日期变化
const handleDateChange = (val) => {
  if (val) {
    // 格式化日期为 YYYY-MM-DD
    queryParams.value.start_date = val[0].toISOString().split('T')[0]
    queryParams.value.end_date = val[1].toISOString().split('T')[0]
  } else {
    queryParams.value.start_date = null
    queryParams.value.end_date = null
  }
  fetchReportData()
}

// 获取报表数据
const fetchReportData = async () => {
  if (!queryParams.value.start_date || !queryParams.value.end_date) {
    return
  }

  try {
    const [summaryRes, trendRes] = await Promise.all([
      getReportSummary({
        start_date: queryParams.value.start_date,
        end_date: queryParams.value.end_date,
        category: queryParams.value.category
      }),
      getReportTrend({
        type: trendType.value,
        start_date: queryParams.value.start_date,
        end_date: queryParams.value.end_date,
        category: queryParams.value.category
      })
    ])

    // 更新汇总数据
    summaryData.value = {
      total_orders: Number(summaryRes.total_orders || 0),
      completion_rate: Number(summaryRes.completion_rate || 0),
      total_planned: Number(summaryRes.total_planned || 0),
      total_completed: Number(summaryRes.total_completed || 0),
      status_distribution: {
        pending: Number(summaryRes.status_distribution?.pending || 0),
        in_progress: Number(summaryRes.status_distribution?.in_progress || 0),
        completed: Number(summaryRes.status_distribution?.completed || 0),
        cancelled: Number(summaryRes.status_distribution?.cancelled || 0)
      }
    }

    // 更新状态分布图表
    statusChart.setOption({
      series: [{
        data: [
          { 
            value: summaryData.value.status_distribution.pending,
            name: '待处理',
            itemStyle: { color: '#909399' }
          },
          { 
            value: summaryData.value.status_distribution.in_progress,
            name: '进行中',
            itemStyle: { color: '#409EFF' }
          },
          { 
            value: summaryData.value.status_distribution.completed,
            name: '已完成',
            itemStyle: { color: '#67C23A' }
          },
          { 
            value: summaryData.value.status_distribution.cancelled,
            name: '已取消',
            itemStyle: { color: '#F56C6C' }
          }
        ].filter(item => item.value > 0)  // 只显示有数据的状态
      }]
    })

    // 更新趋势图表
    trendChart.setOption({
      xAxis: {
        data: trendRes.dates || []
      },
      series: [
        {
          type: 'bar',
          name: '新建任务',
          data: (trendRes.new_orders || []).map(Number),
          itemStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409EFF' },
              { offset: 1, color: '#a8d4ff' }
            ])
          }
        },
        {
          type: 'bar',
          name: '完成任务',
          data: (trendRes.completed_orders || []).map(Number),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67C23A' },
              { offset: 1, color: '#b3e19d' }
            ])
          }
        }
      ]
    })
  } catch (error) {
    console.error('获取报表数据失败:', error)
    ElMessage.error('获取报表数据失败')
  }
}

// 重置查询
const resetQuery = () => {
  dateRange.value = []
  queryParams.value = {
    category: null,
    start_date: null,
    end_date: null
  }
  fetchReportData()
}

// 监听窗口大小变化
const handleResize = () => {
  statusChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  getCategoryOptions()
  initStatusChart()
  initTrendChart()
  // 设置默认时间范围为最近一周
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
  dateRange.value = [start, end]
  handleDateChange([start, end])
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  statusChart?.dispose()
  trendChart?.dispose()
})
</script>

<style lang="scss" scoped>
.reports-container {
  .filter-card {
    margin-bottom: 20px;
  }

  .data-cards {
    margin-bottom: 20px;

    .data-card {
      height: 100%;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 0;

        .progress-label {
          margin-top: 10px;
          color: #909399;
        }
      }

      .quantity-stats {
        padding: 20px 0;

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #909399;
          }

          .value {
            font-size: 20px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }
  }

  .trend-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .chart-container {
    height: 300px;
  }
}
</style> 