import { addDays, differenceInCalendarDays, isSameDay, setYear } from "date-fns";

export function parseDateOnly(value: string | Date) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid date");
    }
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }

  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function nowInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return parseDateOnly(`${values.year}-${values.month}-${values.day}`);
}

export function currentTimeInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.hour}:${values.minute}`;
}

export function nextBirthday(dateOfBirth: Date, fromDate: Date) {
  const candidate = setYear(dateOfBirth, fromDate.getUTCFullYear());
  const normalizedCandidate = parseDateOnly(candidate);
  if (differenceInCalendarDays(normalizedCandidate, fromDate) < 0) {
    return parseDateOnly(setYear(dateOfBirth, fromDate.getUTCFullYear() + 1));
  }

  return normalizedCandidate;
}

export function daysUntilBirthday(dateOfBirth: Date, fromDate: Date) {
  return differenceInCalendarDays(nextBirthday(dateOfBirth, fromDate), fromDate);
}

export function hasBirthdayToday(dateOfBirth: Date, fromDate: Date) {
  return isSameDay(nextBirthday(dateOfBirth, fromDate), fromDate);
}

export function endDateFromDays(fromDate: Date, days: number) {
  return parseDateOnly(addDays(fromDate, days));
}
