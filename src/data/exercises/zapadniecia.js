// =============================================================
// ĆWICZENIA – wada: zapadnięcia (wciągi nad grubymi przekrojami)
//
// Wspólny model 'sinkMark' (src/data/params.js → simulateTrainingCycle).
// Punkt pracy OK dla bazowej receptury (V/P 12 mm, dawka 60 mm, Fz 175 t):
//   Pd 70–90 bar przy Td 7 s,  Td 6–10 s przy Pd 80 bar.
// Za mało → zapadnięcie; za dużo (Pd ≥ 95 bar lub Td > 10 s) → wypływka.
// =============================================================

const BASE_START = {
  T1: 225, T2: 230, T3: 235, T4: 240, T5: 245, TR: 60,
  doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
  Pp: 12, Pd: 80, Td: 7, GR: 140,
  Prz: 10, Ob: 0.6, Deko: 6,
  Tr: 40, Ts: 40, Fz: 175, Tc: 35
}

const SINK_MODEL = {
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
  shrinkage: 0.045,
  shrinkPerMeltDegree: 0.003,
  maxSinkDepth: 0.35,
  sinkTolerance: 0.035,
  flashCompensation: 1.2,
  referenceClampForce: 175,
  overpackMassFactor: 0.3,
  minimumCushion: 3,
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

const MACHINE = { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 }
const MATERIAL = { name: 'PP MFI 12', tmMin: 220, tmMax: 260, moldMin: 20, moldMax: 60 }
const PASS = { target: 12, others: 60, cushion: 3, requireProcessWindow: true }
const GOAL = 'Zdiagnozuj przyczynę zapadnięć i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'

export const ZAPADNIECIA_EXERCISES = {
  zapadniecia_Z01: {
    id: 'zapadniecia',
    code: 'Z-01',
    label: 'Z-01 · Zapadnięcia — przypadek 1',
    learningGoal: GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Na powierzchni nad żebrami widać wklęśnięcia. Detal jest wypełniony do końca. Każda sztuka wygląda tak samo, a masa jest trochę niższa niż zwykle.',
      facts: ['Wklęśnięcia nad grubszymi miejscami', 'Detal kompletny', 'Wada powtarzalna']
    },
    solutionSummary: 'Przyczyną było za niskie ciśnienie docisku (40 bar). Docisk nie kompensował skurczu objętościowego grubych przekrojów. Prawidłowe okno przy czasie docisku 7 s to 70–90 bar. Od ok. 95 bar gniazdo jest przepakowane i pojawia się wypływka — dlatego nie podnosi się docisku „na zapas”.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pd: 40 },
    reference: { Pd: 80, Td: 7 },
    focus: ['Pd', 'Td', 'doz', 'Pp'],
    pass: PASS,
    processModel: SINK_MODEL,
    hints: [
      { after: 3, text: 'Obserwuj masę wypraski. Która faza cyklu uzupełnia materiał po napełnieniu gniazda?' },
      { after: 5, when: (v) => v.Td > 10, text: 'Wydłużanie docisku ponad zamarznięcie przewężki niewiele daje, a przedłuża cykl.' }
    ]
  },

  zapadniecia_Z02: {
    id: 'zapadniecia',
    code: 'Z-02',
    label: 'Z-02 · Zapadnięcia — przypadek 2',
    learningGoal: GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Nad grubszymi miejscami detalu pojawiają się zapadnięcia. Detal jest kompletny, wada powtarza się na każdej sztuce. Masa wyprasek jest niższa niż w poprzedniej partii.',
      facts: ['Zapadnięcia nad grubszymi przekrojami', 'Detal kompletny', 'Masa obniżona i stabilna']
    },
    solutionSummary: 'Przyczyną był za krótki czas docisku (2 s). Docisk kończył się, zanim przewężka zamarzła (ok. 6 s), więc skurcz nie był kompensowany. Prawidłowe okno przy 80 bar to 6–10 s — masa rośnie do ok. 6 s i potem się stabilizuje. Powyżej 10 s gniazdo jest przepakowane i pojawia się wypływka, a cykl niepotrzebnie się wydłuża.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Td: 2 },
    reference: { Pd: 80, Td: 7 },
    focus: ['Td', 'Pd', 'doz', 'Pp'],
    pass: PASS,
    processModel: SINK_MODEL,
    hints: [
      { after: 3, text: 'Porównaj masę kolejnych cykli. Czy materiał jest jeszcze dociskany, gdy przewężka jest otwarta?' },
      { after: 5, when: (v) => v.Pd > 90, text: 'Samo podnoszenie ciśnienia przy krótkim docisku grozi wypływką, a nie usuwa przyczyny.' }
    ]
  },

  zapadniecia_Z03: {
    id: 'zapadniecia',
    code: 'Z-03',
    label: 'Z-03 · Zapadnięcia — przypadek 3',
    learningGoal: GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Detal ma zapadnięcia nad żebrami. Ustawiacz podnosił już ciśnienie docisku, ale wada nie zniknęła. Detal jest wypełniony, każda sztuka wygląda podobnie.',
      facts: ['Zapadnięcia nad żebrami', 'Podniesienie ciśnienia docisku nie pomogło', 'Detal kompletny']
    },
    solutionSummary: 'Przyczyną była za mała dawka: poduszka spadała do 0 mm i ślimak dochodził do przodu w fazie docisku, więc docisk nie miał czym kompensować skurczu. Trzeba zwiększyć dawkę i przesunąć V/P o tyle samo (np. dozowanie 60 mm, V/P 12 mm), aby napełnianie się nie zmieniło, a poduszka wynosiła co najmniej 3 mm. Samo zwiększenie dawki bez przesunięcia V/P przepełnia gniazdo przed dociskiem i daje wypływkę.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, doz: 52, Pp: 4 },
    reference: { doz: 60, Pp: 12, Pd: 80, Td: 7 },
    focus: ['doz', 'Pp', 'Pd', 'Td'],
    pass: PASS,
    processModel: SINK_MODEL,
    hints: [
      { after: 3, text: 'Sprawdź poduszkę po docisku. Czy ślimak ma jeszcze drogę, żeby dociskać materiał?' },
      { after: 5, when: (v) => v.doz > 52 && v.Pp < 6, text: 'Większa dawka przy tej samej pozycji V/P wydłuża też napełnianie. Co dzieje się z wypełnieniem przed dociskiem?' }
    ]
  }
}
