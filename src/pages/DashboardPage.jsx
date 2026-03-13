import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Star } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listAttendanceRecordsInRange, listAttendanceRowsByDate } from "../services/attendance"
import { getEmployeeCount, getEmploymentTypeCounts } from "../services/employees"

const topStatsTemplate = [
  { title: "Total Employees", value: "0", sub: "Employees", footer: "You're part of a growing team!" },
  { title: "Attendance", value: "92%", sub: "Present", extra: "3 Days Off, 1 Late Arrival", footer: "Your attendance this month is looking solid" },
  { title: "Leave Requests", value: "1", sub: "Approved", extra: "1 Pending Review", footer: "You've submitted 2 leave requests this month" },
]

const scheduleItems = [
  { label: "Talent Acquisition", title: "Interview - Product Designer Candidate", room: "Meeting Room C", time: "09:00 AM" },
  { label: "Employee Development", title: "Mid-Year Performance Review - Design Dept", room: "Notice Review Sheet", time: "01:00 PM" },
  { label: "Workplace Engagement", title: "Quarterly Policy Review Meeting", room: "Conference Room 1A", time: "03:00 PM" },
]

const getInitials = (value = "") => (value || "A")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || "")
  .join("")

const getStatusClasses = (status) => {
  const normalized = String(status || "").toLowerCase()
  if (normalized === "on time") return "bg-emerald-100 text-emerald-700"
  if (normalized === "late") return "bg-amber-100 text-amber-700"
  if (normalized === "on leave") return "bg-slate-100 text-slate-700"
  if (normalized === "absent") return "bg-rose-100 text-rose-700"
  return "bg-slate-100 text-slate-700"
}

const satisfactionRows = [
  { label: "Compensation & Benefits", percent: "78% Satisfaction", score: 4.5 },
  { label: "Work Culture", percent: "74% Satisfaction", score: 4.3 },
  { label: "Work-Life Balance", percent: "71% Satisfaction", score: 4.1 },
  { label: "Career Growth Opportunities", percent: "68% Satisfaction", score: 3.9 },
]

const holidayMonthDays = ["01-01", "01-26", "03-14", "08-15", "10-02", "12-25"]
const scheduledDayMap = {
  0: [4, 14, 21], // Jan
  1: [8, 19, 26], // Feb
  2: [5, 14, 25], // Mar
  3: [3, 11, 24], // Apr
  4: [7, 20, 29], // May
  5: [4, 14, 20, 25, 29], // Jun
  6: [2, 13, 22], // Jul
  7: [6, 15, 27], // Aug
  8: [5, 12, 21], // Sep
  9: [9, 16, 25], // Oct
  10: [7, 14, 28], // Nov
  11: [4, 13, 22], // Dec
}

const WEEKLY_ROW_LABELS = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "After 12"]
const WEEKLY_COLUMN_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const HEATMAP_LEVEL_CLASSES = ["bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#40c3ad]", "bg-[#35bda6]", "bg-[#0f5c4d]"]

