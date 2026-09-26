import { useMemo, useState } from 'react'
import { ALL_PARAMS, simulateTrainingCycle, riskFor, BUILTIN_DEFECTS_ALL as DEFECTS } from '../../data/params.js'
import { EXERCISES } from '../../data/exercises/index.js'
import { BASE_START } from '../../data/exercises/zapadniecia.js'
import { surfaceModel } from '../../data/exercises/powierzchnia.js'
import { LABELS } from '../../data/labels.js'
import ParamStepper from './ParamStepper.jsx'
import MachineSchematic from './MachineSchematic.jsx'

// =============================================================
// PANEL WPŁYWU WAD – tryb swobodnej analizy (odpowiednik starego panelu).
// Ustawiasz dowolne wartości parametrów i obserwujesz, jak zmienia się ryzyko
// każdej wady. Bez licznika czasu, bez losowania, bez wpływu na ćwiczenia.
// =============================================================

const P = Object.fromEntries(ALL_PARAMS.map(p => [p.id, p]))
const clamp01 = x => Math.max(0, Math.min(1, x))
const BORDER = 0.35

// ok – wartość dobrego procesu, limit – początek wady, max – pełne nasilenie.
function scale(v, ok, limit, max) {
  if (v <= ok) return 0
  if (v <= limit) return BORDER * (v - ok) / (limit - ok)
  return BORDER + (1 - BORDER) * clamp01((v - limit) / (max - limit))
}

function defaultValues() {
  const v = {}
  ALL_PARAMS.forEach(p => { v[p.id] = p.def })
  return v
}

const GROUPS = [
  { title: 'Cylinder', ids: ['T1', 'T2', 'T3', 'T4', 'T5', 'TR'] },
  { title: 'Forma i zamykanie', ids: ['Tr', 'Ts', 'Tc', 'Fz'] },
  { title: 'Wtrysk', ids: ['Pp', 'Pw1', 'Pw2', 'Pw3', 'Pw4', 'Pw5', 'GR'] },
  { title: 'Docisk', ids: ['Pd', 'Td'] },
  { title: 'Plastyfikacja', ids: ['doz', 'Deko', 'Prz', 'Ob'] }
]

// Ryzyko [%] każdej wady z rejestru. Wady z ćwiczeń liczone są tymi samymi modelami,
// co ćwiczenia; pozostałe – krzywymi wpływu z rejestru wad (jak w starym panelu).
function modelRisks(values) {
  const m = EXERCISES.niedolanie.machine
  const sink = simulateTrainingCycle(values, m, EXERCISES.zapadniecia_Z03)
  const flash = simulateTrainingCycle(values, m, EXERCISES.wyplywy_W04)
  const burnModel = EXERCISES.przypalenia_D01.processModel
  const burn = simulateTrainingCycle(values, m, { processModel: { ...burnModel, burn: { ...burnModel.burn, helperCap: Infinity } } })
  const valve = simulateTrainingCycle({ ...values, _cycleIndex: 1 }, m, EXERCISES.niedolanie_N012)
  // Wady powierzchni – wszystkie składniki bez ograniczeń scenariusza (wskaźniki > 0,5 = wada).
  const surfRef = surfaceModel(null)
  const surf = simulateTrainingCycle(values, m, { processModel: { ...surfRef, surface: { ...surfRef.surface, helperCap: Infinity } } })
  const fz = Number(values.Fz) || 1
  // Skala jak w starym panelu: 0% przy dobrym procesie, ok. 35% na granicy pojawienia się wady
  // (koniec strefy żółtej), powyżej – nasilenie wady do 100%.
  return {
    niedolanie: scale(100 - sink.finalFill, 0, 1.5, 25),
    zapadniecia: scale(sink.sinkDepth, 0.005, 0.035, 0.3),
    wyplywy: scale(flash.openingForce * 1.1 / fz, 0.9, 1.0, 1.6),
    przypalenia: scale(burn.dieselRatio, 0.85, 1.0, 1.8),
    smugi_przypalone: scale(burn.localMeltTemp, 256, 265, 285),
    wahania: scale(1 - valve.valveQuality / 100, 0, 0.2, 1),
    linie_laczenia: scale(-surf.weldMargin, 0, 6, 25),
    smugi_powietrza: scale(surf.airIdx, 0, 0.5, 20),
    smugi_wilgoci: scale(surf.moistureIdx, 0, 0.5, 20),
    // Pęcherze: pęcherzyki powietrza (model) lub jamy skurczowe (krzywa z rejestru) – większe z dwóch.
    pecherze: Math.max(scale(surf.bubbleIdx, 0, 0.5, 20), curveRisk('pecherze', values) / 100)
  }
}

