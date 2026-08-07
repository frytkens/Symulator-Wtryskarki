export default function ParamField({ param, value, onChange }) {
  return (
    <div
      className={`field ${param.active ? 'active' : 'inactive'}`}
      style={{ left: param.x + '%', top: param.y + '%' }}
    >
      <input
        type="number"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        title={`${param.label} (${param.min}–${param.max} ${param.unit})`}
        onChange={(e) => onChange(param.id, e.target.value)}
      />
    </div>
  )
}
