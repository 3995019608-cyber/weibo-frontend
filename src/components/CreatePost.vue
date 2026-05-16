<script setup lang="ts">
import { ref } from 'vue'
import { createPost } from '../api'

const emit = defineEmits<{
  created: [post: any]
}>()

const content = ref('')
const submitting = ref(false)
const maxChars = 500

async function handleSubmit() {
  if (!content.value.trim() || submitting.value) return
  submitting.value = true
  try {
    const res: any = await createPost(content.value)
    emit('created', res.data.data)
    content.value = ''
  } catch (e) {
    console.error('Failed to create post:', e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="create-post container">
    <textarea
      v-model="content"
      class="form-input"
      placeholder="分享你的想法..."
      :maxlength="maxChars"
      rows="3"
    ></textarea>
    <div class="create-post-footer">
      <span class="char-count">{{ content.length }}/{{ maxChars }}</span>
      <button class="btn btn-primary" :disabled="!content.trim() || submitting" @click="handleSubmit">
        {{ submitting ? '发布中...' : '发布' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.create-post {
  margin-bottom: 16px;
}
.create-post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.char-count {
  font-size: 12px;
  color: #999;
}
</style>
