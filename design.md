# KOS Yachts — Design System & UI Guidelines

**Purpose:** Give AI agents and contributors consistent rules to match **Kings Of The Sea Yachts (KOS Yachts)** marketing and product UI—grounded in the live **home landing page** (`app/(root)/page.tsx`) and `features/_marketing/landing/components`.

**Stack reference:** Next.js, Tailwind CSS v4 (`@theme` in `app/globals.css`), shadcn/ui-style primitives, Framer Motion on marketing sections, Montserrat via `next/font`.

---

## 1. Brand & voice

- **Names:** “Kings Of The Sea Yachts” / “KOS Yachts” (interchangeable in copy; legal/footer often “KOS Yachts”).
- **Tone:** Confident, premium, approachable—**luxury without coldness**. Short supporting lines under headlines; hero emphasizes **experience** (charter, celebration, corporate).
- **Imagery:** Real water, yachts, guests; **full-bleed photography** with readable overlays. Avoid stock clichés when real brand assets exist (`/images`, `/clients`, `/icons`).

---

## 2. Typography

| Role | Implementation |
|------|----------------|
| **Body / UI** | **Montserrat** — `var(--font-montserrat)` on `<body>` (`app/layout.tsx`). Tailwind: default sans. |
| **Hero headline** | `text-4xl` → `xl:text-8xl`, **`font-extrabold`**, `leading-tight`, white on imagery. |
| **Section titles (H2)** | `text-3xl sm:text-4xl md:text-5xl`, **`font-bold`**, **`text-primary`** (`#27445c`). |
| **Section subtitles** | `text-sm sm:text-base`, **`font-light`**, **`text-foreground`** (or `text-gray-500` on light panels). Max width ~`max-w-md`–`max-w-lg`; often **`ml-auto`** for right-aligned blocks (e.g. Clients showcase). |
| **Accent line in hero** | Gradient text: `bg-linear-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent` (typing animation sits inside this span). |
| **Numbers / UI chrome** | Tabular alignment where money or counts matter (`tabular-nums` in app UI). |

**Modern practice — *fluid type scale*:** Landing uses **breakpoint steps** (`sm:`, `md:`, `lg:`) rather than a single fixed size—mirror this for new sections so type **scales with viewport**, not only zoom.

**Modern practice — *typographic hierarchy*:** One clear **H1 per page** (hero). Sections use **H2** + one supporting line. Card titles **H3** or `text-lg font-medium` as in testimonials.

---

## 3. Color system

### Brand & theme tokens (`app/globals.css` `@theme`)

- **`primary`** (marketing & key actions): **`#27445c`** — deep blue-gray. Use `text-primary`, `bg-primary`, borders `border-primary`, buttons via shadcn `default` variant.
- **`gold`** / **`gold-*`:** Accent (e.g. brand logo borders `hover:border-gold/30`). **#b2a37a** (`gold`) for warm highlights—not for large fills; use sparingly.
- **Semantic Tailwind / shadcn:** Prefer **`background`**, **`foreground`**, **`muted`**, **`muted-foreground`**, **`card`**, **`border`**, **`ring`** for forms and shells—keeps parity with `RequestToBook` and shared components.
- **Neutrals on landing:** `text-gray-900`, `text-gray-600`, `text-gray-700`, `border-gray-100`, `border-slate-200` for cards and chrome.
- **Accent fills:** Testimonials use **`bg-primary` + `text-white`** for a full-width **brand band**; review cards stay **white** for contrast (**figure–ground** inversion).

### Light mode only (main site)

Main marketing site is **light**; `:root` dark variables are not used for consumer pages. Admin may use separate theming—do not assume `dark:` on public landing unless explicitly requested.

**Modern practice — *WCAG contrast*:** White text on `bg-primary` is acceptable for large headings; small text needs **`opacity-90`** or slightly larger size (see testimonials). Form labels use `text-foreground` / `text-muted-foreground` for readability.

---

## 4. Layout & spacing

