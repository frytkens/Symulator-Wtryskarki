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

export const FLASH_LEVELS = [
  'Detal bez wypływek',
  'Delikatny film tworzywa na linii podziału',
  'Wyraźny grat na linii podziału',
  'Gruby grat wystający poza kontur detalu',
  'Wypływka na całym obwodzie linii podziału'
]

export const DIESEL_LEVELS = [
  'Detal bez przypaleń',
  'Lekkie przebarwienie na końcu drogi płynięcia',
  'Wyraźne czarne przypalenie w narożu',
  'Przypalenie z niedolaną krawędzią',
  'Rozległe przypalenia na końcu drogi płynięcia'
]

export const STREAK_LEVELS = [
  'Detal bez smug',
  'Pojedyncze jasne smugi przy dolocie',
  'Wyraźne srebrzyste smugi od dolotu',
  'Brązowe smugi na dużej powierzchni',
  'Brązowe przebarwienia i smugi na całym detalu'
]

export function levelCaptions(result) {
  return result?.model === 'sinkMark' ? SINK_LEVELS : VISUAL_LEVELS
}

// Obraz i podpis detalu – zawsze zgodne z oceną cyklu (standard, pkt 14).
export function partViewFor(result, wada) {
  if (!result) return { kind: 'defect', src: `/defects/${wada}.jpg`, caption: 'Detal z ostatniej zmiany — zgłoszenie operatora' }
  const sinkish = result.model === 'sinkMark' || result.model === 'flashMark' || result.model === 'burnMark'
  if (result.diesel) return { kind: 'defect', src: '/defects/przypalenia.jpg', caption: DIESEL_LEVELS[result.dieselLevel] }
  if (result.streaks) return { kind: 'defect', src: '/defects/przypalenia.jpg', caption: STREAK_LEVELS[result.streakLevel] }
  if (result.flash || result.lateSwitch) {
    const lvl = result.flashLevel || 2
    return { kind: 'defect', src: '/defects/wyplywy.jpg', caption: FLASH_LEVELS[lvl] }
  }
  if (result.visualLevel === 0) {
    const okCaption = result.model === 'burnMark' ? 'Detal bez przypaleń i smug' : result.model === 'flashMark' ? FLASH_LEVELS[0] : result.model === 'sinkMark' ? SINK_LEVELS[0] : VISUAL_LEVELS[0]
    return { kind: 'ok', caption: okCaption }
  }
  if (result.finalFill < 98.5) return { kind: 'defect', src: '/defects/niedolanie.jpg', caption: VISUAL_LEVELS[Math.max(1, result.visualLevel)] }
  if (sinkish && result.sinkOk === false) return { kind: 'defect', src: '/defects/zapadniecia.jpg', caption: SINK_LEVELS[Math.max(1, result.sinkLevel || result.visualLevel)] }
  return { kind: 'defect', src: `/defects/${wada}.jpg`, caption: VISUAL_LEVELS[result.visualLevel] }
}

// Powody NG widoczne dla kursanta – wyłącznie objawy mierzalne przy maszynie.
export function studentReasons(result) {
  if (!result) return []
  const reasons = []
  const sinkModel = result.model === 'sinkMark' || result.model === 'flashMark' || result.model === 'burnMark'
  if (sinkModel && result.finalFill < 98.5) {
    reasons.push(`Detal niekompletny — masa ${result.mass} g (referencja ${result.referenceMass} g)`)
  } else if (!sinkModel && result.visualLevel > 0) {
    reasons.push(`Detal niekompletny — masa ${result.mass} g (referencja ${result.referenceMass} g)`)
  }
  if (sinkModel && !result.sinkOk) {
    reasons.push(`Zapadnięcie na powierzchni: ${result.sinkDepth} mm (dopuszczalne ≤ 0.03 mm)`)
  }
  if (result.flash) reasons.push(`Wypływka na linii podziału — grat ${result.burr} mm`)
  if (result.diesel) reasons.push('Czarne przypalenia na końcu drogi płynięcia')
  if (result.streaks) reasons.push('Brązowe/srebrzyste smugi przypalonego materiału')
  if (result.dosingOk === false) reasons.push(`Dozowanie (${result.dosingTime} s) trwa dłużej niż chłodzenie (${result.coolingTime} s)`)
  if (result.overClamp) reasons.push('Siła zwarcia powyżej zakresu dla tej formy — ryzyko uszkodzenia płaszczyzny podziału i zgniecenia odpowietrzeń')
  if (result.openingForce && !result.flash && result.clampMarginOk === false) reasons.push('Brak zapasu siły zwarcia — forma na granicy rozwarcia')
  if (result.lateSwitch) reasons.push('Pik ciśnienia pod koniec wtrysku — ryzyko wypływki i przepakowania')
  if (result.pressureLimited) reasons.push(`Ciśnienie wtrysku doszło do limitu ${result.pressureLimit} bar`)
  const minCushion = 5
  if (result.actualCushion !== undefined && result.actualCushion < minCushion) {
    reasons.push(`Poduszka ${result.actualCushion} mm — poniżej ${minCushion} mm`)
  }
  if (result.actualCushion > 12) {
    reasons.push(`Poduszka ${result.actualCushion} mm — za duża rezerwa materiału w cylindrze`)
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
