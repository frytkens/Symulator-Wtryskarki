// =============================================================
// ĆWICZENIA – wady powierzchni: linie łączenia, smugi/haczyki powietrza,
// pęcherzyki powietrza, smugi wilgoci.
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { BASE_START, MACHINE, MATERIAL, PASS } from './zapadniecia.js'
import { burnModel } from './przypalenia.js'

// -------------------------------------------------------------
// Model 'surfaceMark': silnik przypaleń (napełnianie, docisk, siła rozwierająca,
// efekt Diesla, smugi przypalone) + model surface (params.js → simulateTrainingCycle).
// Receptura wzorcowa (BASE_START) nie ma żadnej z tych wad:
//  • linie łączenia: margines „temperatury czół” ≥ −6 °C względem receptury
//    (Tm ok. 242 °C, forma 40 °C, prędkość 90 mm/s, docisk 80 bar),
//  • smugi powietrza: dekompresja ≤ 10% dawki, średnia prędkość wtrysku ≤ 120 mm/s,
//  • pęcherzyki: przeciwciśnienie ≥ 6 bar, droga dozowania ≤ 3×D, trawersa ≤ 70 °C,
//  • smugi wilgoci: trawersa ≥ 35 °C, obie strony formy ≥ 18 °C (punkt rosy hali).
// root = składnik linii łączenia będący przyczyną w ćwiczeniu; pozostałe
// składniki działają najwyżej ±helperCap °C, więc same nie usuwają wady.
// -------------------------------------------------------------
export const SURFACE = {
  threshold: 0.5,
  helperCap: 2,
  weld: { meltRef: 242, perMelt: 1, moldRef: 40, perMold: 1, speedRef: 90, perSpeed: 0.1, pdRef: 80, perPd: 0.1, limit: -6, scale: 1.5 },
  air: { dekoMaxPct: 10, perDekoPct: 0.8, speedMax: 120, perSpeed: 0.25 },
  bubbles: { przMin: 6, perPrz: 1.8, strokeMax: 3, perStroke: 12, trMax: 70, perTR: 0.4, perDekoPct: 0.03 },
  moisture: { trMin: 35, perTR: 0.8, dewPoint: 18, perDew: 1.2 }
}

export const surfaceModel = (root = null) => ({
  ...burnModel(null),
  type: 'surfaceMark',
  surface: { ...SURFACE, root }
})

const WELD_GOAL = 'Zdiagnozuj przyczynę widocznych linii łączenia i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'
const AIR_GOAL = 'Zdiagnozuj przyczynę smug powietrza i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'
const BUBBLE_GOAL = 'Zdiagnozuj przyczynę pęcherzyków powietrza i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'
const MOIST_GOAL = 'Zdiagnozuj przyczynę smug wilgoci i uzyskaj poprawną wypraskę bez wywołania wad ubocznych.'

const WELD_OTHER = {
  source: 'PPS ENGEL, „Linie łączenia”, str. 104–108',
  items: [
    'Linie łączenia powstają, gdy spotykają się dwa lub więcej strumieni stopu o spłaszczonych, wystudzonych czołach – za niska temperatura i ciśnienie.',
    'Zmiany koloru w obszarze łączenia: podnieść temperaturę formy (najskuteczniejsze, ale chłodzenie dłuższe o ok. 20% na każde 10 °C), zmienić prędkość wtrysku, podnieść temperaturę masy.',
    'Dalej: zoptymalizować czas docisku, zwiększyć ciśnienie docisku, poprawić odpowietrzenie w miejscu łączenia.',
    'Karb lub wady połysku: mniejszy pigment, jaśniejszy materiał, przeniesienie punktu wtrysku (łączenie w obszar niewidoczny).'
  ]
}

const AIR_OTHER = {
  source: 'PPS ENGEL, „Smugi/haczyki powietrza”, str. 17–20',
  items: [
    'Smugi powietrza w okolicy wlewka: zmniejszyć prędkość ślimaka podczas dekompresji, zmniejszyć dekompresję, zwiększyć przeciwciśnienie.',
    'Haczyki powietrza przy żebrach, uskokach i napisach: dopasować (zmniejszyć) prędkość wtrysku, zaokrąglić ostre przejścia, zmniejszyć głębokość grawerowania.',
    'Pozostałe przypadki: zwolnić wtrysk, zapewnić odpowietrzenie, zmienić punkt wtrysku, sprawdzić szczelność dyszy.',
    'Dekompresja docelowo ok. 10% dawki dozowania – za mała pogarsza pracę zaworu zwrotnego.'
  ]
}

