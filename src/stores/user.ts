import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMe } from '../api'

export const useUserStore = defineStore('user', () => {
  const user = ref<any>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(t: string, u: any) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await getMe()
      user.value = res.data.data
    } catch {
      logout()
    }
  }

  function initFromStorage() {
    const stored = localStorage.getItem('user')
    if (stored && token.value) {
      try {
        user.value = JSON.parse(stored)
      } catch {
        user.value = null
      }
    }
  }

  initFromStorage()

  return { user, token, isLoggedIn, setAuth, logout, fetchUser }
})
