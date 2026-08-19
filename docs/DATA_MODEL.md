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

## report_entries
- `id` uuid PK
- `class_id` uuid → classes.id
- `student_id` uuid → students.id
- `entry_date` date
- `attendance` text (present / absent / late)
- `marks` numeric
- `remarks` text
- `source` text — 'ai_extracted' | 'manual'
- `confidence` numeric nullable — AI confidence 0–1
- `review_status` text default 'unreviewed' — 'unreviewed' | 'confirmed' | 'edited'
- `screenshot_id` uuid nullable → screenshots.id
- `user_id` uuid nullable
- `created_at` timestamptz

## screenshots
- `id` uuid PK
- `class_id` uuid → classes.id
- `image_url` text — Supabase Storage path
- `status` text — 'uploaded' | 'processing' | 'extracted' | 'failed'
- `extracted_data` jsonb nullable — raw AI output
- `user_id` uuid nullable
- `created_at` timestamptz

## Relationships
- school 1—N semesters 1—N classes 1—N students
- class 1—N report_entries (via student)
- class 1—N screenshots 1—N report_entries

## RLS (v1 — permissive for demo)
All tables: open read/write for anonymous. Later sprint replaces with `auth.uid() = user_id` owner scoping.

## AI Fields
`report_entries.source`, `.confidence`, `.review_status` track whether an entry came from AI extraction and its review state. `screenshots.extracted_data` stores raw AI JSON for audit.