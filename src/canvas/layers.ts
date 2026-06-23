import { DPR_CAP } from '../config'

// 3개 레이어(배경/페인트/외곽선) 캔버스 스택 관리
export interface Layers {
  stage: HTMLElement
  bg: HTMLCanvasElement
  paint: HTMLCanvasElement
  outline: HTMLElement
  bgCtx: CanvasRenderingContext2D
  paintCtx: CanvasRenderingContext2D
  width: number // CSS px
  height: number // CSS px
  dpr: number
}

function ctxOf(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2d context 미지원')
  return ctx
}

function fit(c: HTMLCanvasElement, w: number, h: number, dpr: number): CanvasRenderingContext2D {
  c.width = Math.max(1, Math.round(w * dpr))
  c.height = Math.max(1, Math.round(h * dpr))
  const ctx = ctxOf(c)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

// 페인트 내용을 유지한 채 캔버스 크기를 새 stage 크기에 맞춘다
export function resize(layers: Layers): void {
  const { stage } = layers
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
  const w = stage.clientWidth
  const h = stage.clientHeight
  if (w === 0 || h === 0) return

  // 기존 페인트 보존
  const prev = document.createElement('canvas')
  prev.width = layers.paint.width
  prev.height = layers.paint.height
  if (prev.width > 1 && prev.height > 1) ctxOf(prev).drawImage(layers.paint, 0, 0)

  layers.bgCtx = fit(layers.bg, w, h, dpr)
  layers.paintCtx = fit(layers.paint, w, h, dpr)
  layers.width = w
  layers.height = h
  layers.dpr = dpr

  paintWhite(layers)
  if (prev.width > 1) layers.paintCtx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, w, h)
}

export function paintWhite(layers: Layers): void {
  layers.bgCtx.save()
  layers.bgCtx.fillStyle = '#ffffff'
  layers.bgCtx.fillRect(0, 0, layers.width, layers.height)
  layers.bgCtx.restore()
}

// 페인트 레이어 전체 지우기 (배경·도안은 유지)
export function clearPaint(layers: Layers): void {
  const ctx = layers.paintCtx
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, layers.paint.width, layers.paint.height)
  ctx.restore()
}

export function setupLayers(): Layers {
  const $ = (id: string) => {
    const el = document.getElementById(id)
    if (!el) throw new Error(`#${id} 없음`)
    return el
  }
  const stage = $('stage')
  const bg = $('bg') as HTMLCanvasElement
  const paint = $('paint') as HTMLCanvasElement
  const outline = $('outline')

  const layers: Layers = {
    stage, bg, paint, outline,
    bgCtx: ctxOf(bg), paintCtx: ctxOf(paint),
    width: 0, height: 0, dpr: 1
  }
  resize(layers)
  // stage 박스 변화(초기 UI 구성 후 축소 / 윈도우 리사이즈 / 줄바꿈)마다 백킹스토어 재동기화
  // → 그리기 좌표계와 포인터 좌표계 정합 (포인터 위치 어긋남 방지)
  new ResizeObserver(() => resize(layers)).observe(stage)
  window.addEventListener('orientationchange', () => resize(layers))
  return layers
}
