// =============================================================
// ĆWICZENIA – dane wejściowe (start) i docelowe (reference) dla wad wyprasek.
//
// To jest JEDYNY plik, w którym wpisujesz nowe ćwiczenia. Silnik oceny (params.js)
// nie trzeba ruszać – wystarczy dopisać kolejny wpis do EXERCISES poniżej.
//
// Struktura wpisu:
//   id:       identyfikator wady z DEFECTS w params.js (np. 'niedolanie')
//   label:    nazwa wariantu widoczna w UI
//   machine:  parametry maszyny/detalu (do liczenia poduszki i drogi napełnienia)
//             D=średnica ślimaka [mm], i=przełożenie ciśnień, Vpart=objętość
//             detalu+wlewek [cm³], Arzut=powierzchnia rzutu [cm²], leak=nieszczelność
//             zaworu zwrotnego (0 = sprawny, >0 = poduszka niestabilna)
//   material: okno przetwórcze materiału (tmMin/tmMax = temp. masy, moldMin/moldMax = temp. formy)
//   start:    WARTOŚCI WEJŚCIOWE – nastawy, od których uczestnik zaczyna ćwiczenie
//   reference: WARTOŚCI DOCELOWE – podgląd tylko dla trenera (widok admin),
//              nastawy które prowadzą do zaliczenia ćwiczenia
//   focus:    lista parametrów podświetlanych jako "mające wpływ" na tę wadę
//   pass:     próg zaliczenia { target: % wady docelowej, others: % max wad pobocznych, cushion: min. poduszka w mm }
//   keyNumber: (opcjonalnie) liczba, którą uczestnik ma sam wyliczyć przed startem
//   hints:    (opcjonalnie) podpowiedzi pojawiające się po N cyklach, warunkowo (when) lub zawsze
// =============================================================

import { cushion, meltTemp } from './params.js'

export const EXERCISES = {
  niedolanie: {
    id: 'niedolanie',
    label: 'Niedolanie – wariant A: „maszyna nie ma czym dolać”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 215, T2: 215, T3: 220, T4: 220, T5: 215, TR: 60,
      doz: 47, Pw1: 95, Pw2: 95, Pw3: 95, Pw4: 95, Pw5: 25,
      Pp: 14, Pd: 110, Td: 9, GR: 140,
      Prz: 14, Ob: 0.6, Deko: 6,
      Tr: 30, Ts: 30, Fz: 175, Tc: 45
    },
    // podgląd wyłącznie dla trenera (widok admin)
    reference: {
      T1: 245, T2: 245, T3: 240, T4: 235, T5: 230,
      doz: 70, Pw1: 125, Pw2: 125, Pw3: 115, Pw4: 95, Pw5: 15,
      Pp: 8, Pd: 95, Td: 9,
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

  // ——— Miejsce na kolejne ćwiczenia (np. przypalenia, wyplywy, zapadniecia, ...) ———
  // Skopiuj wzorzec powyżej, zmień `id` na wadę z DEFECTS w params.js i podmień
  // start/reference/focus/pass pod nowy scenariusz.
}

// wartości startowe ćwiczenia (uzupełnione defaultami dla pól nieujętych)
// defaultValuesFn: przekaż funkcję defaultValues() z params.js, żeby uniknąć zależności cyklicznej
export function exerciseValues(key, defaultValuesFn) {
  const ex = EXERCISES[key]
  if (!ex) return defaultValuesFn()
  return { ...defaultValuesFn(), ...ex.start }
}
