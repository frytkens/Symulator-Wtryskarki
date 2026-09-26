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
  { id: 'Pp',  label: 'Pp – pozycja przełączenia V/P', x: 24.8, y: 70.0, min: 0, max: 25, step: 1,  unit: 'mm',  def: 10  },

  { id: 'Pw5', label: 'Pw5',                       x: 33.7, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'mm/s', def: 80  },
  { id: 'Pw4', label: 'Pw4',                       x: 40.5, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'mm/s', def: 80  },
  { id: 'Pw3', label: 'Pw3',                       x: 47.4, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'mm/s', def: 80  },
  { id: 'Pw2', label: 'Pw2',                       x: 54.2, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'mm/s', def: 80  },
  { id: 'Pw1', label: 'Pw1',                       x: 61.0, y: 85.0, min: 0,   max: 200,  step: 2,    unit: 'mm/s', def: 80, active: true, weight: 0.25 },
  { id: 'GR',  label: 'GR – gr. ciśn. wtrysku',   x: 70.9, y: 85.0, min: 0,   max: 220,  step: 5,    unit: 'bar', def: 120 },

  { id: 'Deko', label: 'Deko – dekompresja',      x: 92.5, y: 85.0, min: 0,   max: 100,  step: 1,    unit: 'mm',  def: 7,  active: true, weight: 0.60 },
  { id: 'Prz',  label: 'Prz – przeciwciśn.',      x: 82.5, y: 18.0, min: 0,   max: 40,   step: 1,    unit: 'bar', def: 5  },
  { id: 'Ob',   label: 'Ob – obroty',             x: 92.4, y: 18.0, min: 0,   max: 1.2,  step: 0.05, unit: 'm/s', def: 0.6 },
  { id: 'doz',  label: 'doz – skok dozowania',    x: 85.4, y: 85.0, min: 0,   max: 150,  step: 2,    unit: 'mm',  def: 60  }
]

