# Admin Theme Overhaul Plan — "Demo Parity"

**Created:** 2026-07-16 · **Status:** Planned, awaiting go-ahead
**Reference:** https://kos-yachts.vercel.app/demo (studied via its shipped CSS), plus
shadcn-admin / next-shadcn-dashboard-starter as secondary patterns.

Goal: one fixed brand identity (navy + gold + white) with light AND dark modes that
both look right, delivered through theme tokens — then shared admin primitives so
every page/component (buttons, cards, chips) inherits it instead of hand-rolling classes.

---

## 1. What the demo actually does (extracted from its CSS)

### Light mode
| Token | Value | Note |
|---|---|---|
| `--background` / `--card` / `--popover` | `#ffffff` | White on white — **borders do separation**, not gray fills |
| `--foreground` | `#1e293b` | Slate ink, not black |
| `--primary` | `#27445c` | The brand navy (site primary) |
| `--secondary` / `--accent` | `#eef1f5` | Cool light fills |
| `--muted` / `--muted-foreground` | `#f5f7f9` / `#5b6b7b` | |
| `--brand` / `--brand-soft` / `--brand-strong` | `#b2a37a` / `#f4f0e6` / `#73663f` | **Gold as a first-class token** with tint + deep variant |
| `--success` / `--success-soft` | `#1f7a55` / `#e9f6ef` | Semantic states each ship with a `-soft` tint |
| `--warning` / `--warning-soft` | `#8a5a16` / `#fbf1e2` | |
| `--destructive` / `--destructive-soft` | `#c0392b` / `#fdece9` | |
| `--border` / `--input` | `#e4e8ee` | |
| `--ring` | `#8a7a4e` | Focus ring is *gold*, a constant brand signature |
| `--radius` | `0.75rem` | (ours is 0.625) |

### Dark mode — the part we failed to hack
| Token | Value | Note |
|---|---|---|
| `--background` | `#0e1b27` | **Deep navy canvas**, not black |
| `--card` / `--popover` | `#15283a` | Lighter navy = elevation (lighter-is-closer) |
| `--secondary` / `--accent` | `#1c2f40` | |
| `--muted` | `#142634` / fg `#93a4b4` | |
| `--primary` | `#e9eef3` (fg `#0e1b27`) | Primary flips to light-on-navy for buttons |
| `--brand` | `#c2b184` (strong `#d4c590`, soft `#2a2417`) | Gold brightened for dark bg |
| `--success` / `--warning` / `--destructive` | `#4ade80` / `#e0a23a` / `#ef5a52` | Brightened, with dark `-soft` tints |
| `--border` / `--input` | `#213548` | Borders carry depth (shadows are useless on dark) |
| `--ring` | `#c2b184` | Gold ring again |

### Principles worth copying
1. **Same hue family in both modes** — dark mode is the navy brand world, light mode is
   the white world with navy/gold accents. Both are "ours"; neither is a generic flip.
2. **Semantic tokens with `-soft` pairs** — success/warning/destructive each have a tint,
   so chips/badges never hand-pick `emerald-500/10` per component.
3. **Gold = `brand`, navy = `primary`** — two distinct roles. Primary drives buttons/links;
   brand is the accent (rings, highlights, premium moments).
4. Light mode separates with **borders on white**, dark mode with **surface lightness**.
5. Radius 0.75rem, Montserrat headings (we already load Montserrat).
6. Utilities used in demo markup: `bg-brand`, `bg-brand-soft`, `text-brand-strong`,
   `bg-success-soft`, etc. — mapped via Tailwind v4 theme vars.

## 2. What we have today (codebase sweep)

- **`admin-theme.css`**: neutral gray-blue light tokens (primary = near-black, not navy);
  dark mode = pure black background with gray cards; card was gray-on-white until the
  `9070062` patch. No brand/gold, no semantic soft tints.
- **Accent-theme switcher**: `admin-accent-theme.tsx` + config + cookie + 8 `theme-*`
  classes overriding `--color-primary`. Conflicts with a fixed brand identity → retire.
