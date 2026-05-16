<template>
  <div class="post-card" @click="$emit('click')">
    <div class="post-header">
      <div
        class="post-avatar"
        :style="{ backgroundColor: avatarBg }"
      >{{ post.user?.nickname?.charAt(0) || '?' }}</div>
      <div class="post-nickname">{{ post.user?.nickname }}</div>
      <div class="post-time">{{ formatTime(post.createdAt) }}</div>
    </div>
    <div class="post-content">{{ post.content }}</div>
    <div v-if="imageList.length" class="post-images">
      <img
        v-for="(img, idx) in imageList"
        :key="idx"
        :src="img"
        class="post-image"
        @click.stop="previewImage(img)"
      />
    </div>
    <div class="post-actions">
      <div class="post-action" @click.stop="$emit('like')">
        <span class="action-icon" :class="{ liked: post.isLiked }">❤️</span>
      </div>
      <div class="post-action">
        <span class="action-icon">💬</span>
        <span v-if="post.commentCount">{{ post.commentCount }}</span>
      </div>
      <div class="post-action">
        <span class="action-icon">🔄</span>
        <span v-if="post.repostCount">{{ post.repostCount }}</span>
      </div>
      <div v-if="isOwner" class="post-action" @click.stop="$emit('delete')">
        <span class="action-icon">🗑️</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface PostUser {
  id: string
  nickname: string
  avatar?: string
}

interface Post {
  id: string
  content: string
  images?: string
  likeCount: number
  commentCount: number
  repostCount: number
  user: PostUser
  isLiked: boolean
  createdAt: string
}

const props = defineProps<{ post: Post }>()
const emit = defineEmits<{
  like: []
  delete: []
  click: []
}>()

const currentUserId = ''

const isOwner = computed(() => currentUserId && props.post.user?.id === currentUserId)

const avatarBg = computed(() => {
  const name = props.post.user?.nickname || '?'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 50%, 70%)`
})

const imageList = computed(() => {
  if (!props.post.images) return []
  return props.post.images.split(',').filter(Boolean).slice(0, 9)
})

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

function previewImage(url: string) {
  // image preview logic
}
</script>

<style scoped>
.post-card {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 0;
}
.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}
.post-nickname {
  color: #576b95;
  font-size: 15px;
  font-weight: 500;
  flex: 1;
}
.post-time {
  color: #b0b0b0;
  font-size: 13px;
}
.post-content {
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 12px;
}
.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 12px;
}
.post-images img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 2px;
}
.post-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 8px;
}
.post-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #888;
  cursor: pointer;
}
.action-icon {
  font-size: 18px;
  line-height: 1;
}
.action-icon.liked {
  color: #e74c3c;
}
</style>
