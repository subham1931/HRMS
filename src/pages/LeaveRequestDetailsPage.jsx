import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, ChevronDown, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { listLeaveRequests, updateLeaveRequestStatus } from "../services/leaves"
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
    appliedAt: item.appliedAt || (item.createdAt ? String(item.createdAt).slice(0, 10) : toYMD(new Date())),
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

function LeaveRequestDetailsPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const leaveId = decodeURIComponent(pathname.split("/").pop() || "")
  const [balanceRange, setBalanceRange] = useState("month")
  const [leaveRequests, setLeaveRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [brokenAvatarById, setBrokenAvatarById] = useState({})

  useEffect(() => {
    let mounted = true
    async function loadRequests() {
      try {
        setLoadError("")
        setIsLoading(true)
        const rows = await listLeaveRequests()
        if (!mounted) return
        setLeaveRequests(normalizeRequests(rows))
      } catch (error) {
        if (!mounted) return
        setLeaveRequests([])
        setLoadError(error?.message || "Unable to load leave request details.")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadRequests()
    return () => {
      mounted = false
    }
  }, [])

  const leaveRequest = useMemo(() => {
    return leaveRequests.find((item) => item.id === leaveId) || null
  }, [leaveId, leaveRequests])

  const handleUpdateLeaveStatus = async (nextStatus) => {
    if (!leaveRequest) return
    try {
      setIsUpdatingStatus(true)
      await updateLeaveRequestStatus(leaveRequest.id, nextStatus)
      setLeaveRequests((prev) =>
        prev.map((item) =>
          item.id === leaveRequest.id
            ? { ...item, status: nextStatus, reviewedAt: new Date().toISOString() }
            : item,
        ),
      )
    } catch (error) {
      setLoadError(error?.message || "Unable to update leave status.")
      return
    } finally {
      setIsUpdatingStatus(false)
    }
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

  if (isLoading) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Loading leave request details...</p>
      </article>
    )
  }

  if (!leaveRequest) {
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
        <p className="mt-4 text-sm text-slate-500">Leave request not found.</p>
      </article>
    )
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      {loadError ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {loadError}
        </div>
      ) : null}
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
        {leaveRequest.avatar && !brokenAvatarById[leaveRequest.id] ? (
          <img
            src={leaveRequest.avatar}
            alt={leaveRequest.employeeName}
            className="h-20 w-20 rounded-xl object-cover"
            onError={() => {
              setBrokenAvatarById((prev) => ({ ...prev, [leaveRequest.id]: true }))
            }}
          />
        ) : (
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-xl bg-emerald-100 text-xl font-semibold text-emerald-700">
            {getInitials(leaveRequest.employeeName)}
          </span>
        )}
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
          disabled={leaveRequest.status !== "Pending" || isUpdatingStatus}
          onClick={() => handleUpdateLeaveStatus("Rejected")}
          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={14} />
          Reject
        </button>
        <button
          type="button"
          disabled={leaveRequest.status !== "Pending" || isUpdatingStatus}
          onClick={() => handleUpdateLeaveStatus("Approved")}
          className="inline-flex items-center gap-1 rounded-xl bg-[#53c4ae] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check size={14} />
          {isUpdatingStatus ? "Updating..." : "Approve"}
        </button>
      </div>
    </article>
  )
}

export default LeaveRequestDetailsPage
