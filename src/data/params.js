// =============================================================
// 1. PARAMETRY – pozycje na schematach (x/y w %), zakresy suwaków
// =============================================================
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
// Używane przez DefectManager przy tworzeniu własnych (nie wbudowanych) wad.
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

export const SUCCESS_THRESHOLD  = 12  // % ryzyka wady docelowej, poniżej którego uznajemy sztukę za dobrą
export const OTHERS_THRESHOLD   = 40  // % maks. ryzyka wad pobocznych
export const CUSHION_MIN        = 5   // mm
export const CUSHION_PENALTY    = 30  // pkt ryzyka przy poduszce < 5 mm
export const WARN_THRESHOLD     = 35  // próg żółty w DefectsPanel

// -------------------------------------------------------------
// 2. MASZYNA I FIZYKA PROCESU
// -------------------------------------------------------------
export const MACHINE = { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 }

// profil wagowy stref cylindra przy liczeniu temperatury masy – strefa bliżej dyszy ma większy wpływ
const MELT_WEIGHTS = { T1: 0.34, T2: 0.24, T3: 0.19, T4: 0.14, T5: 0.09 }

// temperatura masy = ważony profil cylindra + przyrost od ścinania (przeciwciśnienie, obroty)
export function meltTemp(values) {
  let sum = 0
  let wsum = 0
  Object.entries(MELT_WEIGHTS).forEach(([id, w]) => {
    sum += (Number(values[id]) || 0) * w
    wsum += w
  })
  const profile = wsum > 0 ? sum / wsum : 0
  const shear = 0.35 * (Number(values.Prz) || 0) + 12 * (Number(values.Ob) || 0)
  return { profile, shear, Tm: profile + shear }
}

function screwAreaCm2(m) {
  const r = m.D / 20 // mm -> cm
  return Math.PI * r * r
}

// droga wtrysku potrzebna do napełnienia gniazda [mm] = objętość detalu / pole przekroju ślimaka
export function fillStroke(m = MACHINE) {
  return (m.Vpart / screwAreaCm2(m)) * 10 // cm -> mm
}

// poduszka = droga faktycznie dostępna na napełnianie (doz - Pp) minus droga potrzebna na detal
export function cushion(values, m = MACHINE) {
  const doz = Number(values.doz) || 0
  const pp = Number(values.Pp) || 0
  const need = fillStroke(m)
  const available = Math.max(0, doz - pp)
  const raw = Math.round((available - need) * 10) / 10
  return { raw, cushion: Math.max(0, raw), need, available }
}

// wartość "wirtualnego" parametru używanego przez model wad (Tm, cushion) albo zwykłego suwaka
export function paramValue(id, values, m = MACHINE) {
  if (id === 'Tm') return meltTemp(values).Tm
  if (id === 'cushion') return cushion(values, m).raw
  return Number(values[id])
}

// jakość [0-100] dla danego parametru wady; obsługuje trzy formaty:
//  - legacy: { curve: [[x,y], ...] }               (własne wady z DefectManager)
//  - okno:   { type:'window', lo, hi, k }           (oba kierunki szkodzą)
//  - kierunkowy: { dir:+1/-1, x50, k }              (logistyczne przejście wokół x50)
export function quality(p, x) {
  if (p.curve) return curveVal(x, p.curve)
  if (p.type === 'window') {
    const { lo, hi, k } = p
    if (x < lo) return 100 / (1 + Math.exp((lo - x) / k))
    if (x > hi) return 100 / (1 + Math.exp((x - hi) / k))
    return 100
  }
  const { x50, k, dir } = p
  const z = dir >= 0 ? (x - x50) / k : (x50 - x) / k
  return 100 / (1 + Math.exp(-z))
}

// podsumowanie fizyczne bieżącego cyklu (na razie tylko poduszka – rozszerzalne)
export function computeProcessSummary(values, m = MACHINE) {
  return cushion(values, m)
}

