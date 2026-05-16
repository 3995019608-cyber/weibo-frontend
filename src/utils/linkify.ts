export function linkify(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')

  return escaped.replace(
    /(https?:\/\/[^\s<>]+)/gi,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  )
}
