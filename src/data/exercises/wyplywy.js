// =============================================================
// ĆWICZENIA – wada: wyplywy (przetryśnięte detale na linii podziału)
//
// Struktura wpisu – patrz komentarz w src/data/exercises/index.js
// =============================================================

import { cushion, meltTemp } from '../params.js'

export const WYPLYWY_EXERCISES = {
  wyplywy: {
    id: 'wyplywy',
    label: 'Wypływy – wariant A: „za mała siła zwarcia + przepakowanie”',
    machine:  { D: 30, i: 11.5, Vpart: 32, Arzut: 45, dNozzle: 3.0, leak: 0 },
    material: { name: 'PP MFI 12', tmMin: 230, tmMax: 260, moldMin: 20, moldMax: 60 },
    start: {
      T1: 250, T2: 255, T3: 260, T4: 265, T5: 270, TR: 60,
      doz: 70, Pw1: 180, Pw2: 120, Pw3: 130, Pw4: 140, Pw5: 150,
      Pp: 3, Pd: 150, Td: 8, GR: 140,
      Prz: 20, Ob: 0.9, Deko: 5,
      Tr: 75, Ts: 75, Fz: 110, Tc: 40
    },
    // Zweryfikowane silnikiem: wyplywy=84% na starcie.
    // UWAGA KALIBRACYJNA (ważne): przy standardowym progu target=12% ta wada jest
    // MATEMATYCZNIE NIEOSIĄGALNA bez przekroczenia others=40% – sprawdzone przeszukaniem
    // (symulowane wyżarzanie, >700 tys. prób) na realnym silniku riskFor()/allRisks().
    // Powód: Pd, Pp, Pw1, Tr są współdzielone z niedolaniem/zapadnięciami/pęcherzami/liniami
    // łączenia z PRZECIWNYM kierunkiem (dir) – obniżanie ryzyka wypływów tymi parametrami
    // nieuchronnie podnosi ryzyko którejś z tamtych wad powyżej 40%.
    // Najlepszy znaleziony punkt równowagi: wyplywy=16%, najgorsza wada poboczna
    // (niedolanie/zapadniecia/linie_laczenia)=39%, poduszka=26.7mm.
    // Dlatego pass.target obniżono do 18% (bezpieczny margines nad zweryfikowanym optimum 16%),
    // zamiast standardowych 12%. Do potwierdzenia z technologiem, czy to akceptowalne, czy
    // wymaga raczej złagodzenia wag/x50 w samej wadzie `wyplywy` w params.js.
    reference: {
      T1: 240, T2: 240, T3: 240, T4: 240, T5: 240,
      doz: 96, Pw1: 70, Pw2: 80, Pw3: 70, Pw4: 60, Pw5: 10,
      Pp: 24, Pd: 65, Td: 13.5,
      Prz: 10, Ob: 0.7, Deko: 9, Tr: 55, Ts: 55, Fz: 200
    },
    focus: ['Fz', 'Pd', 'Pp', 'Pw1', 'T1', 'T2', 'T3', 'T4', 'T5', 'Tr'],
    pass: { target: 18, others: 40, cushion: 5 },
    keyNumber: { label: 'Maks. siła zwarcia dostępna na maszynie (Fz)', value: 200, unit: 't' },
    hints: [
      { after: 2,
        text: 'Sprawdź siłę zwarcia (Fz) – przy takim przepakowaniu forma się rozchyla, zanim cokolwiek innego zdąży zadziałać.' },
      { after: 4, when: (v) => v.Pd > 90,
        text: 'Ciśnienie docisku wciąż bardzo wysokie – przepakowujesz gniazdo już po jego wypełnieniu.' },
      { after: 6, when: (v) => v.Pp < 10,
        text: 'Przełączenie następuje bardzo późno – sprawdź piki ciśnienia tuż przed dociskiem.' },
      { after: 8, when: (v) => meltTemp(v).Tm > 255,
        text: 'Temperatura masy blisko górnej granicy okna materiałowego – niższa lepkość łatwiej wchodzi w szczelinę podziału.' },
      { after: 10,
        text: 'Uwaga: obniżanie Pd/Pp/Tr naprawia wypływy, ale te same parametry w drugą stronę naprawiają niedolanie i zapadnięcia. Szukaj kompromisu, nie wartości skrajnych.' },
      { after: 12, when: (v, m) => cushion(v, m).raw < 5,
        text: 'Przy okazji sprawdź poduszkę – poniżej 5 mm cykl i tak nie zostanie zaliczony.' }
    ]
  }

  // ——— Miejsce na kolejne warianty wypływów ———
}
