import request from '@/utils/request'

// 生产任务相关接口
export function getOrderList(params) {
  return request({
    url: '/api/production/orders/',
    method: 'get',
    params
  })
}

export function createOrder(data) {
  return request({
    url: '/api/production/orders/',
    method: 'post',
    data
  })
}

export function updateOrder(id, data) {
  return request({
    url: `/api/production/orders/${id}/`,
    method: 'put',
    data
  })
}

export function deleteOrder(id) {
  return request({
    url: `/api/production/orders/${id}/`,
    method: 'delete'
  })
}

export function updateOrderStatus(id, status) {
  return request({
    url: `/api/production/orders/${id}/update_status/`,
    method: 'post',
    data: { status }
  })
}

export function getOrder(id) {
  return request({
    url: `/api/production/orders/${id}/`,
    method: 'get'
  })
} 