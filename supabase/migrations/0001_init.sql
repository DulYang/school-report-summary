-- School Report Summary schema

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table schools enable row level security;
drop policy if exists "schools_v1_read" on schools;
create policy "schools_v1_read" on schools for select using (true);
drop policy if exists "schools_v1_write" on schools;
create policy "schools_v1_write" on schools for all using (true) with check (true);

create table if not exists semesters (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  user_id uuid,
  created_at timestamptz not null default now()
);
-- Upgrade early demo installs that created semesters before date tracking existed.
alter table semesters add column if not exists start_date date;
alter table semesters add column if not exists end_date date;
alter table semesters enable row level security;
drop policy if exists "semesters_v1_read" on semesters;
create policy "semesters_v1_read" on semesters for select using (true);
drop policy if exists "semesters_v1_write" on semesters;
create policy "semesters_v1_write" on semesters for all using (true) with check (true);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  semester_id uuid not null references semesters(id) on delete cascade,
  name text not null,
  user_id uuid,
  created_at timestamptz not null default now()
);
-- Upgrade early demo installs where a class was linked only through its semester.
alter table classes add column if not exists school_id uuid references schools(id) on delete cascade;
update classes c
set school_id = s.school_id
from semesters s
where c.semester_id = s.id and c.school_id is null;
alter table classes enable row level security;
drop policy if exists "classes_v1_read" on classes;
create policy "classes_v1_read" on classes for select using (true);
drop policy if exists "classes_v1_write" on classes;
create policy "classes_v1_write" on classes for all using (true) with check (true);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table students enable row level security;
drop policy if exists "students_v1_read" on students;
create policy "students_v1_read" on students for select using (true);
drop policy if exists "students_v1_write" on students;
create policy "students_v1_write" on students for all using (true) with check (true);

create table if not exists screenshots (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  image_url text not null,
  status text not null default 'uploaded',
  extracted_data jsonb,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table screenshots enable row level security;
drop policy if exists "screenshots_v1_read" on screenshots;
create policy "screenshots_v1_read" on screenshots for select using (true);
drop policy if exists "screenshots_v1_write" on screenshots;
create policy "screenshots_v1_write" on screenshots for all using (true) with check (true);

create table if not exists report_entries (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  entry_date date not null,
  attendance text,
  marks numeric,
  remarks text,
  source text default 'manual',
  confidence numeric,
  review_status text default 'unreviewed',
  screenshot_id uuid references screenshots(id) on delete set null,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table report_entries enable row level security;
drop policy if exists "report_entries_v1_read" on report_entries;
create policy "report_entries_v1_read" on report_entries for select using (true);
drop policy if exists "report_entries_v1_write" on report_entries;
create policy "report_entries_v1_write" on report_entries for all using (true) with check (true);

-- Seed data
insert into schools (id, name) values
  ('a0000000-0000-0000-0000-000000000001', 'Lincoln Elementary'),
  ('a0000000-0000-0000-0000-000000000002', 'Riverside Academy')
on conflict (id) do nothing;

insert into semesters (id, school_id, name, start_date, end_date) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Fall 2024', '2024-09-01', '2024-12-20'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Fall 2024', '2024-09-01', '2024-12-20')
on conflict (id) do nothing;

insert into classes (id, school_id, semester_id, name) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Grade 5 Math'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Grade 5 Science'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Grade 6 English')
on conflict (id) do nothing;

insert into students (id, class_id, name) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Aarav Sharma'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Priya Patel'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Liam OBrien'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Sofia Garcia'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Noah Kim')
on conflict (id) do nothing;

insert into report_entries (class_id, student_id, entry_date, attendance, marks, remarks, source, confidence, review_status) values
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2024-09-15', 'present', 18, 'good participation', 'manual', null, 'confirmed'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '2024-09-15', 'present', 15, '', 'manual', null, 'confirmed'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', '2024-09-15', 'absent', 0, 'absent', 'manual', null, 'confirmed'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2024-09-16', 'present', 20, 'excellent', 'ai_extracted', 0.95, 'confirmed'),
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '2024-09-16', 'late', 12, 'arrived 10min late', 'ai_extracted', 0.72, 'edited'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', '2024-09-15', 'present', 19, 'great lab work', 'manual', null, 'confirmed');
