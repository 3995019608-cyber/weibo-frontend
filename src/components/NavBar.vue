<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">微薄</router-link>

      <div class="navbar-links">
        <template v-if="userStore.isLoggedIn">
          <router-link to="/profile" class="navbar-link">
            {{ userStore.user?.nickname || '用户' }}
          </router-link>
          <button class="btn btn-outline" @click="handleLogout">
            退出
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="navbar-link">登录</router-link>
          <router-link to="/register" class="btn btn-outline">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>
