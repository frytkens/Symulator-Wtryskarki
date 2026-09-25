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
    label: 'N-01 · Niedolanie: zbyt wczesne przełączenie V/P',
    learningGoal: 'Rozpoznaj zbyt wczesne przełączenie V/P na podstawie niepełnego detalu, obniżonej masy i prawidłowej poduszki.',
    machine: { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 220, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 225, T2: 230, T3: 235, T4: 240, T5: 245, TR: 60,
      doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
      Pp: 20, Pd: 75, Td: 6, GR: 140,
      Prz: 10, Ob: 0.6, Deko: 5,
      Tr: 40, Ts: 40, Fz: 175, Tc: 35
    },
    reference: {
      T1: 225, T2: 230, T3: 235, T4: 240, T5: 245,
      doz: 60, Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90, Pw5: 90,
      Pp: 12, Pd: 75, Td: 6, GR: 140,
      Prz: 10, Ob: 0.6, Deko: 5, Tr: 40, Ts: 40, Fz: 175
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
      pressurePerColdMeltDegree: 1.5,
      pressurePerColdMoldDegree: 0.45,
      pressurePerExtraSpeed: 0.25,
      flowPerMeltDegree: 0.004,
      flowPerMoldDegree: 0.002,
      referenceHoldingPressure: 75,
      gateFreezeTime: 6,
      minimumCushion: 5,
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
    hints: [
      { after: 2, text: 'Porównaj drogę dozowania, pozycję V/P i poduszkę. Czy naprawdę brakuje materiału?' },
      { after: 4, when: (v) => v.doz > 66, text: 'Poduszka była prawidłowa już na początku. Zwiększenie dawki nie usuwa przyczyny.' },
      { after: 5, when: (v) => v.Pp >= 18, text: 'Wyższa pozycja Pp oznacza wcześniejsze przełączenie. Sprawdź, jaką część gniazda napełniasz w fazie prędkościowej.' }
    ]
  },

  niedolanie_B: {
    id: 'niedolanie',
    label: 'Niedolanie – wariant B: „poduszka jest, problem gdzie indziej”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 },
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
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0.55 },
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
