import { best1RM } from '../lib/onerm.js'

export default function ProgressSection({
  progress, favCount, prs, swNote, savingOffline, onClearLog, onCacheOffline, onSwRefresh, onOpenExercise,
}) {
  const sessions = progress.sessions || []
  const workouts = sessions.length
  const mins = progress.totalMinutes || 0
  const streak = progress.streak || 0

  // week bars
  const days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const count = sessions.filter(s => s.date === key).length
    return { key, count, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }) }
  })
  const max = Math.max(1, ...days.map(d => d.count))

  // PR log
  const allPrs = prs || {}
  const prNames = Object.keys(allPrs)
  const prItems = prNames.map(name => {
    const rows = allPrs[name] || []
    const bestEst = best1RM(rows)
    const heavySet = rows.reduce((a, b) => (b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps)) ? b : a)
    return {
      name,
      est1rm: bestEst ? bestEst.est : heavySet.weight,
      heavySet,
      date: bestEst ? bestEst.date : (rows[0] ? rows[0].date : ''),
    }
  }).sort((a, b) => b.est1rm - a.est1rm)

  return (
    <section className="section" id="progress">
      <div className="section-head">
        <div>
          <div className="eyebrow">Your log</div>
          <h2>Progress.</h2>
        </div>
        <button className="see" id="clearLog" type="button" onClick={onClearLog}>RESET LOG</button>
      </div>
      <div className="progress-grid">
        <div className="stat"><div className="micro">Workouts</div><b id="statWorkouts">{workouts}</b></div>
        <div className="stat"><div className="micro">Minutes</div><b id="statMinutes">{mins}</b></div>
        <div className="stat"><div className="micro">Day streak</div><b id="statStreak">{streak}</b></div>
        <div className="stat"><div className="micro">Favorites</div><b id="statFavs">{favCount}</b></div>
      </div>
      <div className="sw-row">
        <button type="button" id="cacheOffline" disabled={savingOffline} onClick={onCacheOffline}>{savingOffline ? 'SAVING…' : 'SAVE LIBRARY OFFLINE'}</button>
        <button type="button" id="swRefresh" onClick={onSwRefresh}>CHECK FOR UPDATES</button>
      </div>
      <div className="micro" id="swNote" style={{ marginTop: 8 }}>{swNote}</div>
      <div className="micro">This week</div>
      <div className="week-bars" id="weekBars">
        {days.map(d => (
          <span key={d.key} className={d.count ? 'on' : ''} title={d.key} style={{ height: Math.max(8, (d.count / max) * 100) + '%' }} />
        ))}
      </div>
      <div className="micro" style={{ margin: '22px 0 10px' }}>Recent sessions</div>
      <div className="session-log" id="sessionLog">
        {sessions.length
          ? sessions.slice(0, 8).map((s, i) => (
            <div className="log-item" key={i}>
              <div><strong>{s.name}</strong><div className="micro">{s.date} · {s.done || 0}/{s.total || 0} moves</div></div>
              <b>{s.minutes} min</b>
            </div>
          ))
          : <div className="empty">Finish a workout to start your log.</div>}
      </div>
      <div className="micro" style={{ margin: '22px 0 10px' }}>Personal records (1RM Best)</div>
      <div className="session-log" id="prLog">
        {prItems.length
          ? prItems.map(item => (
            <div className="log-item" key={item.name} style={{ cursor: 'pointer' }} onClick={() => onOpenExercise(item.name)}>
              <div><strong>{item.name}</strong><div className="micro">{item.heavySet.weight} kg × {item.heavySet.reps} reps · {item.date}</div></div>
              <div style={{ textAlign: 'right' }}>
                <b style={{ color: 'var(--lime)', background: 'var(--dark)', padding: '4px 9px', borderRadius: 8, fontSize: 13 }}>{item.est1rm} kg 1RM</b>
              </div>
            </div>
          ))
          : <div className="empty">Log sets with weights and reps to see your 1RM PRs.</div>}
      </div>
    </section>
  )
}