const BUBBLE_OTHER = {
  source: 'PPS ENGEL, „Pęcherzyki powietrza”, str. 52–54',
  items: [
    'Przyczyny: za duża lub za szybka dekompresja, za małe przeciwciśnienie, odpowietrzenie formy, droga dozowania większa niż 3×D, problemy z zaciąganiem granulatu.',
    'Czy można zredukować dekompresję? – zmniejszyć ją i/lub zwolnić wycofanie ślimaka.',
    'Błąd pojawił się nagle w trwającej produkcji: sprawdzić zaciąganie i podawanie granulatu oraz temperaturę trawersy.',
    'W pozostałych przypadkach: podnieść przeciwciśnienie i dopasować obroty, sprawdzić profil temperatur cylindra, czystość i zużycie układu plastyfikacji, odpowietrzenie formy.',
    'Pęcherze w grubych przekrojach przy prawidłowej plastyfikacji to zwykle jamy skurczowe – inne działania (docisk).'
  ]
}

const MOIST_OTHER = {
  source: 'PPS ENGEL, „Smugi wilgoci”, str. 14–16',
  items: [
    'Wilgoć na powierzchni formy: sprawdzić szczelność chłodzenia, podnieść temperaturę formy, zastosować kurtynę suchego powietrza.',
    'Wilgoć w granulacie: wysuszyć materiał wg zaleceń producenta, sprawdzić opakowanie i magazynowanie, skrócić czas przebywania w leju (zamknięty system podawania z suszarki).',
    'Podnieść temperaturę trawersy (wlotu) wg zaleceń producenta tworzywa, sprawdzić jej szczelność.',
    'Smugi wilgoci mają kształt litery U, skierowanej przeciwnie do kierunku płynięcia; powierzchnia w ich obszarze jest szorstka i porowata.'
  ]
}

const TEMP_IDS = ['T1', 'T2', 'T3', 'T4', 'T5']
const coldProfile = d => Object.fromEntries(TEMP_IDS.map(id => [id, BASE_START[id] - d]))

