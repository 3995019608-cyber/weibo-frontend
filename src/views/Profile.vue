<template>
  <div class="container">
    <nav class="navbar">
      <button class="navbar-back" @click="router.back()">‹</button>
      <span class="navbar-title">{{ isOwner ? '我的' : '个人主页' }}</span>
      <span class="navbar-right"></span>
    </nav>

    <div class="profile-card">
      <div class="profile-avatar">{{ avatarInitial }}</div>
      <div class="profile-name">{{ profile.nickname || '用户' }}</div>
      <div class="profile-bio">{{ profile.bio || '这个人很懒，什么都没写...' }}</div>
      <div v-if="isOwner && !editing" style="margin-top:12px">
        <button class="btn btn-outline btn-sm" @click="startEdit">编辑资料</button>
      </div>
      <div v-if="editing" style="margin-top:12px">
        <input v-model="editNickname" class="form-input" placeholder="昵称" style="text-align:center;width:200px;margin:8px auto;display:block;border:1px solid #e5e5e5;border-radius:4px;padding:6px 10px" />
        <input v-model="editBio" class="form-input" placeholder="个人简介" style="text-align:center;width:200px;margin:8px auto;display:block;border:1px solid #e5e5e5;border-radius:4px;padding:6px 10px" />
        <div style="display:flex;justify-content:center;gap:12px;margin-top:8px">
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveProfile">{{ saving ? '保存中' : '保存' }}</button>
          <button class="btn btn-text btn-sm" @click="cancelEdit">取消</button>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div style="background:#fff">
      <div class="comment-list-title">TA的动态</div>
      <div v-if="posts.length === 0 && !loading" class="empty">暂无动态</div>
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @like="handleLike(post)"
        @delete="handleDelete(post)"
        @click="router.push('/post/' + post.id)"
      />
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="noMore && posts.length > 0" class="empty">没有更多了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getUserProfile, updateProfile, getPosts, likePost, deletePost } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const routeId = computed(() => route.params.id as string | undefined)
const isOwner = computed(() => !routeId.value || routeId.value === String(userStore.user?.id))
const targetUserId = computed(() => routeId.value ? Number(routeId.value) : userStore.user?.id)

const profile = ref<any>({ nickname: '', bio: '' })
const editing = ref(false)
const saving = ref(false)
const editNickname = ref('')
const editBio = ref('')
const posts = ref<any[]>([])
const page = ref(1)
const noMore = ref(false)
const loading = ref(false)

const avatarInitial = computed(() => (profile.value.nickname || '?').charAt(0))

async function loadProfile() {
  if (!targetUserId.value) return
  try {
    const res = await getUserProfile(targetUserId.value)
    profile.value = res.data.data
  } catch { /* ignore */ }
}

function startEdit() {
  editNickname.value = profile.value.nickname || ''
  editBio.value = profile.value.bio || ''
  editing.value = true
}

async function saveProfile() {
  if (saving.value) return
  saving.value = true
  try {
    const res = await updateProfile({ nickname: editNickname.value, bio: editBio.value })
    profile.value = res.data.data
    editing.value = false
  } catch { /* ignore */ }
  finally { saving.value = false }
}

function cancelEdit() { editing.value = false }

async function loadPosts() {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await getPosts(page.value, 10, targetUserId.value)
    const records = res.data.data?.records || []
    if (records.length < 10) noMore.value = true
    posts.value.push(...records)
    page.value++
  } finally { loading.value = false }
}

async function handleLike(post: any) {
  try {
    await likePost(post.id)
    post.isLiked = !post.isLiked
    post.likeCount += post.isLiked ? 1 : -1
  } catch { /* ignore */ }
}

async function handleDelete(post: any) {
  try {
    await deletePost(post.id)
    posts.value = posts.value.filter((p: any) => p.id !== post.id)
  } catch { /* ignore */ }
}

function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollHeight - scrollTop - clientHeight < 300 && !loading.value && !noMore.value) {
    loadPosts()
  }
}

onMounted(() => {
  loadProfile()
  loadPosts()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.profile-card { background: #fff; padding: 24px 16px; text-align: center; }
.profile-avatar { width: 64px; height: 64px; border-radius: 8px; background: #07c160; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; margin: 0 auto 12px; }
.profile-name { font-size: 18px; font-weight: 600; }
.profile-bio { font-size: 14px; color: #888; margin-top: 6px; }
.divider { height: 10px; background: #ededed; }
.comment-list-title { font-size: 15px; font-weight: 600; padding: 14px 16px; border-bottom: 1px solid #f0f0f0; }
</style>
