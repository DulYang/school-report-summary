# Agentic Layer

## Draftable Actions (low risk — auto)
- Extract sheet metadata, multiple dates, metric headers, and cells → draft sessions and values with `review_status = 'unreviewed'`.
- Fuzzy-match extracted names to roster.
- Score confidence per entry.

## Executable After Approval (medium risk — light approval)
- Save reviewed entries to database (admin clicks "Save").
- Create new student when name doesn't match roster (admin confirms).
- Edit any attendance, metric, note, date, or sheet-metadata cell before saving.
- Save only newly detected dates/cells when the same sheet is uploaded again.

## Human-Only Actions (high risk — always human)
- Delete a report entry or student.
- Delete a class, semester, or school.
- Re-run extraction on a screenshot (replaces its draft, never previously approved records).

## Named Tools
- `extract_screenshot` — calls Vision API, returns structured JSON.
- `save_sheet_matrix` — transactionally upserts reviewed sessions, metrics, and student values without duplicates.
- `match_student` — fuzzy-matches a name to class roster.

No raw `run_any` or `send_any` — only these named tools.

## Audit Log Fields
Every extraction and save: `actor`, `action`, `target_table`, `target_id`, `report_sheet_id`, `screenshot_id`, `session_count`, `cell_count`, `timestamp`.

## v1 vs Later
- **v1:** extract + review + save (medium risk, admin-approved save).
- **Later:** auto-save entries with confidence ≥ 0.95, batch processing, deletion audit trail.
