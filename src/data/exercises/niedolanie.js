// =============================================================
// ĆWICZENIA – wada: niedolanie (detal niecałkowicie wypełniony)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, meltTemp } from '../params.js'

export const NIEDOLANIE_EXERCISES = {
  niedolanie: {
    id: 'niedolanie',
    label: 'Niedolanie – wariant A: „maszyna nie ma czym dolać”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 190, T2: 195, T3: 200, T4: 205, T5: 210, TR: 60,
      doz: 40, Pw1: 40, Pw2: 95, Pw3: 95, Pw4: 95, Pw5: 25,
      Pp: 16, Pd: 110, Td: 9, GR: 140,
      Prz: 14, Ob: 0.6, Deko: 6,
      Tr: 20, Ts: 20, Fz: 175, Tc: 45
    },
    // podgląd wyłącznie dla trenera (widok admin)
    // Zweryfikowane silnikiem: niedolanie=11%, najgorsza wada poboczna (wyplywy)=39%, poduszka=18.7mm → PASS
    reference: {
      T1: 230, T2: 240, T3: 245, T4: 250, T5: 255,
      doz: 70, Pw1: 120, Pw2: 125, Pw3: 115, Pw4: 95, Pw5: 15,
      Pp: 7, Pd: 95, Td: 9,
      Prz: 12, Deko: 5, Tr: 55, Ts: 55, Fz: 185
    },
    focus: ['doz', 'Pw1', 'Pp', 'T1', 'T2', 'T3', 'T4', 'T5', 'Tr'],
    pass: { target: 12, others: 40, cushion: 5 },
    keyNumber: { label: 'Droga na napełnienie gniazda', value: 45.3, unit: 'mm' },
    hints: [
      { after: 2, when: (v, m) => cushion(v, m).raw < 5,
        text: 'Poduszka poniżej 5 mm – docisk nie ma na co działać.' },
      { after: 4, when: (v) => v.doz < 55,
        text: 'Cztery cykle, ryzyko prawie nie drgnęło. Coś blokuje efekt.' },
      { after: 5, when: (v) => meltTemp(v).Tm < 235 && v.T2 <= 215,
        text: 'Podniosłeś dyszę. O ile wzrosła temperatura MASY? Dlaczego tak mało?' },
      { after: 7, when: (v) => v.doz < 55,
        text: 'Droga na napełnienie: 45,3 mm. Twój skok dozowania: ' }
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
