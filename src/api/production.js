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