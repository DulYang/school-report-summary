# School Report Summary — PRD

## Problem
Coaches reuse one printed class sheet across several session dates. Student names are fixed as rows; each date adds a grouped set of handwritten attendance and assessment columns. Admin staff then manually re-type that matrix into spreadsheets — hours of duplicate work, with transcription errors.

## Target User
The builder and their admin team (≈3 people) who manage multiple schools and need accurate digital records of coach-written reports.

## Core Objects
- **School** — one per customer site; owns semesters.
- **Semester** — a term within a school (e.g. Fall 2024).
- **Class** — a subject/section taught (becomes a spreadsheet tab).
- **Student** — belongs to a class; appears as a row.
- **Report Sheet** — one reusable paper page for a class/roster, including school, class/group, day/time, coaches, theme, rules, and notes.
- **Session Date** — one dated column group on a report sheet. A single uploaded page may contain several dates.
- **Student Session Record** — one student's attendance and assessment values for one session date.
- **Assessment Metric** — a named measure used on a date, such as Focus Training, Right Behavior, or Physical Fitness; metrics may differ by date.
- **Screenshot** — uploaded photo of a report sheet; AI extracts sheet metadata, all dates, students, and student-by-date values.

## MVP (v1) — Must-Haves
- [ ] Create a school + semester + classes (tabs).
- [ ] Add students to a class.
- [ ] Upload a photo of a reusable multi-date coach report sheet, including rotated phone photos.
- [ ] AI extracts sheet metadata, roster, every visible date, attendance, date-specific metric labels/values, and notes.
- [ ] Review screen mirrors the source matrix: students as rows, dates and metrics as grouped columns.
- [ ] Admin can confirm/edit each cell, map names to the roster, and choose which dates to save.
- [ ] Save one student session record per student/date into the correct class tab.
- [ ] Spreadsheet view mirrors the paper template: roster rows, grouped date columns, attendance plus the metrics present for each date, and a notes area.
- [ ] Re-uploading or extending the same physical sheet adds only new dates/cells and never duplicates previously saved student/date/metric data.
- [ ] No login wall — demo works for anonymous visitors with seed data.

## Non-Goals (v1)
- Team accounts / multi-user roles (only 3 manual accounts later).
- Scheduled or batch screenshot processing.
- PDF export or printing.
- Student-level analytics or trends.

## Success Criteria
Upload one photo of a class sheet containing multiple dates → review the extracted matrix → save → see every date and metric appear as grouped columns in that class's spreadsheet, with all roster students aligned correctly and zero duplicate student/date/metric cells. Upload the same sheet again after another date is filled in → only the new date is added.

## Source-Sheet Rules
- The printed page is roster-first: one student per row, up to the sheet's numbered capacity.
- One page may be reused for multiple session dates; an image is not equivalent to a single session.
- Each date always has attendance (`present`, `absent`, `late`, or `unknown`) and may have a different set of assessment metrics.
- Numeric ratings and symbols must be preserved as written; illegible or overwritten cells are flagged for review, not guessed silently.
- Sheet-level fields include school, class/group, day/time, lead coach, teacher, assistant, number present, theme, focus training, rules, around-the-world activity, and notes.
