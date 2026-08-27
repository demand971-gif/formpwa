// Workout clock helpers
export function fmtTime(s) {
  s = Math.max(0, s | 0)
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

export function newClock(isCardio) {
  return {
    elapsed: 0,
    phase: 'idle',
    left: 0,
    round: 1,
    rounds: 3,
    workSec: isCardio ? 40 : 90,
    restSec: isCardio ? 20 : 45,
    auto: isCardio,
  }
}
