# Component Audit Checklist

Use this checklist when adding or updating UI components to stay consistent with the PROTANNI design system.

## Tokens & colors

- [ ] Use **shadcn/Tailwind HSL tokens** only (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--ring`). No `--pt-bg` / `--pt-text` / `--pt-primary`.
- [ ] Page/section backgrounds → `bg-background` (warm off-white).
- [ ] Cards & input surfaces → `bg-card`.
- [ ] Muted containers → `bg-muted/50` or `bg-muted`.
- [ ] **Restrained** accent: use primary/ring for focus, checkboxes, key CTAs only.

## Surfaces

- [ ] Main cards: `rounded-xl`, `shadow-card`, `border-border/50`, `p-4` / `p-5`.
- [ ] Pills, tabs: `rounded-md`, `bg-muted/50` where appropriate.
- [ ] Inputs: `rounded-xl`, `bg-card`, soft border, `shadow-sm`.
- [ ] No dense layouts; keep generous spacing (`space-y-6`, `p-4`).

## Checkboxes

- [ ] Use **`ProtanniCheckbox`** from `@/components/ui-kit` for all task, habit, and today checkboxes.
- [ ] Round, premium style; uses `ring` / `primary` tokens. No global `accent-color` override.

## Motion

- [ ] Use `containerVariants` / `itemVariants` (or `fastContainerVariants`) for list/section stagger.
- [ ] Prefer subtle opacity/y transitions; avoid aggressive or long animations.

## Navigation

- [ ] **Do not** modify bottom navigation (routing, structure, or styling) unless explicitly required.
- [ ] Nav uses `--nav-background`, `--nav-border`, `--nav-active`, `--nav-inactive`.

## Quick reference

| Area | Rule |
|------|------|
| Background | Off-white `bg-background` |
| Cards | White `bg-card`, `rounded-xl`, `shadow-card` |
| Muted | `bg-muted/50`, `rounded-lg` |
| Checkboxes | `ProtanniCheckbox` |
| Motion | `containerVariants` + `itemVariants` |
| Bottom nav | Do not change |
