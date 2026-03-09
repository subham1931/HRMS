import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, ChevronDown, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const EMPLOYEES_STORAGE_KEY = "hrms_employees"
const LEAVE_REQUESTS_STORAGE_KEY = "hrms_leave_requests"
const YEARLY_LEAVE_QUOTA = {
  "Annual Leave": 20,
  "Sick Leave": 10,
  "Casual Leave": 12,
  "Other Leave": 6,
}

function toYMD(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDate(dateText) {
  if (!dateText) return "-"
  const date = new Date(`${dateText}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(date)
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

function normalizeRequests(rows) {
  return (rows || []).map((item, index) => ({
    employeeId: item.employeeId || `EMP${1000 + index}`,
    employeeName: item.name || item.employeeName || "Employee",
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

function LeaveRequestDetailsPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const leaveId = decodeURIComponent(pathname.split("/").pop() || "")
  const [balanceRange, setBalanceRange] = useState("month")

  const [employees] = useState(() => readLocalStorage(EMPLOYEES_STORAGE_KEY, []))
  const [leaveRequests, setLeaveRequests] = useState(() => normalizeRequests(readLocalStorage(LEAVE_REQUESTS_STORAGE_KEY, [])))

  useEffect(() => {
    writeLocalStorage(LEAVE_REQUESTS_STORAGE_KEY, leaveRequests)
  }, [leaveRequests])

  const leaveRequest = useMemo(() => {
    const base = leaveRequests.find((item) => item.id === leaveId)
    if (!base) {
      return {
        id: leaveId || "leave-static",
        employeeId: "EMP-7307",
        employeeName: "Rohit Rana",
        department: "Sales",
        leaveType: "Other Leave",
        startDate: "2026-02-27",
        endDate: "2026-03-01",
        reason: "Personal family work",
        source: "mobile-app",
        status: "Pending",
        appliedAt: "2026-02-25",
        jobTitle: "Field Officer",
        avatar: "https://i.pravatar.cc/80?img=44",
      }
    }
    const byId = new Map(employees.map((item) => [String(item.employeeId || "").trim().toLowerCase(), item]))
    const byName = new Map(employees.map((item) => [String(item.name || "").trim().toLowerCase(), item]))
    const employeeFromId = byId.get(String(base.employeeId || "").trim().toLowerCase())
    const employeeFromName = byName.get(String(base.employeeName || "").trim().toLowerCase())
    const matchedEmployee = employeeFromId || employeeFromName
    return {
      ...base,
      employeeId: matchedEmployee?.employeeId || base.employeeId,
      employeeName: matchedEmployee?.name || base.employeeName,
      department: matchedEmployee?.department || base.department,
      jobTitle: matchedEmployee?.designation || base.jobTitle,
      avatar: matchedEmployee?.profileImage || base.avatar,
    }
  }, [employees, leaveId, leaveRequests])

  const updateLeaveStatus = (nextStatus) => {
    if (!leaveRequest) return
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === leaveRequest.id
          ? {
              ...item,
              status: nextStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "HR",
            }
          : item,
      ),
    )
    navigate("/leaves")
  }
  const leaveBalance = useMemo(() => {
    if (!leaveRequest) return []
    const now = new Date()
    const periodStart = balanceRange === "year"
      ? new Date(now.getFullYear(), 0, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = balanceRange === "year"
      ? new Date(now.getFullYear(), 11, 31)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const countOverlapDays = (startDateText, endDateText) => {
      const start = new Date(`${startDateText}T00:00:00`)
      const end = new Date(`${endDateText}T00:00:00`)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
      const overlapStart = start > periodStart ? start : periodStart
      const overlapEnd = end < periodEnd ? end : periodEnd
      if (overlapStart > overlapEnd) return 0
      return Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
    }

    const usedDaysByType = {
      "Annual Leave": 0,
      "Sick Leave": 0,
      "Casual Leave": 0,
      "Other Leave": 0,
    }
    leaveRequests
      .filter((item) => item.employeeId === leaveRequest.employeeId && item.status === "Approved")
      .forEach((item) => {
        const type = normalizeLeaveType(item.leaveType)
        usedDaysByType[type] += countOverlapDays(item.startDate, item.endDate)
      })

    return Object.entries(YEARLY_LEAVE_QUOTA).map(([type, yearQuota]) => {
      const periodQuota = balanceRange === "year" ? yearQuota : Math.max(1, Math.round(yearQuota / 12))
      const used = usedDaysByType[type]
      const available = Math.max(0, periodQuota - used)
      return { type, used, available, quota: periodQuota }
    })
  }, [balanceRange, leaveRequest, leaveRequests])

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <button
        type="button"
        onClick={() => navigate("/leaves")}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600"
      >
        <ArrowLeft size={14} />
        Back to Leaves
      </button>

      <div className="mt-4">
        <h3 className="text-2xl font-semibold text-slate-800">Leave Request Details</h3>
        <p className="mt-1 text-sm text-slate-500">Review and take action on this request.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[90px_1fr]">
        <img src={leaveRequest.avatar} alt={leaveRequest.employeeName} className="h-20 w-20 rounded-xl object-cover" />
        <div>
          <p className="text-lg font-semibold text-slate-800">{leaveRequest.employeeName}</p>
          <p className="text-sm text-slate-500">{leaveRequest.employeeId} · {leaveRequest.jobTitle}</p>
          <p className="text-sm text-slate-500">{leaveRequest.department}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <p className="text-slate-600"><span className="font-medium text-slate-700">Leave Type:</span> {leaveRequest.leaveType}</p>
        <p className="text-slate-600"><span className="font-medium text-slate-700">Status:</span> {leaveRequest.status}</p>
        <p className="text-slate-600"><span className="font-medium text-slate-700">Applied On:</span> {formatDate(leaveRequest.appliedAt)}</p>
        <p className="text-slate-600"><span className="font-medium text-slate-700">Duration:</span> {daysBetween(leaveRequest.startDate, leaveRequest.endDate)} day(s)</p>
        <p className="sm:col-span-2 text-slate-600">
          <span className="font-medium text-slate-700">Period:</span> {formatDate(leaveRequest.startDate)} - {formatDate(leaveRequest.endDate)}
        </p>
        <p className="sm:col-span-2 text-slate-600">
          <span className="font-medium text-slate-700">Reason:</span> {leaveRequest.reason}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-800">Leave Balance</h4>
          <div className="relative">
            <select
              value={balanceRange}
              onChange={(event) => setBalanceRange(event.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-[#edf4e6] px-2.5 py-1 pr-6 text-xs text-slate-700 outline-none"
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {leaveBalance.map((item) => (
            <div key={item.type} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-sm font-medium text-slate-800">{item.type}</p>
              <p className="mt-1 text-xs text-slate-600">
                Used: <span className="font-semibold text-slate-700">{item.used}</span> day(s)
              </p>
              <p className="text-xs text-slate-600">
                Available: <span className="font-semibold text-[#2f6f63]">{item.available}</span> / {item.quota} day(s)
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => updateLeaveStatus("Rejected")}
          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600"
        >
          <X size={14} />
          Reject
        </button>
        <button
          type="button"
          onClick={() => updateLeaveStatus("Approved")}
          className="inline-flex items-center gap-1 rounded-xl bg-[#53c4ae] px-4 py-2 text-sm font-medium text-white"
        >
          <Check size={14} />
          Approve
        </button>
      </div>
    </article>
  )
}

export default LeaveRequestDetailsPage
