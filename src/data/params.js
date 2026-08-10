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
// Źródło danych: prezentacja ENGEL "PPS | Process Plastic Surface" (01-PPS-PL.pdf).
// 6 wad wybranych jako te, które mają jednoznaczne, konkretne odzwierciedlenie w naszych
// parametrach maszyny. Kierunek każdej krzywej (rosnąca/malejąca/okno) i badRange są
// wyprowadzone wprost z sekcji "działania naprawcze" w prezentacji.
export const DEFECTS = {

  // Prezentacja: "Nie całkowicie wypełnione detale" (str. 33-37).
  // POPRAWKA: wcześniej wada była zbudowana wokół "zaworu zwrotnego" i dekompresji (Deko)
  // jako głównej przyczyny - nie ma to potwierdzenia w materiale źródłowym. Zawór zwrotny
  // jest tam wymieniony tylko jako jeden z punktów kontrolnych przy niestabilnej poduszce,
  // nie jako dominująca przyczyna. Właściwe przyczyny wg PDF: za mała objętość dozowania,
  // za niskie ciśnienie/prędkość wtrysku, zbyt wczesny punkt przełączenia, za niska temperatura.
  niedolanie: {
    label: 'Niedolanie – detal niecałkowicie wypełniony',
    params: [
      {
        // PDF: "Czy ślimak jest w przednim położeniu? -> Zwiększyć dozowanie"
        // za mała objętość dozowanego materiału = za mało tworzywa na wypraskę
        id: 'doz', weight: 40,
        curve: [[0,10],[20,25],[40,45],[60,65],[80,85],[100,95],[130,100],[150,100]],
        badRange: [0, 40] // domyślne 60mm daje jakość ~65% (jeszcze nie optimum) -> uczymy "zwiększ dozowanie"
      },
      {
        // PDF: "Zmienić prędkość wtrysku (+)"
        id: 'Pw1', weight: 35,
        curve: [[0,10],[40,20],[80,40],[120,60],[160,85],[200,100]],
        badRange: [0, 60] // krzywa rośnie monotonicznie -> uczymy "zwiększ prędkość"
      },
      {
        // PDF: "Podnieść temperaturę tworzywa" (jako jedno z działań naprawczych)
        id: 'T1', weight: 25,
        curve: [[150,20],[200,50],[220,65],[250,85],[280,100],[320,95],[350,90]],
        badRange: [150, 220] // domyślne 220°C daje jakość ~65% -> uczymy "zwiększ temperaturę"
      },
      {
        // PDF: "Podnieść temperaturę formy" - dodane wg ręcznej korekty
        id: 'Tr', weight: 25,
        curve: [[10,20],[20,30],[30,45],[45,65],[60,80],[80,100],[100,90],[130,70]],
        badRange: [30, 60] // domyślne 20°C poniżej badRange -> uczymy "zwiększ temperaturę formy"
      },
      {
        // Wg Twojej korekty: wyższe Pp = mniej materiału podanego w fazie szybkiego wtrysku
        // przed przełączeniem na docisk. Dla niedolania to źle (mniej materiału = gorsze wypełnienie),
        // więc niższe Pp pomaga - dodane wg ręcznej korekty
        id: 'Pp', weight: 30,
        curve: [[0,60],[2,90],[4,100],[8,70],[12,45],[16,25],[20,15],[25,5]],
        badRange: [5, 20] // uczymy "obniż" (niższe Pp = pełniejsze wypełnienie)
      }
    ]
  },

  // Prezentacja: "Efekt diesla/przypalenia" (str. 116-119). Bez zmian względem poprzedniej
  // wersji - już wcześniej zweryfikowane jako zgodne z PDF.
  przypalenia: {
    label: 'Przypalenia – efekt diesla, spalenia materiału na detalu',
    params: [
      {
        // PDF: "Możliwa redukcja siły zwarcia? -> Zmniejszyć siłę zwarcia" (pierwsze działanie)
        id: 'Fz', weight: 12,
        curve: [[0,10],[80,20],[120,45],[140,80],[150,100],[160,90],[180,60],[200,30]],
        badRange: [160, 200] // domyślne 180t powyżej optimum 150t -> uczymy "obniż"
      },
      {
        // PDF: "Zmniejszyć prędkość wtrysku"
        id: 'Pw5', weight: 10,
        curve: [[0,40],[2,70],[5,100],[10,80],[20,50],[40,25],[80,5],[120,0],[200,0]],
        badRange: [40, 120] // domyślne 80 powyżej optimum 5 -> uczymy "obniż"
      }
    ]
  },

  // Prezentacja: "Przetryśnięte detale" / zapływki (str. 58-61).
  wyplywy: {
    label: 'Wypływy – przetryśnięte detale na linii podziału formy',
    params: [
      {
        // PDF: "Możliwość zmiany siły zwarcia? -> Zwiększyć siłę zwarcia" (pierwsze działanie)
        id: 'Fz', weight: 30,
        curve: [[0,10],[50,20],[100,35],[150,60],[180,85],[200,100]],
        badRange: [50, 150] // krzywa rośnie monotonicznie do 200t -> uczymy "zwiększ"
      },
      {
        // PDF: "Przetrysk w okolicy punktu wtrysku? -> Zredukować prędkość wtrysku"
        id: 'Pw1', weight: 20,
        curve: [[0,20],[10,60],[20,100],[30,90],[50,60],[80,20],[120,5],[200,0]],
        badRange: [40, 120] // domyślne 80 powyżej optimum 20 -> uczymy "obniż"
      },
      {
        // PDF: "Zredukować ciśnienie docisku" (przy przetrysku od strony pików ciśnienia)
        id: 'Pd', weight: 20,
        curve: [[0,70],[10,85],[20,95],[30,100],[40,70],[60,40],[100,15],[150,5],[220,0]],
        badRange: [50, 120] // domyślne 40 bar powyżej optimum 30 -> uczymy "obniż"
      },
      {
        // POPRAWKA wg ręcznej korekty: wyższe Pp = mniej materiału podanego w fazie szybkiego
        // wtrysku przed przełączeniem na docisk = mniej materiału pod ciśnieniem = mniej wypływu.
        // Kierunek odwrócony względem poprzedniej wersji (było "obniż").
        id: 'Pp', weight: 20,
        curve: [[0,10],[5,25],[10,45],[16,60],[20,75],[25,85],[30,100],[35,90],[40,60]],
        badRange: [16, 25] // domyślne 10mm poniżej optimum 30mm -> uczymy "zwiększ"
      },
      {
        // PDF: "Zredukować temperaturę stopu"
        id: 'T1', weight: 10,
        curve: [[180,20],[190,40],[200,65],[210,100],[220,75],[230,50],[240,25],[250,10]],
        badRange: [220, 250] // domyślne 220°C powyżej optimum 210°C -> uczymy "obniż"
      },
      {
        // PDF: "zredukować temperaturę formy" - dodane wg ręcznej korekty
        id: 'Tr', weight: 5,
        curve: [[10,60],[15,85],[20,100],[30,80],[45,55],[60,35],[80,15],[100,5]],
        badRange: [30, 60] // domyślne 20°C to już optimum -> uczymy "obniż"
      }
    ]
  },

  // Prezentacja: "Wciągi/zapady" (str. 42-47).
  zapadniecia: {
    label: 'Zapadnięcia – wciągi, lokalne wgłębienia na powierzchni',
    params: [
      {
        // PDF: "Podnieść ciśnienie docisku" / "Podwyższyć docisk"
        id: 'Pd', weight: 40,
        curve: [[0,10],[10,30],[20,55],[30,80],[40,100],[80,95],[150,90],[220,85]],
        badRange: [0, 60] // poszerzone wg ręcznej korekty -> uczymy "zwiększ"
      },
      {
        // PDF: "Zoptymalizować (wydłużyć) czas docisku"
        id: 'Td', weight: 35,
        curve: [[0,15],[1,30],[2,55],[3,80],[5,100],[10,95],[20,90]],
        badRange: [0, 7] // poszerzone wg ręcznej korekty -> uczymy "wydłuż"
      }
    ]
  },

  // Prezentacja: "Jamy skurczowe/pęcherzyki" (str. 47-51) - ubytki z powodu niezrównoważonego
  // skurczu materiału (nie mylić z "pęcherzykami powietrza" z zaciągniętego powietrza,
  // które są osobną wadą związaną z odpowietrzeniem formy, nieuwzględnioną tu).
  pecherze: {
    label: 'Pęcherze / jamy skurczowe – puste przestrzenie wewnątrz detalu',
    params: [
      {
        // PDF: "Podwyższyć ciśnienie docisku"
        id: 'Pd', weight: 55,
        curve: [[0,10],[10,30],[20,55],[30,80],[40,100],[80,95],[150,90],[220,85]],
        badRange: [0, 60] // poszerzone wg ręcznej korekty -> uczymy "zwiększ"
      },
      {
        // PDF: "Zoptymalizować czas docisku"
        id: 'Td', weight: 45,
        curve: [[0,15],[1,30],[2,55],[3,80],[5,100],[10,95],[20,90]],
        badRange: [0, 7] // poszerzone wg ręcznej korekty -> uczymy "wydłuż"
      }
    ]
  },

  // Prezentacja: "Rozwarstwianie się zewnętrznych warstw" (str. 120-121).
  // POPRAWKA: wcześniej kierunek był odwrócony (uczyliśmy "zwiększ prędkość wtrysku").
  // PDF wprost: przyczyną są "wysokie naprężenia poprzeczne" wynikające z WYSOKIEJ prędkości
  // wtrysku, a działanie naprawcze to "zredukować prędkość wtrysku". Temperatura masy jest
  // w PDF opisana jako "bardzo wysoka LUB bardzo niska" - czyli okno, a nie kierunek - dlatego
  // dla T1 celowo zostawiamy pełny zakres losowania (brak badRange).
  rozwarstwienia: {
    label: 'Rozwarstwienia – oddzielające się warstwy materiału',
    params: [
      {
        // PDF: "Zredukować prędkość wtrysku"
        id: 'Pw1', weight: 55,
        curve: [[0,60],[20,100],[40,90],[80,60],[120,30],[160,10],[200,0]],
        badRange: [20, 200] // poszerzone wg ręcznej korekty -> uczymy "obniż"
      },
      {
        // PDF: "bardzo wysoka LUB bardzo niska temperatura masy" - okno, oba kierunki złe,
        // celowo bez badRange (pełny zakres losowania - lekcja "trafić w okno")
        id: 'T1', weight: 45,
        curve: [[100,20],[150,50],[190,80],[220,100],[250,80],[290,50],[330,20],[350,10]]
      }
    ]
  },

  // Prezentacja: "Smugi/haczyki powietrza" (str. 17-19).
  smugi_powietrza: {
    label: 'Smugi/haczyki powietrza – zaciągnięte powietrze na powierzchni',
    params: [
      {
        // PDF: "Zmniejszyć przeciwciśnienie? -> Zwiększyć przeciwciśnienie" / "Podwyższyć przeciwciśnienie"
        id: 'Prz', weight: 35,
        curve: [[0,10],[5,30],[10,55],[20,80],[30,100],[40,95]],
        badRange: [0, 2] // zawężone wg ręcznej korekty -> uczymy "zwiększ"
      },
      {
        // PDF: "Zmniejszyć dekompresję" (za duża dekompresja = przyczyna zaciągania powietrza)
        id: 'Deko', weight: 35,
        curve: [[0,100],[5,95],[10,85],[20,60],[40,30],[70,10],[100,0]],
        badRange: [3, 100] // poszerzone wg ręcznej korekty -> uczymy "obniż"
      },
      {
        // PDF: "Dopasować prędkość wtrysku (-)"
        id: 'Pw1', weight: 30,
        curve: [[0,60],[20,90],[40,100],[80,70],[120,40],[160,15],[200,5]],
        badRange: [50, 200] // poszerzone wg ręcznej korekty -> uczymy "obniż"
      }
    ]
  },

  // Prezentacja: "Linie łączenia (widoczne karby, zmiany koloru lub zmiany połysku)" (str. 104-105).
  linie_laczenia: {
    label: 'Linie łączenia – widoczne karby w miejscu spotkania strug materiału',
    params: [
      {
        // PDF: "Podnieść temperaturę masy" (jedno z pierwszych działań)
        id: 'T1', weight: 40,
        curve: [[150,10],[180,30],[200,55],[220,80],[250,100],[280,95],[320,85],[350,75]],
        badRange: [150, 260] // poszerzone wg ręcznej korekty -> uczymy "zwiększ"
      },
      {
        // PDF: "Zwiększyć ciśnienie docisku"
        id: 'Pd', weight: 35,
        curve: [[0,10],[20,30],[40,55],[80,75],[120,90],[160,100],[220,100]],
        badRange: [0, 30] // domyślne 40 bar daje jakość ~55% -> uczymy "zwiększ"
      },
      {
        // PDF: "Zmienić prędkość wtrysku" - bez podanego kierunku (+/-) w materiale źródłowym,
        // celowo bez badRange (nieznany kierunek - okno, do zweryfikowania z technologiem)
        id: 'Pw1', weight: 25,
        curve: [[0,40],[40,70],[80,100],[120,80],[160,50],[200,20]]
      }
    ]
  }
}