export const POWIERZCHNIA_EXERCISES = {
  // ---------------- LINIE ŁĄCZENIA ----------------
  linie_L01: {
    id: 'linie_laczenia',
    code: 'L-01',
    rootParam: 'Tr', // parametr-przyczyna (tryb administratora); obie strony formy
    label: 'L-01 · Linie łączenia — przypadek 1',
    learningGoal: WELD_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Za otworem w detalu widać wyraźną linię z karbem i matowym paskiem. Detal jest pełny, bez zapadnięć. Po weekendzie termostat formy został przestawiony, żeby skrócić cykl.',
      facts: ['Karb i matowa linia za otworem', 'Detal kompletny', 'Zmiana na termostacie formy']
    },
    solutionSummary: 'Przyczyną była za niska temperatura formy (25 °C na obu stronach). Czoła strug stygły na zimnych ściankach i spotykały się już częściowo zastygnięte, więc nie zgrzewały się. Podniesienie temperatury formy do ok. 35–60 °C usuwa linię łączenia. PPS: to najskuteczniejsze działanie, ale chłodzenie wydłuża się o ok. 20% na każde 10 °C – nie przesadzaj. Temperatura masy, prędkość i docisk pomagają tylko częściowo.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Tr: 25, Ts: 25 },
    reference: { Tr: 40, Ts: 40 },
    focus: ['Tr', 'Ts'],
    pass: PASS,
    processModel: surfaceModel('mold'),
    changeNotes: [
      { params: TEMP_IDS, text: 'Temperatura masy poprawia zgrzanie strug tylko częściowo. Pomyśl, gdzie czoło strugi traci najwięcej ciepła w drodze do miejsca łączenia.' }
    ],
    otherParameters: WELD_OTHER,
    hints: [
      { after: 3, text: 'Linia powstaje tam, gdzie spotykają się dwie strugi. W jakim stanie jest czoło strugi, zanim dotrze do tego miejsca?' },
      { after: 5, when: (v) => (Number(v.Tr) + Number(v.Ts)) / 2 < 34, text: 'Sprawdź, co zmieniono na termostacie formy po weekendzie.' }
    ]
  },

  linie_L02: {
    id: 'linie_laczenia',
    code: 'L-02',
    rootParam: 'T3', // parametr-przyczyna (tryb administratora); cały profil cylindra
    label: 'L-02 · Linie łączenia — przypadek 2',
    learningGoal: WELD_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Za otworem w detalu widać linię z karbem. Temperatura formy jest zgodna z kartą technologiczną. Po wymianie grzałek na cylindrze ktoś wpisał nowe nastawy stref.',
      facts: ['Karb za otworem', 'Forma zgodna z kartą', 'Zmienione nastawy stref cylindra']
    },
    solutionSummary: 'Przyczyną była za niska temperatura masy – cały profil cylindra obniżony o 15 °C (masa ok. 228 °C). Chłodniejszy stop ma wyższą lepkość i czoła strug spotykają się zbyt zimne, żeby się zgrzać. Profil trzeba przywrócić tak, by masa była w oknie materiału (ok. 236–255 °C). Powyżej ok. 260 °C pojawiają się smugi przypalonego materiału.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, ...coldProfile(15) },
    reference: { T1: 225, T2: 230, T3: 235, T4: 240, T5: 245 },
    focus: TEMP_IDS,
    pass: PASS,
    processModel: surfaceModel('melt'),
    changeNotes: [
      { params: ['Tr', 'Ts'], text: 'Temperatura formy jest zgodna z kartą technologiczną. Wyższa forma pomoże tylko częściowo i wydłuży chłodzenie.' }
    ],
    otherParameters: WELD_OTHER,
    hints: [
      { after: 3, text: 'Forma jest w porządku. Co jeszcze decyduje o temperaturze czoła strugi w miejscu łączenia?' },
      { after: 5, text: 'Porównaj nastawy stref cylindra z oknem przetwórstwa materiału.' }
    ]
  },

  // ---------------- SMUGI POWIETRZA ----------------
  smugi_SA01: {
    id: 'smugi_powietrza',
    code: 'SA-01',
    rootParam: 'Deko', // parametr-przyczyna (tryb administratora)
    label: 'SA-01 · Smugi powietrza — przypadek 1',
    learningGoal: AIR_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Przy wlewku widać matowe, srebrzyste smugi. Masa detalu jest w normie. Poprzednia zmiana zwiększyła dekompresję, bo z dyszy ciekło tworzywo.',
      facts: ['Srebrne smugi przy wlewku', 'Masa w normie', 'Zwiększona dekompresja na poprzedniej zmianie']
    },
    solutionSummary: 'Przyczyną była za duża dekompresja (15 mm przy dawce 60 mm = 25%). Ślimak cofając się zasysał powietrze przez dyszę, a pęcherzyk powietrza przed ślimakiem trafiał jako smuga w okolice wlewka. Dekompresja docelowo ok. 10% dawki (tu ok. 4–6 mm). Za mała dekompresja pogarsza powtarzalność zamykania zaworu zwrotnego. Wyciekanie z dyszy rozwiązuje się temperaturą dyszy, a nie coraz większą dekompresją.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Deko: 15 },
    reference: { Deko: 6 },
    focus: ['Deko', 'Prz'],
    pass: PASS,
    processModel: surfaceModel(null),
    changeNotes: [
      { params: ['Pw1', 'Pw2', 'Pw3', 'Pw4', 'Pw5'], text: 'Smugi są przy wlewku, a nie przy żebrach czy napisach. Zastanów się, czy powietrze trafia do stopu w gnieździe, czy wcześniej – w cylindrze.' }
    ],
    otherParameters: AIR_OTHER,
    hints: [
      { after: 3, text: 'Smugi są przy wlewku. Skąd w stopie przed ślimakiem może się wziąć powietrze?' },
      { after: 5, text: 'Policz: dekompresja / skok dozowania × 100%. Ile wyszło? Ile powinno być?' }
    ]
  },

  smugi_SA02: {
    id: 'smugi_powietrza',
    code: 'SA-02',
    rootParam: 'Pw2', // parametr-przyczyna (tryb administratora); profil Pw1–Pw4
    label: 'SA-02 · Smugi powietrza — przypadek 2',
    learningGoal: AIR_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Przy napisie i za żebrami pojawiają się białe haczyki i krótkie smugi. Przy wlewku powierzchnia jest czysta. Żeby skrócić cykl, podniesiono prędkości wtrysku.',
      facts: ['Haczyki przy napisie i żebrach', 'Przy wlewku bez wady', 'Podniesione prędkości wtrysku']
    },
    solutionSummary: 'Przyczyną była za duża prędkość wtrysku (170 mm/s na stopniach 1–4). Szybki front stopu porywał powietrze przy żebrach i zagłębieniach napisu, zamiast je wypychać do odpowietrzeń – powstawały haczyki powietrza. Średnia prędkość profilu powinna wynosić ok. 90–120 mm/s. Zbyt wolny wtrysk grozi niedolaniem i liniami łączenia.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Pw1: 170, Pw2: 170, Pw3: 170, Pw4: 170 },
    reference: { Pw1: 90, Pw2: 90, Pw3: 90, Pw4: 90 },
    focus: ['Pw1', 'Pw2', 'Pw3', 'Pw4', 'Pw5'],
    pass: PASS,
    processModel: surfaceModel(null),
    changeNotes: [
      { params: ['Deko', 'Prz'], text: 'Smugi nie są przy wlewku, tylko przy żebrach i napisie. Tam powietrze jest zamykane w gnieździe, a nie zasysane w cylindrze.' }
    ],
    otherParameters: AIR_OTHER,
    hints: [
      { after: 3, text: 'Wada jest przy żebrach i napisie, a nie przy wlewku. Co dzieje się z powietrzem w zagłębieniach, gdy front stopu wpada bardzo szybko?' }
    ]
  },

  // ---------------- PĘCHERZYKI POWIETRZA ----------------
  pecherze_PA01: {
    id: 'pecherze',
    code: 'PA-01',
    rootParam: 'Prz', // parametr-przyczyna (tryb administratora)
    label: 'PA-01 · Pęcherzyki powietrza — przypadek 1',
    learningGoal: BUBBLE_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'W przezroczystym detalu widać drobne pęcherzyki w całym przekroju, także w cienkich miejscach. W masie wytryśniętej z dyszy w powietrze też są pęcherzyki. Dozowanie jest wyraźnie krótsze niż zwykle.',
      facts: ['Pęcherzyki w całym detalu', 'Pęcherzyki w masie wytryśniętej w powietrze', 'Krótsze dozowanie']
    },
    solutionSummary: 'Przyczyną był brak przeciwciśnienia (0 bar). Bez oporu przy cofaniu ślimak nie odgazowywał stopu – powietrze z granulatu zostawało w dawce i trafiało do detalu. Przeciwciśnienie ok. 6–25 bar dogęszcza stop i wypycha powietrze w stronę zasypu. Zbyt wysokie przeciwciśnienie zwiększa ścinanie i grozi smugami przypalonego materiału.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Prz: 0 },
    reference: { Prz: 10 },
    focus: ['Prz', 'Ob', 'Deko'],
    pass: PASS,
    processModel: surfaceModel(null),
    changeNotes: [
      { params: ['Pd', 'Td'], text: 'Pęcherzyki są także w cienkich miejscach i w masie wytryśniętej w powietrze. To nie jest jama skurczowa – docisk tego nie usunie.' }
    ],
    otherParameters: BUBBLE_OTHER,
    hints: [
      { after: 3, text: 'Pęcherzyki są już w masie wytryśniętej z dyszy. Na którym etapie cyklu powietrze trafia do stopu?' },
      { after: 5, text: 'Dozowanie jest krótsze niż zwykle. Co stawia opór cofającemu się ślimakowi i dogęszcza stop?' }
    ]
  },

  pecherze_PA02: {
    id: 'pecherze',
    code: 'PA-02',
    rootParam: 'TR', // parametr-przyczyna (tryb administratora)
    label: 'PA-02 · Pęcherzyki powietrza — przypadek 2',
    learningGoal: BUBBLE_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Pęcherzyki pojawiły się nagle w trakcie produkcji, wcześniej detal był dobry. Czas dozowania się waha, a w leju granulat przy wlocie jest zbrylony. Nastawy wtrysku i dozowania nie były zmieniane.',
      facts: ['Wada pojawiła się nagle', 'Wahający się czas dozowania', 'Zbrylony granulat przy wlocie']
    },
    solutionSummary: 'Przyczyną była za wysoka temperatura trawersy (100 °C). Granulat miękł i sklejał się już we wlocie, ślimak nierówno go zaciągał i porywał powietrze razem z zbrylonym materiałem. PPS: gdy błąd pojawia się nagle w trwającej produkcji – sprawdzić zaciąganie granulatu i temperaturę trawersy. Prawidłowo ok. 35–70 °C. Za zimna trawersa grozi kondensacją wilgoci i smugami wilgoci.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, TR: 100 },
    reference: { TR: 60 },
    focus: ['TR', 'Prz'],
    pass: PASS,
    processModel: surfaceModel(null),
    changeNotes: [
      { params: ['Prz', 'Ob'], text: 'Przeciwciśnienie i obroty nie były zmieniane, a wada pojawiła się nagle. Zastanów się, co dzieje się z granulatem, zanim trafi do ślimaka.' }
    ],
    otherParameters: BUBBLE_OTHER,
    hints: [
      { after: 3, text: 'Wada pojawiła się nagle, nastawy wtrysku i dozowania są bez zmian. Gdzie granulat trafia do cylindra i co tam może mu przeszkadzać?' },
      { after: 5, text: 'Sprawdź temperaturę strefy wlotu (trawersy).' }
    ]
  },

  // ---------------- SMUGI WILGOCI ----------------
  wilgoc_SW01: {
    id: 'smugi_wilgoci',
    code: 'SW-01',
    rootParam: 'TR', // parametr-przyczyna (tryb administratora)
    label: 'SW-01 · Smugi wilgoci — przypadek 1',
    learningGoal: MOIST_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Na powierzchni są srebrne smugi w kształcie litery U, otwarte w stronę wlewka. Powierzchnia w smugach jest szorstka. Materiał był suszony zgodnie z instrukcją. Po remoncie wlotu cylindra trawersa ma inną nastawę.',
      facts: ['Srebrne smugi w kształcie U', 'Suszenie zgodne z instrukcją', 'Zmieniona nastawa trawersy']
    },
    solutionSummary: 'Przyczyną była za niska temperatura trawersy (20 °C). Zimna strefa wlotu działała jak chłodnica – wilgoć z powietrza skraplała się na suchym granulacie, który następnie odparowywał w stopie i dawał smugi wilgoci. Temperatura trawersy wg zaleceń producenta tworzywa, tu ok. 35–70 °C. Za gorąca trawersa powoduje zbrylanie granulatu i pęcherzyki powietrza.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, TR: 20 },
    reference: { TR: 60 },
    focus: ['TR', 'Tr', 'Ts'],
    pass: PASS,
    processModel: surfaceModel(null),
    changeNotes: [
      { params: TEMP_IDS, text: 'Temperatura stref cylindra nie wysuszy materiału. Zastanów się, gdzie wilgoć może dostać się do suchego granulatu.' }
    ],
    otherParameters: MOIST_OTHER,
    hints: [
      { after: 3, text: 'Materiał był dobrze wysuszony. Gdzie po drodze do ślimaka granulat może zebrać wilgoć?' },
      { after: 5, text: 'Sprawdź temperaturę strefy wlotu (trawersy) po remoncie.' }
    ]
  },

  wilgoc_SW02: {
    id: 'smugi_wilgoci',
    code: 'SW-02',
    rootParam: 'Tr', // parametr-przyczyna (tryb administratora)
    label: 'SW-02 · Smugi wilgoci — przypadek 2',
    learningGoal: MOIST_GOAL,
    operatorReport: {
      title: 'Zgłoszenie operatora',
      message: 'Srebrne smugi i matowe plamy są tylko na stronie detalu od strony ruchomej formy. Na tej połowie formy po otwarciu widać krople wody. Materiał był suszony zgodnie z instrukcją, trawersa bez zmian.',
      facts: ['Smugi tylko od strony ruchomej', 'Krople wody na formie', 'Suszenie i trawersa bez zmian']
    },
    solutionSummary: 'Przyczyną była za niska temperatura strony ruchomej formy (12 °C), poniżej punktu rosy w hali. Na zimnych ściankach skraplała się woda, która odparowywała pod stopem i dawała smugi wilgoci. Temperatura formy musi być powyżej punktu rosy (tu ≥ 18 °C, docelowo jak strona stała). Jeśli krótki cykl wymaga zimnej formy – kurtyna suchego powietrza. Sprawdzić też szczelność obiegów termostatowania.',
    machine: MACHINE,
    material: MATERIAL,
    start: { ...BASE_START, Tr: 12, Ts: 55 },
    reference: { Tr: 40, Ts: 40 },
    focus: ['Tr', 'Ts', 'TR'],
    pass: PASS,
    processModel: surfaceModel(null),
    changeNotes: [
      { params: ['TR'], text: 'Smugi są tylko po jednej stronie detalu. Gdyby wilgoć była w granulacie, byłyby na całej powierzchni.' }
    ],
    otherParameters: MOIST_OTHER,
    hints: [
      { after: 3, text: 'Smugi są tylko po stronie ruchomej, a na formie widać krople wody. Skąd się wzięła woda na ściankach gniazda?' }
    ]
  }
}
