---
name: Mobile drawer gesture input
description: Horizontal mobile drawer gestures need pointer capture and an explicit touch-action policy to survive scrolling and overlay interaction.
---

Use touch pointer events with pointer capture for horizontal drawer gestures, and set touch-action to pan-y so vertical scrolling remains native while horizontal intent reaches the app.

**Why:** Bubbling touchstart/touchend handlers on an outer shell can lose the matching end event when the browser scrolls or an overlay becomes the active target.

**How to apply:** Scope the handlers to the intended locale and mobile breakpoint, track the pointer id, and clear gesture state on pointerup or pointercancel.