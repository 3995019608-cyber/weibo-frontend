<template>
  <div class="create-post">
    <textarea
      v-model="content"
      class="form-input"
      placeholder="这一刻的想法..."
      :maxlength="500"
      rows="3"
    ></textarea>
    <div class="create-post-footer">
      <span class="char-count">{{ content.length }}/500</span>
      <button
        class="btn btn-primary btn-sm"
        :disabled="!content.trim() || submitting"
        @click="handleSubmit"
      >发布</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createPost } from '../api'

const emit = defineEmits<{ created: [post: any] }>()

const content = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!content.value.trim() || submitting.value) return
  submitting.value = true
  try {
    const res = await createPost(content.value.trim())
    emit('created', res.data.data)
    content.value = ''
  } finally {
    submitting.value = false
  }
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
