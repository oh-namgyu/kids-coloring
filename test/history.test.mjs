// Undo stack: LIFO snapshots, HISTORY_CAP eviction, stale-size guard, reset.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { History } from '../src/canvas/history.ts'
import { HISTORY_CAP } from '../src/config.ts'
import { fakeCtx, ops } from './support/fake-canvas.mjs'

// Fake paint layer whose getImageData returns a numbered snapshot of the current size.
function fakeLayers(width = 100, height = 80) {
  let seq = 0
  const paint = { width, height }
  const paintCtx = fakeCtx({
    getImageData: (x, y, w, h) => ({ id: ++seq, width: w, height: h })
  })
  return { paint, paintCtx }
}

const restored = (layers) => ops(layers.paintCtx, 'putImageData').map((c) => c.args[0].id)

test('undo restores snapshots in LIFO order', () => {
  const layers = fakeLayers()
  const h = new History(layers)
  h.push()
  h.push()
  h.push()
  h.undo()
  h.undo()
  assert.deepEqual(restored(layers), [3, 2])
})

test('undo clears the full backing store with identity transform before restoring', () => {
  const layers = fakeLayers(120, 90)
  const h = new History(layers)
  h.push()
  h.undo()
  const seq = layers.paintCtx.calls.map((c) => c.op)
  assert.deepEqual(seq, ['save', 'setTransform', 'clearRect', 'putImageData', 'restore'])
  assert.deepEqual(ops(layers.paintCtx, 'setTransform')[0].args, [1, 0, 0, 1, 0, 0])
  assert.deepEqual(ops(layers.paintCtx, 'clearRect')[0].args, [0, 0, 120, 90])
  assert.deepEqual(ops(layers.paintCtx, 'putImageData')[0].args.slice(1), [0, 0])
})

test('undo on an empty stack is a no-op', () => {
  const layers = fakeLayers()
  new History(layers).undo()
  assert.equal(layers.paintCtx.calls.length, 0)
})

test(`stack keeps at most HISTORY_CAP (${HISTORY_CAP}) snapshots, evicting the oldest`, () => {
  const layers = fakeLayers()
  const h = new History(layers)
  const pushes = HISTORY_CAP + 5
  for (let i = 0; i < pushes; i++) h.push()
  for (let i = 0; i < pushes; i++) h.undo()
  const ids = restored(layers)
  assert.equal(ids.length, HISTORY_CAP)
  assert.equal(ids[0], pushes, 'newest first')
  assert.equal(ids.at(-1), pushes - HISTORY_CAP + 1, 'oldest surviving snapshot')
})

test('push is skipped while the canvas has no area', () => {
  const layers = fakeLayers(0, 80)
  const h = new History(layers)
  h.push()
  assert.equal(ops(layers.paintCtx, 'getImageData').length, 0)
  layers.paint.width = 100
  h.undo()
  assert.equal(restored(layers).length, 0)
})

test('snapshot taken before a resize is discarded instead of restored', () => {
  const layers = fakeLayers(100, 80)
  const h = new History(layers)
  h.push() // id 1 @100x80
  layers.paint.width = 200 // canvas resized
  h.push() // id 2 @200x80
  h.undo() // restores 2
  h.undo() // 1 is stale → skipped
  assert.deepEqual(restored(layers), [2])
  h.undo() // stack now empty
  assert.deepEqual(restored(layers), [2])
})

test('reset empties the stack', () => {
  const layers = fakeLayers()
  const h = new History(layers)
  h.push()
  h.push()
  h.reset()
  h.undo()
  assert.equal(restored(layers).length, 0)
})