// wartości startowe = wartości domyślne wszystkich parametrów
export function defaultValues() {
  const v = {}
  ALL_PARAMS.forEach(p => { v[p.id] = p.def })
  return v
}

// -------------------------------------------------------------
// 3. WADY – model tendencyjny
//    dir: +1 = zwiększenie parametru naprawia wadę
//         -1 = zmniejszenie parametru naprawia wadę
//    x50: wartość, przy której wada jest w połowie naprawiona
//    k:   szerokość przejścia (im mniejsze, tym ostrzej)
//    type:'window' = oba kierunki szkodzą (rzadki wyjątek)
//    cushionSensitive: reguła twarda +30 pkt przy poduszce < 5 mm
//    Źródło kierunków: ENGEL PPS "Process Plastic Surface".
// -------------------------------------------------------------
export const DEFECTS = {
  niedolanie: {
    label: 'Niedolanie – detal niecałkowicie wypełniony',
    cushionSensitive: true,
    params: [
      { id: 'doz', weight: 40, dir: +1, x50: 55,  k: 5,   note: 'Za mała dawka = fizycznie brak materiału' },
      { id: 'Pw1', weight: 35, dir: +1, x50: 80,  k: 18,  note: 'Wolniej = strumień stygnie w drodze' },
      { id: 'Pp',  weight: 30, dir: -1, x50: 11,  k: 2.3, note: 'Przełączenie za wcześnie = wtrysk oddaje robotę dociskowi' },
      { id: 'Tm',  weight: 25, dir: +1, x50: 238, k: 9,   note: 'Niższa lepkość = dalej płynie (cały profil, nie sama dysza)' },
      { id: 'Tr',  weight: 25, dir: +1, x50: 40,  k: 7,   note: 'Cieńsza warstwa zamrożona = większy przekrój przepływu' }
    ]
  },

  przypalenia: {
    label: 'Przypalenia – efekt diesla',
    params: [
      { id: 'Pw5', weight: 30, dir: -1, x50: 20,  k: 8,  note: 'Sprężone powietrze w końcowej fazie napełniania' },
      { id: 'Tm',  weight: 30, dir: -1, x50: 270, k: 12, note: 'Degradacja termiczna' },
      { id: 'Fz',  weight: 20, dir: -1, x50: 185, k: 12, note: 'Przepakowana forma = zgniecione odpowietrzenie' },
      { id: 'Prz', weight: 20, dir: -1, x50: 28,  k: 8,  note: 'Nadmierne ścinanie przy dozowaniu' }
    ]
  },

  wyplywy: {
    label: 'Wypływy – przetryśnięte detale na linii podziału',
    params: [
      { id: 'Fz',  weight: 30, dir: +1, x50: 160, k: 18, note: 'Za mała siła zwarcia' },
      { id: 'Pd',  weight: 20, dir: -1, x50: 95,  k: 25, note: 'Przepakowanie gniazda' },
      { id: 'Pp',  weight: 20, dir: +1, x50: 8,   k: 6,  note: 'Późne przełączenie = piki ciśnienia' },
      { id: 'Pw1', weight: 15, dir: -1, x50: 130, k: 30, note: 'Przetrysk w okolicy punktu wtrysku' },
      { id: 'Tm',  weight: 10, dir: -1, x50: 260, k: 15, note: 'Niższa lepkość wchodzi w szczelinę podziału' },
      { id: 'Tr',  weight: 5,  dir: -1, x50: 60,  k: 15, note: 'Cieplejsza forma = łatwiejszy wypływ' }
    ]
  },

  zapadniecia: {
    label: 'Zapadnięcia – wciągi na powierzchni',
    cushionSensitive: true,
    params: [
      { id: 'Pd', weight: 40, dir: +1, x50: 65,  k: 20,  note: 'Docisk kompensuje skurcz objętościowy' },
      { id: 'Td', weight: 30, dir: +1, x50: 4.5, k: 1.5, note: 'Docisk musi trwać do zamrożenia przewężki' },
      { id: 'Pp', weight: 15, dir: -1, x50: 12,  k: 4,   note: 'Zbyt wczesne przełączenie = luka ciśnienia przed dociskiem' },
      { id: 'Tr', weight: 15, dir: -1, x50: 65,  k: 15,  note: 'Gorąca forma = wolniejsze krzepnięcie = głębsze wciągi' }
    ]
  },

  pecherze: {
    label: 'Pęcherze / jamy skurczowe – puste przestrzenie wewnątrz detalu',
    cushionSensitive: true,
    params: [
      // UWAGA DYDAKTYCZNA: x50 wyższe niż przy zapadach.
      // Jamy skurczowe w rdzeniu wymagają WIĘCEJ docisku i DŁUŻEJ niż wciąg powierzchniowy.
      // To jedyna liczba, która merytorycznie rozdziela te dwie wady.
      { id: 'Pd', weight: 40, dir: +1, x50: 75,  k: 20,  note: 'Jama w rdzeniu = trzeba dopchać głębiej niż przy wciągu' },
      { id: 'Td', weight: 35, dir: +1, x50: 6.0, k: 2.0, note: 'Grubościenny obszar krzepnie dłużej' },
      { id: 'Tr', weight: 15, dir: -1, x50: 60,  k: 15,  note: 'Wolniejsze chłodzenie rdzenia = większa jama' },
      { id: 'Tm', weight: 10, dir: -1, x50: 275, k: 15,  note: 'Przegrzany materiał = większy skurcz objętościowy' }
    ]
  },

  rozwarstwienia: {
    label: 'Rozwarstwienia – oddzielające się warstwy materiału',
    params: [
      { id: 'Pw1', weight: 55, dir: -1, x50: 95, k: 30, note: 'Wysokie naprężenia poprzeczne przy szybkim wtrysku (PPS)' },
      // OKNO – jedyny prawdziwy przypadek w tej wadzie.
      // PPS wprost: "temperatura masy bardzo wysoka LUB bardzo niska".
      { id: 'Tm', weight: 45, type: 'window', lo: 225, hi: 275, k: 12,
        note: 'Za zimno = niedotopione warstwy; za gorąco = degradacja i rozdzielenie' }
    ]
  },

  smugi_powietrza: {
    label: 'Smugi/haczyki powietrza – zaciągnięte powietrze na powierzchni',
    params: [
      { id: 'Prz',  weight: 35, dir: +1, x50: 9,   k: 6,  note: 'Przeciwciśnienie wypycha powietrze ze stopu' },
      { id: 'Deko', weight: 35, dir: -1, x50: 12,  k: 6,  note: 'Za duża dekompresja zasysa powietrze przez dyszę' },
      { id: 'Pw1',  weight: 20, dir: -1, x50: 115, k: 30, note: 'Szybki wtrysk zaciąga powietrze do strugi' },
      { id: 'Ob',   weight: 10, dir: -1, x50: 0.9, k: 0.2, note: 'Za wysokie obroty = napowietrzanie przy podawaniu' }
    ]
  },

  linie_laczenia: {
    label: 'Linie łączenia – widoczne karby w miejscu spotkania strug',
    params: [
      { id: 'Tm',  weight: 35, dir: +1, x50: 245, k: 12, note: 'Cieplejsze czoła strug lepiej się zgrzewają' },
      { id: 'Tr',  weight: 30, dir: +1, x50: 50,  k: 12, note: 'Ciepła forma = czoła strug nie zdążą zamarznąć' },
      { id: 'Pd',  weight: 20, dir: +1, x50: 90,  k: 30, note: 'Docisk zaciska obszar łączenia' },
      // PPS podaje "zmienić prędkość wtrysku" BEZ kierunku - świadomie okno,
      // do zweryfikowania z technologiem na konkretnym detalu.
      { id: 'Pw1', weight: 15, type: 'window', lo: 60, hi: 140, k: 20,
        note: 'Za wolno = zimne czoła; za szybko = zamknięte powietrze w linii' }
    ]
  }
}

