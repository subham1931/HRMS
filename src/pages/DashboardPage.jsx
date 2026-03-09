import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Star } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const topStats = [
  { title: "Total Employees", value: "128", sub: "Employees", footer: "You're part of a growing team!" },
  { title: "Attendance", value: "92%", sub: "Present", extra: "3 Days Off, 1 Late Arrival", footer: "Your attendance this month is looking solid" },
  { title: "Leave Requests", value: "1", sub: "Approved", extra: "1 Pending Review", footer: "You've submitted 2 leave requests this month" },
]

const scheduleItems = [
  { label: "Talent Acquisition", title: "Interview - Product Designer Candidate", room: "Meeting Room C", time: "09:00 AM" },
  { label: "Employee Development", title: "Mid-Year Performance Review - Design Dept", room: "Notice Review Sheet", time: "01:00 PM" },
  { label: "Workplace Engagement", title: "Quarterly Policy Review Meeting", room: "Conference Room 1A", time: "03:00 PM" },
]

const employeeRows = [
  ["Aarav Sharma", "Marketing Executive", "19 Jun 2035", "08:55 AM", "05:05 PM", "On-Time", "https://i.pravatar.cc/80?img=48"],
  ["Ishaan Verma", "UI Designer", "19 Jun 2035", "09:14 AM", "05:20 PM", "Late", "https://i.pravatar.cc/80?img=54"],
  ["Ananya Nair", "Lab Analyst", "19 Jun 2035", "-", "-", "On Leave", "https://i.pravatar.cc/80?img=9"],
  ["Rohan Patel", "Site Supervisor", "19 Jun 2035", "-", "-", "Absent", "https://i.pravatar.cc/80?img=35"],
  ["Priya Kulkarni", "HR Officer", "19 Jun 2035", "08:59 AM", "05:10 PM", "On-Time", "https://i.pravatar.cc/80?img=47"],
]

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

const attendanceRangeData = {
  weekly: {
    label: "This Week",
    value: "92%",
    growth: "+1.54%",
    rowLabels: ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"],
    columnLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    rows: [
      ["bg-[#0f5c4d]", "bg-[#0f5c4d]", "bg-[#0f5c4d]", "bg-[#0f5c4d]", "bg-[#0f5c4d]"],
      ["bg-[#35bda6]", "bg-[#40c3ad]", "bg-[#0f5c4d]", "bg-[#0f5c4d]", "bg-[#40c3ad]"],
      ["bg-[#d2e1c3]", "bg-[#3cbfa8]", "bg-[#0f5c4d]", "bg-[#39bea7]", "bg-[#35bda6]"],
      ["bg-[#d2e1c3]", "bg-[#d2e1c3]", "bg-[#3bbfa8]", "bg-[#d2e1c3]", "bg-[#d2e1c3]"],
      ["bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]"],
      ["bg-[#f1f3ef]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#f1f3ef]"],
    ],
  },
  monthly: {
    label: "This Month",
    value: "89%",
    growth: "+1.20%",
    rowLabels: [],
    columnLabels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    rows: [
      ["bg-[#0f5c4d]", "bg-[#0f5c4d]", "bg-[#0f5c4d]", "bg-[#35bda6]", "bg-[#0f5c4d]", "bg-[#3cbfa8]"],
      ["bg-[#3cbfa8]", "bg-[#40c3ad]", "bg-[#35bda6]", "bg-[#0f5c4d]", "bg-[#35bda6]", "bg-[#39bea7]"],
      ["bg-[#d2e1c3]", "bg-[#3cbfa8]", "bg-[#35bda6]", "bg-[#39bea7]", "bg-[#d2e1c3]", "bg-[#d2e1c3]"],
      ["bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#3bbfa8]", "bg-[#d2e1c3]", "bg-[#d2e1c3]", "bg-[#f1f3ef]"],
      ["bg-[#f1f3ef]", "bg-[#f1f3ef]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#d2e1c3]"],
    ],
  },
  yearly: {
    label: "This Year",
    value: "87%",
    growth: "+0.86%",
    rowLabels: [],
    columnLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    rows: [
      ["bg-[#0f5c4d]", "bg-[#35bda6]", "bg-[#0f5c4d]", "bg-[#39bea7]", "bg-[#40c3ad]", "bg-[#0f5c4d]", "bg-[#35bda6]", "bg-[#3bbfa8]", "bg-[#d2e1c3]", "bg-[#39bea7]", "bg-[#0f5c4d]", "bg-[#35bda6]"],
      ["bg-[#3cbfa8]", "bg-[#40c3ad]", "bg-[#35bda6]", "bg-[#0f5c4d]", "bg-[#35bda6]", "bg-[#39bea7]", "bg-[#3cbfa8]", "bg-[#d2e1c3]", "bg-[#3bbfa8]", "bg-[#35bda6]", "bg-[#0f5c4d]", "bg-[#39bea7]"],
      ["bg-[#d2e1c3]", "bg-[#3bbfa8]", "bg-[#39bea7]", "bg-[#35bda6]", "bg-[#d2e1c3]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#f1f3ef]"],
      ["bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#f1f3ef]", "bg-[#d2e1c3]", "bg-[#f1f3ef]", "bg-[#f1f3ef]"],
    ],
  },
}

