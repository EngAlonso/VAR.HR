const localTimestampPattern =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/;

function timeZoneOffsetMs(value: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
    value.getUTCMilliseconds(),
  );
  return asUtc - value.getTime();
}

/**
 * Device protocols commonly send a wall-clock timestamp without an offset.
 * Interpret that timestamp in the company's configured timezone instead of
 * letting Node treat it as UTC.
 */
export function parseDeviceTimestamp(value: string, timeZone: string): Date {
  const trimmed = value.trim();
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const parsed = new Date(trimmed.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid device timestamp.");
    }
    return parsed;
  }

  const match = trimmed.match(localTimestampPattern);
  if (!match) {
    throw new Error("Invalid device timestamp.");
  }

  const [, year, month, day, hour, minute, second = "0", fraction = ""] =
    match;
  const milliseconds = Number(`0.${fraction}`) * 1000;
  const wallClockAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    milliseconds,
  );

  const firstCandidate = new Date(
    wallClockAsUtc -
      timeZoneOffsetMs(new Date(wallClockAsUtc), timeZone),
  );
  const corrected = new Date(
    wallClockAsUtc - timeZoneOffsetMs(firstCandidate, timeZone),
  );
  if (Number.isNaN(corrected.getTime())) {
    throw new Error("Invalid device timestamp.");
  }
  return corrected;
}