# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres + Storage) + Vercel. AI extraction via OpenAI Vision API (server-side only).

## Build Now vs Later
**Now (v1):** school/semester/class CRUD, student roster, screenshot upload, AI extraction, review-and-save, spreadsheet tab view.
**Later:** auth + per-user RLS, multi-school dashboard, export, bulk upload, trend analytics.

## Key User Action Flow
1. Open a school → semester → pick or create a class tab.
2. Click "Upload Report" → select a screenshot image.
3. Image stored in Supabase Storage; server auto-rotates/normalizes it and sends it to Vision API.
4. AI returns sheet metadata, roster rows, all visible session dates, the metric labels under each date, and every student/date cell.
5. Review screen renders the same matrix as the paper: roster rows and grouped date columns. Admin resolves names and edits uncertain cells.
6. On "Save," the app upserts sessions, metric definitions, and student session values using stable uniqueness keys.
7. Spreadsheet tab updates instantly with new grouped date columns; reprocessing the same sheet adds only new information.

## Responsive Nav Shell
Persistent left sidebar: Schools → Semester selector → Class tabs. Collapses to hamburger on mobile. Current class highlighted.

## Layer Plan
1. **Data layer** — Supabase tables, RLS permissive for demo, data-access functions in `lib/data/`.
2. **App logic** — server actions for upload, extraction, save, CRUD.
3. **AI module** — `lib/ai/extraction.ts` — vision prompt, parse, confidence scoring.

## Why Core Works Without AI
If extraction fails, admin can manually add a session date, choose its metrics, and fill/edit cells in the spreadsheet matrix. The data model and UI are fully functional without the AI step.

## Repo Structure
```
src/
  features/
    schools/      # school + semester CRUD, UI
    classes/       # class (tab) CRUD, student roster
    screenshots/   # upload + storage
    extraction/    # review screen, save entries
    spreadsheet/   # tabbed spreadsheet view
  lib/
    data/          # all DB reads/writes (schools, classes, entries, etc.)
    ai/            # extraction.ts — vision API call + parse
    supabase/      # client + server clients
  components/      # shared UI (sidebar, table, modal)
  app/             # routes / layout
```

## Module Map
| Module | Responsibility | Owns | Build Order |
|--------|---------------|------|-------------|
| schools | School + semester lifecycle | schools, semesters | 1 |
| classes | Class tabs + student roster | classes, students | 2 |
| spreadsheet | Editable roster-by-date matrix | sessions, metrics, student_session_values | 3 |
| screenshots | Upload + store image | screenshots | 4 |
| extraction | Multi-date matrix extraction + review | report_sheets, screenshots, sessions, values | 5 |
