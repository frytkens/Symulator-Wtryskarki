// =============================================================
// ĆWICZENIA – rejestr wszystkich wariantów, po jednym pliku na wadę.
//
// Żeby dodać ćwiczenia dla kolejnej wady:
//   1. Skopiuj src/data/exercises/niedolanie.js do np. przypalenia.js,
//      zmień nazwę eksportu i `id` na wadę z DEFECTS w ../params.js.
//   2. Zaimportuj go tutaj i dopisz do obiektu EXERCISES poniżej.
// Silnika oceny (../params.js) nie trzeba ruszać.
//
// Struktura wpisu (patrz np. niedolanie.js):
//   id:       identyfikator wady z DEFECTS w params.js (np. 'niedolanie')
//   label:    nazwa wariantu widoczna w UI
//   machine:  parametry maszyny/detalu (do liczenia poduszki i drogi napełnienia)
//   material: okno przetwórcze materiału (tmMin/tmMax, moldMin/moldMax)
//   start:    WARTOŚCI WEJŚCIOWE – nastawy, od których uczestnik zaczyna ćwiczenie
//   reference: WARTOŚCI DOCELOWE – podgląd tylko dla trenera (widok admin)
//   focus:    lista parametrów podświetlanych jako "mające wpływ" na tę wadę
//   pass:     próg zaliczenia { target, others, cushion }
//   keyNumber: (opcjonalnie) liczba, którą uczestnik ma sam wyliczyć przed startem
//   hints:    (opcjonalnie) podpowiedzi po N cyklach, warunkowo (when) lub zawsze
// =============================================================

import { NIEDOLANIE_EXERCISES } from './niedolanie.js'
import { PRZYPALENIA_EXERCISES } from './przypalenia.js'
// import { WYPLYWY_EXERCISES } from './wyplywy.js'
// ...kolejne wady dopisać analogicznie

export const EXERCISES = {
  ...NIEDOLANIE_EXERCISES,
  ...PRZYPALENIA_EXERCISES
  // ...WYPLYWY_EXERCISES,
}

// wartości startowe ćwiczenia (uzupełnione defaultami dla pól nieujętych)
// defaultValuesFn: przekaż funkcję defaultValues() z params.js, żeby uniknąć zależności cyklicznej
export function exerciseValues(key, defaultValuesFn) {
  const ex = EXERCISES[key]
  if (!ex) return defaultValuesFn()
  return { ...defaultValuesFn(), ...ex.start }
}

// lista wariantów ćwiczeń zdefiniowanych dla danej wady, do wyboru w UI
// zwraca [] jeśli dla tej wady nie ma jeszcze żadnego ćwiczenia (wtedy symulator
// spada z powrotem na stare losowanie – patrz App.jsx)
export function exercisesForWada(wadaId) {
  return Object.entries(EXERCISES)
    .filter(([, ex]) => ex.id === wadaId)
    .map(([key, ex]) => ({ key, label: ex.label }))
}
