# Design System — FUTMINNA AI

## Color

A deep violet anchor blended deliberately with warm gold and emerald, rather than the washed-out lavender most "AI app" templates default to.

| Token | Hex | Use |
|---|---|---|
| `--color-violet-700` | `#5B21B6` | Primary brand color — buttons, links, active states |
| `--color-violet-950` | dark | Dark sections (e.g. landing page "How it works", auth side panel) |
| `--color-ink` | `#1C1428` | Primary text |
| `--color-gold-400/500/600` | amber tones | Trust/rating accents, CTAs that need to stand out against violet, the "pin tab" motif |
| `--color-emerald-500/600` | green tones | Money/success states — payment confirmed, verified badges, escrow released |
| `--color-warmgray-*` | warm-toned grays | Secondary text, borders, backgrounds (never pure black/white/gray) |

Full token list in `src/app/globals.css` under `:root`.

## Typography

- **Display** (`font-display`, mapped to Space Grotesk): headings, prices, stat numbers — slightly tighter and more geometric than the body face, so headings read as distinct from body copy rather than "Inter, but bigger."
- **Body** (`font-sans`, Inter): everything else. Chosen for legibility on low-end Android screens.
- **Mono** (`font-mono-code` utility class, JetBrains Mono): course codes (`MAT201`), used sparingly as a small recognizable detail.

Fonts are self-hosted as static variable-font files under `public/fonts/` (loaded via `@font-face` in `globals.css`) rather than pulled from Google Fonts' CDN — one less external network request, which matters on the low-bandwidth campus connections this brief explicitly calls out.

## The signature motif: the pin tab

`src/components/shared/pin-tab.tsx` — a small rotated colored square in the top-left corner of a card, evoking a thumbtack pinning a note to a noticeboard. Used **sparingly**: only on featured/recommended cards, never on every card in a grid, so it stays a meaningful signal rather than wallpaper. This ties the visual identity directly to the product's actual purpose (replacing physical campus noticeboards) rather than being decoration for its own sake.

## Components

All primitives live in `src/components/ui/` and follow shadcn/ui conventions (Radix UI primitives + Tailwind, `cn()` helper for class merging, `forwardRef` throughout). Notably:

- **Button** — variants `primary` (default), `outline`, `ghost`, `destructive`; sizes `sm`, `default`, `lg`, `icon`.
- **Badge** — variants `violet`, `emerald`, `gold`, `rose`, `neutral`, `outline` — used consistently for status (`order.status`, `tutor.status`, `report.status`) so the same color always means the same thing across the app (gold = pending/attention, violet = in progress, emerald = success/positive, rose = needs attention/negative, neutral = inactive/closed).

## Motion

Deliberately restrained: card lift + shadow transition on hover (`shadow-soft` to `shadow-lift`), a 200ms panel transition on the chat widget, no bounce/spring easing anywhere. `prefers-reduced-motion` is respected globally (see `globals.css`).

## Accessibility notes

- All interactive elements have visible `focus-visible` rings (violet, 2px).
- Color is never the only signal — status badges always include text, not just color.
- Form inputs are paired with `<Label>` via `htmlFor`/`id`.
- Minimum tap target sizing follows the `h-10`/`h-11` (40-44px) convention on primary buttons and inputs.

This wasn't run through an automated WCAG 2.2 AA audit tool in this pass — see `PRD.md`'s non-functional requirements table.
