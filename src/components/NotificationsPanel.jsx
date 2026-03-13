import { useEffect, useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  listActiveLeaveNotifications,
} from "../services/notifications"

function parseDate(value) {
  const date = new Date(value || "")
  return Number.isNaN(date.getTime()) ? null : date
}

function formatRelativeTime(value) {
  const date = parseDate(value)
  if (!date) return "Just now"
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getInitials(name) {
  return (name || "E")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

function NotificationsPanel({ appearance = "Light" }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const isDark = appearance === "Dark"

  useEffect(() => {
    let mounted = true

    async function loadNotifications() {
      setIsLoading(true)
      setLoadError("")
      try {
        const rows = await listActiveLeaveNotifications()
        if (!mounted) return
        const nextItems = rows
          .map((row) => ({
            id: row.id,
            title: "Leave Request",
            subtitle: `${row.employeeName || "Employee"} applied for ${row.leaveType || "leave"}`,
            time: formatRelativeTime(row.createdAt),
            employeeName: row.employeeName || "Employee",
            avatar: row.avatar || "",
          }))

        setItems(nextItems)
      } catch (error) {
        if (!mounted) return
        setItems([])
        setLoadError(error instanceof Error ? error.message : "Unable to load notifications.")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadNotifications()
    return () => {
      mounted = false
    }
  }, [])

  const hasItems = useMemo(() => items.length > 0, [items])

  const handleOpenNotification = (item) => {
    navigate(`/leaves/${item.id}`)
  }

  return (
    <article className={`rounded-2xl border p-3 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className={`px-2 py-3 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>Loading notifications...</div>
      ) : null}

      {!isLoading && !hasItems ? (
        <div className={`px-2 py-3 text-center text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          No new notifications.
        </div>
      ) : null}

      {!isLoading && items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleOpenNotification(item)}
          className={`flex w-full items-center justify-between gap-3 px-2 py-3 text-left ${
            isDark ? "hover:bg-[#0f1720]" : "hover:bg-slate-50"
          } ${
            index !== items.length - 1 ? (isDark ? "border-b border-slate-700" : "border-b border-slate-100") : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {item.avatar ? (
              <img src={item.avatar} alt={item.employeeName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                {getInitials(item.employeeName)}
              </span>
            )}
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{item.title}</p>
              <p className={`mt-0.5 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{item.subtitle}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>
            <CalendarDays size={13} />
            {item.time}
          </span>
        </button>
      ))}
    </article>
  )
}

export default NotificationsPanel
