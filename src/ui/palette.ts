import { COLORS } from '../config'
import { el } from '../util'

// 색 동그라미 12개. 한 번에 하나만 active.
export function buildPalette(root: HTMLElement, onPick: (color: string) => void): void {
  const swatches: HTMLElement[] = []
  const grid = el('div', 'swatch-grid')
  COLORS.forEach((color, i) => {
    const sw = el('button', 'swatch', { type: 'button', title: color })
    // 배경색은 스타일이 아니라 이 버튼의 '데이터'(고른 색) — config.COLORS 단일 SoT에서 바인딩
    sw.style.background = color
    sw.addEventListener('click', () => {
      swatches.forEach((s) => s.classList.remove('active'))
      sw.classList.add('active')
      onPick(color)
    })
    if (i === 0) sw.classList.add('active')
    swatches.push(sw)
    grid.appendChild(sw)
  })
  root.appendChild(grid)
}
