// Registers a tiny TypeScript loader so tests can import src/*.ts directly (zero extra deps).
// Usage: node --import ./test/support/register-ts.mjs --test test/*.test.mjs
import { register } from 'node:module'

register('./ts-hooks.mjs', import.meta.url)
