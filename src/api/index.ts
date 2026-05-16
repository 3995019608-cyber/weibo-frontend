import axios from 'axios'

const isDev = import.meta.env.DEV
const api = axios.create({
  baseURL: isDev ? '/api' : 'https://tian-kong-9-weibo-backend.hf.space/api',
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function sendSms(phone: string, countryCode: string) {
  return api.post('/auth/send-sms', { phone, countryCode })
}

export function register(data: { phone: string; countryCode: string; smsCode: string; password: string; nickname?: string }) {
  return api.post('/auth/register', data)
}

export function login(data: { phone: string; countryCode: string; password: string }) {
  return api.post('/auth/login', data)
}

export function getMe() {
  return api.get('/auth/me')
}

export function getPosts(page = 1, size = 10) {
  return api.get('/posts', { params: { page, size } })
}

export function createPost(content: string) {
  return api.post('/posts', { content })
}

export function getPostDetail(id: number | string) {
  return api.get(`/posts/${id}`)
}

export function deletePost(id: number | string) {
  return api.delete(`/posts/${id}`)
}

export function likePost(id: number | string) {
  return api.post(`/posts/${id}/like`)
}

export function getComments(postId: number | string) {
  return api.get(`/posts/${postId}/comments`)
}

export function addComment(postId: number | string, content: string) {
  return api.post(`/posts/${postId}/comments`, { content })
}

export function getUserProfile(id: number | string) {
  return api.get(`/users/${id}`)
}

export function updateProfile(data: { nickname?: string; bio?: string; avatar?: string }) {
  return api.put('/users/me', data)
}

export default api
