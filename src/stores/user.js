import { defineStore } from 'pinia'
import { login, getProfile, updateProfile } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    userInfo: null
  }),
  
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    setRefreshToken(refreshToken) {
      this.refreshToken = refreshToken
      localStorage.setItem('refreshToken', refreshToken)
    },
    
    async login(userInfo) {
      try {
        const { access, refresh } = await login(userInfo)
        this.setToken(access)
        this.setRefreshToken(refresh)
        await this.getProfile()
        return true
      } catch (error) {
        return false
      }
    },
    
    async getProfile() {
      try {
        const data = await getProfile()
        this.userInfo = data
        return data
      } catch (error) {
        return null
      }
    },
    
    logout() {
      this.token = null
      this.refreshToken = null
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
    
    async updateProfile(data) {
      try {
        const response = await updateProfile(data)
        this.userInfo = response
        return response
      } catch (error) {
        throw error
      }
    }
  }
}) 