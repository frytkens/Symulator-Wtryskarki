// =============================================================
// TRYB ADMINISTRATORA – nadpisania wartości startowych i okien zaliczenia.
//
// Zapis w localStorage przeglądarki (lokalnie, per stanowisko). Kod dostępu
// jest tylko zabezpieczeniem przed przypadkowym wejściem kursanta – nie jest
// to ochrona danych.
// =============================================================

export const ADMIN_CODE = 'engel'
const KEY = 'wtryskarka_admin_overrides'

const EMPTY = { starts: {}, windows: {} }

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return { starts: parsed.starts || {}, windows: parsed.windows || {} }
  } catch {
    return EMPTY
  }
}

export function saveOverrides(overrides) {
  try {
    localStorage.setItem(KEY, JSON.stringify(overrides))
  } catch {
    // brak localStorage – zmiany działają tylko do odświeżenia strony
  }
}

// Okno zaliczenia ustawione przez administratora dla parametru-przyczyny.
// Działa jako dodatkowy warunek (zawęża okno wynikające z modelu).
export function rootWindowCheck(exerciseKey, exercise, values, overrides = loadOverrides()) {
  const w = overrides.windows[exerciseKey]
  const param = exercise?.rootParam
  if (!w || !param) return true
  const v = Number(values[param])
  if (w.min !== '' && w.min !== undefined && v < Number(w.min)) return false
  if (w.max !== '' && w.max !== undefined && v > Number(w.max)) return false
  return true
}
