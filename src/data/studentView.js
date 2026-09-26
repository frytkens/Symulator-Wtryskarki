// =============================================================
// WIDOK KURSANTA – tłumaczenie wyniku cyklu na obserwacje dostępne przy maszynie.
//
// Źródłem jest zawsze ten sam obiekt wyniku cyklu (processResult), który
// decyduje o zaliczeniu. Tutaj tylko wybieramy, CO kursant widzi przed
// rozwiązaniem: bez przyczyny, bez nazwy parametru do korekty, bez procentów
// wypełnienia i wewnętrznych wskaźników modelu (standard, pkt 3 i 12).
// =============================================================

export const VISUAL_LEVELS = [
  'Detal kompletny',
  'Lekkie niedolanie drobnej cechy lub krawędzi',
  'Widoczny brak na końcu drogi płynięcia',
  'Znaczny brak fragmentu detalu',
  'Poważne niepełne napełnienie gniazda'
]

// Powody NG widoczne dla kursanta – wyłącznie objawy mierzalne przy maszynie.
export function studentReasons(result) {
  if (!result) return []
  const reasons = []
  if (result.visualLevel > 0) {
    reasons.push(`Detal niekompletny — masa ${result.mass} g (referencja ${result.referenceMass} g)`)
  }
  if (result.lateSwitch) reasons.push('Pik ciśnienia pod koniec wtrysku — ryzyko wypływki i przepakowania')
  if (result.pressureLimited) reasons.push(`Ciśnienie wtrysku doszło do limitu ${result.pressureLimit} bar`)
  if (result.actualCushion !== undefined && result.actualCushion < 5) {
    reasons.push(`Poduszka ${result.actualCushion} mm — poniżej 5 mm`)
  }
  if (result.holdingWorked === false && result.visualLevel === 0) {
    reasons.push(`Ślimak nie przesunął się w fazie docisku (${result.holdingStroke} mm)`)
  }
  if (result.valveScenario && !result.valveParameterOk && result.visualLevel === 0) {
    reasons.push('Masa i poduszka nie są powtarzalne — proces niestabilny')
  }
  if (reasons.length === 0 && result.processWindowOk === false) {
    reasons.push('Proces poza oknem technologicznym')
  }
  return reasons
}

// Ostrzeżenia maszyny widoczne dla kursanta.
export function studentWarnings(result) {
  if (!result) return []
  const w = []
  if (result.pressureLimited) w.push('Osiągnięto graniczne ciśnienie wtrysku.')
  if (result.lateSwitch) w.push('Pik ciśnienia pod koniec napełniania.')
  if (result.meltTemperature > 260) w.push('Temperatura masy przekracza bezpieczne okno materiału.')
  return w
}
