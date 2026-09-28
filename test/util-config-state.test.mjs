// Pure helpers: hex→rgba, mirror math, config invariants, initial app state.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hexToRgba } from '../src/util.ts'
import { mirrorX } from '../src/canvas/symmetry.ts'
import { COLORS, BRUSH_SIZES, PENS, HISTORY_CAP, DPR_CAP } from '../src/config.ts'
import { createState } from '../src/state.ts'

test('hexToRgba converts 6-digit hex with and without #', () => {
  assert.equal(hexToRgba('#e53935', 0.4), 'rgba(229, 57, 53, 0.4)')
  assert.equal(hexToRgba('1e88e5', 1), 'rgba(30, 136, 229, 1)')
  assert.equal(hexToRgba('#000000', 0), 'rgba(0, 0, 0, 0)')
  assert.equal(hexToRgba('#ffffff', 0.5), 'rgba(255, 255, 255, 0.5)')
})

test('hexToRgba expands 3-digit shorthand', () => {
  assert.equal(hexToRgba('#fff', 1), hexToRgba('#ffffff', 1))
  assert.equal(hexToRgba('#f80', 0.2), 'rgba(255, 136, 0, 0.2)')
})

test('mirrorX reflects across the vertical center line', () => {
  assert.equal(mirrorX(0, 400), 400)
  assert.equal(mirrorX(400, 400), 0)
  assert.equal(mirrorX(200, 400), 200, 'center is a fixed point')
  assert.equal(mirrorX(150.5, 300), 149.5)
  for (const x of [0, 13, 99.25, 300]) assert.equal(mirrorX(mirrorX(x, 300), 300), x, 'involution')
})

test('config: palette is 24 unique valid hex colors', () => {
  assert.equal(COLORS.length, 24)
  assert.equal(new Set(COLORS.map((c) => c.toLowerCase())).size, COLORS.length)
  for (const c of COLORS) assert.match(c, /^#[0-9a-f]{6}$/i)
})

test('config: brush sizes ascending, pens unique, caps positive', () => {
  assert.equal(BRUSH_SIZES.length, 3)
  assert.deepEqual([...BRUSH_SIZES].sort((a, b) => a - b), BRUSH_SIZES)
  assert.deepEqual(PENS.map((p) => p.type), ['pastel', 'pearl', 'rainbow'])
  assert.ok(HISTORY_CAP > 0 && Number.isInteger(HISTORY_CAP))
  assert.ok(DPR_CAP >= 1)
})

test('createState returns defaults drawn from config', () => {
  const s = createState()
  assert.deepEqual(s, {
    color: COLORS[0],
    pen: 'pastel',
    size: BRUSH_SIZES[1],
    eraser: false,
    symmetry: false,
    muted: false,
    templateId: null
  })
})

test('createState returns an independent object each call', () => {
  const a = createState()
  a.eraser = true
  a.color = '#000000'
  assert.equal(createState().eraser, false)
  assert.equal(createState().color, COLORS[0])
})
