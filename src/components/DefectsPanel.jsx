import { computeResult, SUCCESS_THRESHOLD } from '../data/params.js'

function levelClass(defectPct) {
  if (defectPct <= SUCCESS_THRESHOLD) return 'ok'
  if (defectPct <= 35) return 'warn'
  return 'bad'
}

export default function DefectsPanel({ defects, values }) {
  const rows = Object.entries(defects).map(([id, d]) => {
    const { defectPct } = computeResult(defects, id, values)
    return { id, label: d.label, defectPct }
  })

  return (
    <div className="defects-panel">
      <h3>Wpływ bieżących parametrów na ryzyko wad</h3>
      <p className="sub">
        Poruszaj parametrami na schemacie – paski aktualizują się na bieżąco i pokazują,
        czy zmiana idzie w dobrą, czy w złą stronę dla każdej z wad.
      </p>
      <div className="defects-panel-list">
        {rows.map(r => (
          <div className="defect-row" key={r.id}>
            <span className="defect-row-label" title={r.label}>{r.label}</span>
            <div className="defect-row-bar-track">
              <div
                className={`defect-row-bar-fill ${levelClass(r.defectPct)}`}
                style={{ width: `${r.defectPct}%` }}
              />
            </div>
            <span className={`defect-row-pct ${levelClass(r.defectPct)}`}>{r.defectPct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