// -------------------------------------------------------------
// 4. NOTATKI TRENERA (checklista mechaniczna – to, czego nastawą nie naprawisz)
// -------------------------------------------------------------
export const TRAINER_NOTES = {
  niedolanie: [
    'Sprawdź poduszkę: min. 5 mm i STABILNA cykl po cyklu',
    'Poduszka skacze → zawór zwrotny / cylinder, nie nastawy',
    'Sprawdź odpowietrzenie formy',
    'Sprawdź czy nie osiągamy granicznego ciśnienia wtrysku (GR)',
    'Sprawdź punkt przełączenia – czy nie jest zbyt wczesny',
    'Sprawdź temperaturę formy – najczęściej pomijany parametr'
  ],
  przypalenia: [
    'Sprawdź czy w obszarze przypaleń jest odpowietrzenie',
    'Czy błąd pojawił się nagle w produkcji? → zabrudzone odpowietrzenia',
    'Sprawdź możliwość redukcji siły zwarcia (max ok. 20% przepakowania)',
    'Sprawdź profil prędkości – zwolnienie na końcu napełniania (Pw5)'
  ],
  wyplywy: [
    'Sprawdź stan powierzchni uszczelniających (płaszczyzna podziału)',
    'Sprawdź możliwość zwiększenia siły zwarcia',
    'Sprawdź równomierność napełniania gniazd',
    'Sprawdź czy przetrysk jest w okolicy punktu wtrysku',
    'Sprawdź ugięcie formy pod ciśnieniem'
  ],
  zapadniecia: [
    'Sprawdź długość i stabilność poduszki (min. 5 mm)',
    'Zapady przy wlewku czy z dala od niego? – inne działania naprawcze',
    'Sprawdź zawór zwrotny i cylinder',
    'Sprawdź wymiarowanie przewężki – czy nie zamarza za wcześnie'
  ],
  pecherze: [
    'Sprawdź długość i stabilność poduszki (min. 5 mm)',
    'Pęcherze w grubościennym obszarze czy z dala? – jama vs powietrze',
    'Sprawdź wilgotność materiału (suszenie!)',
    'Sprawdź wymiarowanie wlewka i przekrój detalu'
  ],
  rozwarstwienia: [
    'Czy błąd pojawił się po zmianie materiału lub barwnika?',
    'Sprawdź granulat pod kątem obcego materiału',
    'Sprawdź wilgotność materiału',
    'Sprawdź homogeniczność stopu i wydajność plastyfikacji'
  ],
  smugi_powietrza: [
    'Haczyki powietrza? – ostre przejścia grubości, głębokość grawerowania',
    'Smugi przy wlewku? – prędkość dekompresji i jej wielkość',
    'Widoczne pęcherzyki w wytryśniętej masie? – przeciwciśnienie, podawanie',
    'Sprawdź odpowietrzenie formy i szczelność dyszy'
  ],
  linie_laczenia: [
    'Czy karb występuje w obszarze łączenia strug?',
    'Czy widać zmianę koloru/połysku w linii? – pigment, materiał',
    'Rozważ przeniesienie punktu wtrysku w obszar niewidoczny',
    'Sprawdź odpowietrzenie dokładnie w miejscu łączenia strug'
  ]
}

