import { useEffect, useReducer, useRef, useState } from 'react'
import { exercises, programPlans, workoutMoves } from './dataBundle.js'
import { loadJSON, saveJSON, loadProgress, saveProgress } from './lib/storage.js'
import { getSoundOn, setSoundOn, ensureAudio, beep, cueStart, cueRest, cueDone } from './lib/audio.js'
import { estimate1RM, best1RM } from './lib/onerm.js'
import { getProgression } from './lib/progression.js'
import { newClock } from './lib/workout.js'

import TopBar from './components/TopBar.jsx'
import Hero from './components/Hero.jsx'
import BodyMap from './components/BodyMap.jsx'
import SessionCards from './components/SessionCards.jsx'
import ExerciseLibrary from './components/ExerciseLibrary.jsx'
import ProgramsSection from './components/ProgramsSection.jsx'
import StudioSection from './components/StudioSection.jsx'
import ProgressSection from './components/ProgressSection.jsx'
import ExerciseModal from './components/ExerciseModal.jsx'
import ProgramModal from './components/ProgramModal.jsx'
import RunnerModal from './components/RunnerModal.jsx'
import YouTubeModal from './components/YouTubeModal.jsx'
import ExtendedDBModal from './components/ExtendedDBModal.jsx'
import InstallModal from './components/InstallModal.jsx'
import WorkoutBar from './components/WorkoutBar.jsx'

