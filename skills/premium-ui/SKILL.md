---
name: premium-ui
description: Design standards for building or reviewing any Green Hills inventory-platform frontend screen — layout, tables, forms, modals, toasts, charts, empty/loading/error states, mobile/PWA behavior, RTL/Arabic, accessibility, and light + dark theme. Load before writing or editing anything in frontend/src.
---

# Premium UI for Green Hills Inventory

The app already has a real design system: tokens in `frontend/tailwind.config.js`,
shared component classes in `frontend/src/index.css`, and React primitives in
`frontend/src/components/ui/` and `components/shared/`. The job is **consistency
with what exists**, not inventing a new look. Every new or touched screen should
move toward this standard. Don't leave a screen worse than you found it, and
don't rewrite unrelated screens speculatively.

The users are store keepers, branch managers, kitchen staff and admins, often on
a phone or a restaurant iPad (iOS 15), in English or Arabic, and usually in dark
mode. The bar is a tool they trust with real stock and real KWD. It should look
like a native inventory app (Odoo Inventory, Shopify admin/POS, Linear): flat
surfaces with hairline borders, solid buttons, quiet motion, dense lists. It
must never look like a game or a landing page: no glows, gradients, neon,
bouncing, or numbers that count up.

## Before building anything

1. **Reuse first.** Check `components/ui/README.md` and `components/shared/`:
   - `components/ui`: `Button`, `Input`, `Textarea`, `Select`, `Card`, `Table` (+ `Table.Data`), `Tabs`, `useToast`
   - `components/shared`: `Modal`, `ConfirmModal`, `QtyStepModal` (per-line qty for approve/dispatch/receive steps), `PageHeader`, `EmptyState`, `Badge`, `Spinner`, `CustomSelect`,
     `ItemSearchSelect`, `DatePicker`, `BarcodeScanner`, `StickyActionBar`, `Reveal`, `AnimatedCounter`
   - New code imports from one place: `import { Button, Card, Modal } from '@/components/ui'`.
2. **Match the page's existing idiom.** Most pages still hand-roll the CSS
   classes (`btn-primary`, `form-input`, `card`, `data-table`) instead of the
   React primitives. When editing such a page, staying consistent within the
   file beats half-migrating it. Use the primitives in new files.
3. **Extract on the third copy** of a pattern, not the second and not never.
4. **No new UI libraries** (MUI/Ant/Chakra/shadcn, toast libs, chart libs).
   The stack is fixed: Tailwind, `lucide-react` icons, `framer-motion`,
   `recharts`, `@tanstack/react-query`, `react-hook-form` + `zod`, `i18next`.
   Merge classes with `cn()` from `@/lib/cn`.

## Design tokens (use these, don't free-hand)

**Semantic colour tokens come first** (same roles as the Cookbook app's
`tokens.css`). They're defined once in `index.css` `:root` and re-pointed in
`.dark`, so every one flips with the theme by itself: no `dark:` variant, no
`isDark`. Tailwind names in `tailwind.config.js`:

| Role | Tailwind | CSS var |
|---|---|---|
| Page background | `bg-canvas` | `--canvas` |
| Card / sheet / modal | `bg-surface` | `--surface` |
| Inputs, menus, secondary buttons | `bg-surface-raised` (+ `hover:bg-surface-hover`) | `--surface-raised`, `--surface-hover` |
| Table header, wells | `bg-surface-sunken` | `--surface-sunken` |
| Text | `text-ink`, `text-ink-secondary`, `text-ink-muted`, `text-ink-faint` | `--ink*`, `--ink-label` for field labels |
| Borders | `border-hairline`, `-subtle`, `-strong` | `--hairline*` |
| Accent (teal) | `bg-accent text-accent-on`, `text-accent-ink`, `bg-accent-subtle` | `--accent*`, `--focus`, `--focus-ring` |
| Status | `text-success`/`-ink`/`bg-success-subtle`, same for `warning`, `danger`, `info` | `--success*` … |
| Floating layer shadow | `style={{ boxShadow: 'var(--shadow-float)' }}` | `--shadow-float` |

