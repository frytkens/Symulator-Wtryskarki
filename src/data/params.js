export const PARAMS = [
  { id: 'T1',  label: 'T1 – dysza',              x: 8.9,  y: 12.0, min: 0,   max: 350,  step: 5,    unit: '°C',  def: 220, active: true, weight: 0.15 },
  { id: 'T2',  label: 'T2',                       x: 19.1, y: 8.0,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 230 },
  { id: 'T3',  label: 'T3',                       x: 31.1, y: 9.5,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 235 },
  { id: 'T4',  label: 'T4',                       x: 43.1, y: 8.0,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 240 },
  { id: 'T5',  label: 'T5',                       x: 55.0, y: 9.5,  min: 0,   max: 350,  step: 5,    unit: '°C',  def: 245 },
  { id: 'TR',  label: 'TR – trawersa',            x: 71.4, y: 8.5,  min: 0,   max: 130,  step: 2,    unit: '°C',  def: 60  },

  { id: 'Td',  label: 'Td – czas docisku',        x: 8.4,  y: 85.0, min: 0,   max: 30,   step: 0.5,  unit: 's',   def: 5   },
  { id: 'Pd',  label: 'Pd – ciśn. docisku',       x: 15.1, y: 85.0, min: 0,   max: 220,  step: 5,    unit: 'bar', def: 40  },
  { id: 'Pp',  label: 'Pp – pkt przełączenia',    x: 24.8, y: 70.0, min: 0,   max: 25,   step: 0.5,  unit: 'mm',  def: 10  },

  { id: 'Pw5', label: 'Pw5',                       x: 33.7, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw4', label: 'Pw4',                       x: 40.5, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw3', label: 'Pw3',                       x: 47.4, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw2', label: 'Pw2',                       x: 54.2, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80  },
  { id: 'Pw1', label: 'Pw1',                       x: 61.0, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'm/s', def: 80, active: true, weight: 0.25 },
  { id: 'GR',  label: 'GR – gr. ciśn. docisku',   x: 70.9, y: 85.0, min: 0,   max: 220,  step: 5,    unit: 'bar', def: 120 },

  { id: 'Deko', label: 'Deko – dekompresja',      x: 92.5, y: 85.0, min: 0,   max: 100,  step: 1,    unit: 'mm',  def: 7,  active: true, weight: 0.60 },
  { id: 'Prz',  label: 'Prz – przeciwciśn.',      x: 82.5, y: 18.0, min: 0,   max: 40,   step: 1,    unit: 'bar', def: 5  },
  { id: 'Ob',   label: 'Ob – obroty',             x: 92.4, y: 18.0, min: 0,   max: 1.2,  step: 0.05, unit: 'm/s', def: 0.6 },
  { id: 'doz',  label: 'doz – skok dozowania',    x: 85.4, y: 85.0, min: 0,   max: 150,  step: 2,    unit: 'mm',  def: 60  }
]


export const CLAMP_PARAMS = [
  { id: 'Tr', label: 'Tr – temp. strony ruchomej', x: 44.8, y: 11.4, min: 10, max: 100, step: 1, unit: '°C', def: 20 },
  { id: 'Ts', label: 'Ts – temp. strony stałej',   x: 65.5, y: 11.4, min: 10, max: 100, step: 1, unit: '°C', def: 20 },
  { id: 'Tc', label: 'Tc – czas cyklu',            x: 44.8, y: 90.0, min: 0,  max: 120, step: 1, unit: 's',  def: 30 },
  { id: 'Fz', label: 'Fz – siła zwarcia',          x: 66.7, y: 90.0, min: 0,  max: 200, step: 5, unit: 't',  def: 180 }
]

// Pełna lista parametrów obu diagramów, z etykietą grupy do widoku administracyjnego.
export const ALL_PARAMS = [
  ...PARAMS.map(p => ({ ...p, group: 'Wtryskarka' })),
  ...CLAMP_PARAMS.map(p => ({ ...p, group: 'Zamykanie' }))
]

// Zamienia nazwę wady na bezpieczny identyfikator (bez polskich znaków, spacji itp.)
export function slugify(text) {
  const map = { ą:'a', ć:'c', ę:'e', ł:'l', ń:'n', ó:'o', ś:'s', ź:'z', ż:'z' }
  return text
    .toLowerCase()
    .split('').map(ch => map[ch] || ch).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generuje krzywą jakości (0-100) w kształcie "górki" wyśrodkowanej na wartości "ok".
// tolerance = jak szybko jakość spada po bokach (w jednostkach parametru); domyślnie 12% zakresu.
export function buildCurve(target, min, max, tolerance) {
  const t = Number(target)
  const width = tolerance && tolerance > 0 ? Number(tolerance) : Math.max((max - min) * 0.12, (max - min) * 0.02 + 0.01)
  const raw = [
    [min, 15],
    [t - width * 2, 45],
    [t - width, 75],
    [t, 100],
    [t + width, 75],
    [t + width * 2, 45],
    [max, 15]
  ]
  const seen = new Set()
  return raw
    .map(([x, y]) => [Math.min(max, Math.max(min, x)), y])
    .sort((a, b) => a[0] - b[0])
    .filter(([x]) => {
      if (seen.has(x)) return false
      seen.add(x)
      return true
    })
}

export function curveVal(x, pts) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0)
      return y0 + t * (y1 - y0)
    }
  }
  return pts[pts.length - 1][1]
}

