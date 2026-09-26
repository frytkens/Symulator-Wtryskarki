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

export const SINK_LEVELS = [
  'Detal bez zapadnięć',
  'Lekkie zapadnięcie widoczne pod światło',
  'Wyraźne zapadnięcie nad grubym przekrojem',
  'Głębokie zapadnięcie nad żebrami',
  'Bardzo głębokie zapadnięcia na całej powierzchni'
]

export function levelCaptions(result) {
  return result?.model === 'sinkMark' ? SINK_LEVELS : VISUAL_LEVELS
}

// Powody NG widoczne dla kursanta – wyłącznie objawy mierzalne przy maszynie.
export function studentReasons(result) {
  if (!result) return []
  const reasons = []
  const sinkModel = result.model === 'sinkMark'
  if (sinkModel && result.finalFill < 98.5) {
    reasons.push(`Detal niekompletny — masa ${result.mass} g (referencja ${result.referenceMass} g)`)
  } else if (!sinkModel && result.visualLevel > 0) {
    reasons.push(`Detal niekompletny — masa ${result.mass} g (referencja ${result.referenceMass} g)`)
  }
  if (sinkModel && !result.sinkOk) {
    reasons.push(`Zapadnięcie na powierzchni: ${result.sinkDepth} mm (dopuszczalne ≤ 0.03 mm)`)
  }
  if (result.flash) reasons.push('Wypływka na linii podziału — gniazdo przepakowane')
  if (result.lateSwitch) reasons.push('Pik ciśnienia pod koniec wtrysku — ryzyko wypływki i przepakowania')
  if (result.pressureLimited) reasons.push(`Ciśnienie wtrysku doszło do limitu ${result.pressureLimit} bar`)
  const minCushion = 5
  if (result.actualCushion !== undefined && result.actualCushion < minCushion) {
    reasons.push(`Poduszka ${result.actualCushion} mm — poniżej ${minCushion} mm`)
  }
  if (!sinkModel && result.holdingWorked === false && result.visualLevel === 0) {
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
  if (result.flash) w.push('Wypływka na linii podziału.')
  if (result.screwBottomed) w.push('Ślimak doszedł do przedniego położenia w fazie docisku.')
  if (result.meltTemperature > 260) w.push('Temperatura masy przekracza bezpieczne okno materiału.')
  return w
}
