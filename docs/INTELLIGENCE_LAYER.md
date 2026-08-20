# Intelligence Layer

## Messy Input
A rotated phone photo of a reused paper matrix: printed roster rows, several handwritten date groups, attendance symbols (`P`, `A`, `L`, blanks), numeric ratings, changing metric headers, overwritten cells, crossed-out students, and sheet-level coach/theme/rules notes.

## Auto-Structure Schema
```json
{
  "sheet": {
    "school_name": "Growing Kid School",
    "class_name": "PG B",
    "day_time": "Kamis, 10.30-11.30",
    "lead_coach": "C. Lisa",
    "teacher": null,
    "assistant": "C. Chelsea",
    "theme": "Rules",
    "focus_training": "Can follow rules: line up, start, stop",
    "around_world": "Sliding with paper plates"
  },
  "students": ["Jennifer Charlotte Tanuwijaya"],
  "sessions": [
    {
      "date": "2026-07-16",
      "metrics": ["Focus Training", "Right Behavior"],
      "records": [{
        "student_name": "Jennifer Charlotte Tanuwijaya",
        "attendance": "present",
        "values": {"Focus Training": "4", "Right Behavior": "4"},
        "confidence": 0.92
      }]
    },
    {
      "date": "2026-07-30",
      "metrics": ["Focus Training", "Right Behavior", "Physical Fitness"],
      "records": []
    }
  ]
}
```

## Extraction Logic
- Detect orientation and normalize the image before extraction.
- Detect the table grid: roster rows, date spans, and subcolumns beneath each date.
- Extract all dates first, then the metric headers and student cells belonging to each date.
- Preserve raw cell text/symbols and separately normalize attendance/numeric values.
- Parse response; match extracted names to the existing roster (fuzzy match).
- Unmatched names flagged for admin to resolve (create new student or map to existing).
- Blank cells remain blank. Cross-outs, overwrites, and ambiguous date/header boundaries are flagged for review.
- Compute a sheet fingerprint and suggest an existing report sheet when a later photo appears to be the same page.

## Confidence Scoring
- `confidence >= 0.85` → auto-suggest, admin just confirms.
- `0.60–0.85` → highlight for attention.
- `< 0.60` → mark as `unreviewed`, require manual check.
- Scoring is rule-based from Vision API's own confidence + name-match quality.

## Events to Track
- screenshot uploaded or linked to an existing report sheet
- extraction completed (success/failed)
- session/cell reviewed (confirmed/edited)
- session matrix saved (new vs updated cells counted separately)

## What Gets Ranked
Unreviewed cells sorted by confidence ascending, with uncertain date/header boundaries shown before ordinary values.

## v1 vs Later
- **v1:** single-image, multi-date matrix extraction; manual review; idempotent save; recognize a re-uploaded sheet.
- **Later:** batch upload, automatic alignment across cropped pages, auto-save high-confidence cells, recurring student matching across classes.
