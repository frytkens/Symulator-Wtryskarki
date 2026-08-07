import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import ParamField from './components/ParamField.jsx'
import { PARAMS, CURVES, curveVal, SUCCESS_THRESHOLD } from './data/params.js'

function round(n, d = 0) {
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

function defaultValues() {
  const v = {}
  PARAMS.forEach(p => { v[p.id] = p.def })
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

export default function App() {
  const [values, setValues] = useState(defaultValues)
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  const activeParams = useMemo(() => PARAMS.filter(p => p.active), [])

  const { overallQuality, defectPct } = useMemo(() => {
    let overall = 0
    activeParams.forEach(p => {
      const q = curveVal(Number(values[p.id]), CURVES[p.id])
      overall += q * p.weight
    })
    const defect = Math.max(0, Math.min(100, Math.round(100 - overall * 0.8)))
    return { overallQuality: round(overall), defectPct: defect }
  }, [values, activeParams])

  useEffect(() => {
    if (!running) return
    function tick() {
      setElapsedMs(Date.now() - startRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running])

  useEffect(() => {
    if (running && !solved && defectPct <= SUCCESS_THRESHOLD) {
      setRunning(false)
      setSolved(true)
    }
  }, [defectPct, running, solved])

  const handleStart = useCallback(() => {
    setValues(randomChallengeValues())
    setElapsedMs(0)
    setSolved(false)
    startRef.current = Date.now()
    setRunning(true)
  }, [])

  const handleReset = useCallback(() => {
    setRunning(false)
    setSolved(false)
    setElapsedMs(0)
    setValues(defaultValues())
  }, [])

  const handleChange = useCallback((id, raw) => {
    setValues(prev => ({ ...prev, [id]: raw === '' ? '' : Number(raw) }))
  }, [])

  const seconds = (elapsedMs / 1000).toFixed(1)

  return (
    <div className="page">
      <h1>Symulator wtryskarki – panel parametrów</h1>
      <p className="sub">
        Kliknij start, żeby wylosować nieprawidłowe ustawienia, a potem znajdź poprawne wartości zanim zegar Cię zaskoczy.
        Niebieskie obramowanie = parametr ma wpływ na wybraną wadę.
      </p>

      <select className="wada-select" defaultValue="niedolanie">
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
      </div>

      <div className="machine-layout">
        <div className="diagram-wrap diagram-wrap--injection">
          <img src="/schemat.png" alt="Schemat wtryskarki" />
          {PARAMS.map(p => (
            <ParamField
              key={p.id}
              param={p}
              value={values[p.id]}
              onChange={handleChange}
            />
          ))}
        </div>

        <div className="diagram-wrap diagram-wrap--clamp diagram-wrap--placeholder">
          <span>Zamykanie wtryskarki – wkrótce</span>
        </div>
      </div>

      <div className="results">
        <div className="card">
          <h3>Parametry z wpływem na wybraną wadę</h3>
          {activeParams.map(p => {
            const q = round(curveVal(Number(values[p.id]) || 0, CURVES[p.id]))
            return (
              <div className="bar-row" key={p.id}>
                <div className="lab">
                  <span>{p.id} (waga {Math.round(p.weight * 100)}%)</span>
                  <span>{q}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: q + '%' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="card center">
          <PartSvg defectPct={defectPct} />
          <div className="stat">
            <div className="lab">jakość procesu</div>
            <div className="num">{overallQuality}%</div>
          </div>
          <div className="stat">
            <div className="lab">prawdopodobieństwo niedolania</div>
            <div className="num danger">{defectPct}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartSvg({ defectPct }) {
  const cut = Math.min(60, defectPct * 0.6)
  const d = `M170,30 L170,${30 + cut} L${170 - cut},30 Z`
  return (
    <svg viewBox="0 0 200 200" width="140" height="140">
      <rect x="30" y="30" width="140" height="140" rx="6" fill="#f4f4f2" stroke="#ccc" strokeWidth="1" />
      <path d={d} fill="#fff" />
    </svg>
  )
}
