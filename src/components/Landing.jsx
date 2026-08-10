export default function Landing({ defects, onStartTraining, onOpenPanel }) {
  const ids = Object.keys(defects)

  return (
    <div className="page landing">
      <div className="landing-header">
        <h1>Symulator wtryskarki</h1>
        <p className="sub">Wybierz wadę, którą chcesz przećwiczyć w symulatorze.</p>
      </div>

      <div className="landing-grid">
        {ids.map(id => (
          <button key={id} className="landing-card" onClick={() => onStartTraining(id)}>
            <img src={`/defects/${id}.jpg`} alt={defects[id].label} />
            <span>{defects[id].label}</span>
          </button>
        ))}
      </div>

      <button className="landing-panel-cta" onClick={() => onOpenPanel(null)}>
        <span className="landing-panel-cta-text">
          <strong>🧪 Panel wpływu wad</strong>
          <span>Zobacz wszystkie 8 wad naraz i obserwuj, jak zmiana parametrów wpływa na każdą z nich.</span>
        </span>
        <span className="landing-panel-cta-arrow">→</span>
      </button>
    </div>
  )
}
