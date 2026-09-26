import { useEffect, useRef, useState } from 'react'

// Przełącznik trybów w górnym pasku. Tryby trenera wymagają kodu administratora
// (obsługa kodu w App – onSelect dostaje identyfikator widoku).
export const MODES = [
  { view: 'sim', label: 'Tryb szkoleniowy', locked: false },
  { view: 'impact', label: 'Panel wpływu wad', locked: true },
  { view: 'adminMatrix', label: 'Administrator – macierz parametrów', locked: true }
]

const SHORT = { sim: ['TRYB', 'SZKOLENIOWY'], impact: ['PANEL', 'WPŁYWU WAD'], adminMatrix: ['TRYB', 'ADMINISTRATORA'] }

export default function ModeSwitch({ current, onSelect, unlocked, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const [a, b] = SHORT[current] || SHORT.sim
  return (
    <div className="c-mode" ref={ref}>
      <button type="button" className={`c-chip c-mode-btn mono ${current === 'sim' ? 'c-chip--mode' : 'c-chip--admin'}`}
        onClick={() => setOpen(o => !o)} disabled={disabled} aria-haspopup="menu" aria-expanded={open}>
        <span>{a}<br />{b}</span><span className="c-mode-caret">▾</span>
      </button>
      {open && (
        <div className="c-mode-menu" role="menu">
          {MODES.map(m => (
            <button key={m.view} type="button" role="menuitem"
              className={`c-mode-item ${m.view === current ? 'is-active' : ''}`}
              onClick={() => { setOpen(false); if (m.view !== current) onSelect(m.view) }}>
              <span>{m.label}</span>
              {m.locked && <span className="c-mode-lock mono">{unlocked ? 'odblokowany' : '🔒 kod'}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
