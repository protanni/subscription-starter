# Loading & Pending States (UX System Standard)

Goal: the app must never leave the user without feedback during async operations.
No silent waits. No “did it work?” moments.

## 1) Page-level loading (navigation + server fetch)
- Use Next.js App Router `loading.tsx` in route segments.
- Dashboard standard: `app/dashboard/loading.tsx` shows a skeleton that matches the existing layout.
- Loading must appear immediately (no artificial delay).

## 2) Component-level loading (rare)
Use only when there is async work without a clear triggering control.
Prefer inline skeletons replacing the component content.

## 3) Mutation pending (create/update/toggle/convert)
For every user-triggered mutation:
- Disable the triggering control while the request is in-flight.
- Show a visible pending indicator on the same control/row.
- Prevent double-submit and double-toggle.
- Clear pending state in `finally` (success and error).

### Visual rules (no new design language)
- Use existing tokens and components.
- Pending indicator: small spinner (`Loader2` with `animate-spin`) or existing equivalent.
- While pending: `disabled` + optional `opacity-60`.
- On error: show a toast message.

## Inventory (must be covered)
Endpoints called from UI:
- Captures: /api/captures, /archive, /restore, /convert-to-task
- Habits: /api/habits, /toggle, /delete
- Tasks: /api/tasks, /toggle, /delete
- Mood: /api/mood
- Profile: /api/profile/daily-focus
