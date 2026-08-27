// Auto-Progression & Adaptive Deload Engine (verbatim — openGym lib/progression.js)
import { exercises as coreExercises } from '../dataBundle.js'
import { prs } from './storage.js'

const HEAVY_BP = ['Legs', 'Back', 'Glutes']

export function getProgression(exName, policy = 'linear') {
  const ex = coreExercises.find(e => e.name === exName)
  const isHeavy = ex && HEAVY_BP.includes(ex.part)
  const step = isHeavy ? 5 : 2.5
  const history = (prs()[exName] || [])

  if (!history.length) {
    const defaultW = (ex && ex.eq === 'Barbell') ? 20 : ((ex && ex.eq === 'Dumbbells') ? 10 : 0)
    return {
      kind: 'first',
      weight: defaultW,
      reps: 5,
      sets: 3,
      action: 'START',
      why: 'No previous log found — start with baseline weight and build up.'
    }
  }

  const last = history[0]
  const lastW = Number(last.weight) || 0
  const lastR = Number(last.reps) || 0

  // Bodyweight movements progression
  if (lastW <= 0 || (ex && ex.eq === 'Bodyweight')) {
    if (lastR >= 15) {
      return {
        kind: 'up',
        weight: 0,
        reps: 8,
        sets: 4,
        action: 'ADD 4TH SET',
        why: 'Hit ' + lastR + ' reps (reps ceiling reached) — add a 4th set and reset to 8 reps.'
      }
    } else if (lastR >= 8) {
      return {
        kind: 'up',
        weight: 0,
        reps: lastR + 1,
        sets: 3,
        action: '+1 REP',
        why: 'Completed ' + lastR + ' reps last session — push for ' + (lastR + 1) + ' reps today.'
      }
    }
    return {
      kind: 'hold',
      weight: 0,
      reps: Math.max(5, lastR),
      sets: 3,
      action: 'REPEAT REPS',
      why: 'Solidify form at ' + lastR + ' reps before increasing rep targets.'
    }
  }

  // Weighted lifts progression
  const targetReps = 5
  let stalls = 0
  for (let i = 0; i < Math.min(3, history.length); i++) {
    if (Number(history[i].weight) >= lastW && Number(history[i].reps) < targetReps) stalls++
  }

  if (policy === 'double') {
    const topReps = 12, botReps = 8
    if (lastR >= topReps) {
      const nextW = Math.round((lastW + step) * 10) / 10
      return {
        kind: 'up', weight: nextW, reps: botReps, sets: 3,
        action: '+' + step + ' KG',
        why: 'Hit top of rep range (' + topReps + ' reps) at ' + lastW + ' kg — advance to ' + nextW + ' kg and reset to ' + botReps + ' reps.'
      }
    } else if (stalls >= 3) {
      const deloadW = Math.round((lastW * 0.9) / 2.5) * 2.5
      return {
        kind: 'deload', weight: deloadW, reps: botReps, sets: 3,
        action: 'DELOAD -10%',
        why: 'Stalled 3 sessions at ' + lastW + ' kg — deload to ' + deloadW + ' kg (-10%) to break through plateau.'
      }
    } else {
      const nextR = Math.min(topReps, lastR + 1)
      return {
        kind: 'hold', weight: lastW, reps: nextR, sets: 3,
        action: 'HOLD WEIGHT',
        why: 'Hold ' + lastW + ' kg and aim to add 1 more rep (target: ' + nextR + ' reps).'
      }
    }
  }

  if (policy === 'greyskull') {
    if (lastR >= targetReps * 2) {
      const nextW = Math.round((lastW + step * 2) * 10) / 10
      return {
        kind: 'up', weight: nextW, reps: targetReps, sets: 3,
        action: '+' + (step * 2) + ' KG (2X JUMP)',
        why: 'Crushed final set with ' + lastR + ' reps (double target) — take an aggressive +' + (step * 2) + ' kg jump to ' + nextW + ' kg!'
      }
    } else if (lastR >= targetReps) {
      const nextW = Math.round((lastW + step) * 10) / 10
      return {
        kind: 'up', weight: nextW, reps: targetReps, sets: 3,
        action: '+' + step + ' KG',
        why: 'Completed all ' + lastR + ' target reps last session — increase by ' + step + ' kg to ' + nextW + ' kg.'
      }
    } else {
      const deloadW = Math.round((lastW * 0.9) / 2.5) * 2.5
      return {
        kind: 'deload', weight: deloadW, reps: targetReps, sets: 3,
        action: 'DELOAD -10%',
        why: 'Missed target reps (' + lastR + ' < ' + targetReps + ') — reset load to ' + deloadW + ' kg (-10%) to build back fresh.'
      }
    }
  }

  // Default Linear progression
  if (lastR >= targetReps) {
    const nextW = Math.round((lastW + step) * 10) / 10
    return {
      kind: 'up', weight: nextW, reps: targetReps, sets: 3,
      action: '+' + step + ' KG',
      why: 'Hit all ' + lastR + ' reps at ' + lastW + ' kg — advance load by ' + step + ' kg to ' + nextW + ' kg.'
    }
  } else if (stalls >= 3) {
    const deloadW = Math.round((lastW * 0.9) / 2.5) * 2.5
    return {
      kind: 'deload', weight: deloadW, reps: targetReps, sets: 3,
      action: 'DELOAD -10%',
      why: 'Missed target reps 3 sessions running at ' + lastW + ' kg — take a 10% deload to ' + deloadW + ' kg to break the plateau.'
    }
  }
  return {
    kind: 'hold', weight: lastW, reps: targetReps, sets: 3,
    action: 'REPEAT WEIGHT',
    why: 'Missed target reps last session (' + lastR + '/' + targetReps + ') — hold ' + lastW + ' kg (' + (3 - stalls) + ' attempts left before deload).'
  }
}