export const CLAMP_PARAMS = [
  { id: 'Tr', label: 'Tr – temp. strony ruchomej', x: 44.8, y: 11.4, min: 10, max: 100, step: 1, unit: '°C', def: 20 },
  { id: 'Ts', label: 'Ts – temp. strony stałej',   x: 65.5, y: 11.4, min: 10, max: 100, step: 1, unit: '°C', def: 20 },
  { id: 'Tc', label: 'Tc – czas chłodzenia',            x: 44.8, y: 90.0, min: 0,  max: 120, step: 1, unit: 's',  def: 30 },
  { id: 'Fz', label: 'Fz – siła zwarcia',          x: 66.7, y: 90.0, min: 0,  max: 1000, step: 10, unit: 'kN', def: 600 }
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
export const DEKO_MAX_PCT       = 10  // % dawki dozowania – zalecana wartość dekompresji:
                                       // cel dla wahania (za mało = zawór nie siada powtarzalnie),
                                       // sufit dla smugi_powietrza (za dużo = zasysanie powietrza przez dyszę)
export const STROKE_MAX_RATIO   = 3   // droga dozowania <= 3 x D
export const SPREAD_LOG_CYCLES  = 6   // ile cykli poduszki pokazujemy w logu

// -------------------------------------------------------------
// 2. MASZYNA I FIZYKA PROCESU
// -------------------------------------------------------------
export const MACHINE = { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 }

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

// dekompresja jako % dawki dozowania – reguła skaluje się z doz, bez twardych mm
export function dekoPct(values) {
  const doz  = Number(values.doz)  || 0
  const deko = Number(values.Deko) || 0
  return doz > 0 ? Math.round((deko / doz) * 1000) / 10 : 0
}

// PRZEWIDYWANY rozrzut poduszki cykl-do-cyklu [mm] – deterministyczny.
// Źródło kierunków: ENGEL PPS, slajd 39 (wahania wagi i wymiarów).
export function cushionSpread(values, m = MACHINE) {
  // 1) zamykanie zaworu zwrotnego: niska 1. prędkość = niepowtarzalne siadanie
  const valve  = 1 / (1 + Math.exp(((Number(values.Pw1) || 0) - 60) / 10))
  // 2) dekompresja NIŻSZA niż zalecane 10% dawki = zawór zwrotny nie siada
  //    powtarzalnie (za mało odciążenia przed skokiem). Powyżej 10% powtarzalność
  //    siadania zaworu już nie rośnie – ryzyko powyżej tego progu to zasysanie
  //    powietrza przez dyszę, ujęte osobno w wadzie smugi_powietrza (dekoPct, x50=10).
  //    Korekta na podstawie uwagi technologa: "dekompresja większa poprawia pracę
  //    zaworu zwrotnego, docelowo zaleca się 10% dawki dozowania".
  const deco   = Math.max(0, DEKO_MAX_PCT - dekoPct(values)) / 10
  // 3) droga dozowania powyżej 3 x D
  const stroke = Math.max(0, (Number(values.doz) || 0) / m.D - STROKE_MAX_RATIO) / 1.5
  // 4) zużycie zaworu/cylindra – ukryta usterka, NIE do naprawy nastawami
  const wear   = Number(m.leak) || 0
  // 5) przeciwciśnienie stabilizuje dozowanie i jednorodność stopu
  const back   = 1 / (1 + Math.exp(((Number(values.Prz) || 0) - 6) / 3))

  const spread = 2.6 * valve + 1.8 * deco + 1.5 * stroke + 3.2 * wear + 1.2 * back
  return Math.round(spread * 10) / 10
}

// PRNG z ziarnem – to samo ziarno daje tę samą serię (powtarzalność egzaminu)
function seeded(seed) {
  let s = (Number(seed) || 1) >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Seria odczytów poduszki do LOGU. Asymetryczna: nieszczelny zawór pozwala
// materiałowi uciec WSTECZ, więc pojedyncze cykle lecą W DÓŁ, nie w obie strony.
export function cushionSeries(values, m = MACHINE, seed = 1, n = SPREAD_LOG_CYCLES) {
  const base = cushion(values, m).cushion
  const sp   = cushionSpread(values, m)
  const rnd  = seeded(seed)
  const out  = []
  for (let i = 0; i < n; i++) {
    const r    = rnd()
    // 75% cykli blisko nominału, 25% wyraźny spadek
    const dip  = r < 0.25 ? (0.55 + rnd() * 0.45) : (rnd() * 0.18)
    const val  = base - dip * sp * 1.6
    out.push(Math.round(Math.max(0, val) * 10) / 10)
  }
  return out
}

// wartość "wirtualnego" parametru używanego przez model wad (Tm, cushion) albo zwykłego suwaka
export function paramValue(id, values, m = MACHINE) {
  if (id === 'Tm') return meltTemp(values).Tm
  if (id === 'cushion') return cushion(values, m).raw
  if (id === 'dekoPct') return dekoPct(values)
  if (id === 'cushionSpread') return cushionSpread(values, m)
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
  return {
    ...cushion(values, m),
    spread:  cushionSpread(values, m),
    dekoPct: dekoPct(values)
  }
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
      { id: 'dekoPct', weight: 35, dir: -1, x50: DEKO_MAX_PCT, k: 2.5, note: 'Dekompresja > 10% dawki dozowania zasysa powietrze przez dyszę' },
      { id: 'Pw1',  weight: 20, dir: -1, x50: 115, k: 30, note: 'Szybki wtrysk zaciąga powietrze do strugi' },
      { id: 'Ob',   weight: 10, dir: -1, x50: 0.9, k: 0.2, note: 'Za wysokie obroty = napowietrzanie przy podawaniu' }
    ]
  },

  wahania: {
    label: 'Wahania wagi i wymiarów – niestabilna poduszka',
    cushionSensitive: true,
    params: [
      // ENGEL PPS rozdziela DWA pytania: "poduszka za mała?" i "poduszka się waha?".
      // Dlatego cushion i cushionSpread są OSOBNYMI parametrami – mają inne działania naprawcze.
      { id: 'cushionSpread', weight: 65, dir: -1, x50: 2.0, k: 0.55,
        note: 'Rozrzut poduszki cykl-do-cyklu – zawór zwrotny nie siada powtarzalnie' },
      { id: 'cushion',       weight: 15, dir: +1, x50: 5.0, k: 0.8,
        note: 'Za mała poduszka = brak buforu, docisk nie ma czym pracować' },
      { id: 'Tm',            weight: 12, type: 'window', lo: 226, hi: 254, k: 8,
        note: 'Wahania lepkości = zmienny wyciek wsteczny przez zawór' },
      { id: 'Pd',            weight: 8,  dir: +1, x50: 55, k: 16,
        note: 'Docisk domyka bilans masy po przełączeniu' }
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
    'Sprawdź poduszkę – ślimak nie może dojść do przodu w fazie docisku',
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
  wahania: [
    'Poduszka SKACZE czy DRYFUJE? Skok = zawór/cylinder. Dryf = zasyp, wilgoć, temp. strefy zasypu',
    'Sprawdź zamykanie zaworu zwrotnego – podnieś PIERWSZĄ prędkość wtrysku (Pw1)',
    'Sprawdź dekompresję – dąż do ok. 10% dawki dozowania (Deko/doz): za mało = zawór nie siada powtarzalnie, za dużo = zasysanie powietrza',
    'Sprawdź zasyp materiału i drogę dozowania (max 3 x D ślimaka)',
    'Sprawdź przeciwciśnienie – stabilizuje dozowanie i jednorodność stopu',
    'Test bez rozbierania: kilka cykli BEZ DOCISKU – nieszczelny zawór ujawni się od razu',
    'Zużyty zawór/cylinder = wymiana. Tego nastawą nie naprawisz'
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
// SILNIK SZKOLENIOWY SCENARIUSZY (wersja 1: N-01)
// Warstwa pośrednia: nastawy -> stan procesu -> obserwowalna wada.
// Wartości są tendencyjne/dydaktyczne, nie są obliczeniami CAE.
// -------------------------------------------------------------
function clamp01(x) { return Math.max(0, Math.min(1, x)) }
function roundTo(x, d = 1) { const f = 10 ** d; return Math.round(x * f) / f }

export function simulateTrainingCycle(values, m = MACHINE, scenario = null) {
  if (!scenario?.processModel || !['shortShotVP', 'shortShotValve', 'sinkMark', 'flashMark', 'burnMark'].includes(scenario.processModel.type)) return null

  const model = scenario.processModel
  const doz = Number(values.doz) || 0
  const vp = Number(values.Pp) || 0
  const speedIds = model.type === 'shortShotValve' && model.valveCause === 'firstSpeed'
    ? ['Pw2','Pw3','Pw4','Pw5']
    : ['Pw1','Pw2','Pw3','Pw4','Pw5']
  const commandedSpeed = speedIds
    .map(id => Number(values[id]) || 0)
    .reduce((a,b) => a+b, 0) / speedIds.length
  const tm = meltTemp(values).Tm
  const moldTemp = ((Number(values.Tr) || 0) + (Number(values.Ts) || 0)) / 2
  const pressureLimit = Number(values.GR) || 0
  const coldPartStroke = fillStroke(m)
  const requiredStroke = coldPartStroke * (model.meltVolumeFactor || 1)

  // Bazowe zapotrzebowanie ciśnienia zależy od lepkości i prędkości.
  const baseFlowPressure = Math.max(35,
    model.basePressure +
    Math.max(0, model.referenceMeltTemp - tm) * model.pressurePerColdMeltDegree +
    Math.max(0, model.referenceMoldTemp - moldTemp) * model.pressurePerColdMoldDegree +
    Math.max(0, commandedSpeed - model.referenceSpeed) * model.pressurePerExtraSpeed
  )

  // Jeżeli limit jest niższy niż ciśnienie potrzebne do przepływu, maszyna nie osiąga prędkości.
  const flowPressureFactor = clamp01(pressureLimit / baseFlowPressure)
  const actualSpeed = commandedSpeed * flowPressureFactor

  // Wyższa wartość Pp = wcześniejsze przełączenie; droga do V/P = dawka - pozycja V/P.
  const velocityStroke = Math.max(0, doz - vp)
  const thermalFlow = clamp01(
    1 + (tm - model.referenceMeltTemp) * model.flowPerMeltDegree +
        (moldTemp - model.referenceMoldTemp) * model.flowPerMoldDegree
  )
  // Poniżej prędkości referencyjnej czoło stygnie – gorsze napełnianie. Powyżej niej
  // (tylko gdy scenariusz ma speedGainAboveRef) niewielki zysk, ograniczony maxSpeedFlow.
  const speedFlow = actualSpeed > model.referenceSpeed && model.speedGainAboveRef
    ? Math.min(model.maxSpeedFlow ?? 1, 1 + (actualSpeed - model.referenceSpeed) / model.referenceSpeed * model.speedGainAboveRef)
    : clamp01(0.72 + actualSpeed / model.referenceSpeed * 0.28)

  // Model zaworu zwrotnego. Słabe przygotowanie zaworu powoduje cofanie stopu,
  // stratę skutecznego skoku i zmienność między cyklami.
  const valveScenario = model.type === 'shortShotValve'
  const cycleIndex = Math.max(1, Number(values._cycleIndex) || 1)
  const jitterPattern = [0.55, -0.35, 1.0, -0.60, 0.20, -0.10]
  const jitter = jitterPattern[(cycleIndex - 1) % jitterPattern.length]
  let valveQuality = 1
  let valveParameterOk = true
  let valveTarget = null
  if (valveScenario && model.valveCause === 'decompression') {
    const ratio = doz > 0 ? (Number(values.Deko) || 0) / doz : 0
    valveTarget = roundTo(doz * model.valveTargetRatio, 1)
    valveParameterOk = ratio >= model.valveMinRatio && ratio <= model.valveMaxRatio
    valveQuality = clamp01(ratio / model.valveMinRatio)
    if (ratio > model.valveMaxRatio) valveQuality = clamp01(1 - (ratio - model.valveMaxRatio) / 0.10)
  } else if (valveScenario && model.valveCause === 'firstSpeed') {
    const firstSpeed = Number(values.Pw1) || 0
    valveTarget = `${model.valveSpeedMin}–${model.valveSpeedMax}`
    valveParameterOk = firstSpeed >= model.valveSpeedMin && firstSpeed <= model.valveSpeedMax
    valveQuality = clamp01(firstSpeed / model.valveSpeedMin)
    if (firstSpeed > model.valveSpeedMax) valveQuality = clamp01(1 - (firstSpeed - model.valveSpeedMax) / 80)
  }
  // Parametry pomocnicze (valveAdjust): niższa temperatura przednich stref, wyższa pierwsza
  // prędkość (N-02), prawidłowa dekompresja (N-03) i niższe przeciwciśnienie wspierają
  // zamykanie zaworu – odwrotna zmiana pogarsza. Wpływ jest ograniczony, więc bez
  // parametru-przyczyny w oknie nie usuwa niestabilności.
  const va = valveScenario ? model.valveAdjust : null
  if (va) {
    let adj = 0
    Object.entries(va.tempWeights).forEach(([id, w]) => {
      adj += ((va.tempRef[id] ?? 0) - (Number(values[id]) || 0)) * va.perDegree * w
    })
    if (va.perFirstSpeed) adj += ((Number(values.Pw1) || 0) - va.firstSpeedRef) * va.perFirstSpeed
    if (va.perDeko) adj += ((Number(values.Deko) || 0) - va.dekoRef) * va.perDeko
    adj -= ((Number(values.Prz) || 0) - va.backPressureRef) * va.perBackPressure
    valveQuality = clamp01(valveQuality + Math.max(-va.maxNegative, Math.min(va.maxPositive, adj)))
    if (!valveParameterOk) valveQuality = Math.min(valveQuality, va.maxWithoutRoot ?? 1)
  }
  const valveInstability = valveScenario ? (1 - valveQuality) : 0
  const valveStrokeLoss = valveScenario
    ? Math.max(0.05, 0.05 + valveInstability * Math.max(0, (model.valveLossBase ?? 3.6) + jitter * (model.valveLossJitter ?? 1.4)))
    : 0
  const valveEfficiency = clamp01(1 - valveStrokeLoss / Math.max(1, velocityStroke))

  const effectiveFillStroke = Math.max(0,
    velocityStroke * thermalFlow * speedFlow * flowPressureFactor - valveStrokeLoss
  )
  const fillAtVP = clamp01(effectiveFillStroke / requiredStroke)

  // Docisk może uzupełnić maksymalnie określoną część objętości i tylko do pełnego detalu.
  const doseReserve = Math.max(0, doz - requiredStroke)
  // fillHoldTime / fillReserveMin: model zapadnięć dopełnia gniazdo szybko, na początku docisku.
  const packingPotential = clamp01((Number(values.Pd) || 0) / model.referenceHoldingPressure) *
    clamp01((Number(values.Td) || 0) / (model.fillHoldTime ?? model.gateFreezeTime)) *
    clamp01(doseReserve / (model.fillReserveMin ?? model.minimumCushion)) *
    (valveScenario ? (0.75 + 0.25 * valveQuality) : 1)
  const packableGap = Math.min(model.maxPackingFill, Math.max(0, 1 - fillAtVP))
  const packingFill = packableGap * packingPotential
  const finalFill = clamp01(fillAtVP + packingFill)
  let holdingStroke = requiredStroke * packingFill
  let actualCushion = Math.max(0, vp - holdingStroke)

  // Ciśnienie rośnie wraz z końcem napełniania, a po niemal pełnym
  // wypełnieniu przed V/P pojawia się stromy pik ciśnienia.
  const fillPressureRise = clamp01((fillAtVP - model.pressureRiseStart) /
    (1 - model.pressureRiseStart)) * model.fillPressureRise
  const latePressureSpike = clamp01((fillAtVP - model.lateFillStart) /
    (1 - model.lateFillStart)) * model.latePressureSpike
  const requiredPressure = baseFlowPressure + fillPressureRise + latePressureSpike
  const maxPressure = roundTo(Math.min(requiredPressure, pressureLimit), 0)
  const pressureLimited = pressureLimit + 0.01 < requiredPressure

  const finalFillMin = model.finalFillMin
  const lateSwitch = fillAtVP > model.vpFillMax
  const earlySwitch = fillAtVP < model.vpFillMin
  const holdingWorked = holdingStroke >= model.minimumHoldingStroke
  const overpackRisk = lateSwitch || pressureLimited
  let processWindowOk =
    fillAtVP >= model.vpFillMin &&
    fillAtVP <= model.vpFillMax &&
    finalFill >= finalFillMin &&
    holdingWorked &&
    !pressureLimited &&
    actualCushion >= model.minimumCushion &&
    (!model.maximumCushion || actualCushion <= model.maximumCushion) &&
    (!valveScenario || (valveParameterOk && valveQuality >= 0.95))

  const shortShotRisk = Math.round(clamp01((model.goodFill - finalFill) / model.defectSpan) * 100)
  const lateSwitchRisk = Math.round(clamp01((fillAtVP - model.vpFillMax) /
    (1 - model.vpFillMax)) * 100)
  // W scenariuszu wada docelowa obejmuje nie tylko brak materiału, ale także
  // nieprawidłowe okno V/P — kompletny detal z przełączeniem po 100% nadal jest NG.
  const processPenalty = processWindowOk ? 0 : (lateSwitch ? Math.max(25, lateSwitchRisk) : 0)
  // Przy niestabilnym zaworze wada wynika z niestabilności – przesunięcie V/P, dawki czy
  // docisku może zmienić masę, ale nie usuwa przyczyny.
  const instabilityRisk = valveScenario && model.instabilityScale
    ? Math.round((1 - valveQuality) * model.instabilityScale) : 0
  let defectPct = Math.max(shortShotRisk, processPenalty, instabilityRisk)
  let mass = roundTo(model.referenceMass * finalFill, 1)

  const injectionTime = actualSpeed > 0 ? velocityStroke / actualSpeed : 0
  const missingStrokeAtVP = Math.max(0, requiredStroke - effectiveFillStroke)

  // Uproszczony model plastyfikacji.
  const screwSpeed = Math.max(0.05, Number(values.Ob) || 0)
  const backPressure = Number(values.Prz) || 0
  const dosingTime = model.referenceDosingTime *
    (doz / model.referenceDose) *
    (model.referenceScrewSpeed / screwSpeed) *
    Math.max(0.7, 1 + (backPressure - model.referenceBackPressure) * model.backPressureTimeFactor)
  const coolingTime = Math.max(0, Number(values.Tc) || 0)
  const holdingTime = Math.max(0, Number(values.Td) || 0)
  const coolingDosingTime = Math.max(coolingTime, dosingTime)
  const auxiliaryTime = model.auxiliaryTime
  const cycleTime = injectionTime + holdingTime + coolingDosingTime + auxiliaryTime
  const productivity = cycleTime > 0 ? Math.round(3600 / cycleTime) : 0

  let visualLevel = 0
  if (finalFill < 0.72) visualLevel = 4
  else if (finalFill < 0.84) visualLevel = 3
  else if (finalFill < 0.93) visualLevel = 2
  else if (finalFill < model.goodFill) visualLevel = 1

  // -------------------------------------------------------------
  // Model zapadnięć: kompensacja skurczu objętościowego dociskiem.
  // Skuteczność = (Pd / ciśnienie referencyjne) × (efektywny czas docisku / czas
  // zamarzania przewężki), ograniczona drogą, którą ślimak ma jeszcze do przodu.
  // Za mało → zapadnięcie; za dużo → przepakowanie i wypływka na linii podziału.
  // -------------------------------------------------------------
  let sink = null
  if (model.type === 'sinkMark' || model.type === 'flashMark' || model.type === 'burnMark') {
    const pd = Number(values.Pd) || 0
    const td = Number(values.Td) || 0
    const fz = Number(values.Fz) || 0
    const gateFreeze = model.gateFreezeTime *
      (1 + (moldTemp - model.referenceMoldTemp) * model.freezePerMoldDegree) *
      (1 + (tm - model.referenceMeltTemp) * model.freezePerMeltDegree)
    // Przewężka nie zamarza skokowo – po nominalnym czasie docisk działa jeszcze częściowo.
    // Po zamarznięciu przewężki efekt szybko się wysyca – najwyżej maxHoldFactor × czas zamarzania.
    const effectiveHold = Math.min(
      td <= gateFreeze ? td : gateFreeze + (td - gateFreeze) * model.postFreezeFactor,
      gateFreeze * (model.maxHoldFactor ?? Infinity)
    )
    const timeFactor = effectiveHold / gateFreeze
    const pressureFactor = pd / model.packReferencePressure
    const shrinkage = model.shrinkage * (1 + (tm - model.referenceMeltTemp) * model.shrinkPerMeltDegree)
    const neededStroke = requiredStroke * shrinkage
    let requestedComp = pressureFactor * timeFactor
    // Przenoszenie ciśnienia docisku na obszary daleko od dolotu (model.transmission):
    // cieplejszy stop/forma i wyższa prędkość dłużej utrzymują drożny przekrój. Ograniczone ±max.
    let transmissionFactor = 1
    if (model.transmission) {
      const t = model.transmission
      transmissionFactor = Math.min(1 + t.max, Math.max(1 - t.max,
        1 + (tm - t.meltRef) * t.perMeltDegree +
            (moldTemp - t.moldRef) * t.perMoldDegree +
            (commandedSpeed - t.speedRef) * t.perSpeed))
      requestedComp *= transmissionFactor
    }
    const availableStroke = Math.max(0, vp - holdingStroke)
    const compStroke = Math.min(neededStroke * requestedComp, availableStroke)
    const compensation = neededStroke > 0 ? compStroke / neededStroke : 0
    const screwBottomed = neededStroke * requestedComp > availableStroke + 0.01

    // Z modelem siły zwarcia (clamp) wpływ Fz liczy siła rozwierająca – próg przepakowania jest stały.
    const flashLimit = model.clamp ? model.flashCompensation : model.flashCompensation * (fz / model.referenceClampForce)
    // Wypływka także przy bardzo wysokim ciśnieniu docisku, niezależnie od czasu (siła rozrywająca).
    let flash = compensation > flashLimit ||
      (model.flashHoldingPressure ? pd > model.flashHoldingPressure * (fz / model.referenceClampForce) : false)

    // Siła rozwierająca formę (model.clamp): F = A_rzut × p_gniazdo / 100 [kN] (cm² × bar / 100).
    // Ciśnienie w gnieździe = ciśnienie hydrauliczne × przełożenie i × współczynnik przeniesienia:
    // faza napełniania (rośnie przy późnym V/P i przy wysokiej prędkości ostatniego stopnia)
    // albo faza docisku – liczy się większa wartość.
    let clamp = null
    if (model.clamp) {
      const c = model.clamp
      const lateFill = clamp01((fillAtVP - model.vpFillMax) / (1 - model.vpFillMax))
      const endSpeedPeak = Math.max(0, (Number(values.Pw5) || 0) - c.endSpeedRef) * c.endSpeedPressure *
        clamp01((fillAtVP - c.endPeakFillStart) / (model.vpFillMin - c.endPeakFillStart))
      // Straty na płynięcie zimnego stopu podnoszą ciśnienie przed ślimakiem, ale nie w gnieździe.
      const coldFlowLoss = Math.max(0, model.referenceMeltTemp - tm) * model.pressurePerColdMeltDegree +
        Math.max(0, model.referenceMoldTemp - moldTemp) * model.pressurePerColdMoldDegree
      const fillCavityPressure = (requiredPressure - coldFlowLoss + endSpeedPeak) * m.i * (c.fillTransfer + c.lateTransfer * lateFill)
      const packCavityPressure = pd * m.i * c.packTransfer
      // Lepkość i energia napełniania (c.viscosity): niższa temperatura masy/formy i niższa
      // prędkość ograniczają piki w gnieździe; wyższe – zwiększają. Wpływ ograniczony ±max,
      // więc same nie usuwają przyczyny wypływki.
      let viscosityFactor = 1
      if (c.viscosity) {
        const v = c.viscosity
        viscosityFactor = Math.min(1 + v.max, Math.max(1 - v.max,
          1 + (tm - v.meltRef) * v.perMeltDegree + (moldTemp - v.moldRef) * v.perMoldDegree +
              (commandedSpeed - v.speedRef) * v.perSpeed))
      }
      const cavityPressure = Math.max(fillCavityPressure, packCavityPressure) * viscosityFactor
      const openingForce = m.Arzut * cavityPressure / 100
      const clampFlash = openingForce > fz
      const clampMarginOk = fz >= openingForce * c.safety
      const overClamp = fz > c.maxClamp
      flash = flash || clampFlash
      clamp = {
        cavityPressure: roundTo(cavityPressure, 0),
        openingForce: roundTo(openingForce, 0),
        requiredClamp: roundTo(openingForce * c.safety, 0),
        clampFlash, clampMarginOk, overClamp,
        clampSafety: c.safety,
        viscosityFactor: roundTo(viscosityFactor, 2),
        projectedArea: m.Arzut
      }
    }
    // Zapadnięcia po wyformowaniu (model.postEject): za krótkie chłodzenie – zbyt cienka
    // zastygła warstwa, gorący rdzeń kurczy się już poza formą.
    let postEjectSink = 0
    let coolingNeeded = null
    if (model.postEject) {
      const pe = model.postEject
      coolingNeeded = Math.max(pe.coolingNeeded * pe.minFactor, Math.min(pe.coolingNeeded * pe.maxFactor,
        pe.coolingNeeded * (1 + (moldTemp - pe.moldRef) * pe.perMoldDegree) * (1 + (tm - pe.meltRef) * pe.perMeltDegree)))
      const tc = Number(values.Tc) || 0
      postEjectSink = Math.max(0, (coolingNeeded - tc) / coolingNeeded) * pe.maxSink
    }
    const sinkDepth = roundTo(Math.max(0, 1 - compensation) * model.maxSinkDepth + postEjectSink, 2)
    const sinkOk = sinkDepth <= model.sinkTolerance

    holdingStroke += compStroke
    actualCushion = Math.max(0, vp - holdingStroke)
    mass = roundTo(model.referenceMass * finalFill *
      (1 - shrinkage * Math.max(0, 1 - compensation) + shrinkage * model.overpackMassFactor * Math.max(0, compensation - 1)), 1)

    // Grubość gratu – z nadwyżki kompensacji lub siły rozwierającej nad siłą zwarcia.
    const overForce = clamp ? Math.max(0, clamp.openingForce / Math.max(1, fz) - 1) : 0
    const overPack = Math.max(0, compensation - flashLimit)
    const burr = flash ? roundTo(Math.min(2.5, 0.05 + (clamp ? overForce : Math.max(overForce, overPack)) * 3), 2) : 0
    let flashLevel = 0
    if (flash) flashLevel = burr < 0.15 ? 1 : burr < 0.4 ? 2 : burr < 0.8 ? 3 : 4

    let sinkLevel = 0
    if (sinkDepth > 0.25) sinkLevel = 4
    else if (sinkDepth > 0.15) sinkLevel = 3
    else if (sinkDepth > 0.08) sinkLevel = 2
    else if (!sinkOk) sinkLevel = 1
    if (visualLevel === 0) visualLevel = model.type === 'flashMark' && flash ? flashLevel : sinkLevel

    // -------------------------------------------------------------
    // Przypalenia (model.burn), wg PPS:
    //  • efekt Diesla – powietrze sprężane na końcu drogi płynięcia: prędkość końcowa
    //    (V5 rzeczywista) większa niż przepustowość odpowietrzeń; nadmierna siła zwarcia
    //    (> ok. 20% ponad wymaganą) zgniata odpowietrzenia i zmniejsza ich przepustowość;
    //  • smugi przypalonego materiału – lokalna temperatura stopu od ścinania (obroty,
    //    przeciwciśnienie) i temperatury cylindra powyżej progu degradacji. Parametry
    //    niebędące przyczyną w scenariuszu wpływają w ograniczonym zakresie (±cap).
    // -------------------------------------------------------------
    let burn = null
    if (model.burn) {
      const bm = model.burn
      const endSpeed = (Number(values.Pw5) || 0) * flowPressureFactor
      // Odpowietrzenia zgniata siła zwarcia powyżej ok. 120% siły wymaganej dla tej formy (stała nominalna).
      const crushRef = bm.nominalRequiredClamp * bm.overclampAllowed
      const over = Math.max(0, fz / Math.max(1, crushRef) - 1)
      const ventFactor = 1 / (1 + over * bm.crushFactor)
      const dieselRatio = endSpeed / (bm.ventSpeed * ventFactor)
      const diesel = dieselRatio > 1

      const cap = (x, c) => Math.max(-c, Math.min(c, x))
      const contrib = {
        temp: (meltTemp(values).profile - bm.profileRef) * bm.perProfileDegree,
        Ob: ((Number(values.Ob) || 0) - bm.obRef) * bm.perOb,
        Prz: ((Number(values.Prz) || 0) - bm.przRef) * bm.perPrz,
        speed: (commandedSpeed - bm.speedRef) * bm.perSpeed
      }
      let localTemp = bm.localRef
      Object.entries(contrib).forEach(([k, d]) => { localTemp += k === bm.root ? d : cap(d, bm.helperCap) })
      const streaks = localTemp > bm.degradeTemp
      // Dozowanie musi zakończyć się w czasie chłodzenia – inaczej wydłuża cykl i czas przebywania stopu.
      const dosingOk = dosingTime <= coolingTime

      const dieselLevel = diesel ? (dieselRatio < 1.15 ? 1 : dieselRatio < 1.35 ? 2 : dieselRatio < 1.6 ? 3 : 4) : 0
      const over2 = localTemp - bm.degradeTemp
      const streakLevel = streaks ? (over2 < 3 ? 1 : over2 < 7 ? 2 : over2 < 12 ? 3 : 4) : 0
      const burnLevel = Math.max(dieselLevel, streakLevel)
      if (burnLevel > 0 && !flash) visualLevel = Math.max(visualLevel, burnLevel)
      burn = {
        diesel, dieselRatio: roundTo(dieselRatio, 2), ventFactor: roundTo(ventFactor, 2), endSpeed: roundTo(endSpeed, 0),
        streaks, localMeltTemp: roundTo(localTemp, 1), burnLevel, dieselLevel, streakLevel,
        burnType: diesel ? 'diesel' : streaks ? 'streaks' : null,
        dosingOk
      }
    }

    const sinkRisk = Math.round(clamp01((sinkDepth - model.sinkTolerance) / (model.maxSinkDepth - model.sinkTolerance)) * 100)
    const flashRisk = flash ? Math.max(25, Math.round(clamp01((compensation - flashLimit) / 0.3) * 100)) : 0
    const burnRisk = burn?.burnLevel ? 20 + burn.burnLevel * 20 : 0
    defectPct = Math.max(shortShotRisk, sinkRisk, flashRisk, burnRisk)

    processWindowOk =
      fillAtVP >= model.vpFillMin && fillAtVP <= model.vpFillMax &&
      finalFill >= finalFillMin && !pressureLimited &&
      sinkOk && !flash && actualCushion >= model.minimumCushion &&
      (!clamp || (clamp.clampMarginOk && !clamp.overClamp)) &&
      (!burn || (!burn.diesel && !burn.streaks && burn.dosingOk))

    sink = {
      sinkDepth, sinkOk, sinkLevel, flash, screwBottomed, burr, flashLevel,
      ...(clamp || {}),
      ...(burn || {}),
      transmissionFactor: roundTo(transmissionFactor, 2),
      coolingNeeded: coolingNeeded === null ? null : roundTo(coolingNeeded, 1),
      postEjectSink: roundTo(postEjectSink, 2),
      compensation: roundTo(compensation * 100, 0),
      gateFreezeTime: roundTo(gateFreeze, 1),
      effectiveHoldTime: roundTo(effectiveHold, 1),
      compensationStroke: roundTo(compStroke, 2)
    }
  }

  const warnings = []
  if (pressureLimited) warnings.push('Osiągnięto graniczne ciśnienie wtrysku.')
  if (actualCushion < model.minimumCushion) warnings.push(`Poduszka poniżej ${model.minimumCushion} mm.`)
  if (model.maximumCushion && actualCushion > model.maximumCushion) warnings.push(`Poduszka powyżej ${model.maximumCushion} mm — nadmierna rezerwa i długi czas przebywania stopu.`)
  if (earlySwitch) warnings.push('V/P zbyt wcześnie: za małe wypełnienie w chwili przełączenia.')
  if (lateSwitch) warnings.push('V/P zbyt późno: gniazdo jest prawie lub całkowicie wypełnione przed dociskiem.')
  if (!holdingWorked && finalFill >= finalFillMin) warnings.push('Brak rzeczywistego ruchu ślimaka po V/P — docisk nie wykonuje pracy.')
  if (valveScenario && !valveParameterOk) warnings.push('Zawór zwrotny nie zamyka się powtarzalnie — strata dawki i wahania masy.')
  if (tm > model.maximumMeltTemp) warnings.push('Temperatura masy przekracza bezpieczne okno materiału.')
  if (sink?.flash) warnings.push('Przepakowanie gniazda — wypływka na linii podziału.')
  if (sink?.diesel) warnings.push('Przypalenia na końcu drogi płynięcia (sprężone powietrze).')
  if (sink?.streaks) warnings.push('Smugi przypalonego materiału – termiczna degradacja stopu.')
  if (sink?.screwBottomed) warnings.push('Ślimak doszedł do przodu w fazie docisku — brak materiału do kompensacji skurczu.')

  return {
    model: model.type,
    cycleIndex,
    valveScenario,
    valveCause: model.valveCause || null,
    valveQuality: roundTo(valveQuality * 100, 1),
    valveEfficiency: roundTo(valveEfficiency * 100, 1),
    valveStrokeLoss: roundTo(valveStrokeLoss, 2),
    valveParameterOk,
    valveTarget,
    stableCycle: processWindowOk,
    fillAtVP: roundTo(fillAtVP * 100, 1),
    packingFill: roundTo(packingFill * 100, 1),
    finalFill: roundTo(finalFill * 100, 1),
    defectPct,
    visualLevel,
    processWindowOk,
    earlySwitch,
    lateSwitch,
    overpackRisk,
    holdingWorked,
    mass,
    referenceMass: model.referenceMass,
    physicalCushion: roundTo(actualCushion, 1),
    actualCushion: roundTo(actualCushion, 1),
    doseReserve: roundTo(doseReserve, 1),
    vpPosition: roundTo(vp, 1),
    holdingStroke: roundTo(holdingStroke, 1),
    strokeToVP: roundTo(velocityStroke, 1),
    coldPartStroke: roundTo(coldPartStroke, 1),
    requiredStroke: roundTo(requiredStroke, 1),
    coldPartVolume: roundTo(m.Vpart, 1),
    effectiveMeltVolume: roundTo(m.Vpart * (model.meltVolumeFactor || 1), 1),
    effectiveFillStroke: roundTo(effectiveFillStroke, 1),
    missingStrokeAtVP: roundTo(missingStrokeAtVP, 1),
    commandedSpeed: roundTo(commandedSpeed, 1),
    actualSpeed: roundTo(actualSpeed, 1),
    baseFlowPressure: roundTo(baseFlowPressure, 0),
    requiredPressure: roundTo(requiredPressure, 0),
    maxPressure,
    pressureLimit,
    pressureLimited,
    injectionTime: roundTo(injectionTime, 2),
    dosingTime: roundTo(dosingTime, 1),
    coolingTime: roundTo(coolingTime, 1),
    holdingTime: roundTo(holdingTime, 1),
    coolingDosingTime: roundTo(coolingDosingTime, 1),
    auxiliaryTime: roundTo(auxiliaryTime, 1),
    cycleTime: roundTo(cycleTime, 1),
    productivity,
    meltTemperature: roundTo(tm, 1),
    moldTemperature: roundTo(moldTemp, 1),
    ...(sink || {}),
    warnings
  }
}

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
export function computeResult(defectsRegistry, wada, values, m = MACHINE, scenario = null) {
  const training = simulateTrainingCycle(values, m, scenario)
  if (training && wada === scenario.id) {
    return { defectPct: training.defectPct, overallQuality: 100 - training.defectPct, contrib: [], training }
  }
  return riskFor(defectsRegistry, wada, values, m)
}

// ryzyko WSZYSTKICH wad naraz – do DefectsPanel i do warunku zaliczenia
export function allRisks(defectsRegistry, values, m = MACHINE) {
  return Object.fromEntries(
    Object.keys(defectsRegistry).map(k => [k, riskFor(defectsRegistry, k, values, m).defectPct])
  )
}

// warunek zaliczenia: cel OK + nie zrobiłeś innej wady + poduszka fizycznie możliwa
export function evaluateCycle(defectsRegistry, wada, values, m = MACHINE, pass, scenario = null) {
  const cfg = pass || { target: SUCCESS_THRESHOLD, others: OTHERS_THRESHOLD, cushion: CUSHION_MIN }
  const risks = allRisks(defectsRegistry, values, m)
  const training = simulateTrainingCycle(values, m, scenario)
  if (training && wada === scenario?.id) risks[wada] = training.defectPct
  const target = risks[wada]

  const others = Object.entries(risks)
    .filter(([k]) => k !== wada)
    .map(([k, v]) => ({ id: k, label: defectsRegistry[k]?.label || k, pct: v }))
    .sort((a, b) => b.pct - a.pct)

  const proc = computeProcessSummary(values, m)
  const worst = others[0] || { pct: 0 }

  // Scenariusze szkoleniowe mogą mieć własny, fizycznie uzasadniony model poduszki.
  // N-01: poduszka = droga dozowania - droga wymagana na objętość detalu.
  // Nie odejmujemy tutaj pozycji V/P po raz drugi.
  const cushionValue = training?.physicalCushion ?? proc.raw
  const cushionDisplay = roundTo(cushionValue, 1)

  const useTrainingWindow = Boolean(training && cfg.requireProcessWindow)
  const processWindowPassed = !useTrainingWindow || training.processWindowOk
  // N-01 ma własny spójny model wad ubocznych V/P (późne przełączenie,
  // pik ciśnienia, brak pracy docisku). Nie blokujemy go starymi, niezależnymi
  // krzywymi ryzyka innych ćwiczeń.
  const otherDefectsPassed = useTrainingWindow ? true : worst.pct <= cfg.others
  const passed =
    target <= cfg.target &&
    otherDefectsPassed &&
    cushionValue >= cfg.cushion &&
    processWindowPassed

  const reasons = []
  if (target > cfg.target)          reasons.push(`Wada docelowa/proces V/P: ${target}% (próg ${cfg.target}%)`)
  if (!useTrainingWindow && worst.pct > cfg.others) reasons.push(`Zrobiłeś inną wadę: ${worst.label} ${worst.pct}%`)
  if (cushionValue < cfg.cushion)   reasons.push(`Poduszka ${cushionDisplay} mm – poniżej ${cfg.cushion} mm`)
  if (scenario?.processModel?.maximumCushion && cushionValue > scenario.processModel.maximumCushion) reasons.push(`Poduszka ${cushionDisplay} mm – powyżej ${scenario.processModel.maximumCushion} mm`)
  if (training?.earlySwitch)        reasons.push(`V/P za wcześnie: ${training.fillAtVP}% wypełnienia przy przełączeniu`)
  if (training?.lateSwitch)         reasons.push(`V/P za późno: ${training.fillAtVP}% wypełnienia przed dociskiem`)
  if (training && !training.holdingWorked) reasons.push(`Docisk nie wykonał wymaganej pracy: ruch ślimaka ${training.holdingStroke} mm`)
  if (training?.pressureLimited)    reasons.push(`Osiągnięto limit ciśnienia ${training.pressureLimit} bar`)
  if (training?.sinkDepth !== undefined && !training.sinkOk) reasons.push(`Zapadnięcie ${training.sinkDepth} mm – kompensacja skurczu ${training.compensation}%`)
  if (training?.diesel)             reasons.push(`Efekt Diesla – prędkość końcowa ${training.endSpeed} mm/s, odpowietrzenie ${Math.round(training.ventFactor * 100)}%`)
  if (training?.dosingOk === false)  reasons.push(`Dozowanie ${training.dosingTime} s dłuższe niż chłodzenie ${training.coolingTime} s`)
  if (training?.streaks)            reasons.push(`Smugi przypalonego materiału – lokalna temperatura stopu ${training.localMeltTemp} °C`)
  if (training?.flash)              reasons.push(`Wypływka ${training.burr} mm – kompensacja ${training.compensation}%${training.openingForce ? `, siła rozwierająca ${training.openingForce} kN` : ''}`)
  if (training?.openingForce && !training.flash && !training.clampMarginOk) reasons.push(`Za mały zapas siły zwarcia: potrzeba ${training.requiredClamp} kN`)
  if (training?.overClamp)          reasons.push('Siła zwarcia powyżej zakresu formy')
  if (training?.valveScenario && !training.valveParameterOk) reasons.push(`Niestabilne zamykanie zaworu: sprawność ${training.valveEfficiency}%, strata skoku ${training.valveStrokeLoss} mm`)

  return {
    passed, target, risks, others,
    process: training ? { ...proc, cushionRaw: cushionValue, raw: cushionValue, cushion: cushionDisplay } : proc,
    training,
    reasons
  }
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