- Opacity modifiers (`bg-surface/50`) don't work on tokens; use the `-subtle` tokens.
- **Borders in dark:** the global `.dark * { border-color }` rule beats plain
  `border-*` utilities, so a border that must differ from the hairline in dark
  (focus state, accent outline) goes in `style={{ borderColor: 'var(--focus)' }}`
  or a `dark:border-…` variant.
- SVG icons can't read `var()` through the `color`/`stroke` attributes. Pass the token
  via `style={{ color: 'var(--accent-ink)' }}` and let lucide use `currentColor`.
- The older `--t-*` variables (below) still work; `--t-card` and `--t-fg-1` are now
  aliases of `--surface` and `--ink`.

Scales, when a token doesn't fit:
- **Accent:** `primary-*` (teal). `.btn-primary` is solid `var(--accent)`.
  Use the accent for primary actions, focus rings, the
  active tab/nav and selection only. Don't use it as decoration. Inline-styled
  pages that need a raw teal use `#14B8A6` (primary-500), not the old `#00C4A3`.
- **Neutrals:** `stone-*` is remapped to a cool graphite scale.
  Prefer tokens, then `stone-*`, in new code. `gray-*` is widespread in older pages,
  and it only themes correctly for the shades that `index.css` overrides.
- **Radius:** the scale is custom and tight. `rounded-card`/`rounded-2xl` (12px)
  for cards and sheets, `rounded-xl`/`rounded-lg` (8px) for inputs, buttons and
  menus, `rounded`/`rounded-md` (6px) for chips and badges.
- **Shadow:** `shadow-card` is a 1px hint only; surfaces are separated by a
  1px border. `shadow-card-lg` is for floating layers (menus, modals, toasts).
  Dark mode uses no elevation shadows at all.
- **Dark surface ladder:** page `#0a0a0b` → card `#121314` (`--t-card`) →
  raised/inputs `#18191b` → hover `#1e1f22`; borders 8–13% white. Flat, never
  glossy gradients.
- **Font:** Hanken Grotesk (UI) and IBM Plex Mono (figures/SKUs), the same as the
  Cookbook app, with Noto Sans Arabic in RTL. Set once as `--font-sans` / `--font-mono`
  in `index.css`: use `font-sans`/`font-mono` or `var(--font-sans)`, never a font name. `text-2xs` is available.
- **Inline-style tokens:** when a component styles with `style={{}}` objects,
  use the CSS variables in `index.css` `:root`. `--t-fg-1..4`, `--t-line-1..2`,
  `--t-fill-1..3`, `--t-card`, and `--t-ok/warn/info/danger/caution` (plus
  `-rgb` variants for alpha) all flip with `.dark` automatically. **Don't add new
  `isDark ? '#hex' : '#hex'` ternaries.** That's the older pattern (Modal,
  some dashboards), and the variables replace it.

Type scale in practice:
- Page title: `PageHeader` (`text-xl font-semibold`). Titles never go above 600–700 weight.
- Card title: `Card.Header` (`text-sm font-bold text-ink`)
- Field labels: `.label` (`text-[13px] font-medium`, sentence case). Table `th`:
  `text-xs font-semibold`, sentence case. Small uppercase overlines are allowed
  for section labels only, with `tracking` ≤ 0.06em.
- Body: `text-sm`. Secondary: `text-xs text-ink-muted`.
- **Numbers** (qty, KWD, counts, variances): `tabular-nums`, right-aligned in
  tables. Format money with `formatKWD` (3 decimals, KWD) and quantities with
  `formatQty` from `@/lib/formatters`. Never use `toFixed(2)` for money.

## Theme: light AND dark are both first-class

Dark is the default (`ThemeContext` starts in `'dark'`). Every screen must be
checked in **both** themes. "Fix X in dark mode" commits are the most common
kind of UI fix in this repo, so get it right the first time:
- The shared classes (`.card`, `.data-table`, `.btn-*`, `.input`, `.tab`,
  `.page-*`, `.stat-*`) are already themed. Build on them.
- `index.css` force-maps these to dark: `bg-white`, `bg-gray|stone-50/100/200`,
  `border-*-100/200`, `text-gray|stone-400/500/600/700/900`, `text-ink*`,
  `bg-{red,amber,green,emerald,blue,purple,primary}-50`. **Anything outside
  that list needs an explicit `dark:` variant**, e.g. `text-gray-800`,
  `bg-teal-50`, `border-amber-200` or arbitrary hex values.
