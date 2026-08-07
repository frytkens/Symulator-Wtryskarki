# Symulator wtryskarki

Aplikacja React (Vite) — panel parametrów wtryskarki nałożony na schemat, z licznikiem czasu do znalezienia poprawnych ustawień.

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja wystartuje pod `http://localhost:5173`.

## Build produkcyjny

```bash
npm run build
npm run preview
```

## Publikacja na Vercel

Najprościej przez GitHub:

1. Wrzuć ten folder jako repozytorium na GitHub (`git init`, `git add .`, `git commit -m "init"`, `git push`).
2. Wejdź na [vercel.com](https://vercel.com), zaloguj się, kliknij **Add New → Project**.
3. Wybierz repozytorium — Vercel sam rozpozna, że to projekt Vite (Framework Preset: Vite, Build Command: `npm run build`, Output Directory: `dist`).
4. Kliknij **Deploy**.

Albo przez CLI, bez GitHuba:

```bash
npm install -g vercel
vercel
```

i postępuj zgodnie z pytaniami w terminalu (pierwsze uruchomienie poprosi o zalogowanie się).

## Struktura

- `src/data/params.js` — lista wszystkich parametrów (pozycja na schemacie, zakres, krzywa wpływu, waga)
- `src/components/ParamField.jsx` — pojedyncze pole nałożone na obrazek
- `src/App.jsx` — logika: stan parametrów, obliczanie jakości/wady, timer
- `public/schemat.png` — Twój obrazek schematu wtryskarki

## Dodanie kolejnej wady

W `src/data/params.js` dodaj nową krzywą w `CURVES` i oznacz inne parametry jako `active: true` z odpowiednią `weight` — reszta (obliczenia, paski jakości) działa automatycznie.
