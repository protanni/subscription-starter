# PROTANNI MVP – Dev Notes (P0 Core Loop)

## P0 goal
Deliver a minimal workflow that feels like a real product in < 5 minutes:
1) Quick Capture (Inbox)
2) Convert capture → task
3) Toggle task done/undo
4) Today view shows KPIs + events (formatted)

## Why Server Components + Client Components?
- Server Components: initial data fetch, fast first render.
- Client Components: interactivity (buttons, forms).
- API routes: mutations live in one place with auth + validation.

## API routes (mutations)
- POST /api/captures
- POST /api/captures/archive
- POST /api/captures/convert-to-task
- POST /api/tasks
- POST /api/tasks/toggle

## Refresh strategy
After each mutation, we call `router.refresh()`:
- re-runs server-side queries
- keeps UI consistent without full page reload
- avoids passing event handlers through Server Components

## Next improvements (P1)
- Due dates & Today task list (due today + overdue)
- Inline edit (task title, capture content)
- Life areas (assign + filter)
- Toast notifications + better error UI
