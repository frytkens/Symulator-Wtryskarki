import { useMemo, useState } from 'react'
import { ALL_PARAMS, BUILTIN_DEFECTS_ALL as DEFECTS, evaluateCycle } from '../../data/params.js'
import { EXERCISES, exerciseValues, exercisesForWada } from '../../data/exercises/index.js'
import { loadOverrides, saveOverrides, rootWindowCheck } from '../../data/adminOverrides.js'
import { LABELS } from '../../data/labels.js'

function defaultValues() {
  const v = {}
  ALL_PARAMS.forEach(p => { v[p.id] = p.def })
  return v
}

// Czy ustawienie zalicza ćwiczenie (wymagana liczba kolejnych cykli, ten sam silnik co w symulatorze).
function passes(key, values, overrides) {
  const ex = EXERCISES[key]
  const cycles = Math.max(3, ex.pass?.requiredStableCycles || 1)
  for (let c = 1; c <= cycles; c++) {
    const v = { ...values, _cycleIndex: c }
    if (!evaluateCycle(DEFECTS, ex.id, v, ex.machine, ex.pass, ex).passed) return false
  }
  return rootWindowCheck(key, ex, values, overrides)
}

// Zakres parametru-przyczyny, który zalicza (pozostałe nastawy = wartości startowe).
function passWindow(key, overrides, withAdmin) {
  const ex = EXERCISES[key]
  const p = ALL_PARAMS.find(x => x.id === ex.rootParam)
  if (!p) return null
  const base = exerciseValues(key, defaultValues, overrides)
  const hits = []
  const ov = withAdmin ? overrides : { starts: overrides.starts, windows: {} }
  for (let x = p.min; x <= p.max + 1e-9; x += p.step) {
    const val = Number(x.toFixed(3))
    if (passes(key, { ...base, [p.id]: val }, ov)) hits.push(val)
  }
  if (!hits.length) return { text: 'brak', hits }
  return { text: `${hits[0]}–${hits[hits.length - 1]} ${p.unit}`, hits }
}

