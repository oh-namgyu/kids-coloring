// 앱 전역 상수 — 중복 매직넘버 금지, 여기 한 곳에서 관리

export type PenType = 'pastel' | 'pearl' | 'rainbow'

// 유아 친화 24색 — 무지개 스펙트럼 순 + 살구색 2종 + 갈색·무채색
export const COLORS: string[] = [
  '#e53935', '#ff8a80', '#d81b60',
  '#f48fb1', '#fb8c00', '#ffb74d',
  '#fdd835', '#fff176', '#cddc39',
  '#43a047', '#2e7d32', '#aed581',
  '#00897b', '#26c6da', '#1e88e5',
  '#1565c0', '#5e35b1', '#b39ddb',
  '#ffcba4', '#e0ac69', '#8d6e63',
  '#000000', '#9e9e9e', '#ffffff'
]

// 브러시 크기 3단계 (작은/중간/큰) — CSS px 기준 지름
export const BRUSH_SIZES: number[] = [12, 26, 46]

// label 은 i18n(키 pen_<type>)에서 해석 — 여기엔 타입·아이콘만 둔다.
export const PENS: { type: PenType; icon: string }[] = [
  { type: 'pastel', icon: '🖍️' },
  { type: 'pearl', icon: '✨' },
  { type: 'rainbow', icon: '🌈' }
]

export const HISTORY_CAP = 12      // 되돌리기 스냅샷 최대 보관
export const DPR_CAP = 2           // 고DPI 성능 보호
