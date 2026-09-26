// =============================================================
// ĆWICZENIA – wada: przypalenia (przypalenia / smugi termiczne od degradacji)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, meltTemp } from '../params.js'
import { BASE_START, MACHINE, MATERIAL, PASS } from './zapadniecia.js'
import { FLASH_MODEL } from './wyplywy.js'

// -------------------------------------------------------------
// Model przypaleń D-01, D-02 (efekt Diesla) i SP-01, SP-02 (smugi przypalonego materiału), typ 'burnMark': silnik wypływek (napełnianie, docisk,
// siła rozwierająca) + model burn:
//  • efekt Diesla: V5 rzeczywista > przepustowość odpowietrzeń (110 mm/s);
//    Fz powyżej ok. 120% siły wymaganej zgniata odpowietrzenia (PPS str. 119),
//  • smugi przypalonego materiału: lokalna temperatura stopu > 265 °C
//    (wzorcowo ok. 256 °C; obroty +30 °C na 1 m/s, przeciwciśnienie +0,6 °C/bar).
// Receptura wzorcowa: brak przypaleń.
// -------------------------------------------------------------
export const burnModel = root => ({
  ...FLASH_MODEL,
  type: 'burnMark',
  clamp: { ...FLASH_MODEL.clamp, endSpeedPressure: 0, maxClamp: 1000 },
  burn: {
    root,
    ventSpeed: 110, nominalRequiredClamp: 526, overclampAllowed: 1.2, crushFactor: 1.5,
    localRef: 256, degradeTemp: 265, helperCap: 6,
    profileRef: 232.35, perProfileDegree: 0.6,
    obRef: 0.6, perOb: 30,
    przRef: 10, perPrz: 0.6,
    speedRef: 90, perSpeed: 0.05
  }
})

const BURN_GOAL = 'Zdiagnozuj przyczynę przypaleń i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'
const STREAK_GOAL = 'Zdiagnozuj przyczynę smug na powierzchni i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'

const DIESEL_OTHER = {
  source: 'PPS ENGEL, „Efekt diesla/przypalenia”, str. 116–119',
  items: [
    'Efekt Diesla to problem odpowietrzenia: przypalenia na końcu drogi płynięcia, przy spotkaniu frontów, w otworach nieprzelotowych i przy żebrach poprzecznych.',
    'Nagłe wystąpienie w produkcji: sprawdzić zabrudzenie odpowietrzeń.',
    'Brak lub złe miejsce odpowietrzenia: poprawić odpowietrzenie formy.',
    'Zmniejszyć siłę zwarcia – z zachowaniem bezpieczeństwa, nie więcej niż ok. 20% ponad wymaganą.',
    'Zmniejszyć prędkość wtrysku (szczególnie na końcu napełniania) i ograniczyć zamknięte powietrze odpowiednim rozkładem płynięcia.'
  ]
}

const STREAK_OTHER = {
  source: 'PPS ENGEL, „Smugi przypalonego materiału”, str. 25–29',
  items: [
    'Temperatura masy powyżej zakresu przetwórstwa: obniżyć temperaturę cylindra, zmniejszyć obroty ślimaka, obniżyć ciśnienie plastyfikacji (przeciwciśnienie).',
    'Za długi czas przebywania: skrócić cykl, wydłużyć opóźnienie dozowania, użyć mniejszego agregatu, zmniejszyć udział regranulatu.',
    'Smugi przy dolocie: zmienić prędkość wtrysku (wolno–szybko), sprawdzić gorące kanały, usunąć ostre przejścia.',
    'Sprawdzić dyszę (przekrój, temperatura), suszenie materiału (zbyt długie lub gorące też szkodzi) i stabilność termiczną barwnika.'
  ]
}

const TEMP_NOTE = { params: ['T1', 'T2', 'T3', 'T4', 'T5'], text: 'Temperatura stopu nie usuwa zamkniętego powietrza. Zastanów się, czy powietrze ma którędy uciec z gniazda.' }