export const TRAINER_NOTES = {
  niedolanie: [
    'Sprawdź czy ślimak dochodzi do przedniego położenia (poduszka min. 5 mm)',
    'Sprawdź zawór zwrotny i/lub cylinder pod kątem szczelności',
    'Sprawdź odpowietrzenie formy',
    'Sprawdź czy nie osiągamy granicznego ciśnienia wtrysku',
    'Sprawdź punkt przełączenia (czy nie jest zbyt wczesny)',
    'Sprawdź temperaturę formy'
  ],
  przypalenia: [
    'Sprawdź czy w obszarze przypaleń jest odpowietrzenie',
    'Sprawdź czy błąd nie pojawił się nagle w trakcie produkcji (zabrudzone odpowietrzenia)',
    'Sprawdź czy odpowietrzenie jest we właściwym miejscu',
    'Sprawdź możliwość redukcji siły zwarcia (max. ok. 20% przepakowania)'
  ],
  wyplywy: [
    'Sprawdź stan powierzchni uszczelniających (płaszczyznę podziału formy)',
    'Sprawdź możliwość zwiększenia siły zwarcia',
    'Sprawdź równomierność napełniania gniazda formującego',
    'Sprawdź czy nie ma dużych deformacji/ugięcia formy pod ciśnieniem',
    'Sprawdź czy przetrysk występuje w okolicy punktu wtrysku',
    'Sprawdź temperaturę formy'
  ],
  zapadniecia: [
    'Sprawdź długość i stabilność poduszki (min. 5 mm)',
    'Sprawdź zawór zwrotny i/lub cylinder',
    'Sprawdź czy zapady są w okolicy dolotu czy z dala od niego (różne działania naprawcze)',
    'Sprawdź czas i ciśnienie docisku'
  ],
  pecherze: [
    'Sprawdź długość i stabilność poduszki (min. 5 mm)',
    'Sprawdź czy pęcherze są w obrębie wlewka/grubościennym obszarze czy z dala od niego',
    'Sprawdź czas i ciśnienie docisku',
    'Sprawdź wymiarowanie wlewka i przekrój detalu'
  ],
  rozwarstwienia: [
    'Sprawdź czy błąd pojawił się po zmianie materiału lub barwnika',
    'Sprawdź granulat pod kątem zabrudzeń lub obcego materiału',
    'Sprawdź wilgotność materiału',
    'Sprawdź homogeniczność stopu i wydajność plastyfikacji'
  ],
  smugi_powietrza: [
    'Sprawdź czy to haczyki powietrza (ostre przejścia grubości, głębokość grawerowania)',
    'Sprawdź smugi w okolicy wlewka (prędkość ślimaka podczas dekompresji, wielkość dekompresji)',
    'Sprawdź widoczne pęcherzyki powietrza w wytryśniętej masie (przeciwciśnienie, podawanie granulatu)',
    'Sprawdź odpowietrzenie formy i szczelność dyszy'
  ],
  linie_laczenia: [
    'Sprawdź czy karb/wada połysku występuje w obszarze łączenia strug',
    'Sprawdź czy w obszarze łączenia widać zmiany koloru (pigment, materiał)',
    'Rozważ przeniesienie punktu wtrysku, aby łączenie znalazło się w obszarze niewidocznym',
    'Sprawdź odpowietrzenie w miejscu łączenia strug'
  ]
}

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

// Aliasy zachowane dla zgodności z App.jsx / DefectsPanel.jsx (import BUILTIN_DEFECTS_ALL / TRAINER_NOTES_ALL)
export const BUILTIN_DEFECTS_ALL = DEFECTS
export const TRAINER_NOTES_ALL = TRAINER_NOTES
