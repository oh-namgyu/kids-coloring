// Node < 21 has no global `navigator`; i18n reads navigator.language at import time.
// Imported first by specs whose modules pull in i18n, so they load the same on Node 20 and 22.
if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-US' }, configurable: true, writable: true })
}
