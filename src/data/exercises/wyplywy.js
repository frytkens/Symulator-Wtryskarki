// =============================================================
// ĆWICZENIA – wada: wyplywy (przetryśnięte detale na linii podziału)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, meltTemp } from '../params.js'
import { BASE_START, SINK_MODEL, MACHINE, MATERIAL, PASS } from './zapadniecia.js'

// -------------------------------------------------------------
// Model wypływek W-01…W-04: ten sam silnik co zapadnięcia (napełnianie, docisk,
// kompensacja skurczu) + siła rozwierająca formę:
//   F_rozw [kN] = A_rzut [cm²] × p_gniazdo [bar] / 100
//   p_gniazdo = p_hydr × i × współczynnik przeniesienia (napełnianie lub docisk)
// Wypływka, gdy F_rozw > Fz. Zaliczenie wymaga zapasu Fz ≥ 1,1 × F_rozw i Fz ≤ 700 kN.
// Receptura bazowa (A_rzut 150 cm²): F_rozw ≈ 479 kN → wymagane ≈ 527 kN, nastawa 600 kN.
// -------------------------------------------------------------
export const FLASH_MODEL = {
  ...SINK_MODEL,
  type: 'flashMark',
  // temperatury działają tu przez lepkość w gnieździe (clamp.viscosity), nie przez skurcz/zamarzanie
  freezePerMoldDegree: 0, freezePerMeltDegree: 0, shrinkPerMeltDegree: 0,
  flowPerMeltDegree: 0.0005, flowPerMoldDegree: 0.0005,
  clamp: {
    fillTransfer: 0.25, lateTransfer: 0.15, packTransfer: 0.33,
    endSpeedRef: 90, endSpeedPressure: 0.5, endPeakFillStart: 0.85,
    safety: 1.1, maxClamp: 700,
    // odwrotnie niż w niedolaniu/zapadnięciach: chłodniej i wolniej = mniejszy pik
    viscosity: { meltRef: 243, moldRef: 40, speedRef: 90, perMeltDegree: 0.004, perMoldDegree: 0.004, perSpeed: 0.001, max: 0.12 }
  }
}

const FLASH_GOAL = 'Zdiagnozuj przyczynę wypływek i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'

const FLASH_OTHER = {
  source: 'PPS ENGEL, „Przetryśnięte detale – przyczyny i działania naprawcze”, str. 59–62',
  items: [
    'Najpierw sprawdzić stan powierzchni uszczelniających (płaszczyzny podziału) – uszkodzone trzeba naprawić.',
    'Siła zwarcia: zwiększyć tylko wtedy, gdy wynika to z obliczenia; zbyt duża niszczy powierzchnie podziału i odpowietrzenia.',
    'Zoptymalizować prędkość wtrysku (profil wolno–szybko–wolno) i punkt przełączenia.',
    'Zmniejszyć piki ciśnienia w formie: punkt przełączenia, ciśnienie docisku.',
    'Przetrysk w okolicy punktu wtrysku: przełączyć wcześniej na docisk, obniżyć temperaturę stopu i ścianek formy.',
    'W formach wielogniazdowych wyrównać napełnianie gniazd.'
  ]
}

const VP_NOTE = { params: ['Pp', 'doz'], text: 'Punktu przełączenia nie przesuwaj za mocno – sprawdź, czy jest ustawiony prawidłowo. Przesuwając go (lub zmieniając skok dozowania) przenosisz część fazy wtrysku w fazę docisku.' }
const HOLD_NOTE = { params: ['Pd', 'Td'], text: 'Docisk nie usuwa piku z fazy wtrysku. Zwróć uwagę, czy punkt przełączenia nie następuje przy już wypełnionym gnieździe.' }

const CLAMP_NOTE = { params: ['Fz'], text: 'Siła zwarcia powinna wynikać z obliczenia (powierzchnia rzutu × ciśnienie w gnieździe × zapas). Jej podnoszenie tylko maskuje nadmiar materiału lub ciśnienia.' }

// Wzór pokazywany po zaliczeniu (wartości z ostatniego cyklu uzupełnia interfejs).
const CLAMP_FORMULA = {
  title: 'Obliczenie siły zwarcia',
  lines: [
    'Fz ≥ A_rzut × p_gniazdo × k',
    'A_rzut – powierzchnia rzutu detalu z dolotem na płaszczyznę podziału [cm²]',
    'p_gniazdo – średnie ciśnienie w gnieździe [bar]; 1 bar × 1 cm² = 10 N, więc cm² × bar / 100 = kN',
    'k – współczynnik bezpieczeństwa 1,1–1,2',
    'Przykład: 150 cm² × 300 bar / 100 = 450 kN; × 1,2 = 540 kN'
  ]
}

