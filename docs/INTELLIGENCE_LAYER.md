# Intelligence Layer

## Messy Input
A photo of a handwritten report: student names, marks (numbers or letters), attendance marks (✓, ✗, L), free-text remarks, possibly smudged or rotated.

## Auto-Structure Schema
```json
{
  "class_name": "Grade 5 Math",
  "date": "2024-09-15",
  "entries": [
    {
      "student_name": "Aarav Sharma",
      "attendance": "present",
      "marks": 18,
      "remarks": "good participation",
      "confidence": 0.92
    }
  ]
}
```

## Extraction Logic
- Send image to OpenAI Vision with a structured prompt: "Extract each student's name, attendance (present/absent/late), marks (numeric), and remarks. Return JSON."
- Parse response; match extracted names to existing roster (fuzzy match).
- Unmatched names flagged for admin to resolve (create new student or map to existing).

## Confidence Scoring
- `confidence >= 0.85` → auto-suggest, admin just confirms.
- `0.60–0.85` → highlight for attention.
- `< 0.60` → mark as `unreviewed`, require manual check.
- Scoring is rule-based from Vision API's own confidence + name-match quality.

## Events to Track
- screenshot uploaded
- extraction completed (success/failed)
- entry reviewed (confirmed/edited)
- entry saved

## What Gets Ranked
Unreviewed entries sorted by confidence ascending (lowest first) so admin sees the riskiest ones first.

## v1 vs Later
- **v1:** single-image extraction, manual review, save.
- **Later:** batch upload, auto-save high-confidence entries, recurring student name matching across screenshots.