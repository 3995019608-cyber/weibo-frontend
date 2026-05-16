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
  <div class="create-post-card">
    <div class="post-header">
      <h3 class="post-title">发布新动态</h3>
    </div>
    
    <div class="post-body">
      <textarea
        v-model="content"
        class="post-textarea"
        placeholder="分享你的想法..."
        :maxlength="maxChars"
        rows="5"
      ></textarea>
    </div>
    
    <div class="post-footer">
      <div class="footer-left">
        <span class="char-count" :class="{ 'warning': content.length > maxChars * 0.8 }">
          {{ content.length }}/{{ maxChars }}
        </span>
      </div>
      <div class="footer-right">
        <button class="btn btn-refresh" @click="content = ''" :disabled="!content || submitting">
          清空
        </button>
        <button 
          class="btn btn-submit" 
          :disabled="!content.trim() || submitting" 
          @click="handleSubmit"
        >
          {{ submitting ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-post-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.create-post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.post-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.post-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.post-body {
  padding: 16px 20px;
}

.post-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

.post-textarea:focus {
  outline: none;
  border-color: #ff8200;
  box-shadow: 0 0 0 2px rgba(255, 130, 0, 0.1);
}

.post-textarea::placeholder {
  color: #aaa;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  gap: 10px;
}

.char-count {
  font-size: 13px;
  color: #999;
  transition: color 0.3s ease;
}

.char-count.warning {
  color: #ff6b6b;
  font-weight: 500;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-refresh:hover:not(:disabled) {
  background: #ebebeb;
  border-color: #d0d0d0;
}

.btn-submit {
  background: linear-gradient(135deg, #ff8200 0%, #ff6b00 100%);
  color: #fff;
  min-width: 80px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 130, 0, 0.3);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}
</style>
