import { NIEDOLANIE_EXERCISES } from './niedolanie.js'
import { PRZYPALENIA_EXERCISES } from './przypalenia.js'
import { WYPLYWY_EXERCISES } from './wyplywy.js'
import { WAHANIA_EXERCISES } from './wahania.js'
import { ZAPADNIECIA_EXERCISES } from './zapadniecia.js'
import { loadOverrides } from '../adminOverrides.js'
import { registerReferenceModels } from '../params.js'

export const EXERCISES = {
  ...NIEDOLANIE_EXERCISES,
  ...PRZYPALENIA_EXERCISES,
  ...WYPLYWY_EXERCISES,
  ...WAHANIA_EXERCISES,
  ...ZAPADNIECIA_EXERCISES
}

// Modele referencyjne do wykrywania wad ubocznych (te same, co w ćwiczeniach danej wady):
// zapadnięcia + niedolanie + zapady po wyformowaniu (Z-03), wypływka (W-04, siła rozwierająca),
// przypalenia i smugi (D-01, wszystkie źródła ścinania bez ograniczeń), zawór zwrotny (N-02).
const burnRef = EXERCISES.przypalenia_D01.processModel
registerReferenceModels({
  sink: { processModel: EXERCISES.zapadniecia_Z03.processModel },
  flash: { processModel: EXERCISES.wyplywy_W04.processModel },
  burn: { processModel: { ...burnRef, burn: { ...burnRef.burn, helperCap: Infinity } } },
  valve: { processModel: EXERCISES.niedolanie_N012.processModel }
})

// Scenariusze pozostają w kodzie i mogą być używane przez panel trenera,
// ale na liście kursanta pokazujemy obecnie tylko zatwierdzony moduł N-01.
export const VISIBLE_EXERCISE_KEYS = new Set([
  'niedolanie',
  'niedolanie_N012',
  'niedolanie_N013',
  'zapadniecia_Z01',
  'zapadniecia_Z02',
  'zapadniecia_Z03',
  'wyplywy_W01',
  'wyplywy_W02',
  'wyplywy_W03',
  'wyplywy_W04',
  'przypalenia_D01',
  'przypalenia_D02',
  'smugi_SP01',
  'smugi_SP02'
])

// Wartości startowe ćwiczenia: domyślne → scenariusz → nadpisania administratora.
export function exerciseValues(key, defaultValuesFn, overrides = loadOverrides()) {
  const ex = EXERCISES[key]
  if (!ex) return defaultValuesFn()
  return { ...defaultValuesFn(), ...ex.start, ...(overrides.starts[key] || {}) }
}

export function exercisesForWada(wadaId) {
  return Object.entries(EXERCISES)
    .filter(([key, ex]) => ex.id === wadaId && VISIBLE_EXERCISE_KEYS.has(key))
    .map(([key, ex]) => ({ key, label: ex.label }))
}
