// Extended 1,324-exercise database mapping (verbatim logic)
import rawDB from '../data/extended-exercises.json'

export const CDN = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd'

export function mapBP(bp, tg) {
  if (bp === 'chest') return 'Chest'
  if (bp === 'back') return 'Back'
  if (bp === 'upper legs' || bp === 'lower legs') return tg === 'glutes' ? 'Glutes' : 'Legs'
  if (bp === 'waist') return 'Core'
  if (bp === 'shoulders') return 'Shoulders'
  if (bp === 'upper arms' || bp === 'lower arms') return tg === 'triceps' ? 'Triceps' : 'Biceps'
  if (bp === 'cardio') return 'Cardio'
  return 'Core'
}

export function mapSide(part) {
  if (part === 'Chest' || part === 'Core' || part === 'Biceps') return 'Front'
  if (part === 'Back' || part === 'Triceps' || part === 'Glutes') return 'Back'
  return 'Both'
}

export function mapEQ(eq) {
  const e = (eq || '').toLowerCase()
  if (e.includes('body') || e.includes('assisted')) return 'Bodyweight'
  if (e.includes('dumbbell')) return 'Dumbbells'
  if (e.includes('barbell') || e.includes('weighted') || e.includes('olympic')) return 'Barbell'
  if (e.includes('cable')) return 'Cable'
  if (e.includes('machine') || e.includes('sled') || e.includes('trainer') || e.includes('bike')) return 'Machine'
  return 'Dumbbells'
}

export function mapExtendedDB(db = rawDB) {
  return db.map(ex => {
    const capName = ex.n.charAt(0).toUpperCase() + ex.n.slice(1)
    const part = mapBP(ex.bp, ex.tg)
    return {
      name: capName,
      part,
      eq: mapEQ(ex.eq),
      level: 'All levels',
      icon: '🏋️',
      color: '#d8ff3e',
      cues: (ex.st && ex.st.length) ? ex.st : ['Perform with steady control.', 'Breathe through full range of motion.'],
      imgUrl: ex.img ? CDN + '/images/' + ex.img : '',
      gifUrl: ex.gif ? CDN + '/videos/' + ex.gif : '',
      side: mapSide(part),
      yt: ex.yt || '',
      ytTitle: ex.ytt || '',
      isExtended: true,
    }
  })
}

export const extendedDBMapped = mapExtendedDB()
export const extendedDBRaw = rawDB
