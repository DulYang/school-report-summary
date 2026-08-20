set search_path to public, extensions;

create table if not exists public.report_sheets (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  school_label text, group_label text, day_time text, lead_coach text,
  teacher text, assistant text, theme text, focus_training text,
  rules text, around_world text, notes text, sheet_fingerprint text,
  user_id uuid, created_at timestamptz not null default now()
);
create unique index if not exists report_sheets_class_fingerprint_unique
  on report_sheets(class_id, sheet_fingerprint) where sheet_fingerprint is not null;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  report_sheet_id uuid references public.report_sheets(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null, student_count_present integer,
  coached_by text, assisted_by text, source text not null default 'manual',
  review_status text not null default 'confirmed', user_id uuid,
  created_at timestamptz not null default now(), unique(class_id, session_date)
);

create table if not exists public.assessment_metrics (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  name text not null, display_order integer not null default 0,
  created_at timestamptz not null default now(), unique(session_id, name)
);

create table if not exists public.student_session_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  attendance text not null default 'unknown', notes text,
  source text not null default 'manual', confidence numeric,
  review_status text not null default 'confirmed',
  screenshot_id uuid references public.screenshots(id) on delete set null,
  created_at timestamptz not null default now(), unique(session_id, student_id)
);

create table if not exists public.student_metric_values (
  id uuid primary key default gen_random_uuid(),
  student_session_record_id uuid not null references public.student_session_records(id) on delete cascade,
  assessment_metric_id uuid not null references public.assessment_metrics(id) on delete cascade,
  raw_value text, numeric_value numeric, confidence numeric,
  review_status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  unique(student_session_record_id, assessment_metric_id)
);

alter table public.screenshots add column if not exists report_sheet_id uuid references public.report_sheets(id) on delete set null;

alter table report_sheets enable row level security;
alter table sessions enable row level security;
alter table assessment_metrics enable row level security;
alter table student_session_records enable row level security;
alter table student_metric_values enable row level security;
create policy "report_sheets_demo_all" on report_sheets for all using (true) with check (true);
create policy "sessions_demo_all" on sessions for all using (true) with check (true);
create policy "assessment_metrics_demo_all" on assessment_metrics for all using (true) with check (true);
create policy "student_session_records_demo_all" on student_session_records for all using (true) with check (true);
create policy "student_metric_values_demo_all" on student_metric_values for all using (true) with check (true);

-- Backfill the existing demo records into the matrix without changing legacy data.
insert into sessions(class_id, session_date, source, review_status)
select distinct class_id, entry_date, source, review_status from report_entries
on conflict(class_id, session_date) do nothing;
insert into assessment_metrics(session_id, name, display_order)
select distinct s.id, 'Marks', 0 from sessions s
join report_entries e on e.class_id=s.class_id and e.entry_date=s.session_date
on conflict(session_id, name) do nothing;
insert into student_session_records(session_id, student_id, attendance, notes, source, confidence, review_status, screenshot_id)
select s.id, e.student_id, coalesce(e.attendance,'unknown'), e.remarks, e.source, e.confidence, e.review_status, e.screenshot_id
from report_entries e join sessions s on s.class_id=e.class_id and s.session_date=e.entry_date
on conflict(session_id, student_id) do nothing;
insert into student_metric_values(student_session_record_id, assessment_metric_id, raw_value, numeric_value, confidence, review_status)
select r.id, m.id, e.marks::text, e.marks, e.confidence, e.review_status
from report_entries e
join sessions s on s.class_id=e.class_id and s.session_date=e.entry_date
join student_session_records r on r.session_id=s.id and r.student_id=e.student_id
join assessment_metrics m on m.session_id=s.id and m.name='Marks'
on conflict(student_session_record_id, assessment_metric_id) do nothing;
