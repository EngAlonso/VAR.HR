---
name: Localized names
description: The project’s display and fallback rule for Arabic and non-Arabic locales.
---

Arabic is the source display value for the Arabic locale. English is the display value for English, French, and German locales; when an English value is empty, fall back to Arabic so older records remain readable.

**Why:** Existing data predates the English fields, and the user explicitly chose Arabic for Arabic and English for every other language.

**How to apply:** Keep Arabic fields and existing API behavior compatible. Add optional English inputs and use the locale-aware fallback helper in lists, detail pages, selectors, reports, account screens, and platform administration.