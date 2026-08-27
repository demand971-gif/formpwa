import { fmtTime } from '../lib/workout.js'

export default function WorkoutBar({ visible, name, clock, running, soundOn, onOpenRunner, onTogglePause, onToggleSound }) {
  if (!visible) return null
  const label = clock.phase === 'rest' ? 'REST' : clock.phase === 'work' ? 'WORK' : 'READY'
  return (
    <div className={'workoutbar show' + (clock.phase === 'rest' ? ' resting' : '')} id="workoutbar">
      <span className="phase" id="phaseLabel">{clock.phase === 'idle' ? label : label + ' ' + clock.left + 's'}</span>
      <span id="activeName" onClick={onOpenRunner}>{name}</span>
      <span className="timer" id="timer">{fmtTime(clock.elapsed)}</span>
      <button className="sound-btn" id="soundToggle" type="button" aria-label="Toggle sound" onClick={onToggleSound}>
        {soundOn ? '♪' : '✕'}
      </button>
      <button id="pause" type="button" onClick={onTogglePause}>{running ? 'Ⅱ' : '▶'}</button>
    </div>
  )
}
