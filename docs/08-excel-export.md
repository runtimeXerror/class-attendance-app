# Module 08 — Excel Export

## Overview

Teacher can download a beautifully formatted Excel sheet containing complete attendance data for a subject.

## Features

- Date-wise columns (each class is one column)
- P/A status with color coding (Green=Present, Red=Absent)
- Auto-calculated Present, Total, and Percentage
- Student roster sorted by Registration Number
- Professional formatting (colored headers, merged title bar)

## API Endpoint

```
GET /api/teacher/export/{subject_id}
Auth: Teacher JWT required
Response: .xlsx file download
```

## Excel Format

```
┌─────────────────────────────────────────────────────┐
│ AI (CS501) - Attendance Report (spanning all cols)  │  ← Title row
├───────────────────────────────────────────────────────┤
│ S.No │ Reg No │ Name │ Section │ 16-Jan │ 17-Jan │ … │ Present │ Total │ %  │
├──────┼────────┼──────┼─────────┼────────┼────────┼───┼─────────┼───────┼────┤
│  1   │ 23..001│Gautam│    A    │   P    │   P    │ … │   22    │  28   │78% │
│  2   │ 23..002│Chandan│   A    │   A    │   P    │ … │   18    │  28   │64% │
│  …   │  …     │  …   │   …     │   …    │   …    │ … │    …    │   …   │ …  │
└─────────────────────────────────────────────────────┘
```

## Color Coding

- **Title row:** Indigo (#4F46E5), white bold text
- **Header row:** Lighter indigo (#6366F1), white
- **P cells:** Green-light background (#D1FAE5)
- **A cells:** Red-light background (#FEE2E2)

## Implementation

Backend uses `openpyxl`:
```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
ws = wb.active
# ... build dynamically from DB records
buf = BytesIO()
wb.save(buf)
return Response(content=buf.read(), media_type="...xlsx")
```

## Usage Flow

1. Teacher opens subject card
2. Taps "📊 Export" button
3. App shows URL to open in browser
4. Browser downloads the `.xlsx` file
5. Open in Excel / Google Sheets / LibreOffice

## Future Enhancements (v2.x)

- Native mobile download (using `expo-file-system` + `expo-sharing`)
- Email the Excel directly
- Bulk export (all subjects in one ZIP)
- Admin-level export: full branch reports
- Custom date range filtering

## Technical Notes

- File generated in-memory (no disk writes)
- Compatible with Excel 2007+, LibreOffice, Google Sheets
- Formulas are not used (static values) — future enhancement
- Filename includes subject code: `CS501_attendance.xlsx`
