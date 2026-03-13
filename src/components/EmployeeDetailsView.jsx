import { Calendar, ChevronLeft, Mail, MapPin, PenLine, Phone } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { listEmployeeAttendanceRecordsInRange } from "../services/attendance"
import { listLeaveRequests } from "../services/leaves"
import { listLeaveTypes } from "../services/leaveTypes"

const getInitials = (value) => (value || "A")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0]?.toUpperCase() || "")
  .join("")

const DAY_MS = 24 * 60 * 60 * 1000
const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DEFAULT_LEAVE_LIMITS = {
  "Annual Leaves": 20,
  "Casual Leaves": 12,
  "Sick Leaves": 10,
}

const toIsoDate = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseIsoDate = (iso) => {
  const [year, month, day] = String(iso || "").split("-").map((part) => Number(part))
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const getMonday = (date) => {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = base.getDay()
  const diff = day === 0 ? -6 : 1 - day
  base.setDate(base.getDate() + diff)
  return base
}

const getMonthBounds = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return { start, end }
}

const getWorkdayCount = (start, end) => {
  if (!start || !end || start > end) return 0
  let count = 0
  for (let cursor = new Date(start); cursor <= end; cursor = new Date(cursor.getTime() + DAY_MS)) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) count += 1
  }
  return count
}

const formatClockDuration = (minutes) => {
  const value = Math.max(0, Number(minutes || 0))
  const hrs = Math.floor(value / 60)
  const mins = value % 60
  return `${hrs}:${String(mins).padStart(2, "0")}`
}

const formatTotalWorkHours = (minutes) => {
  const value = Math.max(0, Number(minutes || 0))
  const hrs = Math.floor(value / 60)
  const mins = value % 60
  return `${hrs}h ${mins}m`
}

const getMinutesFromRecord = (record) => {
  const storedMinutes = Number(record?.work_minutes)
  if (Number.isFinite(storedMinutes) && storedMinutes >= 0) return storedMinutes
  if (!record?.check_in_at || !record?.check_out_at) return 0
  const start = new Date(record.check_in_at)
  const end = new Date(record.check_out_at)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
}

const normalizeLeaveTypeLabel = (value) => {
  const text = String(value || "").trim().toLowerCase()
  if (text.includes("annual")) return "Annual Leaves"
  if (text.includes("casual")) return "Casual Leaves"
  if (text.includes("sick")) return "Sick Leaves"
  return "Other"
}

const countDaysWithinYear = (startDateText, endDateText, year) => {
  const start = parseIsoDate(startDateText)
  const end = parseIsoDate(endDateText)
  if (!start || !end) return 0
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)
  const overlapStart = start > yearStart ? start : yearStart
  const overlapEnd = end < yearEnd ? end : yearEnd
  if (overlapStart > overlapEnd) return 0
  return Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / DAY_MS) + 1
}

const getRangeBounds = (range, now) => {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (range === "This Week") {
    const start = getMonday(end)
    return { start, end }
  }
  if (range === "This Month") {
    const start = new Date(end.getFullYear(), end.getMonth(), 1)
    return { start, end }
  }
  const start = new Date(end.getFullYear(), 0, 1)
  return { start, end }
}

