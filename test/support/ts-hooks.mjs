// Module hooks: resolve extensionless relative imports to .ts (Vite/bundler style) and
// transpile .ts via Vite's bundled Oxc transformer (already a devDependency). Oxc — unlike
// Node's type stripping — elides type-only imports and handles parameter properties.
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { transformWithOxc } from 'vite'

const isTs = (url) => new URL(url).pathname.endsWith('.ts')

export async function resolve(specifier, context, next) {
  const fromTs = context.parentURL && isTs(context.parentURL)
  if (fromTs && specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
    try {
      return await next(`${specifier}.ts`, context)
    } catch {
      /* fall through to default resolution */
    }
  }
  return next(specifier, context)
}

export async function load(url, context, next) {
  if (!url.startsWith('file:') || !isTs(url)) return next(url, context)
  const path = fileURLToPath(url)
  const { code } = await transformWithOxc(await readFile(path, 'utf8'), path, { lang: 'ts' })
  return { format: 'module', source: code, shortCircuit: true }
}