const toIsoLocal = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = `${dateObj.getMonth() + 1}`.padStart(2, "0")
  const d = `${dateObj.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

const parseIsoDate = (isoDate) => {
  const [y, m, d] = String(isoDate || "").split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

const getMonday = (baseDate) => {
  const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

const getWeeklySlotIndex = (checkInIso) => {
  if (!checkInIso) return -1
  const date = new Date(checkInIso)
  if (Number.isNaN(date.getTime())) return -1
  const minutes = date.getHours() * 60 + date.getMinutes()
  if (minutes <= 10 * 60) return 0
  if (minutes <= 10 * 60 + 30) return 1
  if (minutes <= 11 * 60) return 2
  if (minutes <= 11 * 60 + 30) return 3
  if (minutes <= 12 * 60) return 4
  return 5
}

const getHeatmapClass = (count, maxCount) => {
  if (!count || maxCount <= 0) return HEATMAP_LEVEL_CLASSES[0]
  const ratio = count / maxCount
  if (ratio >= 0.85) return HEATMAP_LEVEL_CLASSES[4]
  if (ratio >= 0.6) return HEATMAP_LEVEL_CLASSES[3]
  if (ratio >= 0.35) return HEATMAP_LEVEL_CLASSES[2]
  return HEATMAP_LEVEL_CLASSES[1]
}

const getDarkHeatmapClass = (className) => {
  const map = {
    "bg-[#f1f3ef]": "bg-[#1b2632]",
    "bg-[#d2e1c3]": "bg-[#26453d]",
    "bg-[#40c3ad]": "bg-[#248f7f]",
    "bg-[#35bda6]": "bg-[#1d7a6c]",
    "bg-[#0f5c4d]": "bg-[#0f5c4d]",
  }
  return map[className] || className
}

const buildWeeklyAttendanceRange = (records, previousRecords = []) => {
  const matrix = Array.from({ length: WEEKLY_ROW_LABELS.length }, () => Array.from({ length: WEEKLY_COLUMN_LABELS.length }, () => 0))
  let onTimeCount = 0
  let checkInCount = 0

  records.forEach((item) => {
    const dayDate = parseIsoDate(item.attendance_date)
    const weekdayIndex = (dayDate.getDay() + 6) % 7 // Mon=0
    if (weekdayIndex < 0 || weekdayIndex > 4) return
    const slotIndex = getWeeklySlotIndex(item.check_in_at)
    if (slotIndex < 0) return
    matrix[slotIndex][weekdayIndex] += 1
    checkInCount += 1
    if (String(item.status || "").toLowerCase() === "on time") onTimeCount += 1
  })

  let previousOnTime = 0
  let previousCheckIns = 0
  previousRecords.forEach((item) => {
    if (!item.check_in_at) return
    previousCheckIns += 1
    if (String(item.status || "").toLowerCase() === "on time") previousOnTime += 1
  })

  const maxCount = Math.max(0, ...matrix.flat())
  const rows = matrix.map((row) =>
    row.map((count) => ({
      className: getHeatmapClass(count, maxCount),
      count,
    })),
  )
  const currentRate = checkInCount ? Math.round((onTimeCount / checkInCount) * 100) : 0
  const previousRate = previousCheckIns ? (previousOnTime / previousCheckIns) * 100 : 0
  const growth = currentRate - previousRate
  const growthPrefix = growth >= 0 ? "+" : "-"

  return {
    label: "This Week",
    value: `${currentRate}%`,
    growth: `${growthPrefix}${Math.abs(growth).toFixed(2)}%`,
    rowLabels: WEEKLY_ROW_LABELS,
    columnLabels: WEEKLY_COLUMN_LABELS,
    rows,
  }
}

const TEAM_PERFORMANCE_DEFAULT_MONTHS = 6
const TEAM_WORKDAY_MINUTES = 8 * 60

const getMonthStart = (dateObj) => new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
const getMonthKey = (dateObj) => `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`

const formatPercentValue = (value) => `${Number(value || 0).toFixed(2)}%`

const buildTeamPerformanceRange = (records = [], now = new Date(), monthsCount = TEAM_PERFORMANCE_DEFAULT_MONTHS) => {
  const safeMonths = Math.max(1, Number(monthsCount || TEAM_PERFORMANCE_DEFAULT_MONTHS))
  const monthStarts = Array.from({ length: safeMonths }, (_, idx) =>
    new Date(now.getFullYear(), now.getMonth() - (safeMonths - 1 - idx), 1),
  )
  const base = monthStarts.map((monthDate) => ({
    key: getMonthKey(monthDate),
    label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(monthDate),
    longLabel: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(monthDate),
    workedMinutes: 0,
    attendanceDays: 0,
  }))
  const indexByKey = new Map(base.map((item, idx) => [item.key, idx]))

  ;(records || []).forEach((item) => {
    const [year, month, day] = String(item?.attendance_date || "").split("-").map(Number)
    if (!year || !month || !day) return
    const dateObj = new Date(year, month - 1, day)
    const key = getMonthKey(dateObj)
    const index = indexByKey.get(key)
    if (index == null) return

    const workedMinutes = Number(item?.work_minutes || 0)
    const hasCheckIn = Boolean(item?.check_in_at)
    const status = String(item?.status || "").toLowerCase()
    const isPresentStatus = status === "on time" || status === "late"
    if (hasCheckIn || isPresentStatus) {
      base[index].attendanceDays += 1
      base[index].workedMinutes += Math.max(0, Number.isFinite(workedMinutes) ? workedMinutes : 0)
    }
  })

  const points = base.map((item) => {
    const expectedMinutes = item.attendanceDays * TEAM_WORKDAY_MINUTES
    const value = expectedMinutes > 0
      ? Math.min(100, (item.workedMinutes / expectedMinutes) * 100)
      : 0
    return {
      ...item,
      value: Number(value.toFixed(2)),
    }
  })

  const currentValue = points[points.length - 1]?.value || 0
  const previousValue = points[points.length - 2]?.value || 0
  const growth = Number((currentValue - previousValue).toFixed(2))
  const peakValue = Math.max(...points.map((point) => point.value), 0)
  const peakIndex = points.findIndex((point) => point.value === peakValue)
  const safePeakIndex = peakIndex >= 0 ? peakIndex : points.length - 1

  return {
    points,
    value: formatPercentValue(currentValue),
    growth,
    peakIndex: safePeakIndex,
    peakPoint: points[safePeakIndex] || {
      value: 0,
      longLabel: new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(now),
    },
  }
}

const buildTeamPerformanceChartPath = (points = []) => {
  if (!points.length) return { linePath: "", areaPath: "", coordinates: [] }
  const xStart = 34
  const xEnd = 350
  const yTop = 20
  const yBottom = 152
  const width = points.length > 1 ? (xEnd - xStart) / (points.length - 1) : 0
  const coordinates = points.map((point, idx) => {
    const x = xStart + idx * width
    const y = yBottom - ((Math.max(0, Math.min(100, point.value)) / 100) * (yBottom - yTop))
    return { x, y }
  })
  const linePath = coordinates
    .map((coord, idx) => `${idx === 0 ? "M" : "L"} ${coord.x} ${coord.y}`)
    .join(" ")
  const areaPath = `${linePath} L ${xEnd} ${yBottom} L ${xStart} ${yBottom} Z`
  return { linePath, areaPath, coordinates }
}

const buildMonthlyAttendanceRange = (records, previousRecords = [], now = new Date()) => {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const weekCount = Math.max(1, Math.ceil(daysInMonth / 7))
  const weekCounts = Array.from({ length: weekCount }, () => 0)

  let onTimeCount = 0
  let checkInCount = 0
  records.forEach((item) => {
    const dayDate = parseIsoDate(item.attendance_date)
    if (dayDate.getMonth() !== now.getMonth() || dayDate.getFullYear() !== now.getFullYear()) return
    const weekIndex = Math.min(weekCount - 1, Math.floor((dayDate.getDate() - 1) / 7))
    if (!item.check_in_at) return
    weekCounts[weekIndex] += 1
    checkInCount += 1
    if (String(item.status || "").toLowerCase() === "on time") onTimeCount += 1
  })

  let previousOnTime = 0
  let previousCheckIns = 0
  previousRecords.forEach((item) => {
    if (!item.check_in_at) return
    previousCheckIns += 1
    if (String(item.status || "").toLowerCase() === "on time") previousOnTime += 1
  })

  const maxCount = Math.max(0, ...weekCounts)
  const rows = [
    weekCounts.map((count) => ({
      className: getHeatmapClass(count, maxCount),
      count,
    })),
  ]
  const currentRate = checkInCount ? Math.round((onTimeCount / checkInCount) * 100) : 0
  const previousRate = previousCheckIns ? (previousOnTime / previousCheckIns) * 100 : 0
  const growth = currentRate - previousRate
  const growthPrefix = growth >= 0 ? "+" : "-"

  return {
    label: "This Month",
    value: `${currentRate}%`,
    growth: `${growthPrefix}${Math.abs(growth).toFixed(2)}%`,
    rowLabels: [],
    columnLabels: Array.from({ length: weekCount }, (_, idx) => `Week ${idx + 1}`),
    rows,
  }
}

const buildYearlyAttendanceRange = (records, previousRecords = [], now = new Date()) => {
  const monthCounts = Array.from({ length: 12 }, () => 0)
  let onTimeCount = 0
  let checkInCount = 0

  records.forEach((item) => {
    const dayDate = parseIsoDate(item.attendance_date)
    if (dayDate.getFullYear() !== now.getFullYear()) return
    if (!item.check_in_at) return
    monthCounts[dayDate.getMonth()] += 1
    checkInCount += 1
    if (String(item.status || "").toLowerCase() === "on time") onTimeCount += 1
  })

  let previousOnTime = 0
  let previousCheckIns = 0
  previousRecords.forEach((item) => {
    if (!item.check_in_at) return
    previousCheckIns += 1
    if (String(item.status || "").toLowerCase() === "on time") previousOnTime += 1
  })

  const maxCount = Math.max(0, ...monthCounts)
  const rows = [
    monthCounts.map((count) => ({
      className: getHeatmapClass(count, maxCount),
      count,
    })),
  ]
  const currentRate = checkInCount ? Math.round((onTimeCount / checkInCount) * 100) : 0
  const previousRate = previousCheckIns ? (previousOnTime / previousCheckIns) * 100 : 0
  const growth = currentRate - previousRate
  const growthPrefix = growth >= 0 ? "+" : "-"

  return {
    label: "This Year",
    value: `${currentRate}%`,
    growth: `${growthPrefix}${Math.abs(growth).toFixed(2)}%`,
    rowLabels: [],
    columnLabels: Array.from({ length: 12 }, (_, idx) =>
      new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(now.getFullYear(), idx, 1))),
    rows,
  }
}

function DashboardPage({ appearance = "Light" }) {
  const navigate = useNavigate()
  const isDark = appearance === "Dark"
  const [attendanceRange, setAttendanceRange] = useState("weekly")
  const [teamPerformanceMonths, setTeamPerformanceMonths] = useState(TEAM_PERFORMANCE_DEFAULT_MONTHS)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [showYearModal, setShowYearModal] = useState(false)
  const [attendanceRows, setAttendanceRows] = useState([])
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [employmentTypeCounts, setEmploymentTypeCounts] = useState({
    fullTime: 0,
    partTime: 0,
    freelance: 0,
    internship: 0,
  })
  const [weeklyAttendanceRange, setWeeklyAttendanceRange] = useState(() => buildWeeklyAttendanceRange([]))
  const [monthlyAttendanceRange, setMonthlyAttendanceRange] = useState(() => buildMonthlyAttendanceRange([]))
  const [yearlyAttendanceRange, setYearlyAttendanceRange] = useState(() => buildYearlyAttendanceRange([]))
  const [teamPerformanceRange, setTeamPerformanceRange] = useState(() => buildTeamPerformanceRange([], new Date(), TEAM_PERFORMANCE_DEFAULT_MONTHS))
  const [attendanceError, setAttendanceError] = useState("")
  const [brokenAvatarById, setBrokenAvatarById] = useState({})
  const activeAttendanceRange = attendanceRange === "weekly"
    ? weeklyAttendanceRange
    : attendanceRange === "monthly"
      ? monthlyAttendanceRange
      : yearlyAttendanceRange
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const calendarLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)
  const yearOptions = Array.from({ length: Math.max(1, currentYear - 2010 + 1) }, (_, idx) => 2010 + idx)
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const daysInPrevMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0).getDate()
  const trailingDays = (7 - ((firstWeekday + daysInMonth) % 7)) % 7
  const scheduledDays = scheduledDayMap[calendarMonth.getMonth()] || []
  const todayIso = new Date().toISOString().split("T")[0]
  const todayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(todayIso))

  useEffect(() => {
    let mounted = true
    async function loadAttendancePreview() {
      try {
        setAttendanceError("")
        const [rows, count, employment] = await Promise.all([
          listAttendanceRowsByDate(todayIso),
          getEmployeeCount().catch(() => 0),
          getEmploymentTypeCounts().catch(() => ({ total: 0, counts: { fullTime: 0, partTime: 0, freelance: 0, internship: 0 } })),
        ])
        if (!mounted) return
        setAttendanceRows(rows.slice(0, 6))
        setTotalEmployees(count)
        setEmploymentTypeCounts(employment.counts || { fullTime: 0, partTime: 0, freelance: 0, internship: 0 })
      } catch (error) {
        if (!mounted) return
        setAttendanceRows([])
        setTotalEmployees(0)
        setEmploymentTypeCounts({ fullTime: 0, partTime: 0, freelance: 0, internship: 0 })
        setAttendanceError(error?.message || "Unable to load attendance.")
      }
    }
    loadAttendancePreview()
    return () => {
      mounted = false
    }
  }, [todayIso])

  useEffect(() => {
    let mounted = true
    async function loadWeeklyReport() {
      try {
        const today = new Date()
        const currentWeekStart = getMonday(today)
        const currentWeekEnd = new Date(currentWeekStart)
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
        const previousWeekStart = new Date(currentWeekStart)
        previousWeekStart.setDate(currentWeekStart.getDate() - 7)
        const previousWeekEnd = new Date(currentWeekStart)
        previousWeekEnd.setDate(currentWeekStart.getDate() - 1)

        const allRows = await listAttendanceRecordsInRange(toIsoLocal(previousWeekStart), toIsoLocal(currentWeekEnd))
        if (!mounted) return

        const currentRows = allRows.filter((item) => item.attendance_date >= toIsoLocal(currentWeekStart))
        const previousRows = allRows.filter((item) => item.attendance_date <= toIsoLocal(previousWeekEnd))
        setWeeklyAttendanceRange(buildWeeklyAttendanceRange(currentRows, previousRows))
      } catch {
        if (!mounted) return
        setWeeklyAttendanceRange(buildWeeklyAttendanceRange([]))
      }
    }

    loadWeeklyReport()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadMonthlyReport() {
      try {
        const today = new Date()
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

        const allRows = await listAttendanceRecordsInRange(toIsoLocal(previousMonthStart), toIsoLocal(monthEnd))
        if (!mounted) return

        const currentRows = allRows.filter((item) => item.attendance_date >= toIsoLocal(monthStart))
        const previousRows = allRows.filter((item) => item.attendance_date <= toIsoLocal(previousMonthEnd))
        setMonthlyAttendanceRange(buildMonthlyAttendanceRange(currentRows, previousRows, today))
      } catch {
        if (!mounted) return
        setMonthlyAttendanceRange(buildMonthlyAttendanceRange([], [], new Date()))
      }
    }

    loadMonthlyReport()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadYearlyReport() {
      try {
        const today = new Date()
        const yearStart = new Date(today.getFullYear(), 0, 1)
        const yearEnd = new Date(today.getFullYear(), 11, 31)
        const previousYearStart = new Date(today.getFullYear() - 1, 0, 1)
        const previousYearEnd = new Date(today.getFullYear() - 1, 11, 31)

        const allRows = await listAttendanceRecordsInRange(toIsoLocal(previousYearStart), toIsoLocal(yearEnd))
        if (!mounted) return

        const currentRows = allRows.filter((item) => item.attendance_date >= toIsoLocal(yearStart))
        const previousRows = allRows.filter((item) => item.attendance_date <= toIsoLocal(previousYearEnd))
        setYearlyAttendanceRange(buildYearlyAttendanceRange(currentRows, previousRows, today))
      } catch {
        if (!mounted) return
        setYearlyAttendanceRange(buildYearlyAttendanceRange([], [], new Date()))
      }
    }

    loadYearlyReport()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadTeamPerformance() {
      try {
        const today = new Date()
        const startMonth = getMonthStart(new Date(today.getFullYear(), today.getMonth() - (teamPerformanceMonths - 1), 1))
        const allRows = await listAttendanceRecordsInRange(toIsoLocal(startMonth), toIsoLocal(today))
        if (!mounted) return
        setTeamPerformanceRange(buildTeamPerformanceRange(allRows, today, teamPerformanceMonths))
      } catch {
        if (!mounted) return
        setTeamPerformanceRange(buildTeamPerformanceRange([], new Date(), teamPerformanceMonths))
      }
    }
    loadTeamPerformance()
    return () => {
      mounted = false
    }
  }, [teamPerformanceMonths])

  const attendanceCounts = useMemo(() => {
    let onTime = 0
    let late = 0
    let onLeave = 0
    let absent = 0
    attendanceRows.forEach((row) => {
      const status = String(row[6] || "").toLowerCase()
      if (status === "on time") onTime += 1
      else if (status === "late") late += 1
      else if (status === "on leave") onLeave += 1
      else if (status === "absent") absent += 1
    })
    return { onTime, late, onLeave, absent }
  }, [attendanceRows])

  const topStats = useMemo(() => {
    const next = [...topStatsTemplate]
    next[0] = { ...next[0], value: String(totalEmployees) }
    return next
  }, [totalEmployees])

  const employmentStatusCards = useMemo(() => {
    const raw = [
      { key: "fullTime", label: "Full-Time", count: employmentTypeCounts.fullTime, color: "bg-emerald-800" },
      { key: "partTime", label: "Part-Time", count: employmentTypeCounts.partTime, color: "bg-[#39c9b3]" },
      { key: "freelance", label: "Freelance", count: employmentTypeCounts.freelance, color: "bg-emerald-300" },
      { key: "internship", label: "Internship", count: employmentTypeCounts.internship, color: "bg-slate-300" },
    ]
    const total = Math.max(1, totalEmployees)
    return raw.map((item) => ({
      ...item,
      percent: Math.round((item.count / total) * 100),
    }))
  }, [employmentTypeCounts, totalEmployees])
  const employmentCoveredPercent = employmentStatusCards.reduce((sum, item) => sum + item.percent, 0)

  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, idx) => ({
      key: `p-${idx}`,
      value: daysInPrevMonth - firstWeekday + idx + 1,
      inCurrentMonth: false,
    })),
    ...Array.from({ length: daysInMonth }, (_, idx) => ({
      key: `c-${idx + 1}`,
      value: idx + 1,
      inCurrentMonth: true,
      isToday:
        idx + 1 === currentDate.getDate() &&
        calendarMonth.getMonth() === currentDate.getMonth() &&
        calendarMonth.getFullYear() === currentDate.getFullYear(),
      isScheduled: scheduledDays.includes(idx + 1),
      isHoliday: holidayMonthDays.includes(`${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(idx + 1).padStart(2, "0")}`),
    })),
    ...Array.from({ length: trailingDays }, (_, idx) => ({
      key: `n-${idx + 1}`,
      value: idx + 1,
      inCurrentMonth: false,
    })),
  ]
  const teamPerformanceChart = useMemo(
    () => buildTeamPerformanceChartPath(teamPerformanceRange.points),
    [teamPerformanceRange.points],
  )
  const peakCoord = teamPerformanceChart.coordinates[teamPerformanceRange.peakIndex] || { x: 34, y: 152 }
  const tooltipX = Math.max(34, Math.min(298, peakCoord.x - 31))
  const growthPrefix = teamPerformanceRange.growth >= 0 ? "↗ +" : "↘ "
  const growthBadgeClass = teamPerformanceRange.growth >= 0
    ? "bg-[#dce8c8] text-emerald-700"
    : "bg-rose-100 text-rose-700"
  const growthLabel = teamPerformanceRange.growth > 0
    ? "Increased vs last month"
    : teamPerformanceRange.growth < 0
      ? "Decreased vs last month"
      : "No change vs last month"

  const renderRatingStars = (rating) => {
    const full = Math.floor(rating)
    const half = rating - full >= 0.5
    return (
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < full || (index === full && half)
          return (
            <Star
              key={`star-${rating}-${index}`}
              size={13}
              className={filled ? "fill-amber-400 text-amber-400" : "text-amber-300"}
              strokeWidth={1.8}
            />
          )
        })}
      </span>
    )
  }

  return (
    <div className={`space-y-4 ${isDark ? "text-slate-100" : ""}`}>
      <section className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Hello Davis!</p>
        <h1 className={`mt-1 text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Good Morning</h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topStats.map((card) => (
          <article key={card.title} className={`overflow-hidden rounded-2xl border ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
            <div className="p-4">
              <div className={`mb-2 flex items-center justify-between text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>{card.title}</span>
                <MoreHorizontal size={14} />
              </div>
              <p className={`text-[38px] font-semibold leading-none ${isDark ? "text-slate-100" : "text-slate-900"}`}>{card.value}</p>
              <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{card.sub}</span>
                {card.extra ? ` - ${card.extra}` : ""}
              </p>
            </div>
            <div className={`px-4 py-2 text-xs ${isDark ? "bg-[#1a2a20] text-emerald-300" : "bg-[#e8f1df] text-emerald-700"}`}>{card.footer}</div>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className={`flex h-full flex-col rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`text-[18px] font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Attendance Calendar</h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowYearModal(true)}
                      className={`inline-flex items-center gap-1 bg-transparent py-1 pl-0 pr-1 text-[20px] font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}
                      aria-label="Open year selector"
                    >
                      {calendarLabel}
                      <ChevronDown size={14} className={isDark ? "text-slate-400" : "text-slate-500"} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-[#1d2c22] text-slate-200" : "bg-[#e8f1df]"}`}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-[#1d2c22] text-slate-200" : "bg-[#e8f1df]"}`}
                    aria-label="Next month"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className={`grid flex-1 grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] gap-y-1 text-center text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
      {["S", "M", "T", "W", "T", "F", "S"].map((d) => <span key={d} className="py-1">{d}</span>)}
                {calendarCells.map((cell) => (
                  <span
                    key={cell.key}
                    className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full ${
                      cell.isToday
                        ? "bg-emerald-700 text-white"
                        : cell.isHoliday
                          ? "bg-[oklch(87.9%_0.169_91.605)] text-white"
                          : cell.isScheduled
                            ? "bg-[#39c9b3] text-white"
                        : !cell.inCurrentMonth
                        ? (isDark ? "text-slate-600" : "text-slate-300")
                          : (isDark ? "text-slate-200" : "")
                    }`}
                  >
                    {cell.value}
                  </span>
                ))}
              </div>
              <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
                  Today
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#39c9b3]" />
                  Scheduled Day
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[oklch(87.9%_0.169_91.605)]" />
                  Public Holiday
                </span>
              </div>
            </article>

            <article className={`flex h-full flex-col rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className={`text-[18px] font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Attendance Report</h3>
                <div className="relative">
                  <select
                    value={attendanceRange}
                    onChange={(event) => setAttendanceRange(event.target.value)}
                    className={`appearance-none rounded-xl py-1 pl-2.5 pr-6 text-xs font-medium outline-none ${isDark ? "bg-[#1d2c22] text-slate-200" : "bg-[#dce8c8] text-slate-700"}`}
                  >
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="yearly">This Year</option>
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
              <p className={`text-[42px] font-semibold leading-none ${isDark ? "text-slate-100" : "text-slate-800"}`}>{activeAttendanceRange.value}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isDark ? "bg-[#1d2c22] text-emerald-300" : "bg-[#dce8c8] text-emerald-700"}`}>
                  ↗ {activeAttendanceRange.growth}
                </span>
              </div>
              <p className={`mt-1 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Attendance Rate</p>

              <div className="mt-4">
                <div className={`grid items-start gap-x-2 ${activeAttendanceRange.rowLabels.length > 0 ? "grid-cols-[66px_1fr]" : "grid-cols-1"}`}>
                  {activeAttendanceRange.rowLabels.length > 0 ? (
                    <div className="space-y-1">
                      {activeAttendanceRange.rowLabels.map((label) => (
                        <p key={label} className={`h-[22px] text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    {activeAttendanceRange.rows.map((row, r) => (
                      <div
                        key={`heat-${r}`}
                        className="grid gap-1.5"
                        style={{ gridTemplateColumns: `repeat(${activeAttendanceRange.columnLabels.length}, minmax(0, 1fr))` }}
                      >
                        {row.map((cell, c) => {
                          const rawClassName = typeof cell === "string" ? cell : cell.className
                          const className = isDark ? getDarkHeatmapClass(rawClassName) : rawClassName
                          const count = typeof cell === "string" ? 0 : Number(cell.count || 0)
                          const textClass = className === "bg-[#0f5c4d]" || className === "bg-[#35bda6]"
                            ? "text-white"
                            : (isDark ? "text-slate-100" : "text-slate-600")
                          return (
                            <span
                              key={`cell-${r}-${c}`}
                              className={`inline-flex h-[22px] items-center justify-center rounded-md text-[10px] font-semibold ${className} ${count > 0 ? textClass : ""}`}
                            >
                              {count > 0 ? count : ""}
                            </span>
                          )
                        })}
                      </div>
                    ))}
                    <div
                      className={`grid gap-1.5 pt-1.5 text-center text-[12px] ${isDark ? "text-slate-300" : "text-slate-500"}`}
                      style={{ gridTemplateColumns: `repeat(${activeAttendanceRange.columnLabels.length}, minmax(0, 1fr))` }}
                    >
                      {activeAttendanceRange.columnLabels.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Team Performance</h3>
                <div className="relative">
                  <select
                    value={String(teamPerformanceMonths)}
                    onChange={(event) => setTeamPerformanceMonths(Number(event.target.value) || TEAM_PERFORMANCE_DEFAULT_MONTHS)}
                    className={`appearance-none rounded-xl py-1 pl-2.5 pr-6 text-xs font-medium outline-none ${isDark ? "bg-[#1d2c22] text-slate-200" : "bg-[#dce8c8] text-slate-700"}`}
                  >
                    <option value="3">Last 3 Months</option>
                    <option value="6">Last 6 Months</option>
                    <option value="12">Last 12 Months</option>
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
              <p className={`text-[38px] font-semibold leading-none ${isDark ? "text-slate-100" : "text-slate-800"}`}>{teamPerformanceRange.value}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${growthBadgeClass}`}>
                  {growthPrefix}{Math.abs(teamPerformanceRange.growth).toFixed(2)}%
                </span>
                <span className="text-[13px] text-slate-500">{growthLabel}</span>
              </div>

              <div className="mt-3 w-full overflow-hidden">
                <svg viewBox="0 0 360 185" className="h-[170px] w-full">
                  {[0, 25, 50, 75, 100].map((tick, idx) => {
                    const y = 20 + idx * 33
                    return (
                      <g key={tick}>
                        <text x="0" y={y + 4} fontSize="10" fill="#7f8a8f">
                          {tick}%
                        </text>
                        <line x1="34" y1={y} x2="350" y2={y} stroke="#e4e8eb" strokeWidth="1" />
                      </g>
                    )
                  })}

                  <defs>
                    <linearGradient id="teamPerfFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#35bda6" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#35bda6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  <path
                    d={teamPerformanceChart.linePath}
                    fill="none"
                    stroke="#35bda6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={teamPerformanceChart.areaPath}
                    fill="url(#teamPerfFill)"
                  />

                  <line x1={peakCoord.x} y1={peakCoord.y} x2={peakCoord.x} y2="152" stroke="#9ca4aa" strokeDasharray="4 4" />
                  <circle cx={peakCoord.x} cy={peakCoord.y} r="5.5" fill="#35bda6" />

                  <g transform={`translate(${tooltipX},8)`}>
                    <rect width="62" height="42" rx="9" fill="white" stroke="#e4e8eb" />
                    <text x="10" y="16" fontSize="10" fill="#76828a">{teamPerformanceRange.peakPoint.longLabel}</text>
                    <text x="10" y="32" fontSize="18" fontWeight="600" fill="#0f5c4d">{teamPerformanceRange.peakPoint.value.toFixed(1)}%</text>
                  </g>

                  {teamPerformanceRange.points.map((item, idx) => {
                    const coord = teamPerformanceChart.coordinates[idx]
                    return (
                      <text key={item.label} x={coord?.x ?? 66} y="178" fontSize="11" fill="#7f8a8f" textAnchor="middle">
                        {item.label}
                      </text>
                    )
                  })}
                </svg>
              </div>
            </article>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <article className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Schedules</h3>
                <button type="button" className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${isDark ? "bg-[#1d2c22] text-slate-200" : "bg-[#e8f1df] text-slate-700"}`}>21 Jun <ChevronDown size={12} /></button>
              </div>
              <div className="space-y-2.5">
                {scheduleItems.map((item) => (
                  <div key={item.title} className={`rounded-lg border p-2.5 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-100 bg-slate-50"}`}>
                    <p className={`text-[11px] ${isDark ? "text-emerald-300" : "text-emerald-500"}`}>{item.label}</p>
                    <p className={`mt-1 text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.title}</p>
                    <p className={`mt-1 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.room} - {item.time}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Employee Satisfaction</h3>
                <MoreHorizontal size={15} className={isDark ? "text-slate-500" : "text-slate-400"} />
              </div>
              <div className="grid grid-cols-[1fr_160px] items-center gap-2">
                <div>
                  <p className={`text-[36px] font-semibold leading-none ${isDark ? "text-slate-100" : "text-slate-800"}`}>73%</p>
                  <p className={`mt-1 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Employee Satisfied</p>
                  <div className="mt-3 flex items-center gap-2">
                    {renderRatingStars(4.2)}
                    <span className={`text-[21px] font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>4.2/5</span>
                  </div>
                </div>
                <svg viewBox="0 0 160 92" className="h-[92px] w-[160px]">
                  <path d="M20 74 A60 60 0 0 1 140 74" fill="none" stroke="#e9ecef" strokeWidth="12" strokeLinecap="round" />
                  <path d="M20 74 A60 60 0 0 1 118 24" fill="none" stroke="#39c9b3" strokeWidth="12" strokeLinecap="round" />
                  <path d="M118 24 A60 60 0 0 1 140 74" fill="none" stroke="#d8e6c7" strokeWidth="12" strokeLinecap="round" />
                  <line x1="80" y1="74" x2="116" y2="32" stroke="#0f5c4d" strokeWidth="3.2" strokeLinecap="round" />
                  <circle cx="80" cy="74" r="6.5" fill="#0f5c4d" />
                </svg>
              </div>

              <div className={`mt-3 rounded-xl px-3 py-2 text-[13px] ${isDark ? "bg-[#1d2c22] text-slate-300" : "bg-[#dce8c8] text-slate-600"}`}>
                That's an <span className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>increase of 6%</span> from last month
              </div>

              <div className="mt-4 space-y-3">
                {satisfactionRows.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-[14px] font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.label}</p>
                      <p className={`text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.percent}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      {renderRatingStars(item.score)}
                      <span className={`text-[17px] font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{item.score.toFixed(1)}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Employment Status</h3>
                <MoreHorizontal size={15} className={isDark ? "text-slate-500" : "text-slate-400"} />
              </div>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className={`text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{totalEmployees}</p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Employees</p>
                </div>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>100%</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="flex h-full w-full">
                  {employmentStatusCards.map((item) => (
                    <span key={`bar-${item.key}`} className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  ))}
                  {employmentCoveredPercent < 100 ? (
                    <span className="h-full bg-slate-200" style={{ width: `${100 - employmentCoveredPercent}%` }} />
                  ) : null}
                </div>
              </div>
              <div className={`mt-4 grid flex-1 grid-cols-2 gap-2.5 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                {employmentStatusCards.map((item) => (
                  <div key={item.key} className={`rounded-lg border px-2.5 py-2 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-100 bg-slate-50"}`}>
                    <p className="inline-flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      {item.label}
                    </p>
                    <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.percent}% - {item.count} Employees</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Employee Attendance</h3>
              <button
                type="button"
                onClick={() => navigate("/attendance")}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${isDark ? "bg-[#1d2c22] text-slate-200" : "bg-[#e8f1df] text-slate-700"}`}
              >
                View All
              </button>
            </div>
            {attendanceError ? (
              <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{attendanceError}</p>
            ) : null}
            <div className={`mb-3 grid grid-cols-4 gap-3 rounded-xl p-3 text-sm ${isDark ? "bg-[#0f1720] text-slate-300" : "bg-slate-50 text-slate-600"}`}>
              <p><span className={`block text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{attendanceCounts.onTime}</span>On-Time</p>
              <p><span className={`block text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{attendanceCounts.late}</span>Late</p>
              <p><span className={`block text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{attendanceCounts.onLeave}</span>On Leave</p>
              <p><span className={`block text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{attendanceCounts.absent}</span>Absent</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className={`border-b text-xs ${isDark ? "border-slate-700 text-slate-400" : "border-slate-100 text-slate-400"}`}>
                  <tr>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Job Title</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Check In</th>
                    <th className="pb-3 font-medium">Check Out</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={row[8]} className={`border-b last:border-0 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                      <td className="py-2.5">
                        <span className="flex items-center gap-2.5">
                          {row[7] && !brokenAvatarById[row[8]] ? (
                            <img
                              src={row[7]}
                              alt={row[0]}
                              className="h-8 w-8 rounded-full object-cover"
                              onError={() => setBrokenAvatarById((prev) => ({ ...prev, [row[8]]: true }))}
                            />
                          ) : (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                              {getInitials(row[0]) || "A"}
                            </span>
                          )}
                          <span className={`font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{row[0]}</span>
                        </span>
                      </td>
                      <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row[2]}</td>
                      <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{todayLabel}</td>
                      <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row[4]}</td>
                      <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row[5]}</td>
                      <td className="py-2.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${getStatusClasses(row[6])}`}>{row[6]}</span>
                      </td>
                    </tr>
                  ))}
                  {attendanceRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className={`py-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        No attendance records for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>

      </section>

      {showYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[320px] rounded-2xl bg-white p-4 shadow-xl">
            <h3 className="text-[17px] font-semibold text-slate-800">Select Year</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setCalendarMonth((prev) => new Date(year, prev.getMonth(), 1))
                    setShowYearModal(false)
                  }}
                  className={`rounded-lg border px-2 py-2 text-sm ${
                    calendarMonth.getFullYear() === year
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowYearModal(false)}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
