import request from '@/utils/request'

// 仓库管理接口
export function getWarehouseList(params) {
  return request({
    url: '/api/storage/warehouses/',
    method: 'get',
    params
  })
}

// 获取仓库库存汇总
export function getWarehouseInventorySummary(warehouseId) {
  return request({
    url: `/api/storage/warehouses/${warehouseId}/inventory_summary/`,
    method: 'get'
  })
}

// 库存查询接口
export function getInventoryList(params) {
  return request({
    url: '/api/storage/inventories/',
    method: 'get',
    params
  })
}

// 获取商品库存汇总
export function getProductInventory(params) {
  return request({
    url: '/api/storage/inventories/product_inventory/',
    method: 'get',
    params
  })
}

// 入库记录接口
export function getStockInList(params) {
  return request({
    url: '/api/storage/stock-ins/',
    method: 'get',
    params
  })
}

// 出库记录接口
export function getStockOutList(params) {
  return request({
    url: '/api/storage/stock-outs/',
    method: 'get',
    params
  })
} 