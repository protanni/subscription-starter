# Surface Rules

Surfaces define the calm, premium PROTANNI aesthetic. Follow these rules for layouts, cards, and containers.

## Background & page

- **Page background:** Warm off-white → `bg-background` / `hsl(var(--background))`
- **Do not** use mint or green page backgrounds. The app uses a single off-white background globally.

## Cards & elevated surfaces

- **Cards:** Pure white → `bg-card`
- **Border:** Soft → `border-border` or `border-border/50`
- **Radius:** Main cards → `rounded-xl`; pills, tabs, small controls → `rounded-md`
- **Shadows:** Soft elevation → `shadow-card` or `shadow-sm`. Use `.shadow-card` for primary cards, `shadow-sm` for subtle elevation.
- **Padding:** Generous → `p-4` or `p-5` for cards; avoid dense layouts.

## Muted containers

- **Pills, tabs, secondary containers:** `bg-muted/50`, `rounded-lg`
- **Dividers:** `divide-border/50` or `divide-border/30` for muted lists
- **Empty states, secondary blocks:** `bg-card/60`, `border-border/30` where appropriate

## Inputs

- **Input surfaces:** `bg-card`, `rounded-xl`, soft `border-border`, subtle `shadow-sm`
- **Placeholders:** `text-muted-foreground`

## Summary

| Element | Background | Border | Radius | Shadow |
|---------|------------|--------|--------|--------|
| Page | `bg-background` | — | — | — |
| Main cards | `bg-card` | `border-border/50` | `rounded-xl` | `shadow-card` |
| Pills / tabs | `bg-muted/50` | — | `rounded-md` | — |
| Inputs | `bg-card` | `border-border` | `rounded-xl` | `shadow-sm` |
