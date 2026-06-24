// 카탈로그 무결성 스모크 (zero-dep, node --test).
// 캔버스 드로잉 동작은 별도 수동 Playwright 스모크가 담당 — 여기서는 도안 카탈로그의
// 구조적 회귀(개수 표류·중복 id·끊긴/고아 scene 파일)를 자동으로 잡는다.
// 공개판은 개인 그림(mine 카테고리)을 제거했으므로 84 도안 / 6 카테고리 / scene 0.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

// 도안 카탈로그 SoT — 도안/카테고리를 늘리거나 줄이면 이 숫자와 문서를 함께 갱신한다.
const EXPECTED_DESIGNS = 84
const EXPECTED_CATEGORIES = 6

const root = new URL('../', import.meta.url)
const src = readFileSync(new URL('src/templates.ts', root), 'utf8')

// 도안 항목: 줄 시작이 `{ id: '...'` (카테고리 헤더는 `{` 와 `id:` 가 다른 줄이라 매칭 안 됨)
const designIds = [...src.matchAll(/^\s*\{ id: '([^']+)'/gm)].map((m) => m[1])
// 카테고리: `id: 'x', name: '...', templates:` 형태(끝의 templates: 로 도안과 구분)
const categoryIds = [...src.matchAll(/id: '([a-z_]+)', name: '[^']*', templates:/g)].map((m) => m[1])
// 개인 그림 참조: scene('NN') → public/scenes/scene-NN.svg (공개판은 보통 0)
const sceneRefs = [...src.matchAll(/scene\('(\d+)'\)/g)].map((m) => m[1])

test('exports CATEGORIES and TEMPLATES', () => {
  assert.match(src, /export const CATEGORIES/)
  assert.match(src, /export const TEMPLATES/)
})

test(`has ${EXPECTED_DESIGNS} designs across ${EXPECTED_CATEGORIES} categories`, () => {
  assert.equal(designIds.length, EXPECTED_DESIGNS, '도안 개수 표류 — EXPECTED_DESIGNS 와 문서를 함께 갱신')
  assert.equal(categoryIds.length, EXPECTED_CATEGORIES, '카테고리 개수 표류')
})

test('design ids are unique', () => {
  const dupes = [...new Set(designIds.filter((id, i) => designIds.indexOf(id) !== i))]
  assert.deepEqual(dupes, [], `중복 도안 id: ${dupes}`)
})

test('category ids are unique', () => {
  assert.equal(new Set(categoryIds).size, categoryIds.length)
})

test('personal-art references resolve to files with no orphans', () => {
  const scenesDir = new URL('public/scenes/', root)
  const files = existsSync(scenesDir) ? readdirSync(scenesDir).filter((f) => f.endsWith('.svg')) : []
  for (const n of sceneRefs) {
    assert.ok(files.includes(`scene-${n}.svg`), `scene('${n}') 참조 파일 없음`)
  }
  const referenced = new Set(sceneRefs.map((n) => `scene-${n}.svg`))
  for (const f of files) {
    assert.ok(referenced.has(f), `templates.ts 에서 참조되지 않는 고아 scene 파일: ${f}`)
  }
})
