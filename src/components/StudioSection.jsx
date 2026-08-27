import { useEffect, useState } from 'react'
import { exercises, programPlans, workoutMoves } from '../dataBundle.js'
import { loadJSON, saveJSON, saveProgress, prs } from '../lib/storage.js'
import { estimate1RM } from '../lib/onerm.js'
import { calcPlates, formatPlatesSummary, warmupLadder } from '../lib/plates.js'
import { getProgression } from '../lib/progression.js'
import { parseCSV, detectCSVColumns, matchExerciseName } from '../lib/csv.js'
import PlateVisual from './PlateVisual.jsx'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StudioSection({ toast, onBeginProgram, extraMoves, onClearExtras, prsVersion, progressVersion, onImportData }) {
  // ── daily reminder ──
  const [remindTime, setRemindTime] = useState(() => loadJSON('form-remind', { on: false, time: '07:00' }).time || '07:00')
  const [remindOn, setRemindOn] = useState(() => loadJSON('form-remind', { on: false, time: '07:00' }).on)

  const saveRemind = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      try { await Notification.requestPermission() } catch (e) {}
    }
    saveJSON('form-remind', { on: true, time: remindTime })
    setRemindOn(true)
    window.__scheduleRemind && window.__scheduleRemind()
    toast('Reminder enabled for ' + remindTime)
  }

  // ── weekly calendar ──
  const [calDay, setCalDay] = useState(new Date().getDay())
  const [schedule, setSchedule] = useState(() => loadJSON('form-schedule', {}))
  const [weekSel, setWeekSel] = useState('')

  const assignWeek = (val) => {
    setWeekSel(val)
    const s = { ...schedule }
    if (!val) delete s[calDay]; else s[calDay] = val
    setSchedule(s)
    saveJSON('form-schedule', s)
    toast(DAYS[calDay] + ' updated')
  }

  // ── custom session builder ──
  const [customName, setCustomName] = useState('')
  const [checked, setChecked] = useState(() => new Set())

  const startCustom = () => {
    const moves = [...extraMoves, ...[...checked]]
    if (moves.length < 3) { toast('Pick at least 3 exercises'); return }
    if (moves.length > 8) { toast('Keep it to 8 exercises'); return }
    const name = (customName || 'My session').trim()
    const list = loadJSON('form-custom', [])
    list.unshift({ name, moves })
    saveJSON('form-custom', list.slice(0, 20))
    programPlans[name] = [['Custom', moves.join(' · '), '30 min']]
    workoutMoves[name] = moves
    onClearExtras()
    setChecked(new Set())
    onBeginProgram(name)
  }

  // ── 1RM calculator ──
  const [calcWeight, setCalcWeight] = useState('100')
  const [calcReps, setCalcReps] = useState('5')
  const cw = parseFloat(calcWeight) || 0
  const cr = Math.min(12, Math.max(1, parseInt(calcReps, 10) || 1))
  const epley = estimate1RM(cw, cr, 'epley')
  const brz = estimate1RM(cw, cr, 'brzycki')
  const lom = estimate1RM(cw, cr, 'lombardi')
  const TIERS = [
    [100, '1 rep (1RM)'], [95, '~2 reps'], [90, '~4 reps'], [85, '~6 reps'],
    [80, '~8 reps'], [75, '~10 reps'], [70, '~12 reps'], [65, '~15 reps'],
  ]

  // ── plate calculator ──
  const [plateTarget, setPlateTarget] = useState('100')
  const [plateBar, setPlateBar] = useState('20')
  const pt = parseFloat(plateTarget) || 0
  const pb = parseFloat(plateBar) || 20
  const plateRes = calcPlates(pt, pb)
  const adjustPlate = (delta) => {
    const cur = parseFloat(plateTarget) || 20
    setPlateTarget(String(Math.max(10, Math.round((cur + delta) * 10) / 10)))
  }

  // ── auto-progression ──
  const [progPolicy, setProgPolicy] = useState('linear')
  const [progEx, setProgEx] = useState(exercises[0].name)
  const prog = getProgression(progEx, progPolicy)

  // ── backup / import ──
  const [importStatus, setImportStatus] = useState('Supports Hevy, Strong, FitNotes & spreadsheet CSVs.')

  const exportData = () => {
    const blob = new Blob([JSON.stringify({
      progress: loadJSON('form-progress', {}),
      favs: JSON.parse(localStorage.getItem('form-favs') || '[]'),
      prs: prs(),
      custom: loadJSON('form-custom', []),
      schedule: loadJSON('form-schedule', {}),
      remind: loadJSON('form-remind', {}),
      theme: localStorage.getItem('form-theme') || 'light',
      hr: loadJSON('form-hr', []),
    }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'form-backup.json'
    a.click()
    toast('Backup downloaded')
  }

  const importJson = (file) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const d = JSON.parse(r.result)
        onImportData(d)
        toast('Backup restored — reload')
        setTimeout(() => location.reload(), 600)
      } catch (e) { toast('Invalid backup file') }
    }
    r.readAsText(file)
  }

  const importCsv = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rows = parseCSV(reader.result)
        if (rows.length < 2) { toast('CSV file is empty or invalid'); return }
        const cols = detectCSVColumns(rows[0])
        if (cols.exercise === -1) { toast('Could not find exercise column in CSV'); return }
        const isLbsHeader = rows[0].some(h => /lbs|pounds/i.test(h))
        const allPrs = prs()
        const progressData = loadJSON('form-progress', {})
        progressData.sessions = progressData.sessions || []
        let setsCount = 0, newPrCount = 0
        const workoutGroups = {}
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i]
          if (!r || !r[cols.exercise]) continue
          const rawEx = r[cols.exercise].trim()
          if (!rawEx) continue
          const canonicalEx = matchExerciseName(rawEx)
          let rawW = cols.weight !== -1 ? parseFloat(r[cols.weight]) : 0
          const rawReps = cols.reps !== -1 ? parseInt(r[cols.reps], 10) : 0
          if (isNaN(rawW) || rawW < 0) rawW = 0
          if (isNaN(rawReps) || rawReps <= 0) continue
          const unit = cols.weightUnit !== -1 && r[cols.weightUnit] ? r[cols.weightUnit].toLowerCase() : ''
          const isLbs = unit.includes('lb') || isLbsHeader
          const weightKg = isLbs && rawW > 0 ? Math.round(rawW * 0.453592 * 2) / 2 : rawW
          let rawDate = cols.date !== -1 && r[cols.date] ? r[cols.date].trim() : ''
          let dateStr = new Date().toISOString().slice(0, 10)
          if (rawDate) {
            const dObj = new Date(rawDate.replace(' ', 'T'))
            if (!isNaN(dObj.getTime())) dateStr = dObj.toISOString().slice(0, 10)
          }
          const wName = cols.workout !== -1 && r[cols.workout] ? r[cols.workout].trim() : 'Workout'
          const groupKey = dateStr + '|' + wName
          workoutGroups[groupKey] = workoutGroups[groupKey] || { date: dateStr, name: wName, moves: new Set() }
          workoutGroups[groupKey].moves.add(canonicalEx)
          const exRows = allPrs[canonicalEx] || []
          const prevBest = (() => { let b = null; exRows.forEach(s => { const e = estimate1RM(s.weight, s.reps); if (e !== null && (!b || e > b.est)) b = { est: e } }); return b })()
          const est1rm = estimate1RM(weightKg, rawReps)
          if (est1rm && (!prevBest || est1rm > prevBest.est)) newPrCount++
          allPrs[canonicalEx] = [{ weight: weightKg, reps: rawReps, est: est1rm, date: dateStr }].concat(exRows).slice(0, 40)
          setsCount++
        }
        const sessionKeys = Object.keys(workoutGroups).sort()
        let addedSessions = 0
        sessionKeys.forEach(k => {
          const grp = workoutGroups[k]
          if (!progressData.sessions.some(s => s.date === grp.date && s.name === grp.name)) {
            const count = grp.moves.size
            progressData.sessions.unshift({ name: grp.name, minutes: Math.max(20, count * 7), date: grp.date, done: count, total: count, ts: new Date(grp.date + 'T12:00:00').getTime() })
            progressData.totalMinutes = (progressData.totalMinutes || 0) + Math.max(20, count * 7)
            addedSessions++
          }
        })
        saveJSON('form-prs', allPrs)
        saveProgress(progressData)
        onImportData({ progress: progressData, prs: allPrs })
        setImportStatus(<b style={{ color: 'var(--lime)' }}>✓ Imported {addedSessions} sessions, {setsCount} sets across {Object.keys(allPrs).length} movements ({newPrCount} new PRs)!</b>)
        toast('✓ Imported ' + addedSessions + ' workouts & ' + setsCount + ' sets!')
      } catch (err) {
        console.error(err)
        toast('Failed to parse CSV file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const weekProgramNames = Object.keys(programPlans).filter(n => n !== 'Full-body foundation')

  return (
    <section className="section" id="studio">
      <div className="section-head">
        <div>
          <div className="eyebrow">Make it yours</div>
          <h2>Tools.</h2>
        </div>
      </div>
      <div className="studio-grid">
        <article className="studio-card">
          <h3>Daily reminder</h3>
          <p className="micro">Local notification at a time you choose. Allow notifications when asked.</p>
          <input className="field" id="remindTime" type="time" value={remindTime} onChange={(e) => setRemindTime(e.target.value)} />
          <button className="program-start" id="saveRemind" type="button" onClick={saveRemind}>ENABLE REMINDER</button>
          <div className="micro" id="remindStatus">{remindOn ? 'Reminder set for ' + remindTime : 'Reminders off'}</div>
        </article>

        <article className="studio-card">
          <h3>This week</h3>
          <p className="micro">Assign a program to each day. Tap a day, then pick from the list.</p>
          <div className="cal" id="weekCal">
            {DAYS.map((d, i) => (
              <button key={d} type="button" data-day={i} className={i === calDay ? 'on' : ''} onClick={() => { setCalDay(i); setWeekSel(schedule[i] || '') }}>{d}{schedule[i] ? '•' : ''}</button>
            ))}
          </div>
          <select className="field" id="weekProgram" value={weekSel} onChange={(e) => assignWeek(e.target.value)}>
            <option value="">— assign program —</option>
            {weekProgramNames.map(n => <option key={n}>{n}</option>)}
          </select>
          <div className="micro" id="weekNote">{schedule[calDay] ? (DAYS[calDay] + ': ' + schedule[calDay]) : (DAYS[calDay] + ': rest / not set')}</div>
        </article>

        <article className="studio-card">
          <h3>Custom session</h3>
          <p className="micro">Pick 3–8 exercises and start immediately.</p>
          <input className="field" id="customName" placeholder="My session name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          <div className="builder-list" id="builderList">
            {extraMoves.map(m => (
              <label key={'db-' + m} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" checked disabled /> {m} <span className="micro" style={{ color: 'var(--orange)', fontWeight: 900 }}>(Database)</span>
              </label>
            ))}
            {exercises.map(x => (
              <label key={x.name} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" checked={checked.has(x.name)}
                  onChange={(e) => { const s = new Set(checked); e.target.checked ? s.add(x.name) : s.delete(x.name); setChecked(s) }} />
                {' '}{x.name} <small style={{ color: 'var(--muted)' }}>{x.part}</small>
              </label>
            ))}
          </div>
          <button className="program-start" id="startCustom" type="button" onClick={startCustom}>START CUSTOM SESSION</button>
        </article>

        <article className="studio-card">
          <h3>1RM Calculator</h3>
          <p className="micro">Scientific submaximal load estimator (Epley, Brzycki &amp; Lombardi formulas with 12-rep cap).</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="field" id="calcWeight" placeholder="Weight (kg)" inputMode="decimal" style={{ margin: 0, flex: 1 }} value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} />
            <input className="field" id="calcReps" placeholder="Reps (1–12)" inputMode="numeric" style={{ margin: 0, flex: 1 }} value={calcReps} onChange={(e) => setCalcReps(e.target.value)} />
          </div>
          <div id="calc1rmOutput" style={{ background: 'var(--dark)', color: 'white', borderRadius: 14, padding: 14, margin: '10px 0', textAlign: 'center' }}>
            <div className="micro" style={{ color: '#a8aa9f' }}>ESTIMATED ONE-REP MAX</div>
            <div id="calc1rmValue" style={{ fontSize: 36, fontWeight: 950, letterSpacing: '-1px', color: 'var(--lime)' }}>{cw > 0 && epley ? epley + ' kg' : '0 kg'}</div>
            <div id="calcFormulaBreakdown" className="micro" style={{ color: '#ddd', marginTop: 4 }}>
              {cw > 0 ? `Epley: ${epley} · Brzycki: ${brz} · Lombardi: ${lom}` : 'Enter weight > 0'}
            </div>
          </div>
          <div className="micro" style={{ margin: '10px 0 6px' }}>Training load percentages (% of 1RM)</div>
          <div id="calcPercentages" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, textAlign: 'center', fontSize: 11 }}>
            {cw > 0 && epley ? TIERS.map(([pct, reps]) => {
              const load = Math.round((epley * (pct / 100)) * 2) / 2
              return (
                <div key={pct} style={{ background: '#faf8f2', border: '1px solid var(--line)', borderRadius: 10, padding: '6px 4px' }}>
                  <div style={{ fontWeight: 900, color: 'var(--orange)' }}>{pct}%</div>
                  <div style={{ fontSize: 13, fontWeight: 950, margin: '2px 0' }}>{load} kg</div>
                  <div className="micro" style={{ fontSize: 9 }}>{reps}</div>
                </div>
              )
            }) : null}
          </div>
        </article>

        <article className="studio-card">
          <h3>Plate Calculator</h3>
          <p className="micro">Olympic barbell loader &amp; warm-up ladder. Calculates plates needed per side.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <input className="field" id="plateTarget" placeholder="Target weight (kg)" inputMode="decimal" style={{ margin: 0, flex: 1 }} value={plateTarget} onChange={(e) => setPlateTarget(e.target.value)} />
            <select className="field" id="plateBar" style={{ margin: 0, width: 130 }} value={plateBar} onChange={(e) => setPlateBar(e.target.value)}>
              <option value="20" selected>20 kg bar</option>
              <option value="15">15 kg bar</option>
              <option value="10">10 kg bar</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6, margin: '8px 0', flexWrap: 'wrap' }}>
            {[-10, -2.5, 2.5, 10].map(d => <button key={d} className="chip" type="button" onClick={() => adjustPlate(d)}>{d > 0 ? '+' : ''}{d} kg</button>)}
          </div>
          <div style={{ background: 'var(--dark)', borderRadius: 14, padding: 14, margin: '10px 0', textAlign: 'center' }}>
            <div className="micro" style={{ color: '#a8aa9f', marginBottom: 8 }}>EACH SIDE OF BARBELL</div>
            <div id="plateGraphic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 76, padding: '6px 0' }}>
              {plateRes.ok ? <PlateVisual plates={plateRes.plates} scale={1} /> : <div style={{ color: 'var(--orange)', fontSize: 12, padding: '12px 0' }}>{plateRes.msg}</div>}
            </div>
            <div id="platePerSideText" style={{ fontSize: 22, fontWeight: 950, color: 'var(--lime)', marginTop: 6 }}>
              {plateRes.ok ? plateRes.perSideTotal + ' kg / side' + (plateRes.remainder > 0 ? ' (+' + (plateRes.remainder * 2) + 'kg unmatchable)' : '') : '—'}
            </div>
            <div id="plateListText" className="micro" style={{ color: '#eee' }}>{plateRes.ok ? formatPlatesSummary(plateRes.plates) : ''}</div>
          </div>
          <div className="micro" style={{ margin: '10px 0 6px' }}>Warm-up progression ramp</div>
          <div id="plateWarmupLadder" style={{ display: 'grid', gap: 5, fontSize: 11 }}>
            {plateRes.ok ? warmupLadder(pt, pb).map((s, i) => {
              const stepPlates = calcPlates(s.weight, pb)
              const summary = stepPlates.ok ? formatPlatesSummary(stepPlates.plates) : '—'
              const isWork = s.pct === 1
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 10, background: isWork ? 'var(--dark)' : '#faf8f2', color: isWork ? 'white' : 'var(--ink)', border: '1px solid var(--line)' }}>
                  <div>
                    <strong>{s.label}: {s.weight} kg</strong>
                    <div className="micro" style={{ color: isWork ? '#aaa' : 'var(--muted)' }}>{summary}</div>
                  </div>
                  <div style={{ fontWeight: 900, color: isWork ? 'var(--lime)' : 'var(--orange)' }}>{s.reps}</div>
                </div>
              )
            }) : null}
          </div>
        </article>

        <article className="studio-card">
          <h3>Auto-Progression Coach</h3>
          <p className="micro">Adaptive overload &amp; deload engine based on your actual set history.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <select className="field" id="progPolicy" style={{ margin: 0 }} value={progPolicy} onChange={(e) => setProgPolicy(e.target.value)}>
              <option value="linear" selected>Linear (+2.5 / +5kg)</option>
              <option value="double">Double (8–12 reps)</option>
              <option value="greyskull">Greyskull LP (AMRAP)</option>
            </select>
            <select className="field" id="progExercise" style={{ margin: 0 }} value={progEx} onChange={(e) => setProgEx(e.target.value)}>
              {exercises.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
            </select>
          </div>
          <div id="progResultCard" style={{ background: 'var(--dark)', color: 'white', borderRadius: 14, padding: 14, margin: '10px 0', textAlign: 'center' }}>
            <div className="micro" style={{ color: '#a8aa9f' }}>RECOMMENDED NEXT TARGET</div>
            <div id="progTargetDisplay" style={{ fontSize: 30, fontWeight: 950, letterSpacing: '-1px', color: 'var(--lime)' }}>
              {prog.weight > 0 ? prog.weight + ' kg × ' + prog.reps + ' reps' : prog.reps + ' reps' + (prog.sets ? ' (' + prog.sets + ' sets)' : '')}
            </div>
            <div id="progActionBadge" style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 900, margin: '6px 0',
              background: prog.kind === 'deload' ? 'var(--orange)' : prog.kind === 'up' ? 'var(--lime)' : '#ffd166',
              color: prog.kind === 'deload' ? 'white' : 'var(--dark)' }}>
              {prog.action}
            </div>
            <div id="progWhyText" className="micro" style={{ color: '#ddd', lineHeight: 1.45, marginTop: 4 }}>{prog.why}</div>
          </div>
        </article>

        <article className="studio-card">
          <h3>Backup &amp; Import</h3>
          <p className="micro">Export your workouts or import history directly from Hevy, Strong, FitNotes or FORM backups.</p>
          <button className="program-start" id="exportData" type="button" onClick={exportData}>EXPORT JSON BACKUP</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <label className="theme-btn" style={{ display: 'block', textAlign: 'center', padding: 11, fontSize: 11 }}>
              IMPORT JSON<input id="importData" type="file" accept="application/json" hidden onChange={(e) => e.target.files && e.target.files[0] && importJson(e.target.files[0])} />
            </label>
            <label className="theme-btn" style={{ display: 'block', textAlign: 'center', padding: 11, fontSize: 11, background: 'var(--ink)', color: 'white' }}>
              IMPORT CSV<input id="importCsv" type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files && e.target.files[0] && importCsv(e.target.files[0])} />
            </label>
          </div>
          <div id="importResultStatus" className="micro" style={{ marginTop: 8, color: 'var(--muted)' }}>{importStatus}</div>
        </article>
      </div>
    </section>
  )
}
