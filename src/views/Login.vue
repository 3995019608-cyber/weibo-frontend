<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api'
import { useUserStore } from '../stores/user'
import { countries } from '../assets/countries'
import type { Country } from '../assets/countries'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const countrySearch = ref('')
const showDropdown = ref(false)

const selectedCountry = ref<Country>(
  countries.find((c) => c.code === 'CN') ?? countries[0]
)

const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  if (!q) return countries
  return countries.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
  )
})

function selectCountry(c: Country) {
  selectedCountry.value = c
  showDropdown.value = false
  countrySearch.value = ''
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    countrySearch.value = ''
  }
}

function closeDropdown() {
  showDropdown.value = false
  countrySearch.value = ''
}

async function handleSubmit() {
  error.value = ''
  if (!phone.value.trim()) {
    error.value = '请输入手机号'
    return
  }
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  loading.value = true
  try {
    const res = await login({
      phone: phone.value.trim(),
      countryCode: selectedCountry.value.dial,
      password: password.value
    })
    const resp = res.data
    userStore.setAuth(resp.message, resp.data)
    router.replace('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">登录</h1>
      <p class="auth-subtitle">欢迎回到微薄</p>

      <div v-if="error" class="form-error">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="phone-input-group">
            <div class="country-select">
              <button
                type="button"
                class="country-select-btn"
                @click="toggleDropdown"
                @blur="closeDropdown"
              >
                <span>{{ selectedCountry.flag }}</span>
                <span>{{ selectedCountry.dial }}</span>
              </button>
              <div v-if="showDropdown" class="country-dropdown">
                <input
                  v-model="countrySearch"
                  type="text"
                  class="form-input"
                  placeholder="搜索国家/地区"
                  @blur.stop
                />
                <div class="country-options">
                  <div
                    v-for="c in filteredCountries"
                    :key="c.code"
                    class="country-option"
                    @mousedown.prevent="selectCountry(c)"
                  >
                    <span>{{ c.flag }}</span>
                    <span>{{ c.name }}</span>
                    <span>{{ c.dial }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="phone-input-wrapper">
              <input
                v-model="phone"
                type="tel"
                class="form-input"
                placeholder="请输入手机号"
                autocomplete="tel"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="auth-footer">
        还没有账号？
        <router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>
