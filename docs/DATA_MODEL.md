# Data Model

## schools
- `id` uuid PK
- `name` text
- `user_id` uuid nullable
- `created_at` timestamptz

## semesters
- `id` uuid PK
- `school_id` uuid → schools.id
- `name` text (e.g. "Fall 2024")
- `start_date` date
- `end_date` date
- `user_id` uuid nullable
- `created_at` timestamptz

## classes
- `id` uuid PK
- `school_id` uuid → schools.id
- `semester_id` uuid → semesters.id
- `name` text (e.g. "Grade 5 Math")
- `user_id` uuid nullable
- `created_at` timestamptz

## students
- `id` uuid PK
- `class_id` uuid → classes.id
- `name` text
- `user_id` uuid nullable
- `created_at` timestamptz

## report_sheets
- `id` uuid PK
- `class_id` uuid → classes.id
- `school_label` text nullable — printed school name
- `group_label` text nullable — e.g. "PG B"
- `day_time` text nullable
- `lead_coach` text nullable
- `teacher` text nullable
- `assistant` text nullable
- `theme` text nullable
- `focus_training` text nullable
- `rules` text nullable
- `around_world` text nullable
- `notes` text nullable
- `sheet_fingerprint` text nullable — stable visual/content fingerprint for recognizing the same reused page
- `user_id` uuid nullable
- `created_at` timestamptz

## sessions
- `id` uuid PK
- `report_sheet_id` uuid → report_sheets.id
- `class_id` uuid → classes.id
- `session_date` date
- `student_count_present` integer nullable
- `coached_by` text nullable
- `assisted_by` text nullable
- `source` text — 'ai_extracted' | 'manual'
- `review_status` text — 'unreviewed' | 'confirmed' | 'edited'
- `user_id` uuid nullable
- `created_at` timestamptz
- Unique: (`class_id`, `session_date`) for v1; later allow two same-day sessions via a session key/time.

## assessment_metrics
- `id` uuid PK
- `session_id` uuid → sessions.id
- `name` text — e.g. "Focus Training", "Right Behavior", "Physical Fitness"
- `display_order` integer
- Unique: (`session_id`, normalized `name`)

## student_session_records
- `id` uuid PK
- `session_id` uuid → sessions.id
- `student_id` uuid → students.id
- `attendance` text — 'present' | 'absent' | 'late' | 'unknown'
- `notes` text nullable
- `source` text — 'ai_extracted' | 'manual'
- `confidence` numeric nullable — row/name/attendance confidence 0–1
- `review_status` text — 'unreviewed' | 'confirmed' | 'edited'
- `screenshot_id` uuid nullable → screenshots.id
- `created_at` timestamptz
- Unique: (`session_id`, `student_id`)

## student_metric_values
- `id` uuid PK
- `student_session_record_id` uuid → student_session_records.id
- `assessment_metric_id` uuid → assessment_metrics.id
- `raw_value` text nullable — preserve the written symbol/value exactly
- `numeric_value` numeric nullable — parsed number when applicable
- `confidence` numeric nullable
- `review_status` text — 'unreviewed' | 'confirmed' | 'edited'
- Unique: (`student_session_record_id`, `assessment_metric_id`)

## report_entries (legacy compatibility)
The existing table remains during migration so the deployed v1 app keeps working. New multi-date work writes to `sessions`, `student_session_records`, and `student_metric_values`. A compatibility view or backfill exposes old rows in the new matrix until `report_entries` can be retired.

## screenshots
- `id` uuid PK
- `class_id` uuid → classes.id
- `report_sheet_id` uuid nullable → report_sheets.id
- `image_url` text — Supabase Storage path
- `status` text — 'uploaded' | 'processing' | 'extracted' | 'failed'
- `extracted_data` jsonb nullable — raw AI output
- `user_id` uuid nullable
- `created_at` timestamptz

## Relationships
- school 1—N semesters 1—N classes 1—N students
- class 1—N report_sheets 1—N sessions
- session 1—N assessment_metrics
- session 1—N student_session_records; each record 1—N student_metric_values
- report_sheet 1—N screenshots so the same physical page can be photographed again as new dates are filled in

## RLS (v1 — permissive for demo)
All tables: open read/write for anonymous. Later sprint replaces with `auth.uid() = user_id` owner scoping.

## AI Fields
Confidence and review state exist at both row and metric-cell level so one unclear cell does not invalidate the whole date. `screenshots.extracted_data` stores raw AI JSON for audit, and `sheet_fingerprint` helps associate later photos with the same reused page.

## Idempotency Rules
- Re-uploading the same sheet/date must update the draft or report a conflict; it must not create another session.
- Saving the same student/date twice must not create another student session record.
- Saving the same metric cell twice must not create another metric value.
- Blank cells remain null; they are not interpreted as zero or absent.