export const SUCCESS_THRESHOLD = 12 // % ryzyka, poniżej którego uznajemy sztukę za dobrą (wspólne dla wszystkich wad)

// Każda wada ma własną listę parametrów: id (musi istnieć w PARAMS/CLAMP_PARAMS),
// waga (dowolna liczba – nie musi sumować się do 100, jest normalizowana automatycznie)
// i krzywą jakości: [x, jakość 0–100] – gdzie x to wartość parametru.
export const DEFECTS = {
  niedolanie: {
    label: 'Niedolanie – nieprawidłowa praca zaworu zwrotnego',
    params: [
      {
        id: 'T1', weight: 15,
        curve: [[0,10],[100,30],[150,60],[180,85],[200,95],[220,100],[230,90],[240,80],[250,60],[260,35],[270,15],[300,5],[350,0]]
      },
      {
        id: 'Pw1', weight: 25,
        curve: [[0,10],[40,20],[80,40],[120,60],[160,85],[200,100]],
        badRange: [0, 60] // krzywa rośnie monotonicznie do 200 -> uczymy "trzeba zwiększyć"
      },
      {
        id: 'Deko', weight: 60,
        curve: [[0,20],[5,35],[7,47],[10,75],[15,100],[20,95],[25,55],[30,20],[50,10],[100,5]],
        badRange: [25, 100] // do weryfikacji: unika strefy dobrej ok. 0-20
      }
    ]
  },

  przypalenia: {
    label: 'Przypalenia – spalenia materiału na detalu',
    params: [
      {
        // start 80 mm/s (za dużo, przypala), cel ok. 5 mm/s, zbyt nisko też źle
        id: 'Pw5', weight: 10,
        curve: [[0,40],[2,70],[5,100],[10,80],[20,50],[40,25],[80,5],[120,0],[200,0]],
        badRange: [40, 120] // do weryfikacji: unika strefy dobrej ok. 0-10
      },
      {
        // redukcja siły zwarcia do ok. 150t poprawia odpowietrzenie, niżej już źle
        id: 'Fz', weight: 8,
        curve: [[0,10],[80,20],[120,45],[140,80],[150,100],[160,90],[180,60],[200,30]],
        badRange: [160, 200] // domyślne 180t już powyżej optimum -> uczymy "trzeba obniżyć"
      }
    ]
  },

  wyplywy: {
    label: 'Wypływy – nadmiar materiału na linii podziału formy',
    params: [
      {
        // standard 80 mm/s za szybko, cel ok. 20 mm/s, za wolno też źle
        id: 'Pw1', weight: 8,
        curve: [[0,20],[10,60],[20,100],[30,90],[50,60],[80,20],[120,5],[200,0]],
        badRange: [40, 120] // domyślne 80 mm/s już powyżej optimum -> uczymy "trzeba obniżyć"
      },
      {
        // zwiększenie siły zwarcia pomaga, optimum przy max 200t
        id: 'Fz', weight: 7,
        curve: [[0,10],[50,20],[100,35],[150,60],[180,85],[200,100]],
        badRange: [50, 150] // krzywa rośnie monotonicznie do 200 -> uczymy "trzeba zwiększyć"
      },
      {
        // +2mm od standardu (10) OK, dalej źle – ryzyko niedolania
        id: 'Pp', weight: 10,
        curve: [[0,20],[5,35],[8,55],[10,75],[12,100],[14,80],[16,50],[20,20],[25,5]],
        badRange: [16, 25] // do weryfikacji: unika strefy dobrej ok. 8-14
      },
      {
        // redukcja o 10 bar od standardu (40) OK, za dużo ciśnienia źle
        id: 'Pd', weight: 8,
        curve: [[0,70],[10,85],[20,95],[30,100],[40,70],[60,40],[100,15],[150,5],[220,0]],
        badRange: [50, 120] // domyślne 40 bar już powyżej optimum 30 -> uczymy "trzeba obniżyć"
      },
      {
        // redukcja T1 o 10°C od standardu (220) OK, niżej nie ok
        id: 'T1', weight: 2.5,
        curve: [[180,20],[190,40],[200,65],[210,100],[220,75],[230,50],[240,25],[250,10]]
      },
      {
        // redukcja T2 o 10°C od standardu (230) OK, niżej nie ok
        id: 'T2', weight: 2.5,
        curve: [[190,20],[200,40],[210,65],[220,100],[230,75],[240,50],[250,25],[260,10]]
      }
    ]
  }
}

