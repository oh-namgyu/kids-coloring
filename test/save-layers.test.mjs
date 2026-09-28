// PNG export (flatten + outline contain + filename) and canvas layer sizing — via DOM fakes.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { saveImage } from '../src/canvas/save.ts'
import { resize, clearPaint } from '../src/canvas/layers.ts'
import { DPR_CAP } from '../src/config.ts'
import { fakeCtx, ops } from './support/fake-canvas.mjs'

let created // elements handed out by document.createElement, in order
let blob // what toBlob yields
let imageFails

function fakeCanvas(width = 0, height = 0) {
  const ctx = fakeCtx()
  return { width, height, ctx, getContext: () => ctx, toBlob: (cb, type) => cb(blob && { type }) }
}

class FakeImage {
  set src(v) {
    this._src = v
    imageFails ? this.onerror() : this.onload()
  }
  get src() {
    return this._src
  }
}

function install(name, value) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
}

beforeEach(() => {
  created = []
  blob = true
  imageFails = false
  install('document', {
    createElement: (tag) => {
      const node = tag === 'canvas' ? fakeCanvas() : { tag, click() { this.clicked = true } }
      created.push(node)
      return node
    }
  })
  install('Image', FakeImage)
  URL.createObjectURL = () => 'blob:fake'
  URL.revokeObjectURL = () => {}
})

const layersOf = (w, h) => ({ paint: { width: w, height: h, tag: 'paint' } })
const anchor = () => created.find((n) => n.tag === 'a')

test('save flattens white background + paint and downloads a timestamped PNG', () => {
  const RealDate = Date
  install('Date', class extends RealDate {
    constructor(...a) {
      super(...(a.length ? a : [2026, 0, 2, 3, 4, 5])) // local time → deterministic stamp
    }
  })
  try {
    saveImage(layersOf(400, 200), null)
  } finally {
    install('Date', RealDate)
  }
  const out = created[0]
  assert.deepEqual([out.width, out.height], [400, 200])
  const seq = out.ctx.calls.map((c) => (c.op === 'set' ? `${c.key}=${c.value}` : c.op))
  assert.deepEqual(seq, ['fillStyle=#ffffff', 'fillRect', 'drawImage'])
  assert.deepEqual(ops(out.ctx, 'drawImage')[0].args.slice(1), [0, 0])
  assert.equal(anchor().download, '색칠놀이-20260102-030405.png')
  assert.equal(anchor().href, 'blob:fake')
  assert.ok(anchor().clicked)
})

test('save composites the template outline contained and centered', () => {
  saveImage(layersOf(400, 200), 'cat') // viewBox 100x100 → scale 2, x offset 100
  const draws = ops(created[0].ctx, 'drawImage')
  assert.equal(draws.length, 2)
  assert.ok(draws[1].args[0] instanceof FakeImage)
  assert.match(draws[1].args[0].src, /^data:image\/svg\+xml;charset=utf-8,/)
  assert.deepEqual(draws[1].args.slice(1), [100, 0, 200, 200])
  assert.ok(anchor().clicked)
})

test('save still downloads when the outline fails to load or the id is unknown', () => {
  imageFails = true
  saveImage(layersOf(100, 100), 'cat')
  assert.ok(anchor().clicked)
  created = []
  saveImage(layersOf(100, 100), 'no-such-template')
  assert.equal(ops(created[0].ctx, 'drawImage').length, 1)
  assert.ok(anchor().clicked)
})

test('save does nothing when the browser yields no blob', () => {
  blob = null
  saveImage(layersOf(100, 100), null)
  assert.equal(anchor(), undefined)
})

function fakeLayers(stageW, stageH, paintW = 1, paintH = 1) {
  const bg = fakeCanvas(1, 1)
  const paint = fakeCanvas(paintW, paintH)
  return {
    stage: { clientWidth: stageW, clientHeight: stageH },
    bg, paint, bgCtx: bg.ctx, paintCtx: paint.ctx, width: 0, height: 0, dpr: 1
  }
}

test(`resize sizes backing stores by devicePixelRatio, capped at ${DPR_CAP}`, () => {
  install('window', { devicePixelRatio: 3 })
  const layers = fakeLayers(150, 100)
  resize(layers)
  assert.equal(layers.dpr, DPR_CAP)
  assert.deepEqual([layers.width, layers.height], [150, 100])
  assert.deepEqual([layers.paint.width, layers.paint.height], [150 * DPR_CAP, 100 * DPR_CAP])
  assert.deepEqual(ops(layers.paintCtx, 'setTransform')[0].args, [DPR_CAP, 0, 0, DPR_CAP, 0, 0])
  assert.deepEqual(ops(layers.bgCtx, 'fillRect')[0].args, [0, 0, 150, 100], 'background painted white')
})

test('resize preserves existing paint by redrawing it scaled into the new size', () => {
  install('window', { devicePixelRatio: 1 })
  const layers = fakeLayers(300, 200, 150, 100)
  resize(layers)
  const snapshot = created.find((n) => n.width === 150 && n.height === 100)
  assert.ok(snapshot, 'old paint copied to a scratch canvas')
  assert.deepEqual(ops(layers.paintCtx, 'drawImage')[0].args, [snapshot, 0, 0, 150, 100, 0, 0, 300, 200])
})

test('resize ignores a collapsed (0-size) stage', () => {
  install('window', { devicePixelRatio: 1 })
  const layers = fakeLayers(0, 100, 50, 50)
  resize(layers)
  assert.deepEqual([layers.paint.width, layers.width], [50, 0])
})

test('clearPaint clears the whole backing store under identity transform', () => {
  const layers = fakeLayers(0, 0, 640, 480)
  clearPaint(layers)
  assert.deepEqual(ops(layers.paintCtx, 'setTransform')[0].args, [1, 0, 0, 1, 0, 0])
  assert.deepEqual(ops(layers.paintCtx, 'clearRect')[0].args, [0, 0, 640, 480])
})
