// =============================================================
export const OTHERS_THRESHOLD  = 40   // % maks. ryzyka wad pobocznych
export const CUSHION_MIN       = 5    // mm
export const CUSHION_PENALTY   = 30   // pkt ryzyka przy poduszce < 5 mm
export const WARN_THRESHOLD    = 35   // próg żółty w DefectsPanel

// -------------------------------------------------------------
// 7. WADY – model tendencyjny
//    dir: +1 = zwiększenie parametru naprawia wadę
//         -1 = zmniejszenie parametru naprawia wadę
//    x50: wartość, przy której wada jest w połowie naprawiona
//    k:   szerokość przejścia (im mniejsze, tym ostrzej)
//    type:'window' = oba kierunki szkodzą (rzadki wyjątek)
//    cushionSensitive: reguła twarda +30 pkt przy poduszce < 5 mm
//    Źródło kierunków: ENGEL PPS "Process Plastic Surface".
// -------------------------------------------------------------
export const DEFECTS = {
  niedolanie: {
    label: 'Niedolanie – detal niecałkowicie wypełniony',
    cushionSensitive: true,
    params: [
      { id: 'doz', weight: 40, dir: +1, x50: 55,  k: 5,   note: 'Za mała dawka = fizycznie brak materiału' },
      { id: 'Pw1', weight: 35, dir: +1, x50: 80,  k: 18,  note: 'Wolniej = strumień stygnie w drodze' },
      { id: 'Pp',  weight: 30, dir: -1, x50: 11,  k: 2.3, note: 'Przełączenie za wcześnie = wtrysk oddaje robotę dociskowi' },
      { id: 'Tm',  weight: 25, dir: +1, x50: 238, k: 9,   note: 'Niższa lepkość = dalej płynie (cały profil, nie sama dysza)' },
      { id: 'Tr',  weight: 25, dir: +1, x50: 40,  k: 7,   note: 'Cieńsza warstwa zamrożona = większy przekrój przepływu' }
    ]
  },

  przypalenia: {
    label: 'Przypalenia – efekt diesla',
    params: [
      { id: 'Pw5', weight: 30, dir: -1, x50: 20,  k: 8,  note: 'Sprężone powietrze w końcowej fazie napełniania' },
      { id: 'Tm',  weight: 30, dir: -1, x50: 270, k: 12, note: 'Degradacja termiczna' },
      { id: 'Fz',  weight: 20, dir: -1, x50: 185, k: 12, note: 'Przepakowana forma = zgniecione odpowietrzenie' },
      { id: 'Prz', weight: 20, dir: -1, x50: 28,  k: 8,  note: 'Nadmierne ścinanie przy dozowaniu' }
    ]
  },

  wyplywy: {
    label: 'Wypływy – przetryśnięte detale na linii podziału',
    params: [
      { id: 'Fz',  weight: 30, dir: +1, x50: 160, k: 18, note: 'Za mała siła zwarcia' },
      { id: 'Pd',  weight: 20, dir: -1, x50: 95,  k: 25, note: 'Przepakowanie gniazda' },
      { id: 'Pp',  weight: 20, dir: +1, x50: 8,   k: 6,  note: 'Późne przełączenie = piki ciśnienia' },
      { id: 'Pw1', weight: 15, dir: -1, x50: 130, k: 30, note: 'Przetrysk w okolicy punktu wtrysku' },
      { id: 'Tm',  weight: 10, dir: -1, x50: 260, k: 15, note: 'Niższa lepkość wchodzi w szczelinę podziału' },
      { id: 'Tr',  weight: 5,  dir: -1, x50: 60,  k: 15, note: 'Cieplejsza forma = łatwiejszy wypływ' }
    ]
  },

  zapadniecia: {
    label: 'Zapadnięcia – wciągi na powierzchni',
    cushionSensitive: true,
    params: [
      { id: 'Pd', weight: 40, dir: +1, x50: 65,  k: 20,  note: 'Docisk kompensuje skurcz objętościowy' },
      { id: 'Td', weight: 30, dir: +1, x50: 4.5, k: 1.5, note: 'Docisk musi trwać do zamrożenia przewężki' },
      { id: 'Pp', weight: 15, dir: -1, x50: 12,  k: 4,   note: 'Zbyt wczesne przełączenie = luka ciśnienia przed dociskiem' },
      { id: 'Tr', weight: 15, dir: -1, x50: 65,  k: 15,  note: 'Gorąca forma = wolniejsze krzepnięcie = głębsze wciągi' }
    ]
  },

  pecherze: {
    label: 'Pęcherze / jamy skurczowe – puste przestrzenie wewnątrz detalu',
    cushionSensitive: true,
    params: [
      // UWAGA DYDAKTYCZNA: x50 wyższe niż przy zapadach.
      // Jamy skurczowe w rdzeniu wymagają WIĘCEJ docisku i DŁUŻEJ niż wciąg powierzchniowy.
      // To jedyna liczba, która merytorycznie rozdziela te dwie wady.
      { id: 'Pd', weight: 40, dir: +1, x50: 75,  k: 20,  note: 'Jama w rdzeniu = trzeba dopchać głębiej niż przy wciągu' },
      { id: 'Td', weight: 35, dir: +1, x50: 6.0, k: 2.0, note: 'Grubościenny obszar krzepnie dłużej' },
      { id: 'Tr', weight: 15, dir: -1, x50: 60,  k: 15,  note: 'Wolniejsze chłodzenie rdzenia = większa jama' },
      { id: 'Tm', weight: 10, dir: -1, x50: 275, k: 15,  note: 'Przegrzany materiał = większy skurcz objętościowy' }
    ]
  },

  rozwarstwienia: {
    label: 'Rozwarstwienia – oddzielające się warstwy materiału',
    params: [
      { id: 'Pw1', weight: 55, dir: -1, x50: 95, k: 30, note: 'Wysokie naprężenia poprzeczne przy szybkim wtrysku (PPS)' },
      // OKNO – jedyny prawdziwy przypadek w tej wadzie.
      // PPS wprost: "temperatura masy bardzo wysoka LUB bardzo niska".
      { id: 'Tm', weight: 45, type: 'window', lo: 225, hi: 275, k: 12,
        note: 'Za zimno = niedotopione warstwy; za gorąco = degradacja i rozdzielenie' }
    ]
  },

  smugi_powietrza: {
    label: 'Smugi/haczyki powietrza – zaciągnięte powietrze na powierzchni',
    params: [
      { id: 'Prz',  weight: 35, dir: +1, x50: 9,   k: 6,  note: 'Przeciwciśnienie wypycha powietrze ze stopu' },
      { id: 'Deko', weight: 35, dir: -1, x50: 12,  k: 6,  note: 'Za duża dekompresja zasysa powietrze przez dyszę' },
      { id: 'Pw1',  weight: 20, dir: -1, x50: 115, k: 30, note: 'Szybki wtrysk zaciąga powietrze do strugi' },
      { id: 'Ob',   weight: 10, dir: -1, x50: 0.9, k: 0.2, note: 'Za wysokie obroty = napowietrzanie przy podawaniu' }
    ]
  },

  linie_laczenia: {
    label: 'Linie łączenia – widoczne karby w miejscu spotkania strug',
    params: [
      { id: 'Tm',  weight: 35, dir: +1, x50: 245, k: 12, note: 'Cieplejsze czoła strug lepiej się zgrzewają' },
      { id: 'Tr',  weight: 30, dir: +1, x50: 50,  k: 12, note: 'Ciepła forma = czoła strug nie zdążą zamarznąć' },
      { id: 'Pd',  weight: 20, dir: +1, x50: 90,  k: 30, note: 'Docisk zaciska obszar łączenia' },
      // PPS podaje "zmienić prędkość wtrysku" BEZ kierunku - świadomie okno,
      // do zweryfikowania z technologiem na konkretnym detalu.
      { id: 'Pw1', weight: 15, type: 'window', lo: 60, hi: 140, k: 20,
        note: 'Za wolno = zimne czoła; za szybko = zamknięte powietrze w linii' }
    ]
  }
}