- **~40 hardcoded palette usages** across admin/inquiries surfaces
  (`emerald-*` ≈15, `red-*` ≈9, `amber-*` ≈6, `sky-*` ≈4, `violet-*` ≈4, etc.).
  Two distinct kinds:
  - *Semantic states* (success/urgent/warning) → should become token utilities.
  - *Categorical identity* (lead-type tints in `LEAD_TYPE_AVATAR_TINTS`/badges) →
    stays categorical; optionally formalized later as `--category-*` tokens.
- **Style constants duplicated per page**: `CARD_CLASS` / `CARD_HEADER_CLASS` /
  `PILL_LINK_CLASS` in the dashboard; equivalent inline classes on inquiries list/detail.
- **`globals.css`** already defines `--color-gold: #b2a37a` (site-wide) — same hex as the
  demo's brand. Good sign: one gold everywhere.

## 3. Decision points (need Aidan's call before Phase 1)

1. **Light canvas**: demo = white page + white cards + borders. Current dashboard =
   soft-gray canvas + white cards + shadows (Aidan approved this look).
   **Recommendation:** keep our gray canvas (`--background` ≈ `#f5f7f9`-tinted) with
   white cards — it's the same system, one step softer than the demo — and drop the
   per-page negative-margin canvas hack once the token carries it.
2. **Keep light/dark toggle?** Demo proves both modes work. **Recommendation:** yes,
   keep next-themes light/dark; retire only the accent switcher.
3. Radius bump 0.625 → 0.75rem (visual audit needed on dense tables). Recommend yes.

## 4. The plan

### Phase 1 — Tokens (the big win, ~1 file)
Rewrite `.admin-theme` and `.dark .admin-theme` in `admin-theme.css` with the demo
palette (§1 tables, adjusted per decision #1). Add the new token set:
`--brand`, `--brand-soft`, `--brand-strong`, `--success(-soft)`, `--warning(-soft)`,
`--destructive-soft`, gold `--ring`. Map them to utilities in `globals.css` `@theme`
(`--color-brand: var(--brand)` etc. with `:root` fallbacks so public pages compile).
Update the overscroll rule (`html.dark` bg) from black to `#0e1b27`.
**Result:** every existing `bg-card`/`bg-muted`/`border-border` page instantly wears the
brand in both modes; my dashboard navy experiment becomes simply "dark mode, done right."

### Phase 2 — Retire the accent switcher (~4 files)
Delete `admin-accent-theme.tsx` + config + the 8 `theme-*` CSS blocks; remove provider
and cookie read from `admin/layout.tsx`; remove the switcher UI from the header/kbar.
Keep the light/dark toggle.

### Phase 3 — Shared admin primitives (`shared/admin/components/`)
Extract from the template pages, one source of truth:
- `AdminCard` / `AdminCardHeader` (today's CARD_CLASS/CARD_HEADER_CLASS)
- `PillLink` / `PillButton` (rounded-full muted pills)
- `SegmentedTabs` (the scope/outcome switcher — active = `bg-primary`)
- `CountPill` (red/amber count bubbles → `bg-destructive`/`bg-warning`)
- `EmptyState`, `StatRow` (financials rows)
Button: add a `brand` variant (gold bg, navy text) to the shadcn `Button` via CVA —
"New booking" and premium CTAs use it; default stays navy primary.
Server/client split falls out naturally: primitives are server-safe; only interactive
leaves (Claim/Assign/Archive, toggles) stay client.

### Phase 4 — Sweep pages onto tokens + primitives
Order: dashboard → inquiries list → inquiry detail → bookings → boats/add-ons/crew/users.
Replace hardcoded `emerald/amber/red` semantic colors with `success/warning/destructive`
utilities; swap inline card/pill classes for the primitives; delete the dashboard's
negative-margin canvas hack (token carries the canvas now). `inquiry-ui.ts` chip maps
move to token utilities (stage chips, outcome chips); lead-type tints stay categorical.

### Phase 5 — Dark-mode QA pass
Page-by-page in dark mode (the demo proves the palette; our components need eyeballing):
tables/manifest readability, calendar chips, dropdowns/popovers, toasts, focus rings.

### Effort
Phase 1–2: one evening. Phase 3: one evening. Phase 4: 1–2 evenings (mechanical).
Phase 5: an hour of clicking. Each phase is an independent commit; app works between phases.
