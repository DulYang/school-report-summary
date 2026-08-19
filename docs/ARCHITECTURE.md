# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres + Storage) + Vercel. AI extraction via OpenAI Vision API (server-side only).

## Build Now vs Later
**Now (v1):** school/semester/class CRUD, student roster, screenshot upload, AI extraction, review-and-save, spreadsheet tab view.
**Later:** auth + per-user RLS, multi-school dashboard, export, bulk upload, trend analytics.

## Key User Action Flow
1. Open a school → semester → pick or create a class tab.
2. Click "Upload Report" → select a screenshot image.
3. Image stored in Supabase Storage; server sends it to Vision API.
4. Extracted entries (student name, marks, attendance, remarks) returned as structured JSON.
5. Review screen lists each extracted entry next to the class roster — admin confirms or edits.
6. On "Save," entries persist to `report_entries` linked to class + student.
7. Spreadsheet tab updates instantly with new rows.

## Responsive Nav Shell
Persistent left sidebar: Schools → Semester selector → Class tabs. Collapses to hamburger on mobile. Current class highlighted.

## Layer Plan
1. **Data layer** — Supabase tables, RLS permissive for demo, data-access functions in `lib/data/`.
2. **App logic** — server actions for upload, extraction, save, CRUD.
3. **AI module** — `lib/ai/extraction.ts` — vision prompt, parse, confidence scoring.

## Why Core Works Without AI
If extraction fails, admin can manually add/edit entries in the spreadsheet tab. The data model and UI are fully functional without the AI step.

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
| spreadsheet | Read-only tabbed view of entries | report_entries (read) | 3 |
| screenshots | Upload + store image | screenshots | 4 |
| extraction | AI read + review + save | screenshots, report_entries (write) | 5 |