// -------------------------------------------------------------
// 8. NOTATKI TRENERA (checklista mechaniczna – to, czego nastawą nie naprawisz)
// -------------------------------------------------------------
export const TRAINER_NOTES = {
  niedolanie: [
    'Sprawdź poduszkę: min. 5 mm i STABILNA cykl po cyklu',
    'Poduszka skacze → zawór zwrotny / cylinder, nie nastawy',
    'Sprawdź odpowietrzenie formy',
    'Sprawdź czy nie osiągamy granicznego ciśnienia wtrysku (GR)',
    'Sprawdź punkt przełączenia – czy nie jest zbyt wczesny',
    'Sprawdź temperaturę formy – najczęściej pomijany parametr'
  ],
  przypalenia: [
    'Sprawdź czy w obszarze przypaleń jest odpowietrzenie',
    'Czy błąd pojawił się nagle w produkcji? → zabrudzone odpowietrzenia',
    'Sprawdź możliwość redukcji siły zwarcia (max ok. 20% przepakowania)',
    'Sprawdź profil prędkości – zwolnienie na końcu napełniania (Pw5)'
  ],
  wyplywy: [
    'Sprawdź stan powierzchni uszczelniających (płaszczyzna podziału)',
    'Sprawdź możliwość zwiększenia siły zwarcia',
    'Sprawdź równomierność napełniania gniazd',
    'Sprawdź czy przetrysk jest w okolicy punktu wtrysku',
    'Sprawdź ugięcie formy pod ciśnieniem'
  ],
  zapadniecia: [
    'Sprawdź długość i stabilność poduszki (min. 5 mm)',
    'Zapady przy wlewku czy z dala od niego? – inne działania naprawcze',
    'Sprawdź zawór zwrotny i cylinder',
    'Sprawdź wymiarowanie przewężki – czy nie zamarza za wcześnie'
  ],
  pecherze: [
    'Sprawdź długość i stabilność poduszki (min. 5 mm)',
    'Pęcherze w grubościennym obszarze czy z dala? – jama vs powietrze',
    'Sprawdź wilgotność materiału (suszenie!)',
    'Sprawdź wymiarowanie wlewka i przekrój detalu'
  ],
  rozwarstwienia: [
    'Czy błąd pojawił się po zmianie materiału lub barwnika?',
    'Sprawdź granulat pod kątem obcego materiału',
    'Sprawdź wilgotność materiału',
    'Sprawdź homogeniczność stopu i wydajność plastyfikacji'
  ],
  smugi_powietrza: [
    'Haczyki powietrza? – ostre przejścia grubości, głębokość grawerowania',
    'Smugi przy wlewku? – prędkość dekompresji i jej wielkość',
    'Widoczne pęcherzyki w wytryśniętej masie? – przeciwciśnienie, podawanie',
    'Sprawdź odpowietrzenie formy i szczelność dyszy'
  ],
  linie_laczenia: [
    'Czy karb występuje w obszarze łączenia strug?',
    'Czy widać zmianę koloru/połysku w linii? – pigment, materiał',
    'Rozważ przeniesienie punktu wtrysku w obszar niewidoczny',
    'Sprawdź odpowietrzenie dokładnie w miejscu łączenia strug'
  ]
}

