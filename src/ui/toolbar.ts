import { AppState } from '../state'
import { BRUSH_SIZES, PENS } from '../config'
import { SparkleAudio } from '../audio'
import { el } from '../util'
import { t, bindTitle, bindText, getLang, toggleLang } from '../i18n'

export interface ToolbarActions {
  openPicker: () => void
  undo: () => void
  clearAll: () => void
  save: () => void
  onSymmetry?: (on: boolean) => void
}

const SIZE_CLASS = ['sm', 'md', 'lg']

// title 은 i18n 키. bindTitle 로 언어 변경 시 자동 갱신.
function iconBtn(icon: string, titleKey: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', 'btn-tool', { type: 'button', textContent: icon })
  bindTitle(b, titleKey)
  b.addEventListener('click', onClick)
  return b
}

// 모든 도구 버튼. 지우개·되돌리기는 왼쪽 패널(leftRoot), 나머지는 오른쪽(root).
// state 를 바꾼 뒤 refresh() 로 active 표시 일괄 갱신.
export function buildToolbar(root: HTMLElement, leftRoot: HTMLElement, state: AppState, actions: ToolbarActions, audio: SparkleAudio): void {
  const penBtns = new Map<string, HTMLElement>()
  const sizeBtns: HTMLElement[] = []
  const eraserBtn = iconBtn('🧽', 'eraser', () => { state.eraser = !state.eraser; refresh() })
  const symBtn = iconBtn('🦋', 'mirror', () => {
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

  root.appendChild(iconBtn('📋', 'pick', actions.openPicker))
  for (const p of PENS) {
    const b = iconBtn(p.icon, `pen_${p.type}`, () => { state.pen = p.type; state.eraser = false; refresh() })
    penBtns.set(p.type, b)
    root.appendChild(b)
  }
  BRUSH_SIZES.forEach((sz, i) => {
    const b = el('button', 'btn-tool', { type: 'button' })
    bindTitle(b, 'size')
    b.appendChild(el('span', `dot ${SIZE_CLASS[i]}`))
    b.addEventListener('click', () => { state.size = sz; refresh() })
    sizeBtns.push(b)
    root.appendChild(b)
  })
  root.appendChild(symBtn)
  // 지우개(스폰지)·되돌리기 → 왼쪽 패널, 색상 그리드 아래 한 묶음으로 항상 노출
  const leftTools = el('div', 'left-tools')
  leftTools.append(eraserBtn, iconBtn('↩️', 'undo', actions.undo))
  leftRoot.appendChild(leftTools)
  root.appendChild(iconBtn('🗑️', 'clearAll', () => { if (confirm(t('clearConfirm'))) actions.clearAll() }))
  root.appendChild(iconBtn('💾', 'save', actions.save))
  const muteBtn = iconBtn('🔊', 'sound', () => {
    audio.muted = !audio.muted
    muteBtn.textContent = audio.muted ? '🔇' : '🔊'
  })
  root.appendChild(muteBtn)

  // 언어 토글(EN ↔ 한) — 텍스트는 전환 대상 언어를 표시.
  const langBtn = el('button', 'btn-tool lang-btn', { type: 'button' })
  bindTitle(langBtn, 'language')
  bindText(langBtn, () => (getLang() === 'ko' ? 'EN' : '한'))
  langBtn.addEventListener('click', toggleLang)
  root.appendChild(langBtn)

  refresh()
}