export default function AdminMatrix({ onClose, onOpenImpact, modeSwitch }) {
  const [overrides, setOverrides] = useState(loadOverrides)

  const groups = useMemo(() => Object.keys(DEFECTS)
    .map(id => ({ id, label: DEFECTS[id].label.split(/\s[–—-]\s/)[0], exercises: exercisesForWada(id) }))
    .filter(g => g.exercises.length > 0), [])
  const columns = groups.flatMap(g => g.exercises.map(e => ({ ...e, wada: g.id, ex: EXERCISES[e.key], code: e.label.split(' · ')[0] })))

  const analysis = useMemo(() => Object.fromEntries(columns.map(c => {
    const start = exerciseValues(c.key, defaultValues, overrides)
    return [c.key, {
      startOk: passes(c.key, start, overrides),
      modelWindow: passWindow(c.key, overrides, false),
      finalWindow: passWindow(c.key, overrides, true)
    }]
  })), [overrides])

  function update(next) {
    setOverrides(next)
    saveOverrides(next)
  }

  function setStart(key, id, raw) {
    const base = EXERCISES[key].start?.[id] ?? ALL_PARAMS.find(p => p.id === id).def
    const starts = { ...overrides.starts, [key]: { ...(overrides.starts[key] || {}) } }
    if (raw === '' || Number(raw) === Number(base)) delete starts[key][id]
    else starts[key][id] = Number(raw)
    if (!Object.keys(starts[key]).length) delete starts[key]
    update({ ...overrides, starts })
  }

  function setWindow(key, field, raw) {
    const windows = { ...overrides.windows, [key]: { ...(overrides.windows[key] || {}), [field]: raw } }
    if (windows[key].min === '' && windows[key].max === '') delete windows[key]
    update({ ...overrides, windows })
  }

  function resetColumn(key) {
    const starts = { ...overrides.starts }; delete starts[key]
    const windows = { ...overrides.windows }; delete windows[key]
    update({ starts, windows })
  }

  function resetAll() {
    if (!window.confirm('Przywrócić wszystkie wartości domyślne ćwiczeń?')) return
    update({ starts: {}, windows: {} })
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
          <span className="c-muted">Macierz parametrów – wartości startowe i okna zaliczenia. Zmiany zapisują się w tej przeglądarce.</span>
        </div>
        <button type="button" className="c-btn c-btn--ghost" onClick={onOpenImpact}>Panel wpływu wad</button>
        <button type="button" className="c-btn c-btn--ghost" onClick={resetAll}>↺ Przywróć wszystko</button>
        <button type="button" className="c-btn c-btn--primary" onClick={onClose}>Zamknij</button>
      </header>

      <main className="c-main">
        <section className="c-card">
          <div className="c-card-head">
            <div>
              <h2>Macierz parametrów</h2>
              <span className="c-card-sub mono">
                ZIELONA RAMKA = PARAMETR-PRZYCZYNA · ŻÓŁTE POLE = WARTOŚĆ ZMIENIONA PRZEZ ADMINISTRATORA
              </span>
            </div>
          </div>

          <div className="a-wrap">
            <table className="a-matrix mono">
              <thead>
                <tr>
                  <th className="a-sticky" rowSpan={2}>Parametr</th>
                  {groups.map(g => <th key={g.id} colSpan={g.exercises.length} className="a-group">{g.label}</th>)}
                </tr>
                <tr>
                  {columns.map(c => <th key={c.key} className="a-col">{c.code}</th>)}
                </tr>
              </thead>
              <tbody>
                {ALL_PARAMS.map(p => (
                  <tr key={p.id}>
                    <td className="a-sticky">
                      <strong>{p.id}</strong> <span className="c-muted">{LABELS[p.id] || p.label.replace(/^\w+ – /, '')}</span>
                      <small className="c-muted"> [{p.unit}]</small>
                    </td>
                    {columns.map(c => {
                      const changed = overrides.starts[c.key]?.[p.id] !== undefined
                      const value = exerciseValues(c.key, defaultValues, overrides)[p.id]
                      const isRoot = c.ex.rootParam === p.id
                      return (
                        <td key={c.key} className={`${isRoot ? 'a-root' : ''} ${changed ? 'a-changed' : ''}`}>
                          <input type="number" min={p.min} max={p.max} step={p.step} value={value}
                            aria-label={`${c.code} ${p.id}`}
                            onChange={e => setStart(c.key, p.id, e.target.value)} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="a-sticky">Parametr-przyczyna</td>
                  {columns.map(c => <td key={c.key} className="a-root-name">{c.ex.rootParam}</td>)}
                </tr>
                <tr>
                  <td className="a-sticky">Okno zaliczenia – model</td>
                  {columns.map(c => <td key={c.key}>{analysis[c.key].modelWindow?.text}</td>)}
                </tr>
                <tr>
                  <td className="a-sticky">Okno administratora (min / max)</td>
                  {columns.map(c => {
                    const w = overrides.windows[c.key] || {}
                    return (
                      <td key={c.key} className="a-window">
                        <input type="number" placeholder="min" value={w.min ?? ''} aria-label={`${c.code} okno min`}
                          onChange={e => setWindow(c.key, 'min', e.target.value)} />
                        <input type="number" placeholder="max" value={w.max ?? ''} aria-label={`${c.code} okno max`}
                          onChange={e => setWindow(c.key, 'max', e.target.value)} />
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <td className="a-sticky">Zalicza faktycznie</td>
                  {columns.map(c => (
                    <td key={c.key} className={analysis[c.key].finalWindow?.hits.length ? 'a-ok' : 'a-ng'}>
                      {analysis[c.key].finalWindow?.text}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="a-sticky">Stan startowy</td>
                  {columns.map(c => (
                    <td key={c.key} className={analysis[c.key].startOk ? 'a-ng' : 'a-ok'}>
                      {analysis[c.key].startOk ? '⚠ zalicza bez korekty' : 'wada występuje ✓'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="a-sticky">Seria stabilnych cykli</td>
                  {columns.map(c => <td key={c.key}>{c.ex.pass?.requiredStableCycles || 1}</td>)}
                </tr>
                <tr>
                  <td className="a-sticky"></td>
                  {columns.map(c => (
                    <td key={c.key}>
                      <button type="button" className="a-reset" onClick={() => resetColumn(c.key)}
                        disabled={!overrides.starts[c.key] && !overrides.windows[c.key]}>Przywróć</button>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="c-note c-note--hint">
            <strong>Jak to działa</strong>
            <ul>
              <li>Wartości startowe: nastawy, od których kursant zaczyna ćwiczenie. Zmiana działa od następnego otwarcia ćwiczenia.</li>
              <li>Okno zaliczenia – model: zakres parametru-przyczyny, przy którym silnik daje OK (pozostałe nastawy = startowe).</li>
              <li>Okno administratora dodatkowo zawęża zaliczenie. Nie poszerza okna modelu – poza nim fizyka procesu i tak daje NG.</li>
              <li>Stan startowy musi pokazywać wadę; „zalicza bez korekty” oznacza, że ćwiczenie jest rozwiązane na starcie.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
