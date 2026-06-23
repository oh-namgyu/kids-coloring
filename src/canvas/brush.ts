import { PenType } from '../config'
import { hexToRgba } from '../util'

export interface StrokeStyle {
  pen: PenType
  size: number
  color: string
  eraser: boolean
}

// 한 스트로크 동안 유지되는 상태 (무지개 hue 누적용 이동 거리)
export interface StrokeState {
  dist: number
}

export function newStrokeState(): StrokeState {
  return { dist: 0 }
}

// 두 점 사이를 보간하며 펜별 스탬프. 대칭은 호출자가 미러 좌표로 한 번 더 호출.
export function paintSegment(
  ctx: CanvasRenderingContext2D,
  st: StrokeState,
  style: StrokeStyle,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): void {
  const dx = x1 - x0
  const dy = y1 - y0
  const len = Math.hypot(dx, dy)
  const step = Math.max(1, style.size * 0.2)
  const n = Math.max(1, Math.ceil(len / step))
  for (let i = 1; i <= n; i++) {
    const t = i / n
    st.dist += len / n
    stamp(ctx, st, style, x0 + dx * t, y0 + dy * t)
  }
}

function stamp(ctx: CanvasRenderingContext2D, st: StrokeState, style: StrokeStyle, x: number, y: number): void {
  if (style.eraser) return eraseStamp(ctx, x, y, style.size)
  switch (style.pen) {
    case 'pastel':
      return pastelStamp(ctx, x, y, style.size, style.color)
    case 'pearl':
      return pearlStamp(ctx, x, y, style.size, style.color)
    case 'rainbow':
      return rainbowStamp(ctx, x, y, style.size, st.dist)
  }
}

function pastelStamp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  const r = Math.max(2, size / 2)
  ctx.save()
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, hexToRgba(color, 0.4))
  g.addColorStop(1, hexToRgba(color, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// 펄 반짝이 — 펄·무지개 펜이 공유 (중복 금지)
function addSparkles(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const n = 2 + Math.floor(Math.random() * 2)
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2
    const rad = Math.random() * r
    ctx.fillStyle = `rgba(255,255,255,${0.6 + Math.random() * 0.4})`
    ctx.beginPath()
    ctx.arc(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, Math.random() * 1.6 + 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function pearlStamp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  const r = Math.max(2, size / 2)
  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  addSparkles(ctx, x, y, r)
  ctx.restore()
}

// 무지개 = HSL 색상 순환 + 젤리 비드(입체 하이라이트) + 컬러 글로우 + 반짝이
function rainbowStamp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dist: number): void {
  const r = Math.max(2, size / 2)
  const hue = (dist * 1.6) % 360
  ctx.save()
  // 1) 부드러운 컬러 글로우(헤일로) — 저알파 큰 원이 쌓이며 빛나는 띠
  ctx.globalAlpha = 0.22
  ctx.fillStyle = `hsl(${hue}, 100%, 60%)`
  ctx.beginPath()
  ctx.arc(x, y, r * 1.45, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // 2) 젤리 비드 — 좌상단 밝은 하이라이트에서 진한 가장자리로
  const g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.32, r * 0.1, x, y, r)
  g.addColorStop(0, `hsl(${hue}, 100%, 86%)`)
  g.addColorStop(0.55, `hsl(${hue}, 95%, 60%)`)
  g.addColorStop(1, `hsl(${hue}, 90%, 50%)`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  // 3) 펄 반짝이
  addSparkles(ctx, x, y, r)
  ctx.restore()
}

function eraseStamp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = Math.max(3, size / 2)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
