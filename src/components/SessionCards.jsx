export default function SessionCards({ onOpenProgram, onStart }) {
  return (
    <>
      <article className="today-card" id="todayCard" role="button" tabIndex={0}
        aria-label="Open Full-body foundation workout"
        onClick={(e) => { if (e.target.closest('#startWorkout')) return; onOpenProgram('Full-body foundation') }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart('Full-body foundation') } }}>
        <div className="today-top">
          <div className="micro" style={{ color: '#b9bbb4' }}>Today's session</div>
          <div className="micro" style={{ color: 'var(--lime)' }}>Beginner friendly</div>
        </div>
        <h2>Full-body<br />foundation</h2>
        <div className="meta"><span>● 38 min</span><span>● 7 exercises</span><span>● Dumbbells</span></div>
        <button className="start-btn" id="startWorkout" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStart('Full-body foundation') }}>START WORKOUT →</button>
      </article>
      <article className="cardio-card" id="cardioCard" role="button" tabIndex={0}
        aria-label="Open Cardio session"
        onClick={(e) => { if (e.target.closest('#startCardio')) return; onOpenProgram('Cardio session') }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart('Cardio session') } }}>
        <div className="today-top">
          <div className="micro" style={{ color: '#ffb89a' }}>Cardio session</div>
          <div className="micro" style={{ color: '#ff6b35' }}>Heart-rate work</div>
        </div>
        <h2>Sweat &amp;<br />condition</h2>
        <div className="meta"><span>● 22 min</span><span>● 6 moves</span><span>● Bodyweight</span></div>
        <button className="start-btn" id="startCardio" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStart('Cardio session') }}>START CARDIO →</button>
      </article>
      <a href="#studio" id="toolsTeaser" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'var(--ink)', color: 'white', borderRadius: 18, padding: '16px 18px', textDecoration: 'none' }}>
        <div>
          <div className="micro" style={{ color: '#d8ff3e' }}>New in this build</div>
          <strong>Dark mode, custom sessions, PRs, reminders, calendar, backup</strong>
        </div>
        <span style={{ background: 'var(--lime)', color: 'var(--dark)', borderRadius: 99, padding: '8px 12px', fontWeight: 900, fontSize: 12 }}>OPEN TOOLS →</span>
      </a>
    </>
  )
}
