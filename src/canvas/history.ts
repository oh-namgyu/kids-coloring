import { Layers } from './layers'
import { HISTORY_CAP } from '../config'

// 되돌리기 — 스트로크 시작 직전의 페인트 상태를 ImageData 로 스냅샷
export class History {
  private stack: ImageData[] = []

  constructor(private layers: Layers) {}

  push(): void {
    const { paint, paintCtx } = this.layers
    if (paint.width < 1 || paint.height < 1) return
    this.stack.push(paintCtx.getImageData(0, 0, paint.width, paint.height))
    if (this.stack.length > HISTORY_CAP) this.stack.shift()
  }

  undo(): void {
    const prev = this.stack.pop()
    if (!prev) return
    const { paint, paintCtx } = this.layers
    if (prev.width !== paint.width || prev.height !== paint.height) return // resize 후 stale
    paintCtx.save()
    paintCtx.setTransform(1, 0, 0, 1, 0, 0)
    paintCtx.clearRect(0, 0, paint.width, paint.height)
    paintCtx.putImageData(prev, 0, 0)
    paintCtx.restore()
  }

  reset(): void {
    this.stack = []
  }
}
