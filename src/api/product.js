import request from '@/utils/request'

// 品牌管理相关接口
export function getBrandList(params) {
  return request({
    url: '/api/products/brands/',
    method: 'get',
    params
  })
}

export function createBrand(data) {
  return request({
    url: '/api/products/brands/',
    method: 'post',
    data
  })
}

export function updateBrand(id, data) {
  return request({
    url: `/api/products/brands/${id}/`,
    method: 'put',
    data
  })
}

export function deleteBrand(id) {
  return request({
    url: `/api/products/brands/${id}/`,
    method: 'delete'
  })
}

// 分类管理相关接口
export function getCategoryList(params) {
  return request({
    url: '/api/products/categories/',
    method: 'get',
    params
  })
}

export function getAllCategories() {
  return request({
    url: '/api/products/categories/all_categories/',
    method: 'get'
  })
}

export function createCategory(data) {
  return request({
    url: '/api/products/categories/',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  return request({
    url: `/api/products/categories/${id}/`,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/api/products/categories/${id}/`,
    method: 'delete'
  })
}

// SPU管理相关接口
export function getSPUList(params) {
  return request({
    url: '/api/products/spus/',
    method: 'get',
    params
  })
}

export function createSPU(data) {
  return request({
    url: '/api/products/spus/',
    method: 'post',
    data
  })
}

export function updateSPU(id, data) {
  return request({
    url: `/api/products/spus/${id}/`,
    method: 'put',
    data
  })
}

export function deleteSPU(id) {
  return request({
    url: `/api/products/spus/${id}/`,
    method: 'delete'
  })
}

export function toggleSPUActive(id) {
  return request({
    url: `/api/products/spus/${id}/toggle_active/`,
    method: 'post'
  })
}

// SKU管理相关接口
export function getSKUList(params) {
  return request({
    url: '/api/products/products/',
    method: 'get',
    params
  })
}

export function createSKU(data) {
  return request({
    url: '/api/products/products/',
    method: 'post',
    data
  })
}

export function updateSKU(id, data) {
  return request({
    url: `/api/products/products/${id}/`,
    method: 'put',
    data
  })
}

export function deleteSKU(id) {
  return request({
    url: `/api/products/products/${id}/`,
    method: 'delete'
  })
}

export function toggleSKUReview(id) {
  return request({
    url: `/api/products/products/${id}/toggle_review/`,
    method: 'post'
  })
} 