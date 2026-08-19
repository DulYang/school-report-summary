# Agentic Layer

## Draftable Actions (low risk — auto)
- Extract entries from screenshot → draft `report_entries` with `review_status = 'unreviewed'`.
- Fuzzy-match extracted names to roster.
- Score confidence per entry.

## Executable After Approval (medium risk — light approval)
- Save reviewed entries to database (admin clicks "Save").
- Create new student when name doesn't match roster (admin confirms).
- Edit an entry's marks/attendance before saving.

## Human-Only Actions (high risk — always human)
- Delete a report entry or student.
- Delete a class, semester, or school.
- Re-run extraction on a screenshot (overwrites previous draft).

## Named Tools
- `extract_screenshot` — calls Vision API, returns structured JSON.
- `save_entries` — persists reviewed entries to `report_entries`.
- `match_student` — fuzzy-matches a name to class roster.

No raw `run_any` or `send_any` — only these named tools.

## Audit Log Fields
Every extraction and save: `actor`, `action`, `target_table`, `target_id`, `screenshot_id`, `entry_count`, `timestamp`.

## v1 vs Later
- **v1:** extract + review + save (medium risk, admin-approved save).
- **Later:** auto-save entries with confidence ≥ 0.95, batch processing, deletion audit trail.