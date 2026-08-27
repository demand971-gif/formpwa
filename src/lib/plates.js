// Barbell plate calculator (verbatim logic — openGym)
export const PLATE_SPECS = [
  { weight: 25, color: '#ef476f', text: '#fff', height: 72, width: 14, name: '25 kg' },
  { weight: 20, color: '#118ab2', text: '#fff', height: 72, width: 13, name: '20 kg' },
  { weight: 15, color: '#ffd166', text: '#111', height: 64, width: 12, name: '15 kg' },
  { weight: 10, color: '#06d6a0', text: '#111', height: 56, width: 11, name: '10 kg' },
  { weight: 5, color: '#ffffff', text: '#111', height: 48, width: 10, name: '5 kg' },
  { weight: 2.5, color: '#2b2d42', text: '#fff', height: 40, width: 9, name: '2.5 kg' },
  { weight: 1.25, color: '#8d99ae', text: '#fff', height: 34, width: 8, name: '1.25 kg' },
]

export function calcPlates(target, bar = 20) {
  const t = Number(target)
  const b = Number(bar)
  if (!isFinite(t) || t <= 0) return { ok: false, msg: 'Enter target weight > 0' }
  if (t < b) return { ok: false, msg: 'Target weight is less than empty bar (' + b + ' kg)' }
  const rem = t - b
  let perSide = rem / 2
  const plates = []
  PLATE_SPECS.forEach(spec => {
    const count = Math.floor(perSide / spec.weight)
    if (count > 0) {
      for (let i = 0; i < count; i++) plates.push(spec)
      perSide = Math.round((perSide - count * spec.weight) * 100) / 100
    }
  })
  return { ok: true, target: t, bar: b, perSideTotal: (t - b) / 2, plates, remainder: perSide }
}

export function formatPlatesSummary(plates) {
  if (!plates || !plates.length) return 'Bar only'
  const counts = {}
  plates.forEach(p => { counts[p.weight] = (counts[p.weight] || 0) + 1 })
  return Object.entries(counts)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([w, c]) => c + ' × ' + w + 'kg')
    .join(' · ')
}

// Warm-up progression ladder
export function warmupLadder(target, bar) {
  const steps = [
    { label: 'Bar Warmup', pct: 0, weight: bar, reps: '10 reps' },
    { label: 'Warmup 1', pct: 0.5, weight: Math.max(bar, Math.round((target * 0.5) / 2.5) * 2.5), reps: '5 reps' },
    { label: 'Warmup 2', pct: 0.7, weight: Math.max(bar, Math.round((target * 0.7) / 2.5) * 2.5), reps: '3 reps' },
    { label: 'Potentiation', pct: 0.85, weight: Math.max(bar, Math.round((target * 0.85) / 2.5) * 2.5), reps: '1 rep' },
    { label: 'Working Set', pct: 1, weight: target, reps: 'Work reps' },
  ]
  const seen = new Set()
  return steps.filter(s => (seen.has(s.weight) ? false : (seen.add(s.weight), true)))
}
