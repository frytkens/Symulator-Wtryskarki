import { NIEDOLANIE_EXERCISES } from './niedolanie.js'
import { PRZYPALENIA_EXERCISES } from './przypalenia.js'
import { WYPLYWY_EXERCISES } from './wyplywy.js'
import { WAHANIA_EXERCISES } from './wahania.js'
import { ZAPADNIECIA_EXERCISES } from './zapadniecia.js'

export const EXERCISES = {
  ...NIEDOLANIE_EXERCISES,
  ...PRZYPALENIA_EXERCISES,
  ...WYPLYWY_EXERCISES,
  ...WAHANIA_EXERCISES,
  ...ZAPADNIECIA_EXERCISES
}

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
  'wyplywy_W04'
])

export function exerciseValues(key, defaultValuesFn) {
  const ex = EXERCISES[key]
  if (!ex) return defaultValuesFn()
  return { ...defaultValuesFn(), ...ex.start }
}

export function exercisesForWada(wadaId) {
  return Object.entries(EXERCISES)
    .filter(([key, ex]) => ex.id === wadaId && VISIBLE_EXERCISE_KEYS.has(key))
    .map(([key, ex]) => ({ key, label: ex.label }))
}