// -------------------------------------------------------------
// Uwaga: dane ĆWICZEŃ (wartości wejściowe/docelowe dla poszczególnych wad)
// przeniesione do osobnego pliku: src/data/exercises.js
// -------------------------------------------------------------

// -------------------------------------------------------------
// 5. SILNIK WYNIKU
// -------------------------------------------------------------

// ryzyko pojedynczej wady [%] z regułą twardą poduszki
export function riskFor(defectsRegistry, wada, values, m = MACHINE) {
  const def = defectsRegistry[wada]
  if (!def) return { defectPct: 0, overallQuality: 100, contrib: [] }

  const sum = def.params.reduce((s, p) => s + p.weight, 0) || 1
  const contrib = def.params.map(p => {
    const x = paramValue(p.id, values, m)
    const q = quality(p, x)
    return {
      id: p.id, x, q: Math.round(q),
      share: p.weight / sum,
      lost: Math.round((100 - q) * (p.weight / sum)),   // ile pkt ryzyka wnosi ten parametr
      dir: p.dir, note: p.note
    }
  })

  const overall = contrib.reduce((s, c) => s + c.q * c.share, 0)
  let defectPct = 100 - overall

  // REGUŁA TWARDA: bez poduszki docisk fizycznie nie działa
  const cush = cushion(values, m)
  const cushionBlocked = def.cushionSensitive && cush.raw < CUSHION_MIN
  if (cushionBlocked) defectPct += CUSHION_PENALTY

  return {
    overallQuality: overall,
    defectPct: Math.max(0, Math.min(100, Math.round(defectPct))),
    contrib: contrib.sort((a, b) => b.lost - a.lost),
    cushionBlocked,
    cushion: cush.cushion
  }
}

