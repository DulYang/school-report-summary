# Tasks — Sprints

## Sprint 1 — Core Data + Spreadsheet View (v1 functional milestone)
**Goal:** A visitor can see a class spreadsheet that mirrors the paper template: roster rows and grouped session-date columns.
- [ ] Create Supabase tables + RLS (permissive) + seed data.
- [ ] `lib/data/` — data-access functions for schools, semesters, classes, students, entries.
- [ ] Sidebar nav: school selector → semester → class tabs.
- [ ] Spreadsheet matrix: sticky student rows; date groups across columns; attendance and dynamic metric subcolumns per date.
- [ ] Sheet metadata panel: day/time, coaches, teacher/assistant, theme, focus, rules, activities, and notes.
- [ ] Manual add-session flow: date + metric headers + editable student cells (so core works without AI).
- [ ] Empty/loading/error states for spreadsheet view.
- **DoD:** Open app → click class tab → see roster rows and at least two date groups → manually add a new date with metrics → its grouped columns appear without changing older dates.

## Sprint 2 — Screenshot Upload + AI Extraction
**Goal:** Upload one reused sheet photo, AI extracts every date group and cell, admin reviews and saves the matrix.
- [ ] Supabase Storage bucket for screenshots.
- [ ] Upload UI (drag-drop image) in class tab.
- [ ] Auto-rotate/normalize phone photos before extraction.
- [ ] `lib/ai/extraction.ts` — grid/date/header/cell extraction, raw-value preservation, confidence score.
- [ ] Review screen mirrors the matrix and highlights uncertain dates, headers, names, and cells.
- [ ] Confirm/edit cells → transactionally save sessions, metrics, and student records with `source = 'ai_extracted'`.
- [ ] Processing/error states for extraction.
- **DoD:** Upload a sheet with at least three dates and different metrics per date → review/edit one cell → save → all dates and values appear under the correct grouped columns.

## Sprint 3 — Polish + Student Roster Management
**Goal:** Full CRUD on roster, duplicate prevention, better review UX.
- [ ] Add/remove/edit students in a class.
- [ ] Recognize the same physical sheet across later photos using class/roster/layout fingerprinting.
- [ ] Prevent duplicate sessions, student/date records, and metric cells.
- [ ] Unmatched-name resolution flow (create new student or map).
- [ ] Low-confidence entries highlighted and sorted first.
- [ ] Re-upload flow clearly labels new dates, changed cells, unchanged cells, and conflicts.
- [ ] Success: one sheet photographed repeatedly as dates are added → one continuously expanding class matrix.
- **DoD:** Upload a sheet with two dates, then upload the same page with a third date filled in → only the third date is added; existing values and students are not duplicated.

## Sprint 4 — Lock It Down (Auth + RLS)
**Goal:** Real user data is protected.
- [ ] Supabase Auth: signup/login.
- [ ] Replace permissive RLS with `auth.uid() = user_id` policies.
- [ ] Associate all new records with current user.
- [ ] Redirect anonymous users from write actions to login.
- **DoD:** Logged-out user can view demo data but cannot create/edit; logged-in user only sees their own schools.

## Simple Gantt
```
Sprint 1: [====] Core data + spreadsheet
Sprint 2:      [====] Upload + extraction
Sprint 3:           [====] Roster + dedup + polish
Sprint 4:                [====] Auth + RLS
```