export const DEFECTS_EXTRA = {
  wypaczenia: {
    label: 'Wypaczenia – odkształcenie detalu po wyjęciu z formy',
    params: [
      {
        // za krótki czas docisku -> nierównomierny skurcz -> wypaczenie
        id: 'Td', weight: 20,
        curve: [[0,20],[1,30],[2,50],[3,75],[5,100],[8,95],[15,90],[30,85]],
        badRange: [0, 3] // domyślne 5s to już optimum -> uczymy "trzeba wydłużyć"
      },
      {
        // za niskie ciśnienie docisku -> nierównomierny skurcz -> wypaczenie
        id: 'Pd', weight: 15,
        curve: [[0,20],[10,40],[20,60],[30,80],[40,100],[60,95],[100,85],[220,75]],
        badRange: [0, 20] // domyślne 40 bar to już optimum -> uczymy "trzeba zwiększyć"
      }
    ]
  },

  zapadniecia: {
    label: 'Zapadnięcia – lokalne wgłębienia na powierzchni detalu',
    params: [
      {
        // za niskie ciśnienie docisku -> materiał się kurczy -> zapadnięcie
        id: 'Pd', weight: 30,
        curve: [[0,10],[10,30],[20,55],[30,80],[40,100],[80,95],[150,90],[220,85]],
        badRange: [0, 20] // domyślne 40 bar to już optimum -> uczymy "trzeba zwiększyć"
      },
      {
        // za krótki czas docisku -> zbyt wcześnie ustaje podawanie materiału
        id: 'Td', weight: 20,
        curve: [[0,15],[1,30],[2,55],[3,80],[5,100],[10,95],[20,90]],
        badRange: [0, 2] // domyślne 5s to już optimum -> uczymy "trzeba wydłużyć"
      }
    ]
  },

  smugi: {
    label: 'Smugi srebrzyste – ślady wilgoci/degradacji na powierzchni',
    params: [
      {
        // za wysoka temp. dyszy -> degradacja termiczna materiału -> smugi
        id: 'T1', weight: 25,
        curve: [[150,60],[180,90],[200,100],[220,80],[250,50],[280,25],[320,10],[350,5]],
        badRange: [230, 350] // domyślne 220°C już powyżej optimum 200°C -> uczymy "trzeba obniżyć"
      },
      {
        // za duża prędkość wtrysku -> ścinanie i przegrzewanie materiału -> smugi
        id: 'Pw1', weight: 20,
        curve: [[0,60],[20,90],[40,100],[80,70],[120,40],[160,15],[200,5]],
        badRange: [100, 200] // domyślne 80 mm/s już powyżej optimum 40 -> uczymy "trzeba obniżyć"
      },
      {
        // za niskie przeciwciśnienie -> słabe odgazowanie/mieszanie -> uwięziona wilgoć/powietrze
        id: 'Prz', weight: 15,
        curve: [[0,10],[5,30],[10,55],[20,80],[30,100],[40,95]],
        badRange: [0, 15] // domyślne 5 bar poniżej optimum 30 -> uczymy "trzeba zwiększyć"
      }
    ]
  },

  pecherze: {
    label: 'Pęcherze – puste przestrzenie wewnątrz detalu',
    params: [
      {
        // za niskie ciśnienie docisku -> niedopełniony ubytek skurczowy -> pęcherz
        id: 'Pd', weight: 30,
        curve: [[0,10],[10,30],[20,55],[30,80],[40,100],[80,95],[150,90],[220,85]],
        badRange: [0, 20] // domyślne 40 bar to już optimum -> uczymy "trzeba zwiększyć"
      },
      {
        // za krótki czas docisku -> materiał nie zdąży wypełnić ubytku
        id: 'Td', weight: 25,
        curve: [[0,15],[1,30],[2,55],[3,80],[5,100],[10,95],[20,90]],
        badRange: [0, 2] // domyślne 5s to już optimum -> uczymy "trzeba wydłużyć"
      }
    ]
  },

  rozwarstwienia: {
    label: 'Rozwarstwienia – oddzielające się warstwy materiału',
    params: [
      {
        // za niska temp. dyszy -> słabe zgrzanie warstw materiału
        id: 'T1', weight: 20,
        curve: [[100,10],[150,30],[180,55],[200,80],[220,100],[250,90],[280,60],[320,20]],
        badRange: [100, 180] // domyślne 220°C to już optimum -> uczymy "trzeba zwiększyć"
      },
      {
        // za niska prędkość wtrysku -> słabe wymieszanie/zgrzanie strug materiału
        id: 'Pw1', weight: 15,
        curve: [[0,10],[40,20],[80,40],[120,60],[160,85],[200,100]],
        badRange: [0, 50] // krzywa rośnie monotonicznie -> uczymy "trzeba zwiększyć"
      }
    ]
  },

  linie_laczenia: {
    label: 'Linie łączenia – widoczne ślady zetknięcia strug materiału',
    params: [
      {
        // za niska temp. dyszy -> strugi zastygają zanim się połączą
        id: 'T1', weight: 20,
        curve: [[100,10],[150,30],[180,55],[200,80],[220,100],[250,90],[280,60],[320,20]],
        badRange: [100, 180] // domyślne 220°C to już optimum -> uczymy "trzeba zwiększyć"
      },
      {
        // za niska prędkość wtrysku -> strugi zastygają przed połączeniem
        id: 'Pw1', weight: 15,
        curve: [[0,10],[40,20],[80,40],[120,60],[160,85],[200,100]],
        badRange: [0, 50] // krzywa rośnie monotonicznie -> uczymy "trzeba zwiększyć"
      }
    ]
  },

  przebarwienia: {
    label: 'Przebarwienia – zmiana koloru / degradacja termiczna materiału',
    params: [
      {
        // za wysoka temp. dyszy -> przypalenie/degradacja koloru materiału
        id: 'T1', weight: 25,
        curve: [[150,80],[180,95],[210,100],[230,80],[260,50],[300,20],[350,5]],
        badRange: [230, 350] // domyślne 220°C blisko optimum, wyżej już źle -> uczymy "trzeba obniżyć"
      },
      {
        // za długi czas cyklu -> materiał zbyt długo przebywa w gorącym cylindrze
        id: 'Tc', weight: 15,
        curve: [[0,100],[20,95],[30,90],[45,70],[60,45],[90,20],[120,5]],
        badRange: [45, 120] // domyślne 30s blisko optimum, dłużej już źle -> uczymy "trzeba skrócić"
      },
      {
        // za wysoka temp. trawersy -> dodatkowe przegrzewanie materiału
        id: 'TR', weight: 10,
        curve: [[0,100],[40,95],[60,85],[80,60],[100,30],[130,10]],
        badRange: [80, 130] // domyślne 60°C blisko optimum, wyżej już źle -> uczymy "trzeba obniżyć"
      }
    ]
  }
}