| Pattern | Usage |
|---------|--------|
| **Page content width** | Inner sections: **`max-w-[1400px] mx-auto px-4 sm:px-8`** (home). |
| **Section vertical rhythm** | **`py-8 sm:py-16`** (most blocks); CTA/form **`py-10 sm:py-16 md:py-20`**. |
| **Hero height** | **`h-[75vh] sm:h-[80vh]`**, `overflow-hidden`, layered `absolute` bg + `relative z-10` content. |
| **Grids** | Request form: **`lg:grid-cols-12`** with **`gap-8 lg:gap-12`**; clients: **CSS grid** `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` + **`auto-rows-[…]`** masonry-style spans. |
| **Carousels** | Negative margin on track **`-ml-3 sm:-ml-4`**, item padding **`pl-3 sm:pl-4`**; fixed **`basis-*`** for peek slides. |

**Modern practice — *mobile-first*:** Base styles = smallest viewport; enhance with `sm:`, `md:`, `lg:`, `xl:`.

**Modern practice — *consistent spacing scale*:** Prefer Tailwind spacing (4 = 1rem) aligned to **4/8px grid**—landing uses **`gap-3`/`gap-4`**, **`p-4`/`p-5`**, **`mb-4`/`mb-12`** systematically.

---

## 5. Shape, elevation, borders

- **Cards & surfaces:** **`rounded-2xl`** (locations, clients cells, form card), **`rounded-xl`** (testimonial cards, brand tiles), **`rounded-3xl`** (featured boat cards), **`rounded-full`** (carousel arrows, pills, primary CTAs in testimonials).
- **Buttons (shadcn):** Default **`rounded-xl`**, `h-10` / `lg: h-12` for primary flows; subtle **linear gradient** on primary (`from-primary to-primary/90`).
- **Elevation:** **`shadow-sm`** default cards → **`hover:shadow-md`** / **`hover:shadow-xl`** on hover; **`border border-gray-100`** on white cards.
- **Image treatments:** **`rounded-2xl overflow-hidden`**; **`group-hover:scale-105`/`scale-110`** with **`transition-transform duration-700`**; gradient overlays **`bg-linear-to-t from-black/70 via-black/10 to-transparent`** on location tiles.

**Modern practice — *depth & affordance*:** Elevation + border communicates **clickable cards**; keep hover **subtle** (scale ≤ 1.1, shadow step).

---

## 6. Motion & interaction

- **Framer Motion:** **`whileInView`** + **`viewport={{ once: true }}`** for scroll-in; **`initial={{ opacity: 0, y: 20 }}`** → **`animate`** to settled state; stagger **`delay: Math.min(idx * 0.08, 0.4)`**.
- **Reduced motion:** Always gate: **`const prefersReducedMotion = useReducedMotion()`** — if true, use **`initial={{}}`** (no entrance animation). Global CSS also reduces service-page animations under **`prefers-reduced-motion`**.
- **Marquee (brands):** **`animate-marquee`** / **`animate-marquee-reverse`**; **gradient masks** `from-white to-transparent` on edges so logos **fade at sides**—not hard clips.
- **Micro-interactions:** Chevron **`rotate-180`** when open; CTA **`group-hover:translate-x-1`** on arrow icon.

**Modern practice — *respect `prefers-reduced-motion`*** — required for accessible, modern UIs.

**Modern practice — *performance*:** Prefer **CSS transforms/opacity** for animation; **`will-change`** only when needed; lazy-load below-fold images (`loading="lazy"` with **`priority`** only for hero/first slides).

---

## 7. Components & patterns (landing-specific)

| Component | Role | Design notes |
|-----------|------|----------------|
| **HeroSection** | Full-bleed image, typewriter gradient keyword, **SearchBar** | Centered column; subtitle **`max-w-*`** fluid. |
| **FeaturedFleet** | Carousel + **BoatCard** | H2 left; round nav **`w-10 h-10`**, white, **`border-slate-200`**, **`text-primary`** icons. |
| **ClientsShowcase** | Masonry grid | Right-aligned title block; Instagram link **`text-primary`** + icon. |
| **LocationsSection** | Carousel of linked destination cards | **`aspect-square`**, bottom text white on gradient overlay. |
| **BrandsCarousel** | Dual marquee | White cards, **`border-gray-100`**, **`hover:border-gold/30`**. |
| **TestimonialsSection** | **`bg-primary`** band | White cards inside; **`rounded-full`** ghost nav; **`line-clamp-4`** on body; Google CTA **white pill**. |
| **RequestToBook** | Card form + divider “or” + secondary CTA | **`rounded-2xl`** card, **`h-11 rounded-xl`** inputs, **`bg-muted/10`**, focus **`ring-ring`**. |

