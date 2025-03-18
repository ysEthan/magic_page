import request from '@/utils/request'

// 供应商管理接口
export function getSupplierList(params) {
  return request({
    url: '/api/purchase/suppliers/',
    method: 'get',
    params
  })
}

export function createSupplier(data) {
  return request({
    url: '/api/purchase/suppliers/',
    method: 'post',
    data
  })
}

export function updateSupplier(id, data) {
  return request({
    url: `/api/purchase/suppliers/${id}/`,
    method: 'put',
    data
  })
}

export function deleteSupplier(id) {
  return request({
    url: `/api/purchase/suppliers/${id}/`,
    method: 'delete'
  })
}

// 采购订单管理接口
export function getOrderList(params) {
  return request({
    url: '/api/purchase/orders/',
    method: 'get',
    params
  })
}

export function createOrder(data) {
  return request({
    url: '/api/purchase/orders/',
    method: 'post',
    data
  })
}

export function updateOrder(id, data) {
  return request({
    url: `/api/purchase/orders/${id}/`,
    method: 'put',
    data
  })
}

export function deleteOrder(id) {
  return request({
    url: `/api/purchase/orders/${id}/`,
    method: 'delete'
  })
}

export function updateOrderStatus(id, data) {
  return request({
    url: `/api/purchase/orders/${id}/update_status/`,
    method: 'post',
    data
  })
}

// 采购订单明细管理接口
export function getOrderItemList(params) {
  return request({
    url: '/api/purchase/order-items/',
    method: 'get',
    params
  })
}

export function createOrderItem(data) {
  return request({
    url: '/api/purchase/order-items/',
    method: 'post',
    data
  })
}

export function updateOrderItem(id, data) {
  return request({
    url: `/api/purchase/order-items/${id}/`,
    method: 'put',
    data
  })
}

export function deleteOrderItem(id) {
  return request({
    url: `/api/purchase/order-items/${id}/`,
    method: 'delete'
  })
}

// 获取待入库列表
export function getPendingStockList(params) {
  return request({
    url: '/api/purchase/pending-stock/',
    method: 'get',
    params
  })
}

// 获取待入库明细列表
export function getPendingStorageList(params) {
  return request({
    url: '/api/purchase/order-items/pending-storage/',
    method: 'get',
    params
  })
}