const buildPerformanceGraph = (range, records, now) => {
  const minutesByDate = new Map()
  ;(records || []).forEach((record) => {
    const dateKey = String(record?.attendance_date || "")
    if (!dateKey) return
    minutesByDate.set(dateKey, (minutesByDate.get(dateKey) || 0) + getMinutesFromRecord(record))
  })

  let buckets = []
  let bottomLabels = []

  if (range === "This Week") {
    const weekStart = getMonday(now)
    bottomLabels = WEEKDAY_LABELS
    buckets = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart.getTime() + (index * DAY_MS))
      return minutesByDate.get(toIsoDate(day)) || 0
    })
  } else if (range === "This Month") {
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weekCount = Math.ceil(daysInMonth / 7)
    bottomLabels = Array.from({ length: weekCount }, (_, index) => `Week ${index + 1}`)
    buckets = Array.from({ length: weekCount }, () => 0)
    for (let day = 1; day <= daysInMonth; day += 1) {
      const slot = Math.floor((day - 1) / 7)
      const dateKey = toIsoDate(new Date(year, month, day))
      buckets[slot] += minutesByDate.get(dateKey) || 0
    }
  } else {
    const year = now.getFullYear()
    bottomLabels = MONTH_LABELS
    buckets = Array.from({ length: 12 }, () => 0)
    minutesByDate.forEach((minutes, dateKey) => {
      const parsed = parseIsoDate(dateKey)
      if (!parsed || parsed.getFullYear() !== year) return
      buckets[parsed.getMonth()] += minutes
    })
  }

  const maxMinutes = Math.max(0, ...buckets)
  const heights = buckets.map((minutes) => {
    if (maxMinutes <= 0) return 8
    return Math.max(8, Math.round((minutes / maxMinutes) * 100))
  })
  const totalMinutes = buckets.reduce((sum, minutes) => sum + minutes, 0)

  return {
    topLabels: buckets.map((minutes) => formatClockDuration(minutes)),
    bottomLabels,
    heights,
    activeIndex: maxMinutes > 0 ? buckets.indexOf(maxMinutes) : -1,
    totalMinutes,
  }
}

