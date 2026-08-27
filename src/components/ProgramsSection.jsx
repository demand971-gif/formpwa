import { useState } from 'react'
import { routines } from '../dataBundle.js'

const FOCUSES = ['All', 'Front', 'Back', 'Legs', 'Shoulders', 'Chest', 'Biceps', 'Triceps', 'Upper', 'Core', 'Cardio', 'Recovery']

export default function ProgramsSection({ onOpenProgram, onToast }) {
  const [focus, setFocus] = useState('All')
  const [showAll, setShowAll] = useState(false)

  const matches = (r) => focus === 'All' || ((focus === 'Front' || focus === 'Back') && r.side === focus) || r.focus === focus
  const shown = routines.filter(r => matches(r) && (focus !== 'All' || r.featured || showAll))
  const shownCount = shown.length

  const applyFilter = (f) => {
    setFocus(f)
    document.getElementById('plans').scrollIntoView({ behavior: 'smooth', block: 'start' })
    onToast(f === 'All' ? 'All programs' : f + ' programs')
  }

  const toggleAll = () => {
    if (focus !== 'All') {
      setFocus('All')
      setShowAll(true)
      onToast('All 50 programs are now visible')
      return
    }
    setShowAll(s => !s)
    if (!showAll) {
      setTimeout(() => {
        const el = document.querySelector('.routine.extra:not(.is-hidden)') || document.querySelector('.routine.extra')
        el && el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      onToast('All 50 programs are now visible')
    } else {
      document.getElementById('plans').scrollIntoView({ behavior: 'smooth' })
      onToast('Showing featured programs')
    }
  }

  const viewAllLabel = focus === 'All'
    ? (showAll ? 'SHOW FEATURED' : 'VIEW ALL 50')
    : shownCount + (focus !== 'Legs' ? ' PROGRAMS' : ' LEG PROGRAMS')

  return (
    <section className="section" id="plans">
      <div className="section-head">
        <div>
          <div className="eyebrow">Trainer-inspired plans</div>
          <h2>Pick your focus.</h2>
        </div>
        <button className="see" id="viewAllPlans" aria-expanded={showAll} onClick={toggleAll}>{viewAllLabel}</button>
      </div>
      <div className="program-filters" id="programFilters">
        {FOCUSES.map(f => (
          <button key={f} className={'chip' + (focus === f ? ' on' : '')} type="button" data-focus={f} onClick={() => applyFilter(f)}>
            {f === 'All' ? 'All programs' : f}
          </button>
        ))}
      </div>
      <div className={'routines' + (focus !== 'All' ? ' filter-on' : '') + (showAll ? ' show-all' : '')} id="routineGrid"
        onClick={(e) => { if (!e.target.closest('.go')) { const card = e.target.closest('.routine'); if (card) { const btn = card.querySelector('.go'); btn && btn.click() } } }}>
        {shown.map((r, i) => (
          <article key={i} className={'routine' + (r.featured ? '' : ' extra-routine')} data-focus={r.focus} data-side={r.side}
            style={r.bg ? { background: r.bg } : undefined}>
            <div className="routine-num">{r.num}</div>
            <div>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
            <button className="go" onClick={() => onOpenProgram(r.program)}>↗</button>
          </article>
        ))}
      </div>
    </section>
  )
}