export const TRAINER_NOTES_EXTRA = {
  wypaczenia: [
    'Sprawdź symetrię chłodzenia formy (temperatury Tr/Ts)',
    'Sprawdź czy detal nie jest wyjmowany za wcześnie (przed pełnym wystudzeniem)',
    'Sprawdź równomierność grubości ścianek detalu',
    'Sprawdź czy czas i ciśnienie docisku są wystarczające'
  ],
  zapadniecia: [
    'Sprawdź miejsca o większej grubości ścianki (żebra, boss-y)',
    'Sprawdź czy ciśnienie i czas docisku są wystarczające',
    'Sprawdź czy punkt przełączenia nie jest zbyt wczesny',
    'Sprawdź drożność kanału wlewowego podczas fazy docisku'
  ],
  smugi: [
    'Sprawdź czy materiał był suszony zgodnie z kartą technologiczną',
    'Sprawdź temperatury stref cylindra pod kątem przegrzania',
    'Sprawdź prędkość wtrysku w newralgicznych strefach',
    'Sprawdź poziom przeciwciśnienia (odgazowanie/mieszanie materiału)'
  ],
  pecherze: [
    'Sprawdź ciśnienie i czas fazy docisku',
    'Sprawdź czy materiał nie jest zawilgocony',
    'Sprawdź grubości ścianek w miejscu występowania pęcherzy',
    'Sprawdź drożność kanału wlewowego'
  ],
  rozwarstwienia: [
    'Sprawdź czystość i jednorodność materiału (brak zanieczyszczeń/mieszania partii)',
    'Sprawdź temperatury stref cylindra',
    'Sprawdź prędkość wtrysku',
    'Sprawdź czy nie doszło do zmiany dostawcy/partii materiału'
  ],
  linie_laczenia: [
    'Sprawdź lokalizację linii łączenia względem konstrukcji detalu',
    'Sprawdź temperatury formy i materiału',
    'Sprawdź prędkość wtrysku w miejscu łączenia strug',
    'Rozważ dodanie odpowietrzenia w miejscu łączenia'
  ],
  przebarwienia: [
    'Sprawdź temperatury stref cylindra pod kątem przegrzania',
    'Sprawdź czas przebywania materiału w cylindrze (czas cyklu vs pojemność wtrysku)',
    'Sprawdź czystość cylindra po zmianie koloru/materiału',
    'Sprawdź datę ważności i warunki przechowywania materiału/barwnika'
  ]
}

