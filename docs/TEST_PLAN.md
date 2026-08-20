# Test Plan

## v1 Success Scenario
1. Open app (no login) → see "Lincoln Elementary" school with "Fall 2024" semester.
2. Click a class tab → see students as rows and existing session dates as grouped columns.
3. Click "Add Session" → enter a date, add metric headers, and fill attendance/values for students → Save.
4. The new date group appears instantly without altering earlier dates.
5. Click "Upload Report" → select a rotated phone photo of one paper sheet containing at least three dates.
6. Wait for extraction → see sheet metadata plus a roster-by-date review matrix with confidence warnings.
7. Verify that different dates may have different metric subcolumns; edit one uncertain cell → click "Save Matrix."
8. Every extracted date appears in the class spreadsheet with `source = ai_extracted` and students aligned to existing roster rows.
9. Photograph the same sheet after one more date is handwritten, upload again, and save.
10. Only the new date/cells are added; previously saved dates, students, and metric cells remain singletons.

## Empty State
- Create a new class → open its tab → see "No sessions yet. Upload a report or add a session manually."
- Upload a screenshot with a roster but no filled dates → show the detected roster and "No completed session dates detected."
- A blank cell stays blank; it is never converted to `0` or `absent`.

## Error State
- Upload a non-image file → see "Please upload an image file (PNG, JPG)."
- Vision API fails/times out → see "Extraction failed. You can add a session manually." → manual matrix still works.
- Date grouping or rotated-grid detection is uncertain → require confirmation before any save.
- Network error on save → see "Could not save. Please retry." → data not lost (form retains values).

## Duplicate Prevention
- Save student X on date D with metric M → retry the same save → no duplicate session, record, or metric cell is created.
- Upload the same unchanged photo twice → second review shows no new data.
- Upload the same page with one added date → only that date is proposed as new.

## Template Fidelity
- Preserve roster row order from the paper while linking each row to the canonical student.
- Extract page metadata: school, group/class, day/time, lead coach, teacher, assistant, theme, focus training, rules, around-world activity, number present, and notes.
- Support attendance symbols `P`, `A`, and `L`, plus unknown/illegible states.
- Support date-specific metric sets such as `Focus Training`, `Right Behavior`, and `Physical Fitness`.
- Preserve overwritten or crossed-out values as review flags with the source crop available.

## Permission (post lock-down)
- Logged out → can view demo school, cannot see "Add Session" or "Upload" buttons.
- Logged in as user A → cannot see user B's schools.
