# Tasks — Sprints

## Sprint 1 — Core Data + Spreadsheet View (v1 functional milestone)
**Goal:** A visitor can see a school's spreadsheet with class tabs and entries — the read side works end-to-end.
- [ ] Create Supabase tables + RLS (permissive) + seed data.
- [ ] `lib/data/` — data-access functions for schools, semesters, classes, students, entries.
- [ ] Sidebar nav: school selector → semester → class tabs.
- [ ] Spreadsheet view: tabbed table of report_entries per class.
- [ ] Manual add/edit entry form (so core works without AI).
- [ ] Empty/loading/error states for spreadsheet view.
- **DoD:** Open app → see seed school → click class tab → see student rows with marks and attendance → add a new entry manually → it appears in the tab.

## Sprint 2 — Screenshot Upload + AI Extraction
**Goal:** Upload a photo, AI extracts entries, admin reviews and saves.
- [ ] Supabase Storage bucket for screenshots.
- [ ] Upload UI (drag-drop image) in class tab.
- [ ] `lib/ai/extraction.ts` — Vision API call, parse JSON, confidence score.
- [ ] Review screen: extracted entries alongside roster, fuzzy name match.
- [ ] Confirm/edit each entry → save to `report_entries` with `source = 'ai_extracted'`.
- [ ] Processing/error states for extraction.
- **DoD:** Upload a report screenshot → see extracted entries with confidence → edit one → save → entries appear in the class tab.

## Sprint 3 — Polish + Student Roster Management
**Goal:** Full CRUD on roster, duplicate prevention, better review UX.
- [ ] Add/remove/edit students in a class.
- [ ] Prevent duplicate entries (same student + date).
- [ ] Unmatched-name resolution flow (create new student or map).
- [ ] Low-confidence entries highlighted and sorted first.
- [ ] Success: one week of screenshots → all converted to tabs with no errors or duplicates.
- **DoD:** Upload 3 screenshots for same class on different dates → all entries saved correctly, no duplicate students, no duplicate entries.

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