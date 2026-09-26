import { useState, useRef, useEffect, useCallback } from 'react'
import ParamStepper from './components/console/ParamStepper.jsx'
import MachineSchematic from './components/console/MachineSchematic.jsx'
import AdminMatrix from './components/console/AdminMatrix.jsx'
import DefectImpactPanel from './components/console/DefectImpactPanel.jsx'
import ModeSwitch, { MODES } from './components/console/ModeSwitch.jsx'
import { ADMIN_CODE, rootWindowCheck } from './data/adminOverrides.js'
import SpeedBar from './components/console/SpeedBar.jsx'
import { LABELS } from './data/labels.js'
import {
  ALL_PARAMS, MACHINE,
  BUILTIN_DEFECTS_ALL as BUILTIN_DEFECTS, TRAINER_NOTES_ALL as BUILTIN_TRAINER_NOTES,
  computeResult, evaluateCycle, simulateTrainingCycle
} from './data/params.js'
import { EXERCISES, exerciseValues, exercisesForWada } from './data/exercises/index.js'
import { partViewFor, studentReasons, studentWarnings } from './data/studentView.js'
import './console.css'

const CYCLE_SECONDS = 5
const P = Object.fromEntries(ALL_PARAMS.map(p => [p.id, p]))

// Krótkie etykiety kafli – symbol parametru jest pokazywany osobno, więc nie powtarzamy go w nazwie.
const SHORT_LABELS = {
  T1: 'Dysza', T2: 'Strefa 2', T3: 'Strefa 3', T4: 'Strefa 4', T5: 'Strefa 5', TR: 'Trawersa',
  Tr: 'Forma – ruchoma', Ts: 'Forma – stała', Tc: 'Chłodzenie', Fz: 'Siła zwarcia',
  doz: 'Dozowanie', Deko: 'Dekompresja', Prz: 'Przeciwciśn.', Ob: 'Obroty ślimaka'
}


function round(n, d = 0) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

function defaultValues() {
  const v = {}
  ALL_PARAMS.forEach(p => { v[p.id] = p.def })
  return v
}

function shortLabel(label) {
  return (label || '').split(/\s[–—-]\s/)[0]
}

function formatClock(ms) {
  const total = ms / 1000
  const m = Math.floor(total / 60)
  const s = (total % 60).toFixed(1).padStart(4, '0')
  return `${String(m).padStart(2, '0')}:${s}`
}

function trendMeta(trend) {
  switch (trend) {
    case 'better': return { text: 'Lepiej niż poprzednio', arrow: '▲', cls: 'better' }
    case 'worse':  return { text: 'Gorzej niż poprzednio', arrow: '▼', cls: 'worse' }
    case 'same':   return { text: 'Bez zmian względem poprzedniego cyklu', arrow: '▬', cls: 'same' }
    default:       return { text: 'Pierwszy cykl w tej próbie', arrow: '●', cls: 'first' }
  }
}

// Wzór na siłę zwarcia + wartości z ostatniego cyklu (pokazywane po zaliczeniu).
function ClampFormula({ formula, result }) {
  return (
    <div className="c-formula">
      <p className="c-formula-main mono">{formula.lines[0]}</p>
      <ul>{formula.lines.slice(1).map(l => <li key={l}>{l}</li>)}</ul>
      <p className="mono c-formula-calc">
        Twój cykl: {result.projectedArea} cm² × {result.cavityPressure} bar / 100 = {result.openingForce} kN
        {' '}× {String(result.clampSafety).replace('.', ',')} = {result.requiredClamp} kN → nastawa Fz {result.settings?.Fz} kN
      </p>
    </div>
  )
}

const PANEL_LINKS = [
  { id: 'sec-cylinder', label: 'Cylinder i forma' },
  { id: 'sec-vp', label: 'Przełączenie V/P' },
  { id: 'sec-inject', label: 'Wtrysk i docisk' },
  { id: 'sec-plast', label: 'Plastyfikacja' },
  { id: 'sec-log', label: 'Historia cykli' }
]

export default function App() {
  const [view, setView] = useState('sim') // 'sim' | 'impact' | 'adminMatrix'
  const [adminPrompt, setAdminPrompt] = useState(null) // null | { code, error }
  // Sesja administratora (po podaniu kodu): panel wpływu wad i wartości modelu.
  // Kursant bez kodu nie ma do nich dostępu (brak skrótów w adresie strony).
  const [adminSession, setAdminSession] = useState(false)
  const defects = BUILTIN_DEFECTS
  const trainerNotesAll = BUILTIN_TRAINER_NOTES

  const [values, setValues] = useState(defaultValues)
  const valuesRef = useRef(values)
  useEffect(() => { valuesRef.current = values }, [values])

  const [wada, setWada] = useState(null)
  const [exerciseKey, setExerciseKey] = useState(null)
  const [pickerWada, setPickerWada] = useState(null)
  const [operatorIntroOpen, setOperatorIntroOpen] = useState(false)
  const [operatorReportOpen, setOperatorReportOpen] = useState(false)

  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const [countdown, setCountdown] = useState(null) // null = brak trwającego cyklu
  const countdownRef = useRef(null)
  const [cycleLog, setCycleLog] = useState([])
  const [processResult, setProcessResult] = useState(null)
  const [resultModal, setResultModal] = useState(null)
  const stableStreakRef = useRef(0)
  const cycleCounterRef = useRef(0)
  const lastLoggedValues = useRef(defaultValues())
  const lastDefectPct = useRef(null)

  const cycling = countdown !== null
  const activeExercise = exerciseKey ? EXERCISES[exerciseKey] : null
  const exerciseMachine = activeExercise?.machine || MACHINE
  const controlsLocked = !running || cycling || solved


  // ---------------------------------------------------------------
  // Timer ćwiczenia
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!running) return
    function tick() {
      setElapsedMs(Date.now() - startRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  useEffect(() => () => clearInterval(countdownRef.current), [])

  // ---------------------------------------------------------------
  // Wybór wady i ćwiczenia
  // ---------------------------------------------------------------
  const stopCycle = () => {
    clearInterval(countdownRef.current)
    setCountdown(null)
  }

  // Pełny reset stanu przy wejściu w ćwiczenie: log, seria, czas, wynik (standard, pkt 15.10–11).
  const loadExercise = useCallback((key) => {
    const ex = EXERCISES[key]
    stopCycle()
    const fresh = exerciseValues(key, defaultValues)
    valuesRef.current = fresh
    setValues(fresh)
    setWada(ex.id)
    setExerciseKey(key)
    lastLoggedValues.current = fresh
    lastDefectPct.current = null
    stableStreakRef.current = 0
    cycleCounterRef.current = 0
    setCycleLog([])
    setProcessResult(null)
    setResultModal(null)
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    setOperatorReportOpen(false)
    setOperatorIntroOpen(true)
  }, [])

  function handleOpenDefect(id) {
    if (cycling) return
    if (exercisesForWada(id).length === 0) return
    setPickerWada(id)
  }

  function handleChooseExercise(key) {
    if (running && cycleLog.length > 0 && !solved) {
      const ok = window.confirm('Przerwać bieżące ćwiczenie? Historia cykli i czas zostaną wyzerowane.')
      if (!ok) return
    }
    setPickerWada(null)
    loadExercise(key)
  }

  function handleGoToMachine() {
    setOperatorIntroOpen(false)
    startRef.current = Date.now()
    setElapsedMs(0)
    setRunning(true)
  }

  function handleResetSettings() {
    if (!exerciseKey || cycling) return
    const fresh = exerciseValues(exerciseKey, defaultValues)
    valuesRef.current = fresh
    setValues(fresh)
  }

  const handleChange = useCallback((id, raw) => {
    const value = raw === '' ? '' : Number(raw)
    const next = { ...valuesRef.current, [id]: value }
    valuesRef.current = next
    setValues(next)
  }, [])

  // ---------------------------------------------------------------
  // Cykl – ocena poza updaterami stanu (standard, pkt 8)
  // ---------------------------------------------------------------
  const finishCycle = useCallback(() => {
    if (!activeExercise) return
    // 1. aktualne nastawy
    const currentValues = { ...valuesRef.current }
    cycleCounterRef.current += 1
    const cycleValues = { ...currentValues, _cycleIndex: cycleCounterRef.current }

    // 2. wynik – jedno źródło dla ekranu i zaliczenia
    const evaluation = evaluateCycle(defects, wada, cycleValues, exerciseMachine, activeExercise.pass, activeExercise)
    const training = evaluation.training || simulateTrainingCycle(cycleValues, exerciseMachine, activeExercise)
    const defectPct = evaluation.target ?? computeResult(defects, wada, cycleValues, exerciseMachine, activeExercise).defectPct
    // Okno administratora zawęża zaliczenie – wynik trafia do tego samego obiektu cyklu.
    const adminWindowOk = rootWindowCheck(exerciseKey, activeExercise, currentValues)
    const singleCyclePassed = evaluation.passed && adminWindowOk
    const requiredStableCycles = activeExercise.pass?.requiredStableCycles || 1
    const nextStableStreak = singleCyclePassed ? stableStreakRef.current + 1 : 0
    stableStreakRef.current = nextStableStreak
    const isSolved = singleCyclePassed && nextStableStreak >= requiredStableCycles

    let trend = 'first'
    if (lastDefectPct.current !== null) {
      if (defectPct < lastDefectPct.current) trend = 'better'
      else if (defectPct > lastDefectPct.current) trend = 'worse'
      else trend = 'same'
    }
    lastDefectPct.current = defectPct

    const changes = ALL_PARAMS
      .filter(p => Number(currentValues[p.id]) !== Number(lastLoggedValues.current[p.id]))
      .map(p => ({
        id: p.id,
        label: LABELS[p.id] || p.label,
        from: lastLoggedValues.current[p.id],
        to: currentValues[p.id],
        unit: p.unit
      }))
    lastLoggedValues.current = currentValues

    const result = {
      ...(training || {}),
      cycle: cycleCounterRef.current,
      settings: currentValues,
      defectPct,
      processWindowOk: (training ? training.processWindowOk : singleCyclePassed) && adminWindowOk && !evaluation.sideDefects?.length,
      sideDefects: evaluation.sideDefects || [],
      singleCyclePassed,
      evaluationPassed: isSolved,
      evaluationReasons: evaluation.reasons,
      studentReasons: training
        ? [
            ...studentReasons(training),
            ...(evaluation.sideDefects || []).map(sd => `Wada uboczna: ${sd.text}`),
            ...(adminWindowOk ? [] : ['Proces poza oknem technologicznym'])
          ].filter((x, i, a) => a.indexOf(x) === i)
        : [],
      studentWarnings: training ? studentWarnings(training) : [],
      changeNotes: (activeExercise.changeNotes || [])
        .filter(n => n.params.some(id => changes.some(c => c.id === id)))
        .map(n => n.text),
      stableStreak: nextStableStreak,
      requiredStableCycles,
      trend
    }

    // 3. wynik procesu, 4. log, 5. seria, 6. komunikat
    setProcessResult(result)
    setCycleLog(log => [{ ...result, changes }, ...log])
    setResultModal(result)

    // 7. zakończenie ćwiczenia
    if (isSolved) {
      setRunning(false)
      setSolved(true)
    }
  }, [activeExercise, exerciseMachine, wada])

  const handleStartCycle = useCallback(() => {
    if (cycling || !running || solved) return
    let left = CYCLE_SECONDS
    setCountdown(left)
    countdownRef.current = setInterval(() => {
      left -= 1
      if (left > 0) {
        setCountdown(left)
        return
      }
      clearInterval(countdownRef.current)
      setCountdown(null)
      finishCycle()
    }, 1000)
  }, [cycling, running, solved, finishCycle])

  // ---------------------------------------------------------------
  // Widoki trenera
  // ---------------------------------------------------------------
  // Wybór trybu z górnego paska; tryby trenera wymagają kodu (raz na sesję).
  function selectMode(target) {
    const mode = MODES.find(m => m.view === target)
    if (mode?.locked && !adminSession) {
      setAdminPrompt({ code: '', error: false, target })
      return
    }
    stopCycle()
    setView(target)
  }

  if (view === 'adminMatrix') {
    return <AdminMatrix onClose={() => setView('sim')} onOpenImpact={() => setView('impact')}
      modeSwitch={<ModeSwitch current="adminMatrix" onSelect={selectMode} unlocked={adminSession} />} />
  }

  if (view === 'impact') {
    return <DefectImpactPanel onClose={() => setView('sim')}
      modeSwitch={<ModeSwitch current="impact" onSelect={selectMode} unlocked={adminSession} />} />
  }

  // ---------------------------------------------------------------
  // Widok kursanta – konsola maszyny
  // ---------------------------------------------------------------
  const visibleHints = activeExercise?.hints && running
    ? activeExercise.hints.filter(h => cycleLog.length >= h.after && (!h.when || h.when(values, exerciseMachine)))
    : []

  const defectIds = Object.keys(BUILTIN_DEFECTS)
  const r = processResult
  const statusText = !activeExercise ? 'WYBIERZ ĆWICZENIE'
    : cycling ? `CYKL W TOKU · ${countdown} s`
    : solved ? 'ĆWICZENIE ZAKOŃCZONE'
    : running ? 'GOTOWY DO WTRYSKU'
    : 'OCZEKUJE'
  const vpStart = activeExercise ? exerciseValues(exerciseKey, defaultValues).Pp : null
  const speedIds = ['Pw5', 'Pw4', 'Pw3', 'Pw2', 'Pw1']
  const sinkExercise = activeExercise?.processModel?.type === 'sinkMark'
  const flashExercise = activeExercise?.processModel?.type === 'flashMark'
  const burnExercise = activeExercise?.processModel?.type === 'burnMark'
  const burnText = r => !r ? '—' : r.diesel ? 'przypalenie' : r.streaks ? 'smugi' : 'brak'

  const partView = partViewFor(r, wada)

  const verdict = !r ? null
    : r.evaluationPassed ? { cls: 'ok', text: 'SZTUKA OK' }
    : r.singleCyclePassed ? { cls: 'warn', text: `STABILNY ${r.stableStreak}/${r.requiredStableCycles}` }
    : { cls: 'ng', text: 'SZTUKA NG' }

  return (
    <div className="console">
      {/* ---------------- górny pasek ---------------- */}
      <header className="c-top">
        <div className="c-brand">
          <div className="c-brand-row">
            <span className="c-logo">ENGEL</span>
            <span className="c-chip mono">CC300</span>
          </div>
          <span className="c-brand-sub mono">● SYMULATOR WTRYSKARKI</span>
        </div>
        <ModeSwitch current="sim" onSelect={selectMode} unlocked={adminSession} disabled={cycling} />
        <div className="c-top-exercise">
          {activeExercise ? (
            <>
              <span className="c-top-exercise-label">{activeExercise.label}</span>
              <button type="button" className="c-btn c-btn--ghost" disabled={cycling}
                onClick={() => setPickerWada(wada)}>Zmień ćwiczenie</button>
            </>
          ) : (
            <span className="c-muted">Wybierz rodzaj wady z panelu po lewej</span>
          )}
        </div>
        <div className={`c-status mono ${cycling ? 'is-busy' : ''}`}>
          <span className="c-led" />{statusText}
        </div>
        {adminSession && (
          <div className="c-top-trainer">
            <button type="button" className="c-btn c-btn--ghost" onClick={() => setView('impact')}>Panel wpływu</button>
            <button type="button" className="c-btn c-btn--ghost" onClick={() => setAdminSession(false)}>Wyloguj</button>
          </div>
        )}
      </header>

      <div className="c-body">
        {/* ---------------- lewy panel ---------------- */}
        <aside className="c-side">
          <div className="c-side-title mono">RODZAJE WAD</div>
          <nav className="c-defects">
            {defectIds.map(id => {
              const available = exercisesForWada(id).length > 0
              const active = id === wada
              return (
                <button key={id} type="button"
                  className={`c-defect ${active ? 'is-active' : ''} ${available ? '' : 'is-soon'}`}
                  disabled={!available || cycling}
                  onClick={() => handleOpenDefect(id)}>
                  <img src={`/defects/${id}.jpg`} alt="" />
                  <span className="c-defect-name">{shortLabel(BUILTIN_DEFECTS[id].label)}</span>
                  {!available && <span className="c-defect-soon mono">wkrótce</span>}
                </button>
              )
            })}
          </nav>

          {activeExercise && (
            <>
              <div className="c-side-title mono">PANELE PROCESOWE</div>
              <nav className="c-links">
                {PANEL_LINKS.map(l => (
                  <a key={l.id} href={`#${l.id}`}>{l.label}</a>
                ))}
              </nav>
            </>
          )}

          <button type="button" className="c-admin-link mono" disabled={cycling}
            onClick={() => selectMode('adminMatrix')}>⚙ Administrator</button>

          <div className="c-side-foot mono">
            <div><span>CZAS CYKLU</span><strong className="c-accent">{r ? `${round(r.cycleTime, 1)} s` : '—'}</strong></div>
            <div><span>WYDAJNOŚĆ</span><strong>{r ? `${r.productivity} szt./h` : '—'}</strong></div>
            <div><span>CYKLE</span><strong>{cycleLog.length}</strong></div>
          </div>
        </aside>

        {/* ---------------- obszar główny ---------------- */}
        {!activeExercise ? (
          <main className="c-main c-empty">
            <div className="c-empty-card">
              <MachineSchematic values={values} />
              <h2>Wybierz rodzaj wady</h2>
              <p>Kliknij wadę w panelu po lewej, a następnie wybierz ćwiczenie. Po wyborze otrzymasz zgłoszenie operatora.</p>
            </div>
          </main>
        ) : (
          <main className="c-main">
            {/* karta zadania */}
            <section className="c-card c-task">
              <div className="c-task-info">
                <h1>{activeExercise.label}</h1>
                <p className="c-task-goal">{activeExercise.learningGoal}</p>
                {activeExercise.operatorReport && (
                  <div className={`c-report ${operatorReportOpen ? 'is-open' : ''}`}>
                    <button type="button" className="c-report-head" onClick={() => setOperatorReportOpen(o => !o)}>
                      <span className="mono">ZGŁOSZENIE OPERATORA</span>
                      <span>{operatorReportOpen ? '▲' : '▼'}</span>
                    </button>
                    {operatorReportOpen && (
                      <div className="c-report-body">
                        <p>„{activeExercise.operatorReport.message}”</p>
                        <ul>{activeExercise.operatorReport.facts?.map(f => <li key={f}>{f}</li>)}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="c-task-side">
                <div className="c-readout mono">
                  <div><span>CZAS ĆWICZENIA</span><strong className="c-accent">{formatClock(elapsedMs)}</strong></div>
                  <div><span>STATUS MASZYNY</span><strong>{statusText}</strong></div>
                </div>
                <div className="c-task-actions">
                  <button type="button" className="c-btn c-btn--ghost" onClick={handleResetSettings} disabled={controlsLocked}>
                    ↺ Reset nastaw
                  </button>
                  {solved ? (
                    <button type="button" className="c-btn c-btn--primary" onClick={() => loadExercise(exerciseKey)}>
                      ↻ Powtórz ćwiczenie
                    </button>
                  ) : !running ? (
                    <button type="button" className="c-btn c-btn--primary" onClick={() => setOperatorIntroOpen(true)}>
                      ▶ Rozpocznij
                    </button>
                  ) : (
                    <button type="button" className="c-btn c-btn--primary" onClick={handleStartCycle} disabled={cycling}>
                      {cycling ? `Cykl… ${countdown}` : '▶ Start cyklu'}
                    </button>
                  )}
                </div>
              </div>
            </section>

            <div className="c-grid">
              <div className="c-col">
                {/* cylinder i forma */}
                <section className="c-card" id="sec-cylinder">
                  <div className="c-card-head">
                    <div>
                      <h2>Cylinder, forma i zamykanie</h2>
                      <span className="c-card-sub mono">STREFY GRZANIA · TEMPERATURA FORMY · ZWARCIE</span>
                    </div>
                    {activeExercise.material && <span className="c-chip mono">{activeExercise.material.name}</span>}
                  </div>
                  <div className="c-schematic">
                    <div className="c-temps">
                      {['T1', 'T2', 'T3', 'T4', 'T5', 'TR'].map(id => (
                        <ParamStepper key={id} param={P[id]} label={SHORT_LABELS[id]} value={values[id]}
                          onChange={handleChange} disabled={controlsLocked} compact />
                      ))}
                    </div>
                    <MachineSchematic values={values} cycling={cycling} />
                    <div className="c-mold-row">
                      {['Tr', 'Ts', 'Tc', 'Fz'].map(id => (
                        <ParamStepper key={id} param={P[id]} label={SHORT_LABELS[id]}
                          value={values[id]} onChange={handleChange} disabled={controlsLocked} compact />
                      ))}
                    </div>
                  </div>
                </section>

                {/* V/P */}
                <section className="c-card c-vp" id="sec-vp">
                  <div className="c-card-head">
                    <div>
                      <h2>Punkt przełączenia na docisk (V/P)</h2>
                      <span className="c-card-sub mono">POZYCJA ŚLIMAKA · DOZOWANIE {values.doz} mm</span>
                    </div>
                    <div className="c-vp-value mono">
                      <strong>{values.Pp}</strong><span>mm</span>
                    </div>
                  </div>
                  <input className="c-range" type="range" min={P.Pp.min} max={P.Pp.max} step={P.Pp.step}
                    value={values.Pp === '' ? 0 : values.Pp} disabled={controlsLocked}
                    onChange={e => handleChange('Pp', e.target.value)}
                    style={{ '--pct': `${((Number(values.Pp) || 0) - P.Pp.min) / (P.Pp.max - P.Pp.min) * 100}%` }} />
                  <div className="c-range-scale mono">
                    {[0, 5, 10, 15, 20, 25].map(t => <span key={t}>{t}</span>)}
                  </div>
                  <div className="c-vp-foot mono">
                    <span>Przód ślimaka ←</span>
                    <span>nastawa startowa: {vpStart} mm</span>
                    <span>→ Dawka</span>
                  </div>
                  <div className="c-vp-steps">
                    <ParamStepper param={P.Pp} label="Pozycja V/P" value={values.Pp} onChange={handleChange} disabled={controlsLocked} compact />
                    <ParamStepper param={P.doz} label="Skok dozowania" value={values.doz} onChange={handleChange} disabled={controlsLocked} compact />
                  </div>
                </section>

                <div className="c-pair" id="sec-inject">
                  {/* docisk */}
                  <section className="c-card">
                    <div className="c-card-head"><h3 className="mono">DOCISK</h3></div>
                    <div className="c-stack">
                      <ParamStepper param={P.Td} label="Czas docisku" value={values.Td} onChange={handleChange} disabled={controlsLocked} />
                      <ParamStepper param={P.Pd} label="Ciśnienie docisku" value={values.Pd} onChange={handleChange} disabled={controlsLocked} />
                    </div>
                  </section>

                  {/* wtrysk */}
                  <section className="c-card">
                    <div className="c-card-head"><h3 className="mono">WTRYSK (PROFIL PRĘDKOŚCI)</h3></div>
                    <div className="c-profile">
                      {speedIds.map(id => {
                        return (
                          <div key={id} className="c-profile-col">
                            <SpeedBar param={P[id]} value={values[id]} label={LABELS[id]}
                              onChange={handleChange} disabled={controlsLocked} />
                            <input className="c-profile-input mono" type="number" min={P[id].min} max={P[id].max}
                              step={P[id].step} value={values[id]} disabled={controlsLocked} aria-label={LABELS[id]}
                              onChange={e => handleChange(id, e.target.value)} />
                            <span className="c-profile-label mono">{id.replace('Pw', 'V')}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="c-profile-unit mono">mm/s · V1 = pierwszy stopień wtrysku</div>
                    <ParamStepper param={P.GR} label="Gr. ciśnienia wtrysku" value={values.GR} onChange={handleChange} disabled={controlsLocked} />
                  </section>
                </div>

                {/* plastyfikacja */}
                <section className="c-card" id="sec-plast">
                  <div className="c-card-head"><h3 className="mono">PLASTYFIKACJA</h3></div>
                  <div className="c-row4">
                    {['doz', 'Deko', 'Prz', 'Ob'].map(id => (
                      <ParamStepper key={id} param={P[id]} label={SHORT_LABELS[id]} value={values[id]}
                        onChange={handleChange} disabled={controlsLocked} compact />
                    ))}
                  </div>
                </section>
              </div>

              {/* ---------------- ocena wypraski ---------------- */}
              <aside className="c-col c-col--right">
                <section className="c-card c-inspect">
                  <div className="c-card-head">
                    <div>
                      <h2>Ocena wypraski</h2>
                      <span className="c-card-sub mono">{r ? `CYKL ${r.cycle}` : 'STAN WYJŚCIOWY'}</span>
                    </div>
                    {verdict && <span className={`c-verdict c-verdict--${verdict.cls} mono`}>{verdict.text}</span>}
                  </div>
                  <div className={`c-part ${partView.kind === 'ok' ? 'is-ok' : ''}`}>
                    {partView.kind === 'ok' ? (
                      <div className="c-part-ok"><span>✓</span><strong>Detal kompletny</strong></div>
                    ) : (
                      <img src={partView.src} alt={partView.caption} />
                    )}
                    <div className="c-part-caption mono">{partView.caption}</div>
                  </div>

                  <div className="c-metrics">
                    <div className="c-metric c-metric--wide">
                      <span className="mono">MASA WYPRASKI</span>
                      <strong>{r ? `${r.mass} g` : '—'}</strong>
                      {r && <>
                        <div className="c-meter"><div style={{ width: `${Math.min(100, r.mass / r.referenceMass * 100)}%` }} /></div>
                        <small className="mono">Referencja: {r.referenceMass} g</small>
                      </>}
                    </div>
                    {burnExercise && (
                      <div className="c-metric c-metric--wide">
                        <span className="mono">PRZYPALENIA / SMUGI (OCENA WIZUALNA)</span>
                        <strong className={r ? (r.diesel || r.streaks ? 'is-ng' : 'is-ok') : ''}>{burnText(r)}</strong>
                        {r && <small className="mono">Temperatura masy {r.meltTemperature} °C · dozowanie {r.dosingTime} s</small>}
                      </div>
                    )}
                    {flashExercise && (
                      <div className="c-metric c-metric--wide">
                        <span className="mono">GRAT NA LINII PODZIAŁU (POMIAR)</span>
                        <strong className={r ? (r.flash ? 'is-ng' : 'is-ok') : ''}>{r ? `${r.burr} mm` : '—'}</strong>
                        {r && <small className="mono">Tolerancja wyrobu: brak gratu</small>}
                      </div>
                    )}
                    {sinkExercise && (
                      <div className="c-metric c-metric--wide">
                        <span className="mono">GŁĘBOKOŚĆ ZAPADNIĘCIA (POMIAR)</span>
                        <strong className={r ? (r.sinkOk ? 'is-ok' : 'is-ng') : ''}>{r ? `${r.sinkDepth} mm` : '—'}</strong>
                        {r && <small className="mono">Tolerancja wyrobu: ≤ 0.03 mm</small>}
                      </div>
                    )}
                    <div className="c-metric">
                      <span className="mono">PODUSZKA</span>
                      <strong>{r ? `${r.actualCushion} mm` : '—'}</strong>
                    </div>
                    <div className="c-metric">
                      <span className="mono">RUCH PO V/P</span>
                      <strong>{r ? `${r.holdingStroke} mm` : '—'}</strong>
                    </div>
                    <div className="c-metric">
                      <span className="mono">CIŚN. MAKS. / LIMIT</span>
                      <strong>{r ? `${r.maxPressure} / ${r.pressureLimit}` : '—'}<small> bar</small></strong>
                    </div>
                    <div className="c-metric">
                      <span className="mono">PRĘDKOŚĆ ZAD. / RZECZ.</span>
                      <strong>{r ? `${r.commandedSpeed} / ${r.actualSpeed}` : '—'}<small> mm/s</small></strong>
                    </div>
                    <div className="c-metric">
                      <span className="mono">CZAS WTRYSKU</span>
                      <strong>{r ? `${r.injectionTime} s` : '—'}</strong>
                    </div>
                    <div className="c-metric">
                      <span className="mono">OKNO PROCESU</span>
                      <strong className={r ? (r.processWindowOk ? 'is-ok' : 'is-ng') : ''}>
                        {r ? (r.processWindowOk ? 'OK' : 'NG') : '—'}
                      </strong>
                    </div>
                    {activeExercise.pass?.requiredStableCycles > 1 && (
                      <div className="c-metric c-metric--wide">
                        <span className="mono">STABILNA SERIA</span>
                        <div className="c-streak">
                          {Array.from({ length: activeExercise.pass.requiredStableCycles }).map((_, i) => (
                            <i key={i} className={i < (r?.stableStreak || 0) ? 'on' : ''} />
                          ))}
                          <strong>{r?.stableStreak || 0}/{activeExercise.pass.requiredStableCycles}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {r && !r.singleCyclePassed && r.studentReasons.length > 0 && (
                    <div className="c-note c-note--ng">
                      <strong className="mono">DLACZEGO NG</strong>
                      <ul>{r.studentReasons.map(x => <li key={x}>{x}</li>)}</ul>
                    </div>
                  )}
                  {r?.studentWarnings.map(w => <div key={w} className="c-note c-note--warn">⚠ {w}</div>)}

                  {r?.changeNotes?.length > 0 && !solved && (
                    <div className="c-note c-note--hint">
                      <strong>Uwaga do zmiany nastaw</strong>
                      <ul>{r.changeNotes.map(t => <li key={t}>{t}</li>)}</ul>
                    </div>
                  )}

                  {visibleHints.length > 0 && (
                    <div className="c-note c-note--hint">
                      <strong>Wskazówka procesu</strong>
                      <ul>{visibleHints.map(h => <li key={h.text}>{h.text}</li>)}</ul>
                    </div>
                  )}

                  {solved && activeExercise.solutionSummary && (
                    <div className="c-note c-note--ok">
                      <strong>Diagnoza i rozwiązanie</strong>
                      <p>{activeExercise.solutionSummary}</p>
                    </div>
                  )}

                  {solved && activeExercise.solutionFormula && r?.openingForce && (
                    <div className="c-note c-note--ok">
                      <strong>{activeExercise.solutionFormula.title}</strong>
                      <ClampFormula formula={activeExercise.solutionFormula} result={r} />
                    </div>
                  )}

                  {solved && activeExercise.otherParameters && (
                    <div className="c-note c-note--hint">
                      <strong>Dodatkowe wskazania – inne parametry</strong>
                      <ul>{activeExercise.otherParameters.items.map(t => <li key={t}>{t}</li>)}</ul>
                      <small className="c-note-source">{activeExercise.otherParameters.source}</small>
                    </div>
                  )}

                  {adminSession && r && (
                    <div className="c-note c-note--trainer mono">
                      <strong>WARTOŚCI MODELU (TRENER)</strong>
                      <p>Wypełnienie przy V/P {r.fillAtVP}% · końcowe {r.finalFill}% · wada {r.defectPct}%</p>
                      {r.model === 'sinkMark' && <p>Kompensacja skurczu {r.compensation}% · zamarzanie przewężki {r.gateFreezeTime} s · efektywny docisk {r.effectiveHoldTime} s</p>}
                      {r.valveScenario && <p>Zawór: sprawność {r.valveEfficiency}% · strata skoku {r.valveStrokeLoss} mm</p>}
                      <p>{r.evaluationReasons.join(' • ') || 'brak powodów NG'}</p>
                    </div>
                  )}
                </section>

                <section className="c-card c-times">
                  <div className="c-card-head"><h3 className="mono">CZASY I BILANS</h3></div>
                  {r ? (
                    <dl className="mono">
                      <dt>Droga ślimaka do V/P</dt><dd>{r.strokeToVP} mm</dd>
                      <dt>Pozycja V/P → poduszka</dt><dd>{r.vpPosition} → {r.actualCushion} mm</dd>
                      <dt>Czas docisku</dt><dd>{r.holdingTime} s</dd>
                      <dt>Czas dozowania</dt><dd>{r.dosingTime} s</dd>
                      <dt>Czas chłodzenia (zadany)</dt><dd>{r.coolingTime} s</dd>
                      <dt>Ruchy formy i wyrzut</dt><dd>{r.auxiliaryTime} s</dd>
                      <dt className="total">Czas cyklu</dt><dd className="total">{r.cycleTime} s</dd>
                      <dt>Wydajność</dt><dd>{r.productivity} szt./h</dd>
                    </dl>
                  ) : (
                    <p className="c-muted">Uruchom cykl, aby zobaczyć dane procesu.</p>
                  )}
                </section>
              </aside>
            </div>

            {/* historia cykli */}
            <section className="c-card" id="sec-log">
              <div className="c-card-head"><h3 className="mono">HISTORIA CYKLI</h3></div>
              {cycleLog.length === 0 ? (
                <p className="c-muted">Brak cykli – zmień nastawy i kliknij „Start cyklu”.</p>
              ) : (
                <div className="c-log-wrap">
                  <table className="c-log mono">
                    <thead>
                      <tr>
                        <th>Cykl</th><th>Wynik</th><th>Masa</th>{sinkExercise && <th>Zapadn.</th>}{flashExercise && <th>Grat</th>}{burnExercise && <th>Przypal.</th>}<th>Poduszka</th><th>Ciśn. maks.</th>
                        <th>t wtrysku</th><th>t cyklu</th><th>Zmiany nastaw</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cycleLog.map(e => (
                        <tr key={e.cycle}>
                          <td>{e.cycle}</td>
                          <td>
                            <span className={`c-tag ${e.evaluationPassed ? 'ok' : e.singleCyclePassed ? 'warn' : 'ng'}`}>
                              {e.evaluationPassed ? 'OK' : e.singleCyclePassed ? `${e.stableStreak}/${e.requiredStableCycles}` : 'NG'}
                            </span>
                            {e.trend !== 'first' && <span className={`c-trend ${trendMeta(e.trend).cls}`}>{trendMeta(e.trend).arrow}</span>}
                          </td>
                          <td>{e.mass} g</td>
                          {sinkExercise && <td>{e.sinkDepth} mm</td>}
                          {flashExercise && <td>{e.burr} mm</td>}
                          {burnExercise && <td>{burnText(e)}</td>}
                          <td>{e.actualCushion} mm</td>
                          <td>{e.maxPressure} bar</td>
                          <td>{e.injectionTime} s</td>
                          <td>{e.cycleTime} s</td>
                          <td className="c-log-changes">
                            {e.changes.length > 0
                              ? e.changes.map(c => <span key={c.id}>{c.label}: {c.from} → {c.to} {c.unit}</span>)
                              : <span className="c-muted">bez zmian</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        )}
      </div>

      {/* ---------------- kod administratora ---------------- */}
      {adminPrompt && (
        <div className="c-modal-bg" onClick={() => setAdminPrompt(null)}>
          <form className="c-modal c-modal--code" onClick={e => e.stopPropagation()}
            onSubmit={e => {
              e.preventDefault()
              if (adminPrompt.code.trim().toLowerCase() === ADMIN_CODE) {
                setAdminPrompt(null)
                setAdminSession(true)
                stopCycle()
                setView(adminPrompt.target || 'adminMatrix')
              } else {
                setAdminPrompt({ ...adminPrompt, error: true })
              }
            }}>
            <span className="mono c-muted">TRYB ADMINISTRATORA</span>
            <h2>Podaj kod dostępu</h2>
            <input className="c-code-input mono" type="password" autoFocus value={adminPrompt.code}
              aria-label="Kod administratora"
              onChange={e => setAdminPrompt({ ...adminPrompt, code: e.target.value, error: false })} />
            {adminPrompt.error && <p className="c-code-error">Nieprawidłowy kod.</p>}
            <div className="c-modal-actions">
              <button type="button" className="c-btn c-btn--ghost" onClick={() => setAdminPrompt(null)}>Anuluj</button>
              <button type="submit" className="c-btn c-btn--primary">Wejdź</button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- okno wyboru ćwiczenia ---------------- */}
      {pickerWada && (
        <div className="c-modal-bg" onClick={() => setPickerWada(null)}>
          <div className="c-modal" onClick={e => e.stopPropagation()}>
            <div className="c-modal-head">
              <img src={`/defects/${pickerWada}.jpg`} alt="" />
              <div>
                <span className="mono c-muted">WYBÓR ĆWICZENIA</span>
                <h2>{shortLabel(BUILTIN_DEFECTS[pickerWada]?.label)}</h2>
              </div>
            </div>
            <div className="c-exercise-list">
              {exercisesForWada(pickerWada).map((ex, i) => (
                <button key={ex.key} type="button"
                  className={`c-exercise ${ex.key === exerciseKey ? 'is-active' : ''}`}
                  onClick={() => handleChooseExercise(ex.key)}>
                  <span className="mono">ĆWICZENIE {i + 1}</span>
                  <strong>{ex.label}</strong>
                  <span className="c-muted">Otwórz zgłoszenie operatora →</span>
                </button>
              ))}
            </div>
            <button type="button" className="c-btn c-btn--ghost" onClick={() => setPickerWada(null)}>Anuluj</button>
          </div>
        </div>
      )}

      {/* ---------------- zgłoszenie operatora ---------------- */}
      {operatorIntroOpen && activeExercise?.operatorReport && (
        <div className="c-modal-bg">
          <div className="c-modal c-modal--report">
            <span className="mono c-muted">{activeExercise.label}</span>
            <h2>👷 {activeExercise.operatorReport.title}</h2>
            <blockquote>„{activeExercise.operatorReport.message}”</blockquote>
            <div className="c-modal-block">
              <strong className="mono">ZAOBSERWOWANE OBJAWY</strong>
              <ul>{activeExercise.operatorReport.facts?.map(f => <li key={f}>{f}</li>)}</ul>
            </div>
            <div className="c-modal-block c-modal-block--goal">
              <strong className="mono">TWOJE ZADANIE</strong>
              <p>{activeExercise.learningGoal}</p>
            </div>
            <button type="button" className="c-btn c-btn--primary" onClick={handleGoToMachine}>Przejdź do maszyny →</button>
          </div>
        </div>
      )}

      {/* ---------------- wynik cyklu ---------------- */}
      {resultModal && (
        <div className="c-modal-bg" onClick={() => setResultModal(null)}>
          <div className="c-modal c-modal--result" onClick={e => e.stopPropagation()}>
            <div className={`c-result-icon ${resultModal.evaluationPassed ? 'ok' : resultModal.singleCyclePassed ? 'warn' : 'ng'}`}>
              {resultModal.evaluationPassed ? '✓' : resultModal.singleCyclePassed ? '✓' : '✕'}
            </div>
            <h2 className={resultModal.evaluationPassed ? 'is-ok' : resultModal.singleCyclePassed ? 'is-warn' : 'is-ng'}>
              {resultModal.evaluationPassed
                ? 'SZTUKA OK — ĆWICZENIE ZAKOŃCZONE'
                : resultModal.singleCyclePassed
                  ? `CYKL STABILNY ${resultModal.stableStreak}/${resultModal.requiredStableCycles}`
                  : 'SZTUKA NG'}
            </h2>
            <p className="c-muted">
              {resultModal.evaluationPassed
                ? `Detal kompletny, proces w oknie. Czas: ${formatClock(elapsedMs)}.`
                : resultModal.singleCyclePassed
                  ? 'Cykl spełnia warunki. Wykonaj kolejny cykl bez zmian nastaw.'
                  : 'Przeanalizuj dane procesu i zmień nastawy.'}
            </p>

            {!resultModal.singleCyclePassed && resultModal.studentReasons.length > 0 && (
              <div className="c-modal-block">
                <strong className="mono">OBSERWACJE</strong>
                <ul>{resultModal.studentReasons.map(x => <li key={x}>{x}</li>)}</ul>
              </div>
            )}

            {!resultModal.evaluationPassed && resultModal.changeNotes?.length > 0 && (
              <div className="c-modal-block c-modal-block--note">
                <strong className="mono">UWAGA DO ZMIANY NASTAW</strong>
                <ul>{resultModal.changeNotes.map(t => <li key={t}>{t}</li>)}</ul>
              </div>
            )}

            {!resultModal.evaluationPassed && (
              <div className={`c-trend-badge ${trendMeta(resultModal.trend).cls}`}>
                {trendMeta(resultModal.trend).arrow} {trendMeta(resultModal.trend).text}
              </div>
            )}

            {resultModal.evaluationPassed && activeExercise?.solutionSummary && (
              <div className="c-modal-block c-modal-block--ok">
                <strong className="mono">DIAGNOZA I ROZWIĄZANIE</strong>
                <p>{activeExercise.solutionSummary}</p>
                <p className="mono c-solution-data">
                  Wypełnienie przy V/P {resultModal.fillAtVP}% · końcowe {resultModal.finalFill}% ·
                  ruch po V/P {resultModal.holdingStroke} mm · poduszka {resultModal.actualCushion} mm
                  {resultModal.valveScenario && ` · sprawność zaworu ${resultModal.valveEfficiency}%`}
                  {resultModal.model === 'sinkMark' && ` · kompensacja skurczu ${resultModal.compensation}% · zamarzanie przewężki ${resultModal.gateFreezeTime} s`}
                </p>
              </div>
            )}

            {resultModal.evaluationPassed && activeExercise?.solutionFormula && resultModal.openingForce && (
              <div className="c-modal-block c-modal-block--ok">
                <strong className="mono">{activeExercise.solutionFormula.title.toUpperCase()}</strong>
                <ClampFormula formula={activeExercise.solutionFormula} result={resultModal} />
              </div>
            )}

            {resultModal.evaluationPassed && activeExercise?.otherParameters && (
              <div className="c-modal-block">
                <strong className="mono">DODATKOWE WSKAZANIA – INNE PARAMETRY</strong>
                <ul>{activeExercise.otherParameters.items.map(t => <li key={t}>{t}</li>)}</ul>
                <small className="c-note-source">{activeExercise.otherParameters.source}</small>
              </div>
            )}

            {resultModal.evaluationPassed && trainerNotesAll[wada] && (
              <div className="c-modal-block">
                <strong className="mono">DO OMÓWIENIA Z TRENEREM</strong>
                <ul>{trainerNotesAll[wada].map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            )}
            <button type="button" className="c-btn c-btn--primary" onClick={() => setResultModal(null)}>Zamknij</button>
          </div>
        </div>
      )}
    </div>
  )
}
