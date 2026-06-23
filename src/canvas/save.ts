import { Layers } from './layers'
import { getTemplate } from '../templates'

// 배경(흰) + 페인트 + 도안 외곽선을 합성해 PNG 로 내려받기
export function saveImage(layers: Layers, templateId: string | null): void {
  const w = layers.paint.width
  const h = layers.paint.height
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(layers.paint, 0, 0)

  const tpl = templateId ? getTemplate(templateId) : undefined
  if (!tpl) return download(out)

  const { vw, vh } = viewBoxOf(tpl.svg)
  const img = new Image()
  img.onload = () => {
    // 도안 비율대로 contain(가운데) 합성 — 화면 표시(preserveAspectRatio meet)와 동일
    const scale = Math.min(w / vw, h / vh)
    ctx.drawImage(img, (w - vw * scale) / 2, (h - vh * scale) / 2, vw * scale, vh * scale)
    download(out)
  }
  img.onerror = () => download(out)
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tpl.svg)
}

function download(canvas: HTMLCanvasElement): void {
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `색칠놀이-${stamp()}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}

// SVG viewBox 에서 도안 비율 추출 (없으면 정사각)
function viewBoxOf(svg: string): { vw: number; vh: number } {
  const m = svg.match(/viewBox="([\d.\s-]+)"/)
  if (m) {
    const p = m[1].trim().split(/\s+/).map(Number)
    if (p.length === 4 && p[2] > 0 && p[3] > 0) return { vw: p[2], vh: p[3] }
  }
  return { vw: 100, vh: 100 }
}

function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}
