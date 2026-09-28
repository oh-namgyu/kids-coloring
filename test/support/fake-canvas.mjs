// Minimal recording fakes for CanvasRenderingContext2D / canvas elements (no DOM needed).

// Every method call is recorded as { op, args }; property writes as { op: 'set', key, value }.
export function fakeCtx(extra = {}) {
  const calls = []
  const target = { calls, ...extra }
  return new Proxy(target, {
    get(t, key) {
      if (key in t) return t[key]
      if (key === 'createRadialGradient') {
        return (...args) => {
          const stops = []
          calls.push({ op: key, args, stops })
          return { addColorStop: (o, c) => stops.push([o, c]) }
        }
      }
      return (...args) => calls.push({ op: key, args })
    },
    set(t, key, value) {
      calls.push({ op: 'set', key, value })
      t[key] = value
      return true
    }
  })
}

export const ops = (ctx, op) => ctx.calls.filter((c) => c.op === op)