// -------------------------------------------------------------
// 9. ĆWICZENIA – stały, zaprojektowany start zamiast losowania
//    Zasada: JEDNA przyczyna dominująca, tło zdrowe.
//    Losowanie psuje dydaktykę - raz trafi łatwy przypadek, raz niemożliwy.
// -------------------------------------------------------------
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
}

// wartości startowe ćwiczenia (uzupełnione defaultami dla pól nieujętych)
export function exerciseValues(key) {
  const ex = EXERCISES[key]
  if (!ex) return defaultValues()
  return { ...defaultValues(), ...ex.start }
}

// -------------------------------------------------------------
// 10. SILNIK WYNIKU
// -------------------------------------------------------------

// ryzyko pojedynczej wady [%] z regułą twardą poduszki
export function riskFor(defectsRegistry, wada, values, m = MACHINE) {
  const def = defectsRegistry[wada]
  if (!def) return { defectPct: 0, overallQuality: 100, contrib: [] }

  const sum = def.params.reduce((s, p) => s + p.weight, 0) || 1
  const contrib = def.params.map(p => {
    const x = paramValue(p.id, values, m)
    const q = quality(p, x)
    return {
      id: p.id, x, q: Math.round(q),
      share: p.weight / sum,
      lost: Math.round((100 - q) * (p.weight / sum)),   // ile pkt ryzyka wnosi ten parametr
      dir: p.dir, note: p.note
    }
  })

  const overall = contrib.reduce((s, c) => s + c.q * c.share, 0)
  let defectPct = 100 - overall

  // REGUŁA TWARDA: bez poduszki docisk fizycznie nie działa
  const cush = cushion(values, m)
  const cushionBlocked = def.cushionSensitive && cush.raw < CUSHION_MIN
  if (cushionBlocked) defectPct += CUSHION_PENALTY

  return {
    overallQuality: overall,
    defectPct: Math.max(0, Math.min(100, Math.round(defectPct))),
    contrib: contrib.sort((a, b) => b.lost - a.lost),
    cushionBlocked,
    cushion: cush.cushion
  }
}

