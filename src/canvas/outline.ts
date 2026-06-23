import { Layers } from './layers'
import { Template } from '../templates'

// 선택한 도안 SVG 를 외곽선 오버레이 레이어에 표시 (null 이면 지움)
// svg 는 src/templates.ts 하드코딩 상수만(사용자 입력 없음) → XSS 무관
export function showOutline(layers: Layers, tpl: Template | null): void {
  layers.outline.innerHTML = tpl ? tpl.svg : ''
}
