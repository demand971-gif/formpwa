import { useMemo, useState } from 'react'
import { extendedDBRaw } from '../lib/extended.js'

const CATS = [
  ['all', 'All (1,324)'],
  ['chest', 'Chest'],
  ['back', 'Back'],
  ['upper legs', 'Legs'],
  ['waist', 'Core'],
  ['shoulders', 'Shoulders'],
]

export default function ExtendedDBModal({ open, onClose, onAddToBuilder, onOpenYt }) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [limit, setLimit] = useState(50)
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return extendedDBRaw.filter(ex => {
      if (cat !== 'all' && ex.bp !== cat) return false
      if (!q) return true
      const nameMatch = ex.n && ex.n.toLowerCase().includes(q)
      const targetMatch = ex.tg && ex.tg.toLowerCase().includes(q)
      const eqMatch = ex.eq && ex.eq.toLowerCase().includes(q)
      const bpMatch = ex.bp && ex.bp.toLowerCase().includes(q)
      const smMatch = ex.sm && ex.sm.some(s => s.toLowerCase().includes(q))
      return nameMatch || targetMatch || eqMatch || bpMatch || smMatch
    })
  }, [query, cat])
  if (!open) return null

  const visible = filtered.slice(0, limit)

  return (
    <div className="modal open" id="extendedModal" onClick={(e) => { if (e.target.id === 'extendedModal') onClose() }}>
      <div className="sheet" style={{ maxWidth: 820, width: '95%' }}>
        <button className="close" id="closeExtendedModal" onClick={onClose}>×</button>
        <div className="micro">openGym exercise database</div>
        <h2 style={{ margin: '4px 0 10px' }}>1,324 Exercise Database</h2>
        <p className="micro" style={{ marginBottom: 12 }}>Explore 1,324 strength, functional and conditioning movements with anatomy targets, equipment, and technique steps.</p>
        <label className="search" style={{ width: '100%', marginBottom: 10 }}>⌕
          <input id="extendedSearchInput" placeholder="Search 1,300+ exercises, target muscles, equipment..." value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(50) }} />
        </label>
        <div className="filters" id="extendedFilters" style={{ marginBottom: 8 }}>
          {CATS.map(([c, label]) => (
            <button key={c} className={'chip' + (cat === c ? ' on' : '')} data-cat={c}
              onClick={() => { setCat(c); setLimit(50) }}>{label}</button>
          ))}
        </div>
        <div className="micro" id="extendedCount" style={{ margin: '6px 0' }}>
          Found {filtered.length} movements{query ? ' matching "' + query + '"' : ''}
        </div>
        <div id="extendedResults" style={{ maxHeight: '46vh', overflow: 'auto' }}>
          {!filtered.length
            ? <div className="empty">No movements match those criteria. Try another search term.</div>
            : visible.map(ex => {
              const capName = ex.n.charAt(0).toUpperCase() + ex.n.slice(1)
              const gifUrl = ex.gif ? 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/' + ex.gif : ''
              return (
                <article className="log-item" key={ex.id} style={{ display: 'block', padding: '12px 14px', borderRadius: 14, background: '#faf8f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <strong style={{ fontSize: 15 }}>{capName}</strong>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', margin: '5px 0' }}>
                        <span style={{ background: 'var(--ink)', color: 'white', padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 900 }}>{(ex.bp || '').toUpperCase()}</span>
                        <span style={{ background: 'var(--lime)', color: 'var(--dark)', padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 900 }}>{(ex.tg || '').toUpperCase()}</span>
                        <span style={{ background: '#efebe2', color: '#444', padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 800 }}>{(ex.eq || '').toUpperCase()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="chip" style={{ fontSize: 10, padding: '5px 9px', background: 'var(--ink)', color: 'white' }}
                        onClick={() => onAddToBuilder(capName)}>+ ADD MOVE</button>
                    </div>
                  </div>
                  {ex.st && ex.st.length > 0 && (
                    <details style={{ marginTop: 6, fontSize: 11, color: '#555' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 800, color: 'var(--orange)' }}>View Technique Instructions ({ex.st.length} steps) ▾</summary>
                      <ol style={{ margin: '6px 0 4px', paddingLeft: 18, lineHeight: 1.45 }}>
                        {ex.st.map((s, i) => <li key={i} style={{ margin: '3px 0' }}>{s}</li>)}
                      </ol>
                      {gifUrl && <div style={{ marginTop: 6 }}><a href={gifUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 900, color: 'var(--ink)', textDecoration: 'underline' }}>View Demonstration Animation ↗</a></div>}
                      {ex.yt && <div style={{ marginTop: 5 }}><a href={`https://www.youtube.com/watch?v=${ex.yt}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 900, color: '#ff0033', textDecoration: 'underline' }}
                        onClick={(e) => { e.preventDefault(); onOpenYt(`https://www.youtube.com/watch?v=${ex.yt}`, 'Tutorial: ' + capName) }}>▶ Watch Tutorial on YouTube ↗</a></div>}
                    </details>
                  )}
                </article>
              )
            })}
          {filtered.length > limit && (
            <button type="button" className="program-start" style={{ height: 40, fontSize: 11, marginTop: 8 }} onClick={() => setLimit(limit + 50)}>
              SHOW MORE MOVEMENTS ({filtered.length - limit} MORE) ↓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
