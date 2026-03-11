import { Calendar, ChevronLeft, Mail, MapPin, PenLine, Phone } from "lucide-react"
import { useMemo, useState } from "react"

const getInitials = (value) => (value || "A")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0]?.toUpperCase() || "")
  .join("")

function EmployeeDetailsView({ employee, onBack, onEditProfile }) {
  const [performanceRange, setPerformanceRange] = useState("This Week")
  const isLegacyEmployee = Array.isArray(employee)
  const [legacyName, legacyEmployeeId, legacyDepartment, legacyDesignation, legacyType] = isLegacyEmployee ? employee : []
  const name = isLegacyEmployee ? legacyName : employee?.name
  const employeeId = isLegacyEmployee ? legacyEmployeeId : employee?.employeeId
  const department = isLegacyEmployee ? legacyDepartment : employee?.department
  const designation = isLegacyEmployee ? legacyDesignation : employee?.designation
  const type = isLegacyEmployee ? legacyType : employee?.type
  const joiningDate = isLegacyEmployee ? "Jan 03, 2020" : employee?.joiningDate || "-"
  const officeEmail = isLegacyEmployee ? `${name?.toLowerCase().replace(/\s+/g, ".")}@example.com` : employee?.officeEmail || employee?.email || "-"
  const mobile = isLegacyEmployee ? "-" : employee?.mobile || "-"
  const workModel = isLegacyEmployee ? "Hybrid" : employee?.type || "On-Site"
  const employmentStatus = isLegacyEmployee ? "Active" : employee?.status || "Active"

  const leaveStats = [
    { label: "All Leaves", used: 14, total: 20, color: "#0f766e" },
    { label: "Annual Leaves", used: 10, total: 15, color: "#22c3aa" },
    { label: "Casual Leaves", used: 8, total: 24, color: "#d5e3c2" },
    { label: "Sick Leaves", used: 3, total: 4, color: "#1f8e7b" },
  ]
  const [calendarCursor, setCalendarCursor] = useState(() => new Date(2035, 5, 1))
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
  const calendarCellClass = {
    "1": "bg-[#174f48] text-white font-semibold",
    "4": "bg-[#49c4af] text-white",
    "15": "bg-[#49c4af] text-white",
    "20": "bg-[#49c4af] text-white",
    "21": "bg-[#49c4af] text-white",
    "26": "bg-[#174f48] text-white font-semibold",
    "28": "bg-[#49c4af] text-white",
  }
  const totalHoursByRange = {
    "This Week": "34h 30m",
    "This Month": "142h 15m",
    "This Year": "1720h 40m",
  }
  const performanceGraphByRange = {
    "This Week": {
      topLabels: ["8:00", "7:30", "4:00", "8:00", "7:00", "0:00", "0:00"],
      bottomLabels: ["M", "T", "W", "T", "F", "S", "S"],
      heights: [96, 82, 60, 100, 72, 100, 100],
      activeIndex: 3,
    },
    "This Month": {
      topLabels: ["36h", "31h", "40h", "35h"],
      bottomLabels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      heights: [76, 68, 94, 80],
      activeIndex: 2,
    },
    "This Year": {
      topLabels: ["142h", "136h", "150h", "144h", "147h", "138h"],
      bottomLabels: ["Jan-Feb", "Mar-Apr", "May-Jun", "Jul-Aug", "Sep-Oct", "Nov-Dec"],
      heights: [72, 66, 92, 78, 84, 70],
      activeIndex: 2,
    },
  }
  const activeGraph = performanceGraphByRange[performanceRange]
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

  return (
    <div className="rounded-2xl bg-white">
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600"
        >
          <ChevronLeft size={15} />
          Employee Details
        </button>
        <p className="mt-1 text-xs text-slate-400">Dashboard / Employees / Employee Details</p>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[250px_1fr]">
        <aside className="self-start rounded-2xl border border-slate-200 bg-white p-4">
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
            <p className="text-lg font-semibold leading-tight text-slate-800">{name}</p>
            <p className="mt-1 text-[11px] text-slate-500">{designation} · {department}</p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{employeeId}</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-600">{employmentStatus}</span>
          </div>
          <div className="mt-4 space-y-2.5 rounded-xl bg-[#f8faf9] p-3 text-[13px]">
            <p className="flex items-center justify-between text-slate-600"><span>Employment Type</span><span className="font-semibold text-slate-800">{type || "-"}</span></p>
            <p className="flex items-center justify-between text-slate-600"><span>Work Model</span><span className="font-semibold text-slate-800">{workModel}</span></p>
            <p className="flex items-center justify-between text-slate-600"><span>Status</span><span className="font-semibold text-slate-800">{employmentStatus}</span></p>
            <p className="flex items-center justify-between text-slate-600"><span>Join Date</span><span className="font-semibold text-slate-800">{joiningDate || "-"}</span></p>
          </div>
          <div className="mt-3 space-y-2 rounded-xl border border-slate-200 p-3">
            <p className="truncate text-[11px] text-slate-500">Office Email</p>
            <p className="truncate text-[13px] font-medium text-slate-700">{officeEmail}</p>
            <p className="text-[11px] text-slate-500">Phone</p>
            <p className="text-[13px] font-medium text-slate-700">{mobile}</p>
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
              const percent = Math.min(100, Math.round((item.used / item.total) * 100))
              return (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-medium text-slate-600">{item.label}</p>
                  <div className="mt-2 flex items-center justify-center">
                    <div
                      className="relative h-16 w-16 rounded-full"
                      style={{ background: `conic-gradient(${item.color} ${percent}%, #edf2ef ${percent}% 100%)` }}
                    >
                      <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-white text-center">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.used}
                          <span className="text-xs text-slate-500">/{item.total}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">Performance Overview</h4>
              <div className="relative">
                <select
                  value={performanceRange}
                  onChange={(event) => setPerformanceRange(event.target.value)}
                  className="appearance-none rounded-lg bg-[#edf4e6] px-2.5 py-1 pr-6 text-xs text-slate-600 outline-none"
                >
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">▼</span>
              </div>
            </div>
            <p className="text-[30px] font-semibold leading-none text-slate-800">{totalHoursByRange[performanceRange]}</p>
            <p className="mt-1 text-xs text-slate-500">Total logged hours for selected range</p>
            <div className="mt-4 flex-1 rounded-xl bg-gradient-to-t from-[#e8f5ef] to-white p-3">
              <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2">
                <div className={`grid gap-2 text-center text-[11px] text-slate-500 ${activeGraph.topLabels.length === 7 ? "grid-cols-7" : activeGraph.topLabels.length === 6 ? "grid-cols-6" : "grid-cols-4"}`}>
                  {activeGraph.topLabels.map((slot, index) => (
                    <span key={`perf-slot-${index}`} className={index === activeGraph.activeIndex ? "font-semibold text-[#1f6257]" : ""}>
                      {slot}
                    </span>
                  ))}
                </div>
                <div className={`grid h-full items-end gap-2 ${activeGraph.heights.length === 7 ? "grid-cols-7" : activeGraph.heights.length === 6 ? "grid-cols-6" : "grid-cols-4"}`}>
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
                <div className={`grid gap-2 text-center text-xs text-slate-500 ${activeGraph.bottomLabels.length === 7 ? "grid-cols-7" : activeGraph.bottomLabels.length === 6 ? "grid-cols-6" : "grid-cols-4"}`}>
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
          <aside className="h-[352px] self-start rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">Personal Info</h4>
              <span className="text-slate-400">...</span>
            </div>
            <div className="space-y-3">
              {visiblePersonalInfoRows.length === 0 ? (
                <p className="text-sm text-slate-500">No personal info available.</p>
              ) : (
                visiblePersonalInfoRows.map((item) => {
                  const icon = item.label === "Date of Birth"
                    ? <Calendar size={14} />
                    : item.label === "Email Address"
                      ? <Mail size={14} />
                      : item.label === "Phone"
                        ? <Phone size={14} />
                        : <MapPin size={14} />
                  return (
                    <p key={item.label} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 text-slate-400">{icon}</span>
                      <span>
                        <span className="block text-xs text-slate-500">{item.label}</span>
                        <span className="font-medium break-all">{item.value || "-"}</span>
                      </span>
                    </p>
                  )
                })
              )}
            </div>
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">Documents</h4>
              <span className="text-slate-400">...</span>
            </div>
            <div className="space-y-2">
              {documentItems.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded.</p>
              ) : (
                documentItems.map((item) => (
                  <p key={item.label} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium">{item.label}:</span> {item.value}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        <section>
          <div className="rounded-2xl border border-slate-200 bg-[#f7f8f8] p-3">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-semibold leading-none text-slate-800 hover:bg-slate-100"
              >
                {calendarMonthLabel}
                <span className="text-xs text-slate-400">▼</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#dceac7] text-lg font-medium leading-none text-slate-600"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#dceac7] text-lg font-medium leading-none text-slate-600"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
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
                          ? (calendarCellClass[String(cell.day)] || "bg-[#dceac7] text-slate-700")
                          : "text-slate-400"
                      }`}
                    >
                      {cell.day}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-200 pt-3">
              {[
                { label: "Present", value: "13", color: "#dceac7" },
                { label: "Late", value: "5", color: "#49c4af" },
                { label: "On Leave", value: "2", color: "#174f48" },
                { label: "Absent", value: "1", color: "#e5e7eb" },
              ].map((item) => (
                <div key={item.label} className="rounded-md bg-white px-1.5 py-1">
                  <p className="flex items-center gap-1 text-[10px] leading-none text-slate-500">
                    <span className="inline-block h-2 w-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="whitespace-normal break-words">{item.label}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-none text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="h-full rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold text-slate-800">Payroll Summary</p>
              <span className="text-slate-400">...</span>
            </div>

            <div className="mb-2 rounded-lg bg-[#f4f5f5] px-3 py-2">
              <p className="text-[11px] font-medium text-slate-700">Payroll Details</p>
            </div>

            <div className="space-y-2 text-xs">
              {payrollDetails.length === 0 ? (
                <p className="text-sm text-slate-500">No payroll info available.</p>
              ) : (
                payrollDetails.map((item) => (
                  <p key={item.label} className="flex items-center justify-between border-b border-slate-200 pb-2 text-slate-700">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
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
