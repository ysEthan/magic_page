import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/api/auth/users/',
    method: 'get',
    params: {
      ...params,
      is_active: true  // 只获取激活的用户
    }
  })
}

export function login(data) {
  return request({
    url: '/api/auth/token/',
    method: 'post',
    data
  })
}

export function getProfile() {
  return request({
    url: '/api/auth/users/profile/',
    method: 'get'
  })
}

export function register(data) {
  return request({
    url: '/api/auth/users/',
    method: 'post',
    data
  })
}

export function refreshToken(data) {
  return request({
    url: '/api/auth/token/refresh/',
    method: 'post',
    data
  })
}

export function updateProfile(data) {
  return request({
    url: `/api/auth/users/${data.id}/`,
    method: 'put',
    data
  })
} 