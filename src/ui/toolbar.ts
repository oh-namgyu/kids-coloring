import { AppState } from '../state'
import { BRUSH_SIZES, PENS } from '../config'
import { SparkleAudio } from '../audio'
import { el } from '../util'

export interface ToolbarActions {
  openPicker: () => void
  undo: () => void
  clearAll: () => void
  save: () => void
  onSymmetry?: (on: boolean) => void
}

const SIZE_CLASS = ['sm', 'md', 'lg']

function iconBtn(icon: string, title: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', 'btn-tool', { type: 'button', textContent: icon, title })
  b.addEventListener('click', onClick)
  return b
}

// 모든 도구 버튼. 지우개·되돌리기는 왼쪽 패널(leftRoot), 나머지는 오른쪽(root).
// state 를 바꾼 뒤 refresh() 로 active 표시 일괄 갱신.
export function buildToolbar(root: HTMLElement, leftRoot: HTMLElement, state: AppState, actions: ToolbarActions, audio: SparkleAudio): void {
  const penBtns = new Map<string, HTMLElement>()
  const sizeBtns: HTMLElement[] = []
  const eraserBtn = iconBtn('🧽', '지우개', () => { state.eraser = !state.eraser; refresh() })
  const symBtn = iconBtn('🦋', '데칼코마니(대칭)', () => {
    state.symmetry = !state.symmetry
    refresh()
    actions.onSymmetry?.(state.symmetry)
  })

  function refresh(): void {
    penBtns.forEach((b, type) => b.classList.toggle('active', !state.eraser && state.pen === type))
    sizeBtns.forEach((b, i) => b.classList.toggle('active', state.size === BRUSH_SIZES[i]))
    eraserBtn.classList.toggle('active', state.eraser)
    symBtn.classList.toggle('active', state.symmetry)
  }

  root.appendChild(iconBtn('📋', '그림 고르기', actions.openPicker))
  for (const p of PENS) {
    const b = iconBtn(p.icon, p.label, () => { state.pen = p.type; state.eraser = false; refresh() })
    penBtns.set(p.type, b)
    root.appendChild(b)
  }
  BRUSH_SIZES.forEach((sz, i) => {
    const b = el('button', 'btn-tool', { type: 'button', title: '굵기' })
    b.appendChild(el('span', `dot ${SIZE_CLASS[i]}`))
    b.addEventListener('click', () => { state.size = sz; refresh() })
    sizeBtns.push(b)
    root.appendChild(b)
  })
  root.appendChild(symBtn)
  // 지우개(스폰지)·되돌리기 → 왼쪽 패널, 색상 그리드 아래 한 묶음으로 항상 노출
  const leftTools = el('div', 'left-tools')
  leftTools.append(eraserBtn, iconBtn('↩️', '되돌리기', actions.undo))
  leftRoot.appendChild(leftTools)
  root.appendChild(iconBtn('🗑️', '전체 지우기', () => { if (confirm('그림을 모두 지울까요?')) actions.clearAll() }))
  root.appendChild(iconBtn('💾', '저장', actions.save))
  const muteBtn = iconBtn('🔊', '소리 켜기/끄기', () => {
    audio.muted = !audio.muted
    muteBtn.textContent = audio.muted ? '🔇' : '🔊'
  })
  root.appendChild(muteBtn)

  refresh()
}
