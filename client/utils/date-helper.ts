import { format, toZonedTime } from "date-fns-tz"

/**
 * Converts a given date (or current date) to IST timezone,
 * formatted for use with <input type="datetime-local" />.
 *
 * @param date Optional Date or date string. If not provided, current time is used.
 * @returns string in "yyyy-MM-dd'T'HH:mm" format (IST)
 */
export function getISTDateTimeLocal(date?: Date | string): string {
  const timeZone = "Asia/Kolkata"
  const inputDate = date ? new Date(date) : new Date()
  const zonedDate = toZonedTime(inputDate, timeZone)

  return format(zonedDate, "yyyy-MM-dd'T'HH:mm", { timeZone })
}
