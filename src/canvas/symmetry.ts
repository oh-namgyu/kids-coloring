// 데칼코마니(좌우 대칭) — 세로 중심축 기준으로 x 미러
export function mirrorX(x: number, width: number): number {
  return width - x
}
