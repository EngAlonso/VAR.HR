---
name: Localized names
description: The project’s display and fallback rule for Arabic and non-Arabic locales.
---

Arabic is the source display value for the Arabic locale. English is the display value for English, French, and German locales; when an English value is empty, fall back to Arabic so older records remain readable.

**Why:** Existing data predates the English fields, and the user explicitly chose Arabic for Arabic and English for every other language.

**How to apply:** Keep Arabic fields and existing API behavior compatible. Add optional English inputs and use the locale-aware fallback helper in lists, detail pages, selectors, reports, account screens, and platform administration.

The employee self-service profile UI must localize every visible label, message, and summary value to the selected site language (English, Arabic, French, or German). Do not add hardcoded English UI text there.

**Why:** The user asked that all wording in the employee profile follow the site language.

**How to apply:** When changing the employee profile, verify every visible UI string in all four locale dictionaries; format numbers and month names with the active locale. Employee-entered field values remain data rather than interface copy.