export const WYPLYWY_EXERCISES = {
  wyplywy: {
    id: 'wyplywy',
    label: 'Wypływy – wariant A: „za mała siła zwarcia + przepakowanie”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 250, T2: 255, T3: 260, T4: 265, T5: 270, TR: 60,
      doz: 70, Pw1: 180, Pw2: 120, Pw3: 130, Pw4: 140, Pw5: 150,
      Pp: 3, Pd: 150, Td: 8, GR: 140,
      Prz: 20, Ob: 0.9, Deko: 5,
      Tr: 75, Ts: 75, Fz: 110, Tc: 40
    },
    // Zweryfikowane silnikiem: wyplywy=84% na starcie.
    // UWAGA KALIBRACYJNA (ważne): przy standardowym progu target=12% ta wada jest
    // MATEMATYCZNIE NIEOSIĄGALNA bez przekroczenia others=40% – sprawdzone przeszukaniem
    // (symulowane wyżarzanie, >700 tys. prób) na realnym silniku riskFor()/allRisks().
    // Powód: Pd, Pp, Pw1, Tr są współdzielone z niedolaniem/zapadnięciami/pęcherzami/liniami
    // łączenia z PRZECIWNYM kierunkiem (dir) – obniżanie ryzyka wypływów tymi parametrami
    // nieuchronnie podnosi ryzyko którejś z tamtych wad powyżej 40%.
    // Najlepszy znaleziony punkt równowagi: wyplywy=16%, najgorsza wada poboczna
    // (niedolanie/zapadniecia/linie_laczenia)=39%, poduszka=26.7mm.
    // Dlatego pass.target obniżono do 18% (bezpieczny margines nad zweryfikowanym optimum 16%),
    // zamiast standardowych 12%. Do potwierdzenia z technologiem, czy to akceptowalne, czy
    // wymaga raczej złagodzenia wag/x50 w samej wadzie `wyplywy` w params.js.
    reference: {
      T1: 240, T2: 240, T3: 240, T4: 240, T5: 240,
      doz: 96, Pw1: 70, Pw2: 80, Pw3: 70, Pw4: 60, Pw5: 10,
      Pp: 24, Pd: 65, Td: 13.5,
      Prz: 10, Ob: 0.7, Deko: 9, Tr: 55, Ts: 55, Fz: 200
    },
    focus: ['Fz', 'Pd', 'Pp', 'Pw1', 'T1', 'T2', 'T3', 'T4', 'T5', 'Tr'],
    pass: { target: 18, others: 40, cushion: 5 },
    keyNumber: { label: 'Maks. siła zwarcia dostępna na maszynie (Fz)', value: 200, unit: 't' },
    hints: [
      { after: 2,
        text: 'Sprawdź siłę zwarcia (Fz) – przy takim przepakowaniu forma się rozchyla, zanim cokolwiek innego zdąży zadziałać.' },
      { after: 4, when: (v) => v.Pd > 90,
        text: 'Ciśnienie docisku wciąż bardzo wysokie – przepakowujesz gniazdo już po jego wypełnieniu.' },
      { after: 6, when: (v) => v.Pp < 10,
        text: 'Przełączenie następuje bardzo późno – sprawdź piki ciśnienia tuż przed dociskiem.' },
      { after: 8, when: (v) => meltTemp(v).Tm > 255,
        text: 'Temperatura masy blisko górnej granicy okna materiałowego – niższa lepkość łatwiej wchodzi w szczelinę podziału.' },
      { after: 10,
        text: 'Uwaga: obniżanie Pd/Pp/Tr naprawia wypływy, ale te same parametry w drugą stronę naprawiają niedolanie i zapadnięcia. Szukaj kompromisu, nie wartości skrajnych.' },
      { after: 12, when: (v, m) => cushion(v, m).raw < 5,
        text: 'Przy okazji sprawdź poduszkę – poniżej 5 mm cykl i tak nie zostanie zaliczony.' }
    ]
  },

  wyplywy_W01: {
    id: 'wyplywy',
    code: 'W-01',
    rootParam: 'Pp', // parametr-przyczyna (tryb administratora)
    label: 'W-01 · Wypływki — przypadek 1',
    learningGoal: FLASH_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Na linii podziału pojawia się grat, najwięcej na końcu drogi płynięcia. Detal jest kompletny, a masa trochę wyższa niż zwykle. Wada powtarza się na każdej sztuce.',
      facts: ['Grat na linii podziału', 'Detal kompletny, masa podwyższona', 'Wada powtarzalna']
    },
    solutionSummary: 'Przyczyną było zbyt późne przełączenie V/P (6 mm). Gniazdo było całkowicie wypełnione jeszcze w fazie prędkościowej, więc pod koniec wtrysku powstawał pik ciśnienia, który rozwierał formę. Prawidłowe okno to V/P 11–12 mm (ok. 94–98% wypełnienia w chwili przełączenia). Większa siła zwarcia nie usuwa przyczyny – pik jest wyższy niż możliwości maszyny.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pp: 6 },
    reference: { Pp: 12 },
    focus: ['Pp'],
    pass: PASS,
    processModel: FLASH_MODEL,
    changeNotes: [CLAMP_NOTE, HOLD_NOTE],
    otherParameters: FLASH_OTHER,
    solutionFormula: CLAMP_FORMULA,
    hints: [
      { after: 3, text: 'Porównaj ciśnienie maksymalne z limitem. W którym momencie cyklu pojawia się pik?' }
    ]
  },

  wyplywy_W02: {
    id: 'wyplywy',
    code: 'W-02',
    rootParam: 'Pd', // parametr-przyczyna (tryb administratora)
    label: 'W-02 · Wypływki — przypadek 2',
    learningGoal: FLASH_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Wzdłuż całej linii podziału widać cienki grat. Masa wyprasek jest wyższa niż zwykle, a detale trudniej wypadają z formy. Wada jest powtarzalna.',
      facts: ['Grat wzdłuż linii podziału', 'Masa podwyższona', 'Utrudnione wyformowanie']
    },
    solutionSummary: 'Przyczyną było za wysokie ciśnienie docisku (130 bar). Gniazdo było przepakowane, a ciśnienie w fazie docisku rozwierało formę. Prawidłowe okno przy czasie docisku 7 s to 70–90 bar – wystarcza do kompensacji skurczu bez zapadnięć. Podnoszenie siły zwarcia tylko maskuje przepakowanie.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pd: 130 },
    reference: { Pd: 80 },
    focus: ['Pd'],
    pass: PASS,
    processModel: FLASH_MODEL,
    changeNotes: [CLAMP_NOTE, VP_NOTE],
    otherParameters: FLASH_OTHER,
    solutionFormula: CLAMP_FORMULA,
    hints: [
      { after: 3, text: 'Masa jest wyższa niż referencyjna. Która faza cyklu dopycha materiał po napełnieniu?' }
    ]
  },

  wyplywy_W03: {
    id: 'wyplywy',
    code: 'W-03',
    rootParam: 'Pw5', // parametr-przyczyna (tryb administratora)
    label: 'W-03 · Wypływki — przypadek 3',
    learningGoal: FLASH_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Grat pojawia się na linii podziału na końcu drogi płynięcia. Detal jest kompletny, masa w normie, ciśnienia na ekranie wyglądają zwyczajnie. Wada jest powtarzalna.',
      facts: ['Grat na końcu drogi płynięcia', 'Masa w normie', 'Wada powtarzalna']
    },
    solutionSummary: 'Przyczyną była za wysoka prędkość ostatniego stopnia wtrysku V5 (200 mm/s). Czoło tworzywa uderzało w koniec gniazda z dużą energią i lokalny pik ciśnienia rozwierał formę. Prawidłowy zakres V5 to ok. 70–115 mm/s (profil wolno–szybko–wolno). Niższa prędkość końcowa ogranicza pik bez utraty napełnienia.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pw5: 200 },
    reference: { Pw5: 90 },
    focus: ['Pw5'],
    pass: PASS,
    processModel: FLASH_MODEL,
    changeNotes: [CLAMP_NOTE, VP_NOTE],
    otherParameters: FLASH_OTHER,
    solutionFormula: CLAMP_FORMULA,
    hints: [
      { after: 3, text: 'Masa i ciśnienie docisku są w normie. Co dzieje się w chwili, gdy tworzywo dochodzi do końca gniazda?' }
    ]
  },

  wyplywy_W04: {
    id: 'wyplywy',
    code: 'W-04',
    rootParam: 'Fz', // parametr-przyczyna (tryb administratora)
    label: 'W-04 · Wypływki — przypadek 4',
    learningGoal: FLASH_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Po przezbrojeniu na tę formę na całym obwodzie linii podziału pojawił się grat. Masa, poduszka i ciśnienia wyglądają jak w poprzednich zleceniach.',
      facts: ['Grat na całym obwodzie', 'Wada po przezbrojeniu', 'Masa i ciśnienia w normie']
    },
    solutionSummary: 'Przyczyną była za mała siła zwarcia (400 kN). Siła rozwierająca od ciśnienia w gnieździe była większa niż siła trzymająca formę. Prawidłowa nastawa to ok. 530–700 kN: z zapasem ok. 10% nad siłą rozwierającą, ale bez nadmiaru, który niszczy płaszczyznę podziału i zgniata odpowietrzenia.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Fz: 400 },
    reference: { Fz: 600 },
    focus: ['Fz'],
    pass: PASS,
    processModel: FLASH_MODEL,
    changeNotes: [VP_NOTE],
    otherParameters: FLASH_OTHER,
    solutionFormula: CLAMP_FORMULA,
    hints: [
      { after: 3, text: 'Ciśnienia i masa są w normie. Co trzyma formę zamkniętą podczas wtrysku?' }
    ]
  }
}
