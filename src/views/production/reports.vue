<template>
  <div class="reports-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
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
        <el-form-item label="步骤状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="暂停中" value="on_hold" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
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

    <el-row :gutter="20">
      <!-- 渠道分布饼图 -->
      <el-col :span="6">
        <el-card class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>渠道分布</span>
              <el-tooltip content="展示不同来源渠道的任务数量分布" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container" v-loading="channelChartLoading">
            <div ref="channelPieChart" style="width: 100%; height: 300px"></div>
            <div class="total-tasks" v-if="channelTotalTasks > 0">
              总任务数：{{ channelTotalTasks }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 优先级分布图 -->
      <el-col :span="6">
        <el-card class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>优先级分布</span>
              <el-tooltip content="展示各生产类目下不同优先级的任务数量分布" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container priority-chart" v-loading="priorityChartLoading">
            <div ref="priorityChart" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
    <div>11</div>
    </el-row>



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
              <span>任务分布</span>
            </div>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Search, Refresh, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getCategoryList, getReportSummary, getCategoryPriorityStatistics, getChannelStatistics } from '@/api/production'

// 查询参数
const queryParams = ref({
  category: null,
  status: null,
  start_date: null,
  end_date: null
})

// 图表相关
const statusChartRef = ref(null)
let statusChart = null

// 数据统计
const summaryData = ref({
  total_orders: 0,
  completion_rate: 0,
  total_planned: 0,
  total_completed: 0
})

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

// 优先级图表相关
const priorityChart = ref(null)
const priorityChartLoading = ref(false)
let priorityChartInstance = null

// 优先级颜色
const priorityColors = {
  P0: '#F56C6C',    // 红色 - P0
  P1: '#E6A23C',    // 橙色 - P1
  P2: '#409EFF',    // 蓝色 - P2
  P3: '#67C23A'     // 绿色 - P3
}

// 渠道统计相关
const channelPieChart = ref(null)
const channelChartLoading = ref(false)
const channelTotalTasks = ref(0)
let channelChart = null

// 渠道对应的颜色
const channelColors = [
  '#409EFF', // 蓝色
  '#67C23A', // 绿色
  '#E6A23C', // 橙色
  '#F56C6C', // 红色
  '#909399', // 灰色
]

// 日期范围
const dateRange = ref([])

// 处理日期范围变化
const handleDateRangeChange = (val) => {
  if (val) {
    queryParams.value.start_date = val[0]
    queryParams.value.end_date = val[1]
  } else {
    queryParams.value.start_date = null
    queryParams.value.end_date = null
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

// 获取报表数据
const fetchReportData = async () => {
  try {
    const summaryRes = await getReportSummary({
        category: queryParams.value.category
      })

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
  } catch (error) {
    console.error('获取报表数据失败:', error)
    ElMessage.error('获取报表数据失败')
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

// 初始化优先级分布图表
const initPriorityChart = () => {
  if (priorityChartInstance) {
    priorityChartInstance.dispose()
  }
  priorityChartInstance = echarts.init(priorityChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        let tooltip = `${params[0].axisValue.split(' (')[0]}<br/>`
        let total = 0
        params.forEach(param => {
          tooltip += `${param.marker}${param.seriesName}：${param.value}<br/>`
          total += param.value
        })
        tooltip += `<br/>总计：${total}`
        return tooltip
      }
    },
    legend: {
      data: ['P0', 'P1', 'P2', 'P3'],
      top: 0,
      left: 'center'
    },
    grid: {
      left: '0%',
      right: '1%',
      top: '40px',
      bottom: '6%',
      containLabel: true
    },
      xAxis: {
      type: 'value',
      name: '任务数量',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: '{value}'
      }
    },
    yAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
        formatter: (value) => {
          const parts = value.split('|||')
          const name = parts[0]
          const total = parts[1] || 0
          if (name.length > 12) {
            return `${name.substring(0, 12)}... (${total})`
          }
          return `${name} (${total})`
        },
        margin: 16
      }
      },
      series: [
        {
        name: 'P0',
          type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (params) => {
            return params.value > 0 ? params.value : ''
          }
        },
        emphasis: {
          focus: 'series'
        },
          itemStyle: { 
          color: priorityColors.P0
        },
        data: []
      },
      {
        name: 'P1',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (params) => {
            return params.value > 0 ? params.value : ''
          }
        },
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: priorityColors.P1
        },
        data: []
      },
      {
        name: 'P2',
          type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (params) => {
            return params.value > 0 ? params.value : ''
          }
        },
        emphasis: {
          focus: 'series'
        },
          itemStyle: {
          color: priorityColors.P2
        },
        data: []
      },
      {
        name: 'P3',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: (params) => {
            return params.value > 0 ? params.value : ''
          }
        },
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: priorityColors.P3
        },
        data: []
      }
    ]
  }
  priorityChartInstance.setOption(option)
}

