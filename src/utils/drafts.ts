export interface Draft {
  id: string
  content: string
  files?: string
  updatedAt: string
}

const STORAGE_KEY = 'blog_drafts'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function getDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDraft(draft: Draft): void {
  const drafts = getDrafts()
  const idx = drafts.findIndex((d) => d.id === draft.id)
  const entry: Draft = {
    id: draft.id || generateId(),
    content: draft.content,
    files: draft.files,
    updatedAt: new Date().toISOString(),
  }
  if (idx >= 0) {
    drafts[idx] = entry
  } else {
    drafts.unshift(entry)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter((d) => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
}
