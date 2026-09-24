// =============================================================
// ĆWICZENIA – wada: wahania wagi i wymiarów (niestabilna poduszka)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, cushionSpread, dekoPct } from '../params.js'

const MACH = { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 }
const MAT  = { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 }

export const WAHANIA_EXERCISES = {
  wahania: {
    id: 'wahania',
    label: 'Wahania wagi – wariant A: „poduszka nie trzyma wartości”',
    machine:  { ...MACH },
    material: { ...MAT },
    // Trzy niezależne przyczyny rozrzutu naraz:
    //   Pw1 38  -> zawór zwrotny siada niepowtarzalnie
    //   Deko 9 przy doz 62 = 14.5% -> powyżej reguły 10%
    //   Prz 3   -> brak stabilizacji dozowania
    start: {
      T1: 240, T2: 240, T3: 240, T4: 235, T5: 230, TR: 60,
      doz: 62, Pw1: 38, Pw2: 125, Pw3: 115, Pw4: 95, Pw5: 15,
      Pp: 9, Pd: 95, Td: 9, GR: 140,
      Prz: 3, Ob: 0.6, Deko: 9,
      Tr: 52, Ts: 52, Fz: 180, Tc: 45
    },
    // Zweryfikowane silnikiem: wahania=3%, najgorsza wada poboczna (wyplywy)=36%,
    // poduszka=7.7mm, rozrzut=0.1mm -> PASS
    reference: {
      T1: 240, T2: 240, T3: 240, T4: 235, T5: 230,
      doz: 62, Pw1: 100, Pw2: 125, Pw3: 115, Pw4: 95, Pw5: 15,
      Pp: 9, Pd: 95, Td: 9,
      Prz: 14, Deko: 4,
      Tr: 52, Ts: 52, Fz: 180
    },
    focus: ['Pw1', 'Deko', 'Prz', 'doz', 'Pp'],
    pass: { target: 12, others: 40, cushion: 5 },
    keyNumber: { label: 'Maks. dekompresja przy doz 62 mm (10% dawki)', value: 6.2, unit: 'mm' },
    hints: [
      { after: 3,
        text: 'Poduszka w LOGU nie trzyma wartości. Pojedyncze cykle lecą w dół – co pozwala materiałowi uciec wstecz?' },
      { after: 5, when: (v) => v.Pw1 < 60,
        text: 'Zawór zwrotny musi siadać POWTARZALNIE. Co w nastawach decyduje o momencie jego zamknięcia?' },
      { after: 7, when: (v) => dekoPct(v) > 10,
        text: 'Policz: dekompresja / skok dozowania x 100%. Ile wyszło? Ile powinno być max?' },
      { after: 9, when: (v) => v.Prz < 8,
        text: 'Dozowanie bez przeciwciśnienia jest nierówne cykl po cyklu.' },
      { after: 12, when: (v, m) => cushionSpread(v, m) > 1.5,
        text: 'Rozrzut nadal duży. Sprawdzałeś WSZYSTKIE trzy tropy: Pw1, dekompresję, przeciwciśnienie?' }
    ]
  },

  wahania_B: {
    id: 'wahania',
    label: 'Wahania wagi – wariant B: „to nie są nastawy” (zużyty zawór)',
    // leak 0.5 -> stały rozrzut 1.6 mm, NIE do zgaszenia żadną nastawą.
    // Ćwiczenie jest NIEZALICZALNE i to jest cel dydaktyczny:
    // uczestnik ma dojść do wniosku "to mechanika, nie proces".
    machine:  { ...MACH, leak: 0.5 },
    material: { ...MAT },
    start: {
      T1: 240, T2: 240, T3: 240, T4: 235, T5: 230, TR: 60,
      doz: 62, Pw1: 100, Pw2: 125, Pw3: 115, Pw4: 95, Pw5: 15,
      Pp: 9, Pd: 95, Td: 9, GR: 140,
      Prz: 14, Ob: 0.6, Deko: 4,
      Tr: 52, Ts: 52, Fz: 180, Tc: 45
    },
    focus: ['Pw1', 'Deko', 'Prz'],
    pass: { target: 12, others: 40, cushion: 5 },
    hints: [
      { after: 4,  text: 'Nastawy wyglądają wzorowo. A poduszka nadal skacze.' },
      { after: 8,  text: 'Ile parametrów już ruszyłeś? Czy którykolwiek zmniejszył ROZRZUT?' },
      { after: 12, text: 'Stabilna poduszka to nastawa. Skacząca poduszka to mechanika – zawór zwrotny i cylinder.' }
    ]
  }

  // ——— Miejsce na kolejne warianty wahań ———
}
