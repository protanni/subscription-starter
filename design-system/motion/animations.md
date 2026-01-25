# Motion & Animations

PROTANNI uses **Framer Motion** presets from `components/ui-kit/motion-presets` for consistent, restrained animations.

## Presets

| Preset | Usage |
|--------|--------|
| `containerVariants` | Stagger container: `hidden` → `show` with `staggerChildren: 0.08` |
| `itemVariants` | List items: `hidden` (opacity 0, y 8) → `show` (opacity 1, y 0) |
| `fastContainerVariants` | Faster stagger: `staggerChildren: 0.05` |
| `tapScale` | `whileTap: { scale: 0.95 }` for buttons |
| `springTransition` | `type: 'spring', stiffness: 400, damping: 30` |

## Usage

```tsx
import { containerVariants, itemVariants } from '@/components/ui-kit';

<motion.div variants={containerVariants} initial="hidden" animate="show">
  <motion.section variants={itemVariants}>...</motion.section>
</motion.div>
```

## Rules

- Use **subtle** motion: light opacity/y transitions, no aggressive bounces or long duration.
- Prefer **stagger** for lists and sections to keep a calm, premium feel.
- **Tap feedback:** `whileTap: { scale: 0.95 }` or similar for interactive elements.
- Avoid dense or flashy animations; align with the off-white, calm aesthetic.
