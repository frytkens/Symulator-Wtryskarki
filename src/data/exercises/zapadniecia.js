// =============================================================
// ĆWICZENIA – wada: zapadnięcia (wciągi nad grubymi przekrojami)
//
// Wspólny model 'sinkMark' (src/data/params.js → simulateTrainingCycle).
// Punkt pracy OK dla bazowej receptury (V/P 12 mm, dawka 60 mm, Fz 600 kN):
//   Z-01 Pd 70–90 bar przy Td 7 s (zapady daleko od dolotu), Z-03 Tc ≥ ok. 23 s,
//    Td 6–10 s przy Pd 80 bar, poduszka ≥ 5 mm.
// Za mało → zapadnięcie; za dużo (Pd ≥ 95 bar lub Td > 10 s) → wypływka.
// =============================================================

export const BASE_START = {
  T1: 225, T2: 230, T3: 235, T4: 240, T5: 245, TR: 60,
  doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
  Pp: 12, Pd: 80, Td: 7, GR: 140,
  Prz: 10, Ob: 0.6, Deko: 6,
  Tr: 40, Ts: 40, Fz: 600, Tc: 35
}

export const SINK_MODEL = {
  type: 'sinkMark',
  referenceMass: 29.1,
  meltVolumeFactor: 1.115,
  goodFill: 0.985,
  defectSpan: 0.22,
  basePressure: 92,
  referenceMeltTemp: 238,
  referenceMoldTemp: 40,
  referenceSpeed: 90,
  pressurePerColdMeltDegree: 1.5,
  pressurePerColdMoldDegree: 0.45,
  pressurePerExtraSpeed: 0.25,
  flowPerMeltDegree: 0.004,
  flowPerMoldDegree: 0.002,
  // dopełnienie gniazda po V/P (szybkie, początek docisku)
  referenceHoldingPressure: 40,
  fillHoldTime: 1.5,
  fillReserveMin: 1,
  maxPackingFill: 0.05,
  // kompensacja skurczu
  packReferencePressure: 80,
  gateFreezeTime: 6,
  freezePerMoldDegree: 0.01,
  freezePerMeltDegree: 0.004,
  postFreezeFactor: 0.28,
  maxHoldFactor: 1.4,
  shrinkage: 0.045,
  shrinkPerMeltDegree: 0.003,
  maxSinkDepth: 0.35,
  sinkTolerance: 0.035,
  flashCompensation: 1.2,
  flashHoldingPressure: 120, // bar przy Fz 600 kN
  referenceClampForce: 600,
  overpackMassFactor: 0.3,
  minimumCushion: 5, // PPS: poduszka min. 5 mm
  maximumCushion: 12,
  // okno V/P i ciśnienie – jak w N-01
  vpFillMin: 0.94,
  vpFillMax: 0.98,
  finalFillMin: 0.985,
  minimumHoldingStroke: 0.5,
  pressureRiseStart: 0.80,
  fillPressureRise: 25,
  lateFillStart: 0.98,
  latePressureSpike: 30,
  maximumMeltTemp: 260,
  referenceDose: 60,
  referenceScrewSpeed: 0.6,
  referenceBackPressure: 10,
  referenceDosingTime: 6.5,
  backPressureTimeFactor: 0.012,
  auxiliaryTime: 6
}

export const MACHINE = { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 }
export const MATERIAL = { name: 'PP MFI 12', tmMin: 220, tmMax: 260, moldMin: 20, moldMax: 60 }
export const PASS = { target: 12, others: 60, cushion: 5, requireProcessWindow: true }
const GOAL = 'Zdiagnozuj przyczynę zapadnięć i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'

const SINK_OTHER = {
  source: 'PPS ENGEL, „Wciągi/zapady – działania naprawcze”, str. 45–47',
  items: [
    'Poduszka min. 5 mm i stabilna – inaczej zwiększyć drogę dozowania, sprawdzić zawór zwrotny i zasilanie materiału.',
    'Zapady przy dolocie lub w grubych miejscach: zoptymalizować czas docisku, podnieść ciśnienie docisku, obniżyć temperaturę formy, masy i prędkość wtrysku.',
    'Zapady z dala od dolotu lub w cienkich miejscach: czas docisku, ciśnienie docisku (ryzyko zapływek), wyższa prędkość, temperatura masy i formy (+).',
    'Zapady pojawiające się po wyformowaniu: wydłużyć czas chłodzenia.',
    'Przy zbyt wysokim docisku: ryzyko zapływek/gratu, problemy z wyformowaniem i uszkodzenia formy.'
  ]
}

