import { listLeaveRequests } from "./leaves"

export const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

function parseDate(value) {
  const date = new Date(value || "")
  return Number.isNaN(date.getTime()) ? null : date
}

export async function listActiveLeaveNotifications() {
  const rows = await listLeaveRequests()
  const cutoffMs = Date.now() - TWO_DAYS_MS

  return (rows || [])
    .filter((row) => row.status === "Pending")
    .filter((row) => {
      const created = parseDate(row.createdAt)
      return created ? created.getTime() >= cutoffMs : false
    })
}

export async function getActiveLeaveNotificationsCount() {
  const items = await listActiveLeaveNotifications()
  return items.length
}
