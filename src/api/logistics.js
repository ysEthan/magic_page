import request from '@/utils/request'

// 物流商管理
export function getCarrierList(params) {
  return request({
    url: '/api/logistics/carriers/',
    method: 'get',
    params
  })
}

export function createCarrier(data) {
  return request({
    url: '/api/logistics/carriers/',
    method: 'post',
    data
  })
}

export function updateCarrier(id, data) {
  return request({
    url: `/api/logistics/carriers/${id}/`,
    method: 'put',
    data
  })
}

export function deleteCarrier(id) {
  return request({
    url: `/api/logistics/carriers/${id}/`,
    method: 'delete'
  })
}

// 物流服务管理
export function getServiceList(params) {
  return request({
    url: '/api/logistics/services/',
    method: 'get',
    params
  })
}

export function createService(data) {
  return request({
    url: '/api/logistics/services/',
    method: 'post',
    data
  })
}

export function updateService(id, data) {
  return request({
    url: `/api/logistics/services/${id}/`,
    method: 'put',
    data
  })
}

export function deleteService(id) {
  return request({
    url: `/api/logistics/services/${id}/`,
    method: 'delete'
  })
}

// 包裹管理
export function getPackageList(params) {
  return request({
    url: '/api/logistics/packages/',
    method: 'get',
    params
  })
}

export function getPackageDetail(id) {
  return request({
    url: `/api/logistics/packages/${id}/`,
    method: 'get'
  })
}

export function createPackage(data) {
  return request({
    url: '/api/logistics/packages/',
    method: 'post',
    data
  })
}

export function updatePackage(id, data) {
  return request({
    url: `/api/logistics/packages/${id}/`,
    method: 'put',
    data
  })
}

export function deletePackage(id) {
  return request({
    url: `/api/logistics/packages/${id}/`,
    method: 'delete'
  })
}

export function updatePackageStatus(id, data) {
  return request({
    url: `/api/logistics/packages/${id}/update_status/`,
    method: 'post',
    data
  })
}

// 物流轨迹管理
export function getTrackingList(params) {
  return request({
    url: '/api/logistics/tracking/',
    method: 'get',
    params
  })
}

export function createTracking(data) {
  return request({
    url: '/api/logistics/tracking/',
    method: 'post',
    data
  })
}

export function updateTracking(id, data) {
  return request({
    url: `/api/logistics/tracking/${id}/`,
    method: 'put',
    data
  })
}

export function deleteTracking(id) {
  return request({
    url: `/api/logistics/tracking/${id}/`,
    method: 'delete'
  })
} 