// ZGODNOŚĆ WSTECZ: sygnatura jak dotychczas, plus dodatkowe pola.
// To jest funkcja, której używają App.jsx i DefectsPanel.jsx.
export function computeResult(defectsRegistry, wada, values, m = MACHINE) {
  return riskFor(defectsRegistry, wada, values, m)
}

// ryzyko WSZYSTKICH wad naraz – do DefectsPanel i do warunku zaliczenia
export function allRisks(defectsRegistry, values, m = MACHINE) {
  return Object.fromEntries(
    Object.keys(defectsRegistry).map(k => [k, riskFor(defectsRegistry, k, values, m).defectPct])
  )
}

// warunek zaliczenia: cel OK + nie zrobiłeś innej wady + poduszka fizycznie możliwa
export function evaluateCycle(defectsRegistry, wada, values, m = MACHINE, pass) {
  const cfg = pass || { target: SUCCESS_THRESHOLD, others: OTHERS_THRESHOLD, cushion: CUSHION_MIN }
  const risks = allRisks(defectsRegistry, values, m)
  const target = risks[wada]

  const others = Object.entries(risks)
    .filter(([k]) => k !== wada)
    .map(([k, v]) => ({ id: k, label: defectsRegistry[k]?.label || k, pct: v }))
    .sort((a, b) => b.pct - a.pct)

  const proc = computeProcessSummary(values, m)
  const worst = others[0] || { pct: 0 }

  const passed =
    target <= cfg.target &&
    worst.pct <= cfg.others &&
    proc.raw >= cfg.cushion

  const reasons = []
  if (target > cfg.target)      reasons.push(`Wada docelowa nadal ${target}% (próg ${cfg.target}%)`)
  if (worst.pct > cfg.others)   reasons.push(`Zrobiłeś inną wadę: ${worst.label} ${worst.pct}%`)
  if (proc.raw < cfg.cushion)   reasons.push(`Poduszka ${proc.cushion} mm – poniżej ${cfg.cushion} mm`)

  return { passed, target, risks, others, process: proc, reasons }
}

// porównanie dwóch cykli – feedback kierunkowy „co to kosztowało”
export function diffCycles(prev, curr) {
  if (!prev) return []
  return Object.keys(curr).map(k => ({
    id: k,
    from: prev[k],
    to: curr[k],
    delta: curr[k] - prev[k],
    trend: curr[k] > prev[k] ? '▲' : curr[k] < prev[k] ? '▼' : '▬'
  })).filter(d => d.delta !== 0)
}

// -------------------------------------------------------------
// 7. ALIASY ZGODNOŚCI (App.jsx / DefectsPanel.jsx / DefectManager.jsx)
// -------------------------------------------------------------
export const BUILTIN_DEFECTS_ALL = DEFECTS
export const TRAINER_NOTES_ALL   = TRAINER_NOTES
