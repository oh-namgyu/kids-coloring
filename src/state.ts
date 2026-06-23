import { BRUSH_SIZES, COLORS, PenType } from './config'

// 앱의 단일 상태 — UI/엔진이 공유
export interface AppState {
  color: string
  pen: PenType
  size: number
  eraser: boolean
  symmetry: boolean // 데칼코마니(좌우 대칭)
  muted: boolean
  templateId: string | null
}

export function createState(): AppState {
  return {
    color: COLORS[0],
    pen: 'pastel',
    size: BRUSH_SIZES[1],
    eraser: false,
    symmetry: false,
    muted: false,
    templateId: null
  }
}