**BoatCard (featured):** White surface, **`border-gray-100`**, **`shadow-sm`**, **`hover:-translate-y-0.5`**, **`rounded-3xl`** when featured—**consistent “premium listing”** language.

---

## 8. Forms & CTAs

- **Inputs:** `h-11`, **`rounded-xl`**, `border-border`, optional **`bg-muted/10`**, **`focus-visible:ring-2 focus-visible:ring-ring`**.
- **Primary action:** shadcn **`Button`** `variant="default"` `size="lg"` for main submit; full width **`w-full`** on mobile stacks.
- **Links in copy:** **`text-primary hover:underline`** for legal/secondary links inside forms.

**Modern practice — *form UX*:** Clear **`FormLabel`**, **`FormMessage`** errors, disabled + loading state on submit (“Sending…”).

---

## 9. Imagery & media

- **Next.js `Image`:** Always **`alt`** meaningful; **`sizes`** per layout; hero **`priority`** + **`quality={80}`** where already used.
- **Overlays:** Darken hero with **`bg-linear-to-b from-transparent to-black/60`** + opacity layer so **white type stays legible**.

**Modern practice — *responsive images*:** Match `sizes` to actual rendered width to avoid over-downloading.

---

## 10. Accessibility & semantics

- **Landmarks:** `<main>`, **`<section aria-label="…">`** on hero.
- **Carousel controls:** **`aria-label`** on prev/next (“Previous boats”, etc.).
- **Focus:** Visible **`focus-visible:ring`** on interactive shadcn components; don’t remove outlines without replacement.
- **Motion:** `useReducedMotion` + CSS **`prefers-reduced-motion`** overrides.

**Modern practice — *semantic HTML*** (`section`, `h1`–`h3`, `nav`, `button` vs `div` for actions) helps SEO and assistive tech.

---

## 11. Modern design practices (explicit checklist)

When building or refactoring UI, prefer:

1. **Mobile-first responsive design** — base = phone; add breakpoints up.
2. **Fluid typography** — scale type across `sm`/`md`/`lg` like existing H2/H1 patterns.
3. **8-point (4px) spacing rhythm** — Tailwind spacing units.
4. **Clear visual hierarchy** — one hero message; sections scannable in **F-pattern** (headline + support + CTA).
5. **Progressive disclosure** — carousels for dense lists; don’t dump everything above the fold.
6. **Consistent elevation language** — `shadow-sm` → `md`/`xl` on interaction.
7. **Micro-interactions** — short durations (200–500ms), transform/opacity-first.
8. **Accessible motion** — `prefers-reduced-motion` + Framer `useReducedMotion`.
9. **Contrast & legibility** — text on photos always backed by gradient or overlay.
10. **Content-first cards** — image dominant, type concise, one primary action.
11. **Design tokens** — `primary`, `foreground`, `muted`, `border` vs raw hex except brand greens/golds where already themed.
12. **Stable layout** — avoid CLS (e.g. hero typewriter in **`min-h-[1.2em]`** container).

---

## 12. File map (landing)

| Area | Path |
|------|------|
| Home composition | `app/(root)/page.tsx` |
| Landing sections | `features/_marketing/landing/components/*.tsx` |
| Global tokens & utilities | `app/globals.css` |
| Font | `app/layout.tsx` (`Montserrat`) |
| Featured boat UI | `shared/components/ui/boat-card/` |
| Shared button/input | `shared/components/ui/button.tsx`, `input.tsx`, `card.tsx` |

---

## 13. Do / Don’t (quick)

**Do**

- Use **`text-primary`** for section titles and key brand moments.
- Reuse **section spacing** (`py-8 sm:py-16`) and **max width** (`max-w-[1400px]`).
- Pair **Framer scroll reveals** with **reduced-motion** fallback.
- Keep **rounded-2xl / rounded-xl** family consistent with neighbors on the same page.

**Don’t**

- Introduce a second display font on marketing pages without design sign-off.
- Replace `primary` with random blues—**#27445c** is the brand anchor.
- Stack many competing gradients; hero + occasional accent is enough.
- Ignore focus states or `aria-label`s on icon-only controls.

---

*Last aligned with repo landing implementation. Update this doc when brand or layout primitives change.*