export default function App() {
  // ── theme / standalone ──
  const [theme, setTheme] = useState(() => (localStorage.getItem('form-theme') === 'dark' ? 'dark' : 'light'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('form-theme', theme)
  }, [theme])
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      document.documentElement.classList.add('standalone')
    }
  }, [])

  // ── toast ──
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef(null)
  const toast = (msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 1800)
  }

  // ── favorites ──
  const [saved, setSaved] = useState(() => new Set(JSON.parse(localStorage.getItem('form-favs') || '[]')))
  const toggleFav = (name) => {
    const s = new Set(saved)
    if (s.has(name)) { s.delete(name); toast('Removed from favorites') } else { s.add(name); toast('Saved to favorites') }
    setSaved(s)
    localStorage.setItem('form-favs', JSON.stringify([...s]))
  }

  // ── progress + PRs ──
  const [progress, setProgress] = useState(() => loadProgress())
  const [prs, setPrs] = useState(() => loadJSON('form-prs', {}))
  const savePr = (name, weight, reps) => {
    const all = { ...prs }
    const rows = all[name] || []
    const prevBest = best1RM(rows)
    const newEst = estimate1RM(weight, reps)
    const day = new Date().toISOString().slice(0, 10)
    const isNewPr = newEst && (!prevBest || newEst > prevBest.est)
    all[name] = [{ weight, reps, est: newEst, date: day }].concat(rows).slice(0, 30)
    setPrs(all)
    saveJSON('form-prs', all)
    if (isNewPr) {
      const diff = prevBest ? ' (+' + (newEst - prevBest.est).toFixed(1) + ' kg)' : ''
      toast('🎉 NEW 1RM PR! ' + newEst + ' kg' + diff)
      cueDone()
    } else {
      toast('Set saved: ' + weight + ' kg × ' + reps)
    }
  }
  const importData = (d) => {
    if (d.progress) { saveJSON('form-progress', d.progress); setProgress(d.progress) }
    if (d.favs) { localStorage.setItem('form-favs', JSON.stringify(d.favs)); setSaved(new Set(d.favs)) }
    if (d.prs) { saveJSON('form-prs', d.prs); setPrs(d.prs) }
    if (d.custom) saveJSON('form-custom', d.custom)
    if (d.schedule) saveJSON('form-schedule', d.schedule)
    if (d.remind) saveJSON('form-remind', d.remind)
    if (d.theme) localStorage.setItem('form-theme', d.theme)
    if (d.hr) saveJSON('form-hr', d.hr)
  }

  // ── library filters ──
  const [part, setPart] = useState('All')
  const [view, setView] = useState('Front')
  const [equipment, setEquipment] = useState('All')
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('core')
  const [cardsLimit, setCardsLimit] = useState(48)

  const setBodyView = (next) => {
    if (next !== 'Front' && next !== 'Back') return
    setView(next)
    setPart('All')
    setEquipment('All')
    document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' })
    toast(next + ' muscles loaded')
  }
  const choosePart = (p) => {
    if (p === '__view_front__') return setBodyView('Front')
    if (p === '__view_back__') return setBodyView('Back')
    if ((p === 'Chest' || p === 'Core' || p === 'Biceps') && view !== 'Front') setView('Front')
    if ((p === 'Back' || p === 'Glutes' || p === 'Triceps') && view !== 'Back') setView('Back')
    setPart(p)
    setEquipment('All')
    document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' })
    toast((p === 'All' ? view : p) + ' exercises loaded')
  }
  const changeSource = (s) => {
    setSource(s)
    setCardsLimit(48)
    toast(s === 'extended' ? 'Loaded all 1,324 exercises' : 'Switched to core library')
  }

  // ── modals ──
  const [exerciseEx, setExerciseEx] = useState(null)
  const [program, setProgram] = useState(null)
  const [yt, setYt] = useState(null)
  const [extOpen, setExtOpen] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)
  const openExercise = (x) => {
    if (typeof x === 'string') {
      const ex = exercises.find(e => e.name === x)
      if (!ex) return
      x = ex
    }
    setExerciseEx(x)
  }
  const openYt = (url, title) => setYt({ url, title })

  // ── workout session engine ──
  const clockRef = useRef(newClock(false))
  const runningRef = useRef(false)
  const [, force] = useReducer(x => x + 1, 0)
  const [session, setSession] = useState(null)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(() => new Set())
  const doneRef = useRef(new Set())
  const [nextIdx, setNextIdx] = useState(0)
  const nextIdxRef = useRef(0)
  const selectedRef = useRef('')

  const beginWorkPhase = (sec) => {
    const c = clockRef.current
    c.phase = 'work'; c.left = sec
    cueStart()
    force()
  }
  const beginRestPhase = (sec) => {
    const c = clockRef.current
    c.phase = 'rest'; c.left = sec
    cueRest()
    force()
  }
  const stopRest = () => {
    const c = clockRef.current
    c.phase = 'idle'; c.left = 0
    force()
  }
  const advanceAfterRest = () => {
    const c = clockRef.current
    if (c.auto) {
      if (c.round < c.rounds) {
        c.round++
        beginWorkPhase(c.workSec)
        toast('Round ' + c.round)
        return
      }
      if (nextIdxRef.current !== null && !doneRef.current.has(nextIdxRef.current)) doneRef.current.add(nextIdxRef.current)
      setDone(new Set(doneRef.current))
      const moves = session ? session.moves : []
      let n = moves.findIndex((_, j) => !doneRef.current.has(j))
      if (n !== -1) {
        c.round = 1
        beginWorkPhase(c.workSec)
        toast(moves[n])
      } else {
        c.phase = 'idle'
        cueDone()
        toast('All intervals complete')
      }
      nextIdxRef.current = n
      setNextIdx(n)
    } else {
      c.phase = 'idle'
      cueStart()
      toast('Rest over — next move')
    }
    force()
  }

  // clock tick
  useEffect(() => {
    if (!session || !running) return
    const t = setInterval(() => {
      if (!runningRef.current) return
      const c = clockRef.current
      c.elapsed++
      if (c.phase === 'work' || c.phase === 'rest') {
        if (c.phase === 'work' && !c.auto && c.left <= 0) { force(); return }
        c.left--
        if (c.left > 0 && c.left <= 3) beep(c.phase === 'rest' ? 349 : 784, .08)
        if (c.left <= 0) {
          if (c.phase === 'work') beginRestPhase(c.restSec)
          else advanceAfterRest()
        }
      }
      force()
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, running])

  const beginSelectedProgram = (name) => {
    try {
      if (typeof name === 'string' && name.trim()) selectedRef.current = name.trim()
      if (!selectedRef.current) selectedRef.current = 'Full-body foundation'
      const prog = selectedRef.current
      const days = programPlans[prog] || [['Session', prog, '30 min']]
      const moves = workoutMoves[prog] || workoutMoves['Full-body foundation']
      if (!moves || !moves.length) { toast('No exercises found for this program'); return }
      setProgram(null)
      const isCardio = moves.some(m => { const ex = exercises.find(x => x.name === m); return ex && ex.part === 'Cardio' })
      const targets = moves.map(m => {
        const p = getProgression(m, 'linear')
        if (p && p.weight > 0) return `🎯 ${p.weight}kg × ${p.reps} (${p.action}) · `
        if (p && p.kind === 'up') return `🎯 ${p.reps} reps (${p.action}) · `
        return ''
      })
      clockRef.current = newClock(isCardio)
      runningRef.current = true
      setRunning(true)
      setSession({ program: prog, title: days[0][0], moves, targets, isCardio })
      doneRef.current = new Set()
      setDone(doneRef.current)
      nextIdxRef.current = 0
      setNextIdx(0)
      const c = clockRef.current
      if (c.auto) beginWorkPhase(c.workSec)
      else { c.phase = 'work'; c.left = 0 }
      cueStart()
      toast(prog + ' started')
      force()
    } catch (err) {
      console.error(err)
      toast('Could not start this program')
    }
  }

  const toggleMove = (i) => {
    const s = session
    if (!s) return
    const nextDone = new Set(doneRef.current)
    if (nextDone.has(i)) nextDone.delete(i)
    else nextDone.add(i)
    doneRef.current = nextDone
    setDone(nextDone)
    if (nextDone.has(i)) {
      cueDone()
      const n = s.moves.findIndex((_, j) => !nextDone.has(j))
      nextIdxRef.current = n
      setNextIdx(n)
      const remaining = s.moves.length - nextDone.size
      if (remaining > 0 && !clockRef.current.auto) beginRestPhase(s.isCardio ? 20 : 45)
    } else {
      stopRest()
    }
    force()
  }

  const togglePause = () => {
    runningRef.current = !runningRef.current
    setRunning(runningRef.current)
    force()
    toast(runningRef.current ? 'Timer running' : 'Timer paused')
  }
  const clockSkip = () => {
    const c = clockRef.current
    if (c.phase === 'work') beginRestPhase(c.restSec)
    else if (c.phase === 'rest') advanceAfterRest()
    else if (c.auto) beginWorkPhase(c.workSec)
    force()
  }
  const clockAdd = (sec) => {
    clockRef.current.left += sec
    force()
    toast('+' + sec + ' seconds')
  }
  const skipRest = () => {
    if (clockRef.current.phase === 'rest') advanceAfterRest()
    else stopRest()
    force()
  }

  const completeSession = () => {
    if (!session) return
    stopRest()
    const total = session.moves.length
    const doneCount = doneRef.current.size
    const data = loadProgress()
    data.sessions = data.sessions || []
    const day = new Date().toISOString().slice(0, 10)
    const mins = Math.max(1, Math.round(clockRef.current.elapsed / 60))
    data.sessions.unshift({ name: session.program, minutes: mins, date: day, done: doneCount, total, ts: Date.now() })
    data.sessions = data.sessions.slice(0, 50)
    data.totalMinutes = (data.totalMinutes || 0) + mins
    if (data.lastDay !== day) {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      const ys = y.toISOString().slice(0, 10)
      data.streak = (data.lastDay === ys) ? (data.streak || 0) + 1 : 1
      data.lastDay = day
    }
    saveProgress(data)
    setProgress(data)
    setSession(null)
    runningRef.current = false
    setRunning(false)
    cueDone()
    toast(session.program + ' completed!')
  }

  // ── sound ──
  const [soundOn, setSoundOnState] = useState(() => getSoundOn())
  const toggleSound = () => {
    const v = !soundOn
    setSoundOn(v)
    setSoundOnState(v)
    if (v) { ensureAudio(); cueStart() }
    toast(v ? 'Sound on' : 'Sound muted')
  }
  useEffect(() => {
    const once = () => { if (getSoundOn()) ensureAudio() }
    document.addEventListener('click', once, { once: true })
    return () => document.removeEventListener('click', once)
  }, [])

  // ── install prompt ──
  const deferredInstall = useRef(null)
  const [installBarShow, setInstallBarShow] = useState(false)
  const [installStatus, setInstallStatus] = useState('')
  const [isStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
  useEffect(() => {
    const onBip = (e) => {
      e.preventDefault()
      deferredInstall.current = e
      if (!isStandalone) setInstallBarShow(true)
      setInstallStatus('Install prompt ready — tap Install this device')
    }
    const onInstalled = () => { setInstallBarShow(false); toast('FORM is installed') }
    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onBip); window.removeEventListener('appinstalled', onInstalled) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const promptInstall = async () => {
    if (deferredInstall.current) {
      try {
        deferredInstall.current.prompt()
        const choice = await deferredInstall.current.userChoice
        setInstallStatus(choice.outcome === 'accepted' ? 'Installed on this device' : 'Install dismissed')
        if (choice.outcome === 'accepted') {
          setInstallBarShow(false)
          setInstallOpen(false)
          toast('FORM installed')
        }
        deferredInstall.current = null
      } catch (err) {
        setInstallStatus('Could not open the install prompt')
      }
    } else {
      setInstallOpen(true)
      setInstallStatus('This browser has no install prompt. Use Add to Home Screen from the browser menu.')
      toast('Use Add to Home Screen in your browser')
    }
  }

  // ── service worker / offline ──
  const [swNote, setSwNote] = useState('Service worker: registering…')
  const [updateShow, setUpdateShow] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [savingOffline, setSavingOffline] = useState(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwNote('This browser does not support service workers.')
      return
    }
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(reg => {
      setSwNote('Service worker registered · FORM can run offline')
      if (reg.waiting) setUpdateShow(true)
      reg.addEventListener('updatefound', () => {
        const w = reg.installing
        if (!w) return
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) setUpdateShow(true)
        })
      })
    }).catch(() => setSwNote('Service worker blocked here — open the live preview in its own tab'))
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload())
    navigator.serviceWorker.addEventListener('message', ev => {
      if (ev.data && ev.data.type === 'SW_ACTIVATED') setSwNote('Service worker ' + ev.data.version + ' active')
    })
  }, [])
  useEffect(() => {
    const on = () => { setOffline(false); setSwNote('Back online · service worker syncing cache'); toast('Back online') }
    const off = () => { setOffline(true); setSwNote('Offline · serving from service worker cache'); toast('Offline mode') }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const updateNow = async () => {
    const regs = await navigator.serviceWorker.getRegistrations()
    regs.forEach(r => r.waiting && r.waiting.postMessage({ type: 'SKIP_WAITING' }))
    toast('Updating FORM…')
  }
  const cacheOffline = async () => {
    setSavingOffline(true)
    const slugs = exercises.map(x => x.name.toLowerCase().replace(/\s+/g, '-'))
    const urls = []
    slugs.forEach(s => { urls.push('media/exercises/' + s + '.png', 'media/real/' + s + '.gif') })
    let ok = 0
    for (const u of urls) { try { const r = await fetch(u); if (r.ok) ok++ } catch (e) {} }
    setSavingOffline(false)
    setSwNote(ok + ' media files cached for offline training')
    toast(ok + ' files saved offline')
  }
  const swRefresh = async () => {
    try {
      const r = await navigator.serviceWorker.getRegistration()
      if (r) await r.update()
      setSwNote('Checked for service worker updates')
      toast('Checked for updates')
    } catch (e) {
      toast('Could not check updates')
    }
  }
  const clearLog = () => {
    if (!confirm('Clear your workout log?')) return
    localStorage.removeItem('form-progress')
    setProgress({})
    toast('Log cleared')
  }

  // ── daily reminder scheduling ──
  useEffect(() => {
    const nextRemindDelay = (hhmm) => {
      const [h, m] = (hhmm || '07:00').split(':').map(Number)
      const now = new Date()
      const t = new Date()
      t.setHours(h, m || 0, 0, 0)
      if (t <= now) t.setDate(t.getDate() + 1)
      return t - now
    }
    const scheduleRemind = () => {
      const cfg = loadJSON('form-remind', { on: false, time: '07:00' })
      if (!cfg.on) return
      if (!('Notification' in window)) return
      setTimeout(async () => {
        if (Notification.permission === 'granted') {
          try { new Notification('FORM', { body: 'Time to train. Open FORM and start today’s session.', icon: 'icons/icon-192.png' }) } catch (e) {}
        }
        scheduleRemind()
      }, Math.min(nextRemindDelay(cfg.time), 2147483647))
    }
    scheduleRemind()
  }, [])

  // ── custom-session extras from the database modal ──
  const [extraMoves, setExtraMoves] = useState([])
  const addToBuilder = (name) => {
    setExtraMoves(m => (m.includes(name) ? m : [...m, name]))
    toast('Added "' + name + '" to custom session builder')
  }

  // ── today's scheduled program toast ──
  useEffect(() => {
    const todayPlan = loadJSON('form-schedule', {})[new Date().getDay()]
    if (todayPlan) setTimeout(() => toast('Today is scheduled: ' + todayPlan), 800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clock = clockRef.current

  return (
    <div className="app">
      <TopBar theme={theme} onThemeToggle={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} onOpenInstall={() => setInstallOpen(true)} />

      <div className={'install-bar' + (installBarShow && !isStandalone ? ' show' : '')} id="installBar">
        <div><b>Use FORM as an app</b><div className="micro" style={{ color: '#bbb' }}>Install the PWA — home screen icon, full screen, works offline.</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" id="installApp" onClick={promptInstall}>INSTALL</button>
          <button type="button" id="installHow" className="ghost-install" onClick={() => setInstallOpen(true)}>HOW</button>
        </div>
      </div>

      <div className={'net-banner offline' + (offline ? ' show' : '')} id="offlineBanner">You're offline — FORM is using the service worker cache.</div>
      <div className={'net-banner update' + (updateShow ? ' show' : '')} id="updateBanner" onClick={updateNow}>A new version of FORM is ready. Tap to update.</div>

      <main>
        <Hero streak={progress.streak || 0} />
        <div className="dashboard">
          <BodyMap view={view} part={part} onChoosePart={choosePart} />
          <div className="content-panel">
            <div className="session-row">
              <SessionCards onOpenProgram={(p) => setProgram(p)} onStart={beginSelectedProgram} />
            </div>
            <ExerciseLibrary
              source={source} onSourceChange={changeSource}
              part={part} view={view} equipment={equipment} onEquipment={setEquipment}
              query={query} onQuery={setQuery}
              cardsLimit={cardsLimit} onCardsLimit={setCardsLimit}
              saved={saved} onToggleFav={toggleFav}
              onOpenExercise={openExercise} onOpenExtDb={() => setExtOpen(true)}
            />
          </div>
        </div>
        <ProgramsSection onOpenProgram={(p) => setProgram(p)} onToast={toast} />
      </main>

      <StudioSection
        toast={toast}
        onBeginProgram={beginSelectedProgram}
        extraMoves={extraMoves}
        onClearExtras={() => setExtraMoves([])}
        prsVersion={prs}
        progressVersion={progress}
        onImportData={importData}
      />

      <ProgressSection
        progress={progress}
        favCount={saved.size}
        prs={prs}
        swNote={swNote}
        savingOffline={savingOffline}
        onClearLog={clearLog}
        onCacheOffline={cacheOffline}
        onSwRefresh={swRefresh}
        onOpenExercise={openExercise}
      />

      <footer className="footer">
        <div>FORM © 2026 · TRAIN WITH INTENTION</div>
        <div>Exercise guidance is educational. Stop if you feel pain and consult a qualified professional when needed.</div>
      </footer>

      <nav className="mobile-nav">
        <button onClick={() => location.hash = 'train'}>⌂</button>
        <button onClick={() => location.hash = 'library'}>◫</button>
        <button onClick={() => location.hash = 'plans'}>◎</button>
        <button onClick={() => location.hash = 'progress'}>◉</button>
      </nav>

      {exerciseEx && (
        <ExerciseModal
          ex={exerciseEx}
          key={exerciseEx.name}
          prs={prs}
          onClose={() => setExerciseEx(null)}
          onOpenYt={openYt}
          onToast={toast}
          onSavePr={savePr}
        />
      )}
      {program && (
        <ProgramModal program={program} onClose={() => setProgram(null)} onStart={beginSelectedProgram} onOpenYt={openYt} />
      )}
      {session && (
        <RunnerModal
          session={{ ...session, done, nextIdx }}
          clock={clock}
          running={running}
          onClose={() => setSession(null)}
          onToggleMove={toggleMove}
          onTogglePause={togglePause}
          onClockSkip={clockSkip}
          onClockAdd={() => clockAdd(15)}
          onSkipRest={skipRest}
          onAddRest={() => clockAdd(20)}
          onFinish={completeSession}
          onOpenYt={openYt}
          onToast={toast}
        />
      )}
      {yt && <YouTubeModal yt={yt} onClose={() => setYt(null)} onToast={toast} />}
      <ExtendedDBModal open={extOpen} onClose={() => setExtOpen(false)} onAddToBuilder={addToBuilder} onOpenYt={openYt} />
      <InstallModal open={installOpen} status={installStatus} onClose={() => setInstallOpen(false)} onInstallNow={promptInstall} />

      <WorkoutBar
        visible={!!session}
        name={(session ? session.program : '').toUpperCase()}
        clock={clock}
        running={running}
        soundOn={soundOn}
        onOpenRunner={() => { /* runner modal is open while session active; clicking the bar re-opens it after close */ }}
        onTogglePause={togglePause}
        onToggleSound={toggleSound}
      />

      <div className={'toast' + (toastMsg ? ' show' : '')} id="toast">{toastMsg}</div>
    </div>
  )
}
