/**
 * Minimal date-grid helpers for the Week and Calendar views. Hand-rolled
 * rather than pulling in a date library — the logic needed here (week
 * start, month grid, day comparison) is small enough to keep visible.
 */

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

/** Monday-based week start (day 0 = Sunday in JS, so Sunday shifts back 6). */
export function startOfWeek(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  return addDays(d, diff);
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Returns a 6x7 grid of Dates covering the full weeks touching this month. */
export function getMonthGrid(anchorDate) {
  const gridStart = startOfWeek(startOfMonth(anchorDate));
  const weeks = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function formatMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatWeekRangeLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const start = weekStart.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const end = weekEnd.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${start} – ${end}`;
}

/** Returns a new Date with the same day as `date` but the given hour/minute. */
export function atHour(date, hour, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Formats a Date as the value a <input type="datetime-local"> expects. */
export function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/** Formats a datetime-local string ("2026-07-28T09:00") for display, e.g. "Tue, Jul 28 · 9:00 AM". */
export function formatDeadlineDisplay(datetimeLocalValue) {
  if (!datetimeLocalValue) return "";
  const d = new Date(datetimeLocalValue);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