// Wady bez modelu fizycznego: krzywe wpływu ze starego panelu, znormalizowane tak,
// by receptura wzorcowa dawała 0% (kierunek i siła zmian bez zmian).
const CURVE_BASE = {}
function curveRisk(id, values) {
  if (!(id in CURVE_BASE)) CURVE_BASE[id] = riskFor(DEFECTS, id, { ...defaultValues(), ...BASE_START }).defectPct
  const base = CURVE_BASE[id]
  const raw = riskFor(DEFECTS, id, values).defectPct
  return Math.round(clamp01((raw - base) / Math.max(1, 100 - base)) * 100)
}

function allDefectRisks(values) {
  const model = modelRisks(values)
  return Object.entries(DEFECTS).map(([id, d]) => ({
    id,
    label: d.label,
    simple: !(id in model),
    pct: id in model ? Math.round(model[id] * 100) : curveRisk(id, values)
  }))
}

function levelClass(pct) {
  if (pct <= 12) return 'ok'
  if (pct <= 35) return 'warn'
  return 'bad'
}

export default function DefectImpactPanel({ onClose, modeSwitch }) {
  const initial = () => ({ ...defaultValues(), ...BASE_START })
  const [values, setValues] = useState(initial)
  const [prev, setPrev] = useState(null)

  const rows = useMemo(() => allDefectRisks(values), [values])

  function handleChange(id, raw) {
    setPrev(rows)
    setValues({ ...values, [id]: raw === '' ? '' : Number(raw) })
  }

  return (
    <div className="console">
      <header className="c-top">
        <div className="c-brand">
          <div className="c-brand-row">
            <span className="c-logo">ENGEL</span>
            <span className="c-chip mono">CC300</span>
          </div>
          <span className="c-brand-sub mono">● SYMULATOR WTRYSKARKI</span>
        </div>
        {modeSwitch}
        <div className="c-top-exercise">
          <span className="c-muted">
            Tryb swobodnej analizy – ustawiaj dowolne wartości parametrów i obserwuj, jak zmienia się ryzyko każdej wady.
            Bez licznika czasu, bez losowania.
          </span>
        </div>
        <button type="button" className="c-btn c-btn--ghost" onClick={() => { setPrev(null); setValues(initial()) }}>↺ Receptura wzorcowa</button>
        <button type="button" className="c-btn c-btn--primary" onClick={onClose}>Zamknij</button>
      </header>

      <main className="c-main">
        <section className="c-card">
          <div className="c-card-head">
            <div>
              <h2>Panel wpływu wad</h2>
              <span className="c-card-sub mono">PARAMETRY MASZYNY</span>
            </div>
          </div>
          <div className="c-schematic">
            <MachineSchematic values={values} />
          </div>
          <div className="i-groups">
            {GROUPS.map(g => (
              <div key={g.title} className="i-group">
                <h3 className="mono">{g.title.toUpperCase()}</h3>
                <div className="i-grid">
                  {g.ids.map(id => (
                    <ParamStepper key={id} param={P[id]} label={LABELS[id] || P[id].label.replace(/^\w+ – /, '')}
                      value={values[id]} onChange={handleChange} compact />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="c-card">
          <div className="c-card-head">
            <div>
              <h2>Wpływ bieżących parametrów na ryzyko wad</h2>
              <span className="c-card-sub mono">
                PORUSZAJ PARAMETRAMI – PASKI AKTUALIZUJĄ SIĘ NA BIEŻĄCO I POKAZUJĄ, CZY ZMIANA IDZIE W DOBRĄ (▼), CZY W ZŁĄ (▲) STRONĘ DLA KAŻDEJ Z WAD
              </span>
            </div>
          </div>
          <div className="i-list">
            {rows.map(r => {
              const before = prev?.find(x => x.id === r.id)?.pct
              const delta = before === undefined ? 0 : r.pct - before
              return (
                <div className="i-row i-row--line" key={r.id}>
                  <span className="i-label" title={r.label}>{r.simple && <span className="c-muted">* </span>}{r.label}</span>
                  <div className="i-track"><div className={`i-fill ${levelClass(r.pct)}`} style={{ width: `${r.pct}%` }} /></div>
                  <span className={`i-pct mono ${levelClass(r.pct)}`}>{r.pct}%</span>
                  <span className="i-delta mono">
                    {delta !== 0 && <em className={delta > 0 ? 'up' : 'down'}>{delta > 0 ? '▲' : '▼'}{Math.abs(delta)}</em>}
                  </span>
                </div>
              )
            })}
          </div>
          <small className="mono c-muted i-footnote">
            * model uproszczony (krzywe wpływu) – wada nie ma jeszcze ćwiczeń; pozostałe wady liczone są tymi samymi modelami co ćwiczenia.
          </small>
        </section>
      </main>
    </div>
  )
}
