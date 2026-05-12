import {
  differenceInCalendarDays,
  differenceInYears,
  format,
  isSameDay,
  parseISO,
  setYear
} from "date-fns";
import type { BirthdayMember } from "@/types";

export function getAge(dob: string, fromDate = new Date()) {
  return differenceInYears(fromDate, parseISO(dob));
}

export function getNextBirthdayDate(dob: string, fromDate = new Date()) {
  const parsed = parseISO(dob);
  const thisYearBirthday = setYear(parsed, fromDate.getFullYear());
  if (differenceInCalendarDays(thisYearBirthday, fromDate) < 0) {
    return setYear(parsed, fromDate.getFullYear() + 1);
  }

  return thisYearBirthday;
}

export function daysUntilBirthday(dob: string, fromDate = new Date()) {
  return differenceInCalendarDays(getNextBirthdayDate(dob, fromDate), fromDate);
}

export function isBirthdayToday(dob: string, fromDate = new Date()) {
  return isSameDay(getNextBirthdayDate(dob, fromDate), fromDate);
}

export function formatDob(dob: string) {
  return format(parseISO(dob), "MMM d, yyyy");
}

export function getTodayBirthdays(members: BirthdayMember[]) {
  return members.filter((member) => isBirthdayToday(member.dob));
}

export function getUpcomingBirthdays(members: BirthdayMember[], days = 30) {
  return members
    .filter((member) => {
      const distance = daysUntilBirthday(member.dob);
      return distance > 0 && distance <= days;
    })
    .sort((a, b) => daysUntilBirthday(a.dob) - daysUntilBirthday(b.dob));
}
