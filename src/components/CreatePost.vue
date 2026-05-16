<template>
  <div class="create-post">
    <textarea
      v-model="content"
      class="form-input"
      placeholder="这一刻的想法...，支持粘贴链接和上传文件 ✨"
      :maxlength="500"
      rows="3"
    ></textarea>
    <div class="create-post-footer">
      <div class="footer-left">
        <label class="tool-btn" title="上传文件">
          📎
          <input type="file" hidden @change="handleFile" />
        </label>
        <button class="tool-btn" title="保存草稿" @click="handleSaveDraft">💾</button>
        <div class="drafts-wrapper">
          <button class="tool-btn" title="草稿列表" @click="showDrafts = !showDrafts">📂</button>
          <div v-if="showDrafts && drafts.length" class="drafts-dropdown">
            <div
              v-for="draft in drafts"
              :key="draft.id"
              class="draft-item"
              @click="loadDraft(draft)"
            >
              <span class="draft-text">{{ draft.content.slice(0, 40) || '(空)' }}</span>
              <span class="draft-time">{{ formatDraftTime(draft.updatedAt) }}</span>
              <button class="draft-delete" @click.stop="deleteDraft(draft.id)">✕</button>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-right">
        <span class="char-count">{{ content.length }}/500</span>
        <button
          class="btn btn-primary btn-sm"
          :disabled="!content.trim() || submitting"
          @click="handleSubmit"
        >发布</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { createPost, uploadFile } from '../api'
import { saveDraft, getDrafts, deleteDraft } from '../utils/drafts'
import type { Draft } from '../utils/drafts'

const emit = defineEmits<{ created: [post: unknown] }>()

const content = ref('')
const submitting = ref(false)
const showDrafts = ref(false)
const drafts = ref<Draft[]>([])

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function refreshDrafts() {
  drafts.value = getDrafts()
}

refreshDrafts()

watch(content, (val) => {
  if (!val.trim()) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    saveDraft({
      id: '',
      content: val,
      updatedAt: '',
    })
    refreshDrafts()
  }, 2000)
})

async function handleFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const res = await uploadFile(file)
    const url = res.data?.data?.url || res.data?.url
    if (url) {
      content.value = content.value + (content.value ? '\n' : '') + url
    }
  } catch {
    // upload failed silently
  } finally {
    input.value = ''
  }
}

function handleSaveDraft() {
  if (!content.value.trim()) return
  saveDraft({
    id: '',
    content: content.value,
    updatedAt: '',
  })
  refreshDrafts()
}

function loadDraft(draft: Draft) {
  content.value = draft.content
  showDrafts.value = false
}

async function handleSubmit() {
  if (!content.value.trim() || submitting.value) return
  submitting.value = true
  try {
    const res = await createPost(content.value.trim())
    const post = res.data?.data
    if (post) {
      emit('created', post)
      content.value = ''
      drafts.value.forEach((d) => deleteDraft(d.id))
      drafts.value = []
    }
  } catch (e) {
    console.error('Post failed:', e)
  } finally {
    submitting.value = false
  }
}

function formatDraftTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hour}:${min}`
}
</script>

<style scoped>
.create-post {
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 10px;
}
.create-post textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  padding: 8px 0;
  min-height: 80px;
  box-sizing: border-box;
}
.create-post textarea::placeholder {
  color: #b0b0b0;
}
.create-post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 4px;
}
.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tool-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1;
  position: relative;
}
.tool-btn input[type="file"] {
  display: none;
}
.drafts-wrapper {
  position: relative;
}
.drafts-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  min-width: 220px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 20;
}
.draft-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}
.draft-item:hover {
  background: #f5f5f5;
}
.draft-item:last-child {
  border-bottom: none;
}
.draft-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.draft-time {
  color: #b0b0b0;
  font-size: 11px;
  flex-shrink: 0;
}
.draft-delete {
  background: none;
  border: none;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}
.draft-delete:hover {
  color: #e74c3c;
}
.char-count {
  font-size: 13px;
  color: #b0b0b0;
}
.create-post-footer .btn {
  width: 64px;
  height: 32px;
  border-radius: 16px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary {
  background: #07c160;
  color: #fff;
}
.btn-primary:disabled {
  background: #a8e6c1;
  cursor: not-allowed;
}
.btn-sm {
  padding: 4px 12px;
}
</style>
