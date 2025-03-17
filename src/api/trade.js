import request from '@/utils/request'

// 获取店铺列表
export function getShopList(params) {
  return request({
    url: '/api/trade/shops/',
    method: 'get',
    params
  })
}

// 切换店铺状态
export function toggleShopStatus(id) {
  return request({
    url: `/api/trade/shops/${id}/toggle_status/`,
    method: 'post'
  })
}

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: '/api/trade/orders/',
    method: 'get',
    params
  })
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/api/trade/orders/',
    method: 'post',
    data
  })
}

// 更新订单
export function updateOrder(id, data) {
  return request({
    url: `/api/trade/orders/${id}/`,
    method: 'put',
    data
  })
}

// 删除订单
export function deleteOrder(id) {
  return request({
    url: `/api/trade/orders/${id}/`,
    method: 'delete'
  })
}

// 更新订单状态
export function updateOrderStatus(id, data) {
  return request({
    url: `/api/trade/orders/${id}/update_status/`,
    method: 'post',
    data
  })
}

// 更新支付状态
export function updateOrderPayment(id, data) {
  return request({
    url: `/api/trade/orders/${id}/update_payment/`,
    method: 'post',
    data
  })
}

// 获取订单商品列表
export function getOrderItemList(params) {
  return request({
    url: '/api/trade/order-items/',
    method: 'get',
    params
  })
}

// 搜索商品
export function searchProducts(params) {
  return request({
    url: '/api/trade/products/search/',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/api/trade/orders/${id}/`,
    method: 'get'
  })
}