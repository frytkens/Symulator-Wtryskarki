// =============================================================
// ĆWICZENIA – wada: niedolanie (detal niecałkowicie wypełniony)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, meltTemp } from '../params.js'

export const NIEDOLANIE_EXERCISES = {
  niedolanie: {
    id: 'niedolanie',
    code: 'N-01',
    rootParam: 'Pp', // parametr-przyczyna (tryb administratora)
    label: 'N-01 · Niedolanie — przypadek 1',
    learningGoal: 'Zdiagnozuj przyczynę niedolania i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.',
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Od kilku cykli detal nie wypełnia się do końca. Brak występuje stale w podobnym miejscu. Masa wypraski jest niższa niż zwykle, ale kolejne sztuki są do siebie podobne.',
      facts: ['Wada jest powtarzalna', 'Masa wypraski jest obniżona', 'Niedolanie występuje w podobnym miejscu']
    },
    solutionSummary: 'Przyczyną było zbyt wczesne przełączenie V/P. Prawidłowe okno uzyskano przy 94–98% wypełnienia w chwili przełączenia.',
    machine: { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 220, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 225, T2: 230, T3: 235, T4: 240, T5: 245, TR: 60,
      doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
      Pp: 20, Pd: 75, Td: 6, GR: 140,
      Prz: 10, Ob: 0.6, Deko: 5,
      Tr: 40, Ts: 40, Fz: 600, Tc: 35
    },
    reference: {
      T1: 225, T2: 230, T3: 235, T4: 240, T5: 245,
      doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
      Pp: 12, Pd: 75, Td: 6, GR: 140,
      Prz: 10, Ob: 0.6, Deko: 5, Tr: 40, Ts: 40, Fz: 600
    },
    focus: ['Pp', 'doz', 'Pw1', 'Pw2', 'Pw3', 'Pw4', 'Pw5', 'GR', 'Pd', 'Td', 'T1', 'T2', 'T3', 'T4', 'T5', 'Tr', 'Ts'],
    pass: { target: 12, others: 60, cushion: 5, requireProcessWindow: true },
    keyNumber: { label: 'Cel lekcji', value: 'znaleźć przyczynę niedolania', unit: '' },
    processModel: {
      type: 'shortShotVP',
      referenceMass: 29.1,
      // 32 cm³ is the cold part/cavity volume. During injection the PP melt has a
      // larger specific volume. The factor calibrates required screw stroke so
      // that V/P=12 mm corresponds to ~95% volumetric filling and packing ends
      // with a physically possible cushion below the V/P position.
      meltVolumeFactor: 1.115,
      goodFill: 0.985,
      defectSpan: 0.22,
      basePressure: 92,
      referenceMeltTemp: 238,
      referenceMoldTemp: 40,
      referenceSpeed: 90,
      // wyższa prędkość lekko poprawia napełnianie (+1% przy 120 mm/s, maks. +3%) – nie zastępuje V/P
      speedGainAboveRef: 0.03,
      maxSpeedFlow: 1.03,
      pressurePerColdMeltDegree: 1.5,
      pressurePerColdMoldDegree: 0.45,
      pressurePerExtraSpeed: 0.25,
      flowPerMeltDegree: 0.004,
      flowPerMoldDegree: 0.002,
      referenceHoldingPressure: 75,
      gateFreezeTime: 6,
      minimumCushion: 5,
      maximumCushion: 12, // rezerwa ponad to = maskowanie wczesnego V/P większą dawką
      maxPackingFill: 0.05,
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
    },
    otherParameters: {
      source: 'PPS ENGEL, „Nie całkowicie wypełnione detale – działania naprawcze”, str. 36–37',
      items: [
        'Dozowanie zwiększa się tylko wtedy, gdy ślimak dochodzi do przedniego położenia (poduszka ≈ 0).',
        'Graniczne ciśnienie wtrysku podnosi się tylko wtedy, gdy jest osiągane w fazie napełniania.',
        'Prędkość wtrysku (+) – krótsze napełnianie, ale większe ryzyko przypaleń i wypływki.',
        'Temperatura tworzywa (+) – lepsze płynięcie, wymaga cykli stabilizacyjnych.',
        'Temperatura formy (+) – +10°C wydłuża czas chłodzenia o ok. 20%.',
        'Sprawdzić otwór i temperaturę dyszy, odpowietrzenie, system dolotu i punkt wtrysku.'
      ]
    },
    // Komunikat po cyklu, w którym zmieniono wskazane parametry.
    changeNotes: [
      { params: ['Pd', 'Td'], text: 'Docisk uzupełnia tylko niewielki brak i skurcz. Zwróć uwagę, czy punkt przełączenia zapewnia prawie wypełniony detal na końcu fazy wtrysku.' }
    ],
    hints: [
      { after: 2, text: 'Porównaj drogę dozowania, pozycję V/P i poduszkę. Czy naprawdę brakuje materiału?' },
      { after: 4, when: (v) => v.doz > 66, text: 'Poduszka była prawidłowa już na początku. Zwiększenie dawki nie usuwa przyczyny.' },
      { after: 5, when: (v) => v.Pp >= 18, text: 'Wyższa pozycja Pp oznacza wcześniejsze przełączenie. Sprawdź, jaką część gniazda napełniasz w fazie prędkościowej.' }
    ]
  },

  niedolanie_N012: {
    id: 'niedolanie',
    code: 'N-01-2',
    rootParam: 'Deko', // parametr-przyczyna (tryb administratora)
    label: 'N-02 · Niedolanie — przypadek 2',
    learningGoal: 'Zdiagnozuj przyczynę niestabilnego niedolania i potwierdź poprawę trzema stabilnymi cyklami.',
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Co kilka cykli detal wychodzi niedolany. Raz brak jest niewielki, a innym razem wyraźnie większy. Masa wyprasek oraz poduszka zmieniają się, mimo że receptura nie była modyfikowana.',
      facts: ['Nasilenie niedolania zmienia się', 'Masa i poduszka nie są stabilne', 'Receptura nie była zmieniana']
    },
    solutionSummary: 'Przyczyną była za mała dekompresja i niestabilne zamykanie zaworu zwrotnego. Prawidłowy zakres wynosi 5–7 mm, czyli około 10% dawki 60 mm.',
    machine: { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 220, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 225, T2: 230, T3: 235, T4: 240, T5: 245, TR: 60,
      doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
      Pp: 12, Pd: 75, Td: 6, GR: 140,
      Prz: 10, Ob: 0.6, Deko: 1,
      Tr: 40, Ts: 40, Fz: 600, Tc: 35
    },
    reference: { Pp: 12, Deko: 6, Pw1: 90 },
    focus: ['Deko', 'doz', 'Pp', 'Pw1', 'Pd', 'Td', 'GR'],
    pass: { target: 12, others: 60, cushion: 5, requireProcessWindow: true, requiredStableCycles: 3 },
    keyNumber: { label: 'Prawidłowa dekompresja', value: '5–7', unit: 'mm' },
    processModel: {
      type: 'shortShotValve', valveCause: 'decompression',
      instabilityScale: 60,
      valveAdjust: {
        tempRef: { T1: 225, T2: 230, T3: 235 },
        tempWeights: { T1: 0.5, T2: 0.35, T3: 0.15 },
        perDegree: 0.005,
        firstSpeedRef: 90, perFirstSpeed: 0.002,
        backPressureRef: 10, perBackPressure: 0.006,
        maxPositive: 0.3, maxNegative: 0.4, maxWithoutRoot: 0.8
      },
      valveTargetRatio: 0.10, valveMinRatio: 0.083, valveMaxRatio: 0.117,
      referenceMass: 29.1, meltVolumeFactor: 1.115,
      goodFill: 0.985, defectSpan: 0.22,
      basePressure: 92, referenceMeltTemp: 238, referenceMoldTemp: 40, referenceSpeed: 90,
      pressurePerColdMeltDegree: 1.5, pressurePerColdMoldDegree: 0.45, pressurePerExtraSpeed: 0.25,
      flowPerMeltDegree: 0.001, flowPerMoldDegree: 0.002,
      referenceHoldingPressure: 75, gateFreezeTime: 6, minimumCushion: 5,
      maximumCushion: 12, // rezerwa ponad to = maskowanie wczesnego V/P większą dawką
      maxPackingFill: 0.055,
      vpFillMin: 0.94, vpFillMax: 0.98, finalFillMin: 0.985, minimumHoldingStroke: 0.5,
      pressureRiseStart: 0.80, fillPressureRise: 25, lateFillStart: 0.98, latePressureSpike: 30,
      maximumMeltTemp: 260, referenceDose: 60, referenceScrewSpeed: 0.6,
      referenceBackPressure: 10, referenceDosingTime: 6.5, backPressureTimeFactor: 0.012, auxiliaryTime: 6
    },
    otherParameters: {
      source: 'PPS ENGEL, „Wahania wagi i wymiarów – działania naprawcze”, str. 40',
      items: [
        'Poduszka musi wynosić min. 5 mm – przy za małej zwiększyć drogę dozowania.',
        'Przy wahaniach poduszki sprawdzić zużycie zaworu zwrotnego i cylindra.',
        'Zamykanie zaworu zwrotnego wspiera wyższa pierwsza prędkość wtrysku.',
        'Sprawdzić dekompresję i zasyp materiału.',
        'Niższa temperatura przednich stref cylindra (T1, T2) i niższe przeciwciśnienie wspierają powtarzalne zamykanie zaworu; wyższe – pogarszają.',
        'Przy bardzo krótkiej drodze wtrysku zamykanie zaworu może być gorsze – sprawdzić stosunek wagi wtrysku do średnicy ślimaka.',
        'Wyznaczyć efektywny czas docisku (krzywa masy) i wysokość docisku.'
      ]
    },
    hints: [
      { after: 2, text: 'Porównaj dekompresję z drogą dozowania. Ile wynosi 10% dawki?' },
      { after: 4, when: (v) => v.Deko < 5, text: 'Za mała dekompresja nie przygotowuje zaworu zwrotnego do powtarzalnego zamknięcia.' }
    ]
  },

  niedolanie_N013: {
    id: 'niedolanie',
    code: 'N-01-3',
    rootParam: 'Pw1', // parametr-przyczyna (tryb administratora)
    label: 'N-03 · Niedolanie — przypadek 3',
    learningGoal: 'Zdiagnozuj przyczynę niestabilnego początku wtrysku i potwierdź poprawę trzema stabilnymi cyklami.',
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Początek fazy wtrysku nie jest powtarzalny. Detale mają różną masę, a od czasu do czasu pojawia się niedolanie. Nastawy nie były ostatnio zmieniane.',
      facts: ['Problem pojawia się na początku wtrysku', 'Masa detali jest zmienna', 'Niedolanie występuje okresowo']
    },
    solutionSummary: 'Przyczyną była za mała pierwsza prędkość wtrysku i opóźnione zamykanie zaworu zwrotnego. Prawidłowy zakres pierwszego stopnia wynosi 20–40 mm/s.',
    machine: { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 220, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 225, T2: 230, T3: 235, T4: 240, T5: 245, TR: 60,
      doz: 60, Pw1: 4, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
      Pp: 12, Pd: 75, Td: 6, GR: 140,
      Prz: 10, Ob: 0.6, Deko: 6,
      Tr: 40, Ts: 40, Fz: 600, Tc: 35
    },
    reference: { Pp: 12, Deko: 6, Pw1: 30 },
    focus: ['Pw1', 'Deko', 'doz', 'Pp', 'Pd', 'Td', 'GR'],
    pass: { target: 12, others: 60, cushion: 5, requireProcessWindow: true, requiredStableCycles: 3 },
    keyNumber: { label: 'Pierwsza prędkość', value: '20–40', unit: 'mm/s' },
    processModel: {
      type: 'shortShotValve', valveCause: 'firstSpeed',
      instabilityScale: 60,
      // Okresowe niedolanie: część cykli daje pełny detal, część wyraźnie niedolany –
      // jedna dobra sztuka nie świadczy o stabilnym procesie.
      valveLossBase: 1.2, valveLossJitter: 2.6,
      valveAdjust: {
        tempRef: { T1: 225, T2: 230, T3: 235 },
        tempWeights: { T1: 0.5, T2: 0.35, T3: 0.15 },
        perDegree: 0.005,
        dekoRef: 6, perDeko: 0.03,
        backPressureRef: 10, perBackPressure: 0.006,
        maxPositive: 0.3, maxNegative: 0.4, maxWithoutRoot: 0.8
      },
      valveSpeedMin: 20, valveSpeedMax: 40,
      referenceMass: 29.1, meltVolumeFactor: 1.115,
      goodFill: 0.985, defectSpan: 0.22,
      basePressure: 92, referenceMeltTemp: 238, referenceMoldTemp: 40, referenceSpeed: 90,
      pressurePerColdMeltDegree: 1.5, pressurePerColdMoldDegree: 0.45, pressurePerExtraSpeed: 0.25,
      flowPerMeltDegree: 0.004, flowPerMoldDegree: 0.002,
      referenceHoldingPressure: 75, gateFreezeTime: 6, minimumCushion: 5,
      maximumCushion: 12, // rezerwa ponad to = maskowanie wczesnego V/P większą dawką
      maxPackingFill: 0.055,
      vpFillMin: 0.94, vpFillMax: 0.98, finalFillMin: 0.985, minimumHoldingStroke: 0.5,
      pressureRiseStart: 0.80, fillPressureRise: 25, lateFillStart: 0.98, latePressureSpike: 30,
      maximumMeltTemp: 260, referenceDose: 60, referenceScrewSpeed: 0.6,
      referenceBackPressure: 10, referenceDosingTime: 6.5, backPressureTimeFactor: 0.012, auxiliaryTime: 6
    },
    otherParameters: {
      source: 'PPS ENGEL, „Wahania wagi i wymiarów – działania naprawcze”, str. 40',
      items: [
        'Poduszka musi wynosić min. 5 mm – przy za małej zwiększyć drogę dozowania.',
        'Przy wahaniach poduszki sprawdzić zużycie zaworu zwrotnego i cylindra.',
        'Zamykanie zaworu zwrotnego wspiera wyższa pierwsza prędkość wtrysku.',
        'Sprawdzić dekompresję i zasyp materiału – prawidłowa dekompresja (ok. 10% dawki) wspiera zamykanie zaworu.',
        'Niższa temperatura przednich stref cylindra (T1, T2) i niższe przeciwciśnienie pomagają; wyższe – pogarszają.',
        'Przy bardzo krótkiej drodze wtrysku zamykanie zaworu może być gorsze – sprawdzić stosunek wagi wtrysku do średnicy ślimaka.',
        'Wyznaczyć efektywny czas docisku (krzywa masy) i wysokość docisku.'
      ]
    },
    hints: [
      { after: 2, text: 'Pierwszy stopień wtrysku odpowiada za szybkie i powtarzalne zamknięcie zaworu zwrotnego.' },
      { after: 4, text: 'Oceniaj masę i poduszkę w kolejnych cyklach, nie w jednym. Która faza wtrysku decyduje o chwili zamknięcia zaworu?' }
    ]
  },

  niedolanie_B: {
    id: 'niedolanie',
    label: 'Niedolanie – wariant B: „poduszka jest, problem gdzie indziej”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 195, T2: 195, T3: 200, T4: 200, T5: 195, TR: 60,
      doz: 72, Pw1: 30, Pw2: 30, Pw3: 30, Pw4: 30, Pw5: 20,
      Pp: 16, Pd: 110, Td: 9, GR: 140,
      Prz: 14, Ob: 0.6, Deko: 6,
      Tr: 20, Ts: 20, Fz: 175, Tc: 45
    },
    focus: ['Pw1', 'Pp', 'T1', 'T2', 'T3', 'T4', 'T5', 'Tr'],
    pass: { target: 12, others: 40, cushion: 5 },
    hints: [
      { after: 3, when: (v) => v.doz > 80,
        text: 'Poduszka była zdrowa od startu. Dozowanie to tu fałszywy trop.' }
    ]
  },

  niedolanie_C: {
    id: 'niedolanie',
    label: 'Niedolanie – wariant C: „to nie są nastawy” (ukryta usterka)',
    // leak 0.55 = przeciekający zawór zwrotny. Poduszka SKACZE cykl po cyklu.
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 150, dNozzle: 3.0, leak: 0.55 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 240, T2: 240, T3: 240, T4: 235, T5: 230, TR: 60,
      doz: 66, Pw1: 125, Pw2: 125, Pw3: 115, Pw4: 95, Pw5: 15,
      Pp: 8, Pd: 95, Td: 9, GR: 140,
      Prz: 12, Ob: 0.6, Deko: 5,
      Tr: 52, Ts: 52, Fz: 180, Tc: 45
    },
    focus: ['doz', 'Pw1', 'Pp', 'T1', 'T2', 'T3', 'T4', 'T5', 'Tr'],
    pass: { target: 12, others: 40, cushion: 5 },
    hints: [
      { after: 5, text: 'Nastawy wyglądają wzorowo. Spójrz na poduszkę w LOGU, nie w tym cyklu.' },
      { after: 8, text: 'Stabilna poduszka to nastawa. Skacząca poduszka to mechanika.' }
    ]
  }

  // ——— Miejsce na kolejne warianty niedolania ———
}
