<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, likePost, deletePost } from '../api'
import CreatePost from '../components/CreatePost.vue'
import PostCard from '../components/PostCard.vue'

const router = useRouter()

const posts = ref<any[]>([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const refreshing = ref(false)

async function loadPosts(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    hasMore.value = true
    refreshing.value = true
  }
  loading.value = true
  try {
    const res: any = await getPosts(page.value, 10)
    const pageData = res.data.data
    const list: any[] = pageData?.records || []
    if (reset) {
      posts.value = list
    } else {
      posts.value.push(...list)
    }
    hasMore.value = list.length >= 10
    if (list.length > 0) page.value++
  } catch (e) {
    console.error('Failed to load posts:', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const docHeight = document.documentElement.scrollHeight
  if (docHeight - scrollTop - windowHeight < 200 && hasMore.value && !loading.value) {
    loadPosts()
  }
}

function handleCreated(newPost: any) {
  posts.value.unshift(newPost)
}

async function handleLike(postId: string | number) {
  try {
    await likePost(postId)
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.isLiked = !post.isLiked
      post.likeCount += post.isLiked ? 1 : -1
    }
  } catch (e) {
    console.error('Failed to like post:', e)
  }
}

async function handleDelete(postId: string | number) {
  try {
    await deletePost(postId)
    posts.value = posts.value.filter(p => p.id !== postId)
  } catch (e) {
    console.error('Failed to delete post:', e)
  }
}

function handleClick(postId: string | number) {
  router.push('/post/' + postId)
}

function handleRefresh() {
  loadPosts(true)
}

onMounted(() => {
  loadPosts(true)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="container">
    <CreatePost @created="handleCreated" />
    <button class="btn btn-outline btn-sm" @click="handleRefresh" :disabled="refreshing">
      {{ refreshing ? '刷新中...' : '刷新' }}
    </button>
    <div v-if="posts.length === 0 && !loading" class="empty">
      暂无动态，快来发布第一条吧！
    </div>
    <PostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @like="handleLike"
      @delete="handleDelete"
      @click="handleClick"
    />
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="!hasMore && posts.length > 0" class="empty">没有更多了</div>
  </div>
</template>
