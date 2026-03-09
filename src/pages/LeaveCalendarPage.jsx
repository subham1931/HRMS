import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { readLocalStorage } from "../utils/localStorage"

const EMPLOYEES_STORAGE_KEY = "hrms_employees"
const LEAVE_REQUESTS_STORAGE_KEY = "hrms_leave_requests"
const CHUNK_SIZE = 10

function toYMD(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function getMonthChunkStart(date) {
  const next = new Date(date.getFullYear(), date.getMonth(), 1)
  const day = date.getDate()
  const startDay = day <= 10 ? 1 : day <= 20 ? 11 : 21
  next.setDate(startDay)
  next.setHours(0, 0, 0, 0)
  return next
}

function typeColor(type) {
  const value = (type || "").toLowerCase()
  if (value.includes("annual")) return "#e3a629"
  if (value.includes("sick")) return "#4f68ea"
  if (value.includes("casual")) return "#3ea7e3"
  return "#c85cb4"
}

function makeStaticRows(rangeLength) {
  const safeLength = Math.max(1, rangeLength)
  const lastIndex = safeLength - 1
  const sample = [
    { name: "Aarav Sharma", segments: [{ start: 2, end: 5, color: "#e3a629", reason: "Family function" }] },
    { name: "Ishaan Verma", segments: [] },
    { name: "Priya Nair", segments: [{ start: 6, end: 6, color: "#3ea7e3", reason: "Medical checkup" }] },
    { name: "Rohan Mehta", segments: [{ start: 7, end: 8, color: "#4f68ea", reason: "Sick leave" }] },
    { name: "Ananya Iyer", segments: [{ start: 1, end: 4, color: "#e3a629", reason: "Vacation" }] },
    { name: "Karthik Reddy", segments: [{ start: 5, end: 6, color: "#c85cb4", reason: "Personal work" }] },
    { name: "Neha Kapoor", segments: [] },
    { name: "Vikram Singh", segments: [{ start: 4, end: 5, color: "#4f68ea", reason: "Health issue" }] },
    { name: "Sanya Gupta", segments: [{ start: 7, end: 7, color: "#ea5a77", reason: "Emergency leave" }] },
    { name: "Arjun Patel", segments: [{ start: 0, end: 0, color: "#3ea7e3", reason: "Half day leave" }] },
  ]

  return sample.map((item, index) => ({
    id: `static-${index + 1}`,
    name: item.name,
    avatar: `https://i.pravatar.cc/80?img=${(index * 9 + 17) % 70}`,
    segments: item.segments.map((segment, segIndex) => ({
      id: `static-${index + 1}-${segIndex + 1}`,
      startIndex: Math.min(lastIndex, Math.max(0, segment.start)),
      endIndex: Math.min(lastIndex, Math.max(segment.start, segment.end)),
      color: segment.color,
      reason: segment.reason || "Leave",
    })),
  }))
}

function LeaveCalendarPage() {
  const navigate = useNavigate()
  const [rangeStart, setRangeStart] = useState(() => getMonthChunkStart(new Date()))
  const employees = readLocalStorage(EMPLOYEES_STORAGE_KEY, [])
  const leaveRequests = readLocalStorage(LEAVE_REQUESTS_STORAGE_KEY, [])

  const rangeDates = useMemo(
    () => {
      const daysInMonth = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0).getDate()
      const startDay = rangeStart.getDate()
      const rangeLength = Math.min(CHUNK_SIZE, daysInMonth - startDay + 1)
      return Array.from({ length: rangeLength }, (_, index) => {
        const date = new Date(rangeStart)
        date.setDate(rangeStart.getDate() + index)
        return date
      })
    },
    [rangeStart],
  )

  const rows = useMemo(() => {
    const start = new Date(rangeStart)
    const end = new Date(rangeDates[rangeDates.length - 1])

    const employeeMap = new Map(
      (employees || []).map((item, index) => [
        String(item.employeeId || item.id || `emp-${index}`).trim().toLowerCase(),
        {
          id: item.employeeId || item.id || `EMP-${index + 1}`,
          name: item.name || "Employee",
          avatar: item.profileImage || `https://i.pravatar.cc/80?img=${(index * 7 + 13) % 70}`,
        },
      ]),
    )

    const rowsByEmployee = new Map()

    ;(leaveRequests || []).forEach((request, index) => {
      if (!request?.startDate || !request?.endDate) return
      if (String(request.status || "").toLowerCase() === "rejected") return

      const leaveStart = parseDate(request.startDate)
      const leaveEnd = parseDate(request.endDate)
      if (!leaveStart || !leaveEnd) return
      if (leaveEnd < start || leaveStart > end) return

      const key = String(request.employeeId || request.employeeName || `employee-${index}`).trim().toLowerCase()
      const profile = employeeMap.get(key) || {
        id: request.employeeId || `EMP-${1000 + index}`,
        name: request.employeeName || "Employee",
        avatar: request.avatar || `https://i.pravatar.cc/80?img=${(index * 5 + 21) % 70}`,
      }

      const startDate = leaveStart < start ? start : leaveStart
      const endDate = leaveEnd > end ? end : leaveEnd
      const startIndex = Math.max(
        0,
        Math.floor((new Date(toYMD(startDate)) - new Date(toYMD(start))) / (1000 * 60 * 60 * 24)),
      )
      const endIndex = Math.min(
        rangeDates.length - 1,
        Math.floor((new Date(toYMD(endDate)) - new Date(toYMD(start))) / (1000 * 60 * 60 * 24)),
      )

      const current = rowsByEmployee.get(key) || { ...profile, segments: [] }
      current.segments.push({
        id: request.id || `${key}-${index}`,
        startIndex,
        endIndex,
        color: typeColor(request.leaveType || request.type),
        reason: request.reason || request.leaveType || request.type || "Leave",
      })
      rowsByEmployee.set(key, current)
    })

    return Array.from(rowsByEmployee.values())
      .map((item) => ({ ...item, segments: item.segments.sort((a, b) => a.startIndex - b.startIndex) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [employees, leaveRequests, rangeStart, rangeDates])

  const displayRows = useMemo(() => (rows.length > 0 ? rows : makeStaticRows(rangeDates.length)), [rows, rangeDates.length])

  const rangeLabel = `${new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(rangeDates[0])} - ${new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(rangeDates[rangeDates.length - 1])}`

  const moveToPreviousChunk = () => {
    const startDay = rangeStart.getDate()
    if (startDay === 21) {
      setRangeStart(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 11))
      return
    }
    if (startDay === 11) {
      setRangeStart(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1))
      return
    }
    setRangeStart(new Date(rangeStart.getFullYear(), rangeStart.getMonth() - 1, 21))
  }

  const moveToNextChunk = () => {
    const startDay = rangeStart.getDate()
    if (startDay === 1) {
      setRangeStart(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 11))
      return
    }
    if (startDay === 11) {
      setRangeStart(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 21))
      return
    }
    setRangeStart(new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 1))
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/leaves")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
        >
          Back to Leaves
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={moveToPreviousChunk}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
            aria-label="Previous range"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={moveToNextChunk}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
            aria-label="Next range"
          >
            <ChevronRight size={14} />
          </button>
          <span className="text-sm text-slate-500">{rangeLabel}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div>
          <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white">
            <div className="w-[220px] border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Employees</div>
            <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${rangeDates.length}, minmax(0, 1fr))` }}>
              {rangeDates.map((date) => (
                <div key={toYMD(date)} className="border-r border-slate-100 px-1 py-2 text-center last:border-r-0">
                  <p className="text-sm font-semibold text-slate-700">{date.getDate()}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {displayRows.map((row) => (
            <div key={row.id} className="flex border-b border-slate-100 last:border-b-0">
              <div className="flex w-[220px] items-center gap-2 border-r border-slate-200 px-3 py-3">
                <img src={row.avatar} alt={row.name} className="h-7 w-7 rounded-full object-cover" />
                <p className="truncate text-sm font-medium text-slate-700">{row.name}</p>
              </div>
              <div className="relative flex-1">
                <div className="grid h-14" style={{ gridTemplateColumns: `repeat(${rangeDates.length}, minmax(0, 1fr))` }}>
                  {rangeDates.map((date) => (
                    <span key={`${row.id}-${toYMD(date)}`} className="border-r border-slate-100 last:border-r-0" />
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-0 px-0">
                  {row.segments.slice(0, 4).map((segment, index) => {
                    const left = `${(segment.startIndex / rangeDates.length) * 100}%`
                    const width = `${((segment.endIndex - segment.startIndex + 1) / rangeDates.length) * 100}%`
                    return (
                      <span
                        key={segment.id}
                        className="absolute inline-flex h-4 items-center overflow-hidden whitespace-nowrap rounded-full px-1.5 text-[9px] font-medium text-white"
                        style={{ left, width, top: `${10 + index * 11}px`, backgroundColor: segment.color }}
                        title={segment.reason}
                      >
                        {segment.reason}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

export default LeaveCalendarPage