// ZGODNOŚĆ WSTECZ: sygnatura jak dotychczas, plus dodatkowe pola
export function computeResult(defectsRegistry, wada, values, m = MACHINE) {
  return riskFor(defectsRegistry, wada, values, m)
}

// ryzyko WSZYSTKICH wad naraz – do DefectsPanel i do warunku zaliczenia
export function allRisks(defectsRegistry, values, m = MACHINE) {
  return Object.fromEntries(
    Object.keys(defectsRegistry).map(k => [k, riskFor(defectsRegistry, k, values, m).defectPct])
  )
}

// warunek zaliczenia: cel OK + nie zrobiłeś innej wady + poduszka fizycznie możliwa
export function evaluateCycle(defectsRegistry, wada, values, m = MACHINE, pass) {
  const cfg = pass || { target: SUCCESS_THRESHOLD, others: OTHERS_THRESHOLD, cushion: CUSHION_MIN }
  const risks = allRisks(defectsRegistry, values, m)
  const target = risks[wada]

  const others = Object.entries(risks)
    .filter(([k]) => k !== wada)
    .map(([k, v]) => ({ id: k, label: defectsRegistry[k]?.label || k, pct: v }))
    .sort((a, b) => b.pct - a.pct)

  const proc = computeProcessSummary(values, m)
  const worst = others[0] || { pct: 0 }

  const passed =
    target <= cfg.target &&
    worst.pct <= cfg.others &&
    proc.raw >= cfg.cushion

  const reasons = []
  if (target > cfg.target)      reasons.push(`Wada docelowa nadal ${target}% (próg ${cfg.target}%)`)
  if (worst.pct > cfg.others)   reasons.push(`Zrobiłeś inną wadę: ${worst.label} ${worst.pct}%`)
  if (proc.raw < cfg.cushion)   reasons.push(`Poduszka ${proc.cushion} mm – poniżej ${cfg.cushion} mm`)

  return { passed, target, risks, others, process: proc, reasons }
}

// porównanie dwóch cykli – feedback kierunkowy „co to kosztowało”
export function diffCycles(prev, curr) {
  if (!prev) return []
  return Object.keys(curr).map(k => ({
    id: k,
    from: prev[k],
    to: curr[k],
    delta: curr[k] - prev[k],
    trend: curr[k] > prev[k] ? '▲' : curr[k] < prev[k] ? '▼' : '▬'
  })).filter(d => d.delta !== 0)
}

// -------------------------------------------------------------
// 11. ALIASY ZGODNOŚCI (App.jsx / DefectsPanel.jsx / DefectManager.jsx)
// -------------------------------------------------------------
export const BUILTIN_DEFECTS_ALL = DEFECTS
export const TRAINER_NOTES_ALL   = TRAINER_NOTES
