// Pole nastawy w stylu panelu maszyny: etykieta, wartość zadana, jednostka i przyciski ±.
function decimals(step) {
  const s = String(step)
  return s.includes('.') ? s.split('.')[1].length : 0
}

export function stepValue(param, value, dir) {
  const d = decimals(param.step)
  const next = (Number(value) || 0) + dir * param.step
  const clamped = Math.min(param.max, Math.max(param.min, next))
  return Number(clamped.toFixed(d))
}

export default function ParamStepper({ param, label, value, onChange, disabled, compact }) {
  return (
    <div className={`pstep ${compact ? 'pstep--compact' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <div className="pstep-head">
        <span className="pstep-label">{label}</span>
        <span className="pstep-sym">{param.id}</span>
      </div>
      <div className="pstep-body">
        <input
          className="pstep-input"
          type="number"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={e => onChange(param.id, e.target.value)}
        />
        <span className="pstep-unit">{param.unit}</span>
        <div className="pstep-btns">
          <button type="button" disabled={disabled} aria-label={`${label} −`}
            onClick={() => onChange(param.id, stepValue(param, value, -1))}>−</button>
          <button type="button" disabled={disabled} aria-label={`${label} +`}
            onClick={() => onChange(param.id, stepValue(param, value, +1))}>+</button>
        </div>
      </div>
    </div>
  )
}
