// i18n: language detection, persistence (incl. storage-disabled browsers), lookup fallbacks,
// and translation coverage for every category/template.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIES, TEMPLATES } from '../src/templates.ts'

let seq = 0
// i18n keeps module-level state, so each scenario imports a fresh instance with its own globals.
async function loadI18n({ language = 'en-US', stored = null, storage = 'ok' } = {}) {
  const store = new Map(stored ? [['lang', stored]] : [])
  const writes = []
  const failing = () => {
    throw new Error('SecurityError')
  }
  const localStorage =
    storage === 'throws'
      ? { getItem: failing, setItem: failing }
      : { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => (writes.push([k, v]), store.set(k, v)) }
  const document = { documentElement: { lang: '' }, title: '' }
  for (const [k, v] of Object.entries({ navigator: { language }, localStorage, document })) {
    Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true })
  }
  const mod = await import(`../src/i18n.ts?fresh=${++seq}`)
  return { ...mod, writes, document }
}

test('defaults to English for non-Korean browsers and Korean for ko-*', async () => {
  assert.equal((await loadI18n({ language: 'en-US' })).getLang(), 'en')
  assert.equal((await loadI18n({ language: 'fr' })).getLang(), 'en')
  assert.equal((await loadI18n({ language: 'ko-KR' })).getLang(), 'ko')
  assert.equal((await loadI18n({ language: 'KO' })).getLang(), 'ko')
})

test('a stored preference overrides the browser language; junk values are ignored', async () => {
  assert.equal((await loadI18n({ language: 'en-US', stored: 'ko' })).getLang(), 'ko')
  assert.equal((await loadI18n({ language: 'ko-KR', stored: 'en' })).getLang(), 'en')
  assert.equal((await loadI18n({ language: 'ko-KR', stored: 'de' })).getLang(), 'ko')
})

test('storage-disabled browsers: load and toggle do not throw', async () => {
  const i18n = await loadI18n({ language: 'ko-KR', storage: 'throws' })
  assert.equal(i18n.getLang(), 'ko')
  assert.doesNotThrow(() => i18n.toggleLang())
  assert.equal(i18n.getLang(), 'en')
})

test('setLang persists, updates <html lang>, and notifies listeners only on change', async () => {
  const i18n = await loadI18n({ language: 'en-US' })
  let calls = 0
  i18n.onLangChange(() => calls++)
  i18n.setLang('en') // unchanged → no-op
  assert.equal(calls, 0)
  assert.deepEqual(i18n.writes, [])
  i18n.setLang('ko')
  assert.equal(calls, 1)
  assert.equal(i18n.document.documentElement.lang, 'ko')
  assert.deepEqual(i18n.writes, [['lang', 'ko']])
  i18n.toggleLang()
  assert.equal(i18n.getLang(), 'en')
  assert.equal(calls, 2)
})

test('t() resolves per language and falls back to the key for unknown messages', async () => {
  const i18n = await loadI18n({ language: 'en-US' })
  assert.equal(i18n.t('undo'), 'Undo')
  assert.equal(i18n.t('no_such_key'), 'no_such_key')
  i18n.setLang('ko')
  assert.equal(i18n.t('undo'), '되돌리기')
  assert.equal(i18n.t('no_such_key'), 'no_such_key')
})

test('UI message keys are translated in both languages', async () => {
  const keys = ['title', 'pickColor', 'pick', 'eraser', 'undo', 'mirror', 'size', 'clearAll',
    'clearConfirm', 'save', 'sound', 'close', 'language', 'pen_pastel', 'pen_pearl', 'pen_rainbow']
  const i18n = await loadI18n({ language: 'en-US' })
  const en = keys.map((k) => i18n.t(k))
  i18n.setLang('ko')
  const ko = keys.map((k) => i18n.t(k))
  keys.forEach((k, i) => {
    assert.notEqual(en[i], k, `en missing: ${k}`)
    assert.notEqual(ko[i], k, `ko missing: ${k}`)
  })
  assert.ok(ko.every((s) => /[가-힣]/.test(s)), 'ko strings are Korean')
})

test('every category and template has an English name; Korean returns the original', async () => {
  const i18n = await loadI18n({ language: 'en-US' })
  const missingCat = CATEGORIES.filter((c) => i18n.tCat(c.id, c.name) === c.name).map((c) => c.id)
  const missingTpl = TEMPLATES.filter((tp) => i18n.tTpl(tp.id, tp.name) === tp.name).map((tp) => tp.id)
  assert.deepEqual(missingCat, [])
  assert.deepEqual(missingTpl, [])
  i18n.setLang('ko')
  for (const tp of TEMPLATES) assert.equal(i18n.tTpl(tp.id, tp.name), tp.name)
  for (const c of CATEGORIES) assert.equal(i18n.tCat(c.id, c.name), c.name)
})

test('unknown template/category ids fall back to the Korean name in English mode', async () => {
  const i18n = await loadI18n({ language: 'en-US' })
  assert.equal(i18n.tTpl('nope', '없음'), '없음')
  assert.equal(i18n.tCat('nope', '없음'), '없음')
})
