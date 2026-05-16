<template>
  <div class="create-post">
    <textarea
      ref="textareaRef"
      v-model="content"
      placeholder="这一刻的想法..."
      :maxlength="500"
      rows="2"
    ></textarea>
    <div class="create-post-footer">
      <div class="footer-left">
        <label class="tool-btn" title="上传文件">
          📎
          <input type="file" hidden @change="handleFile" />
        </label>
        <button class="tool-btn" title="保存草稿" @click="saveDraftLocal">💾</button>
        <button class="tool-btn" title="草稿列表" @click="showDrafts = !showDrafts">📂</button>
      </div>
      <div class="footer-right">
        <span class="char-count">{{ content.length }}/500</span>
        <button
          class="publish-btn"
          :disabled="!content.trim() || submitting"
          @click="handleSubmit"
        >{{ submitting ? '...' : '发布' }}</button>
      </div>
    </div>
    <div v-if="showDrafts && localDrafts.length" class="drafts-dropdown">
      <div v-for="d in localDrafts" :key="d.id" class="draft-item" @click="loadDraft(d)">
        <span class="draft-text">{{ d.content.slice(0, 40) || '(空)' }}</span>
        <button class="draft-delete" @click.stop="removeDraft(d.id)">✕</button>
      </div>
    </div>
    <div v-if="error" class="form-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits<{ created: [post: any] }>()

const content = ref('')
const submitting = ref(false)
const showDrafts = ref(false)
const error = ref('')
const localDrafts = ref<{ id: string; content: string }[]>([])

loadDraftsFromStorage()

function loadDraftsFromStorage() {
  try {
    const raw = localStorage.getItem('blog_drafts')
    localDrafts.value = raw ? JSON.parse(raw) : []
  } catch { localDrafts.value = [] }
}

function saveDraftsToStorage() {
  localStorage.setItem('blog_drafts', JSON.stringify(localDrafts.value))
}

function saveDraftLocal() {
  if (!content.value.trim()) return
  localDrafts.value.unshift({ id: Date.now().toString(36), content: content.value.trim() })
  if (localDrafts.value.length > 20) localDrafts.value = localDrafts.value.slice(0, 20)
  saveDraftsToStorage()
}

function loadDraft(d: { id: string; content: string }) {
  content.value = d.content
  showDrafts.value = false
}

function removeDraft(id: string) {
  localDrafts.value = localDrafts.value.filter(d => d.id !== id)
  saveDraftsToStorage()
}

async function handleFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const token = localStorage.getItem('token') || ''
    const isDev = window.location.hostname === 'localhost'
    const base = isDev ? '/api' : 'https://tian-kong-9-weibo-backend.hf.space/api'
    const res = await axios.post(base + '/upload', fd, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    const url = res.data?.data?.url
    if (url) content.value = content.value + (content.value ? '\n' : '') + url
    else error.value = res.data?.message || '上传失败'
  } catch (e: any) {
    error.value = e.response?.data?.message || '上传失败'
  } finally { input.value = '' }
}

async function handleSubmit() {
  if (!content.value.trim() || submitting.value) return
  error.value = ''
  submitting.value = true
  try {
    const token = localStorage.getItem('token') || ''
    const isDev = window.location.hostname === 'localhost'
    const base = isDev ? '/api' : 'https://tian-kong-9-weibo-backend.hf.space/api'
    const res = await axios.post(base + '/posts', { content: content.value.trim() }, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    })
    if (res.data?.code === 200 && res.data?.data) {
      emit('created', res.data.data)
      content.value = ''
      localDrafts.value = []
      saveDraftsToStorage()
    } else {
      error.value = res.data?.message || '发布失败'
    }
  } catch (e: any) {
    if (e.response?.status === 401) {
      error.value = '登录已过期，请重新登录'
      setTimeout(() => { window.location.href = '/login' }, 1500)
    } else {
      error.value = e.response?.data?.message || '网络错误'
    }
  } finally { submitting.value = false }
}
</script>

<style scoped>
.create-post {
  background: #fff; border-radius: 14px; padding: 14px 16px;
  margin-bottom: 10px; box-shadow: 0 2px 12px rgba(176,126,222,0.08);
  position: relative;
}
.create-post textarea {
  width: 100%; border: none; outline: none; resize: none;
  font-size: 15px; line-height: 1.6; padding: 4px 0;
  min-height: 36px; font-family: inherit; color: #4A3548;
}
.create-post textarea::placeholder { color: #C4A8B5; }
.create-post-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; }
.footer-left { display: flex; align-items: center; gap: 6px; }
.footer-right { display: flex; align-items: center; gap: 8px; }
.tool-btn { background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px 6px; }
.tool-btn input[type="file"] { display: none; }
.char-count { font-size: 12px; color: #C4A8B5; }
.publish-btn {
  background: linear-gradient(135deg, #FF6B9D, #B07EDE);
  color: #fff; border: none; border-radius: 18px;
  padding: 6px 20px; font-size: 13px; font-weight: 600; cursor: pointer;
}
.publish-btn:disabled { background: #E8D5F0; cursor: not-allowed; }
.drafts-dropdown {
  position: absolute; left: 16px; right: 16px; top: 100%; background: #fff;
  border: 1px solid #F2E0E8; border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 20;
}
.draft-item { display: flex; align-items: center; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f5f5f5; }
.draft-item:hover { background: #FFF0F5; }
.draft-text { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.draft-delete { background: none; border: none; color: #ccc; font-size: 14px; cursor: pointer; }
.form-error { color: #FF6B8A; font-size: 13px; margin-top: 8px; }
</style>