export const ZAPADNIECIA_EXERCISES = {
  zapadniecia_Z01: {
    id: 'zapadniecia',
    code: 'Z-01',
    rootParam: 'Pd', // parametr-przyczyna (tryb administratora)
    label: 'Z-01 · Zapadnięcia — przypadek 1',
    learningGoal: GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Zapadnięcia widać na końcu detalu, daleko od punktu wtrysku. Przy dolocie powierzchnia jest w porządku. Detal jest wypełniony, każda sztuka wygląda tak samo, a masa jest trochę niższa niż zwykle.',
      facts: ['Zapadnięcia daleko od punktu wtrysku', 'Przy dolocie brak wady', 'Detal kompletny, wada powtarzalna']
    },
    solutionSummary: 'Przyczyną było za niskie ciśnienie docisku (40 bar). Na końcu drogi płynięcia, daleko od dolotu, docisk nie kompensował skurczu. Prawidłowe okno przy czasie docisku 7 s to 70–90 bar. Od ok. 95 bar gniazdo jest przepakowane i pojawia się wypływka. Wyższa temperatura masy i formy oraz wyższa prędkość wtrysku pomagają przenieść docisk dalej, ale same nie usuwają wady.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pd: 40 },
    reference: { Pd: 80, Td: 7 },
    focus: ['Pd', 'Td', 'doz', 'Pp'],
    pass: PASS,
    processModel: {
      ...SINK_MODEL,
      // zapady daleko od dolotu: kierunek wpływu temperatur i prędkości wg PPS str. 46 (+)
      freezePerMoldDegree: 0,
      freezePerMeltDegree: 0,
      shrinkPerMeltDegree: 0,
      transmission: { meltRef: 243, moldRef: 40, speedRef: 90, perMeltDegree: 0.006, perMoldDegree: 0.006, perSpeed: 0.001, max: 0.15 }
    },
    changeNotes: [
      { params: ['Pp', 'doz'], text: 'Punktu przełączenia nie przesuwaj za mocno – sprawdź, czy jest ustawiony prawidłowo. Przesuwając go (lub zmieniając skok dozowania) przenosisz część fazy wtrysku w fazę docisku.' }
    ],
    otherParameters: {
      source: 'PPS ENGEL, „Wciągi/zapady – działania naprawcze”, str. 45–46',
      items: [
        'Zapady z dala od dolotu lub w cienkościennym obszarze: zoptymalizować czas docisku i podnieść docisk (ew. chwilowo przeładować) – ryzyko zapływek, problemów z wyformowaniem i uszkodzenia formy.',
        'Wyższa prędkość wtrysku (+) oraz temperatura masy i formy (+) pomagają przenieść ciśnienie dalej; po zmianie temperatur czas docisku zoptymalizować na nowo.',
        'Poduszka min. 5 mm i stabilna.',
        'Zapady przy dolocie lub w grubych miejscach wymagają odwrotnych działań: niższa temperatura formy, masy i prędkość.'
      ]
    },
    hints: [
      { after: 3, text: 'Obserwuj masę wypraski. Która faza cyklu uzupełnia materiał po napełnieniu gniazda?' },
      { after: 5, when: (v) => v.Td > 10, text: 'Wydłużanie docisku ponad zamarznięcie przewężki niewiele daje, a przedłuża cykl.' }
    ]
  },

  zapadniecia_Z02: {
    id: 'zapadniecia',
    code: 'Z-02',
    rootParam: 'Td', // parametr-przyczyna (tryb administratora)
    label: 'Z-02 · Zapadnięcia — przypadek 2',
    learningGoal: GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Zapadnięcia widać blisko punktu wtrysku, w grubszym miejscu przy dolocie. Dalej od dolotu powierzchnia jest w porządku. Detal jest kompletny, wada powtarza się na każdej sztuce, a masa jest niższa niż zwykle.',
      facts: ['Zapadnięcia blisko punktu wtrysku', 'Dalej od dolotu brak wady', 'Detal kompletny, masa obniżona']
    },
    solutionSummary: 'Przyczyną był za krótki czas docisku (2 s). Przy dolocie nie potrzeba dużego ciśnienia – wystarczy uzupełniać materiał dłużej, aż przewężka zamarznie (ok. 6 s). Prawidłowe okno przy 80 bar to 6–10 s: masa rośnie do ok. 6 s i potem się stabilizuje. Powyżej 10 s gniazdo jest przepakowane i pojawia się wypływka, a cykl niepotrzebnie się wydłuża. Niższa temperatura masy i formy oraz niższa prędkość wtrysku pomagają, ale same nie usuwają wady.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Td: 2 },
    reference: { Pd: 80, Td: 7 },
    focus: ['Td', 'Pd', 'doz', 'Pp'],
    pass: PASS,
    processModel: {
      ...SINK_MODEL,
      // zapady przy dolocie / w grubym miejscu: kierunek wpływu wg PPS str. 45 (–)
      freezePerMoldDegree: 0,
      freezePerMeltDegree: 0,
      shrinkPerMeltDegree: 0,
      transmission: { meltRef: 243, moldRef: 40, speedRef: 90, perMeltDegree: -0.006, perMoldDegree: -0.006, perSpeed: -0.001, max: 0.15 }
    },
    changeNotes: [
      { params: ['Pp', 'doz'], text: 'Punktu przełączenia nie przesuwaj za mocno – sprawdź, czy jest ustawiony prawidłowo. Przesuwając go (lub zmieniając skok dozowania) przenosisz część fazy wtrysku w fazę docisku.' }
    ],
    otherParameters: {
      source: 'PPS ENGEL, „Wciągi/zapady – działania naprawcze”, str. 45',
      items: [
        'Zapady przy dolocie lub w grubym miejscu: najpierw zoptymalizować czas docisku (krzywa masy do zamarznięcia przewężki), potem ciśnienie docisku.',
        'Niższa temperatura formy (–), masy (–) i prędkość wtrysku (–) pomagają; wyższe – pogarszają.',
        'Poduszka min. 5 mm i stabilna.',
        'Zapady daleko od dolotu wymagają odwrotnych działań: wyższa prędkość, temperatura masy i formy.'
      ]
    },
    hints: [
      { after: 3, text: 'Porównaj masę kolejnych cykli. Czy materiał jest jeszcze dociskany, gdy przewężka jest otwarta?' },
      { after: 5, when: (v) => v.Pd > 90, text: 'Przy dolocie nie potrzeba dużego ciśnienia. Samo podnoszenie docisku grozi wypływką.' }
    ]
  },

  zapadniecia_Z03: {
    id: 'zapadniecia',
    code: 'Z-03',
    rootParam: 'Tc', // parametr-przyczyna (tryb administratora)
    label: 'Z-03 · Zapadnięcia — przypadek 3',
    learningGoal: GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Zaraz po wyjęciu z formy detal wygląda dobrze. Po kilku minutach na stole nad żebrami pojawiają się zapadnięcia. Masa jest prawidłowa, a podniesienie docisku nic nie zmieniło.',
      facts: ['Zapadnięcia pojawiają się po wyjęciu z formy', 'Masa prawidłowa', 'Podniesienie docisku nie pomogło']
    },
    solutionSummary: 'Przyczyną był za krótki czas chłodzenia (12 s). Detal był wyjmowany z zbyt cienką zastygłą warstwą, a gorący rdzeń kurczył się już poza formą. Przy formie 40°C potrzeba ok. 25 s chłodzenia (zaliczenie od ok. 23 s). Docisk nie pomaga, bo gniazdo jest prawidłowo dopakowane – masa jest w normie. Wyższa temperatura formy wydłuża wymagany czas chłodzenia (ok. +20% na +10°C).',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Tc: 12 },
    reference: { Tc: 25, Pd: 80, Td: 7 },
    focus: ['Tc', 'Tr', 'Ts'],
    pass: PASS,
    processModel: {
      ...SINK_MODEL,
      postEject: { coolingNeeded: 25, moldRef: 40, meltRef: 243, perMoldDegree: 0.02, perMeltDegree: 0.005, minFactor: 0.8, maxFactor: 1.5, maxSink: 0.3 }
    },
    otherParameters: {
      source: 'PPS ENGEL, „Wciągi/zapady – działania naprawcze”, str. 47; „Nie całkowicie wypełnione detale”, str. 37',
      items: [
        'Zapady bezpośrednio po wyformowaniu: sprawdzić odpowietrzenie, wymiary dolotu, stan granulatu (wilgoć), nagromadzenie materiału i stosunek grubości ścianek do żeber.',
        'Zapady pojawiające się później: wydłużyć czas chłodzenia.',
        'Niższa temperatura formy i masy skraca wymagany czas chłodzenia; wyższa – wydłuża (+10°C formy ≈ +20% czasu chłodzenia).',
        'Docisk i jego czas nie zastępują chłodzenia, gdy masa detalu jest prawidłowa.'
      ]
    },
    hints: [
      { after: 3, text: 'Masa jest w normie – materiału nie brakuje. Kiedy dokładnie pojawia się wada?' }
    ]
  }
}
