# Task

Fix the Arabic desktop sidebar direction and the mobile navigation open/close behavior.

# Starting State

The existing VAR HR frontend already had Arabic RTL support and a responsive sidebar in `artifacts/var-hr/src/App.tsx`, but the sidebar layout depended on direction-prefixed utility classes while the `dir` attribute was applied only to the sidebar element. On mobile, the navigation relied on the same direction-prefixed transforms and had only an overlay-based close path.

# Investigation

- Read `/hand-off/MASTER-HANDOFF.md` and the latest relevant preview work log before changing code.
- Inspected the `Shell` component in `artifacts/var-hr/src/App.tsx`.
- Confirmed the sidebar used `start-0`, `rtl:end-0`, and `ltr`/`rtl` transform variants rather than explicit locale-driven placement.
- Confirmed the main content offset also relied on `rtl:lg` utility variants.
- Confirmed the mobile trigger set open state, but the sidebar’s closed transform could fail when the direction variant was not applied consistently.
- Confirmed the existing Vite preview and API were running before validation.

# Changes Made

- Updated `artifacts/var-hr/src/App.tsx` to derive an explicit `isArabic` layout state from the active locale.
- Anchored the desktop sidebar to `right: 0` for Arabic and `left: 0` for English/French/German.
- Applied matching right/left desktop content padding.
- Added an unconditional desktop-visible transform and explicit mobile closed/open transforms.
- Added a mobile close button inside the navigation panel.
- Added a polished dismissible mobile overlay with opacity transition.
- Closed the mobile menu on route changes and Escape.
- Added the RTL/mobile verification state to `MASTER-HANDOFF.md`.

# Bugs Fixed

- Arabic desktop sidebar now moves to the right instead of remaining on the left.
- English, French, and German desktop layouts remain left-to-right with the sidebar on the left.
- Mobile navigation now starts closed, opens from the hamburger trigger, and has reliable close paths through the close button, overlay, route changes, and Escape.

# Validation

- Handoff and latest relevant work log read before changes: PASS
- `pnpm run typecheck:libs`: PASS
- `pnpm --filter @workspace/var-hr run typecheck`: PASS
- `PORT=22077 BASE_PATH=/ pnpm --filter @workspace/var-hr run build`: PASS
- `git diff --check`: PASS
- Live frontend response: HTTP 200, PASS
- Live API health response: HTTP 200 with `{"status":"ok"}`, PASS
- Desktop LTR preview screenshot rendered with sidebar on the left: PASS
- Mobile preview screenshot rendered with the sidebar closed and hamburger trigger visible: PASS
- Locale-specific Arabic right-side placement and mobile transforms verified in source and generated responsive CSS: PASS
- Interactive Arabic menu screenshot: NOT RUN; the available preview screenshot tool does not provide interaction or locale switching.
- Unrelated existing `Overview` React hook-order warning remains visible in browser logs and was not changed.

# Remaining Work

- Perform an interactive Arabic visual review when an interactive browser tool is available.
- Separately investigate the existing `Overview` hook-order warning if requested.

# Known Limitations

- The current preview screenshot tool is static and cannot click the language selector or mobile menu controls.
- Production authentication remains intentionally unfinalized per the master handoff.

# Next Recommended Step

Continue the documented manual product review, including an interactive Arabic desktop check and mobile open/close check.