export const BUILTIN_DEFECTS_ALL = { ...DEFECTS, ...DEFECTS_EXTRA }

export const TRAINER_NOTES = {
  niedolanie: [
    'Sprawdź rodzaj zaworu zwrotnego',
    'Sprawdź płynność materiału',
    'Sprawdź sprawność zaworu zwrotnego – czy nie jest zepsuty',
    'Sprawdź szczelność dyszy',
    'Sprawdź czy nie jest rozszczelniony GK'
  ],
  // Wersja robocza – podrzuć własne punkty, jeśli chcesz je zmienić.
  przypalenia: [
    'Sprawdź drożność kanałów odpowietrzających w gnieździe formy',
    'Sprawdź stan wentylacji (venting) formy',
    'Sprawdź czy materiał nie jest zawilgocony lub zanieczyszczony',
    'Sprawdź newralgiczne miejsca formy pod kątem nadmiernej prędkości wtrysku',
    'Sprawdź szczelność zamknięcia formy'
  ],
  wyplywy: [
    'Sprawdź stan płaszczyzny podziału formy – zużycie, uszkodzenia',
    'Sprawdź siłę zwarcia względem rzutu powierzchni detalu',
    'Sprawdź czystość powierzchni podziału formy',
    'Sprawdź czy nie doszło do rozwarcia/przeciążenia formy',
    'Sprawdź kalibrację czujnika siły zwarcia'
  ]
}

export const TRAINER_NOTES_ALL = { ...TRAINER_NOTES, ...TRAINER_NOTES_EXTRA }

export function computeResult(defectsRegistry, wada, values) {
  const defectParams = defectsRegistry[wada].params
  const weightSum = defectParams.reduce((s, p) => s + p.weight, 0)
  let overall = 0
  defectParams.forEach(p => {
    const q = curveVal(Number(values[p.id]), p.curve)
    overall += q * (p.weight / weightSum)
  })
  const defectPct = Math.max(0, Math.min(100, Math.round(100 - overall)))
  return { overallQuality: overall, defectPct }
}
