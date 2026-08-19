# School Report Summary — PRD

## Problem
Coaches hand-write marks and attendance for every student in a class each day on paper reports. Admin staff then manually re-type all of that into spreadsheets — hours of duplicate work, with transcription errors.

## Target User
The builder and their admin team (≈3 people) who manage multiple schools and need accurate digital records of coach-written reports.

## Core Objects
- **School** — one per customer site; owns semesters.
- **Semester** — a term within a school (e.g. Fall 2024).
- **Class** — a subject/section taught (becomes a spreadsheet tab).
- **Student** — belongs to a class; appears as a row.
- **Report Entry** — one student's marks + attendance + remarks for a date.
- **Screenshot** — uploaded photo of a coach's handwritten report; AI extracts entries from it.

## MVP (v1) — Must-Haves
- [ ] Create a school + semester + classes (tabs).
- [ ] Add students to a class.
- [ ] Upload a screenshot of a coach's daily report.
- [ ] AI extracts student names, marks, attendance, remarks from the image.
- [ ] Review screen: confirm/edit each extracted entry before saving.
- [ ] Save entries into the correct class tab.
- [ ] Spreadsheet view: school/semester with class tabs, showing all entries per class.
- [ ] No login wall — demo works for anonymous visitors with seed data.

## Non-Goals (v1)
- Team accounts / multi-user roles (only 3 manual accounts later).
- Scheduled or batch screenshot processing.
- PDF export or printing.
- Student-level analytics or trends.

## Success Criteria
Upload a photo of one class's handwritten report → review the extracted marks and attendance → save → see them appear as rows in that class's tab in the school's spreadsheet, with zero duplicates and zero missed students.