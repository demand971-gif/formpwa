// Universal CSV Workout Importer (verbatim — Hevy / Strong / FitNotes)
import { exercises as coreExercises } from '../dataBundle.js'

export function parseCSV(text) {
  const rows = []
  let row = [], field = '', quoted = false
  const s = String(text).replace(/^\uFEFF/, '')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(x => x !== '')) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some(x => x !== '')) rows.push(row)
  return rows
}

export function detectCSVColumns(headers) {
  const norm = h => h.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const H = headers.map(norm)
  const find = (aliases) => {
    for (const a of aliases) {
      const idx = H.findIndex(h => h === a || h.includes(a))
      if (idx !== -1) return idx
    }
    return -1
  }
  return {
    exercise: find(['exercise title', 'exercise name', 'exercise']),
    date: find(['start time', 'workout date', 'date']),
    weight: find(['weight kg', 'weight lbs', 'weight']),
    weightUnit: find(['weight unit']),
    reps: find(['reps completed', 'reps', 'repetition count']),
    workout: find(['workout name', 'title', 'routine name', 'category']),
    rpe: find(['rpe', 'rir']),
  }
}

const SPECIFIC = [
  { match: ['bulgarian'], name: 'Bulgarian split squat' },
  { match: ['goblet'], name: 'Goblet squat' },
  { match: ['sumo squat'], name: 'Sumo squat' },
  { match: ['jump squat'], name: 'Jump squat' },
  { match: ['squat'], name: 'Barbell back squat' },
  { match: ['incline bench', 'incline dumbbell press', 'incline dumbbell'], name: 'Incline dumbbell press' },
  { match: ['decline push'], name: 'Decline push-up' },
  { match: ['close grip push'], name: 'Close-grip push-up' },
  { match: ['incline push'], name: 'Incline push-up' },
  { match: ['push up', 'pushup'], name: 'Push-up' },
  { match: ['bench press', 'flat bench'], name: 'Barbell bench press' },
  { match: ['dumbbell bench'], name: 'Dumbbell bench press' },
  { match: ['overhead press', 'military press', 'shoulder press'], name: 'Overhead press' },
  { match: ['arnold'], name: 'Arnold press' },
  { match: ['push press'], name: 'Push press' },
  { match: ['pike push'], name: 'Pike push-up' },
  { match: ['lateral raise', 'side lateral'], name: 'Lateral raise' },
  { match: ['front raise'], name: 'Front raise' },
  { match: ['rear delt fly', 'rear delt'], name: 'Rear delt fly' },
  { match: ['face pull'], name: 'Face pull' },
  { match: ['upright row'], name: 'Upright row' },
  { match: ['bent over row', 'barbell row'], name: 'Barbell row' },
  { match: ['dumbbell row', 'db row', 'one arm row'], name: 'Dumbbell row' },
  { match: ['seated row', 'seated cable row', 'cable row'], name: 'Seated cable row' },
  { match: ['lat pulldown', 'lat pull'], name: 'Lat pulldown' },
  { match: ['pull up', 'pullup'], name: 'Pull-up' },
  { match: ['chin up', 'chinup'], name: 'Chin-up' },
  { match: ['straight arm pulldown'], name: 'Straight-arm pulldown' },
  { match: ['rdl', 'romanian deadlift'], name: 'Romanian deadlift' },
  { match: ['single leg rdl'], name: 'Single-leg RDL' },
  { match: ['deadlift'], name: 'Romanian deadlift' },
  { match: ['hip thrust'], name: 'Hip thrust' },
  { match: ['glute bridge'], name: 'Glute bridge' },
  { match: ['walking lunge'], name: 'Walking lunge' },
  { match: ['reverse lunge', 'lunge'], name: 'Reverse lunge' },
  { match: ['step up'], name: 'Step-up' },
  { match: ['leg press'], name: 'Leg press' },
  { match: ['leg extension'], name: 'Leg extension' },
  { match: ['hamstring curl', 'leg curl'], name: 'Lying hamstring curl' },
  { match: ['calf raise', 'calves'], name: 'Standing calf raise' },
  { match: ['wall sit'], name: 'Wall sit' },
  { match: ['hammer curl'], name: 'Hammer curl' },
  { match: ['incline curl'], name: 'Incline dumbbell curl' },
  { match: ['concentration curl'], name: 'Concentration curl' },
  { match: ['bicep curl', 'barbell curl', 'biceps curl'], name: 'Barbell curl' },
  { match: ['skull crusher', 'skullcrusher', 'lying tricep'], name: 'Skull crusher' },
  { match: ['tricep pushdown', 'cable pushdown', 'pushdown'], name: 'Triceps pushdown' },
  { match: ['tricep kickback', 'kickback'], name: 'Triceps kickback' },
  { match: ['overhead tricep', 'french press'], name: 'Overhead triceps extension' },
  { match: ['bench dip'], name: 'Bench dip' },
  { match: ['chest dip', 'dips'], name: 'Chest dip' },
  { match: ['cable fly', 'flye'], name: 'Cable fly' },
  { match: ['dumbbell fly'], name: 'Dumbbell fly' },
  { match: ['cable crunch'], name: 'Cable crunch' },
  { match: ['bicycle crunch'], name: 'Bicycle crunch' },
  { match: ['dead bug', 'deadbug'], name: 'Dead bug' },
  { match: ['hanging knee', 'hanging leg'], name: 'Hanging knee raise' },
  { match: ['plank'], name: 'Plank' },
  { match: ['back extension', 'hyperextension'], name: 'Back extension' },
  { match: ['jumping jack'], name: 'Jumping jack' },
  { match: ['high knee'], name: 'High knees' },
  { match: ['mountain climber'], name: 'Mountain climber' },
  { match: ['burpee'], name: 'Burpee' },
  { match: ['jump rope'], name: 'Jump rope' },
  { match: ['jump squat'], name: 'Jump squat' },
]

export function matchExerciseName(raw) {
  if (!raw) return ''
  const s = raw.toLowerCase().trim()
  const clean = s.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const direct = coreExercises.find(e => e.name.toLowerCase() === clean)
  if (direct) return direct.name
  for (const item of SPECIFIC) {
    if (item.match.some(m => clean.includes(m))) return item.name
  }
  return raw
}
