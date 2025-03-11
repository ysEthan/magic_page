import request from '@/utils/request'

// 获取生产任务列表
export function getOrderList(params) {
  return request({
    url: '/api/production/orders/',
    method: 'get',
    params
  })
}

// 创建生产任务
export function createOrder(data) {
  return request({
    url: '/api/production/orders/',
    method: 'post',
    data
  })
}

// 更新生产任务
export function updateOrder(id, data) {
  return request({
    url: `/api/production/orders/${id}/`,
    method: 'put',
    data
  })
}

// 删除生产任务
export function deleteOrder(id) {
  return request({
    url: `/api/production/orders/${id}/`,
    method: 'delete'
  })
}

// 更新生产任务状态
export function updateOrderStatus(id, status) {
  return request({
    url: `/api/production/orders/${id}/status/`,
    method: 'patch',
    data: { status }
  })
}

// 获取生产类目列表
export function getCategoryList(params) {
  return request({
    url: '/api/production/categories/',
    method: 'get',
    params
  })
}

export function getOrder(id) {
  return request({
    url: `/api/production/orders/${id}/`,
    method: 'get'
  })
}

// 获取下一个任务编号
export function getNextOrderCode() {
  return request({
    url: '/api/production/orders/next_id/',
    method: 'get'
  })
}

// 获取渠道列表
export function getChannelList(params) {
  return request({
    url: '/api/production/channels/',
    method: 'get',
    params
  })
}

// 获取报表汇总数据
export function getReportSummary(params) {
  return request({
    url: '/api/production/reports/summary/',
    method: 'get',
    params
  })
}

// 获取报表趋势数据
export function getReportTrend(params) {
  return request({
    url: '/api/production/reports/trend/',
    method: 'get',
    params
  })
}

// 获取生产步骤列表
export function getStepList(params) {
  return request({
    url: '/api/production/steps/',
    method: 'get',
    params
  })
}

// 创建生产步骤
export function createStep(data) {
  return request({
    url: '/api/production/steps/',
    method: 'post',
    data
  })
}

// 更新生产步骤
export function updateStep(id, data) {
  return request({
    url: `/api/production/steps/${id}/`,
    method: 'put',
    data
  })
}

// 删除生产步骤
export function deleteStep(id) {
  return request({
    url: `/api/production/steps/${id}/`,
    method: 'delete'
  })
}

// 更新步骤状态
export function updateStepStatus(id, status) {
  return request({
    url: `/api/production/steps/${id}/update_status/`,
    method: 'post',
    data: { status }
  })
}

// 获取当前进行中的步骤
export function getCurrentStep(orderId) {
  return request({
    url: `/api/production/orders/${orderId}/current_step/`,
    method: 'get'
  })
} 