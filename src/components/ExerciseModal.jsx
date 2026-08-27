import { useEffect, useState } from 'react'
import { watchUrlFor } from '../lib/youtube.js'
import { estimate1RM, best1RM, REP_CAP } from '../lib/onerm.js'
import { calcPlates, formatPlatesSummary } from '../lib/plates.js'
import { getProgression } from '../lib/progression.js'
import PlateVisual from './PlateVisual.jsx'

export default function ExerciseModal({
  ex, prs, onClose, onOpenYt, onToast, onSavePr,
}) {
  const [media, setMedia] = useState('picture')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [plateOpen, setPlateOpen] = useState(false)

  const rows = (prs || {})[ex.name] || []
  const yt = watchUrlFor(ex)
  const isBarbell = ex.eq === 'Barbell'

  // media area
  let mediaNode
  const base = 'media/exercises/' + ex.name.toLowerCase().replace(/\s+/g, '-')
  if (ex.isExtended) {
    if (media === 'picture') mediaNode = <><img src={ex.imgUrl} alt={`${ex.name} form illustration`} /><span className="media-note">POSITION GUIDE</span></>
    else if (media === 'gif') mediaNode = <><img src={ex.gifUrl} alt={`Animated ${ex.name} demonstration`} /><span className="media-note">ANIMATED FORM GUIDE</span></>
    else mediaNode = ex.yt
      ? <iframe src={`https://www.youtube-nocookie.com/embed/${ex.yt}?autoplay=1&rel=0`} title={`${ex.name} YouTube tutorial`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen
          style={{ width: '100%', height: '100%', border: 0, borderRadius: 19 }} />
      : <><img src={ex.gifUrl} alt={`Animated ${ex.name} demonstration`} /><span className="media-note">ANIMATED FORM GUIDE</span></>
  } else {
    if (media === 'picture') mediaNode = <><img src={base + '.png'} alt={`${ex.name} form illustration`} /><span className="media-note">POSITION GUIDE</span></>
    else if (media === 'gif') mediaNode = <><img src={base + '.gif'} alt={`Animated ${ex.name} demonstration`} /><span className="media-note">ANIMATED FORM GUIDE</span></>
    else mediaNode = <video src={base + '.mp4'} autoPlay muted loop playsInline controls aria-label={`${ex.name} video illustration`} />
  }

  // live 1RM
  const w = parseFloat(weight)
  const r = parseInt(reps, 10)
  const prevBest = best1RM(rows)
  let badge = null
  let live = ''
  if (w > 0 && r > 0) {
    if (r > REP_CAP) {
      const est12 = estimate1RM(w, 12, 'epley')
      badge = { text: 'EST. 1RM: ' + est12 + ' KG*', bg: '#ffd166', color: '#171816' }
      live = 'ⓘ High-rep set (' + r + ' reps). 1RM capped at 12 reps (' + est12 + ' kg) to avoid endurance overestimation.'
    } else {
      const est = estimate1RM(w, r, 'epley')
      const brz = estimate1RM(w, r, 'brzycki')
      const lom = estimate1RM(w, r, 'lombardi')
      if (est) {
        const isPr = !prevBest || est > prevBest.est
        badge = isPr
          ? { text: '🔥 NEW 1RM PR: ' + est + ' KG (+' + (prevBest ? (est - prevBest.est).toFixed(1) : est) + ')', bg: 'var(--lime)', color: 'var(--dark)' }
          : { text: 'EST. 1RM: ' + est + ' KG', bg: '#ece8df', color: 'var(--ink)' }
        live = 'Epley: ' + est + ' kg · Brzycki: ' + brz + ' kg · Lombardi: ' + lom + ' kg'
      }
    }
  }

  // best / history
  let bestText = 'No sets logged yet'
  let history = null
  if (rows.length) {
    const bestSet = rows.reduce((a, b) => (b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps)) ? b : a)
    bestText = 'Best: ' + bestSet.weight + ' kg × ' + bestSet.reps
    if (prevBest) bestText += ' · All-Time 1RM: ' + prevBest.est + ' kg (' + prevBest.weight + '×' + prevBest.reps + ' on ' + prevBest.date + ')'
    history = rows.slice(0, 5)
  }

  // adaptive progression
  const prog = getProgression(ex.name, 'linear')
  const showProg = prog && !(prog.kind === 'first' && prog.weight === 0)
  const progSummary = prog.weight > 0
    ? 'Target: ' + prog.weight + ' kg × ' + prog.reps + ' reps (' + prog.action + ')'
    : 'Target: ' + prog.reps + ' reps (' + prog.action + ')'

  const saveSet = () => {
    if (!w || !r || w <= 0 || r <= 0) { onToast('Enter valid weight and reps'); return }
    onSavePr(ex.name, w, r)
  }

  const plateRes = plateOpen ? calcPlates(w || 100, 20) : null

  return (
    <div className="modal open" id="modal" onClick={(e) => { if (e.target.id === 'modal') onClose() }}>
      <div className="sheet">
        <button className="close" id="closeModal" onClick={onClose}>×</button>
        <div className="micro">Exercise guide</div>
        <h2 id="modalTitle">{ex.name}</h2>
        <div className="detail-meta" id="modalMeta">
          <span>{ex.part}</span><span>{ex.eq}</span><span>{ex.level || 'All levels'}</span>
        </div>
        <div className="media-tabs" id="mediaTabs" style={{ display: 'flex' }}>
          <button className={'media-tab' + (media === 'picture' ? ' on' : '')} data-media="picture" onClick={() => setMedia('picture')}>PICTURE</button>
          <button className={'media-tab' + (media === 'gif' ? ' on' : '')} data-media="gif" onClick={() => setMedia('gif')}>GIF</button>
          <button className={'media-tab' + (media === 'video' ? ' on' : '')} data-media="video" onClick={() => setMedia('video')}>VIDEO</button>
        </div>
        <div className="demo has-media" id="modalIcon" style={{ background: ex.color || '#d8ff3e' }}>{mediaNode}</div>
        <div className="cues">
          <div className="micro">Coach cues</div>
          <ul id="modalCues">
            {(ex.cues && ex.cues.length ? ex.cues : ['Move slowly and stay in control.', 'Maintain steady breathing throughout range of motion.']).map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          <a className="youtube-link" id="modalYoutube" href={yt.url} target="_blank" rel="noopener noreferrer"
            title={yt.title} onClick={(e) => { e.preventDefault(); onOpenYt(yt.url, yt.title) }}>
            <span className="youtube-icon">▶</span>{yt.title.toUpperCase()} ↗
          </a>

          {/* PR log box */}
          <div className="pr-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div className="micro">Log a set / 1RM PR</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {isBarbell && (
                  <button type="button" id="modalPlateToggle" className="media-tab" style={{ padding: '3px 9px', fontSize: 10 }}
                    onClick={() => setPlateOpen(o => !o)}>PLATES 🏋️</button>
                )}
                {badge && <span className="micro" id="pr1rmBadge" style={{ display: 'inline-block', background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 99 }}>{badge.text}</span>}
              </div>
            </div>
            <div id="modalProgBar" style={{ display: showProg ? 'flex' : 'none', background: '#faf8f2', border: '1px solid ' + (prog.kind === 'deload' ? 'var(--orange)' : 'var(--line)'), borderRadius: 12, padding: '8px 12px', margin: '8px 0', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="micro" style={{ fontWeight: 900, color: 'var(--orange)' }}>ADAPTIVE TARGET COACH</div>
                <div id="modalProgText" style={{ fontSize: 12, fontWeight: 850, color: 'var(--ink)' }}>
                  {progSummary}
                  <div className="micro" style={{ color: 'var(--muted)', marginTop: 2 }}>{prog.why}</div>
                </div>
              </div>
              <button type="button" id="useProgBtn" className="media-tab" style={{ padding: '5px 12px', fontSize: 10, background: 'var(--ink)', color: 'white', fontWeight: 900 }}
                onClick={() => {
                  if (prog.weight > 0) setWeight(String(prog.weight))
                  if (prog.reps > 0) setReps(String(prog.reps))
                  onToast('Applied target: ' + (prog.weight > 0 ? prog.weight + ' kg × ' : '') + prog.reps)
                }}>USE ↵</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <input className="field" id="prWeight" placeholder="Weight (kg)" inputMode="decimal" style={{ margin: 0, flex: 1, minWidth: 90 }} value={weight} onChange={(e) => setWeight(e.target.value)} />
              <input className="field" id="prReps" placeholder="Reps" inputMode="numeric" style={{ margin: 0, flex: 1, minWidth: 70 }} value={reps} onChange={(e) => setReps(e.target.value)} />
              <button className="theme-btn" id="savePr" type="button" onClick={saveSet}>SAVE SET</button>
            </div>
            {plateOpen && (
              <div id="modalPlateDrawer" style={{ display: 'block', marginTop: 10, padding: 12, borderRadius: 14, background: 'var(--dark)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="micro" style={{ color: 'var(--lime)' }}>BARBELL PLATE LOADER</div>
                  <button type="button" id="closeModalPlate" style={{ border: 0, background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 900 }} onClick={() => setPlateOpen(false)}>✕</button>
                </div>
                {plateRes && plateRes.ok
                  ? <PlateVisual plates={plateRes.plates} scale={0.85} />
                  : <div style={{ color: 'var(--orange)', fontSize: 12, padding: '8px 0' }}>{plateRes ? plateRes.msg : ''}</div>}
                <div id="modalPlateText" style={{ fontSize: 16, fontWeight: 950, textAlign: 'center', color: 'var(--lime)' }}>
                  {plateRes && plateRes.ok ? plateRes.target + ' kg total · ' + plateRes.perSideTotal + ' kg / side' : (w || 100) + ' kg'}
                </div>
                <div id="modalPlateList" className="micro" style={{ textAlign: 'center', color: '#eee', marginTop: 2 }}>
                  {plateRes && plateRes.ok ? formatPlatesSummary(plateRes.plates) : ''}
                </div>
              </div>
            )}
            <div id="prLiveCalc" className="micro" style={{ marginTop: 6, minHeight: 16, color: 'var(--muted)' }}>{live}</div>
            <div className="micro" id="prBest" style={{ marginTop: 6 }}>{bestText}</div>
            {history && (
              <div id="prHistoryList" style={{ marginTop: 8, display: 'block', maxHeight: 120, overflow: 'auto' }}>
                <div className="micro" style={{ margin: '8px 0 4px', fontWeight: 900 }}>Recent sets &amp; 1RM history:</div>
                {history.map((s, i) => {
                  const est = estimate1RM(s.weight, s.reps)
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: 11 }}>
                      <span>{s.weight} kg × {s.reps} reps{est ? <b style={{ color: 'var(--orange)' }}> ({est} kg 1RM)</b> : null}</span>
                      <span style={{ color: 'var(--muted)' }}>{s.date || ''}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
