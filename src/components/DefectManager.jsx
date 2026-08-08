import { useState, useRef } from 'react'
import { ALL_PARAMS, buildCurve, slugify } from '../data/params.js'

function emptyRow() {
  return { included: false, ok: '', weight: '', tolerance: '', badMin: '', badMax: '' }
}

function CurveSparkline({ curve, min, max }) {
  const w = 96
  const h = 30
  if (!curve || curve.length < 2) {
    return <div className="sparkline-empty">—</div>
  }
  const range = max - min || 1
  const points = curve
    .map(([x, y]) => `${((x - min) / range) * w},${h - (y / 100) * h}`)
    .join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline points={points} fill="none" stroke="#2f5fd6" strokeWidth="1.6" />
    </svg>
  )
}

export default function DefectManager({ defects, customIds, trainerNotes, onSave, onDelete, onImport, onUseInSimulator, onClose }) {
  const [label, setLabel] = useState('')
  const [rows, setRows] = useState(() => {
    const r = {}
    ALL_PARAMS.forEach(p => { r[p.id] = emptyRow() })
    return r
  })
  const [trainerNotesText, setTrainerNotesText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [editingId, setEditingId] = useState(null)
  const fileInputRef = useRef(null)

  const idPreview = slugify(label)

  function updateRow(id, patch) {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  function toggleIncluded(param) {
    setRows(prev => {
      const current = prev[param.id]
      const nextIncluded = !current.included
      return {
        ...prev,
        [param.id]: {
          ...current,
          included: nextIncluded,
          ok: nextIncluded && current.ok === '' ? String(param.def) : current.ok
        }
      }
    })
  }

  function resetForm() {
    setLabel('')
    const r = {}
    ALL_PARAMS.forEach(p => { r[p.id] = emptyRow() })
    setRows(r)
    setTrainerNotesText('')
    setEditingId(null)
  }

  function handleEditClick(id) {
    setError('')
    setSuccess('')
    const d = defects[id]
    if (!d) return
    setEditingId(id)
    setLabel(d.label)
    const r = {}
    ALL_PARAMS.forEach(p => { r[p.id] = emptyRow() })
    d.params.forEach(dp => {
      // dla wad zapisanych przed dodaniem pól ok/tolerance (starsze zapisy)
      // próbujemy odtworzyć "ok" z krzywej jako punkt o najwyższej jakości
      const inferredOk = dp.curve && dp.curve.length
        ? dp.curve.reduce((best, pt) => (pt[1] > best[1] ? pt : best), dp.curve[0])[0]
        : ''
      r[dp.id] = {
        included: true,
        ok: dp.ok !== undefined ? String(dp.ok) : String(inferredOk),
        weight: String(dp.weight),
        tolerance: dp.tolerance !== undefined ? String(dp.tolerance) : '',
        badMin: Array.isArray(dp.badRange) ? String(dp.badRange[0]) : '',
        badMax: Array.isArray(dp.badRange) ? String(dp.badRange[1]) : ''
      }
    })
    setRows(r)
    setTrainerNotesText((trainerNotes[id] || []).join('\n'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSave() {
    setError('')
    setSuccess('')

    const trimmedLabel = label.trim()
    if (!trimmedLabel) {
      setError('Podaj nazwę wady.')
      return
    }
    const id = editingId || slugify(trimmedLabel)
    if (!id) {
      setError('Nazwa musi zawierać przynajmniej jedną literę lub cyfrę.')
      return
    }
    if (!editingId && defects[id]) {
      setError(`Wada o identyfikatorze „${id}” już istnieje – zmień nazwę.`)
      return
    }
    if (editingId && !customIds.has(editingId)) {
      setError('Wady wbudowanej nie można edytować w tym miejscu.')
      return
    }

    const includedParams = ALL_PARAMS.filter(p => rows[p.id].included)
    const invalidRow = includedParams.find(p => {
      const r = rows[p.id]
      return r.ok === '' || isNaN(Number(r.ok)) || r.weight === '' || isNaN(Number(r.weight)) || Number(r.weight) <= 0
    })
    const outOfRangeRow = includedParams.find(p => {
      const r = rows[p.id]
      if (r.ok === '' || isNaN(Number(r.ok))) return false
      const v = Number(r.ok)
      return v < p.min || v > p.max
    })
    const badRangeInvalidRow = includedParams.find(p => {
      const r = rows[p.id]
      if (r.badMin === '' && r.badMax === '') return false
      if (r.badMin === '' || r.badMax === '') return true
      const lo = Number(r.badMin), hi = Number(r.badMax)
      if (isNaN(lo) || isNaN(hi) || lo >= hi) return true
      if (lo < p.min || hi > p.max) return true
      return false
    })
    if (includedParams.length === 0) {
      setError('Wybierz przynajmniej jeden parametr i ustaw dla niego wagę > 0.')
      return
    }
    if (invalidRow) {
      setError(`Uzupełnij poprawnie „wartość ok” i „wagę” (> 0) dla parametru ${invalidRow.id}.`)
      return
    }
    if (outOfRangeRow) {
      setError(`Wartość ok dla ${outOfRangeRow.id} musi być w zakresie ${outOfRangeRow.min}–${outOfRangeRow.max}.`)
      return
    }
    if (badRangeInvalidRow) {
      setError(`Zakres losowania startowego dla ${badRangeInvalidRow.id} musi mieć oba pola wypełnione, min < max, i mieścić się w ${badRangeInvalidRow.min}–${badRangeInvalidRow.max}.`)
      return
    }

    const defectParams = includedParams.map(p => {
      const r = rows[p.id]
      const tolerance = r.tolerance === '' ? undefined : Number(r.tolerance)
      const badRange = r.badMin !== '' && r.badMax !== '' ? [Number(r.badMin), Number(r.badMax)] : undefined
      return {
        id: p.id,
        weight: Number(r.weight),
        ok: Number(r.ok),
        tolerance,
        curve: buildCurve(Number(r.ok), p.min, p.max, tolerance),
        ...(badRange ? { badRange } : {})
      }
    })

    const trainerNotes = trainerNotesText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    const wasEditing = Boolean(editingId)
    onSave(id, { label: trimmedLabel, params: defectParams }, trainerNotes)
    setSuccess(wasEditing ? `Zapisano zmiany w wadzie „${trimmedLabel}”.` : `Zapisano wadę „${trimmedLabel}”. Jest już dostępna w symulatorze.`)
    resetForm()
  }

  const grouped = ALL_PARAMS.reduce((acc, p) => {
    (acc[p.group] = acc[p.group] || []).push(p)
    return acc
  }, {})

  function handleExport() {
    const exportDefects = {}
    const exportNotes = {}
    customIds.forEach(id => {
      exportDefects[id] = defects[id]
      if (trainerNotes[id]) exportNotes[id] = trainerNotes[id]
    })
    const payload = { defects: exportDefects, trainerNotes: exportNotes }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wady-symulator.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    setImportMsg('')
    fileInputRef.current?.click()
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // pozwala wgrać ten sam plik ponownie
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const incomingDefects = parsed.defects || {}
        const incomingNotes = parsed.trainerNotes || {}
        const ids = Object.keys(incomingDefects)
        if (ids.length === 0) {
          setImportMsg('Plik nie zawiera żadnych wad.')
          return
        }
        const { addedCount, skipped } = onImport(incomingDefects, incomingNotes)
        const parts = [`Zaimportowano ${addedCount} z ${ids.length}.`]
        if (skipped.length > 0) parts.push(`Pominięto (identyfikator już istnieje): ${skipped.join(', ')}.`)
        setImportMsg(parts.join(' '))
      } catch (err) {
        setImportMsg('Nie udało się wczytać pliku – sprawdź, czy to poprawny JSON wyeksportowany z tego narzędzia.')
      }
    }
    reader.readAsText(file)
  }

  function handleDeleteClick(id, deleteLabel) {
    if (window.confirm(`Usunąć wadę „${deleteLabel}”? Tej operacji nie można cofnąć.`)) {
      onDelete(id)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Zarządzanie wadami</h1>
        <button className="btn" onClick={onClose}>← wróć do symulatora</button>
      </div>
      <p className="sub">
        Dodaj nową wadę: wybierz z listy parametry, które na nią wpływają, podaj ich wartość „ok” i wagę wpływu.
        Reszta (kształt krzywej jakości) generowana jest automatycznie.
      </p>

      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Istniejące wady</h3>
            <div className="admin-card-actions">
              <button className="btn small" onClick={handleExport} disabled={customIds.size === 0}>
                ⬇ eksportuj
              </button>
              <button className="btn small" onClick={handleImportClick}>⬆ importuj</button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </div>
          </div>
          {importMsg && <p className="import-msg">{importMsg}</p>}
          <ul className="defect-list">
            {Object.entries(defects).map(([id, d]) => (
              <li key={id} className="defect-list-item">
                <div>
                  <span className="defect-list-label">{d.label}</span>
                  <span className="defect-list-meta">{d.params.length} param. · {customIds.has(id) ? 'własna' : 'wbudowana'}</span>
                </div>
                <div className="defect-list-actions">
                  <button className="btn small" onClick={() => onUseInSimulator(id)}>użyj</button>
                  {customIds.has(id) && (
                    <button className="btn small" onClick={() => handleEditClick(id)}>edytuj</button>
                  )}
                  {customIds.has(id) && (
                    <button className="btn small danger" onClick={() => handleDeleteClick(id, d.label)}>usuń</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <h3>{editingId ? `Edytuj wadę „${label}”` : 'Dodaj nową wadę'}</h3>

          <label className="form-label">Nazwa wady</label>
          <input
            className="form-input"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="np. Rysy powierzchniowe"
          />
          {label.trim() && (
            <p className="id-preview">
              identyfikator: <code>{editingId || idPreview}</code>
              {editingId ? ' (edycja — identyfikator jest zablokowany)' : ''}
            </p>
          )}

          <label className="form-label" style={{ marginTop: 16 }}>Parametry i ich wartość „ok”</label>

          {Object.entries(grouped).map(([groupName, params]) => (
            <div key={groupName} className="param-group">
              <div className="param-group-title">{groupName}</div>
              <div className="param-table">
                <div className="param-table-head">
                  <span></span>
                  <span>Parametr</span>
                  <span>Wartość ok</span>
                  <span>Waga</span>
                  <span>Tolerancja (opc.)</span>
                  <span>Zakres losowania startowego (opc.)</span>
                  <span>Podgląd</span>
                </div>
                {params.map(p => {
                  const row = rows[p.id]
                  const okNum = Number(row.ok)
                  const tolNum = row.tolerance === '' ? undefined : Number(row.tolerance)
                  const previewCurve = row.included && row.ok !== '' && !isNaN(okNum)
                    ? buildCurve(okNum, p.min, p.max, tolNum)
                    : null
                  return (
                    <div className={`param-table-row ${row.included ? 'is-on' : ''}`} key={p.id}>
                      <input
                        type="checkbox"
                        checked={row.included}
                        onChange={() => toggleIncluded(p)}
                      />
                      <span className="param-name">{p.label} <span className="param-unit">({p.unit}, {p.min}–{p.max})</span></span>
                      <input
                        type="number"
                        className="form-input small"
                        disabled={!row.included}
                        value={row.ok}
                        onChange={e => updateRow(p.id, { ok: e.target.value })}
                        placeholder={String(p.def)}
                      />
                      <input
                        type="number"
                        className="form-input small"
                        disabled={!row.included}
                        value={row.weight}
                        onChange={e => updateRow(p.id, { weight: e.target.value })}
                        placeholder="np. 10"
                      />
                      <input
                        type="number"
                        className="form-input small"
                        disabled={!row.included}
                        value={row.tolerance}
                        onChange={e => updateRow(p.id, { tolerance: e.target.value })}
                        placeholder="auto"
                      />
                      <span style={{ display: 'flex', gap: 4 }}>
                        <input
                          type="number"
                          className="form-input small"
                          disabled={!row.included}
                          value={row.badMin}
                          onChange={e => updateRow(p.id, { badMin: e.target.value })}
                          placeholder="od"
                        />
                        <input
                          type="number"
                          className="form-input small"
                          disabled={!row.included}
                          value={row.badMax}
                          onChange={e => updateRow(p.id, { badMax: e.target.value })}
                          placeholder="do"
                        />
                      </span>
                      <CurveSparkline curve={previewCurve} min={p.min} max={p.max} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <label className="form-label" style={{ marginTop: 16 }}>
            Do omówienia z trenerem (opcjonalnie, jedna pozycja na linię)
          </label>
          <textarea
            className="form-input"
            rows={4}
            value={trainerNotesText}
            onChange={e => setTrainerNotesText(e.target.value)}
            placeholder={'Sprawdź...\nSprawdź...'}
          />

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <button className="btn primary" style={{ marginTop: 16 }} onClick={handleSave}>
            {editingId ? 'Zapisz zmiany' : 'Zapisz wadę'}
          </button>
          {editingId && (
            <button className="btn" style={{ marginTop: 16, marginLeft: 8 }} onClick={resetForm}>
              Anuluj edycję
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
