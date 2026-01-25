## 📁 `design-system/tokens/README.md`

```md
# Design Tokens

Design tokens are the **atomic values** used across the UI.
They must be treated as immutable contracts.

---

## Color System (HSL)

### Backgrounds
- `--background`: warm off-white  
  `40 30% 98%`
- `--card`: pure white  
  `0 0% 100%`
- `--muted`: soft neutral background  
  `40 15% 92%`

### Text
- `--foreground`: warm charcoal  
  `24 10% 15%`
- `--muted-foreground`: secondary text  
  `24 6% 45%`

### Accent (Primary)
- `--primary`: sage green  
  `158 35% 45%`
- Usage must be **intentional and sparse**

### Borders & Rings
- `--border`: neutral border  
- `--ring`: same hue as primary, lower intensity

---

## Radius

- Small: `0.375rem`
- Default: `0.5rem`
- Large: `0.75rem` (cards, primary containers)

---

## Spacing

- Page vertical rhythm: `space-y-6`
- Card internal padding: `p-5`
- List item padding: `p-4`
- Input padding: `px-4 py-3`

---

## Shadows

- `shadow-card`: very soft, low-opacity
- Never use hard or dark shadows
- Depth comes from **contrast + layering**, not elevation drama
