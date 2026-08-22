---
name: Responsive logo containment
description: Prevents tall intrinsic brand assets from expanding beyond responsive headers.
---

When a logo asset has a tall or stacked intrinsic aspect ratio, render it inside a dedicated responsive frame with explicit dimensions, `overflow-hidden`, and `object-contain`. Do not rely on an image height utility alone when a shared image class also applies `height: auto` and `max-width: 100%`.

**Why:** The shared image styling allowed the stacked mobile logo to resolve to the full containing width, so it expanded vertically and overlapped dashboard content despite an apparent height class.

**How to apply:** Keep the source asset unchanged, bound the wrapper with a mobile-appropriate `clamp()` width and fixed max height, and scope the wrapper to mobile breakpoints so tablet and desktop layouts remain unchanged.