function DashboardPage() {
  const navigate = useNavigate()
  const [attendanceRange, setAttendanceRange] = useState("weekly")
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [showYearModal, setShowYearModal] = useState(false)
  const activeAttendanceRange = attendanceRangeData[attendanceRange]
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
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-sm text-slate-500">Hello Davis!</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Good Morning</h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topStats.map((card) => (
          <article key={card.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>{card.title}</span>
                <MoreHorizontal size={14} />
              </div>
              <p className="text-[38px] font-semibold leading-none text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{card.sub}</span>
                {card.extra ? ` - ${card.extra}` : ""}
              </p>
            </div>
            <div className="bg-[#e8f1df] px-4 py-2 text-xs text-emerald-700">{card.footer}</div>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowYearModal(true)}
                      className="inline-flex items-center gap-1 bg-transparent py-1 pl-0 pr-1 text-[20px] font-semibold text-slate-800"
                      aria-label="Open year selector"
                    >
                      {calendarLabel}
                      <ChevronDown size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f1df]"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f1df]"
                    aria-label="Next month"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-7 grid-rows-[auto_repeat(6,minmax(0,1fr))] gap-y-1 text-center text-xs text-slate-500">
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
                        ? "text-slate-300"
                          : ""
                    }`}
                  >
                    {cell.value}
                  </span>
                ))}
              </div>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-slate-800">Attendance Report</h3>
                <div className="relative">
                  <select
                    value={attendanceRange}
                    onChange={(event) => setAttendanceRange(event.target.value)}
                    className="appearance-none rounded-xl bg-[#dce8c8] py-1 pl-2.5 pr-6 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                    <option value="yearly">This Year</option>
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[42px] font-semibold leading-none text-slate-800">{activeAttendanceRange.value}</p>
                <span className="inline-flex items-center rounded-full bg-[#dce8c8] px-2 py-0.5 text-xs font-medium text-emerald-700">
                  ↗ {activeAttendanceRange.growth}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-slate-500">Attendance Rate</p>

              <div className="mt-4">
                <div className={`grid items-start gap-x-2 ${activeAttendanceRange.rowLabels.length > 0 ? "grid-cols-[66px_1fr]" : "grid-cols-1"}`}>
                  {activeAttendanceRange.rowLabels.length > 0 ? (
                    <div className="space-y-1">
                      {activeAttendanceRange.rowLabels.map((label) => (
                        <p key={label} className="h-[22px] text-[10px] text-slate-500">{label}</p>
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
                        {row.map((cell, c) => (
                          <span key={`cell-${r}-${c}`} className={`h-[22px] rounded-md ${cell}`} />
                        ))}
                      </div>
                    ))}
                    <div
                      className="grid gap-1.5 pt-1.5 text-center text-[12px] text-slate-500"
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

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800">Team Performance</h3>
                <button type="button" className="inline-flex items-center gap-1 rounded-xl bg-[#dce8c8] px-2.5 py-1 text-xs font-medium text-slate-700">
                  Last 6 Months <ChevronDown size={12} />
                </button>
              </div>
              <p className="text-[38px] font-semibold leading-none text-slate-800">89.52%</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#dce8c8] px-2 py-0.5 text-xs font-medium text-emerald-700">↗ +3.84%</span>
                <span className="text-[13px] text-slate-500">Increased vs last week</span>
              </div>

              <svg viewBox="0 0 360 185" className="mt-3 h-[170px] w-full">
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
                  d="M 34 95 C 58 79, 76 66, 97 73 C 121 80, 145 76, 160 58 C 176 40, 198 47, 220 46 C 239 45, 260 30, 276 29 C 296 28, 308 50, 323 61 C 336 70, 345 58, 350 50"
                  fill="none"
                  stroke="#35bda6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 34 95 C 58 79, 76 66, 97 73 C 121 80, 145 76, 160 58 C 176 40, 198 47, 220 46 C 239 45, 260 30, 276 29 C 296 28, 308 50, 323 61 C 336 70, 345 58, 350 50 L 350 152 L 34 152 Z"
                  fill="url(#teamPerfFill)"
                />

                <line x1="276" y1="29" x2="276" y2="152" stroke="#9ca4aa" strokeDasharray="4 4" />
                <circle cx="276" cy="29" r="5.5" fill="#35bda6" />

                <g transform="translate(250,8)">
                  <rect width="62" height="42" rx="9" fill="white" stroke="#e4e8eb" />
                  <text x="10" y="16" fontSize="10" fill="#76828a">May 2035</text>
                  <text x="10" y="32" fontSize="18" fontWeight="600" fill="#0f5c4d">95.2%</text>
                </g>

                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, idx) => (
                  <text key={month} x={66 + idx * 52} y="178" fontSize="11" fill="#7f8a8f">
                    {month}
                  </text>
                ))}
              </svg>
            </article>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800">Schedules</h3>
                <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-[#e8f1df] px-2 py-1 text-xs text-slate-700">21 Jun <ChevronDown size={12} /></button>
              </div>
              <div className="space-y-2.5">
                {scheduleItems.map((item) => (
                  <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <p className="text-[11px] text-emerald-500">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{item.room} - {item.time}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800">Employee Satisfaction</h3>
                <MoreHorizontal size={15} className="text-slate-400" />
              </div>
              <div className="grid grid-cols-[1fr_160px] items-center gap-2">
                <div>
                  <p className="text-[36px] font-semibold leading-none text-slate-800">73%</p>
                  <p className="mt-1 text-[13px] text-slate-500">Employee Satisfied</p>
                  <div className="mt-3 flex items-center gap-2">
                    {renderRatingStars(4.2)}
                    <span className="text-[21px] font-semibold text-slate-700">4.2/5</span>
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

              <div className="mt-3 rounded-xl bg-[#dce8c8] px-3 py-2 text-[13px] text-slate-600">
                That's an <span className="font-semibold text-slate-800">increase of 6%</span> from last month
              </div>

              <div className="mt-4 space-y-3">
                {satisfactionRows.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800">{item.label}</p>
                      <p className="text-[13px] text-slate-500">{item.percent}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      {renderRatingStars(item.score)}
                      <span className="text-[17px] font-semibold text-slate-700">{item.score.toFixed(1)}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800">Employment Status</h3>
                <MoreHorizontal size={15} className="text-slate-400" />
              </div>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold text-slate-900">128</p>
                  <p className="text-xs text-slate-500">Employees</p>
                </div>
                <p className="text-xs text-slate-500">100%</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="flex h-full w-full">
                  <span className="h-full w-[68%] bg-emerald-800" />
                  <span className="h-full w-[15%] bg-[#39c9b3]" />
                  <span className="h-full w-[10%] bg-emerald-300" />
                  <span className="h-full w-[7%] bg-slate-300" />
                </div>
              </div>
              <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <p className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-800" />
                    Full-Time
                  </p>
                  <p className="mt-1 text-xs text-slate-500">68% - 87 Employees</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <p className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#39c9b3]" />
                    Part-Time
                  </p>
                  <p className="mt-1 text-xs text-slate-500">15% - 19 Employees</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <p className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    Freelance
                  </p>
                  <p className="mt-1 text-xs text-slate-500">10% - 13 Employees</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                  <p className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    Internship
                  </p>
                  <p className="mt-1 text-xs text-slate-500">7% - 9 Employees</p>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[22px] font-semibold text-slate-900">Employee Attendance</h3>
              <button
                type="button"
                onClick={() => navigate("/attendance")}
                className="inline-flex items-center gap-1 rounded-lg bg-[#e8f1df] px-3 py-1.5 text-xs text-slate-700"
              >
                View All
              </button>
            </div>
            <div className="mb-3 grid grid-cols-4 gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <p><span className="block text-3xl font-semibold text-slate-900">82</span>On-Time</p>
              <p><span className="block text-3xl font-semibold text-slate-900">11</span>Late</p>
              <p><span className="block text-3xl font-semibold text-slate-900">6</span>On Leave</p>
              <p><span className="block text-3xl font-semibold text-slate-900">3</span>Absent</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-400">
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
                  {employeeRows.map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5">
                        <span className="flex items-center gap-2.5">
                          <img src={row[6]} alt={row[0]} className="h-8 w-8 rounded-full object-cover" />
                          <span className="font-medium text-slate-800">{row[0]}</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-700">{row[1]}</td>
                      <td className="py-2.5 text-slate-700">{row[2]}</td>
                      <td className="py-2.5 text-slate-700">{row[3]}</td>
                      <td className="py-2.5 text-slate-700">{row[4]}</td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            row[5] === "On-Time"
                              ? "bg-emerald-100 text-emerald-700"
                              : row[5] === "Late"
                                ? "bg-amber-100 text-amber-700"
                                : row[5] === "On Leave"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {row[5]}
                        </span>
                      </td>
                    </tr>
                  ))}
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
