import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, X } from "lucide-react"
import { listAttendanceRecordsInRange, listAttendanceRowsByDate } from "../services/attendance"
import { getEmployeeCount } from "../services/employees"

const initialAttendanceRows = []

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const toIsoDate = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = `${dateObj.getMonth() + 1}`.padStart(2, "0")
  const day = `${dateObj.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const toMinutesFromLabel = (timeText) => {
  const raw = (timeText || "").trim()
  if (!raw || raw === "--" || !raw.includes(":")) return null
  const [timePart, meridiemPart = ""] = raw.split(" ")
  const [hourText, minuteText] = timePart.split(":")
  let hour = Number(hourText)
  const minute = Number(minuteText)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  const meridiem = meridiemPart.toUpperCase()
  if (meridiem === "PM" && hour !== 12) hour += 12
  if (meridiem === "AM" && hour === 12) hour = 0
  return hour * 60 + minute
}

const formatDuration = (minutes) => {
  if (minutes == null || minutes <= 0) return "--"
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins}m`
}

const formatOvertime = (minutes) => {
  const value = Number(minutes || 0)
  if (!Number.isFinite(value) || value <= 0) return "0"
  const hrs = Math.floor(value / 60)
  const mins = value % 60
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
}

const getInitials = (name) => (name || "A")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || "")
  .join("")

const getStatusClasses = (value) => {
  const status = String(value || "").toLowerCase()
  if (status === "on time") return "bg-emerald-50 text-emerald-600"
  if (status === "late") return "bg-rose-50 text-rose-500"
  if (status === "absent") return "bg-slate-100 text-slate-600"
  if (status === "on leave") return "bg-amber-50 text-amber-600"
  return "bg-slate-100 text-slate-500"
}

const getMonday = (date) => {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = base.getDay()
  const diff = day === 0 ? -6 : 1 - day
  base.setDate(base.getDate() + diff)
  return base
}

