import { useEffect, useMemo, useState } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { listLeaveRequests } from "../services/leaves"

function formatDate(dateText) {
  if (!dateText) return "-"
  const date = new Date(`${dateText}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date)
}

function toYMD(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

function normalizeLeaveType(type) {
  const value = (type || "").toLowerCase()
  if (value.includes("annual") || value.includes("paid")) return "Annual Leave"
  if (value.includes("sick")) return "Sick Leave"
  if (value.includes("casual")) return "Casual Leave"
  return "Other Leave"
}

function makeDefaultLeaveRequests(employees) {
  const source = (employees || []).slice(0, 10)
  const fallback = [
    { employeeId: "EMP-0234", name: "Lina Armand", department: "R&D", type: "Sick Leave", jobTitle: "Lab Analyst" },
    { employeeId: "EMP-0115", name: "Jacob Yuen", department: "Operations", type: "Annual Leave", jobTitle: "Site Supervisor" },
    { employeeId: "EMP-0275", name: "Anya Rodriguez", department: "Marketing", type: "Other Leave", jobTitle: "Graphic Designer" },
    { employeeId: "EMP-0234", name: "Olivia Mason", department: "Marketing", type: "Annual Leave", jobTitle: "Marketing Executive" },
    { employeeId: "EMP-0356", name: "Sara Kim", department: "Customer Service", type: "Sick Leave", jobTitle: "Customer Support" },
    { employeeId: "EMP-0291", name: "Daniel Cheung", department: "Operations", type: "Annual Leave", jobTitle: "Compliance Specialist" },
    { employeeId: "EMP-0289", name: "Mia Torres", department: "Human Resources", type: "Annual Leave", jobTitle: "HR Officer" },
    { employeeId: "EMP-0178", name: "Ethan Ray", department: "Product Design", type: "Casual Leave", jobTitle: "UI Designer" },
  ]
  const list = source.length ? source : fallback

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - 12)

  return list.map((item, index) => {
    const submitDate = new Date(baseDate)
    submitDate.setDate(baseDate.getDate() + index)
    const startDate = new Date(submitDate)
    startDate.setDate(submitDate.getDate() + 2)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + (index % 3 === 0 ? 2 : index % 2 === 0 ? 0 : 1))

    const status = index % 5 === 0 ? "Pending" : index % 6 === 0 ? "Rejected" : "Approved"

    return {
      id: `leave-${Date.now()}-${index}`,
      employeeId: item.employeeId || `EMP${1000 + index}`,
      employeeName: item.name || "Employee",
      department: item.department || "General",
      leaveType: normalizeLeaveType(item.type || "Casual Leave"),
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      reason: index % 4 === 0 ? "Personal matter" : index % 3 === 0 ? "Family trip" : "Mobile app leave request",
      source: "mobile-app",
      status,
      appliedAt: toYMD(submitDate),
      jobTitle: item.designation || item.jobTitle || "Team Member",
      avatar: item.profileImage || "",
    }
  })
}

function normalizeRequests(rows) {
  return (rows || []).map((item, index) => ({
    employeeId: item.employeeId || `EMP${1000 + index}`,
    employeeName: item.employeeName || item.name || "Employee",
    department: item.department || "General",
    leaveType: normalizeLeaveType(item.leaveType || item.type || "Casual Leave"),
    startDate: item.startDate || toYMD(new Date()),
    endDate: item.endDate || item.startDate || toYMD(new Date()),
    reason: item.reason || "Requested from employee mobile app.",
    source: item.source || "mobile-app",
    status: item.status || "Pending",
    appliedAt: item.appliedAt || toYMD(new Date()),
    jobTitle: item.jobTitle || item.designation || "Team Member",
    avatar: item.avatar || item.profileImage || "",
    id: item.id || `leave-${Date.now()}-${index}`,
  }))
}

const getInitials = (value) => (value || "E")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || "")
  .join("")

function LeavesPage({ appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [overviewRange, setOverviewRange] = useState("week")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadError, setLoadError] = useState("")
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [leaveRequests, setLeaveRequests] = useState([])
  const [brokenAvatarById, setBrokenAvatarById] = useState({})

  useEffect(() => {
    let mounted = true
    async function loadRequests() {
      try {
        setLoadError("")
        const rows = await listLeaveRequests()
        if (!mounted) return
        setLeaveRequests(normalizeRequests(rows))
      } catch (error) {
        if (!mounted) return
        setLeaveRequests(normalizeRequests(makeDefaultLeaveRequests([])))
        setLoadError(error?.message || "Unable to load leave requests.")
      }
    }
    loadRequests()
    return () => {
      mounted = false
    }
  }, [])

  const enrichedRequests = useMemo(() => {
    return leaveRequests.map((item, index) => {
      return {
        ...item,
        employeeId: item.employeeId || `EMP${1000 + index}`,
        employeeName: item.employeeName || "Employee",
        department: item.department || "General",
        jobTitle: item.jobTitle || "Team Member",
        avatar: item.avatar || "",
      }
    })
  }, [leaveRequests])

  const filteredRows = useMemo(() => {
    return enrichedRequests.filter((item) => {
      const matchesStatus = statusFilter === "All" || item.status === statusFilter
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query === "" ||
        [item.employeeName, item.employeeId, item.department, item.leaveType, item.reason, item.jobTitle].some((value) =>
          (value || "").toLowerCase().includes(query),
        )
      return matchesStatus && matchesSearch
    })
  }, [enrichedRequests, searchQuery, statusFilter])
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedRows = filteredRows.slice(startIndex, endIndex)
  const from = filteredRows.length === 0 ? 0 : startIndex + 1
  const to = Math.min(endIndex, filteredRows.length)

  const summary = useMemo(() => {
    const pending = enrichedRequests.filter((item) => item.status === "Pending").length
    const approved = enrichedRequests.filter((item) => item.status === "Approved").length
    const rejected = enrichedRequests.filter((item) => item.status === "Rejected").length
    const onLeaveToday = enrichedRequests.filter((item) => {
      const today = toYMD(new Date())
      return item.status === "Approved" && item.startDate <= today && item.endDate >= today
    }).length
    const typeCount = {
      annual: enrichedRequests.filter((item) => item.leaveType === "Annual Leave").length,
      sick: enrichedRequests.filter((item) => item.leaveType === "Sick Leave").length,
      other: enrichedRequests.filter((item) => item.leaveType === "Other Leave").length,
      casual: enrichedRequests.filter((item) => item.leaveType === "Casual Leave").length,
    }
    return { pending, approved, rejected, total: enrichedRequests.length, onLeaveToday, typeCount }
  }, [enrichedRequests])

  const leaveOverview = useMemo(() => {
    const now = new Date()
    const addCountForOverlap = (item, matchesBucket) => {
      const start = new Date(`${item.startDate}T00:00:00`)
      const end = new Date(`${item.endDate}T00:00:00`)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
      const cursor = new Date(start)
      let count = 0
      while (cursor <= end) {
        if (matchesBucket(cursor)) count += 1
        cursor.setDate(cursor.getDate() + 1)
      }
      return count
    }

    const approved = enrichedRequests.filter((item) => item.status === "Approved")

    if (overviewRange === "month") {
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const rows = Array.from({ length: 4 }, (_, index) => ({
        label: `Week ${index + 1}`,
        count: 0,
      }))

      approved.forEach((item) => {
        rows.forEach((row, rowIndex) => {
          const minDay = rowIndex * 7 + 1
          const maxDay = rowIndex === 3 ? 31 : (rowIndex + 1) * 7
          row.count += addCountForOverlap(
            item,
            (dateObj) =>
              dateObj.getFullYear() === currentYear
              && dateObj.getMonth() === currentMonth
              && dateObj.getDate() >= minDay
              && dateObj.getDate() <= maxDay,
          )
        })
      })

      const max = Math.max(1, ...rows.map((item) => item.count))
      const total = rows.reduce((sum, item) => sum + item.count, 0)
      return { title: "Approved leaves by week", max, total, days: rows }
    }

    if (overviewRange === "year") {
      const currentYear = now.getFullYear()
      const rows = Array.from({ length: 12 }, (_, index) => ({
        label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(currentYear, index, 1)),
        count: 0,
      }))

      approved.forEach((item) => {
        rows.forEach((row, rowIndex) => {
          row.count += addCountForOverlap(
            item,
            (dateObj) => dateObj.getFullYear() === currentYear && dateObj.getMonth() === rowIndex,
          )
        })
      })

      const max = Math.max(1, ...rows.map((item) => item.count))
      const total = rows.reduce((sum, item) => sum + item.count, 0)
      return { title: "Approved leaves by month", max, total, days: rows }
    }

    const monday = new Date(now)
    const weekdayIndex = (now.getDay() + 6) % 7
    monday.setDate(now.getDate() - weekdayIndex)
    monday.setHours(0, 0, 0, 0)

    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return {
        label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
        key: toYMD(date),
        count: 0,
      }
    })

    approved.forEach((item) => {
      weekDays.forEach((day) => {
        day.count += addCountForOverlap(item, (dateObj) => toYMD(dateObj) === day.key)
      })
    })

    const max = Math.max(1, ...weekDays.map((item) => item.count))
    const total = weekDays.reduce((sum, item) => sum + item.count, 0)
    return { title: "Approved leaves by day", max, total, days: weekDays }
  }, [enrichedRequests, overviewRange])

  const calendarLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, idx) => ({ day: `p-${idx}`, value: "", muted: true })),
    ...Array.from({ length: daysInMonth }, (_, idx) => ({ day: idx + 1, value: idx + 1, muted: false })),
  ]
  const leaveStatusByDayInCalendarMonth = useMemo(() => {
    const dayStatusMap = new Map()
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)

    enrichedRequests
      .filter((item) => item.status === "Approved" || item.status === "Pending")
      .forEach((item) => {
        const status = item.status === "Approved" ? "approved" : "pending"
        const start = new Date(`${item.startDate}T00:00:00`)
        const end = new Date(`${item.endDate}T00:00:00`)
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
        const overlapStart = start > monthStart ? start : monthStart
        const overlapEnd = end < monthEnd ? end : monthEnd
        if (overlapStart > overlapEnd) return
        const cursor = new Date(overlapStart)
        while (cursor <= overlapEnd) {
          const day = cursor.getDate()
          const existing = dayStatusMap.get(day)
          // Approved should take visual priority over pending.
          if (existing !== "approved") {
            dayStatusMap.set(day, status)
          }
          cursor.setDate(cursor.getDate() + 1)
        }
      })

    return dayStatusMap
  }, [calendarMonth, enrichedRequests])

  const employeeLeaves = useMemo(
    () =>
      enrichedRequests
        .filter((item) => item.status === "Pending")
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          employeeId: item.employeeId,
          name: item.employeeName,
          department: item.department,
          jobTitle: item.jobTitle,
          type: item.leaveType,
          status: item.status,
          reason: item.reason,
          startDate: item.startDate,
          endDate: item.endDate,
          appliedAt: item.appliedAt,
          period: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
          avatar: item.avatar,
        })),
    [enrichedRequests],
  )

  const totalType = Math.max(
    1,
    summary.typeCount.annual + summary.typeCount.sick + summary.typeCount.other + summary.typeCount.casual,
  )

  const donutStyle = {
    background: `conic-gradient(
      #0f5b4d 0 ${(summary.typeCount.annual / totalType) * 100}%,
      #2eb79d ${(summary.typeCount.annual / totalType) * 100}% ${((summary.typeCount.annual + summary.typeCount.sick) / totalType) * 100}%,
      #d8e8d3 ${((summary.typeCount.annual + summary.typeCount.sick) / totalType) * 100}% ${((summary.typeCount.annual + summary.typeCount.sick + summary.typeCount.other) / totalType) * 100}%,
      #edf2ea ${((summary.typeCount.annual + summary.typeCount.sick + summary.typeCount.other) / totalType) * 100}% 100%
    )`,
  }

  return (
    <div className="space-y-4">
      <article className={`rounded-2xl border p-3 sm:p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
        {loadError ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {loadError}
          </div>
        ) : null}
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Total On Leave (Today)", value: summary.onLeaveToday, tone: "bg-[#e8f1df]", percent: `${Math.round((summary.onLeaveToday / Math.max(1, summary.total)) * 100)}%` },
              { label: "Annual Leave", value: summary.typeCount.annual, tone: "bg-slate-50", percent: `${Math.round((summary.typeCount.annual / totalType) * 100)}%` },
              { label: "Sick Leave", value: summary.typeCount.sick, tone: "bg-slate-50", percent: `${Math.round((summary.typeCount.sick / totalType) * 100)}%` },
              { label: "Other Leaves", value: summary.typeCount.other, tone: "bg-slate-50", percent: `${Math.round((summary.typeCount.other / totalType) * 100)}%` },
            ].map((card) => (
              <div key={card.label} className={`rounded-2xl p-3.5 sm:p-4 ${isDark ? "border border-slate-700 bg-[#0f1720]" : card.tone}`}>
                <div className={`inline-flex items-center gap-2 text-[11px] sm:text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <CalendarDays size={13} className="text-emerald-500" />
                  {card.label}
                </div>
                <p className={`mt-3 text-[34px] font-semibold leading-none sm:text-[40px] ${isDark ? "text-slate-100" : "text-slate-800"}`}>{card.value}</p>
                <p className={`mt-2 text-[11px] sm:text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span className={`rounded px-2 py-0.5 ${isDark ? "bg-emerald-900/35 text-emerald-300" : "bg-[#d4e7c7] text-emerald-700"}`}>{card.percent}</span>
                  <span className="ml-2">of total leave</span>
                </p>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-100 bg-slate-50"}`}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Leave Types</h3>
              <button type="button" className={isDark ? "text-slate-300" : "text-slate-500"}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="mx-auto my-3 grid h-44 w-44 place-items-center rounded-full" style={donutStyle}>
              <div className={`grid h-30 w-30 place-items-center rounded-full text-center ${isDark ? "bg-[#111a24]" : "bg-white"}`}>
                <p className="text-[42px] font-semibold leading-none text-[#0f5b4d]">{summary.total}</p>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Employees</p>
              </div>
            </div>
            <div className={`space-y-2 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {[
                ["#0f5b4d", "Annual Leave", summary.typeCount.annual],
                ["#2eb79d", "Sick Leave", summary.typeCount.sick],
                ["#d8e8d3", "Other Leaves", summary.typeCount.other],
                ["#edf2ea", "Casual Leave", summary.typeCount.casual],
              ].map(([color, label, count]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-slate-50"}`}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Leave Overview</h3>
              <div className="relative">
                <select
                  value={overviewRange}
                  onChange={(event) => setOverviewRange(event.target.value)}
                  className={`appearance-none rounded-xl border px-3 py-1 pr-7 text-sm outline-none ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-200" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <ChevronDown size={14} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              </div>
            </div>
            <div className={`mt-3 rounded-xl border p-3 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className={`mb-3 flex items-center justify-between text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>{leaveOverview.title}</span>
                <span className={`rounded-full px-2 py-0.5 font-medium ${isDark ? "bg-emerald-900/35 text-emerald-300" : "bg-[#e7f4ef] text-[#2f6f63]"}`}>
                  {leaveOverview.total} total
                </span>
              </div>
              <div
                className="grid h-[148px] items-end gap-2"
                style={{ gridTemplateColumns: `repeat(${leaveOverview.days.length}, minmax(0, 1fr))` }}
              >
                {leaveOverview.days.map((day) => {
                  const height = `${Math.max(10, Math.round((day.count / leaveOverview.max) * 100))}%`
                  return (
                    <div key={day.key || day.label} className="flex h-full flex-col items-center justify-end gap-1">
                      <span className={`text-[11px] font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{day.count}</span>
                      <div className={`flex h-[100px] w-full items-end justify-center rounded-md px-1 ${isDark ? "bg-slate-800/70" : "bg-slate-100/70"}`}>
                        <span className="block w-full rounded-md bg-[#53c4ae] transition-all duration-300" style={{ height }} />
                      </div>
                      <span className={`text-center text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{day.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-slate-50"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-2xl font-semibold leading-none sm:text-[30px] ${isDark ? "text-slate-100" : "text-slate-800"}`}>{calendarLabel}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/calendar", { state: { calendarMode: "leaves" } })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-200 hover:bg-[#0b1320]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  View All
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-200" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-200" : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className={`grid grid-cols-7 gap-y-1 text-center text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <span key={d} className="py-1.5">
                  {d}
                </span>
              ))}
              {calendarCells.map((cell) => (
                <span
                  key={cell.day}
                  className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] ${
                    cell.muted
                        ? isDark ? "text-slate-600" : "text-slate-300"
                        : leaveStatusByDayInCalendarMonth.get(Number(cell.value)) === "approved"
                          ? "bg-[#2eb79d] text-white"
                          : leaveStatusByDayInCalendarMonth.get(Number(cell.value)) === "pending"
                            ? "bg-[#d4eee7] text-[#1f6f61]"
                            : isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  {cell.value}
                </span>
              ))}
            </div>
            <div className={`mt-3 flex items-center gap-4 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2eb79d]" /> Approved Leave</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#d4eee7]" /> Pending Leave</span>
            </div>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-slate-50"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Leave Request</h3>
              <button type="button" className={isDark ? "text-slate-300" : "text-slate-500"}>
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="space-y-2.5">
              {employeeLeaves.length > 0 ? (
                employeeLeaves.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/leaves/${encodeURIComponent(item.id)}`)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                      isDark ? "bg-[#111a24] hover:bg-[#0b1320]" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {item.avatar && !brokenAvatarById[item.id] ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-9 w-9 rounded-full object-cover"
                        onError={() => setBrokenAvatarById((prev) => ({ ...prev, [item.id]: true }))}
                      />
                    ) : (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {getInitials(item.name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.name}</p>
                      <p className="truncate text-xs text-teal-500">{item.type} - {item.period}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className={`rounded-xl px-3 py-6 text-center text-sm ${isDark ? "bg-[#111a24] text-slate-400" : "bg-white text-slate-500"}`}>
                  No pending leave requests.
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      <article className={`rounded-2xl border p-3 sm:p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Leave Activity</h3>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-300 ${
                  isDark ? "border-slate-700 bg-[#0f1720] text-slate-100" : "border-slate-200 bg-white"
                }`}
                placeholder="Search employee, ID, etc"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setCurrentPage(1)
                }}
                className={`appearance-none rounded-xl border py-2 pl-8 pr-8 text-sm outline-none ${
                  isDark ? "border-slate-700 bg-[#111a24] text-slate-200" : "border-slate-200 bg-[#e8f1df] text-slate-700"
                }`}
              >
                {["All", "Pending", "Approved", "Rejected"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <ChevronDown size={13} className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-left">
            <thead className={`text-xs ${isDark ? "bg-[#0f1720] text-slate-300" : "bg-slate-50 text-slate-500"}`}>
              <tr>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Period</th>
                <th className="px-3 py-2.5 font-medium">Duration</th>
                <th className="px-3 py-2.5 font-medium">Reason</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pagedRows.map((item) => {
                const durationDays = daysBetween(item.startDate, item.endDate)
                return (
                  <tr key={item.id} className={`border-b last:border-0 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {item.avatar && !brokenAvatarById[item.id] ? (
                          <img
                            src={item.avatar}
                            alt={item.employeeName}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={() => setBrokenAvatarById((prev) => ({ ...prev, [item.id]: true }))}
                          />
                        ) : (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                            {getInitials(item.employeeName)}
                          </span>
                        )}
                        <div>
                          <p className={`font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.employeeName}</p>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.employeeId} · {item.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{item.leaveType}</td>
                    <td className={`px-3 py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </td>
                    <td className={`px-3 py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{durationDays} Day{durationDays > 1 ? "s" : ""}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block max-w-[220px] truncate rounded px-2 py-1 text-xs ${
                        isDark ? "bg-[#0f1720] text-slate-300" : "bg-slate-100 text-slate-600"
                      }`}>{item.reason}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "Rejected"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={6} className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setCurrentPage(1)
              }}
              className={`rounded-lg border px-3 py-1.5 outline-none ${
                isDark ? "border-slate-700 bg-[#0f1720] text-slate-200" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>

          <p>
            Showing {from} to {to} out of {filteredRows.length} records
          </p>

          <div className={`flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 4) }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
                  safeCurrentPage === page ? "border border-[#53c4ae] text-[#2f6f63]" : ""
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

export default LeavesPage
