// Schematyczny widok wtryskarki: jednostka zamykania, forma, dysza, cylinder
// ze strefami grzania oraz ślimak. Kolory stref i połówek formy wynikają
// z aktualnych nastaw, a ślimak porusza się podczas cyklu.

function heatColor(t, lo = 180, hi = 280) {
  const x = Math.min(1, Math.max(0, ((Number(t) || 0) - lo) / (hi - lo)))
  const hue = 55 - x * 50
  return `hsl(${hue} 85% ${38 + x * 12}%)`
}

function moldColor(t) {
  return heatColor(t, 10, 100)
}

const BANDS = [
  { id: 'T5', x: 700, w: 90 },
  { id: 'T4', x: 590, w: 90 },
  { id: 'T3', x: 480, w: 90 },
  { id: 'T2', x: 370, w: 90 }
]

export default function MachineSchematic({ values, cycling, phase }) {
  return (
    <svg className={`schematic ${cycling ? 'is-cycling' : ''} phase-${phase || 'idle'}`}
      viewBox="0 0 1000 220" role="img" aria-label="Schemat wtryskarki">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="sch-dot" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1000" height="220" fill="url(#grid)" />

      {/* jednostka zamykania */}
      <rect x="20" y="92" width="70" height="36" rx="3" className="sch-metal" />
      <g className="sch-clamp">
        <rect x="90" y="104" width="30" height="12" className="sch-metal-dark" />
        <rect x="120" y="48" width="36" height="124" rx="3" className="sch-metal" />
        <text x="138" y="42" className="sch-label" textAnchor="middle">P. RUCHOMA</text>
        <rect x="156" y="70" width="58" height="80" rx="2" fill={moldColor(values.Tr)} className="sch-mold" />
        <text x="185" y="186" className="sch-label" textAnchor="middle">Tr {values.Tr}°C</text>
      </g>
      <line x1="120" y1="58" x2="320" y2="58" className="sch-tie" />
      <line x1="120" y1="162" x2="320" y2="162" className="sch-tie" />
      <rect x="216" y="70" width="58" height="80" rx="2" fill={moldColor(values.Ts)} className="sch-mold" />
      <text x="245" y="186" className="sch-label" textAnchor="middle">Ts {values.Ts}°C</text>
      <rect x="274" y="48" width="36" height="124" rx="3" className="sch-metal" />
      <text x="292" y="42" className="sch-label" textAnchor="middle">P. STAŁA</text>
      <line x1="215" y1="64" x2="215" y2="156" className="sch-parting" />

      {/* dysza */}
      <path d="M310 104 L336 100 L336 120 L310 116 Z" className="sch-metal" />
      <rect x="318" y="98" width="18" height="24" rx="2" fill={heatColor(values.T1)} className="sch-band" />
      <text x="327" y="92" className="sch-label" textAnchor="middle">T1</text>

      {/* cylinder */}
      <rect x="336" y="94" width="480" height="32" rx="4" className="sch-barrel" />
      <g className="sch-screw">
        <rect x="350" y="104" width="470" height="12" rx="3" className="sch-screw-body" />
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={i} x1={360 + i * 20} y1="103" x2={372 + i * 20} y2="117" className="sch-flight" />
        ))}
      </g>
      {BANDS.map(b => (
        <g key={b.id}>
          <rect x={b.x} y="90" width={b.w} height="40" rx="3" fill={heatColor(values[b.id])} className="sch-band" />
          <text x={b.x + b.w / 2} y="84" className="sch-label" textAnchor="middle">{b.id}</text>
        </g>
      ))}

      {/* lej zasypowy */}
      <path d="M800 90 L786 40 L850 40 L836 90 Z" className="sch-hopper" />
      <text x="818" y="32" className="sch-label" textAnchor="middle">TR {values.TR}°C</text>

      {/* napęd */}
      <rect x="850" y="84" width="130" height="52" rx="4" className="sch-metal" />
      <circle cx="915" cy="110" r="12" className="sch-metal-dark" />
      <text x="915" y="156" className="sch-label" textAnchor="middle">NAPĘD / DOZOWANIE</text>
    </svg>
  )
}
