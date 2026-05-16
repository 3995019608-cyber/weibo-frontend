<template>
  <div class="container">
    <div class="navbar">
      <div class="navbar-back" @click="goBack">←</div>
      <div class="navbar-brand">详情</div>
      <div class="navbar-action"></div>
    </div>
    <PostCard
      v-if="post"
      :post="post"
      @like="handleLike"
      @click="() => {}"
    />
    <div class="divider"></div>
    <div class="comment-list">
      <div class="comment-list-title">评论</div>
      <div v-if="comments.length === 0 && !commentLoading" class="empty">暂无评论</div>
      <div
        v-for="item in comments"
        :key="item.id"
        class="comment-item"
      >
        <div class="comment-avatar">{{ item.user?.nickname?.charAt(0) || '?' }}</div>
        <div class="comment-body">
          <div class="comment-name">{{ item.user?.nickname }}</div>
          <div class="comment-text">{{ item.content }}</div>
          <div class="comment-time">{{ formatTime(item.createdAt) }}</div>
        </div>
      </div>
      <div v-if="commentLoading" class="loading">加载中...</div>
    </div>
    <div class="comment-bar">
      <input
        v-model="commentText"
        class="form-input"
        placeholder="写评论..."
        @keyup.enter="handleComment"
      />
      <button class="btn btn-text" @click="handleComment" :disabled="!commentText.trim()">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostDetail, addComment, likePost } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()

const post = ref<any>(null)
const comments = ref<any[]>([])
const commentText = ref('')
const commentLoading = ref(false)

function goBack() {
  router.back()
}

async function loadPost() {
  try {
    const res = await getPostDetail(route.params.id as string)
    post.value = res.data.data
    comments.value = res.data.data?.comments || []
  } catch {
    // ignore
  }
}

async function handleLike() {
  if (!post.value) return
  try {
    await likePost(post.value.id)
    post.value.isLiked = !post.value.isLiked
    post.value.likeCount += post.value.isLiked ? 1 : -1
  } catch {
    // ignore
  }
}

async function handleComment() {
  if (!commentText.value.trim()) return
  try {
    const res = await addComment(post.value.id, commentText.value.trim())
    comments.value.push(res.data.data)
    commentText.value = ''
  } catch {
    // ignore
  }
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.container {
  background: #ededed;
  min-height: 100vh;
  padding-bottom: 60px;
}
.navbar {
  display: flex;
  align-items: center;
  height: 44px;
  background: #ededed;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.navbar-back {
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  color: #333;
}
.navbar-brand {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  color: #333;
}
.navbar-action {
  width: 40px;
}
.divider {
  height: 10px;
  background: #ededed;
}
.comment-list {
  background: #fff;
  padding: 0 16px;
}
.comment-list-title {
  font-size: 15px;
  font-weight: 600;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-item {
  display: flex;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}
.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}
.comment-body {
  flex: 1;
  min-width: 0;
}
.comment-name {
  font-size: 14px;
  color: #576b95;
  margin-bottom: 4px;
}
.comment-text {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
  margin-bottom: 4px;
}
.comment-time {
  font-size: 12px;
  color: #b0b0b0;
}
.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f7f7f7;
  border-top: 1px solid #e5e5e5;
}
.comment-bar .form-input {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
.btn-text {
  border: none;
  background: none;
  color: #576b95;
  font-size: 15px;
  cursor: pointer;
  padding: 0 4px;
}
.btn-text:disabled {
  color: #ccc;
  cursor: not-allowed;
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
