<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const props = withDefaults(defineProps<{ title?: string }>(), { title: '微薄' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isHome = computed(() => route.path === '/')

const avatarInitial = computed(() => {
  const name = userStore.user?.nickname || '用户'
  return name.charAt(0)
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button v-if="!isHome" class="navbar-back" @click="router.back()">‹</button>
    </div>
    <span class="navbar-title">♡ {{ props.title }} ♡</span>
    <div class="navbar-right">
      <router-link v-if="userStore.isLoggedIn" to="/profile" class="navbar-user">
        <span class="navbar-avatar">{{ avatarInitial }}</span>
      </router-link>
    </div>
  </nav>
</template>
