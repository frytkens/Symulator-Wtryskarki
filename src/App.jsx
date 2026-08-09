import { useState, useRef, useEffect, useCallback } from 'react'
import ParamField from './components/ParamField.jsx'
import DefectManager from './components/DefectManager.jsx'
import { LABELS } from './data/labels.js'
import {
  PARAMS, CLAMP_PARAMS, ALL_PARAMS,
  BUILTIN_DEFECTS_ALL as BUILTIN_DEFECTS, TRAINER_NOTES_ALL as BUILTIN_TRAINER_NOTES,
  curveVal, SUCCESS_THRESHOLD, computeResult
} from './data/params.js'
import DefectsPanel from './components/DefectsPanel.jsx'

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

function computeProcessSummary(values) {
  const speeds = ['Pw1', 'Pw2', 'Pw3', 'Pw4', 'Pw5'].map(id => Number(values[id]) || 0)
  const vAvg = speeds.reduce((a, b) => a + b, 0) / speeds.length

  // Droga wtrysku = skok dozowania + dekompresja - punkt przełączenia
  // (np. doz=60, Deko=7, Pp=10 -> droga = 67 mm)
  const doz = Number(values.doz) || 0
  const deko = Number(values.Deko) || 0
  const pp = Number(values.Pp) || 0
  const droga = Math.max(0, doz + deko - pp)
  const czasWtrysku = vAvg > 0 ? droga / vAvg : 0 // s = mm / (mm/s)

  const czasDocisku = Number(values.Td) || 0

  // Dozowanie i chłodzenie biegną równolegle (ślimak dozuje w trakcie stygnięcia formy),
  // więc do cyklu wchodzi ten dłuższy z dwóch, a nie suma obu.
  // ZAŁOŻENIE (do weryfikacji): czas dozowania = skok dozowania / obroty ślimaka.
  const ob = Number(values.Ob) || 0
  const czasDozowania = ob > 0 ? doz / ob : 0
  const czasChlodzenia = 20 // stała na razie
  const czasChlodzenieDozowanie = Math.max(czasDozowania, czasChlodzenia)

  const czasCyklu = czasWtrysku + czasDocisku + czasChlodzenieDozowanie
  const wydajnoscSzt = czasCyklu > 0 ? Math.round(3600 / czasCyklu) : 0
  const tcSetting = Number(values.Tc) || 0
  const tcDelta = round(czasCyklu - tcSetting, 1)
  return {
    vAvg, droga, czasWtrysku, czasDocisku,
    czasDozowania, czasChlodzenia, czasChlodzenieDozowanie,
    czasCyklu, wydajnoscSzt, tcSetting, tcDelta
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
  const [view, setView] = useState('sim') // 'sim' | 'admin'
  const [customDefects, setCustomDefects] = useState(() => loadCustomWady().defects)
  const [customTrainerNotes, setCustomTrainerNotes] = useState(() => loadCustomWady().trainerNotes)
  const defects = { ...BUILTIN_DEFECTS, ...customDefects }
  const trainerNotesAll = { ...BUILTIN_TRAINER_NOTES, ...customTrainerNotes }
  const customIds = new Set(Object.keys(customDefects))

  const [values, setValues] = useState(defaultValues)
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const [countdown, setCountdown] = useState(null) // null = brak trwającego cyklu
  const [cycleLog, setCycleLog] = useState([])
  const [wada, setWada] = useState('niedolanie')
  const [resultModal, setResultModal] = useState(null) // { solved: boolean } | null
  const lastLoggedValues = useRef(defaultValues())
  const lastDefectPct = useRef(computeResult(defects, wada, defaultValues()).defectPct)
  const countdownRef = useRef(null)

  const cycling = countdown !== null
  const activeIds = new Set(defects[wada].params.map(p => p.id))

  const [processResult, setProcessResult] = useState(null) // null dopóki żaden cykl się nie zakończył

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
    const fresh = randomChallengeValues(defects, wada)
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, wada, fresh).defectPct
    setCycleLog([])
    setResultModal(null)
    setProcessResult(null)
    setElapsedMs(0)
    setSolved(false)
    startRef.current = Date.now()
    setRunning(true)
  }, [wada, customDefects])

  const handleReset = useCallback(() => {
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    const fresh = defaultValues()
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, wada, fresh).defectPct
    setCycleLog([])
    setResultModal(null)
    setProcessResult(null)
    clearInterval(countdownRef.current)
    setCountdown(null)
  }, [wada, customDefects])

  const handleWadaChange = useCallback((newWada) => {
    setWada(newWada)
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    const fresh = defaultValues()
    setValues(fresh)
    lastLoggedValues.current = fresh
    lastDefectPct.current = computeResult(defects, newWada, fresh).defectPct
    setCycleLog([])
    setResultModal(null)
    setProcessResult(null)
    clearInterval(countdownRef.current)
    setCountdown(null)
  }, [customDefects])

  const handleChange = useCallback((id, raw) => {
    setValues(prev => ({ ...prev, [id]: raw === '' ? '' : Number(raw) }))
  }, [])

  const handleStartCycle = useCallback(() => {
    if (cycling) return
    setCountdown(CYCLE_SECONDS)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          // cykl zakończony – policz wynik i zapisz do logu
          setValues(currentValues => {
            const { defectPct } = computeResult(defects, wada, currentValues)
            const isSolved = defectPct <= SUCCESS_THRESHOLD

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

            setProcessResult(computeProcessSummary(currentValues))

            setCycleLog(log => [
              { cycle: log.length + 1, changes, defectPct, solved: isSolved, trend },
              ...log
            ])
            setResultModal({ solved: isSolved, trend })

            if (running && !solved && isSolved) {
              setRunning(false)
              setSolved(true)
            }
            return currentValues
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cycling, running, solved, wada, customDefects])

  useEffect(() => {
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(null), 600)
      return () => clearTimeout(t)
    }
  }, [countdown])

  useEffect(() => () => clearInterval(countdownRef.current), [])

  const seconds = (elapsedMs / 1000).toFixed(1)

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
              ryzyko każdej z 6 najczęstszych wad. Bez licznika czasu, bez losowania.
            </p>
          </div>
          <button className="btn" onClick={() => setView('sim')}>← wróć do symulatora</button>
          <button className="btn" onClick={() => setView('admin')}>⚙ Zarządzaj wadami</button>
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
            Kliknij start, żeby wylosować nieprawidłowe ustawienia. Ustaw parametry, uruchom cykl przyciskiem
            „Start cyklu” i sprawdź wynik – tak jak na prawdziwej maszynie.
            Niebieskie obramowanie = parametr ma wpływ na wybraną wadę.
          </p>
        </div>
        <button className="btn" onClick={() => setView('panel')}>🧪 Panel wpływu wad</button>
        <button className="btn" onClick={() => setView('admin')}>⚙ Zarządzaj wadami</button>
      </div>

      <select className="wada-select" value={wada} onChange={e => handleWadaChange(e.target.value)}>
        {Object.entries(defects).map(([id, d]) => (
          <option key={id} value={id}>{d.label}</option>
        ))}
      </select>

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
          disabled={cycling}
        >
          {cycling ? `Cykl… ${countdown}` : 'Start cyklu'}
        </button>
      </div>

      <div className="machine-layout">
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
        {processResult ? (
          <>
            <div className="process-grid">
              <div className="process-stat">
                <span className="ps-label">v śr. wtrysku</span>
                <span className="ps-value">{round(processResult.vAvg, 1)} m/s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Droga wtrysku</span>
                <span className="ps-value">{round(processResult.droga, 1)} mm</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">Czas wtrysku</span>
                <span className="ps-value">{round(processResult.czasWtrysku, 2)} s</span>
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
                <span className="ps-label">Czas chłodzenia</span>
                <span className="ps-value">{processResult.czasChlodzenia} s</span>
              </div>
              <div className="process-stat">
                <span className="ps-label">→ do cyklu (max z dwóch powyżej)</span>
                <span className="ps-value">{round(processResult.czasChlodzenieDozowanie, 1)} s</span>
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

            {processResult.tcDelta > 0 && (
              <div className="tc-warning">
                ⚠ Obliczony czas cyklu jest o {processResult.tcDelta}s dłuższy niż nastawa Tc ({processResult.tcSetting}s) – maszyna nie zdąży w zadanym czasie.
              </div>
            )}
          </>
        ) : (
          <p className="process-summary-empty">Uruchom „Start cyklu”, żeby zobaczyć wynikowe parametry procesu.</p>
        )}
      </div>

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
              {resultModal.solved ? 'Sztuka DOBRA' : 'Sztuka NG'}
            </div>
            <p className="verdict-sub">
              {resultModal.solved
                ? 'Parametry dają akceptowalne ryzyko wystąpienia tej wady.'
                : 'Zbyt wysokie ryzyko wystąpienia tej wady przy tych parametrach.'}
            </p>

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

            <button className="btn primary" onClick={() => setResultModal(null)}>zamknij</button>
          </div>
        </div>
      )}
    </div>
  )
}
