import { useRef } from 'react'
import { stepValue } from './ParamStepper.jsx'

// Słupek prędkości przeciągany myszą (lub palcem) w pionie; strzałki ↑/↓ zmieniają o krok.
export default function SpeedBar({ param, value, label, onChange, disabled }) {
  const ref = useRef(null)
  const v = Number(value) || 0
  const pct = Math.max(0, Math.min(100, (v - param.min) / (param.max - param.min) * 100))

  function valueAt(clientY) {
    const rect = ref.current.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height))
    const raw = param.min + ratio * (param.max - param.min)
    return Math.min(param.max, Math.max(param.min, Math.round(raw / param.step) * param.step))
  }

  function handlePointerDown(e) {
    if (disabled) return
    e.preventDefault()
    ref.current.setPointerCapture(e.pointerId)
    onChange(param.id, valueAt(e.clientY))
  }

  function handlePointerMove(e) {
    if (disabled || !ref.current.hasPointerCapture(e.pointerId)) return
    const next = valueAt(e.clientY)
    if (next !== v) onChange(param.id, next)
  }

  function handleKeyDown(e) {
    if (disabled) return
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); onChange(param.id, stepValue(param, v, +1)) }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); onChange(param.id, stepValue(param, v, -1)) }
  }

  return (
    <div
      ref={ref}
      className={`c-profile-bar ${disabled ? 'is-disabled' : ''}`}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={param.min}
      aria-valuemax={param.max}
      aria-valuenow={v}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    >
      <div className="c-profile-fill" style={{ height: `${Math.max(2, pct)}%` }}>
        <span className="c-profile-grip" />
      </div>
    </div>
  )
}
