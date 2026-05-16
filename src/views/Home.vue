<template>
  <div class="container">
    <CreatePost @created="onCreated" />
    <div v-if="posts.length === 0 && !loading" class="empty">暂无动态</div>
    <PostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @like="handleLike(post)"
      @delete="handleDelete(post)"
      @click="goDetail(post.id)"
    />
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="noMore && posts.length > 0" class="empty">没有更多了</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, likePost, deletePost } from '../api'
import CreatePost from '../components/CreatePost.vue'
import PostCard from '../components/PostCard.vue'

const router = useRouter()

const posts = ref<any[]>([])
const page = ref(1)
const noMore = ref(false)
const loading = ref(false)

async function loadPosts() {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await getPosts(page.value, 10)
    const records = res.data.data?.records || []
    if (records.length < 10) noMore.value = true
    posts.value.push(...records)
    page.value++
  } finally {
    loading.value = false
  }
}

function onCreated(post: any) {
  posts.value.unshift(post)
}

async function handleLike(post: any) {
  try {
    await likePost(post.id)
    post.isLiked = !post.isLiked
    post.likeCount += post.isLiked ? 1 : -1
  } catch {
    // ignore
  }
}

async function handleDelete(post: any) {
  try {
    await deletePost(post.id)
    posts.value = posts.value.filter((p) => p.id !== post.id)
  } catch {
    // ignore
  }
}

function goDetail(id: string) {
  router.push('/post/' + id)
}

function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollHeight - scrollTop - clientHeight < 300) {
    loadPosts()
  }
}

onMounted(() => {
  loadPosts()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.container {
  background: #ededed;
  min-height: 100vh;
}
.empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
.loading {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}
</style>
