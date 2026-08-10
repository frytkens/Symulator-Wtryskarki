import { useState } from 'react'

export default function Landing({ defects, onStartTraining, onOpenPanel }) {
  const [selected, setSelected] = useState(null)

  const ids = Object.keys(defects)

  if (selected && defects[selected]) {
    const d = defects[selected]
    return (
      <div className="page landing">
        <button className="btn" onClick={() => setSelected(null)}>← wróć do wyboru wady</button>

        <div className="landing-detail">
          <img src={`/defects/${selected}.jpg`} alt={d.label} className="landing-detail-photo" />
          <h2>{d.label}</h2>
          <p className="sub">Co chcesz teraz zrobić z tą wadą?</p>

          <div className="landing-detail-actions">
            <button className="btn primary big" onClick={() => onStartTraining(selected)}>
              🎯 Rozwiąż w symulatorze
            </button>
            <button className="btn big" onClick={() => onOpenPanel(selected)}>
              🧪 Zobacz w panelu wpływu wad
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page landing">
      <div className="landing-header">
        <h1>Symulator wtryskarki</h1>
        <p className="sub">Wybierz wadę, którą chcesz przećwiczyć lub przeanalizować.</p>
      </div>

      <div className="landing-grid">
        {ids.map(id => (
          <button key={id} className="landing-card" onClick={() => setSelected(id)}>
            <img src={`/defects/${id}.jpg`} alt={defects[id].label} />
            <span>{defects[id].label}</span>
          </button>
        ))}
      </div>

      <button className="btn" style={{ marginTop: 20 }} onClick={() => onOpenPanel(null)}>
        🧪 Otwórz panel wpływu wad (wszystkie naraz)
      </button>
    </div>
  )
}
