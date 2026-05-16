<template>
  <div id="app">
    <NavBar v-if="userStore.isLoggedIn" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
</script>
