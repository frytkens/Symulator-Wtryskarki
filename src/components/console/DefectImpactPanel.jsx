import { useMemo, useState } from 'react'
import { ALL_PARAMS, simulateTrainingCycle } from '../../data/params.js'
import { EXERCISES, exerciseValues, VISIBLE_EXERCISE_KEYS } from '../../data/exercises/index.js'
import { SINK_MODEL, BASE_START } from '../../data/exercises/zapadniecia.js'
import { LABELS } from '../../data/labels.js'
import ParamStepper from './ParamStepper.jsx'

const P = Object.fromEntries(ALL_PARAMS.map(p => [p.id, p]))

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

const clamp01 = x => Math.max(0, Math.min(1, x))

// Wskaźniki liczone tymi samymi modelami, co ćwiczenia (jedno źródło prawdy).
function indicators(values) {
  const fill = simulateTrainingCycle(values, EXERCISES.niedolanie.machine, EXERCISES.niedolanie)
  const sink = simulateTrainingCycle(values, EXERCISES.zapadniecia_Z01.machine, { processModel: SINK_MODEL })
  const flash = simulateTrainingCycle(values, EXERCISES.wyplywy_W04.machine, EXERCISES.wyplywy_W04)
  const valveA = simulateTrainingCycle(values, EXERCISES.niedolanie_N012.machine, EXERCISES.niedolanie_N012)
  // Wskaźnik zaworu z modelu N-02 (dekompresja + parametry pomocnicze: V1, T1/T2, przeciwciśnienie).
  const valveQuality = valveA.valveQuality / 100
  const fz = Number(values.Fz) || 1
  return {
    list: [
      {
        id: 'niedolanie', label: 'Niedolanie',
        pct: Math.round(clamp01((0.985 - fill.finalFill / 100) / 0.22) * 100),
        detail: `wypełnienie ${fill.finalFill}% · przy V/P ${fill.fillAtVP}%`
      },
      {
        id: 'zapadniecia', label: 'Zapadnięcia',
        pct: Math.round(clamp01((sink.sinkDepth - 0.01) / 0.3) * 100),
        detail: `głębokość ${sink.sinkDepth} mm · kompensacja skurczu ${sink.compensation}%`
      },
      {
        id: 'wyplywy', label: 'Wypływki',
        pct: Math.round(clamp01((flash.openingForce * 1.1 / fz - 0.8) / 0.6) * 100),
        detail: `siła rozwierająca ${flash.openingForce} kN / zwarcie ${fz} kN${flash.flash ? ` · grat ${flash.burr} mm` : ''}`
      },
      {
        id: 'wahania', label: 'Wahania masy (zawór zwrotny)',
        pct: Math.round((1 - valveQuality) * 100),
        detail: `stabilność zamykania zaworu ${Math.round(valveQuality * 100)}%`
      }
    ],
    process: [
      ['Masa', `${fill.mass} g`],
      ['Poduszka', `${fill.actualCushion} mm`],
      ['Ciśn. maks. / limit', `${fill.maxPressure} / ${fill.pressureLimit} bar`],
      ['Prędkość zad. / rzecz.', `${fill.commandedSpeed} / ${fill.actualSpeed} mm/s`],
      ['Temp. masy', `${fill.meltTemperature} °C`],
      ['Czas cyklu', `${fill.cycleTime} s`]
    ]
  }
}

function level(pct) {
  if (pct <= 10) return 'ok'
  if (pct <= 35) return 'warn'
  return 'bad'
}

export default function DefectImpactPanel({ onClose, modeSwitch }) {
  const [values, setValues] = useState(() => ({ ...defaultValues(), ...BASE_START }))
  const [source, setSource] = useState('base')
  const [prev, setPrev] = useState(null) // wskaźniki sprzed ostatniej zmiany (▲ gorzej / ▼ lepiej)

  const data = useMemo(() => indicators(values), [values])

  function handleChange(id, raw) {
    setPrev(data)
    setValues({ ...values, [id]: raw === '' ? '' : Number(raw) })
  }

  function loadSource(key) {
    setSource(key)
    setPrev(null)
    setValues(key === 'base' ? { ...defaultValues(), ...BASE_START } : exerciseValues(key, defaultValues))
  }

  const exerciseOptions = [...VISIBLE_EXERCISE_KEYS].map(k => ({ key: k, label: EXERCISES[k].label }))

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
          <select className="c-select mono" value={source} onChange={e => loadSource(e.target.value)} aria-label="Nastawy wyjściowe">
            <option value="base">Receptura wzorcowa (proces OK)</option>
            {exerciseOptions.map(o => <option key={o.key} value={o.key}>Start: {o.label}</option>)}
          </select>
        </div>
        <button type="button" className="c-btn c-btn--primary" onClick={onClose}>Zamknij</button>
      </header>

      <main className="c-main">
        <div className="c-grid">
          <div className="c-col">
            {GROUPS.map(g => (
              <section className="c-card" key={g.title}>
                <div className="c-card-head"><h3 className="mono">{g.title.toUpperCase()}</h3></div>
                <div className="i-grid">
                  {g.ids.map(id => (
                    <ParamStepper key={id} param={P[id]} label={LABELS[id] || P[id].label.replace(/^\w+ – /, '')}
                      value={values[id]} onChange={handleChange} compact />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="c-col c-col--right">
            <section className="c-card">
              <div className="c-card-head">
                <div>
                  <h2>Wpływ na wady</h2>
                  <span className="c-card-sub mono">TEN SAM SILNIK CO W ĆWICZENIACH · ▲ GORZEJ ▼ LEPIEJ</span>
                </div>
              </div>
              <div className="i-list">
                {data.list.map(d => {
                  const before = prev?.list.find(x => x.id === d.id)?.pct
                  const delta = before === undefined ? 0 : d.pct - before
                  return (
                    <div className="i-row" key={d.id}>
                      <div className="i-row-head">
                        <strong>{d.label}</strong>
                        <span className={`i-pct mono ${level(d.pct)}`}>
                          {d.pct}%
                          {delta !== 0 && <em className={delta > 0 ? 'up' : 'down'}>{delta > 0 ? '▲' : '▼'}{Math.abs(delta)}</em>}
                        </span>
                      </div>
                      <div className="i-track"><div className={`i-fill ${level(d.pct)}`} style={{ width: `${d.pct}%` }} /></div>
                      <small className="mono c-muted">{d.detail}</small>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="c-card c-times">
              <div className="c-card-head"><h3 className="mono">DANE PROCESU</h3></div>
              <dl className="mono">
                {data.process.map(([k, v]) => [<dt key={k}>{k}</dt>, <dd key={k + 'v'}>{v}</dd>])}
              </dl>
            </section>

            <div className="c-note c-note--trainer mono">
              <strong>TYLKO DLA TRENERA</strong>
              <p>Wskaźniki procentowe są wewnętrzne i nie są pokazywane kursantom. Pozostałe wady (przypalenia, pęcherze, smugi…) nie mają jeszcze modelu w pilotażu.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
