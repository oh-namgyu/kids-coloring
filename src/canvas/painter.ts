import { Layers } from './layers'
import { AppState } from '../state'
import { newStrokeState, paintSegment, StrokeState, StrokeStyle } from './brush'
import { mirrorX } from './symmetry'

export interface PainterHooks {
  onStrokeStart?: () => void
  onStrokeEnd?: () => void
  onPaintAt?: (x: number, y: number) => void // 파티클·효과음 트리거
}

interface Pt {
  x: number
  y: number
}

// 포인터 입력 → 브러시 스트로크(대칭 포함). 페인트 레이어에 그린다.
export function attachPainter(layers: Layers, state: AppState, hooks: PainterHooks = {}): void {
  let drawing = false
  let last: Pt | null = null
  let stroke: StrokeState = newStrokeState()

  const pos = (e: PointerEvent): Pt => {
    const r = layers.paint.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const style = (): StrokeStyle => ({ pen: state.pen, size: state.size, color: state.color, eraser: state.eraser })

  const dab = (from: Pt, to: Pt): void => {
    const ctx = layers.paintCtx
    const s = style()
    paintSegment(ctx, stroke, s, from.x, from.y, to.x, to.y)
    if (state.symmetry) {
      paintSegment(ctx, stroke, s, mirrorX(from.x, layers.width), from.y, mirrorX(to.x, layers.width), to.y)
    }
    hooks.onPaintAt?.(to.x, to.y)
  }

  layers.paint.addEventListener('pointerdown', (e) => {
    drawing = true
    last = pos(e)
    stroke = newStrokeState()
    layers.paint.setPointerCapture(e.pointerId)
    hooks.onStrokeStart?.()
    dab({ x: last.x - 0.01, y: last.y }, last) // 탭 한 번에도 점이 찍히도록
  })

  layers.paint.addEventListener('pointermove', (e) => {
    if (!drawing || !last) return
    const p = pos(e)
    dab(last, p)
    last = p
  })

  const end = (): void => {
    if (!drawing) return
    drawing = false
    last = null
    hooks.onStrokeEnd?.()
  }
  layers.paint.addEventListener('pointerup', end)
  layers.paint.addEventListener('pointercancel', end)
}
