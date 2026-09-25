import { NIEDOLANIE_EXERCISES } from './niedolanie.js'
import { PRZYPALENIA_EXERCISES } from './przypalenia.js'
import { WYPLYWY_EXERCISES } from './wyplywy.js'
import { WAHANIA_EXERCISES } from './wahania.js'

export const EXERCISES = {
  ...NIEDOLANIE_EXERCISES,
  ...PRZYPALENIA_EXERCISES,
  ...WYPLYWY_EXERCISES,
  ...WAHANIA_EXERCISES
}

export function exerciseValues(key, defaultValuesFn) {
  const ex = EXERCISES[key]
  if (!ex) return defaultValuesFn()
  return { ...defaultValuesFn(), ...ex.start }
}

export function exercisesForWada(wadaId) {
  return Object.entries(EXERCISES)
    .filter(([, ex]) => ex.id === wadaId)
    .map(([key, ex]) => ({ key, label: ex.label }))
}