// 获取优先级统计数据
const getPriorityData = async () => {
  priorityChartLoading.value = true
  try {
    const params = {
      status: queryParams.value.status
    }

    const response = await getCategoryPriorityStatistics(params)
    
    if (response.data) {
      // 计算每个类目的总任务数并构建类目标签
      const categoriesWithTotal = response.data.map(item => {
        const total = (item.priority_distribution.P0 || 0) +
                     (item.priority_distribution.P1 || 0) +
                     (item.priority_distribution.P2 || 0) +
                     (item.priority_distribution.P3 || 0)
        return {
          name: item.category_name,
          total,
          distribution: item.priority_distribution
        }
      })

      // 按总任务数从少到多排序
      categoriesWithTotal.sort((a, b) => a.total - b.total)
      
      // 构建排序后的类目标签和数据
      const categories = categoriesWithTotal.map(item => `${item.name}|||${item.total}`)
      
      const seriesData = {
        P0: [],
        P1: [],
        P2: [],
        P3: []
      }

      categoriesWithTotal.forEach(item => {
        seriesData.P0.push(item.distribution.P0 || 0)
        seriesData.P1.push(item.distribution.P1 || 0)
        seriesData.P2.push(item.distribution.P2 || 0)
        seriesData.P3.push(item.distribution.P3 || 0)
      })

      priorityChartInstance.setOption({
        yAxis: {
          data: categories
        },
        series: [
          {
            name: 'P0',
            data: seriesData.P0
          },
          {
            name: 'P1',
            data: seriesData.P1
          },
          {
            name: 'P2',
            data: seriesData.P2
          },
          {
            name: 'P3',
            data: seriesData.P3
          }
        ]
      })
    }
  } catch (error) {
    console.error('获取优先级统计数据失败:', error)
    ElMessage.error('获取优先级统计数据失败')
  } finally {
    priorityChartLoading.value = false
  }
}

// 初始化渠道分布饼图
const initChannelChart = () => {
  if (channelChart) {
    channelChart.dispose()
  }
  channelChart = echarts.init(channelPieChart.value)
  channelChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>数量: ${params.value}<br/>占比: ${params.data.percentage.toFixed(1)}%`
      }
    },
    graphic: {
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: '0',
        textAlign: 'center',
        fill: '#303133',
        fontSize: 60,
        fontWeight: 'bold'
      }
    },
    series: [
      {
        name: '渠道分布',
        type: 'pie',
        radius: ['45%', '80%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: (params) => {
            const name = params.name.length > 6 ? params.name.substring(0, 6) + '...' : params.name
            return `${name}:${params.value}`
          },
          color: '#606266',
          fontSize: 11,
          lineHeight: 12,
          padding: [0, 0, 0, 0]
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 5,
          smooth: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: []
      }
    ]
  })
}

// 获取渠道统计数据
const getChannelData = async () => {
  channelChartLoading.value = true
  try {
    const params = {
      status: queryParams.value.status,
      start_date: queryParams.value.start_date,
      end_date: queryParams.value.end_date
    }

    const response = await getChannelStatistics(params)
    
    if (response.data) {
      const chartData = response.data.map((item, index) => ({
        name: item.channel_name || '未分类',
        value: item.count,
        percentage: item.percentage,
        itemStyle: {
          color: channelColors[index % channelColors.length]
        }
      }))
      
      channelChart.setOption({
        graphic: {
          style: {
            text: `${response.total || 0}`
          }
        },
        series: [{
          data: chartData
        }]
      })

      // 更新图表下方的总数显示
      channelTotalTasks.value = response.total || 0
    }
  } catch (error) {
    console.error('获取渠道统计数据失败:', error)
    ElMessage.error('获取渠道统计数据失败')
  } finally {
    channelChartLoading.value = false
  }
}

// 更新重置查询函数
const resetQuery = () => {
  queryParams.value = {
    category: null,
    status: null,
    start_date: null,
    end_date: null
  }
  dateRange.value = []
  fetchReportData()
  getPriorityData()
  getChannelData()
}

// 更新窗口大小监听
const handleResize = () => {
  statusChart?.resize()
  priorityChartInstance?.resize()
  channelChart?.resize()
}

// 监听查询参数变化
watch([
  () => queryParams.value.status,
  () => queryParams.value.start_date,
  () => queryParams.value.end_date
], () => {
  getChannelData()
})

onMounted(() => {
  getCategoryOptions()
  initStatusChart()
  initPriorityChart()
  initChannelChart()
  fetchReportData()
  getPriorityData()
  getChannelData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  statusChart?.dispose()
  priorityChartInstance?.dispose()
  channelChart?.dispose()
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

  .statistics-card {
    margin-bottom: 20px;
    height: 380px; // 减小卡片高度
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-icon {
        font-size: 16px;
        color: #909399;
        cursor: help;
    }
  }

  .chart-container {
      height: 300px; // 减小图表高度
      
      &.priority-chart {
        padding: 0; // 移除内边距
      }

      .total-tasks {
        text-align: center;
        margin-top: 8px;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}
</style> 