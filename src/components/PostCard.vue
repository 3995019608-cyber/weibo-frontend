<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const props = defineProps<{
  post: {
    id: string | number
    content: string
    images?: string
    likeCount: number
    commentCount: number
    repostCount: number
    user: {
      nickname: string
      avatar?: string
      id: string | number
    }
    isLiked: boolean
    createdAt: string
  }
}>()

const emit = defineEmits<{
  like: [id: string | number]
  delete: [id: string | number]
  click: [id: string | number]
}>()

const userStore = useUserStore()

const isOwner = computed(() => {
  const postUserId = (props.post as any).userId ?? props.post.user?.id
  return postUserId === userStore.user?.id
})

const avatarText = computed(() => props.post.user?.nickname?.charAt(0) || '?')

const imageList = computed(() => {
  if (!props.post.images) return []
  return props.post.images.split(',').filter(Boolean)
})

function formatTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 2592000) return Math.floor(diff / 86400) + '天前'
  const d = new Date(dateStr)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function handleLike() {
  emit('like', props.post.id)
}

function handleDelete() {
  emit('delete', props.post.id)
}

function handleClick() {
  emit('click', props.post.id)
}
</script>

<template>
  <div class="post-card" @click="handleClick">
    <div class="post-header">
      <div class="post-avatar">
        <img v-if="post.user.avatar" :src="post.user.avatar" :alt="post.user.nickname" />
        <span v-else>{{ avatarText }}</span>
      </div>
      <div>
        <strong>{{ post.user.nickname }}</strong>
        <small>{{ formatTime(post.createdAt) }}</small>
      </div>
    </div>
    <div class="post-content">{{ post.content }}</div>
    <div v-if="imageList.length" class="images-grid">
      <img v-for="(img, i) in imageList" :key="i" :src="img.trim()" alt="post image" />
    </div>
    <div class="post-actions">
      <button class="post-action-btn" @click.stop>
        🔄 {{ post.repostCount }}
      </button>
      <button class="post-action-btn" @click.stop>
        💬 {{ post.commentCount }}
      </button>
      <button class="post-action-btn" :class="{ liked: post.isLiked }" @click.stop="handleLike">
        ❤️ {{ post.likeCount }}
      </button>
      <button v-if="isOwner" class="post-action-btn btn-sm btn-outline" @click.stop="handleDelete">
        删除
      </button>
    </div>
  </div>
</template>

<style scoped>
.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 8px;
}
.images-grid img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.post-action-btn.liked {
  color: red;
}
</style>
