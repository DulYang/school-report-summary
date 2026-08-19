# Security

## Secret Handling
- OpenAI API key stored in server-side env only (`OPENAI_API_KEY`). Never exposed to client.
- Supabase service role key server-side only; anon key in client.
- No secrets in `NEXT_PUBLIC_*` except Supabase anon URL/key (safe for client).

## Permission Model
- **v1 (demo):** permissive RLS — all tables readable/writable without login. Seed data visible to anonymous visitors.
- **Lock-down sprint:** replace permissive policies with `auth.uid() = user_id` on every table. Only owner sees their schools/entries.
- Admin inherits their own permissions — no super-admin role in v1.

## Approved Tools Rule
AI may only call named tools: `extract_screenshot`, `save_entries`, `match_student`. No arbitrary code execution, no raw database access from AI layer.

## Audit Principle
Every extraction and save logged with actor + action + target + timestamp. Reviewable after the fact. `review_status` on entries ensures nothing from AI is trusted without human check.

## Data Sensitivity
Student names + marks are personal data. Lock-down sprint must precede any real student data entry. Demo seed uses fictional names.