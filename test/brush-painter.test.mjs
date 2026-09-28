// Stroke interpolation, per-pen stamping, and pointer → painter wiring (incl. mirror mode).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newStrokeState, paintSegment } from '../src/canvas/brush.ts'
import { attachPainter } from '../src/canvas/painter.ts'
import { createState } from '../src/state.ts'
import { fakeCtx, ops } from './support/fake-canvas.mjs'

const style = (over = {}) => ({ pen: 'pastel', size: 10, color: '#ff0000', eraser: false, ...over })
const arcXY = (ctx) => ops(ctx, 'arc').map((c) => [c.args[0], c.args[1]])

test('paintSegment interpolates evenly spaced stamps ending at the target point', () => {
  const ctx = fakeCtx()
  const st = newStrokeState()
  paintSegment(ctx, st, style(), 0, 0, 10, 0) // step = size*0.2 = 2 → 5 stamps
  assert.deepEqual(arcXY(ctx), [[2, 0], [4, 0], [6, 0], [8, 0], [10, 0]])
  assert.equal(st.dist, 10)
})

test('paintSegment stamps at least once even for a zero-length segment', () => {
  const ctx = fakeCtx()
  const st = newStrokeState()
  paintSegment(ctx, st, style(), 7, 9, 7, 9)
  assert.deepEqual(arcXY(ctx), [[7, 9]])
  assert.equal(st.dist, 0)
})

test('paintSegment step never drops below 1px for tiny brushes', () => {
  const ctx = fakeCtx()
  paintSegment(ctx, newStrokeState(), style({ size: 2 }), 0, 0, 3, 4) // len 5, step 1
  assert.equal(ops(ctx, 'arc').length, 5)
})

test('stroke distance accumulates across segments', () => {
  const st = newStrokeState()
  const ctx = fakeCtx()
  paintSegment(ctx, st, style(), 0, 0, 3, 4)
  paintSegment(ctx, st, style(), 3, 4, 3, 10)
  assert.ok(Math.abs(st.dist - 11) < 1e-9)
})

test('pastel pen uses a translucent radial gradient of the chosen color', () => {
  const ctx = fakeCtx()
  paintSegment(ctx, newStrokeState(), style({ size: 20, color: '#00ff00' }), 5, 5, 5, 5)
  const [grad] = ops(ctx, 'createRadialGradient')
  assert.deepEqual(grad.stops, [[0, 'rgba(0, 255, 0, 0.4)'], [1, 'rgba(0, 255, 0, 0)']])
  assert.equal(ops(ctx, 'arc')[0].args[2], 10, 'radius = size/2')
})

test('eraser punches holes with destination-out regardless of pen', () => {
  for (const pen of ['pastel', 'pearl', 'rainbow']) {
    const ctx = fakeCtx()
    paintSegment(ctx, newStrokeState(), style({ pen, eraser: true, size: 4 }), 1, 1, 1, 1)
    assert.ok(ctx.calls.some((c) => c.op === 'set' && c.key === 'globalCompositeOperation' && c.value === 'destination-out'))
    assert.equal(ops(ctx, 'arc')[0].args[2], 3, 'eraser radius floor is 3px')
    assert.equal(ops(ctx, 'createRadialGradient').length, 0)
  }
})

test('pearl pen paints the solid color then adds sparkles', (t) => {
  t.mock.method(Math, 'random', () => 0.5)
  const ctx = fakeCtx()
  paintSegment(ctx, newStrokeState(), style({ pen: 'pearl', color: '#123456' }), 0, 0, 0, 0)
  const fills = ctx.calls.filter((c) => c.op === 'set' && c.key === 'fillStyle').map((c) => c.value)
  assert.equal(fills[0], '#123456')
  assert.equal(fills.length, 1 + 3, 'Math.random()=0.5 → 2 + floor(1) = 3 sparkles')
})

test('rainbow pen hue follows travelled distance and wraps at 360', (t) => {
  t.mock.method(Math, 'random', () => 0)
  const firstHue = (dist) => {
    const ctx = fakeCtx()
    const st = { dist }
    paintSegment(ctx, st, style({ pen: 'rainbow', size: 10 }), 0, 0, 0, 0)
    return ctx.calls.find((c) => c.op === 'set' && c.key === 'fillStyle').value
  }
  assert.equal(firstHue(0), 'hsl(0, 100%, 60%)')
  assert.equal(firstHue(100), 'hsl(160, 100%, 60%)')
  assert.equal(firstHue(250), 'hsl(40, 100%, 60%)', '400 % 360')
})

// Fake paint canvas that captures pointer listeners.
function fakeLayers(width = 300, left = 10, top = 20) {
  const listeners = {}
  const paint = {
    addEventListener: (type, fn) => (listeners[type] = fn),
    getBoundingClientRect: () => ({ left, top }),
    setPointerCapture: () => {}
  }
  const layers = { paint, paintCtx: fakeCtx(), width, height: 200 }
  const fire = (type, clientX, clientY) => listeners[type]({ clientX, clientY, pointerId: 1 })
  return { layers, fire }
}

test('painter maps pointer coords into canvas space and fires stroke hooks once', () => {
  const { layers, fire } = fakeLayers()
  const state = createState()
  const events = []
  attachPainter(layers, state, {
    onStrokeStart: () => events.push('start'),
    onStrokeEnd: () => events.push('end'),
    onPaintAt: (x, y) => events.push([x, y])
  })
  fire('pointermove', 50, 50) // not drawing yet → ignored
  fire('pointerdown', 60, 70)
  fire('pointermove', 80, 70)
  fire('pointerup', 80, 70)
  fire('pointercancel', 80, 70) // already ended → no second 'end'
  assert.deepEqual(events, ['start', [50, 50], [70, 50], 'end'])
})

test('mirror mode paints every stamp a second time at mirrorX', () => {
  const { layers, fire } = fakeLayers(300)
  const state = createState()
  state.symmetry = true
  attachPainter(layers, state)
  fire('pointerdown', 110, 70) // canvas (100, 50)
  const xs = arcXY(layers.paintCtx).map(([x]) => Math.round(x))
  assert.ok(xs.includes(100) && xs.includes(200), `expected 100 and its mirror 200, got ${xs}`)
  assert.equal(xs.filter((x) => x === 100).length, xs.filter((x) => x === 200).length)
})

test('painter reads current state on each stamp (live color/eraser changes)', () => {
  const { layers, fire } = fakeLayers()
  const state = createState()
  attachPainter(layers, state)
  state.eraser = true
  fire('pointerdown', 110, 70)
  assert.ok(layers.paintCtx.calls.some((c) => c.key === 'globalCompositeOperation'))
})
