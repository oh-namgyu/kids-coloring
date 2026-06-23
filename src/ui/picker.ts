import { CATEGORIES } from '../templates'
import { el } from '../util'

export interface Picker {
  open: () => void
  close: () => void
}

// 카테고리별 헤더 + 썸네일 그리드 드로어. onSelect(id) 로 선택 통지.
// thumb.innerHTML 는 templates.ts 하드코딩 SVG 상수만 사용(사용자 입력 없음) → XSS 무관. 텍스트는 textContent.
export function buildPicker(root: HTMLElement, onSelect: (id: string) => void): Picker {
  const close = () => root.classList.remove('open')
  const grid = el('div', 'picker-grid')

  for (const cat of CATEGORIES) {
    grid.appendChild(el('div', 'picker-cat', { textContent: cat.name }))
    for (const t of cat.templates) {
      const item = el('button', 'thumb', { type: 'button' })
      item.innerHTML = t.svg
      item.appendChild(el('span', undefined, { textContent: t.name }))
      item.addEventListener('click', () => {
        onSelect(t.id)
        close()
      })
      grid.appendChild(item)
    }
  }

  const closeBtn = el('button', 'btn-wide', { type: 'button', textContent: '✖ 닫기' })
  closeBtn.addEventListener('click', close)
  grid.appendChild(closeBtn)

  root.appendChild(grid)
  root.addEventListener('click', (e) => {
    if (e.target === root) close() // 바깥 탭으로 닫기
  })

  return { open: () => root.classList.add('open'), close }
}
