# Test Plan

## v1 Success Scenario
1. Open app (no login) → see "Lincoln Elementary" school with "Fall 2024" semester.
2. Click "Grade 5 Math" tab → see 3 students with marks and attendance rows.
3. Click "Add Entry" → pick a student, enter marks=17, attendance=present, date=today → Save.
4. New row appears in the tab instantly.
5. Click "Upload Report" → select a photo of a handwritten report.
6. Wait for extraction → see extracted entries with confidence scores.
7. Edit one entry's marks → click "Save All."
8. Entries appear in the class tab with `source = ai_extracted`.

## Empty State
- Create a new class → open its tab → see "No entries yet. Upload a report or add one manually."
- Upload a screenshot → no students extracted → see "No entries detected. Check image quality or add manually."

## Error State
- Upload a non-image file → see "Please upload an image file (PNG, JPG)."
- Vision API fails/times out → see "Extraction failed. You can add entries manually." → manual form still works.
- Network error on save → see "Could not save. Please retry." → data not lost (form retains values).

## Duplicate Prevention
- Add an entry for student X on date D → try adding another for same student + date → see "An entry already exists for this student on this date."

## Permission (post lock-down)
- Logged out → can view demo school, cannot see "Add Entry" or "Upload" buttons.
- Logged in as user A → cannot see user B's schools.