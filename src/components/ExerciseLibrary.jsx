import { useMemo } from 'react'
import { exercises, exerciseSide } from '../dataBundle.js'
import { extendedDBMapped } from '../lib/extended.js'

export default function ExerciseLibrary({
  source, onSourceChange, part, view, equipment, onEquipment, query, onQuery,
  cardsLimit, onCardsLimit, saved, onToggleFav, onOpenExercise, onOpenExtDb,
}) {
  const activeList = source === 'extended' ? extendedDBMapped : exercises

  const list = useMemo(() => {
    return activeList.filter(x => {
      const side = x.side || exerciseSide[x.name] || 'Both'
      return (side === 'Both' || side === view)
        && (part === 'All' || x.part === part)
        && (equipment === 'All' || x.eq === equipment)
        && x.name.toLowerCase().includes(query)
    })
  }, [activeList, part, view, equipment, query])

  const visible = source === 'extended' ? list.slice(0, cardsLimit) : list
  const libraryTitle = part === 'All' ? (view + ' exercises') : (part + ' exercises')

  return (
    <section className="library" id="library">
      <div className="library-top">
        <div>
          <div className="micro">Build your session</div>
          <h2 id="libraryTitle">{libraryTitle}</h2>
          <div className="view-toggle" id="librarySourceToggle" style={{ marginTop: 6, width: 'fit-content' }}>
            <button type="button" className={source === 'core' ? 'on' : ''} onClick={() => onSourceChange('core')}>Core (63)</button>
            <button type="button" className={source === 'extended' ? 'on' : ''} onClick={() => onSourceChange('extended')}>All Database (1,324)</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="search">⌕<input id="search" placeholder="Search exercises, muscles, equipment..." value={query} onChange={(e) => onQuery(e.target.value.toLowerCase())} /></label>
          <button type="button" className="media-tab" id="openExtendedLibrary" onClick={() => onOpenExtDb && onOpenExtDb()} style={{ background: 'var(--ink)', color: 'white', fontWeight: 900, letterSpacing: '.3px', padding: '9px 13px', whiteSpace: 'nowrap' }}>DATABASE MODAL 🔍</button>
        </div>
      </div>
      <div className="filters" id="equipmentFilters">
        {['All equipment', 'Bodyweight', 'Dumbbells', 'Cable', 'Barbell', 'Machine'].map((label, i) => {
          const eq = i === 0 ? 'All' : label.split(' ')[0]
          return <button key={label} className={'chip' + (equipment === eq ? ' on' : '')} data-equipment={eq} onClick={() => onEquipment(eq)}>{label}</button>
        })}
      </div>
      <div className="cards" id="cards">
        {visible.length ? visible.map(x => {
          const thumb = x.imgUrl ? x.imgUrl : `media/exercises/${x.name.toLowerCase().replace(/\s+/g, '-')}.png`
          const isFav = saved.has(x.name)
          return (
            <article key={x.name} className="exercise" data-name={x.name} tabIndex={0} role="button" aria-label={`View coaching instructions for ${x.name}`} onClick={() => onOpenExercise(x)}>
              <button className={'fav' + (isFav ? ' saved' : '')} data-fav={x.name} aria-label="Save"
                onClick={(e) => { e.stopPropagation(); onToggleFav(x.name) }}>{isFav ? '♥' : '♡'}</button>
              <div className="exercise-thumb"><img src={thumb} alt={`${x.name} exercise illustration`} loading="lazy" /></div>
              <h3>{x.name}</h3>
              <p>{x.part} · {x.eq}</p>
              <span className="coach-link">VIEW COACHING →</span>
            </article>
          )
        }) : <div className="empty">No exercises match those filters. Try another equipment option.</div>}
      </div>
      {source === 'extended' && list.length > cardsLimit && (
        <div id="loadMoreWrap" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
          <button id="loadMoreCards" className="program-start" type="button" style={{ width: 'min(320px,100%)' }} onClick={() => onCardsLimit(cardsLimit + 48)}>
            LOAD MORE MOVEMENTS ({list.length - cardsLimit} MORE) ↓
          </button>
        </div>
      )}
    </section>
  )
}
