import { useState, useRef, useEffect, useCallback } from 'react'
import ParamField from './components/ParamField.jsx'
import { LABELS } from './data/labels.js'
import { PARAMS, CLAMP_PARAMS, CURVES, curveVal, SUCCESS_THRESHOLD, TRAINER_NOTES } from './data/params.js'

const ALL_PARAMS = [...PARAMS, ...CLAMP_PARAMS]
const CYCLE_SECONDS = 5

function round(n, d = 0) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

function defaultValues() {
  const v = {}
  ALL_PARAMS.forEach(p => { v[p.id] = p.def })
  return v
}

function randomChallengeValues() {
  const v = defaultValues()
  const active = PARAMS.filter(p => p.active)
  active.forEach(p => {
    const span = p.max - p.min
    const rand = p.min + Math.random() * span
    v[p.id] = p.step < 1 ? round(rand, 2) : round(rand / p.step) * p.step
  })
  return v
}

function computeResult(values) {
  const activeParams = PARAMS.filter(p => p.active)
  let overall = 0
  activeParams.forEach(p => {
    const q = curveVal(Number(values[p.id]), CURVES[p.id])
    overall += q * p.weight
  })
  const defectPct = Math.max(0, Math.min(100, Math.round(100 - overall)))
  return { overallQuality: round(overall), defectPct }
}

export default function App() {
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
  const countdownRef = useRef(null)

  const cycling = countdown !== null

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
    const fresh = randomChallengeValues()
    setValues(fresh)
    lastLoggedValues.current = fresh
    setCycleLog([])
    setResultModal(null)
    setElapsedMs(0)
    setSolved(false)
    startRef.current = Date.now()
    setRunning(true)
  }, [])

  const handleReset = useCallback(() => {
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    const fresh = defaultValues()
    setValues(fresh)
    lastLoggedValues.current = fresh
    setCycleLog([])
    setResultModal(null)
    clearInterval(countdownRef.current)
    setCountdown(null)
  }, [])

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
            const { defectPct } = computeResult(currentValues)
            const isSolved = defectPct <= SUCCESS_THRESHOLD

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

            setCycleLog(log => [
              { cycle: log.length + 1, changes, defectPct, solved: isSolved },
              ...log
            ])
            setResultModal({ solved: isSolved })

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
  }, [cycling, running, solved])

  useEffect(() => {
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(null), 600)
      return () => clearTimeout(t)
    }
  }, [countdown])

  useEffect(() => () => clearInterval(countdownRef.current), [])

  const seconds = (elapsedMs / 1000).toFixed(1)

  return (
    <div className="page">
      <h1>Symulator wtryskarki – panel parametrów</h1>
      <p className="sub">
        Kliknij start, żeby wylosować nieprawidłowe ustawienia. Ustaw parametry, uruchom cykl przyciskiem
        „Start cyklu” i sprawdź wynik – tak jak na prawdziwej maszynie.
        Niebieskie obramowanie = parametr ma wpływ na wybraną wadę.
      </p>

      <select className="wada-select" value={wada} onChange={e => setWada(e.target.value)}>
        <option value="niedolanie">Niedolanie – nieprawidłowa praca zaworu zwrotnego</option>
        <option value="grat" disabled>Grat (wkrótce)</option>
        <option value="zapadniecie" disabled>Zapadnięcie (wkrótce)</option>
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
            />
          ))}
        </div>
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
                ? 'Parametry dają akceptowalne ryzyko niedolania.'
                : 'Zbyt wysokie ryzyko niedolania przy tych parametrach.'}
            </p>

            {TRAINER_NOTES[wada] && (
              <div className="trainer-notes">
                <h4>Do omówienia z trenerem</h4>
                <ul>
                  {TRAINER_NOTES[wada].map(item => <li key={item}>{item}</li>)}
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
