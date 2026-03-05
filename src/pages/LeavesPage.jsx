import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Search, X } from "lucide-react"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const EMPLOYEES_STORAGE_KEY = "hrms_employees"
const LEAVE_REQUESTS_STORAGE_KEY = "hrms_leave_requests"

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
      avatar: item.profileImage || `https://i.pravatar.cc/80?img=${(index * 7 + 9) % 70}`,
    }
  })
}

function normalizeRequests(rows) {
  return (rows || []).map((item, index) => ({
    employeeId: item.employeeId || `EMP${1000 + index}`,
    employeeName: item.name || "Employee",
    department: item.department || "General",
    leaveType: normalizeLeaveType(item.leaveType || item.type || "Casual Leave"),
    startDate: item.startDate || toYMD(new Date()),
    endDate: item.endDate || item.startDate || toYMD(new Date()),
    reason: item.reason || "Requested from employee mobile app.",
    source: item.source || "mobile-app",
    status: item.status || "Pending",
    appliedAt: item.appliedAt || toYMD(new Date()),
    jobTitle: item.jobTitle || item.designation || "Team Member",
    avatar: item.avatar || item.profileImage || `https://i.pravatar.cc/80?img=${(index * 7 + 9) % 70}`,
    id: item.id || `leave-${Date.now()}-${index}`,
  }))
}

function LeavesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [employees] = useState(() => readLocalStorage(EMPLOYEES_STORAGE_KEY, []))
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = normalizeRequests(readLocalStorage(LEAVE_REQUESTS_STORAGE_KEY, []))
    if (saved.length > 0) return saved
    const employees = readLocalStorage(EMPLOYEES_STORAGE_KEY, [])
    return normalizeRequests(makeDefaultLeaveRequests(employees))
  })

  useEffect(() => {
    writeLocalStorage(LEAVE_REQUESTS_STORAGE_KEY, leaveRequests)
  }, [leaveRequests])

  const enrichedRequests = useMemo(() => {
    const byId = new Map(employees.map((item) => [String(item.employeeId || "").trim().toLowerCase(), item]))
    const byName = new Map(employees.map((item) => [String(item.name || "").trim().toLowerCase(), item]))

    return leaveRequests.map((item, index) => {
      const employeeFromId = byId.get(String(item.employeeId || "").trim().toLowerCase())
      const employeeFromName = byName.get(String(item.employeeName || "").trim().toLowerCase())
      const matchedEmployee = employeeFromId || employeeFromName

      return {
        ...item,
        employeeId: matchedEmployee?.employeeId || item.employeeId || `EMP${1000 + index}`,
        employeeName: matchedEmployee?.name || item.employeeName || "Employee",
        department: matchedEmployee?.department || item.department || "General",
        jobTitle: matchedEmployee?.designation || item.jobTitle || "Team Member",
        avatar: matchedEmployee?.profileImage || item.avatar || `https://i.pravatar.cc/80?img=${(index * 7 + 9) % 70}`,
      }
    })
  }, [employees, leaveRequests])

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

  const leaveTrend = [5.2, 4.7, 5.4, 6.1, 4.8]
  const linePoints = leaveTrend.map((v, i) => `${24 + i * 46},${128 - v * 14}`).join(" ")

  const calendarLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const firstWeekday = firstDay.getDay()
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, idx) => ({ day: `p-${idx}`, value: "", muted: true })),
    ...Array.from({ length: daysInMonth }, (_, idx) => ({ day: idx + 1, value: idx + 1, muted: false })),
  ]

  const employeeLeaves = useMemo(
    () =>
      enrichedRequests
        .filter((item) => item.status !== "Rejected")
        .slice(0, 3)
        .map((item) => ({
          id: item.id,
          name: item.employeeName,
          type: item.leaveType,
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

  const updateLeaveStatus = (id, nextStatus) => {
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "HR",
            }
          : item,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Total On Leave (Today)", value: summary.onLeaveToday, tone: "bg-[#e8f1df]", percent: `${Math.round((summary.onLeaveToday / Math.max(1, summary.total)) * 100)}%` },
              { label: "Annual Leave", value: summary.typeCount.annual, tone: "bg-slate-50", percent: `${Math.round((summary.typeCount.annual / totalType) * 100)}%` },
              { label: "Sick Leave", value: summary.typeCount.sick, tone: "bg-slate-50", percent: `${Math.round((summary.typeCount.sick / totalType) * 100)}%` },
              { label: "Other Leaves", value: summary.typeCount.other, tone: "bg-slate-50", percent: `${Math.round((summary.typeCount.other / totalType) * 100)}%` },
            ].map((card) => (
              <div key={card.label} className={`rounded-2xl p-3.5 sm:p-4 ${card.tone}`}>
                <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 sm:text-xs">
                  <CalendarDays size={13} className="text-emerald-500" />
                  {card.label}
                </div>
                <p className="mt-3 text-[34px] font-semibold leading-none text-slate-800 sm:text-[40px]">{card.value}</p>
                <p className="mt-2 text-[11px] text-slate-500 sm:text-xs">
                  <span className="rounded bg-[#d4e7c7] px-2 py-0.5 text-emerald-700">{card.percent}</span>
                  <span className="ml-2">of total leave</span>
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Leave Types</h3>
              <button type="button" className="text-slate-500">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="mx-auto my-3 grid h-44 w-44 place-items-center rounded-full" style={donutStyle}>
              <div className="grid h-30 w-30 place-items-center rounded-full bg-white text-center">
                <p className="text-[42px] font-semibold leading-none text-[#0f5b4d]">{summary.total}</p>
                <p className="text-xs text-slate-500">Employees</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
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

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">Leave Overview</h3>
              <button type="button" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
                This Week
                <ChevronDown size={14} />
              </button>
            </div>
            <svg viewBox="0 0 230 140" className="h-[170px] w-full">
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`b-${i}`} x={18 + i * 42} y={72 - (i % 2 === 0 ? 16 : 6)} width="24" height={64 + (i % 3) * 5} rx="6" fill="#d9dbda" />
              ))}
              <polyline points={linePoints} fill="none" stroke="#2eb79d" strokeWidth="2.5" />
              {linePoints.split(" ").map((point) => {
                const [x, y] = point.split(",")
                return <circle key={point} cx={x} cy={y} r="3.5" fill="#2eb79d" />
              })}
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
                <text key={d} x={30 + i * 42} y="134" fontSize="10" fill="#7a8087">
                  {d}
                </text>
              ))}
            </svg>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">Employee Leaves</h3>
              <button type="button" className="text-slate-500">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="space-y-2.5">
              {employeeLeaves.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white p-2.5">
                  <img src={item.avatar} alt={item.name} className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="truncate text-xs text-teal-500">{item.type} - {item.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-2xl font-semibold leading-none text-slate-800 sm:text-[30px]">{calendarLabel}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-500">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <span key={d} className="py-1.5">
                  {d}
                </span>
              ))}
              {calendarCells.map((cell) => (
                <span
                  key={cell.day}
                  className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] ${
                    cell.value === new Date().getDate() && !cell.muted
                      ? "bg-rose-500 text-white"
                      : cell.muted
                        ? "text-slate-300"
                        : "text-slate-700"
                  }`}
                >
                  {cell.value}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2eb79d]" /> Leave</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Public Holiday</span>
            </div>
          </div>
          <div className="hidden lg:block" />
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-xl font-semibold text-slate-800">Leave Activity</h3>
          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-300"
                placeholder="Search employee, ID, etc"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-[#e8f1df] py-2 pl-8 pr-8 text-sm text-slate-700 outline-none"
              >
                {["All", "Pending", "Approved", "Rejected"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Job Title</th>
                <th className="px-3 py-2.5 font-medium">Type</th>
                <th className="px-3 py-2.5 font-medium">Submitted Date</th>
                <th className="px-3 py-2.5 font-medium">Period</th>
                <th className="px-3 py-2.5 font-medium">Duration</th>
                <th className="px-3 py-2.5 font-medium">Reason</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredRows.map((item) => {
                const durationDays = daysBetween(item.startDate, item.endDate)
                return (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img src={item.avatar} alt={item.employeeName} className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-slate-800">{item.employeeName}</p>
                          <p className="text-xs text-slate-500">{item.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <p>{item.jobTitle}</p>
                      <p className="text-xs text-slate-500">{item.department}</p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{item.leaveType}</td>
                    <td className="px-3 py-2.5 text-slate-700">{formatDate(item.appliedAt)}</td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{durationDays} Day{durationDays > 1 ? "s" : ""}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{item.reason}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {item.status === "Pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateLeaveStatus(item.id, "Approved")}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateLeaveStatus(item.id, "Rejected")}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export default LeavesPage
