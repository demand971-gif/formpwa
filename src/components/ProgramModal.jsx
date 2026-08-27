import { programPlans, workoutMoves } from '../dataBundle.js'
import { youtubeFor } from '../lib/youtube.js'

export default function ProgramModal({ program, onClose, onStart, onOpenYt }) {
  const days = programPlans[program] || programPlans['Strength Starter']
  const previewMoves = workoutMoves[program] || workoutMoves['Strength Starter']
  return (
    <div className="modal open" id="programModal" onClick={(e) => { if (e.target.id === 'programModal') onClose() }}>
      <div className="sheet">
        <button className="close" id="closeProgramModal" onClick={onClose}>×</button>
        <div className="micro">Training program</div>
        <h2 id="programTitle">{program}</h2>
        <div className="detail-meta" id="programMeta">
          <span>4 weeks</span>
          <span>{days.length} days/week</span>
          <span>{days.reduce((a, d) => a + parseInt(d[2]), 0)} min/week</span>
        </div>
        <div className="program-days" id="programDays">
          {days.map((d, i) => (
            <div className="program-day" key={i}>
              <div className="day-num">0{i + 1}</div>
              <div><h4>{d[0]}</h4><p>{d[1]}</p></div>
              <div className="day-time">{d[2]}</div>
            </div>
          ))}
        </div>
        <div className="micro">Exercise preview · animated demonstrations</div>
        <div className="preview-strip" id="programExercisePreview">
          {previewMoves.map(m => {
            const yt = youtubeFor(m)
            return (
              <a key={m} className="preview-item" href={yt.url} target="_blank" rel="noopener noreferrer" title={yt.title}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenYt(yt.url, yt.title) }}>
                <img src={`media/real/${m.toLowerCase().replace(/\s+/g, '-')}.gif`} alt={`${m} demonstration`} />
                <span>{m} · YouTube ↗</span>
              </a>
            )
          })}
        </div>
        <button className="program-start" id="programStart" type="button" onClick={() => onStart(program)}>START {program.toUpperCase()}</button>
      </div>
    </div>
  )
}
