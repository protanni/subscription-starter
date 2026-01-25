# Color Tokens

PROTANNI uses **shadcn/Tailwind HSL tokens** as the single source of truth. All theme colors are defined in `styles/main.css` under `:root`.

## Core tokens

| Token | HSL value | Usage |
|-------|-----------|--------|
| `--background` | `40 30% 98%` | Page background (warm off-white) |
| `--foreground` | `220 20% 20%` | Primary text |
| `--card` | `0 0% 100%` | Cards, input surfaces (pure white) |
| `--card-foreground` | `220 20% 20%` | Text on cards |
| `--muted` | `40 15% 94%` | Muted containers, secondary surfaces |
| `--muted-foreground` | `220 10% 50%` | Secondary text, placeholders |
| `--border` | `40 20% 90%` | Borders, dividers |
| `--input` | `40 20% 90%` | Input borders |
| `--primary` | `158 35% 45%` | Accent, CTAs, checkboxes (restrained use) |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--ring` | `158 35% 45%` | Focus rings (matches primary) |
| `--destructive` | `0 60% 55%` | Errors, delete actions |
| `--destructive-foreground` | `0 0% 100%` | Text on destructive |

## Usage in CSS / Tailwind

- **Background:** `background: hsl(var(--background));` or `bg-background`
- **Text:** `color: hsl(var(--foreground));` or `text-foreground`
- **Cards:** `bg-card`, `border-border`
- **Muted:** `bg-muted`, `bg-muted/50`, `text-muted-foreground`

## Mood colors (pastel, calm)

Used for mood check-ins only: `--mood-great`, `--mood-good`, `--mood-neutral`, `--mood-low`, `--mood-bad` and their `-foreground` pairs.

## Rules

- **Do not** use legacy `--pt-bg`, `--pt-text`, or `--pt-primary` for global styling.
- Use **restrained** accent: primary for focus states, checkboxes, and key CTAs only.
