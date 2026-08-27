// 1RM Scientific Estimator (extracted verbatim — openGym lib/onerm.js)
export const REP_CAP = 12
const ONERM_FORMULAS = {
  epley: (w, r) => w * (1 + r / 30),
  brzycki: (w, r) => w * 36 / (37 - r),
  lombardi: (w, r) => w * Math.pow(r, 0.1),
}

export function estimate1RM(w, r, formula = 'epley') {
  const weight = Number(w)
  const reps = Number(r)
  if (!isFinite(weight) || !isFinite(reps)) return null
  if (weight <= 0 || reps < 1) return null
  if (reps > REP_CAP) return null
  const fn = ONERM_FORMULAS[formula] || ONERM_FORMULAS.epley
  const est = reps === 1 ? weight : fn(weight, Math.round(reps))
  if (!isFinite(est) || est <= 0) return null
  return Math.round(est * 10) / 10
}

export function best1RM(rows, formula = 'epley') {
  let best = null
  ;(rows || []).forEach(s => {
    const est = estimate1RM(s.weight, s.reps, formula)
    if (est !== null && (!best || est > best.est)) {
      best = { est, weight: Number(s.weight), reps: Math.round(Number(s.reps)), date: s.date }
    }
  })
  return best
}
