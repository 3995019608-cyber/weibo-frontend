<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostDetail, getComments, addComment } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()

const post = ref<any>(null)
const comments = ref<any[]>([])
const commentText = ref('')
const submitting = ref(false)
const loading = ref(true)

const postId = route.params.id as string

async function loadPost() {
  loading.value = true
  try {
    const res: any = await getPostDetail(postId)
    post.value = res.data.data
  } catch (e) {
    console.error('Failed to load post:', e)
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const res: any = await getComments(postId)
    comments.value = res.data.data || []
  } catch (e) {
    console.error('Failed to load comments:', e)
  }
}

async function handleAddComment() {
  if (!commentText.value.trim() || submitting.value) return
  submitting.value = true
  try {
    const res: any = await addComment(postId, commentText.value)
    comments.value.push(res.data.data)
    if (post.value) {
      post.value.commentCount = (post.value.commentCount || 0) + 1
    }
    commentText.value = ''
  } catch (e) {
    console.error('Failed to add comment:', e)
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  loadPost()
  loadComments()
})
</script>

<template>
  <div class="container">
    <button class="btn btn-outline btn-sm" @click="goBack">← 返回</button>
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else-if="post">
      <PostCard
        :post="post"
        @like="() => {}"
        @delete="goBack"
        @click="() => {}"
      />
      <div class="comments-section">
        <h3>评论 ({{ comments.length }})</h3>
        <div v-if="comments.length === 0" class="empty">暂无评论</div>
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">
            <img v-if="comment.user?.avatar" :src="comment.user.avatar" :alt="comment.user?.nickname" />
            <span v-else>{{ comment.user?.nickname?.charAt(0) || '?' }}</span>
          </div>
          <div class="comment-body">
            <strong>{{ comment.user?.nickname }}</strong>
            <p>{{ comment.content }}</p>
          </div>
        </div>
      </div>
      <div class="add-comment">
        <input
          v-model="commentText"
          class="form-input"
          placeholder="写下你的评论..."
          @keyup.enter="handleAddComment"
        />
        <button class="btn btn-primary" :disabled="!commentText.trim() || submitting" @click="handleAddComment">
          {{ submitting ? '发送中...' : '发送' }}
        </button>
      </div>
    </template>
    <div v-else class="empty">帖子不存在或已被删除</div>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: 20px;
}
.add-comment {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
.add-comment input {
  flex: 1;
}
</style>
