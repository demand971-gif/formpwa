import { useState } from 'react'
import { exercises } from '../dataBundle.js'
import { youtubeFor } from '../lib/youtube.js'
import { fmtTime } from '../lib/workout.js'

export default function RunnerModal({
  session, clock, running, onClose, onToggleMove, onTogglePause, onClockSkip, onClockAdd,
  onSkipRest, onAddRest, onFinish, onOpenYt, onToast,
}) {
  const [hr, setHr] = useState('')
  const [hrZone, setHrZone] = useState('Zone —')
  const moves = session.moves
  const doneCount = session.done.size
  const total = moves.length
  const allDone = doneCount === total && total > 0
  const label = clock.phase === 'rest' ? 'REST' : clock.phase === 'work' ? 'WORK' : 'READY'

  const saveHr = () => {
    const bpm = parseInt(hr, 10)
    if (!bpm) { onToast('Enter heart rate'); return }
    let zone = 'Z1 easy'
    if (bpm >= 170) zone = 'Z5 max'
    else if (bpm >= 155) zone = 'Z4 hard'
    else if (bpm >= 140) zone = 'Z3 tempo'
    else if (bpm >= 125) zone = 'Z2 aerobic'
    setHrZone(zone)
    onToast(bpm + ' bpm · ' + zone)
  }

  return (
    <div className="modal open" id="runnerModal" onClick={(e) => { if (e.target.id === 'runnerModal') onClose() }}>
      <div className="sheet">
        <button className="close" id="closeRunnerModal" onClick={onClose}>×</button>
        <div className="micro">Active workout</div>
        <h2 id="runnerTitle">{session.title}</h2>
        <div className="runner-status">
          <span id="runnerProgram">{session.program}</span>
          <span id="runnerProgress">{doneCount} / {total} COMPLETE</span>
        </div>

        <div className={'clock-panel' + (clock.phase === 'rest' ? ' resting' : '')} id="clockPanel">
          <div className="clock-phase" id="clockPhase">{label}</div>
          <div className="clock-main" id="clockMain">{clock.phase === 'idle' ? fmtTime(clock.elapsed) : fmtTime(clock.left)}</div>
          <div className="clock-sub">
            <span id="clockElapsed">Session {fmtTime(clock.elapsed)}</span> · <span id="clockRound">{clock.auto ? 'Round ' + clock.round + ' / ' + clock.rounds : 'Open sets · tap move when done'}</span>
          </div>
          <div className="clock-actions">
            <button className="on" id="clockPause" type="button" onClick={onTogglePause}>{running ? 'PAUSE' : 'RESUME'}</button>
            <button className="off" id="clockSkip" type="button" onClick={onClockSkip}>SKIP</button>
            <button className="off" id="clockAdd" type="button" onClick={onClockAdd}>+15s</button>
          </div>
        </div>

        <div className="runner-list" id="runnerList">
          {moves.map((m, i) => {
            const ex = exercises.find(x => x.name === m)
            const cues = ex ? ex.cues : ['Move slowly and stay in control.', 'Keep a comfortable, pain-free range of motion.', 'Stop when your form begins to change.']
            const done = session.done.has(i)
            const now = !done && i === session.nextIdx
            return (
              <article key={i} className={'runner-move' + (done ? ' done' : '') + (now ? ' now' : '')} onClick={() => onToggleMove(i)}>
                <img className="runner-gif" src={`media/real/${m.toLowerCase().replace(/\s+/g, '-')}.gif`} alt={`Realistic athlete demonstrating ${m}`} loading="eager" />
                <div className="runner-copy">
                  <strong>{m}</strong>
                  <small>{session.targets[i] || ''}{ex && ex.part === 'Cardio' ? '40 sec on · 20 sec rest · 3 rounds' : '3 sets · 8–12 reps · ' + (ex ? ex.eq : 'Bodyweight')}</small>
                  <ol className="runner-cues">{cues.map((c, j) => <li key={j}>{c}</li>)}</ol>
                  <a className="youtube-link" href={youtubeFor(m).url} target="_blank" rel="noopener noreferrer" title={youtubeFor(m).title}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenYt(youtubeFor(m).url, youtubeFor(m).title) }}>
                    <span className="youtube-icon">▶</span>WATCH RESEARCHED TUTORIAL ↗
                  </a>
                </div>
                <span className="runner-check">{done ? '✓' : i + 1}</span>
              </article>
            )
          })}
        </div>

        {session.isCardio && (
          <div className="hr-box" id="hrBox" style={{ display: 'flex' }}>
            <div className="micro">Heart rate</div>
            <input className="field" id="hrInput" placeholder="bpm" inputMode="numeric" style={{ margin: 0, width: 90 }} value={hr} onChange={(e) => setHr(e.target.value)} />
            <b id="hrZone">{hrZone}</b>
            <button className="theme-btn" id="saveHr" type="button" onClick={saveHr}>LOG HR</button>
          </div>
        )}

        <div className={'rest-panel' + (clock.phase === 'rest' ? ' show' : '')} id="restPanel">
          <div className="micro">Rest timer</div>
          <div className="rest-count" id="restCount">{fmtTime(clock.left)}</div>
          <div className="micro" id="restHint">Breathe. Next move is coming.</div>
          <div className="rest-actions">
            <button className="rest-skip" id="skipRest" type="button" onClick={onSkipRest}>SKIP REST</button>
            <button className="rest-add" id="addRest" type="button" onClick={onAddRest}>+20s</button>
          </div>
        </div>

        <button className="program-start" id="finishWorkout" type="button" onClick={onFinish}>
          {allDone ? 'COMPLETE WORKOUT ✓' : 'FINISH WORKOUT'}
        </button>
      </div>
    </div>
  )
}