function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const todayForInput = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(todayForInput)
  const [showDateModal, setShowDateModal] = useState(false)
  const [overviewRange, setOverviewRange] = useState("week")
  const [tempDate, setTempDate] = useState(todayForInput)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [toastMessage, setToastMessage] = useState("")
  const [loadError, setLoadError] = useState("")
  const [brokenAvatarById, setBrokenAvatarById] = useState({})
  const [attendanceRows, setAttendanceRows] = useState(() => initialAttendanceRows)
  const [overviewRecords, setOverviewRecords] = useState([])
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0)

  useEffect(() => {
    let mounted = true
    async function loadRows() {
      try {
        setLoadError("")
        const rows = await listAttendanceRowsByDate(selectedDate)
        if (!mounted) return
        setAttendanceRows(rows)
      } catch (error) {
        if (!mounted) return
        setAttendanceRows([])
        setLoadError(error?.message || "Unable to load attendance records.")
      }
    }
    loadRows()
    return () => {
      mounted = false
    }
  }, [selectedDate])

  useEffect(() => {
    let mounted = true
    const now = new Date()
    let startDate
    let endDate

    if (overviewRange === "week") {
      startDate = getMonday(now)
      endDate = new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000))
    } else if (overviewRange === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
    }

    async function loadOverview() {
      try {
        const [records, totalCount] = await Promise.all([
          listAttendanceRecordsInRange(toIsoDate(startDate), toIsoDate(endDate)),
          getEmployeeCount().catch(() => 0),
        ])
        if (!mounted) return
        setOverviewRecords(records || [])
        setTotalEmployeesCount(Number(totalCount) || 0)
      } catch {
        if (!mounted) return
        setOverviewRecords([])
        setTotalEmployeesCount(0)
      }
    }

    loadOverview()
    return () => {
      mounted = false
    }
  }, [overviewRange])

  const filteredRows = useMemo(() => {
    return attendanceRows.filter((row) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = searchQuery.trim() === "" || row.slice(0, 7).some((value) => value.toLowerCase().includes(q))
      const matchesDepartment = departmentFilter === "All Departments" || row[1] === departmentFilter
      return matchesSearch && matchesDepartment
    })
  }, [attendanceRows, searchQuery, departmentFilter])
  const departmentOptions = useMemo(
    () => Array.from(new Set(attendanceRows.map((row) => row[1]).filter(Boolean))),
    [attendanceRows],
  )
  const attendanceSummary = useMemo(() => {
    let onTime = 0
    let late = 0
    let onLeave = 0
    let absent = 0

    attendanceRows.forEach((row) => {
      const status = (row[6] || "").toLowerCase()
      if (status === "on time") onTime += 1
      else if (status === "late") late += 1
      else if (status === "on leave") onLeave += 1
      else if (status === "absent") absent += 1
    })

    const present = onTime + late
    const leaveBreakdown = {
      annual: Math.max(0, Math.ceil(onLeave * 0.5)),
      sick: Math.max(0, Math.floor(onLeave * 0.33)),
      others: Math.max(0, onLeave - Math.ceil(onLeave * 0.5) - Math.floor(onLeave * 0.33)),
    }

    return { present, onLeave, absent, onTime, late, leaveBreakdown }
  }, [attendanceRows])
  const attendanceOverviewBars = useMemo(() => {
    const now = new Date()
    const denominator = Math.max(1, Number(totalEmployeesCount) || 0)
    const presentByDate = new Map()

    ;(overviewRecords || []).forEach((row) => {
      const dateKey = String(row?.attendance_date || "")
      const status = String(row?.status || "").toLowerCase()
      if (!dateKey) return
      if (status === "on time" || status === "late") {
        presentByDate.set(dateKey, (presentByDate.get(dateKey) || 0) + 1)
      }
    })

    if (overviewRange === "week") {
      const weekStart = getMonday(now)
      return Array.from({ length: 7 }, (_, index) => {
        const dayDate = new Date(weekStart.getTime() + (index * 24 * 60 * 60 * 1000))
        const dateKey = toIsoDate(dayDate)
        const isFuture = dayDate > now
        const presentCount = presentByDate.get(dateKey) || 0
        return {
          month: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
          rate: isFuture ? null : Math.round((presentCount / denominator) * 100),
        }
      })
    }

    if (overviewRange === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const weekCount = Math.ceil(daysInMonth / 7)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      return Array.from({ length: weekCount }, (_, index) => {
        const startDay = (index * 7) + 1
        const endDay = Math.min(daysInMonth, startDay + 6)
        let dayCount = 0
        let sumRate = 0
        for (let day = startDay; day <= endDay; day += 1) {
          const dateKey = toIsoDate(new Date(monthStart.getFullYear(), monthStart.getMonth(), day))
          const current = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
          if (current > today) continue
          dayCount += 1
          sumRate += Math.round(((presentByDate.get(dateKey) || 0) / denominator) * 100)
        }
        return {
          month: `Week ${index + 1}`,
          rate: dayCount === 0 ? null : Math.round(sumRate / dayCount),
        }
      })
    }

    const currentMonth = now.getMonth()
    return Array.from({ length: 12 }, (_, index) => {
      const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(now.getFullYear(), index, 1))
      if (index > currentMonth) return { month: label, rate: null }
      const daysInMonth = new Date(now.getFullYear(), index + 1, 0).getDate()
      let dayCount = 0
      let sumRate = 0
      for (let day = 1; day <= daysInMonth; day += 1) {
        const dateKey = toIsoDate(new Date(now.getFullYear(), index, day))
        const current = new Date(now.getFullYear(), index, day)
        if (current > now) continue
        dayCount += 1
        sumRate += Math.round(((presentByDate.get(dateKey) || 0) / denominator) * 100)
      }
      return {
        month: label,
        rate: dayCount === 0 ? null : Math.round(sumRate / dayCount),
      }
    })
  }, [overviewRange, overviewRecords, totalEmployeesCount])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedRows = filteredRows.slice(startIndex, endIndex)
  const from = filteredRows.length === 0 ? 0 : startIndex + 1
  const to = Math.min(endIndex, filteredRows.length)
  const selectedDateLabel = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(selectedDate),
  )
  const selectedDateTableLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(selectedDate),
  )
  const calendarMonthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const firstWeekday = firstDay.getDay()
    const daysInCurrentMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
    const daysInPrevMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0).getDate()
    const cells = []

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const day = daysInPrevMonth - i
      const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, day)
      cells.push({ iso: toIsoDate(dateObj), day, inCurrentMonth: false })
    }

    for (let day = 1; day <= daysInCurrentMonth; day += 1) {
      const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
      cells.push({ iso: toIsoDate(dateObj), day, inCurrentMonth: true })
    }

    const trailingDays = (7 - (cells.length % 7)) % 7
    for (let day = 1; day <= trailingDays; day += 1) {
      const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, day)
      cells.push({ iso: toIsoDate(dateObj), day, inCurrentMonth: false })
    }

    return cells
  }, [calendarMonth])

  const handleExportCsv = async () => {
    const exportDate = selectedDateTableLabel
    const fileDate = selectedDate
    const rowsToExport = [
      ["Date", "Employee Name", "Department", "Designation", "Type", "Check In Time", "Check Out Time", "Status"],
      ...filteredRows.map((row) => [exportDate, ...row.slice(0, 7)]),
    ]
    const csv = `\uFEFF${rowsToExport.map((row) => row.join(",")).join("\n")}`

    try {
      if ("showSaveFilePicker" in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `attendance-${fileDate}.csv`,
          types: [
            {
              description: "CSV file",
              accept: { "text/csv": [".csv"] },
            },
          ],
        })

        const writable = await fileHandle.createWritable()
        await writable.write(csv)
        await writable.close()
        setToastMessage("Exported successfully")
        window.setTimeout(() => setToastMessage(""), 2200)
        return
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return
      }
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `attendance-${fileDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const addAttendanceRecord = () => {
    setToastMessage("Attendance is synced from employee mobile check-in/check-out.")
    window.setTimeout(() => setToastMessage(""), 2400)
  }

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-5 space-y-4">
        {loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {loadError}
          </div>
        ) : null}
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Attendance</h1>
          <p className="mt-1 text-xs text-slate-500">Dashboard / Attendance</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.55fr_1.25fr]">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-[#d8e6c7] px-4 py-3 text-[18px] font-semibold leading-none text-slate-800">Present</div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[44px] font-semibold leading-none text-[#155a4d]">{attendanceSummary.present}</p>
                    <p className="mt-1 text-xs leading-none text-slate-500">Employees</p>
                  </div>
                  <div className="pb-2 text-right">
                    <span className="inline-flex rounded-xl bg-[#d8efe2] px-2.5 py-1 text-sm font-semibold leading-none text-[#2ea875]">+4</span>
                    <p className="mt-1 text-xs text-slate-500">vs yesterday</p>
                  </div>
                </div>
                <div className="mt-auto rounded-xl bg-[#ececec] px-4 py-2 text-sm">
                  <div className="space-y-1.5">
                    <p className="flex items-center justify-between text-slate-500">
                      <span>On-Time</span>
                      <span className="font-semibold text-[#155a4d]">{attendanceSummary.onTime}</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-500">
                      <span>Late</span>
                      <span className="font-semibold text-[#155a4d]">{attendanceSummary.late}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-[#53c4ae] px-4 py-3 text-[18px] font-semibold leading-none text-white">On Leave</div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[44px] font-semibold leading-none text-[#155a4d]">{attendanceSummary.onLeave}</p>
                    <p className="mt-1 text-xs leading-none text-slate-500">Employees</p>
                  </div>
                  <div className="pb-2 text-right">
                    <span className="inline-flex rounded-xl bg-[#d8efe2] px-2.5 py-1 text-sm font-semibold leading-none text-[#2ea875]">+1</span>
                    <p className="mt-1 text-xs text-slate-500">vs yesterday</p>
                  </div>
                </div>
                <div className="mt-auto rounded-xl bg-[#ececec] px-3 py-2 text-xs">
                  <div className="space-y-1.5">
                    <p className="flex items-center justify-between text-slate-500">
                      <span>Annual Leave</span>
                      <span className="font-semibold text-[#155a4d]">{attendanceSummary.leaveBreakdown.annual}</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-500">
                      <span>Sick Leave</span>
                      <span className="font-semibold text-[#155a4d]">{attendanceSummary.leaveBreakdown.sick}</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-500">
                      <span>Others</span>
                      <span className="font-semibold text-[#155a4d]">{attendanceSummary.leaveBreakdown.others}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-[#0f5c4d] px-4 py-3 text-[18px] font-semibold leading-none text-white">Absent</div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[44px] font-semibold leading-none text-[#155a4d]">{attendanceSummary.absent}</p>
                    <p className="mt-1 text-xs leading-none text-slate-500">Employees</p>
                  </div>
                  <div className="pb-2 text-right">
                    <span className="inline-flex rounded-xl bg-[#d8efe2] px-2.5 py-1 text-sm font-semibold leading-none text-[#2ea875]">+0</span>
                    <p className="mt-1 text-xs text-slate-500">vs yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[20px] font-semibold tracking-tight text-slate-800">Attendance Overview</h3>
              <div className="relative">
                <select
                  value={overviewRange}
                  onChange={(event) => setOverviewRange(event.target.value)}
                  className="appearance-none rounded-lg bg-[#e8f1df] px-2.5 py-1 pr-6 text-xs text-slate-700 outline-none"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span>Monthly attendance rate</span>
                <span className="rounded-full bg-[#e7f4ef] px-2 py-0.5 font-medium text-[#2f6f63]">
                  Avg {Math.round(
                    attendanceOverviewBars
                      .filter((item) => item.rate != null)
                      .reduce((sum, item, _, arr) => sum + item.rate / Math.max(1, arr.length), 0),
                  )}%
                </span>
              </div>
              <div
                className="grid h-[150px] items-end gap-3"
                style={{ gridTemplateColumns: `repeat(${attendanceOverviewBars.length}, minmax(0, 1fr))` }}
              >
                {attendanceOverviewBars.map((item) => (
                  <div key={item.month} className="flex h-full flex-col items-center justify-end gap-1">
                    <span className="text-[11px] font-semibold text-slate-700">{item.rate == null ? "" : `${item.rate}%`}</span>
                    <div className="flex h-[112px] w-full items-end overflow-hidden rounded-md bg-[#dfe7db]">
                      {item.rate == null ? (
                        <span className="block h-full w-full bg-[#eef3ea]" />
                      ) : (
                        <span
                          className="block w-full rounded-md bg-[#53c4ae] transition-all duration-300"
                          style={{ height: `${item.rate}%` }}
                        />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="relative w-full sm:w-[360px]">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-14 text-sm outline-none focus:border-[#53c4ae]"
              placeholder="Search employee"
            />
          </div>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#e8f1df] px-4 py-2.5 text-sm font-medium text-slate-700 sm:w-auto"
          >
            Filter
            <SlidersHorizontal size={14} className="text-slate-400" />
          </button>
          <button
            type="button"
            onClick={addAttendanceRecord}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
          >
            <Plus size={14} />
            Add Record
          </button>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm text-slate-700 outline-none sm:w-auto"
            >
              <option>All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() => {
              setTempDate(selectedDate)
              const parsed = new Date(`${selectedDate}T00:00:00`)
              setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
              setShowDateModal(true)
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 sm:w-auto"
          >
            <CalendarDays size={14} className="text-slate-500" />
            <span>{selectedDateLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 sm:w-auto"
          >
            Export CSV
            <Download size={14} className="text-slate-500" />
          </button>
        </div>
      </div>
      </div>

      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Select Date</h3>
            <p className="mt-1 text-sm text-slate-500">Choose date for attendance view</p>

            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={14} />
                </button>
                <p className="text-sm font-medium text-slate-800">{calendarMonthLabel}</p>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                  aria-label="Next month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
                {weekdayLabels.map((day) => (
                  <span key={day} className="py-1">
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarCells.map((cell) => (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setTempDate(cell.iso)}
                    className={`h-8 rounded-md text-xs ${
                      cell.iso === tempDate
                        ? "bg-[#53c4ae] font-semibold text-white"
                        : cell.inCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {cell.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(tempDate)
                  setShowDateModal(false)
                }}
                className="flex-1 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="w-[270px] rounded-l-xl bg-slate-100 px-3 py-3 font-semibold">Name</th>
              <th className="w-[220px] bg-slate-100 px-3 py-3 font-semibold">Job Title</th>
              <th className="w-[150px] bg-slate-100 px-3 py-3 font-semibold">Date</th>
              <th className="w-[130px] bg-slate-100 px-3 py-3 font-semibold">Office</th>
              <th className="w-[190px] bg-slate-100 px-3 py-3 font-semibold">Check In - Out</th>
              <th className="w-[110px] bg-slate-100 px-3 py-3 font-semibold">Duration</th>
              <th className="w-[110px] bg-slate-100 px-3 py-3 font-semibold">Overtime</th>
              <th className="w-[120px] rounded-r-xl bg-slate-100 px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pagedRows.map((row) => (
              <tr key={row[8]} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                <td className="px-3 py-3 text-slate-800">
                  <span className="flex items-center gap-3">
                    {row[7] && !brokenAvatarById[row[8]] ? (
                      <img
                        src={row[7]}
                        alt={row[0]}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={() => {
                          setBrokenAvatarById((prev) => ({ ...prev, [row[8]]: true }))
                        }}
                      />
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                        {getInitials(row[0]) || "A"}
                      </span>
                    )}
                    <span>
                      <span className="block font-medium text-slate-800">{row[0]}</span>
                      <span className="mt-0.5 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{row[8]}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700">
                  <span className="block font-medium">{row[2]}</span>
                  <span className="block text-xs text-slate-500">{row[1]}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">{selectedDateTableLabel}</td>
                <td className="px-3 py-3 text-slate-700">{row[3]}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                  <span className="font-medium">{row[4]}</span>
                  <span className="px-1.5 text-slate-400">-</span>
                  <span className="font-medium">{row[5]}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                  {formatDuration(
                    toMinutesFromLabel(row[4]) != null && toMinutesFromLabel(row[5]) != null
                      ? toMinutesFromLabel(row[5]) - toMinutesFromLabel(row[4])
                      : null,
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                  {formatOvertime(row[9])}
                </td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(row[6])}`}>
                    {row[6]}
                  </span>
                </td>
              </tr>
            ))}

            {pagedRows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setCurrentPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        <p>
          Showing {from} to {to} out of {filteredRows.length} records
        </p>

        <div className="flex items-center gap-2 text-slate-700">
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

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[320px] rounded-2xl border border-teal-400 bg-[#effaf7] p-4 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-teal-500 text-white">
                <Check size={12} />
              </span>
              <div>
                <p className="text-[22px] font-semibold leading-tight text-slate-800 sm:text-[20px]">Success</p>
                <p className="mt-1 text-[17px] leading-snug text-slate-600 sm:text-[14px]">{toastMessage}</p>
              </div>
            </div>
            <button type="button" onClick={() => setToastMessage("")} className="text-slate-400 hover:text-slate-600" aria-label="Close toast">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export default AttendancePage
