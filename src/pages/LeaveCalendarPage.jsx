import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { listHolidays } from "../services/holidays"
import { listLeaveRequests } from "../services/leaves"
import { createCalendarEvent, listCalendarEventsInRange } from "../services/calendarEvents"

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const toIsoDate = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = `${dateObj.getMonth() + 1}`.padStart(2, "0")
  const d = `${dateObj.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

const getMonthCalendarCells = (monthCursor) => {
  const firstDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
  const firstWeekday = firstDay.getDay()
  const daysInCurrentMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate()
  const daysInPrevMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 0).getDate()
  const cells = []

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i
    const dateObj = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, day)
    cells.push({ key: `p-${day}`, value: day, dateObj, inCurrentMonth: false })
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    const dateObj = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day)
    cells.push({ key: `c-${day}`, value: day, dateObj, inCurrentMonth: true })
  }

  const trailing = (7 - (cells.length % 7)) % 7
  for (let day = 1; day <= trailing; day += 1) {
    const dateObj = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, day)
    cells.push({ key: `n-${day}`, value: day, dateObj, inCurrentMonth: false })
  }

  return cells
}

function LeaveCalendarPage({ appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const navigate = useNavigate()
  const { pathname, state } = useLocation()
  const isStandaloneCalendar = pathname === "/calendar"
  const [calendarMode, setCalendarMode] = useState(() => {
    const requested = String(state?.calendarMode || "").toLowerCase()
    return ["team", "leaves", "all"].includes(requested) ? requested : "all"
  })
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [holidayRows, setHolidayRows] = useState([])
  const [leaveRows, setLeaveRows] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [loadError, setLoadError] = useState("")
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [eventDate, setEventDate] = useState("")
  const [eventTitle, setEventTitle] = useState("")
  const [eventType, setEventType] = useState("meeting")
  const [eventFormError, setEventFormError] = useState("")
  const [isSavingEvent, setIsSavingEvent] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadCalendarData() {
      try {
        setLoadError("")
        const [holidayData, leaveData] = await Promise.all([
          listHolidays(),
          listLeaveRequests(),
        ])
        if (!mounted) return
        setHolidayRows(holidayData || [])
        setLeaveRows(leaveData || [])
      } catch (error) {
        if (!mounted) return
        setHolidayRows([])
        setLeaveRows([])
        setLoadError(error?.message || "Unable to load holidays.")
      }
    }
    loadCalendarData()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const requested = String(state?.calendarMode || "").toLowerCase()
    if (["team", "leaves", "all"].includes(requested)) {
      setCalendarMode(requested)
    }
  }, [state?.calendarMode])

  useEffect(() => {
    let mounted = true
    async function loadEvents() {
      try {
        const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
        const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
        const rows = await listCalendarEventsInRange(toIsoDate(monthStart), toIsoDate(monthEnd))
        if (!mounted) return
        setCalendarEvents(rows || [])
      } catch {
        if (!mounted) return
        setCalendarEvents([])
      }
    }
    loadEvents()
    return () => {
      mounted = false
    }
  }, [calendarMonth])

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth),
    [calendarMonth],
  )
  const calendarCells = useMemo(() => getMonthCalendarCells(calendarMonth), [calendarMonth])

  const scheduleEvents = useMemo(
    () =>
      calendarEvents.map((item) => ({
        id: item.id,
        date: item.eventDate,
        title: item.eventTitle,
        type: item.eventType,
      })),
    [calendarEvents],
  )

  const holidayEvents = useMemo(
    () =>
      holidayRows.map((item) => ({
        id: `holiday-${item.id}`,
        date: item.holidayDate,
        title: item.holidayName,
        type: "holiday",
      })),
    [holidayRows],
  )
  const leaveEvents = useMemo(
    () =>
      leaveRows
        .filter((item) => String(item.status || "").toLowerCase() === "approved")
        .flatMap((item) => {
          const start = new Date(`${item.startDate}T00:00:00`)
          const end = new Date(`${item.endDate}T00:00:00`)
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return []
          const entries = []
          const cursor = new Date(start)
          while (cursor <= end) {
            entries.push({
              id: `leave-${item.id}-${toIsoDate(cursor)}`,
              leaveId: item.id,
              date: toIsoDate(cursor),
              title: `${item.employeeName || "Employee"} · ${item.leaveType || "Leave"}`,
              type: "leave",
            })
            cursor.setDate(cursor.getDate() + 1)
          }
          return entries
        }),
    [leaveRows],
  )

  const eventsByDate = useMemo(() => {
    const map = new Map()
    const sourceEvents = calendarMode === "team"
      ? [...scheduleEvents, ...holidayEvents]
      : calendarMode === "leaves"
        ? leaveEvents
        : [...scheduleEvents, ...holidayEvents, ...leaveEvents]
    sourceEvents.forEach((event) => {
      const key = String(event.date || "")
      if (!key) return
      const existing = map.get(key) || []
      map.set(key, [...existing, event])
    })
    return map
  }, [scheduleEvents, holidayEvents, leaveEvents, calendarMode])

  const todayIso = toIsoDate(new Date())
  const getEventClass = (type) => {
    if (isDark) {
      if (type === "holiday") return "bg-emerald-900/30 text-emerald-200 border border-emerald-800/60"
      if (type === "meeting") return "bg-blue-900/30 text-blue-200 border border-blue-800/60"
      if (type === "leave") return "bg-amber-900/30 text-amber-200 border border-amber-800/60"
      return "bg-violet-900/30 text-violet-200 border border-violet-800/60"
    }
    if (type === "holiday") return "bg-emerald-100 text-emerald-800 border border-emerald-200"
    if (type === "meeting") return "bg-blue-100 text-blue-800 border border-blue-200"
    if (type === "leave") return "bg-amber-100 text-amber-800 border border-amber-200"
    return "bg-violet-100 text-violet-800 border border-violet-200"
  }

  return (
    <article className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
      {loadError ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {loadError}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:items-center">
        <div>
          <h3 className={`text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Team Calendar</h3>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Meetings, tasks, and holidays in one monthly view</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const today = new Date()
              setEventDate(toIsoDate(today))
              setEventTitle("")
              setEventType("meeting")
              setEventFormError("")
              setShowAddEventModal(true)
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#53c4ae] px-3 py-1.5 text-xs font-medium text-white"
          >
            <Plus size={12} />
            Add Event
          </button>
          {!isStandaloneCalendar ? (
            <button
              type="button"
              onClick={() => navigate("/leaves")}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium ${
                isDark ? "border-slate-700 bg-[#0f1720] text-slate-200" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Back to Leaves
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-200" : "border-slate-200 bg-white text-slate-600"
            }`}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-200" : "border-slate-200 bg-white text-slate-600"
            }`}
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className={`mb-3 inline-flex w-full flex-wrap rounded-xl border p-1 text-xs font-medium sm:w-auto ${
        isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-slate-50"
      }`}>
        {[
          { key: "team", label: "Team" },
          { key: "leaves", label: "Leaves" },
          { key: "all", label: "All" },
        ].map((mode) => (
          <button
            key={mode.key}
            type="button"
            onClick={() => setCalendarMode(mode.key)}
            className={`rounded-lg px-3 py-1.5 ${
              calendarMode === mode.key
                ? isDark
                  ? "bg-[#111a24] text-slate-100 shadow-sm"
                  : "bg-white text-slate-800 shadow-sm"
                : isDark
                  ? "text-slate-400"
                  : "text-slate-500"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <p className={`mb-3 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{monthLabel}</p>

      <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <div className="min-w-[760px] md:min-w-[880px] lg:min-w-0">
          <div className={`grid grid-cols-7 border-b ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-slate-50"}`}>
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className={`px-2 py-2 text-[11px] font-semibold uppercase tracking-wide sm:px-3 sm:text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map((cell) => {
              const iso = toIsoDate(cell.dateObj)
              const events = eventsByDate.get(iso) || []
              const isToday = iso === todayIso
              return (
                <div
                  key={cell.key}
                  className={`min-h-[96px] border-b border-r p-1.5 last:border-r-0 sm:min-h-[112px] sm:p-2 lg:min-h-[130px] ${
                    isDark
                      ? `border-slate-700 ${cell.inCurrentMonth ? "bg-[#111a24]" : "bg-[#0f1720]"}`
                      : `border-slate-200 ${cell.inCurrentMonth ? "bg-white" : "bg-slate-50"}`
                  }`}
                >
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold sm:h-6 sm:min-w-[24px] sm:text-xs ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : cell.inCurrentMonth
                          ? isDark ? "text-slate-200" : "text-slate-700"
                          : isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {cell.value}
                  </span>
                  <div className="mt-2 space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          if (event.type === "leave" && event.leaveId) {
                            navigate(`/leaves/${encodeURIComponent(event.leaveId)}`)
                          }
                        }}
                        className={`block truncate rounded-md px-1.5 py-1 text-[10px] font-medium sm:px-2 sm:text-[11px] ${getEventClass(event.type)}`}
                        title={event.title}
                      >
                        {event.title}
                      </button>
                    ))}
                    {events.length > 3 ? (
                      <span className={`block px-1 text-[10px] font-medium sm:text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        +{events.length - 3} more
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Meeting
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          Task
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Holiday
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Leave
        </span>
      </div>

      {showAddEventModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className={`w-full max-w-[420px] rounded-2xl p-5 shadow-xl ${isDark ? "border border-slate-700 bg-[#0f1720]" : "bg-white"}`}>
            <h3 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Add Calendar Event</h3>
            <div className={`my-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`} />

            <div className="space-y-4">
              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Date</span>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#53c4ae] ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200"
                  }`}
                />
              </label>

              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Type</span>
                <div className="relative">
                  <select
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value)}
                    className={`w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none focus:border-[#53c4ae] ${
                      isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  />
                </div>
              </label>

              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Title</span>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  placeholder="Enter event title"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#53c4ae] ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-100 placeholder:text-slate-400" : "border-slate-200"
                  }`}
                />
              </label>
            </div>

            {eventFormError ? (
              <p className="mt-3 text-sm text-rose-500">{eventFormError}</p>
            ) : null}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                  isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingEvent}
                onClick={async () => {
                  if (!eventDate || !eventTitle.trim()) {
                    setEventFormError("Please fill date and title.")
                    return
                  }
                  try {
                    setIsSavingEvent(true)
                    const created = await createCalendarEvent(eventDate, eventTitle.trim(), eventType)
                    setCalendarEvents((prev) => [...prev, created])
                    setShowAddEventModal(false)
                  } catch (error) {
                    setEventFormError(error?.message || "Unable to create event.")
                  } finally {
                    setIsSavingEvent(false)
                  }
                }}
                className="flex-1 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingEvent ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default LeaveCalendarPage
