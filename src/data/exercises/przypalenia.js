// =============================================================
// ĆWICZENIA – wada: przypalenia (przypalenia / smugi termiczne od degradacji)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, meltTemp } from '../params.js'

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
  }

  // ——— Miejsce na kolejne warianty przypaleń ———
}
