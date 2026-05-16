<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getUserProfile, getPosts, updateProfile } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profile = ref<any>(null)
const posts = ref<any[]>([])
const loading = ref(true)
const postsLoading = ref(false)
const editNickname = ref('')
const editBio = ref('')
const editing = ref(false)
const saving = ref(false)

const userId = computed(() => route.params.id || userStore.user?.id)
const isOwnProfile = computed(() => {
  if (!route.params.id) return true
  return String(route.params.id) === String(userStore.user?.id)
})

async function loadProfile() {
  loading.value = true
  try {
    const res: any = await getUserProfile(userId.value)
    profile.value = res.data.data
    editNickname.value = profile.value?.nickname || ''
    editBio.value = profile.value?.bio || ''
  } catch (e) {
    console.error('Failed to load profile:', e)
  } finally {
    loading.value = false
  }
}

async function loadPosts() {
  postsLoading.value = true
  try {
    const res: any = await getPosts(1, 50)
    posts.value = res.data.data?.records || []
  } catch (e) {
    console.error('Failed to load user posts:', e)
  } finally {
    postsLoading.value = false
  }
}

function startEdit() {
  editNickname.value = profile.value?.nickname || ''
  editBio.value = profile.value?.bio || ''
  editing.value = true
}

async function saveProfile() {
  if (saving.value) return
  saving.value = true
  try {
    const res: any = await updateProfile({
      nickname: editNickname.value,
      bio: editBio.value
    })
    profile.value = res.data.data
    editing.value = false
  } catch (e) {
    console.error('Failed to update profile:', e)
  } finally {
    saving.value = false
  }
}

function cancelEdit() {
  editing.value = false
}

function handleClick(postId: string | number) {
  router.push('/post/' + postId)
}

onMounted(() => {
  loadProfile()
  loadPosts()
})
</script>

<template>
  <div class="container">
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else-if="profile">
      <div class="profile-header">
        <div class="post-avatar profile-avatar">
          <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.nickname" />
          <span v-else>{{ profile.nickname?.charAt(0) || '?' }}</span>
        </div>
        <template v-if="!editing">
          <h2>{{ profile.nickname }}</h2>
          <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
          <button v-if="isOwnProfile" class="btn btn-outline btn-sm" @click="startEdit">编辑资料</button>
        </template>
        <template v-else>
          <div class="edit-form">
            <input v-model="editNickname" class="form-input" placeholder="昵称" />
            <textarea v-model="editBio" class="form-input" placeholder="个人简介" rows="3"></textarea>
            <div class="edit-actions">
              <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveProfile">
                {{ saving ? '保存中...' : '保存' }}
              </button>
              <button class="btn btn-outline btn-sm" @click="cancelEdit">取消</button>
            </div>
          </div>
        </template>
      </div>
      <h3>TA的动态</h3>
      <div v-if="postsLoading" class="loading">加载中...</div>
      <div v-else-if="posts.length === 0" class="empty">暂无动态</div>
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @click="handleClick"
        @like="() => {}"
        @delete="() => {}"
      />
    </template>
    <div v-else class="empty">用户不存在</div>
  </div>
</template>

<style scoped>
.profile-header {
  text-align: center;
  padding: 20px 0;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  font-size: 32px;
  margin: 0 auto 16px;
}
.bio {
  color: #666;
}
.edit-form {
  max-width: 400px;
  margin: 0 auto;
}
.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}
</style>
