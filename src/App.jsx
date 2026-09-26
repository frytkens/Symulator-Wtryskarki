import { useState, useRef, useEffect, useCallback } from 'react'
import ParamField from './components/ParamField.jsx'
import DefectManager from './components/DefectManager.jsx'
import { LABELS } from './data/labels.js'
import {
  PARAMS, CLAMP_PARAMS, ALL_PARAMS, MACHINE,
  BUILTIN_DEFECTS_ALL as BUILTIN_DEFECTS, TRAINER_NOTES_ALL as BUILTIN_TRAINER_NOTES,
  curveVal, SUCCESS_THRESHOLD, computeResult, evaluateCycle, cushion, simulateTrainingCycle
} from './data/params.js'
import { EXERCISES, exerciseValues, exercisesForWada } from './data/exercises/index.js'
import DefectsPanel from './components/DefectsPanel.jsx'
import Landing from './components/Landing.jsx'

const CYCLE_SECONDS = 5
const STORAGE_KEY = 'wtryskarka_custom_wady'

function round(n, d = 0) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

function defaultValues() {
  const v = {}
  ALL_PARAMS.forEach(p => { v[p.id] = p.def })
  return v
}

function randomChallengeValues(defectsRegistry, wada) {
  const active = defectsRegistry[wada].params

  const generate = () => {
    const v = defaultValues()
    active.forEach(dp => {
      const p = PARAMS.find(x => x.id === dp.id) || CLAMP_PARAMS.find(x => x.id === dp.id)
      if (!p) return
      // Jeśli trener zdefiniował zakres losowania startowego dla tego parametru,
      // losujemy tylko z niego (dla dowolnego parametru wady, nie tylko dominującego).
      const useBadRange = Array.isArray(dp.badRange) && dp.badRange.length === 2
      const lo = useBadRange ? Math.max(p.min, dp.badRange[0]) : p.min
      const hi = useBadRange ? Math.min(p.max, dp.badRange[1]) : p.max
      const span = hi - lo
      const rand = lo + Math.random() * span
      v[p.id] = p.step < 1 ? round(rand, 2) : round(rand / p.step) * p.step
    })
    return v
  }

  // Nie losuj od razu "dobrej sztuki" ani wartości ledwo-ledwo wadliwej -
  // ma to być wyraźna, jednoznaczna wada dydaktyczna, a nie coś w granicach szumu.
  // Dlatego próg jest dużo wyższy niż SUCCESS_THRESHOLD (który decyduje o "rozwiązaniu"),
  // a prób jest więcej, żeby dać czas na trafienie w wyraźnie złą strefę krzywej.
  const CHALLENGE_MIN_DEFECT = Math.max(SUCCESS_THRESHOLD * 2.5, 35)
  let best = generate()
  let bestDefect = computeResult(defectsRegistry, wada, best).defectPct
  for (let i = 0; i < 40; i++) {
    if (bestDefect >= CHALLENGE_MIN_DEFECT) break
    const attempt = generate()
    const defectPct = computeResult(defectsRegistry, wada, attempt).defectPct
    if (defectPct > bestDefect) {
      best = attempt
      bestDefect = defectPct
    }
  }
  return best
}

function computeProcessSummary(values, machine) {
  const speeds = ['Pw1', 'Pw2', 'Pw3', 'Pw4', 'Pw5'].map(id => Number(values[id]) || 0)
  const vAvg = speeds.reduce((a, b) => a + b, 0) / speeds.length
  const doz = Number(values.doz) || 0
  const pp = Number(values.Pp) || 0

  // Droga do V/P nie zawiera dekompresji.
  const drogaDoVP = Math.max(0, doz - pp)
  const czasWtrysku = vAvg > 0 ? drogaDoVP / vAvg : 0
  const czasDocisku = Number(values.Td) || 0

  // Model bazowy plastyfikacji: 60 mm przy Ob=0.6 i Prz=10 bar trwa 6.5 s.
  const ob = Math.max(0.05, Number(values.Ob) || 0)
  const prz = Number(values.Prz) || 0
  const czasDozowania = 6.5 * (doz / 60) * (0.6 / ob) * Math.max(0.7, 1 + (prz - 10) * 0.012)
  const czasChlodzenia = Math.max(0, Number(values.Tc) || 0)
  const czasChlodzenieDozowanie = Math.max(czasDozowania, czasChlodzenia)
  const czasPomocniczy = 6
  const czasCyklu = czasWtrysku + czasDocisku + czasChlodzenieDozowanie + czasPomocniczy
  const wydajnoscSzt = czasCyklu > 0 ? Math.round(3600 / czasCyklu) : 0
  const cush = cushion(values, machine)

  return {
    vAvg,
    droga: drogaDoVP,
    drogaDoVP,
    czasWtrysku,
    czasDocisku,
    czasDozowania,
    czasChlodzenia,
    czasChlodzenieDozowanie,
    czasPomocniczy,
    czasCyklu,
    wydajnoscSzt,
    cushionRaw: cush.raw,
    cushionAvailable: cush.available,
    cushionNeed: cush.need
  }
}