function EmployeeDetailsView({ employee, onBack, onEditProfile, appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const [performanceRange, setPerformanceRange] = useState("This Week")
  const [performanceGraph, setPerformanceGraph] = useState(() => buildPerformanceGraph("This Week", [], new Date()))
  const [monthAttendanceMap, setMonthAttendanceMap] = useState({})
  const [monthAttendanceStats, setMonthAttendanceStats] = useState({ present: 0, late: 0, onLeave: 0, absent: 0 })
  const [employeeLeaveRequests, setEmployeeLeaveRequests] = useState([])
  const [leaveTypeLimits, setLeaveTypeLimits] = useState(DEFAULT_LEAVE_LIMITS)
  const isLegacyEmployee = Array.isArray(employee)
  const [legacyName, legacyEmployeeId, legacyDepartment, legacyDesignation, legacyType] = isLegacyEmployee ? employee : []
  const name = isLegacyEmployee ? legacyName : employee?.name
  const employeeId = isLegacyEmployee ? legacyEmployeeId : employee?.employeeId
  const department = isLegacyEmployee ? legacyDepartment : employee?.department
  const designation = isLegacyEmployee ? legacyDesignation : employee?.designation
  const employmentType = isLegacyEmployee ? legacyType : employee?.employmentType || "-"
  const joiningDate = isLegacyEmployee ? "Jan 03, 2020" : employee?.joiningDate || "-"
  const officeEmail = isLegacyEmployee ? `${name?.toLowerCase().replace(/\s+/g, ".")}@example.com` : employee?.officeEmail || employee?.email || "-"
  const mobile = isLegacyEmployee ? "-" : employee?.mobile || "-"
  const workModel = isLegacyEmployee ? "Hybrid" : employee?.type || "On-Site"
  const employmentStatus = isLegacyEmployee ? "Active" : employee?.status || "Active"
  const officeLocation = isLegacyEmployee ? "-" : employee?.officeLocation || "-"
  const username = isLegacyEmployee ? "-" : employee?.userName || "-"

  const leaveStats = useMemo(() => {
    const usageByType = {
      "Annual Leaves": 0,
      "Casual Leaves": 0,
      "Sick Leaves": 0,
    }
    const currentYear = new Date().getFullYear()
    employeeLeaveRequests.forEach((item) => {
      const status = String(item?.status || "").toLowerCase()
      if (status !== "approved") return
      const typeLabel = normalizeLeaveTypeLabel(item?.leaveType)
      if (!Object.hasOwn(usageByType, typeLabel)) return
      usageByType[typeLabel] += countDaysWithinYear(item?.startDate, item?.endDate, currentYear)
    })

    const annualTotal = Number(leaveTypeLimits["Annual Leaves"] || 0)
    const casualTotal = Number(leaveTypeLimits["Casual Leaves"] || 0)
    const sickTotal = Number(leaveTypeLimits["Sick Leaves"] || 0)
    const annualUsed = usageByType["Annual Leaves"]
    const casualUsed = usageByType["Casual Leaves"]
    const sickUsed = usageByType["Sick Leaves"]

    const allTotal = annualTotal + casualTotal + sickTotal
    const allUsed = annualUsed + casualUsed + sickUsed

    return [
      { label: "All Leaves", used: allUsed, total: allTotal, color: "#0f766e" },
      { label: "Annual Leaves", used: annualUsed, total: annualTotal, color: "#22c3aa" },
      { label: "Casual Leaves", used: casualUsed, total: casualTotal, color: "#d5e3c2" },
      { label: "Sick Leaves", used: sickUsed, total: sickTotal, color: "#1f8e7b" },
    ]
  }, [employeeLeaveRequests, leaveTypeLimits])
  const [calendarCursor, setCalendarCursor] = useState(() => new Date())
  const calendarDays = useMemo(() => {
    const year = calendarCursor.getFullYear()
    const month = calendarCursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const firstWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const cells = []
    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      cells.push({ day: daysInPrevMonth - i, inCurrentMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, inCurrentMonth: true })
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - (firstWeekday + daysInMonth) + 1, inCurrentMonth: false })
    }
    return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
  }, [calendarCursor])
  const calendarMonthLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarCursor),
    [calendarCursor],
  )
  const activeGraph = performanceGraph
  const personalInfoRows = [
    { label: "Gender", value: isLegacyEmployee ? "" : employee?.gender || "" },
    { label: "Date of Birth", value: isLegacyEmployee ? "" : employee?.dob || "" },
    { label: "Email Address", value: isLegacyEmployee ? "" : employee?.email || employee?.officeEmail || "" },
    { label: "Phone", value: isLegacyEmployee ? "" : employee?.mobile || "" },
    {
      label: "Address",
      value: isLegacyEmployee
        ? ""
        : [employee?.address, employee?.city, employee?.state].filter(Boolean).join(", "),
    },
  ]
  const visiblePersonalInfoRows = personalInfoRows.filter(
    (item) => item.label === "Gender" || (item.value && String(item.value).trim() !== ""),
  )
  const documentItems = useMemo(() => {
    const docs = employee?.documents || {}
    const labels = {
      cv: "CV & Portfolio",
      id: "ID",
      contract: "Contract Agreement",
      offerLetter: "Offer Letter",
    }
    return Object.entries(docs)
      .filter(([, value]) => typeof value === "string" && value.trim() !== "")
      .map(([key, value]) => ({ label: labels[key] || key, value }))
  }, [employee?.documents])
  const payrollDetails = [
    { label: "Salary", value: employee?.salary ? `₹${employee.salary}` : "" },
    { label: "Bank Name", value: employee?.bankName || "" },
    { label: "Bank Account Number", value: employee?.bankAccount || "" },
  ].filter((item) => item.value && String(item.value).trim() !== "")

  useEffect(() => {
    let mounted = true

    async function loadPerformanceGraph() {
      const code = String(employeeId || "").trim()
      const now = new Date()
      if (!code) {
        if (mounted) setPerformanceGraph(buildPerformanceGraph(performanceRange, [], now))
        return
      }

      const { start, end } = getRangeBounds(performanceRange, now)
      try {
        const records = await listEmployeeAttendanceRecordsInRange(code, toIsoDate(start), toIsoDate(end))
        if (!mounted) return
        setPerformanceGraph(buildPerformanceGraph(performanceRange, records, now))
      } catch {
        if (!mounted) return
        setPerformanceGraph(buildPerformanceGraph(performanceRange, [], now))
      }
    }

    loadPerformanceGraph()
    return () => {
      mounted = false
    }
  }, [employeeId, performanceRange])

  useEffect(() => {
    let mounted = true

    async function loadMonthAttendance() {
      const code = String(employeeId || "").trim()
      const { start, end } = getMonthBounds(calendarCursor)
      if (!code) {
        if (!mounted) return
        setMonthAttendanceMap({})
        setMonthAttendanceStats({ present: 0, late: 0, onLeave: 0, absent: 0 })
        return
      }

      try {
        const records = await listEmployeeAttendanceRecordsInRange(code, toIsoDate(start), toIsoDate(end))
        if (!mounted) return

        const statusByDate = {}
        let present = 0
        let late = 0
        let onLeave = 0
        const markedWorkdaySet = new Set()

        records.forEach((record) => {
          const dateKey = String(record?.attendance_date || "")
          if (!dateKey) return

          const status = String(record?.status || "").trim().toLowerCase()
          const isLeave = status.includes("leave")
          const isLate = status === "late"
          const hasCheckIn = Boolean(record?.check_in_at)
          const isPresent = hasCheckIn && !isLeave && !isLate

          if (isLeave) {
            onLeave += 1
            statusByDate[dateKey] = "onLeave"
          } else if (isLate) {
            late += 1
            statusByDate[dateKey] = "late"
            markedWorkdaySet.add(dateKey)
          } else if (isPresent) {
            present += 1
            statusByDate[dateKey] = "present"
            markedWorkdaySet.add(dateKey)
          }
        })

        const today = new Date()
        const monthEndForAbsence = end < today ? end : new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const workdaysInScope = getWorkdayCount(start, monthEndForAbsence)
        const absent = Math.max(0, workdaysInScope - markedWorkdaySet.size)

        setMonthAttendanceMap(statusByDate)
        setMonthAttendanceStats({ present, late, onLeave, absent })
      } catch {
        if (!mounted) return
        setMonthAttendanceMap({})
        setMonthAttendanceStats({ present: 0, late: 0, onLeave: 0, absent: 0 })
      }
    }

    loadMonthAttendance()
    return () => {
      mounted = false
    }
  }, [calendarCursor, employeeId])

  useEffect(() => {
    let mounted = true

    async function loadEmployeeLeaveStats() {
      const code = String(employeeId || "").trim()
      if (!code) {
        if (!mounted) return
        setEmployeeLeaveRequests([])
        setLeaveTypeLimits(DEFAULT_LEAVE_LIMITS)
        return
      }

      try {
        const [requests, leaveTypes] = await Promise.all([
          listLeaveRequests(),
          listLeaveTypes().catch(() => []),
        ])
        if (!mounted) return

        const filteredRequests = (requests || []).filter((item) => String(item.employeeId || "").trim() === code)
        const limitMap = { ...DEFAULT_LEAVE_LIMITS }
        ;(leaveTypes || []).forEach((type) => {
          if (!type?.isActive) return
          const key = normalizeLeaveTypeLabel(type.name)
          if (!Object.hasOwn(limitMap, key)) return
          limitMap[key] = Number(type.annualLimit || 0)
        })

        setEmployeeLeaveRequests(filteredRequests)
        setLeaveTypeLimits(limitMap)
      } catch {
        if (!mounted) return
        setEmployeeLeaveRequests([])
        setLeaveTypeLimits(DEFAULT_LEAVE_LIMITS)
      }
    }

    loadEmployeeLeaveStats()
    return () => {
      mounted = false
    }
  }, [employeeId])

  return (
    <div className={`rounded-2xl ${isDark ? "bg-[#111a24]" : "bg-white"}`}>
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-1 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
        >
          <ChevronLeft size={15} />
          Employee Details
        </button>
        <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>Dashboard / Employees / Employee Details</p>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[250px_1fr]">
        <aside className={`self-start rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#d8efe8,#88d3c2)]">
            {employee?.profileImage ? (
              <img src={employee.profileImage} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="inline-flex h-full w-full items-center justify-center text-3xl font-semibold text-emerald-700">
                {getInitials(name) || "A"}
              </span>
            )}
          </div>
          <div className="mt-3 text-center">
            <p className={`text-lg font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>{name}</p>
            <p className={`mt-1 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{designation} · {department}</p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${isDark ? "bg-[#111a24] text-slate-300" : "bg-slate-100 text-slate-600"}`}>{employeeId}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-600">{employmentStatus}</span>
          </div>
          <div className={`mt-4 space-y-2.5 rounded-xl p-3 text-[13px] ${isDark ? "border border-slate-700 bg-[#111a24]" : "bg-[#f8faf9]"}`}>
            <p className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-600"}`}><span>Employment Type</span><span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{employmentType}</span></p>
            <p className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-600"}`}><span>Work Model</span><span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{workModel}</span></p>
            <p className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-600"}`}><span>Status</span><span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{employmentStatus}</span></p>
            <p className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-600"}`}><span>Join Date</span><span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{joiningDate || "-"}</span></p>
            <p className={`flex items-center justify-between ${isDark ? "text-slate-300" : "text-slate-600"}`}><span>Office Location</span><span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{officeLocation}</span></p>
          </div>
          <div className={`mt-3 space-y-2 rounded-xl border p-3 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <p className={`truncate text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Office Email</p>
            <p className={`truncate text-[13px] font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{officeEmail}</p>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Username</p>
            <p className={`text-[13px] font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{username}</p>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Phone</p>
            <p className={`text-[13px] font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{mobile}</p>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#53c4ae] px-4 py-2 text-xs font-medium text-white"
          >
            <PenLine size={14} />
            Edit Profile
          </button>
        </aside>

        <section className="flex h-full flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {leaveStats.map((item) => {
              const percent = item.total > 0 ? Math.min(100, Math.round((item.used / item.total) * 100)) : 0
              return (
                <div key={item.label} className={`rounded-2xl border p-3 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
                  <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.label}</p>
                  <div className="mt-2 flex items-center justify-center">
                    <div
                      className="relative h-16 w-16 rounded-full"
                      style={{ background: `conic-gradient(${item.color} ${percent}%, #edf2ef ${percent}% 100%)` }}
                    >
                      <div className={`absolute inset-[6px] flex items-center justify-center rounded-full text-center ${isDark ? "bg-[#0f1720]" : "bg-white"}`}>
                        <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                          {item.used}
                          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>/{item.total}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`flex flex-1 flex-col rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Performance Overview</h4>
              <div className="relative">
                <select
                  value={performanceRange}
                  onChange={(event) => setPerformanceRange(event.target.value)}
                  className={`appearance-none rounded-lg px-2.5 py-1 pr-6 text-xs outline-none ${isDark ? "bg-[#111a24] text-slate-200" : "bg-[#edf4e6] text-slate-600"}`}
                >
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
                <span className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>▼</span>
              </div>
            </div>
            <p className={`text-[30px] font-semibold leading-none ${isDark ? "text-slate-100" : "text-slate-800"}`}>{formatTotalWorkHours(activeGraph.totalMinutes)}</p>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total logged hours for selected range</p>
            <div className={`mt-4 flex-1 rounded-xl p-3 ${isDark ? "bg-gradient-to-t from-[#0b1320] to-[#111a24]" : "bg-gradient-to-t from-[#e8f5ef] to-white"}`}>
              <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2">
                <div
                  className={`grid gap-2 text-center text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  style={{ gridTemplateColumns: `repeat(${Math.max(1, activeGraph.topLabels.length)}, minmax(0, 1fr))` }}
                >
                  {activeGraph.topLabels.map((slot, index) => (
                    <span key={`perf-slot-${index}`} className={index === activeGraph.activeIndex ? (isDark ? "font-semibold text-emerald-300" : "font-semibold text-[#1f6257]") : ""}>
                      {slot}
                    </span>
                  ))}
                </div>
                <div
                  className="grid h-full items-end gap-2"
                  style={{ gridTemplateColumns: `repeat(${Math.max(1, activeGraph.heights.length)}, minmax(0, 1fr))` }}
                >
                  {activeGraph.heights.map((height, index) => {
                    const isActive = index === activeGraph.activeIndex
                    const topColor = isActive ? "#1f6257" : (height > 85 ? "#d2e1c3" : "#4fc2aa")
                    const baseColor = isActive ? "#1f6257" : (height > 85 ? "#4fc2aa" : "#4fc2aa")
                    return (
                    <div key={`perf-bar-${index}`} className="relative h-full">
                      <span className="absolute bottom-0 left-0 right-0 rounded-md" style={{ height: `${height}%`, background: topColor }} />
                      <span className="absolute bottom-0 left-0 right-0 rounded-md" style={{ height: `${Math.max(8, height - 14)}%`, background: baseColor }} />
                    </div>
                    )
                  })}
                </div>
                <div
                  className={`grid gap-2 text-center text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  style={{ gridTemplateColumns: `repeat(${Math.max(1, activeGraph.bottomLabels.length)}, minmax(0, 1fr))` }}
                >
                  {activeGraph.bottomLabels.map((day, index) => (
                    <span key={`perf-day-${index}`}>{day}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="grid gap-4 xl:grid-cols-[250px_1fr_230px]">
        <div className="space-y-4">
          <aside className={`h-[352px] self-start rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Personal Info</h4>
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>...</span>
            </div>
            <div className="flex h-[calc(100%-2.25rem)] flex-col">
              {visiblePersonalInfoRows.length === 0 ? (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No personal info available.</p>
              ) : (
                <div className="flex h-full flex-col justify-between">
                  {visiblePersonalInfoRows.map((item) => {
                    const icon = item.label === "Date of Birth"
                      ? <Calendar size={14} />
                      : item.label === "Email Address"
                        ? <Mail size={14} />
                        : item.label === "Phone"
                          ? <Phone size={14} />
                          : <MapPin size={14} />
                    return (
                      <div key={item.label} className={`flex items-start gap-2 py-1 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        <span className={`mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{icon}</span>
                        <span>
                          <span className={`block text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.label}</span>
                          <span className="font-medium break-all">{item.value || "-"}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Documents</h4>
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>...</span>
            </div>
            <div className="space-y-2">
              {documentItems.length === 0 ? (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No documents uploaded.</p>
              ) : (
                documentItems.map((item) => (
                  <p key={item.label} className={`rounded-lg border px-3 py-2 text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>
                    <span className="font-medium">{item.label}:</span> {item.value}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        <section>
          <div className={`rounded-2xl border p-3 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-[#f7f8f8]"}`}>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-semibold leading-none ${isDark ? "text-slate-100 hover:bg-[#111a24]" : "text-slate-800 hover:bg-slate-100"}`}
              >
                {calendarMonthLabel}
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>▼</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium leading-none ${isDark ? "bg-[#111a24] text-slate-300" : "bg-[#dceac7] text-slate-600"}`}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium leading-none ${isDark ? "bg-[#111a24] text-slate-300" : "bg-[#dceac7] text-slate-600"}`}
                >
                  ›
                </button>
              </div>
            </div>
            <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="mt-2 grid gap-1">
              {calendarDays.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 text-center text-[12px]">
                  {week.map((cell) => (
                    <span
                      key={`${weekIndex}-${cell.day}`}
                      className={`inline-flex h-7 items-center justify-center rounded-md ${
                        cell.inCurrentMonth
                          ? (() => {
                              const dateKey = toIsoDate(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), cell.day))
                              const status = monthAttendanceMap[dateKey]
                              if (status === "late") return "bg-[#49c4af] text-white"
                              if (status === "onLeave") return "bg-[#174f48] text-white"
                              if (status === "present") return "bg-[#dceac7] text-slate-700"
                              return isDark ? "bg-[#111a24] text-slate-300" : "bg-white text-slate-700"
                            })()
                          : isDark ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {cell.day}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className={`mt-3 grid grid-cols-2 gap-1.5 border-t pt-3 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              {[
                { label: "Present", value: String(monthAttendanceStats.present), color: "#dceac7" },
                { label: "Late", value: String(monthAttendanceStats.late), color: "#49c4af" },
                { label: "On Leave", value: String(monthAttendanceStats.onLeave), color: "#174f48" },
                { label: "Absent", value: String(monthAttendanceStats.absent), color: "#e5e7eb" },
              ].map((item) => (
                <div key={item.label} className={`rounded-md px-1.5 py-1 ${isDark ? "bg-[#111a24]" : "bg-white"}`}>
                  <p className={`flex items-center gap-1 text-[10px] leading-none ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span className="inline-block h-2 w-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="whitespace-normal break-words">{item.label}</span>
                  </p>
                  <p className={`mt-1 text-sm font-semibold leading-none ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className={`h-full rounded-2xl border p-3 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <p className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Payroll Summary</p>
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>...</span>
            </div>

            <div className={`mb-2 rounded-lg px-3 py-2 ${isDark ? "bg-[#111a24]" : "bg-[#f4f5f5]"}`}>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Payroll Details</p>
            </div>

            <div className="space-y-2 text-xs">
              {payrollDetails.length === 0 ? (
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No payroll info available.</p>
              ) : (
                payrollDetails.map((item) => (
                  <p key={item.label} className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"}`}>
                    <span className="font-medium">{item.label}</span>
                    <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.value}</span>
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailsView
