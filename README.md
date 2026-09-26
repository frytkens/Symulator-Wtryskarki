# Symulator wtryskarki

Przeglądarkowy symulator szkoleniowy (React + Vite) do nauki diagnozowania wad wyprasek.
Kursant wybiera wadę i ćwiczenie, czyta zgłoszenie operatora, zmienia nastawy maszyny
i uruchamia kolejne cykle, aż uzyska poprawną wypraskę. Rozwiązanie jest ujawniane dopiero po zaliczeniu.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produkcyjny w dist/
```

## Tryby (przełącznik w górnym pasku)

- **Tryb szkoleniowy** – ćwiczenia dla kursanta.
- **Panel wpływu wad** – swobodna analiza: dowolne nastawy i ryzyko każdej wady (bez wpływu na ćwiczenia).
- **Administrator – macierz parametrów** – wartości startowe i okna zaliczenia wszystkich ćwiczeń.

Tryby trenera wymagają kodu (`ADMIN_CODE` w `src/data/adminOverrides.js`).

## Struktura

- `src/App.jsx` – konsola maszyny, przebieg ćwiczenia, ocena cyklu
- `src/components/console/` – elementy interfejsu (schemat, nastawy, panel wpływu, macierz administratora)
- `src/data/params.js` – parametry, rejestr wad, silnik symulacji (`simulateTrainingCycle`, `evaluateCycle`, wady uboczne)
- `src/data/exercises/` – ćwiczenia pogrupowane według wad; `index.js` – rejestr i lista widocznych ćwiczeń (`VISIBLE_EXERCISE_KEYS`)
- `src/data/studentView.js` – co widzi kursant (objawy, obrazy detalu) – bez ujawniania przyczyny
- `knowledge/` – materiał źródłowy PPS ENGEL
- `public/defects/` – zdjęcia wad

## Dodanie ćwiczenia

Dodaj wpis w pliku wady w `src/data/exercises/` (start, `rootParam`, `processModel`, zgłoszenie operatora,
rozwiązanie, dodatkowe wskazania), a klucz dopisz do `VISIBLE_EXERCISE_KEYS`.
Poprawność sprawdzisz w macierzy administratora (okno zaliczenia modelu, stan startowy).