function trendMeta(trend) {
  switch (trend) {
    case 'better': return { text: 'Lepiej niż poprzednio', arrow: '▲', cls: 'better' }
    case 'worse':  return { text: 'Gorzej niż poprzednio', arrow: '▼', cls: 'worse' }
    case 'same':   return { text: 'Bez zmian względem poprzedniego cyklu', arrow: '▬', cls: 'same' }
    default:       return { text: 'Pierwszy cykl w tej próbie', arrow: '●', cls: 'first' }
  }
}

function loadCustomWady() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { defects: {}, trainerNotes: {} }
    const parsed = JSON.parse(raw)
    return { defects: parsed.defects || {}, trainerNotes: parsed.trainerNotes || {} }
  } catch {
    return { defects: {}, trainerNotes: {} }
  }
}

function saveCustomWady(customDefects, customTrainerNotes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ defects: customDefects, trainerNotes: customTrainerNotes }))
  } catch {
    // localStorage niedostępny (np. tryb prywatny) – po prostu nie zapisujemy trwale
  }
}

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'sim' | 'panel' | 'admin'
  const [customDefects, setCustomDefects] = useState(() => loadCustomWady().defects)
  const [customTrainerNotes, setCustomTrainerNotes] = useState(() => loadCustomWady().trainerNotes)
  const defects = { ...BUILTIN_DEFECTS, ...customDefects }
  const trainerNotesAll = { ...BUILTIN_TRAINER_NOTES, ...customTrainerNotes }
  const customIds = new Set(Object.keys(customDefects))

  const [values, setValues] = useState(defaultValues)
  const valuesRef = useRef(values)
  useEffect(() => { valuesRef.current = values }, [values])
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const [countdown, setCountdown] = useState(null) // null = brak trwającego cyklu
  const [cycleLog, setCycleLog] = useState([])
  const [stableStreak, setStableStreak] = useState(0)
  const stableStreakRef = useRef(0)
  const [wada, setWada] = useState('niedolanie')
  // wariant ćwiczenia dla bieżącej wady (np. 'niedolanie' / 'niedolanie_B' / 'niedolanie_C').
  // null = dla tej wady nie ma jeszcze zdefiniowanego ćwiczenia -> spadamy na stare losowanie.
  const [exerciseKey, setExerciseKey] = useState(() => exercisesForWada('niedolanie')[0]?.key ?? null)
  const [resultModal, setResultModal] = useState(null) // { solved: boolean } | null
  const [operatorIntroOpen, setOperatorIntroOpen] = useState(false)
  const [operatorReportOpen, setOperatorReportOpen] = useState(false)
  const lastLoggedValues = useRef(defaultValues())
  const lastDefectPct = useRef(computeResult(defects, wada, defaultValues(), MACHINE, null).defectPct)
  const cycleCounterRef = useRef(0)
  const countdownRef = useRef(null)

  const cycling = countdown !== null
  const activeExercise = exerciseKey ? EXERCISES[exerciseKey] : null
  const exerciseMachine = activeExercise?.machine || MACHINE
  const variants = exercisesForWada(wada)
  // Widok kursanta nie podpowiada, które parametry są związane z rozwiązaniem.
  // Pola focus pozostają w danych i mogą zostać użyte w przyszłym trybie trenera.
  const activeIds = new Set()

  const [processResult, setProcessResult] = useState(null) // null dopóki żaden cykl się nie zakończył

  useEffect(() => {
    if (view === 'sim' && activeExercise?.operatorReport) {
      setOperatorIntroOpen(true)
      setOperatorReportOpen(false)
    }
  }, [view, exerciseKey])

  function handleSaveDefect(id, defectObj, trainerNotes) {
    const nextDefects = { ...customDefects, [id]: defectObj }
    setCustomDefects(nextDefects)
    let nextNotes = customTrainerNotes
    if (trainerNotes.length > 0) {
      nextNotes = { ...customTrainerNotes, [id]: trainerNotes }
      setCustomTrainerNotes(nextNotes)
    }
    saveCustomWady(nextDefects, nextNotes)
  }

  function handleDeleteDefect(id) {
    const nextDefects = { ...customDefects }
    delete nextDefects[id]
    const nextNotes = { ...customTrainerNotes }
    delete nextNotes[id]
    setCustomDefects(nextDefects)
    setCustomTrainerNotes(nextNotes)
    saveCustomWady(nextDefects, nextNotes)
    if (wada === id) {
      handleWadaChange('niedolanie')
    }
  }

  function handleUseInSimulator(id) {
    handleWadaChange(id)
    setView('sim')
  }

  function handleOpenPanel(id) {
    if (id) handleWadaChange(id)
    setView('panel')
  }

  function handleImportDefects(importedDefects, importedTrainerNotes) {
    const nextDefects = { ...customDefects }
    const nextNotes = { ...customTrainerNotes }
    let addedCount = 0
    const skipped = []
    Object.entries(importedDefects).forEach(([id, defectObj]) => {
      if (defects[id]) {
        skipped.push(id)
        return
      }
      nextDefects[id] = defectObj
      if (importedTrainerNotes[id]) nextNotes[id] = importedTrainerNotes[id]
      addedCount++
    })
    setCustomDefects(nextDefects)
    setCustomTrainerNotes(nextNotes)
    saveCustomWady(nextDefects, nextNotes)
    return { addedCount, skipped }
  }

  useEffect(() => {
    if (!running) return
    function tick() {
      setElapsedMs(Date.now() - startRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  const handleStart = useCallback(() => {
    // Ćwiczenie zdefiniowane -> zawsze te same, przemyślane nastawy startowe.
    // Brak ćwiczenia dla tej wady -> stare losowanie jako fallback.
    const fresh = activeExercise
      ? exerciseValues(exerciseKey, defaultValues)
      : randomChallengeValues(defects, wada)
    valuesRef.current = fresh
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, wada, fresh, exerciseMachine, activeExercise).defectPct
    setCycleLog([])
    stableStreakRef.current = 0
    cycleCounterRef.current = 0
    setStableStreak(0)
    setResultModal(null)
    setProcessResult(null)
    setElapsedMs(0)
    setSolved(false)
    startRef.current = Date.now()
    setRunning(true)
  }, [wada, customDefects, exerciseKey, activeExercise, exerciseMachine])

  const handleReset = useCallback(() => {
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    const fresh = defaultValues()
    valuesRef.current = fresh
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, wada, fresh, exerciseMachine, activeExercise).defectPct
    setCycleLog([])
    stableStreakRef.current = 0
    cycleCounterRef.current = 0
    setStableStreak(0)
    setResultModal(null)
    setProcessResult(null)
    clearInterval(countdownRef.current)
    setCountdown(null)
  }, [wada, customDefects, exerciseMachine])

  const handleWadaChange = useCallback((newWada) => {
    setWada(newWada)
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    // przy zmianie wady wybieramy jej pierwszy zdefiniowany wariant ćwiczenia (jeśli istnieje)
    const newVariants = exercisesForWada(newWada)
    const newExerciseKey = newVariants[0]?.key ?? null
    const newMachine = newExerciseKey ? EXERCISES[newExerciseKey].machine : MACHINE
    setExerciseKey(newExerciseKey)
    const fresh = newExerciseKey ? exerciseValues(newExerciseKey, defaultValues) : defaultValues()
    valuesRef.current = fresh
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, newWada, fresh, newMachine, newExerciseKey ? EXERCISES[newExerciseKey] : null).defectPct
    setCycleLog([])
    stableStreakRef.current = 0
    cycleCounterRef.current = 0
    setStableStreak(0)
    setResultModal(null)
    setProcessResult(null)
    clearInterval(countdownRef.current)
    setCountdown(null)
  }, [customDefects])

  // przełączenie wariantu ćwiczenia bez zmiany wady (np. niedolanie A -> niedolanie B)
  const handleExerciseChange = useCallback((newExerciseKey) => {
    setExerciseKey(newExerciseKey)
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    const newMachine = EXERCISES[newExerciseKey]?.machine || MACHINE
    const fresh = exerciseValues(newExerciseKey, defaultValues)
    valuesRef.current = fresh
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, wada, fresh, newMachine, EXERCISES[newExerciseKey]).defectPct
    setCycleLog([])
    stableStreakRef.current = 0
    cycleCounterRef.current = 0
    setStableStreak(0)
    setResultModal(null)
    setProcessResult(null)
    clearInterval(countdownRef.current)
    setCountdown(null)
  }, [customDefects, wada])

  const handleChange = useCallback((id, raw) => {
    const value = raw === '' ? '' : Number(raw)
    setValues(prev => {
      const next = { ...prev, [id]: value }
      valuesRef.current = next
      return next
    })
  }, [])

  const handleStartCycle = useCallback(() => {
    if (cycling) return
    setCountdown(CYCLE_SECONDS)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          // cykl zakończony – policz wynik i zapisz do logu
          const currentValues = valuesRef.current
          cycleCounterRef.current += 1
          const cycleValues = { ...currentValues, _cycleIndex: cycleCounterRef.current }
          const { defectPct } = computeResult(defects, wada, cycleValues, exerciseMachine, activeExercise)
          const evaluation = activeExercise
            ? evaluateCycle(defects, wada, cycleValues, exerciseMachine, activeExercise.pass, activeExercise)
            : null
          const singleCyclePassed = evaluation ? evaluation.passed : defectPct <= SUCCESS_THRESHOLD
          const requiredStableCycles = activeExercise?.pass?.requiredStableCycles || 1
          const nextStableStreak = singleCyclePassed ? stableStreakRef.current + 1 : 0
          stableStreakRef.current = nextStableStreak
          setStableStreak(nextStableStreak)
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
          lastLoggedValues.current = { ...currentValues }

          const baseSummary = computeProcessSummary(currentValues, exerciseMachine)
          const trainingSummary = simulateTrainingCycle(cycleValues, exerciseMachine, activeExercise)
          const completeSummary = trainingSummary ? {
            ...baseSummary,
            ...trainingSummary,
            droga: trainingSummary.strokeToVP,
            drogaDoVP: trainingSummary.strokeToVP,
            czasWtrysku: trainingSummary.injectionTime,
            czasDocisku: trainingSummary.holdingTime,
            czasDozowania: trainingSummary.dosingTime,
            czasChlodzenia: trainingSummary.coolingTime,
            czasChlodzenieDozowanie: trainingSummary.coolingDosingTime,
            czasPomocniczy: trainingSummary.auxiliaryTime,
            czasCyklu: trainingSummary.cycleTime,
            wydajnoscSzt: trainingSummary.productivity,
            cushionRaw: trainingSummary.physicalCushion,
            evaluationPassed: isSolved,
            singleCyclePassed,
            stableStreak: nextStableStreak,
            requiredStableCycles,
            evaluationReasons: evaluation?.reasons || []
          } : {
            ...baseSummary,
            evaluationPassed: isSolved,
            singleCyclePassed,
            stableStreak: nextStableStreak,
            requiredStableCycles,
            evaluationReasons: evaluation?.reasons || []
          }
          setProcessResult(completeSummary)

          setCycleLog(log => [
            { cycle: log.length + 1, changes, defectPct, solved: isSolved, singleCyclePassed, stableStreak: nextStableStreak, requiredStableCycles, trend, reasons: evaluation?.reasons || [] },
            ...log
          ])
          setResultModal({ solved: isSolved, singleCyclePassed, stableStreak: nextStableStreak, requiredStableCycles, trend, defectPct, evaluation })

          if (isSolved) {
            setRunning(false)
            setSolved(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cycling, running, solved, wada, customDefects, activeExercise, exerciseMachine])

  useEffect(() => {
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(null), 600)
      return () => clearTimeout(t)
    }
  }, [countdown])

  useEffect(() => () => clearInterval(countdownRef.current), [])

  const seconds = (elapsedMs / 1000).toFixed(1)
  const visibleHints = activeExercise?.hints
    ? activeExercise.hints.filter(h => cycleLog.length >= h.after && (!h.when || h.when(values, exerciseMachine)))
    : []

  const studentDefects = defects.niedolanie
    ? { niedolanie: defects.niedolanie }
    : {}

  if (view === 'landing') {
    return (
      <Landing
        defects={studentDefects}
        onStartTraining={handleUseInSimulator}
        onOpenPanel={handleOpenPanel}
      />
    )
  }

  if (view === 'admin') {
    return (
      <DefectManager
        defects={defects}
        customIds={customIds}
        trainerNotes={trainerNotesAll}
        onSave={handleSaveDefect}
        onDelete={handleDeleteDefect}
        onImport={handleImportDefects}
        onUseInSimulator={handleUseInSimulator}
        onClose={() => setView('sim')}
      />
    )
  }

  if (view === 'panel') {
    return (
      <div className="page">
        <div className="page-header-row">
          <div>
            <h1>Panel wpływu wad</h1>
            <p className="sub">
              Tryb swobodnej analizy – ustawiaj dowolne wartości parametrów i obserwuj, jak zmienia się
              ryzyko każdej z 8 najczęstszych wad. Bez licznika czasu, bez losowania.
            </p>
          </div>
          <button className="btn" onClick={() => setView('sim')}>← wróć do symulatora</button>
          <button className="btn" onClick={() => setView('admin')}>⚙ Zarządzaj wadami</button>
          <button className="btn" onClick={() => setView('landing')}>🏠 Start</button>
        </div>

        <div className="machine-layout">
          <div className="diagram-wrap diagram-wrap--clamp">
            <img src="/zamykanie.png" alt="Schemat zamykania wtryskarki" />
            {CLAMP_PARAMS.map(p => (
              <ParamField key={p.id} param={p} value={values[p.id]} onChange={handleChange} />
            ))}
          </div>

          <div className="diagram-wrap diagram-wrap--injection">
            <img src="/schemat.png" alt="Schemat wtryskarki" />
            {PARAMS.map(p => (
              <ParamField key={p.id} param={p} value={values[p.id]} onChange={handleChange} />
            ))}
          </div>
        </div>

        <DefectsPanel defects={defects} values={values} />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1>Symulator wtryskarki – panel parametrów</h1>
          <p className="sub">
            Zapoznaj się ze zgłoszeniem operatora, przeanalizuj nastawy i wyniki procesu,
            a następnie uruchamiaj kolejne cykle, aby znaleźć przyczynę problemu.
          </p>
        </div>
        {/* Panel wpływu i zarządzanie pozostają w kodzie, ale są ukryte w widoku kursanta. */}
        <button className="btn" onClick={() => setView('landing')}>🏠 Start</button>
      </div>

      {variants.length > 0 && (
        <div className="exercise-picker">
          {variants.map(v => (
            <button
              key={v.key}
              className={`btn exercise-chip ${v.key === exerciseKey ? 'active' : ''}`}
              onClick={() => handleExerciseChange(v.key)}
              disabled={running || cycling}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {activeExercise?.operatorReport && (
        <div style={{ margin: '12px 0', border: '1px solid #cbd5e1', borderRadius: 12, background: '#fff' }}>
          <button type="button" onClick={() => setOperatorReportOpen(open => !open)}
            style={{ width: '100%', padding: '12px 16px', border: 0, background: 'transparent', textAlign: 'left', fontWeight: 700, cursor: 'pointer' }}>
            📋 Zgłoszenie operatora {operatorReportOpen ? '▲' : '▼'}
            {!operatorReportOpen && <span style={{ marginLeft: 10, fontWeight: 400, color: '#64748b' }}>{activeExercise.operatorReport.message.slice(0, 90)}…</span>}
          </button>
          {operatorReportOpen && (
            <div style={{ padding: '0 16px 14px' }}>
              <p style={{ margin: '0 0 8px' }}>„{activeExercise.operatorReport.message}”</p>
              <ul style={{ margin: 0, paddingLeft: 22 }}>{activeExercise.operatorReport.facts?.map(fact => <li key={fact}>{fact}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {activeExercise?.learningGoal && (
        <div className="exercise-hints"><strong>Twoje zadanie:</strong> {activeExercise.learningGoal}</div>
      )}

      {solved && activeExercise?.solutionSummary && (
        <div style={{ margin: '12px 0', padding: '14px 16px', borderRadius: 12, background: '#ecfdf3', border: '1px solid #86efac', color: '#166534' }}>
          <strong>Wyjaśnienie:</strong> {activeExercise.solutionSummary}
        </div>
      )}

      <div className="timer-bar">
        <div className="timer-display">
          <span className="timer-label">czas</span>
          <span className="timer-value">{seconds}s</span>
        </div>
        {!running && !solved && (
          <button className="btn primary" onClick={handleStart}>start</button>
        )}
        {running && (
          <button className="btn" onClick={handleReset}>przerwij</button>
        )}
        {solved && (
          <div className="solved-msg">
            rozwiązano w {seconds}s
            <button className="btn primary" onClick={handleStart}>jeszcze raz</button>
          </div>
        )}

        <button
          className="btn primary cycle-btn"
          onClick={handleStartCycle}
          disabled={cycling || !running || solved}
          title={!running && !solved ? 'Najpierw kliknij „start”, aby wczytać scenariusz.' : ''}
        >
          {cycling ? `Cykl… ${countdown}` : solved ? 'Ćwiczenie zakończone' : 'Start cyklu'}
        </button>
      </div>

      <div className="machine-layout">
        <div className="machine-layout-col">
          <div className={`diagram-wrap diagram-wrap--clamp ${cycling ? 'is-cycling' : ''}`}>
            <img src="/zamykanie.png" alt="Schemat zamykania wtryskarki" />
            {CLAMP_PARAMS.map(p => (
              <ParamField
                key={p.id}
                param={p}
                value={values[p.id]}
                onChange={handleChange}
                disabled={cycling}
                active={activeIds.has(p.id)}
              />
            ))}
          </div>

          <div className="defect-photo-card">
            {solved ? (
              <div style={{ minHeight: 260, display: 'grid', placeItems: 'center', background: '#ecfdf3', color: '#18794e', textAlign: 'center', padding: 24 }}>
                <div><div style={{ fontSize: 72, lineHeight: 1 }}>✓</div><strong style={{ fontSize: 24 }}>Detal kompletny — sztuka OK</strong></div>
              </div>
            ) : (
              <img
                src={processResult?.lateSwitch ? '/defects/wyplywy.jpg' : `/defects/${wada}.jpg`}
                alt={processResult?.lateSwitch ? 'Zbyt późne V/P — ryzyko wypływki i przepakowania' : (defects[wada]?.label || wada)}
              />
            )}
            <span>{solved
              ? 'Detal kompletny — brak niedolania'
              : processResult?.lateSwitch
                ? 'Zbyt późne V/P — ryzyko wypływki i przepakowania'
                : defects[wada]?.label}</span>
          </div>
        </div>

        <div className={`diagram-wrap diagram-wrap--injection ${cycling ? 'is-cycling' : ''}`}>
          <img src="/schemat.png" alt="Schemat wtryskarki" />
          {PARAMS.map(p => (
            <ParamField
              key={p.id}
              param={p}
              value={values[p.id]}
              onChange={handleChange}
              disabled={cycling}
              active={activeIds.has(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="process-summary">
        <h3>Wynikowe parametry procesu</h3>
        {resultModal && (
          <div className={resultModal.solved ? 'solved-msg' : 'tc-warning'} style={{ marginBottom: 14 }}>
            {resultModal.solved
              ? '✓ SZTUKA OK — ĆWICZENIE ZAKOŃCZONE'
              : resultModal.singleCyclePassed
                ? `✓ CYKL STABILNY ${resultModal.stableStreak}/${resultModal.requiredStableCycles}`
                : `✕ SZTUKA NG${resultModal.evaluation?.reasons?.length ? ': ' + resultModal.evaluation.reasons.join(' • ') : ''}`}
          </div>
        )}
        {processResult ? (
          <>
            <div className="process-grid">
              <div className="process-stat">
                <span className="ps-label">v śr. wtrysku</span>
                <span className="ps-value">{round(processResult.actualSpeed ?? processResult.vAvg, 1)} mm/s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Droga ślimaka do V/P</span>
                <span className="ps-value">{round(processResult.drogaDoVP ?? processResult.droga, 1)} mm</span>
              </div>
              {processResult.actualCushion !== undefined && <div className="process-stat">
                <span className="ps-label">Pozycja V/P → poduszka końcowa</span>
                <span className="ps-value">{round(processResult.vpPosition, 1)} → {processResult.actualCushion} mm</span>
              </div>}
              {processResult.requiredStroke !== undefined && <div className="process-stat">
                <span className="ps-label">Skok wymagany dla stopu</span>
                <span className="ps-value">{processResult.requiredStroke} mm</span>
              </div>}
              {processResult.valveScenario && <div className="process-stat">
                <span className="ps-label">Sprawność zaworu zwrotnego</span>
                <span className="ps-value">{processResult.valveEfficiency}%</span>
              </div>}
              {processResult.valveScenario && <div className="process-stat">
                <span className="ps-label">Strata skoku przez cofanie stopu</span>
                <span className="ps-value">{processResult.valveStrokeLoss} mm</span>
              </div>}
              {processResult.requiredStableCycles > 1 && <div className="process-stat">
                <span className="ps-label">Stabilna seria</span>
                <span className="ps-value">{processResult.stableStreak}/{processResult.requiredStableCycles}</span>
              </div>}
              {processResult.fillAtVP !== undefined && <div className="process-stat">
                <span className="ps-label">Wypełnienie przy V/P</span>
                <span className="ps-value">{processResult.fillAtVP}%</span>
              </div>}
              {processResult.holdingStroke !== undefined && <div className="process-stat">
                <span className="ps-label">Ruch ślimaka po V/P</span>
                <span className="ps-value">{processResult.holdingStroke} mm</span>
              </div>}
              <div className="process-stat">
                <span className="ps-label">Poduszka końcowa</span>
                <span className="ps-value">{round(processResult.actualCushion ?? processResult.cushionRaw, 1)} mm</span>
              </div>
              {processResult.finalFill !== undefined && <div className="process-stat">
                <span className="ps-label">Wypełnienie końcowe</span>
                <span className="ps-value">{processResult.finalFill}%</span>
              </div>}
              {processResult.processWindowOk !== undefined && <div className="process-stat">
                <span className="ps-label">Okno procesu V/P</span>
                <span className="ps-value">{processResult.processWindowOk ? 'OK' : 'NG'}</span>
              </div>}
              {processResult.mass !== undefined && <div className="process-stat">
                <span className="ps-label">Masa wypraski</span>
                <span className="ps-value">{processResult.mass} g <small>(ref. {processResult.referenceMass} g)</small></span>
              </div>}
              {processResult.maxPressure !== undefined && <div className="process-stat">
                <span className="ps-label">Ciśnienie maks. / limit</span>
                <span className="ps-value">{processResult.maxPressure} / {processResult.pressureLimit} bar</span>
              </div>}
              <div className="process-stat">
                <span className="ps-label">Czas wtrysku</span>
                <span className="ps-value">{round(processResult.injectionTime ?? processResult.czasWtrysku, 2)} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Czas docisku</span>
                <span className="ps-value">{round(processResult.czasDocisku, 1)} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Czas dozowania</span>
                <span className="ps-value">{round(processResult.czasDozowania, 1)} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Czas chłodzenia zadany</span>
                <span className="ps-value">{processResult.czasChlodzenia} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Chłodzenie/dozowanie do cyklu</span>
                <span className="ps-value">{round(processResult.czasChlodzenieDozowanie, 1)} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Ruchy formy i wyrzut</span>
                <span className="ps-value">{round(processResult.czasPomocniczy, 1)} s</span>
              </div>
              <div className="process-stat total">
                <span className="ps-label">Czas cyklu (obliczony)</span>
                <span className="ps-value">{round(processResult.czasCyklu, 1)} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Wydajność</span>
                <span className="ps-value">{processResult.wydajnoscSzt} szt./h</span>
              </div>
            </div>

            {processResult.cushionRaw < 5 && (
              <div className="tc-warning">
                ⚠ Poduszka poniżej 5 mm ({round(processResult.cushionRaw, 1)} mm) – docisk nie ma na czym działać, cykl nie zostanie zaliczony niezależnie od reszty nastaw.
              </div>
            )}
            {processResult.actualCushion !== undefined && processResult.actualCushion > Number(processResult.vpPosition) + 0.05 && (
              <div className="tc-warning">⚠ Błąd bilansu: poduszka końcowa nie może być większa od pozycji V/P.</div>
            )}
            {processResult.warnings?.map((warning, i) => (
              <div className="tc-warning" key={i}>⚠ {warning}</div>
            ))}
          </>
        ) : (
          <p className="process-summary-empty">Uruchom „Start cyklu”, żeby zobaczyć wynikowe parametry procesu.</p>
        )}
      </div>

      {visibleHints.length > 0 && (
        <div className="exercise-hints">
          <h3>Podpowiedzi</h3>
          <ul>
            {visibleHints.map((h, i) => <li key={i}>{h.text}</li>)}
          </ul>
        </div>
      )}

      <div className="cycle-log">
        <h3>Log cykli</h3>
        {cycleLog.length === 0 && (
          <p className="cycle-log-empty">Brak jeszcze żadnego cyklu – ustaw parametry i kliknij „Start cyklu”.</p>
        )}
        {cycleLog.map(entry => (
          <div className={`cycle-entry ${entry.solved ? 'ok' : 'ng'}`} key={entry.cycle}>
            <div className="cycle-entry-head">
              <span>Cykl {entry.cycle}</span>
              <span className={`cycle-result ${entry.solved ? 'ok' : 'ng'}`}>
                {entry.solved ? 'sztuka DOBRA' : 'sztuka NG'}
                {entry.trend !== 'first' && (
                  <span className={`trend-arrow-small ${trendMeta(entry.trend).cls}`}>
                    {trendMeta(entry.trend).arrow}
                  </span>
                )}
              </span>
            </div>
            {entry.changes.length > 0 ? (
              <ul className="cycle-changes">
                {entry.changes.map(c => (
                  <li key={c.id}>
                    {c.label}: {c.from} → {c.to} {c.unit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cycle-changes-empty">Brak zmian względem poprzedniego cyklu</p>
            )}
          </div>
        ))}
      </div>

      {operatorIntroOpen && activeExercise?.operatorReport && (
        <div className="modal-backdrop">
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>👷</div>
            <div className="verdict-title" style={{ color: '#1e293b' }}>{activeExercise.operatorReport.title}</div>
            <p style={{ fontSize: 18, lineHeight: 1.55, textAlign: 'left', background: '#f8fafc', padding: 16, borderRadius: 10 }}>„{activeExercise.operatorReport.message}”</p>
            <div style={{ textAlign: 'left', margin: '14px 0' }}>
              <strong>Zaobserwowane objawy:</strong>
              <ul>{activeExercise.operatorReport.facts?.map(fact => <li key={fact}>{fact}</li>)}</ul>
            </div>
            <div style={{ textAlign: 'left', padding: 12, borderLeft: '4px solid #3b82f6', background: '#eff6ff', marginBottom: 18 }}>
              <strong>Twoje zadanie:</strong> {activeExercise.learningGoal}
            </div>
            <button className="btn primary" onClick={() => setOperatorIntroOpen(false)}>Przejdź do maszyny</button>
          </div>
        </div>
      )}

      {resultModal && (
        <div className="modal-backdrop" onClick={() => setResultModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            {resultModal.solved ? (
              <svg className="verdict-icon ok" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#147a3e" strokeWidth="4" />
                <path className="check-path" d="M22 42 L35 55 L58 28" fill="none" stroke="#147a3e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="verdict-icon ng" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#b02a2a" strokeWidth="4" />
                <path d="M27 27 L53 53" stroke="#b02a2a" strokeWidth="5" strokeLinecap="round" />
                <path d="M53 27 L27 53" stroke="#b02a2a" strokeWidth="5" strokeLinecap="round" />
              </svg>
            )}

            <div className={`verdict-title ${resultModal.solved ? 'ok' : 'ng'}`}>
              {resultModal.solved
                ? 'SZTUKA OK — ĆWICZENIE ZAKOŃCZONE'
                : resultModal.singleCyclePassed
                  ? `CYKL STABILNY ${resultModal.stableStreak}/${resultModal.requiredStableCycles}`
                  : 'Sztuka NG'}
            </div>
            <p className="verdict-sub">
              {resultModal.solved
                ? 'Detal jest kompletny, proces stabilny, a ćwiczenie zaliczone.'
                : resultModal.singleCyclePassed
                  ? `Parametry są prawidłowe. Wykonaj kolejny cykl bez zmian (${resultModal.stableStreak}/${resultModal.requiredStableCycles}).`
                  : 'Detal lub stabilność procesu nie spełnia warunków. Przeanalizuj parametry i wyniki cyklu.'}
            </p>

            {!resultModal.singleCyclePassed && resultModal.evaluation?.reasons?.length > 0 && (
              <div className="trainer-notes">
                <h4>Dlaczego cykl nie został zaliczony</h4>
                <ul>{resultModal.evaluation.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
              </div>
            )}

            {!resultModal.solved && (
              <div className={`trend-badge ${trendMeta(resultModal.trend).cls}`}>
                <span className="trend-arrow">{trendMeta(resultModal.trend).arrow}</span>
                {trendMeta(resultModal.trend).text}
              </div>
            )}

            {resultModal.solved && trainerNotesAll[wada] && (
              <div className="trainer-notes">
                <h4>Do omówienia z trenerem</h4>
                <ul>
                  {trainerNotesAll[wada].map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}

            {resultModal.solved && activeExercise?.solutionSummary && (
              <div style={{ textAlign: 'left', padding: 14, borderRadius: 10, background: '#ecfdf3', color: '#166534', marginBottom: 16 }}>
                <strong>Diagnoza i rozwiązanie</strong><br />{activeExercise.solutionSummary}
              </div>
            )}
            <button className="btn primary" onClick={() => setResultModal(null)}>zamknij</button>
          </div>
        </div>
      )}
    </div>
  )
}
