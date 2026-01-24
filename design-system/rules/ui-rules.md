# UI Rules & Contracts

This document defines **what is allowed and what is forbidden**.

---

## Surfaces

### Page Canvas
- Always uses `bg-background`
- Never tinted
- Never pure white

### Cards
- Always `bg-card`
- Rounded `rounded-xl`
- Soft border `border-border/50`
- Soft shadow only

### Recessed Containers
- `bg-muted/50`
- No shadow
- Used for tabs, filters, inline editing

---

## Cards: When NOT to use

❌ Page titles  
❌ Section headers  
❌ Empty states  
❌ Transient messages  

Cards are for **content**, not structure.

---

## Accent Color Rules

Use accent color ONLY for:
- Primary CTA
- Selected state
- Progress indicators

Never use accent color for:
- Full backgrounds
- Paragraph text
- Decorative borders

---

## Inputs

- Match parent surface
- No harsh focus states
- Focus ring uses `--ring` at low opacity
- Placeholder always muted

---

## Checkboxes

- Native checkboxes are forbidden
- Always use `ProtanniCheckbox`
- Rounded
- Calm transition
- No aggressive checked states

---

## Empty States

- Belong to the canvas, not cards
- Neutral language
- Suggest action, never shame
