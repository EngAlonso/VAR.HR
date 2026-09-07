# VAR HR Deep Teal color-system update

## Scope

Apply the uploaded brand palette to the existing VAR HR design-token/theme
architecture without changing layout, spacing, typography, components,
functionality, API behavior, database behavior, navigation, localization, or
RTL behavior.

## Changes

Updated `artifacts/var-hr/src/index.css`:

- Primary / brand: `#0F766E` Deep Teal
- Primary dark: `#115E59`
- Accent: `#14B8A6`
- Main background: `#F8FAFC`
- Cards / surfaces: `#FFFFFF`
- Main text: `#0F172A`
- Secondary text: `#64748B`
- Borders and inputs: `#E2E8F0`
- Secondary / dark dashboard surfaces: `#0F172A`
- Sidebar and active navigation tokens use the neutral navy and Deep Teal
- Focus ring uses the Deep Teal primary
- Light muted surfaces use the neutral slate family for readable contrast

Added the existing theme mappings for `primary-dark` and sidebar tokens so
components continue to consume semantic classes rather than scattered color
values.

Updated the three existing accent text usages in `artifacts/var-hr/src/App.tsx`
to use the new semantic `text-primary-dark` token. No layout or component
structure changed.

## Validation

- Workspace typecheck:
  `pnpm run typecheck` — PASS
- Frontend production build with its managed environment:
  `PORT=22077 BASE_PATH=/ pnpm --filter @workspace/var-hr run build` — PASS
- Existing managed frontend workflow restarted:
  `artifacts/var-hr: web` — RUNNING on port `22077`
- Frontend `GET /`: HTTP 200 — PASS
- API `GET /api/healthz`: HTTP 200 — PASS
- API response: `{"status":"ok"}`
- Desktop LTR Preview screenshot rendered with the Deep Teal system:
  `2026-08-16-var-hr-teal-desktop.jpg`
- Mobile LTR Preview screenshot rendered with the Deep Teal system:
  `2026-08-16-var-hr-teal-mobile.jpg`
- Arabic locale/RTL behavior remained active in the live browser path:
  the page set `document.documentElement.dir` to `rtl`, and the shell/sidebar
  continued using the existing Arabic right-side layout logic.
- Arabic API workspace response remained `locale: "ar"` and
  `direction: "rtl"`.

The browser still reports the existing Overview React hook-order warning and
nested-button markup warning. Neither was introduced by this token-only change;
both remain outside this requested visual-system scope.

## Explicitly unchanged

- No logo was added.
- No layout, spacing, typography, or navigation redesign was made.
- No API, database, authentication, or product behavior changed.
- No localization strings or RTL logic changed.
- No Part 2 work started.