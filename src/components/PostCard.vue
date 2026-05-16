<template>
  <div class="post-card" @click="emit('click', post.id)">
    <div class="post-header">
      <div class="post-avatar" :style="{ backgroundColor: avatarBg }">
        {{ (post.user?.nickname || '?').charAt(0) }}
      </div>
      <div>
        <div class="post-nickname">{{ post.user?.nickname || '用户' }}</div>
        <div class="post-time">{{ formatTime(post.createdAt) }}</div>
      </div>
    </div>
    <div class="post-content" v-html="renderContent(post.content)"></div>
    <div v-if="imageList.length" class="post-images">
      <img v-for="(img, i) in imageList" :key="i" :src="img" />
    </div>
    <div v-if="fileList.length" class="post-files">
      <a v-for="(f, i) in fileList" :key="i" :href="f" target="_blank" class="post-file-link" @click.stop>📎 {{ getFileName(f) }}</a>
    </div>
    <div class="post-actions">
      <button class="post-action" :class="{ liked: post.isLiked }" @click.stop="emit('like', post.id)">
        <span class="action-icon">❤️</span> {{ post.likeCount || 0 }}
      </button>
      <button class="post-action" @click.stop>
        <span class="action-icon">💬</span> {{ post.commentCount || 0 }}
      </button>
      <button v-if="isOwner" class="post-action" @click.stop="emit('delete', post.id)">
        <span class="action-icon">🗑️</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { linkify } from '../utils'

const props = defineProps<{ post: any }>()

const emit = defineEmits<{
  like: [id: string | number]
  delete: [id: string | number]
  click: [id: string | number]
}>()

const userStore = useUserStore()

const isOwner = computed(() => {
  const postUserId = props.post.userId || props.post.user?.id
  return userStore.user?.id && String(postUserId) === String(userStore.user.id)
})

const avatarBg = computed(() => {
  const name = props.post.user?.nickname || '?'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${Math.abs(hash) % 360}, 55%, 72%)`
})

const imageList = computed(() => {
  if (!props.post.images) return []
  return props.post.images.split(',').filter(Boolean)
})

const fileList = computed(() => {
  if (!props.post.files) return []
  return props.post.files.split(',').filter(Boolean)
})

function renderContent(text: string): string {
  if (!text) return ''
  try { return linkify(text) } catch { return text }
}

function getFileName(url: string): string {
  const parts = url.split('/')
  const last = parts[parts.length - 1]
  return last.length > 20 ? last.slice(0, 20) + '...' : last
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const now = Date.now()
  const diff = Math.floor((now - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 604800) return Math.floor(diff / 86400) + '天前'
  return dateStr.slice(0, 10)
}
</script>

<style scoped>
.post-card { background: #fff; padding: 16px; margin-bottom: 10px; border-radius: 14px; box-shadow: 0 2px 12px rgba(176,126,222,0.08); cursor: pointer; }
.post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.post-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 600; flex-shrink: 0; }
.post-nickname { font-size: 14px; font-weight: 600; color: #B07EDE; }
.post-time { font-size: 11px; color: #C4A8B5; margin-top: 2px; }
.post-content { font-size: 15px; line-height: 1.7; word-break: break-word; white-space: pre-wrap; margin-bottom: 10px; }
.post-content :deep(a) { color: #B07EDE; text-decoration: underline; }
.post-images { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
.post-images img { width: calc((100% - 8px)/3); aspect-ratio: 1; object-fit: cover; border-radius: 8px; }
.post-files { margin-bottom: 10px; }
.post-file-link { display: block; font-size: 13px; color: #B07EDE; padding: 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.post-actions { display: flex; gap: 32px; padding-top: 10px; border-top: 0.5px solid #F2E0E8; }
.post-action { display: flex; align-items: center; gap: 4px; background: none; border: none; font-size: 13px; color: #997D8D; cursor: pointer; padding: 0; }
.post-action.liked { color: #FF6B8A; }
.action-icon { font-size: 18px; }
</style>