- Light mode remaps pastel text shades (`text-red-400` etc.) for contrast
  via `:where(html:not(.dark))`. Still pick a ≥4.5:1 shade on purpose.
- When coloured accents (chart series, category dots) are drawn as **text**,
  pass them through `accentText(hex, isDark)` from `@/lib/accentText`.
- Status pills use `Badge` (`status=` for known workflow states, `color=` otherwise).
  Don't hand-roll pill colours.

## Layout, navigation, mobile

- Shell: `RootLayout` = desktop `Sidebar` (md+), mobile `BottomNav` (below md),
  content capped at 1680px, padding `p-4 lg:p-6`, and `pb-nav` so content
  clears the bottom nav. Don't add another top-level nav pattern.
- Every page starts with `PageHeader` (title, subtitle, actions on the right).
- **Mobile is a primary target** (installed PWA, phones and iPads):
  - Use `calc(var(--vh, 1vh) * N)` / `.min-h-dvh`, never raw `dvh`/`vh`
    (iOS 15 doesn't support dvh).
  - Use `.safe-bottom` / `.safe-top` for anything fixed to screen edges.
  - Long forms on mobile get `StickyActionBar` for Save/Cancel.
  - Touch targets are at least 40px. Nothing can depend on hover.
- Hide screen-only chrome on print with `no-print`. Printable documents live
  in `features/print/` on `PrintLayout`. Don't style in-app pages for paper.

## Data tables

- Base: `.data-table` (or `Table` / `Table.Data`). Header row, hover tint and
  dark mode already come with it.
- **Wide tables** (more than ~5 columns, or anything shown on a phone): wrap in
  `<div className="card table-scroll">` and put `sticky-col-table` on the
  `<table>` so the item-name column stays pinned. Don't use a bare
  `overflow-x-auto`.
- Numeric columns: `tabular-nums` + `text-end` (right in English, mirrors in
  Arabic). Print layouts use the `.r` class for the same thing.
- Row actions: a couple of icon/text buttons is fine. Switch to a `⋯` menu at
  four or more actions.
- Server data goes through react-query hooks in `services/hooks/`. Don't
  `useEffect` + axios in a page. Paginate or filter server-side once a list
  can grow past ~100 rows (items, movements, audit log).

## Filtering & search

- A small known set (branches, statuses, ≤ ~8 values) → `Tabs` / tab-group or button row.
- A large set → search input. For items use `ItemSearchSelect` (name/SKU
  live search, portalled so it isn't clipped).
- Dropdowns: `CustomSelect` (portalled, animated), not a native `<select>`,
  in new UI. Dates: `DatePicker`.
- Barcode entry: `BarcodeScanner`. Don't write another camera flow.

## Forms

- Fields: `Input` / `Select` / `Textarea` (label, `hint`, `error`, `required`
  marker built in), or `.form-label` + `.form-input` on older pages.
- Forms with more than a few fields or any validation: `react-hook-form` + `zod`.
- **API errors: always `formatApiError(err)` from `@/lib/apiError`**. Never
  `JSON.stringify(err.response.data)` (a few old pages still do; fix them when
  you touch them). Show field-level DRF errors under their field when the
  response has them.
- Confirm success with `toast.success(...)` unless the navigation already
  makes it obvious. Report failures with `toast.error(title, { description: formatApiError(e) })`
  or inline next to the form. Don't do both.
- Arabic name fields (`name_ar`) get `dir="rtl"`. Free-text user content gets `dir="auto"`.

## Modals & confirmations

- Use `Modal` (`size` sm/md/lg/xl; Escape and overlay click close it; body
  scroll is locked). Put the actions in `footer`.
- **Known gaps; fix them when you touch Modal:** there's no focus trap, and
  focus doesn't return to the trigger.
- Never hand-roll a `fixed inset-0` overlay: the BottomNav (z-50) covers it on
  phones. `Modal` sits at z-[60]. A `position: fixed` child (e.g. `BarcodeScanner`)
  must render *outside* the Modal, because the Modal panel is transformed.
- `window.confirm` is acceptable for a single low-stakes delete. Anything that
  moves stock or money (approve dispatch, post stocktake, write off waste)
  gets `ConfirmModal` (`components/shared/ConfirmModal`): a title that asks the
  question, one sentence on what happens, and `details` rows with the amounts
  (`formatKWD` / `formatQty`). Show the result with a toast, errors with
  `toast.error(title, { description: formatApiError(err) })`. Never `alert()`.

## Charts

- `recharts` only. Wrap in `ResponsiveContainer`.
- Colours come from `useChartTheme()` (`@/lib/chartTheme`): `grid`, `axis`, `tick`, `accent`,
  `tooltipStyle`, plus `CHART_STATUS` for ok/warn/bad series. recharts passes colours as SVG
  attributes, which can't read CSS variables, so this hook is the one sanctioned theme branch.
- Theme-aware grid, axes and tooltips. **No hard-coded light colours** like
  `stroke="#f0f0f0"` (e.g. `PriceHistoryModal`). Use `--t-line-1` / `--t-fg-3`
  via `var()` or branch on `useTheme().isDark`.
- Series colours are saturated fills. Legend and label text goes through `accentText`.
- Money axes and tooltips use `formatKWD`. Load the `dataviz` skill before building a new chart.

## Empty / loading / error states

Every list and detail view needs all three:
- **Loading:** a `.skeleton` shimmer shaped like the real content for lists
  and cards. Use `Spinner` only for small inline waits. Never block the whole
  screen for a partial refresh.
- **Empty:** `EmptyState` with a title saying why it's empty and an `action`
  button for the obvious next step (it isn't always "create"; it may be
  "clear filters").
- **Error:** say what failed (`formatApiError`) and give a **Retry** that calls
  the query's `refetch()`. Not a bare red sentence.

## Internationalisation & RTL

- All user-facing strings go through `t('...')` with keys in **both**
  `locales/en/common.json` and `locales/ar/common.json`. No hard-coded English
  in new UI.
- `App.jsx` flips `<html dir>`. Use logical utilities (`ms-*`, `me-*`,
  `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) instead of left/right, and
  mirror directional icons (chevrons, arrows) in RTL.
- Dates: `formatDate(d, i18n.language)`.

## Permissions

Hide or disable actions the role can't perform: `usePermissions()` (`can(module)`,
`isAdmin`, `canApprove`, …) from `@/lib/permissions`. Don't render a button that
the backend will refuse with a 403.

## Motion

- Motion only shows a change of state (a menu opening, a sheet sliding up, an
  accordion expanding), in 100–220ms with no bounce. Content does **not**
  animate in: no entrance fades or slides on page load, no staggered lists, no
  scroll reveals, no count-up numbers, no hover scaling, no pulsing dots.
- `Reveal` and `AnimatedCounter` are static now (kept for API compatibility).
  Don't add new uses. Route changes swap content instantly: no page fade (an
  opacity transition on the page wrapper made every click blink), and the
  Suspense fallback is an in-content loader hidden for its first 300ms, never
  a full-screen overlay.
- CSS animation respects `prefers-reduced-motion` globally. framer-motion
  animations don't, so keep them small and never animate essential content
  in from invisible on a slow loop.

## Accessibility

- Visible focus ring on every interactive element. `.btn`/`.input` have one.
  Custom clickable `div`s must be `<button>`s.
- Icon-only buttons need `aria-label` (translated).
- Colour is never the only signal. Status carries a word (`Badge`), and
  variance carries a sign (+/−) as well as red/green.
- Text contrast ≥ 4.5:1 in **both** themes. The `--t-fg-*` tiers already meet it.
- Run the `accessibility-scan` skill against `http://localhost:5173` for any
  substantial new screen.

## Anti-patterns: don't do these

- Hard-coded hex colours or `isDark ? … : …` ternaries where a token or `--t-*` variable exists
- Colour utilities that aren't in the dark-override list and have no `dark:` variant
- `JSON.stringify` of API errors, and money shown with anything other than `formatKWD`
- English strings outside `t()`, and `left`/`right` spacing in new code
- Bare `overflow-x-auto` for wide tables on mobile
- New UI/toast/chart/icon libraries
- Gradients, glows, stripes, watermark numbers or neon colours on cards or buttons
- `whileHover`/`whileTap` scale effects, spring bounces, entrance animations
- Icons next to every label. An icon has to replace a word or clarify an action.
- A success toast when the navigation already shows the result
