<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendSms, register } from '../api'
import { countries } from '../assets/countries'
import CountrySelect from '../components/CountrySelect.vue'
import type { Country } from '../assets/countries'

const router = useRouter()

const step = ref(1)
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const smsCode = ref('')
const nickname = ref('')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const error = ref('')
const success = ref('')

let countdownTimer: ReturnType<typeof setInterval> | null = null

const selectedCountry = ref<Country>(
  countries.find((c) => c.code === 'CN') ?? countries[0]
)

function startCountdown() {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }
  }, 1000)
}

async function handleSendCode() {
  error.value = ''
  if (!phone.value.trim()) {
    error.value = '请输入手机号'
    return
  }
  sendingCode.value = true
  try {
    const res = await sendSms(phone.value.trim(), selectedCountry.value.dial)
    const resp = res.data
    if (resp.data) {
      alert(`验证码：${resp.data}`)
    }
    startCountdown()
    step.value = 2
  } catch (err: any) {
    error.value = err.response?.data?.message || '发送验证码失败，请重试'
  } finally {
    sendingCode.value = false
  }
}

function validateStep2(): boolean {
  error.value = ''
  if (!smsCode.value.trim()) {
    error.value = '请输入验证码'
    return false
  }
  if (!password.value || password.value.length < 6) {
    error.value = '密码至少6位'
    return false
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码输入不一致'
    return false
  }
  return true
}

async function handleRegister() {
  if (!validateStep2()) return
  loading.value = true
  try {
    await register({
      phone: phone.value.trim(),
      countryCode: selectedCountry.value.dial,
      smsCode: smsCode.value.trim(),
      password: password.value,
      nickname: nickname.value.trim() || undefined
    })
    success.value = '注册成功！'
    step.value = 3
  } catch (err: any) {
    error.value = err.response?.data?.message || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">注册</h1>
      <p class="auth-subtitle">创建你的微薄账号</p>

      <div v-if="error" class="form-error">{{ error }}</div>

      <form v-if="step === 1" @submit.prevent="handleSendCode">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="phone-group">
            <CountrySelect v-model="selectedCountry" />
            <input
              v-model="phone"
              type="tel"
              class="phone-input"
              placeholder="请输入手机号"
              autocomplete="tel"
            />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="sendingCode"
        >
          {{ sendingCode ? '发送中...' : '获取验证码' }}
        </button>
      </form>

      <form v-if="step === 2" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="sms-row">
            <input
              v-model="smsCode"
              type="text"
              class="form-input"
              placeholder="请输入验证码"
              autocomplete="one-time-code"
            />
            <button
              type="button"
              class="sms-btn"
              :disabled="countdown > 0 || sendingCode"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '重新发送' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="至少6位密码"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="再次输入密码"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label class="form-label">昵称<span style="color: #999; font-weight: 400;">（选填）</span></label>
          <input
            v-model="nickname"
            type="text"
            class="form-input"
            placeholder="给自己起个名字吧"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '完成注册' }}
        </button>
      </form>

      <div v-if="step === 3" style="text-align: center;">
        <p class="auth-subtitle" style="color: #07c160;">{{ success }}</p>
        <button
          type="button"
          class="btn btn-primary"
          @click="goToLogin"
        >
          前往登录
        </button>
      </div>

      <p v-if="step !== 3" class="auth-footer">
        已有账号？
        <router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>
