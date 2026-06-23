// 공통 유틸 — 중복 로직 금지, 여기서 재사용

export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// DOM 엘리먼트 생성 헬퍼 (UI 공통)
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  props?: Partial<HTMLElementTagNameMap[K]>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (props) Object.assign(node, props)
  return node
}
