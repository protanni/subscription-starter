# PROTANNI Design System

This folder defines the **single source of truth** for PROTANNI’s visual language.
All UI decisions in the app must follow the rules defined here.

This design system was ported and refined from the original **core-clarity-system**,
with a focus on:
- Calm, premium, off-white aesthetic
- Mobile-first usability
- Emotional clarity and low cognitive load

---

## Design Principles

1. **Calm over contrast**  
   No aggressive colors, no harsh blacks or pure whites.

2. **Premium minimalism**  
   Fewer components, well spaced, with subtle depth.

3. **Single source of truth**  
   Tokens defined here must be used everywhere.  
   No hardcoded colors, borders, or radii in components.

4. **Mobile-first always**  
   Desktop adapts from mobile, never the opposite.

---

## Folder Structure

```txt
design-system/
├─ tokens/        → Color, radius, spacing, shadow tokens
├─ rules/         → Usage rules and UI decisions
├─ motion/        → Animation & transition guidelines
├─ checklist/     → UI quality checklist before merging
└─ README.md      → Entry point (this file)
