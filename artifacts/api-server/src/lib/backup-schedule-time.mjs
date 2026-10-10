const CAIRO_TIME_ZONE = "Africa/Cairo";
const DAILY_INTERVAL_MINUTES = 24 * 60;
const DAILY_RUN_MINUTE = 13 * 60;

function cairoTimeParts(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    dayKey: `${values.year}-${String(values.month).padStart(2, "0")}-${String(values.day).padStart(2, "0")}`,
    minuteOfDay: values.hour * 60 + values.minute,
  };
}

export function isBackupDue(intervalMinutes, lastCreatedAt, now) {
  if (intervalMinutes <= 0) return false;

  const last = lastCreatedAt ? new Date(lastCreatedAt) : null;
  if (intervalMinutes === DAILY_INTERVAL_MINUTES) {
    const currentCairoTime = cairoTimeParts(now);
    if (currentCairoTime.minuteOfDay < DAILY_RUN_MINUTE) return false;
    if (!last) return true;

    const lastCairoTime = cairoTimeParts(last);
    if (lastCairoTime.dayKey > currentCairoTime.dayKey) return false;
    if (lastCairoTime.dayKey < currentCairoTime.dayKey) return true;

    // A scheduled backup from earlier today does not satisfy the 13:00 run.
    return lastCairoTime.minuteOfDay < DAILY_RUN_MINUTE;
  }

  if (!last) return true;
  return now.getTime() - last.getTime() >= intervalMinutes * 60_000;
}
