<template>
  <div class="container">
    <div class="navbar">
      <div class="navbar-back" @click="goBack">←</div>
      <div class="navbar-brand">个人主页</div>
      <div class="navbar-action"></div>
    </div>
    <div class="profile-card">
      <div class="profile-avatar">{{ avatarInitial }}</div>
      <div class="profile-name">{{ profile.nickname }}</div>
      <div class="profile-bio">{{ profile.bio || '这个人很懒，什么都没写...' }}</div>
      <div v-if="isOwner && !editing" class="profile-edit">
        <button class="btn btn-outline btn-sm" @click="startEdit">编辑资料</button>
      </div>
      <div v-if="editing" class="profile-edit">
        <input v-model="editNickname" class="form-input" placeholder="昵称" />
        <input v-model="editBio" class="form-input" placeholder="个人简介" />
        <div class="edit-actions">
          <button class="btn btn-sm btn-primary" @click="saveProfile">保存</button>
          <button class="btn btn-sm btn-text" @click="cancelEdit">取消</button>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="profile-posts">
      <div class="comment-list-title">TA的动态</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfile, updateProfile, getPosts, likePost, deletePost } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()

const userId = computed(() => (route.params.id as string) || 'me')

const currentUser = { id: '', nickname: '', bio: '' }
const isOwner = computed(() => !route.params.id || userId.value === currentUser.id)

const profile = ref<{ nickname: string; bio: string }>({ nickname: '', bio: '' })
const editing = ref(false)
const editNickname = ref('')
const editBio = ref('')
const posts = ref<any[]>([])
const page = ref(1)
const noMore = ref(false)
const loading = ref(false)

const avatarInitial = computed(() => (profile.value.nickname || '?').charAt(0))

function goBack() {
  router.back()
}

async function loadProfile() {
  try {
    const res = await getUserProfile(userId.value)
    profile.value = res.data.data
    editNickname.value = profile.value.nickname
    editBio.value = profile.value.bio
  } catch {
    // ignore
  }
}

function startEdit() {
  editNickname.value = profile.value.nickname
  editBio.value = profile.value.bio
  editing.value = true
}

async function saveProfile() {
  try {
    await updateProfile({ nickname: editNickname.value, bio: editBio.value })
    profile.value.nickname = editNickname.value
    profile.value.bio = editBio.value
    editing.value = false
  } catch {
    // ignore
  }
}

function cancelEdit() {
  editing.value = false
}

async function loadPosts() {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await getPosts(page.value, 10, userId.value)
    const records = res.data.data?.records || []
    if (records.length < 10) noMore.value = true
    posts.value.push(...records)
    page.value++
  } finally {
    loading.value = false
  }
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
  loadProfile()
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
.profile-card {
  background: #fff;
  padding: 24px 16px;
  text-align: center;
}
.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: #07c160;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  margin: 0 auto 12px;
}
.profile-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
.profile-bio {
  font-size: 14px;
  color: #888;
  margin-bottom: 12px;
  padding: 0 20px;
}
.profile-edit {
  margin-top: 8px;
}
.profile-edit .form-input {
  display: block;
  width: 200px;
  margin: 8px auto;
  padding: 6px 10px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  text-align: center;
}
.edit-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}
.btn {
  cursor: pointer;
  border: none;
}
.btn-sm {
  font-size: 14px;
  padding: 4px 16px;
  border-radius: 4px;
}
.btn-primary {
  background: #07c160;
  color: #fff;
}
.btn-outline {
  background: #fff;
  color: #576b95;
  border: 1px solid #576b95;
}
.btn-text {
  background: none;
  color: #888;
}
.divider {
  height: 10px;
  background: #ededed;
}
.profile-posts {
  background: #fff;
}
.comment-list-title {
  font-size: 15px;
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
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