export const PRZYPALENIA_EXERCISES = {
  przypalenia: {
    id: 'przypalenia',
    label: 'Przypalenia – wariant A: „pełna prędkość do samego końca”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 255, T2: 260, T3: 265, T4: 270, T5: 275, TR: 60,
      doz: 60, Pw1: 150, Pw2: 150, Pw3: 150, Pw4: 150, Pw5: 150,
      Pp: 10, Pd: 60, Td: 5, GR: 140,
      Prz: 32, Ob: 0.9, Deko: 7,
      Tr: 20, Ts: 20, Fz: 200, Tc: 45
    },
    // podgląd wyłącznie dla trenera (widok admin)
    // Zweryfikowane silnikiem: przypalenia=11%, najgorsza wada poboczna (wyplywy)=37%, poduszka=6.7mm → PASS
    reference: {
      T1: 220, T2: 240, T3: 240, T4: 250, T5: 235,
      doz: 70, Pw1: 95, Pw2: 95, Pw3: 80, Pw4: 45, Pw5: 5,
      Pp: 18, Pd: 80, Td: 15,
      Prz: 10, Ob: 0.8, Deko: 2, Tr: 65, Ts: 50, Fz: 155
    },
    focus: ['Pw5', 'Fz', 'Prz', 'T1', 'T2', 'T3', 'T4', 'T5'],
    pass: { target: 12, others: 40, cushion: 5 },
    keyNumber: { label: 'Górna granica okna materiałowego (Tm max)', value: 260, unit: '°C' },
    hints: [
      { after: 2, when: (v) => v.Pw5 > 40,
        text: 'Sprawdź prędkość na SAMYM KOŃCU napełniania (Pw5) – to ona najbardziej odpowiada za tę wadę, nie prędkość na starcie.' },
      { after: 4, when: (v) => v.Fz > 185,
        text: 'Siła zwarcia wciąż bardzo wysoka. Sprawdź, czy nie "dusi" odpowietrzenia formy.' },
      { after: 5, when: (v) => meltTemp(v).Tm > 260,
        text: 'Temperatura masy przekracza górną granicę okna materiałowego (260°C) – tworzywo zaczyna się degradować, zanim dotrze do gniazda.' },
      { after: 7, when: (v) => v.Prz > 20,
        text: 'Wysokie przeciwciśnienie dogrzewa materiał już w trakcie dozowania – to dodatkowe źródło ciepła, niezależne od temperatur stref.' },
      { after: 9, when: (v, m) => cushion(v, m).raw < 5,
        text: 'Przy okazji sprawdź poduszkę – poniżej 5 mm cykl i tak nie zostanie zaliczony.' }
    ]
  },

  przypalenia_D01: {
    id: 'przypalenia',
    code: 'D-01',
    rootParam: 'Pw5', // parametr-przyczyna (tryb administratora)
    label: 'D-01 · Efekt Diesla — przypadek 1',
    learningGoal: BURN_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Na końcu drogi płynięcia, w narożu naprzeciw dolotu, pojawiają się czarne przypalenia. Wada jest zawsze w tym samym miejscu. Masa i wymiary są w normie.',
      facts: ['Czarne przypalenia na końcu drogi płynięcia', 'Stałe miejsce wady', 'Masa w normie']
    },
    solutionSummary: 'Przyczyną była za wysoka prędkość ostatniego stopnia wtrysku V5 (130 mm/s). Na końcu napełniania powietrze nie zdążyło uciec przez odpowietrzenia, zostało gwałtownie sprężone i nagrzane – efekt Diesla przypalał tworzywo. Prawidłowy zakres V5 to ok. 70–110 mm/s (profil szybko–wolno na końcu). Temperatura stopu nie ma tu znaczenia – to problem odpowietrzenia.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pw5: 130 },
    reference: { Pw5: 90 },
    focus: ['Pw5'],
    pass: PASS,
    processModel: burnModel('speed'),
    changeNotes: [TEMP_NOTE],
    otherParameters: DIESEL_OTHER,
    hints: [
      { after: 3, text: 'Wada jest na końcu drogi płynięcia. Co dzieje się z powietrzem w gnieździe w ostatniej fazie napełniania?' }
    ]
  },

  przypalenia_D02: {
    id: 'przypalenia',
    code: 'D-02',
    rootParam: 'Fz', // parametr-przyczyna (tryb administratora)
    label: 'D-02 · Efekt Diesla — przypadek 2',
    learningGoal: BURN_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Po przezbrojeniu na końcu drogi płynięcia pojawiły się czarne przypalenia. Odpowietrzenia zostały wyczyszczone, a wada nie zniknęła. Prędkości i temperatury są takie same jak w poprzednim zleceniu.',
      facts: ['Przypalenia po przezbrojeniu', 'Odpowietrzenia czyste', 'Prędkości i temperatury bez zmian']
    },
    solutionSummary: 'Przyczyną była za duża siła zwarcia (1000 kN). Nadmierny docisk płyt zgniatał kanały odpowietrzające na płaszczyźnie podziału, więc powietrze nie mogło uciec i przypalało tworzywo na końcu drogi płynięcia. Siłę zwarcia ustawia się z obliczenia z zapasem, ale nie więcej niż ok. 20% ponad wymaganą (PPS): tutaj ok. 530–720 kN. Poniżej ok. 530 kN pojawia się wypływka.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Fz: 1000 },
    reference: { Fz: 600 },
    focus: ['Fz'],
    pass: PASS,
    processModel: burnModel('speed'),
    changeNotes: [TEMP_NOTE],
    otherParameters: DIESEL_OTHER,
    hints: [
      { after: 3, text: 'Odpowietrzenia są czyste, prędkości bez zmian. Co jeszcze może zamykać drogę ucieczki powietrza na płaszczyźnie podziału?' }
    ]
  },

  smugi_SP01: {
    id: 'smugi_przypalone',
    code: 'SP-01',
    rootParam: 'Ob', // parametr-przyczyna (tryb administratora)
    label: 'SP-01 · Smugi przypalonego materiału — przypadek 1',
    learningGoal: STREAK_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Na powierzchni widać brązowe i srebrzyste smugi, zaczynające się przy dolocie. Materiał był suszony zgodnie z instrukcją. Czas dozowania jest wyraźnie krótszy niż zwykle.',
      facts: ['Brązowe/srebrzyste smugi od dolotu', 'Suszenie zgodne z instrukcją', 'Krótszy czas dozowania']
    },
    solutionSummary: 'Przyczyną były za wysokie obroty ślimaka (1,2 m/s). Duże ścinanie podczas dozowania lokalnie przegrzewało stop ponad próg degradacji – stąd smugi przypalonego materiału. Prawidłowy zakres to ok. 0,15–0,9 m/s – dolną granicę wyznacza czas dozowania, który musi zmieścić się w czasie chłodzenia. Temperatura cylindra i przeciwciśnienie działają pomocniczo.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Ob: 1.2 },
    reference: { Ob: 0.6 },
    focus: ['Ob'],
    pass: PASS,
    processModel: burnModel('Ob'),
    otherParameters: STREAK_OTHER,
    hints: [
      { after: 3, text: 'Czas dozowania jest krótszy niż zwykle. Co podczas dozowania dodatkowo nagrzewa stop?' }
    ]
  },

  smugi_SP02: {
    id: 'smugi_przypalone',
    code: 'SP-02',
    rootParam: 'Prz', // parametr-przyczyna (tryb administratora)
    label: 'SP-02 · Smugi przypalonego materiału — przypadek 2',
    learningGoal: STREAK_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Na powierzchni widać brązowe i srebrzyste smugi, zaczynające się przy dolocie. Materiał był suszony zgodnie z instrukcją. Czas dozowania jest dłuższy niż zwykle.',
      facts: ['Brązowe/srebrzyste smugi od dolotu', 'Suszenie zgodne z instrukcją', 'Dłuższy czas dozowania']
    },
    solutionSummary: 'Przyczyną było za wysokie przeciwciśnienie (40 bar). Wysokie ciśnienie plastyfikacji zwiększało ścinanie i lokalnie przegrzewało stop ponad próg degradacji, a przy okazji wydłużało dozowanie. Prawidłowy zakres to ok. 0–25 bar – tyle, ile potrzeba do jednorodnego stopu. Temperatura cylindra i obroty działają pomocniczo.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Prz: 40 },
    reference: { Prz: 10 },
    focus: ['Prz'],
    pass: PASS,
    processModel: burnModel('Prz'),
    otherParameters: STREAK_OTHER,
    hints: [
      { after: 3, text: 'Czas dozowania jest dłuższy niż zwykle. Co podczas dozowania stawia opór cofającemu się ślimakowi?' }
    ]
  }
}
